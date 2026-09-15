package com.greyphoton.apkparser.model;

import android.content.pm.PackageInfo;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates detailed parsed metadata from an APK archive, equivalent to Android's PackageInfo
 * along with application capabilities and signatures.
 */
public class ApkArchiveInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    private String packageName;
    private String versionName;
    private int versionCode;
    private long longVersionCode;
    private String applicationLabel;
    private String applicationClassName;

    private int minSdkVersion;
    private int targetSdkVersion;
    private int compileSdkVersion;

    // Flags
    private boolean debuggable;
    private boolean allowBackup;
    private boolean usesCleartextTraffic;
    private boolean hardwareAccelerated;
    private boolean largeHeap;

    // Components
    private List<ApkComponent> activities = new ArrayList<>();
    private List<ApkComponent> services = new ArrayList<>();
    private List<ApkComponent> receivers = new ArrayList<>();
    private List<ApkComponent> providers = new ArrayList<>();

    // Permissions
    private List<ApkPermission> requestedPermissions = new ArrayList<>();
    private List<ApkPermission> declaredPermissions = new ArrayList<>();

    // Signatures & Archive stats
    private ApkSignatureInfo signatureInfo;
    private long fileSizeBytes;
    private int dexFilesCount;
    private int totalMethodsCount;

    // Transient reference to native Android PackageInfo if available
    private transient PackageInfo rawPackageInfo;

    public ApkArchiveInfo() {
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getVersionName() {
        return versionName;
    }

    public void setVersionName(String versionName) {
        this.versionName = versionName;
    }

    public int getVersionCode() {
        return versionCode;
    }

    public void setVersionCode(int versionCode) {
        this.versionCode = versionCode;
    }

    public long getLongVersionCode() {
        return longVersionCode;
    }

    public void setLongVersionCode(long longVersionCode) {
        this.longVersionCode = longVersionCode;
    }

    public String getApplicationLabel() {
        return applicationLabel;
    }

    public void setApplicationLabel(String applicationLabel) {
        this.applicationLabel = applicationLabel;
    }

    public String getApplicationClassName() {
        return applicationClassName;
    }

    public void setApplicationClassName(String applicationClassName) {
        this.applicationClassName = applicationClassName;
    }

    public int getMinSdkVersion() {
        return minSdkVersion;
    }

    public void setMinSdkVersion(int minSdkVersion) {
        this.minSdkVersion = minSdkVersion;
    }

    public int getTargetSdkVersion() {
        return targetSdkVersion;
    }

    public void setTargetSdkVersion(int targetSdkVersion) {
        this.targetSdkVersion = targetSdkVersion;
    }

    public int getCompileSdkVersion() {
        return compileSdkVersion;
    }

    public void setCompileSdkVersion(int compileSdkVersion) {
        this.compileSdkVersion = compileSdkVersion;
    }

    public boolean isDebuggable() {
        return debuggable;
    }

    public void setDebuggable(boolean debuggable) {
        this.debuggable = debuggable;
    }

    public boolean isAllowBackup() {
        return allowBackup;
    }

    public void setAllowBackup(boolean allowBackup) {
        this.allowBackup = allowBackup;
    }

    public boolean isUsesCleartextTraffic() {
        return usesCleartextTraffic;
    }

    public void setUsesCleartextTraffic(boolean usesCleartextTraffic) {
        this.usesCleartextTraffic = usesCleartextTraffic;
    }

    public boolean isHardwareAccelerated() {
        return hardwareAccelerated;
    }

    public void setHardwareAccelerated(boolean hardwareAccelerated) {
        this.hardwareAccelerated = hardwareAccelerated;
    }

    public boolean isLargeHeap() {
        return largeHeap;
    }

    public void setLargeHeap(boolean largeHeap) {
        this.largeHeap = largeHeap;
    }

    public List<ApkComponent> getActivities() {
        return activities;
    }

    public void setActivities(List<ApkComponent> activities) {
        this.activities = activities != null ? activities : new ArrayList<>();
    }

    public List<ApkComponent> getServices() {
        return services;
    }

    public void setServices(List<ApkComponent> services) {
        this.services = services != null ? services : new ArrayList<>();
    }

    public List<ApkComponent> getReceivers() {
        return receivers;
    }

    public void setReceivers(List<ApkComponent> receivers) {
        this.receivers = receivers != null ? receivers : new ArrayList<>();
    }

    public List<ApkComponent> getProviders() {
        return providers;
    }

    public void setProviders(List<ApkComponent> providers) {
        this.providers = providers != null ? providers : new ArrayList<>();
    }

    public List<ApkPermission> getRequestedPermissions() {
        return requestedPermissions;
    }

    public void setRequestedPermissions(List<ApkPermission> requestedPermissions) {
        this.requestedPermissions = requestedPermissions != null ? requestedPermissions : new ArrayList<>();
    }

    public List<ApkPermission> getDeclaredPermissions() {
        return declaredPermissions;
    }

    public void setDeclaredPermissions(List<ApkPermission> declaredPermissions) {
        this.declaredPermissions = declaredPermissions != null ? declaredPermissions : new ArrayList<>();
    }

    public ApkSignatureInfo getSignatureInfo() {
        return signatureInfo;
    }

    public void setSignatureInfo(ApkSignatureInfo signatureInfo) {
        this.signatureInfo = signatureInfo;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public int getDexFilesCount() {
        return dexFilesCount;
    }

    public void setDexFilesCount(int dexFilesCount) {
        this.dexFilesCount = dexFilesCount;
    }

    public int getTotalMethodsCount() {
        return totalMethodsCount;
    }

    public void setTotalMethodsCount(int totalMethodsCount) {
        this.totalMethodsCount = totalMethodsCount;
    }

    public PackageInfo getRawPackageInfo() {
        return rawPackageInfo;
    }

    public void setRawPackageInfo(PackageInfo rawPackageInfo) {
        this.rawPackageInfo = rawPackageInfo;
    }
}
