package com.greyphoton.apkparser.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing APK signature information and certificate fingerprints.
 */
public class ApkSignatureInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    private boolean hasV1Scheme;
    private boolean hasV2Scheme;
    private boolean hasV3Scheme;
    private boolean hasV4Scheme;
    private List<CertificateDetail> certificates = new ArrayList<>();

    public static class CertificateDetail implements Serializable {
        private static final long serialVersionUID = 1L;

        private String subjectDN;
        private String issuerDN;
        private String serialNumber;
        private String sha256Fingerprint;
        private String sha1Fingerprint;
        private String md5Fingerprint;
        private String validFrom;
        private String validTo;

        public String getSubjectDN() {
            return subjectDN;
        }

        public void setSubjectDN(String subjectDN) {
            this.subjectDN = subjectDN;
        }

        public String getIssuerDN() {
            return issuerDN;
        }

        public void setIssuerDN(String issuerDN) {
            this.issuerDN = issuerDN;
        }

        public String getSerialNumber() {
            return serialNumber;
        }

        public void setSerialNumber(String serialNumber) {
            this.serialNumber = serialNumber;
        }

        public String getSha256Fingerprint() {
            return sha256Fingerprint;
        }

        public void setSha256Fingerprint(String sha256Fingerprint) {
            this.sha256Fingerprint = sha256Fingerprint;
        }

        public String getSha1Fingerprint() {
            return sha1Fingerprint;
        }

        public void setSha1Fingerprint(String sha1Fingerprint) {
            this.sha1Fingerprint = sha1Fingerprint;
        }

        public String getMd5Fingerprint() {
            return md5Fingerprint;
        }

        public void setMd5Fingerprint(String md5Fingerprint) {
            this.md5Fingerprint = md5Fingerprint;
        }

        public String getValidFrom() {
            return validFrom;
        }

        public void setValidFrom(String validFrom) {
            this.validFrom = validFrom;
        }

        public String getValidTo() {
            return validTo;
        }

        public void setValidTo(String validTo) {
            this.validTo = validTo;
        }
    }

    public boolean isHasV1Scheme() {
        return hasV1Scheme;
    }

    public void setHasV1Scheme(boolean hasV1Scheme) {
        this.hasV1Scheme = hasV1Scheme;
    }

    public boolean isHasV2Scheme() {
        return hasV2Scheme;
    }

    public void setHasV2Scheme(boolean hasV2Scheme) {
        this.hasV2Scheme = hasV2Scheme;
    }

    public boolean isHasV3Scheme() {
        return hasV3Scheme;
    }

    public void setHasV3Scheme(boolean hasV3Scheme) {
        this.hasV3Scheme = hasV3Scheme;
    }

    public boolean isHasV4Scheme() {
        return hasV4Scheme;
    }

    public void setHasV4Scheme(boolean hasV4Scheme) {
        this.hasV4Scheme = hasV4Scheme;
    }

    public List<CertificateDetail> getCertificates() {
        return certificates;
    }

    public void setCertificates(List<CertificateDetail> certificates) {
        this.certificates = certificates != null ? certificates : new ArrayList<>();
    }
}
