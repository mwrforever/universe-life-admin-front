/**
 * 文件大小格式化工具
 */

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
const UNIT_BASE = 1024;

/**
 * 格式化字节数为人类可读的字符串
 * @param bytes 字节数
 * @param decimals 小数位数，默认 2
 * @returns 格式化后的字符串，如 "1.50 MB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!Number.isFinite(bytes)) return 'Invalid';
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '-' + formatBytes(-bytes, decimals);

  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(UNIT_BASE));
  const unitIndex = Math.min(i, UNITS.length - 1);
  const value = bytes / Math.pow(UNIT_BASE, unitIndex);
  return `${value.toFixed(dm)} ${UNITS[unitIndex]}`;
}

/**
 * 格式化速度为人类可读的字符串
 * @param bytesPerSecond 每秒字节数
 * @returns 格式化后的速度字符串，如 "1.50 MB/s"
 */
export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

/**
 * 格式化持续时间为人类可读的字符串
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '-' + formatDuration(-seconds);
  if (!Number.isFinite(seconds)) return 'Invalid';
  if (seconds === 0) return '0秒';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`);

  return parts.join('');
}
