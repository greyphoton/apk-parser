/**
 * Android Binary XML (AXML) Decoder
 * Decodes compiled binary AndroidManifest.xml into formatted XML string
 */

// Chunk Types
const RES_XML_TYPE = 0x0003;
const RES_STRING_POOL_TYPE = 0x0001;
const RES_XML_RESOURCE_MAP_TYPE = 0x0180;
const RES_XML_START_NAMESPACE_TYPE = 0x0100;
const RES_XML_END_NAMESPACE_TYPE = 0x0101;
const RES_XML_START_ELEMENT_TYPE = 0x0102;
const RES_XML_END_ELEMENT_TYPE = 0x0103;
const RES_XML_CDATA_TYPE = 0x0104;

// Value Data Types
const TYPE_REFERENCE = 0x01;
const TYPE_ATTRIBUTE = 0x02;
const TYPE_STRING = 0x03;
const TYPE_FLOAT = 0x04;
const TYPE_DIMENSION = 0x05;
const TYPE_FRACTION = 0x06;
const TYPE_INT_DEC = 0x10;
const TYPE_INT_HEX = 0x11;
const TYPE_INT_BOOLEAN = 0x12;

export function decodeAxml(buffer: Uint8Array): string {
  // Check if buffer is plain text XML (starts with '<')
  if (buffer.length > 0 && buffer[0] === 0x3c /* '<' */) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // Check magic header: RES_XML_TYPE
  if (buffer.length < 8) {
    throw new Error('Buffer too small to be valid Android binary XML');
  }

  const headerType = view.getUint16(0, true);
  if (headerType !== RES_XML_TYPE) {
    // Try utf-8 decode fallback in case it is plain text
    try {
      const decoded = new TextDecoder('utf-8').decode(buffer);
      if (decoded.includes('<manifest')) return decoded;
    } catch {
      // ignore
    }
    throw new Error(`Invalid AXML header type: 0x${headerType.toString(16)}`);
  }

  let offset = 8;
  let stringPool: string[] = [];
  const resourceIds: number[] = [];
  const namespaces: Map<string, string> = new Map(); // uri -> prefix
  let xmlOutput = '<?xml version="1.0" encoding="utf-8"?>\n';
  let indent = 0;

  function getIndent(): string {
    return '  '.repeat(indent);
  }

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;

    const chunkType = view.getUint16(offset, true);
    const headerSize = view.getUint16(offset + 2, true);
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkSize <= 0 || offset + chunkSize > buffer.length + 8) {
      break;
    }

    if (chunkType === RES_STRING_POOL_TYPE) {
      stringPool = parseStringPool(buffer, offset);
    } else if (chunkType === RES_XML_RESOURCE_MAP_TYPE) {
      const idCount = Math.floor((chunkSize - headerSize) / 4);
      let idOffset = offset + headerSize;
      for (let i = 0; i < idCount; i++) {
        if (idOffset + 4 <= buffer.length) {
          resourceIds.push(view.getUint32(idOffset, true));
          idOffset += 4;
        }
      }
    } else if (chunkType === RES_XML_START_NAMESPACE_TYPE) {
      const prefixIdx = view.getInt32(offset + 16, true);
      const uriIdx = view.getInt32(offset + 20, true);
      const prefix = prefixIdx >= 0 && prefixIdx < stringPool.length ? stringPool[prefixIdx] : '';
      const uri = uriIdx >= 0 && uriIdx < stringPool.length ? stringPool[uriIdx] : '';
      if (uri) {
        namespaces.set(uri, prefix || 'android');
      }
    } else if (chunkType === RES_XML_END_NAMESPACE_TYPE) {
      // Namespace scope end
    } else if (chunkType === RES_XML_START_ELEMENT_TYPE) {
      const nameIdx = view.getInt32(offset + 20, true);
      const attrStart = view.getUint16(offset + 24, true);
      const attrSize = view.getUint16(offset + 26, true);
      const attrCount = view.getUint16(offset + 28, true);

      const tagName = nameIdx >= 0 && nameIdx < stringPool.length ? stringPool[nameIdx] : 'tag';
      let tagLine = `${getIndent()}<${tagName}`;

      // If root manifest tag, declare standard namespaces
      if (tagName === 'manifest') {
        tagLine += ' xmlns:android="http://schemas.android.com/apk/res/android"';
      }

      let attrOffset = offset + attrStart;
      for (let i = 0; i < attrCount; i++) {
        if (attrOffset + 20 > buffer.length) break;

        const attrUriIdx = view.getInt32(attrOffset, true);
        const attrNameIdx = view.getInt32(attrOffset + 4, true);
        const rawValueIdx = view.getInt32(attrOffset + 8, true);
        const dataType = view.getUint8(attrOffset + 15);
        const dataVal = view.getInt32(attrOffset + 16, true);

        const attrUri = attrUriIdx >= 0 && attrUriIdx < stringPool.length ? stringPool[attrUriIdx] : '';
        const attrNameRaw = attrNameIdx >= 0 && attrNameIdx < stringPool.length ? stringPool[attrNameIdx] : `attr_${i}`;
        
        let prefix = '';
        if (attrUri.includes('android')) {
          prefix = 'android:';
        } else if (attrUri) {
          prefix = (namespaces.get(attrUri) || 'app') + ':';
        }

        const attrName = `${prefix}${attrNameRaw}`;
        let attrValue = '';

        if (rawValueIdx >= 0 && rawValueIdx < stringPool.length) {
          attrValue = stringPool[rawValueIdx];
        } else {
          attrValue = formatResValue(dataType, dataVal, stringPool);
        }

        // Escape attribute value
        const escapedVal = attrValue
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        tagLine += ` ${attrName}="${escapedVal}"`;
        attrOffset += attrSize || 20;
      }

      tagLine += '>\n';
      xmlOutput += tagLine;
      indent++;
    } else if (chunkType === RES_XML_END_ELEMENT_TYPE) {
      indent = Math.max(0, indent - 1);
      const nameIdx = view.getInt32(offset + 20, true);
      const tagName = nameIdx >= 0 && nameIdx < stringPool.length ? stringPool[nameIdx] : 'tag';
      xmlOutput += `${getIndent()}</${tagName}>\n`;
    } else if (chunkType === RES_XML_CDATA_TYPE) {
      const dataIdx = view.getInt32(offset + 16, true);
      if (dataIdx >= 0 && dataIdx < stringPool.length) {
        xmlOutput += `${getIndent()}${stringPool[dataIdx]}\n`;
      }
    }

    offset += chunkSize;
  }

  return xmlOutput.trim();
}

