/**
 * 错误消息格式化工具
 * 
 * 功能：
 * - 限制每行最多显示指定字符数
 * - 限制最多显示指定行数
 * - 超出部分用省略号替换
 * - 正确处理中英文字符
 */

/**
 * 错误格式化选项
 */
export interface ErrorFormatOptions {
  /** 每行最大字符数，默认 20 */
  maxCharsPerLine?: number;
  /** 最大行数，默认 5 */
  maxLines?: number;
  /** 省略号，默认 "..." */
  ellipsis?: string;
}

/** 默认配置 */
const DEFAULT_OPTIONS: Required<ErrorFormatOptions> = {
  maxCharsPerLine: 20,
  maxLines: 5,
  ellipsis: '...',
};

/**
 * 获取字符串的显示宽度
 * 中文字符算 1 个字符，英文字符也算 1 个字符
 * @param str 字符串
 * @returns 显示宽度
 */
export function getStringWidth(str: string): number {
  return str.length;
}

/**
 * 按字符数截断字符串
 * @param str 原始字符串
 * @param maxChars 最大字符数
 * @returns 截断后的字符串
 */
export function truncateString(str: string, maxChars: number): string {
  if (str.length <= maxChars) {
    return str;
  }
  return str.slice(0, maxChars);
}

/**
 * 将字符串按指定宽度分割成多行
 * 尽量在单词边界处换行（对于英文）
 * @param str 原始字符串
 * @param maxCharsPerLine 每行最大字符数
 * @returns 分割后的行数组
 */
export function splitIntoLines(str: string, maxCharsPerLine: number): string[] {
  if (!str) {
    return [];
  }

  const lines: string[] = [];
  let remaining = str;

  while (remaining.length > 0) {
    if (remaining.length <= maxCharsPerLine) {
      lines.push(remaining);
      break;
    }

    // 尝试在单词边界处换行
    let breakPoint = maxCharsPerLine;
    
    // 查找最后一个空格位置（在 maxCharsPerLine 范围内）
    const lastSpace = remaining.lastIndexOf(' ', maxCharsPerLine);
    
    // 如果找到空格且不是在开头，使用空格位置作为断点
    if (lastSpace > 0 && lastSpace > maxCharsPerLine * 0.5) {
      breakPoint = lastSpace;
    }

    lines.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return lines;
}

/**
 * 格式化错误消息
 * @param message 原始错误消息
 * @param options 格式化选项
 * @returns 格式化后的消息
 */
export function formatErrorMessage(
  message: string,
  options?: ErrorFormatOptions
): string {
  if (!message) {
    return '';
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxCharsPerLine, maxLines, ellipsis } = opts;

  // 先按换行符分割
  const originalLines = message.split('\n');
  const allLines: string[] = [];

  // 对每一行进行宽度限制分割
  for (const line of originalLines) {
    const splitLines = splitIntoLines(line, maxCharsPerLine);
    allLines.push(...splitLines);
  }

  // 检查是否需要截断
  const needsTruncation = allLines.length > maxLines;
  
  // 取前 maxLines 行
  let resultLines = allLines.slice(0, maxLines);

  // 如果需要截断，在最后一行添加省略号
  if (needsTruncation) {
    const lastLine = resultLines[resultLines.length - 1];
    // 确保最后一行加上省略号后不超过最大字符数
    const maxLastLineLength = maxCharsPerLine - ellipsis.length;
    if (lastLine.length > maxLastLineLength) {
      resultLines[resultLines.length - 1] = lastLine.slice(0, maxLastLineLength) + ellipsis;
    } else {
      resultLines[resultLines.length - 1] = lastLine + ellipsis;
    }
  }

  return resultLines.join('\n');
}

export default formatErrorMessage;
