package com.greyphoton.apkparser.exception;

/**
 * Exception thrown when an error occurs while reading or opening an APK file or its assets.
 */
public class ApkReadException extends RuntimeException {

    public ApkReadException() {
        super("Failed to read APK archive or assets.");
    }

    public ApkReadException(String message) {
        super(message);
    }

    public ApkReadException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApkReadException(Throwable cause) {
        super(cause);
    }
}
