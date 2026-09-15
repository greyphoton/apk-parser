package com.greyphoton.apkparser.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing an Android Component (Activity, Service, BroadcastReceiver, ContentProvider).
 */
public class ApkComponent implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum ComponentType {
        ACTIVITY,
        SERVICE,
        RECEIVER,
        PROVIDER
    }

    private String name;
    private ComponentType type;
    private boolean exported;
    private String permission;
    private boolean enabled = true;
    private List<String> actions = new ArrayList<>();
    private List<String> categories = new ArrayList<>();
    private String authority; // For content providers

    public ApkComponent() {
    }

    public ApkComponent(String name, ComponentType type, boolean exported) {
        this.name = name;
        this.type = type;
        this.exported = exported;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ComponentType getType() {
        return type;
    }

    public void setType(ComponentType type) {
        this.type = type;
    }

    public boolean isExported() {
        return exported;
    }

    public void setExported(boolean exported) {
        this.exported = exported;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<String> getActions() {
        return actions;
    }

    public void setActions(List<String> actions) {
        this.actions = actions != null ? actions : new ArrayList<>();
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories != null ? categories : new ArrayList<>();
    }

    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }
}
