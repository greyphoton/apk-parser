package com.greyphoton.apkparser;

import com.greyphoton.apkparser.exception.ApkParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Pure Java binary AndroidManifest.xml (AXML) decompressor and XML decoder.
 * Converts compiled binary XML chunk tables into formatted, human-readable XML.
 */
public class ApkManifestReader {

    private static final Logger log = LoggerFactory.getLogger(ApkManifestReader.class);

    private static final int CHUNK_AXML_FILE = 0x00080003;
    private static final int CHUNK_STRING_POOL = 0x001C0001;
    private static final int CHUNK_RESOURCEIDS = 0x00080180;
    private static final int CHUNK_START_NAMESPACE = 0x00100100;
    private static final int CHUNK_END_NAMESPACE = 0x00100101;
    private static final int CHUNK_START_TAG = 0x00100102;
    private static final int CHUNK_END_TAG = 0x00100103;
    private static final int CHUNK_TEXT = 0x00100104;

    /**
     * Reads and decodes AndroidManifest.xml from an APK file.
     */
    public static String getManifestXml(File apkFile) {
        try (ZipFile zipFile = new ZipFile(apkFile)) {
            ZipEntry entry = zipFile.getEntry("AndroidManifest.xml");
            if (entry == null) {
                throw new ApkParseException("AndroidManifest.xml not found in APK archive.");
            }
            try (InputStream is = zipFile.getInputStream(entry);
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, read);
                }
                return decodeAxml(baos.toByteArray());
            }
        } catch (Exception e) {
            log.error("Failed to read AndroidManifest.xml: {}", e.getMessage(), e);
            throw new ApkParseException("Failed to read AndroidManifest.xml: " + e.getMessage(), e);
        }
    }

    /**
     * Decodes binary AXML byte array into a formatted XML string.
     */
    public static String decodeAxml(byte[] bytes) {
        if (bytes == null || bytes.length < 8) {
            throw new ApkParseException("Invalid AXML file: too small.");
        }

        ByteBuffer buf = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        int magic = buf.getInt();
        if (magic != CHUNK_AXML_FILE) {
            throw new ApkParseException(String.format("Invalid AXML magic 0x%08X (expected 0x%08X)", magic, CHUNK_AXML_FILE));
        }

        int fileSize = buf.getInt();
        List<String> stringPool = new ArrayList<>();
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        int indentLevel = 0;

        while (buf.position() < buf.limit()) {
            int chunkStart = buf.position();
            if (buf.remaining() < 8) break;

            int chunkType = buf.getInt();
            int chunkSize = buf.getInt();

            if (chunkSize <= 0 || chunkStart + chunkSize > bytes.length) {
                break;
            }

            switch (chunkType) {
                case CHUNK_STRING_POOL:
                    stringPool = parseStringPool(bytes, chunkStart, chunkSize);
                    buf.position(chunkStart + chunkSize);
                    break;

                case CHUNK_RESOURCEIDS:
                    // Skip resource IDs table
                    buf.position(chunkStart + chunkSize);
                    break;

                case CHUNK_START_NAMESPACE: {
                    buf.getInt(); // lineNumber
                    buf.getInt(); // comment
                    int prefixIdx = buf.getInt();
                    int uriIdx = buf.getInt();
                    String prefix = getString(stringPool, prefixIdx);
                    String uri = getString(stringPool, uriIdx);
                    buf.position(chunkStart + chunkSize);
                    break;
                }

                case CHUNK_END_NAMESPACE:
                    buf.position(chunkStart + chunkSize);
                    break;

                case CHUNK_START_TAG: {
                    buf.getInt(); // lineNumber
                    buf.getInt(); // comment
                    int nsIdx = buf.getInt();
                    int nameIdx = buf.getInt();
                    int flags = buf.getInt();
                    int attrCount = buf.getShort() & 0xFFFF;
                    int idIndex = buf.getShort() & 0xFFFF;
                    int classIndex = buf.getShort() & 0xFFFF;
                    int styleIndex = buf.getShort() & 0xFFFF;

                    String tagName = getString(stringPool, nameIdx);
                    appendIndent(xml, indentLevel);
                    xml.append("<").append(tagName);

                    if (indentLevel == 0) {
                        xml.append(" xmlns:android=\"http://schemas.android.com/apk/res/android\"");
                    }

                    for (int i = 0; i < attrCount; i++) {
                        int attrNsIdx = buf.getInt();
                        int attrNameIdx = buf.getInt();
                        int attrRawValIdx = buf.getInt();
                        int attrType = (buf.getInt() >> 24) & 0xFF;
                        int attrData = buf.getInt();

                        String attrName = getString(stringPool, attrNameIdx);
                        String attrVal;
                        if (attrRawValIdx >= 0 && attrRawValIdx < stringPool.size()) {
                            attrVal = stringPool.get(attrRawValIdx);
                        } else {
                            attrVal = formatAttributeValue(attrType, attrData);
                        }

                        xml.append(" ");
                        if (attrNsIdx >= 0) {
                            xml.append("android:");
                        }
                        xml.append(attrName).append("=\"").append(escapeXml(attrVal)).append("\"");
                    }

                    xml.append(">\n");
                    indentLevel++;
                    buf.position(chunkStart + chunkSize);
                    break;
                }

                case CHUNK_END_TAG: {
                    indentLevel = Math.max(0, indentLevel - 1);
                    buf.getInt(); // line
                    buf.getInt(); // comment
                    int nsIdx = buf.getInt();
                    int nameIdx = buf.getInt();
                    String tagName = getString(stringPool, nameIdx);
                    appendIndent(xml, indentLevel);
                    xml.append("</").append(tagName).append(">\n");
                    buf.position(chunkStart + chunkSize);
                    break;
                }

                case CHUNK_TEXT:
                default:
                    buf.position(chunkStart + chunkSize);
                    break;
            }
        }

        return xml.toString();
    }

    private static List<String> parseStringPool(byte[] bytes, int offset, int size) {
        List<String> pool = new ArrayList<>();
        ByteBuffer buf = ByteBuffer.wrap(bytes, offset, size).order(ByteOrder.LITTLE_ENDIAN);
        buf.getInt(); // chunkType
        buf.getInt(); // chunkSize
        int stringCount = buf.getInt();
        int styleCount = buf.getInt();
        int flags = buf.getInt();
        int stringsOffset = buf.getInt();
        int stylesOffset = buf.getInt();

        boolean isUtf8 = (flags & (1 << 8)) != 0;

        int[] offsets = new int[stringCount];
        for (int i = 0; i < stringCount; i++) {
            offsets[i] = buf.getInt();
        }

        int stringsStart = offset + stringsOffset;
        for (int i = 0; i < stringCount; i++) {
            int strPos = stringsStart + offsets[i];
            if (strPos >= bytes.length) {
                pool.add("");
                continue;
            }

            if (isUtf8) {
                // UTF-8 length decoding
                int p = strPos;
                int charLen = bytes[p++] & 0xFF;
                if ((charLen & 0x80) != 0) {
                    charLen = ((charLen & 0x7F) << 8) | (bytes[p++] & 0xFF);
                }
                int byteLen = bytes[p++] & 0xFF;
                if ((byteLen & 0x80) != 0) {
                    byteLen = ((byteLen & 0x7F) << 8) | (bytes[p++] & 0xFF);
                }
                if (p + byteLen <= bytes.length) {
                    pool.add(new String(bytes, p, byteLen, StandardCharsets.UTF_8));
                } else {
                    pool.add("");
                }
            } else {
                // UTF-16LE length decoding
                int p = strPos;
                int len = (bytes[p] & 0xFF) | ((bytes[p + 1] & 0xFF) << 8);
                p += 2;
                if ((len & 0x8000) != 0) {
                    int high = (bytes[p] & 0xFF) | ((bytes[p + 1] & 0xFF) << 8);
                    len = ((len & 0x7FFF) << 16) | high;
                    p += 2;
                }
                int byteLen = len * 2;
                if (p + byteLen <= bytes.length) {
                    pool.add(new String(bytes, p, byteLen, StandardCharsets.UTF_16LE));
                } else {
                    pool.add("");
                }
            }
        }
        return pool;
    }

    private static String getString(List<String> pool, int index) {
        if (index >= 0 && index < pool.size()) {
            return pool.get(index);
        }
        return "";
    }

    private static String formatAttributeValue(int type, int data) {
        switch (type) {
            case 0x03: // TYPE_STRING
                return String.valueOf(data);
            case 0x10: // TYPE_INT_DEC
                return String.valueOf(data);
            case 0x11: // TYPE_INT_HEX
                return String.format("0x%08X", data);
            case 0x12: // TYPE_INT_BOOLEAN
                return data != 0 ? "true" : "false";
            case 0x01: // TYPE_REFERENCE
                return String.format("@0x%08X", data);
            default:
                return String.valueOf(data);
        }
    }

    private static void appendIndent(StringBuilder sb, int level) {
        for (int i = 0; i < level; i++) {
            sb.append("  ");
        }
    }

    private static String escapeXml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
