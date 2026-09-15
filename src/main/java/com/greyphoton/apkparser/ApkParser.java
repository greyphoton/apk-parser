package com.greyphoton.apkparser;

import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PermissionInfo;
import android.content.pm.ProviderInfo;
import android.content.pm.ServiceInfo;
import android.content.res.AssetManager;
import com.greyphoton.apkparser.exception.ApkParseException;
import com.greyphoton.apkparser.exception.ApkReadException;
import com.greyphoton.apkparser.model.ApkArchiveInfo;
import com.greyphoton.apkparser.model.ApkComponent;
import com.greyphoton.apkparser.model.ApkPermission;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Main entry point and facade for parsing Android APK archives.
 * Uses Robolectric's headless runtime to provide authentic Android PackageManager capabilities
 * on standard Java without an emulator, device, or test runner.
 */
public class ApkParser implements AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(ApkParser.class);

    private final AndroidEnvironmentConfiguration environment;
    private final boolean ownsEnvironment;

    public ApkParser() {
        this(new AndroidEnvironmentConfiguration(), true);
    }

    public ApkParser(int apiLevel) {
        this(new AndroidEnvironmentConfiguration(apiLevel, "xhdpi"), true);
    }

    public ApkParser(AndroidEnvironmentConfiguration environment) {
        this(environment, false);
    }

    private ApkParser(AndroidEnvironmentConfiguration environment, boolean ownsEnvironment) {
        this.environment = environment;
        this.ownsEnvironment = ownsEnvironment;
    }

    public static ApkParser create() {
        return new ApkParser();
    }

    public static ApkParser create(int apiLevel) {
        return new ApkParser(apiLevel);
    }

    /**
     * Parses an APK file and extracts comprehensive package information,
     * components, permissions, flags, and signature schemes.
     *
     * @param apkFile The APK file to parse
     * @return Fully populated {@link ApkArchiveInfo}
     */
    public ApkArchiveInfo parse(File apkFile) {
        int defaultFlags = PackageManager.GET_ACTIVITIES
                | PackageManager.GET_SERVICES
                | PackageManager.GET_RECEIVERS
                | PackageManager.GET_PROVIDERS
                | PackageManager.GET_PERMISSIONS
                | PackageManager.GET_META_DATA
                | PackageManager.GET_SIGNING_CERTIFICATES;

        return parse(apkFile, defaultFlags);
    }

    /**
     * Parses an APK file with custom PackageManager flags.
     *
     * @param apkFile The APK file
     * @param flags PackageManager query flags
     * @return Fully populated {@link ApkArchiveInfo}
     */
    public ApkArchiveInfo parse(File apkFile, int flags) {
        if (apkFile == null || !apkFile.exists()) {
            throw new ApkReadException("APK file does not exist: " + (apkFile != null ? apkFile.getAbsolutePath() : "null"));
        }

        log.info("Parsing APK archive: {}", apkFile.getName());
        ApkArchiveInfo info = new ApkArchiveInfo();
        info.setFileSizeBytes(apkFile.length());

        // 1. Inspect DEX and APK internal stats via zip stream
        inspectArchiveStructure(apkFile, info);

        // 2. Query Android PackageManager inside headless Robolectric environment
        PackageInfo packageInfo = getPackageArchiveInfo(apkFile, flags);
        if (packageInfo != null) {
            info.setRawPackageInfo(packageInfo);
            info.setPackageName(packageInfo.packageName);
            info.setVersionName(packageInfo.versionName);
            info.setVersionCode(packageInfo.versionCode);
            try {
                Method getLongVersionCode = PackageInfo.class.getMethod("getLongVersionCode");
                info.setLongVersionCode((Long) getLongVersionCode.invoke(packageInfo));
            } catch (Exception ignored) {
                info.setLongVersionCode(packageInfo.versionCode);
            }

            // Application info & flags
            ApplicationInfo appInfo = packageInfo.applicationInfo;
            if (appInfo != null) {
                info.setApplicationClassName(appInfo.className);
                info.setMinSdkVersion(appInfo.minSdkVersion);
                info.setTargetSdkVersion(appInfo.targetSdkVersion);
                info.setCompileSdkVersion(appInfo.compileSdkVersion);

                info.setDebuggable((appInfo.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
                info.setAllowBackup((appInfo.flags & ApplicationInfo.FLAG_ALLOW_BACKUP) != 0);
                info.setUsesCleartextTraffic((appInfo.flags & ApplicationInfo.FLAG_USES_CLEARTEXT_TRAFFIC) != 0);
                info.setHardwareAccelerated((appInfo.flags & ApplicationInfo.FLAG_HARDWARE_ACCELERATED) != 0);
                info.setLargeHeap((appInfo.flags & ApplicationInfo.FLAG_LARGE_HEAP) != 0);

                try {
                    CharSequence label = environment.getPackageManager().getApplicationLabel(appInfo);
                    if (label != null) {
                        info.setApplicationLabel(label.toString());
                    }
                } catch (Exception e) {
                    log.debug("Could not resolve application label: {}", e.getMessage());
                }
            }

            // Requested Permissions
            if (packageInfo.requestedPermissions != null) {
                for (String permName : packageInfo.requestedPermissions) {
                    boolean dangerous = isDangerousPermission(permName);
                    info.getRequestedPermissions().add(new ApkPermission(permName, dangerous ? "dangerous" : "normal", dangerous));
                }
            }

            // Declared Permissions
            if (packageInfo.permissions != null) {
                for (PermissionInfo pInfo : packageInfo.permissions) {
                    ApkPermission p = new ApkPermission();
                    p.setName(pInfo.name);
                    p.setProtectionLevel(protectionLevelToString(pInfo.protectionLevel));
                    p.setDangerous((pInfo.protectionLevel & PermissionInfo.PROTECTION_DANGEROUS) != 0);
                    info.getDeclaredPermissions().add(p);
                }
            }

            // Activities
            if (packageInfo.activities != null) {
                for (ActivityInfo aInfo : packageInfo.activities) {
                    ApkComponent comp = new ApkComponent(aInfo.name, ApkComponent.ComponentType.ACTIVITY, aInfo.exported);
                    comp.setPermission(aInfo.permission);
                    comp.setEnabled(aInfo.enabled);
                    info.getActivities().add(comp);
                }
            }

            // Services
            if (packageInfo.services != null) {
                for (ServiceInfo sInfo : packageInfo.services) {
                    ApkComponent comp = new ApkComponent(sInfo.name, ApkComponent.ComponentType.SERVICE, sInfo.exported);
                    comp.setPermission(sInfo.permission);
                    comp.setEnabled(sInfo.enabled);
                    info.getServices().add(comp);
                }
            }

            // Receivers
            if (packageInfo.receivers != null) {
                for (ActivityInfo rInfo : packageInfo.receivers) {
                    ApkComponent comp = new ApkComponent(rInfo.name, ApkComponent.ComponentType.RECEIVER, rInfo.exported);
                    comp.setPermission(rInfo.permission);
                    comp.setEnabled(rInfo.enabled);
                    info.getReceivers().add(comp);
                }
            }

            // Providers
            if (packageInfo.providers != null) {
                for (ProviderInfo prInfo : packageInfo.providers) {
                    ApkComponent comp = new ApkComponent(prInfo.name, ApkComponent.ComponentType.PROVIDER, prInfo.exported);
                    comp.setAuthority(prInfo.authority);
                    comp.setPermission(prInfo.readPermission != null ? prInfo.readPermission : prInfo.writePermission);
                    comp.setEnabled(prInfo.enabled);
                    info.getProviders().add(comp);
                }
            }
        }

        // 3. Inspect Signatures & Certificates
        info.setSignatureInfo(ApkSignatureReader.readSignatureInfo(apkFile));

        return info;
    }

    /**
     * Directly calls Android's {@link PackageManager#getPackageArchiveInfo(String, int)}
     * inside the headless Android environment.
     */
    public PackageInfo getPackageArchiveInfo(File apkFile, int flags) {
        if (apkFile == null || !apkFile.exists()) {
            throw new ApkReadException("APK file not found: " + apkFile);
        }
        try {
            PackageManager pm = environment.getPackageManager();
            return pm.getPackageArchiveInfo(apkFile.getAbsolutePath(), flags);
        } catch (Exception e) {
            log.error("PackageManager.getPackageArchiveInfo failed for {}: {}", apkFile.getName(), e.getMessage(), e);
            throw new ApkParseException("Failed to parse package archive info: " + e.getMessage(), e);
        }
    }

    /**
     * Extracts and decodes the formatted AndroidManifest.xml from the APK.
     */
    public String extractManifestXml(File apkFile) {
        return ApkManifestReader.getManifestXml(apkFile);
    }

    /**
     * Extracts the launcher icon from the APK as raw byte array (PNG/WEBP).
     */
    public byte[] extractAppIcon(File apkFile) {
        try (ZipFile zipFile = new ZipFile(apkFile)) {
            // Search standard icon paths
            String[] iconPatterns = {
                    "res/mipmap-xxhdpi/ic_launcher.png",
                    "res/mipmap-xhdpi/ic_launcher.png",
                    "res/mipmap-hdpi/ic_launcher.png",
                    "res/drawable-xxhdpi/ic_launcher.png",
                    "res/drawable-xhdpi/ic_launcher.png",
                    "res/drawable/ic_launcher.png"
            };

            for (String pattern : iconPatterns) {
                ZipEntry entry = zipFile.getEntry(pattern);
                if (entry != null) {
                    return readEntryBytes(zipFile, entry);
                }
            }

            // Fallback: any file ending with ic_launcher.png
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                if (entry.getName().endsWith("ic_launcher.png")) {
                    return readEntryBytes(zipFile, entry);
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract icon from APK: {}", e.getMessage());
        }
        return null;
    }

    private byte[] readEntryBytes(ZipFile zipFile, ZipEntry entry) throws Exception {
        try (InputStream is = zipFile.getInputStream(entry);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int r;
            while ((r = is.read(buf)) != -1) {
                baos.write(buf, 0, r);
            }
            return baos.toByteArray();
        }
    }

    private void inspectArchiveStructure(File apkFile, ApkArchiveInfo info) {
        int dexCount = 0;
        int estimatedMethods = 0;

        try (ZipFile zipFile = new ZipFile(apkFile)) {
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                String name = entry.getName();
                if (name.startsWith("classes") && name.endsWith(".dex")) {
                    dexCount++;
                    try (InputStream is = zipFile.getInputStream(entry)) {
                        byte[] header = new byte[112];
                        int read = is.read(header);
                        if (read >= 96) {
                            ByteBuffer buf = ByteBuffer.wrap(header).order(ByteOrder.LITTLE_ENDIAN);
                            buf.position(88); // method_ids_size in DEX header
                            int methodCount = buf.getInt();
                            if (methodCount > 0) {
                                estimatedMethods += methodCount;
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
            info.setDexFilesCount(dexCount);
            info.setTotalMethodsCount(estimatedMethods);
        } catch (Exception e) {
            log.warn("Failed inspecting archive DEX structure: {}", e.getMessage());
        }
    }

    private static boolean isDangerousPermission(String perm) {
        if (perm == null) return false;
        return perm.contains("CAMERA")
                || perm.contains("LOCATION")
                || perm.contains("RECORD_AUDIO")
                || perm.contains("READ_CONTACTS")
                || perm.contains("WRITE_CONTACTS")
                || perm.contains("READ_EXTERNAL_STORAGE")
                || perm.contains("WRITE_EXTERNAL_STORAGE")
                || perm.contains("READ_MEDIA")
                || perm.contains("READ_PHONE_STATE")
                || perm.contains("SEND_SMS")
                || perm.contains("READ_SMS")
                || perm.contains("RECEIVE_SMS");
    }

    private static String protectionLevelToString(int level) {
        int base = level & PermissionInfo.PROTECTION_MASK_BASE;
        switch (base) {
            case PermissionInfo.PROTECTION_DANGEROUS:
                return "dangerous";
            case PermissionInfo.PROTECTION_SIGNATURE:
                return "signature";
            case PermissionInfo.PROTECTION_SIGNATURE_OR_SYSTEM:
                return "signatureOrSystem";
            case PermissionInfo.PROTECTION_NORMAL:
            default:
                return "normal";
        }
    }

    public AndroidEnvironmentConfiguration getEnvironment() {
        return environment;
    }

    @Override
    public void close() {
        if (ownsEnvironment && environment != null) {
            environment.close();
        }
    }
}
