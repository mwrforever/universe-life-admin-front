/**
 * SHA-256 哈希计算工具
 * 支持大文件分块计算，避免内存溢出
 */

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

/** 哈希计算进度回调类型 */
export type HashProgressCallback = (progress: number) => void;

/**
 * 将 ArrayBuffer 转换为十六进制字符串
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 获取 SubtleCrypto 实例
 * 支持浏览器和 Node.js 环境
 */
async function getSubtleCrypto(): Promise<SubtleCrypto> {
  if (typeof globalThis.crypto?.subtle !== 'undefined') {
    return globalThis.crypto.subtle;
  }
  // Node.js 环境
  const { webcrypto } = await import('crypto');
  return webcrypto.subtle as SubtleCrypto;
}

/**
 * 计算文件的 SHA-256 哈希值
 * @param file 要计算哈希的文件
 * @param onProgress 进度回调函数，参数为 0-100 的进度值
 * @param chunkSize 分块大小，默认 2MB
 * @returns 64 位小写十六进制哈希字符串
 */
export async function calculateSHA256(
  file: File,
  onProgress?: HashProgressCallback,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): Promise<string> {
  const fileSize = file.size;
  const subtle = await getSubtleCrypto();

  // 小文件直接计算
  if (fileSize <= chunkSize) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await subtle.digest('SHA-256', buffer);
    onProgress?.(100);
    return arrayBufferToHex(hashBuffer);
  }

  // 大文件分块读取
  const chunks: ArrayBuffer[] = [];
  let offset = 0;
  let processedSize = 0;

  while (offset < fileSize) {
    const end = Math.min(offset + chunkSize, fileSize);
    const chunk = file.slice(offset, end);
    const buffer = await chunk.arrayBuffer();
    chunks.push(buffer);

    processedSize += buffer.byteLength;
    onProgress?.(Math.round((processedSize / fileSize) * 100));
    offset = end;
  }

  // 合并所有块
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let position = 0;

  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), position);
    position += chunk.byteLength;
  }

  // 计算最终哈希
  const hashBuffer = await subtle.digest('SHA-256', combined);
  return arrayBufferToHex(hashBuffer);
}
