package com.greyphoton.apkparser;

import com.greyphoton.apkparser.model.ApkSignatureInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.channels.FileChannel;
import java.security.MessageDigest;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Utility to inspect APK signing schemes (v1 JAR signing, v2 APK Signing Block, v3, v4)
 * and extract X.509 certificate fingerprints.
 */
public class ApkSignatureReader {

    private static final Logger log = LoggerFactory.getLogger(ApkSignatureReader.class);

    private static final long APK_SIG_BLOCK_MAGIC_HI = 0x3234206b636f6c42L; // "B l o c k   4 2"
    private static final long APK_SIG_BLOCK_MAGIC_LO = 0x20676953204b5041L; // "A P K   S i g  "
    private static final int APK_SIGNATURE_SCHEME_V2_BLOCK_ID = 0x7109871a;
    private static final int APK_SIGNATURE_SCHEME_V3_BLOCK_ID = 0xf05368c0;

    /**
     * Inspects the APK file for v1 and v2/v3 signing schemes.
     */
    public static ApkSignatureInfo readSignatureInfo(File apkFile) {
        ApkSignatureInfo info = new ApkSignatureInfo();

        if (apkFile == null || !apkFile.exists()) {
            return info;
        }

        // 1. Check v1 Scheme (JAR signing) via META-INF entries
        try (ZipFile zipFile = new ZipFile(apkFile)) {
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            CertificateFactory certFactory = CertificateFactory.getInstance("X.509");

            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                String name = entry.getName().toUpperCase();
                if (name.startsWith("META-INF/") && (name.endsWith(".RSA") || name.endsWith(".DSA") || name.endsWith(".EC"))) {
                    info.setHasV1Scheme(true);
                    try (InputStream is = zipFile.getInputStream(entry)) {
                        // Extract certificates
                        for (java.security.cert.Certificate c : certFactory.generateCertificates(is)) {
                            if (c instanceof X509Certificate) {
                                ApkSignatureInfo.CertificateDetail detail = parseX509((X509Certificate) c);
                                info.getCertificates().add(detail);
                            }
                        }
                    } catch (Exception e) {
                        log.debug("Could not parse cert from entry {}: {}", name, e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed checking v1 signature: {}", e.getMessage());
        }

        // 2. Check v2 / v3 APK Signing Block
        try (FileInputStream fis = new FileInputStream(apkFile);
             FileChannel channel = fis.getChannel()) {
            findApkSigningBlock(channel, info);
        } catch (Exception e) {
            log.debug("APK signing block check note: {}", e.getMessage());
        }

        return info;
    }

    private static void findApkSigningBlock(FileChannel channel, ApkSignatureInfo info) throws Exception {
        long fileSize = channel.size();
        if (fileSize < 32) return;

        // Find ZIP End of Central Directory (EOCD)
        ByteBuffer buffer = ByteBuffer.allocate(Math.min((int) fileSize, 65536));
        buffer.order(ByteOrder.LITTLE_ENDIAN);
        long searchStart = Math.max(0, fileSize - 65536);
        channel.position(searchStart);
        channel.read(buffer);
        buffer.flip();

        int eocdOffset = -1;
        for (int i = buffer.limit() - 22; i >= 0; i--) {
            if (buffer.getInt(i) == 0x06054b50) {
                eocdOffset = i;
                break;
            }
        }

        if (eocdOffset < 0) return;

        int centralDirOffset = buffer.getInt(eocdOffset + 16);
        if (centralDirOffset < 32) return;

        // Read footer of APK Signing Block right before central directory
        ByteBuffer footer = ByteBuffer.allocate(24);
        footer.order(ByteOrder.LITTLE_ENDIAN);
        channel.position(centralDirOffset - 24);
        channel.read(footer);
        footer.flip();

        long blockSize = footer.getLong();
        long magicLo = footer.getLong();
        long magicHi = footer.getLong();

        if (magicLo == APK_SIG_BLOCK_MAGIC_LO && magicHi == APK_SIG_BLOCK_MAGIC_HI) {
            long blockStart = centralDirOffset - 8 - blockSize;
            if (blockStart >= 0) {
                ByteBuffer blockContent = ByteBuffer.allocate((int) Math.min(blockSize, 65536));
                blockContent.order(ByteOrder.LITTLE_ENDIAN);
                channel.position(blockStart + 8);
                channel.read(blockContent);
                blockContent.flip();

                while (blockContent.remaining() >= 12) {
                    long idValueLen = blockContent.getLong();
                    if (idValueLen < 4 || idValueLen > blockContent.remaining()) break;
                    int id = blockContent.getInt();
                    if (id == APK_SIGNATURE_SCHEME_V2_BLOCK_ID) {
                        info.setHasV2Scheme(true);
                    } else if (id == APK_SIGNATURE_SCHEME_V3_BLOCK_ID) {
                        info.setHasV3Scheme(true);
                    }
                    int skip = (int) (idValueLen - 4);
                    if (skip > 0 && skip <= blockContent.remaining()) {
                        blockContent.position(blockContent.position() + skip);
                    }
                }
            }
        }
    }

    private static ApkSignatureInfo.CertificateDetail parseX509(X509Certificate cert) {
        ApkSignatureInfo.CertificateDetail detail = new ApkSignatureInfo.CertificateDetail();
        detail.setSubjectDN(cert.getSubjectX500Principal().getName());
        detail.setIssuerDN(cert.getIssuerX500Principal().getName());
        detail.setSerialNumber(cert.getSerialNumber().toString(16));
        detail.setValidFrom(cert.getNotBefore().toString());
        detail.setValidTo(cert.getNotAfter().toString());

        try {
            byte[] encoded = cert.getEncoded();
            detail.setSha256Fingerprint(formatFingerprint(MessageDigest.getInstance("SHA-256").digest(encoded)));
            detail.setSha1Fingerprint(formatFingerprint(MessageDigest.getInstance("SHA-1").digest(encoded)));
            detail.setMd5Fingerprint(formatFingerprint(MessageDigest.getInstance("MD5").digest(encoded)));
        } catch (Exception e) {
            log.warn("Could not calculate certificate digests: {}", e.getMessage());
        }

        return detail;
    }

    private static String formatFingerprint(byte[] digest) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < digest.length; i++) {
            if (i > 0) sb.append(":");
            sb.append(String.format("%02X", digest[i]));
        }
        return sb.toString();
    }
}
