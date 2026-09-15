package com.greyphoton.apkparser.exception;

/**
 * Exception thrown when parsing APK metadata, AndroidManifest.xml, or package information fails.
 */
public class ApkParseException extends RuntimeException {

    public ApkParseException(String message) {
        super(message);
    }

    public ApkParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