function parseStringPool(buffer: Uint8Array, offset: number): string[] {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const stringCount = view.getUint32(offset + 8, true);
  const flags = view.getUint32(offset + 16, true);
  const stringsStart = offset + view.getUint32(offset + 20, true);
  const isUtf8 = (flags & (1 << 8)) !== 0;

  const strings: string[] = [];
  const stringIndicesOffset = offset + 28;

  for (let i = 0; i < stringCount; i++) {
    const stringOffset = stringsStart + view.getUint32(stringIndicesOffset + i * 4, true);
    if (stringOffset >= buffer.length) {
      strings.push('');
      continue;
    }

    if (isUtf8) {
      // UTF-8 string: [char length (1-2 bytes)] [byte length (1-2 bytes)] [utf-8 bytes] [0x00]
      let p = stringOffset;
      // Skip character length
      let length = buffer[p++];
      if ((length & 0x80) !== 0) {
        length = ((length & 0x7f) << 8) | buffer[p++];
      }
      // Skip byte length
      let byteLen = buffer[p++];
      if ((byteLen & 0x80) !== 0) {
        byteLen = ((byteLen & 0x7f) << 8) | buffer[p++];
      }
      const utf8Bytes = buffer.slice(p, p + byteLen);
      strings.push(new TextDecoder('utf-8', { fatal: false }).decode(utf8Bytes));
    } else {
      // UTF-16LE string: [char length (2-4 bytes)] [utf-16le bytes] [0x00 0x00]
      let p = stringOffset;
      let len = view.getUint16(p, true);
      p += 2;
      if ((len & 0x8000) !== 0) {
        len = ((len & 0x7fff) << 16) | view.getUint16(p, true);
        p += 2;
      }
      const charCodes: number[] = [];
      for (let j = 0; j < len; j++) {
        if (p + 2 <= buffer.length) {
          charCodes.push(view.getUint16(p, true));
          p += 2;
        }
      }
      strings.push(String.fromCharCode(...charCodes));
    }
  }

  return strings;
}

function formatResValue(dataType: number, data: number, stringPool: string[]): string {
  switch (dataType) {
    case TYPE_STRING:
      return data >= 0 && data < stringPool.length ? stringPool[data] : '';
    case TYPE_INT_BOOLEAN:
      return data !== 0 ? 'true' : 'false';
    case TYPE_INT_HEX:
      return `0x${(data >>> 0).toString(16)}`;
    case TYPE_INT_DEC:
      return `${data}`;
    case TYPE_REFERENCE:
      return `@0x${(data >>> 0).toString(16).padStart(8, '0')}`;
    case TYPE_ATTRIBUTE:
      return `?0x${(data >>> 0).toString(16).padStart(8, '0')}`;
    case TYPE_FLOAT:
      const buf = new ArrayBuffer(4);
      new DataView(buf).setInt32(0, data, true);
      return `${new DataView(buf).getFloat32(0, true).toFixed(2)}`;
    case TYPE_DIMENSION:
      return `${data >> 8}dp`;
    default:
      return `${data}`;
  }
}
