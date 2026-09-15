package com.greyphoton.apkparser.model;

import java.io.Serializable;

/**
 * Model representing an Android permission requested or declared in an APK.
 */
public class ApkPermission implements Serializable {
    private static final long serialVersionUID = 1L;

    private String name;
    private String protectionLevel;
    private boolean dangerous;
    private String description;

    public ApkPermission() {
    }

    public ApkPermission(String name, String protectionLevel, boolean dangerous) {
        this.name = name;
        this.protectionLevel = protectionLevel;
        this.dangerous = dangerous;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProtectionLevel() {
        return protectionLevel;
    }

    public void setProtectionLevel(String protectionLevel) {
        this.protectionLevel = protectionLevel;
    }

    public boolean isDangerous() {
        return dangerous;
    }

    public void setDangerous(boolean dangerous) {
        this.dangerous = dangerous;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return name + " (" + protectionLevel + ")";
    }
}
