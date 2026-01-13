/**
 * 缩略图工具函数
 * 提供图片验证、缩略图 URL 生成等功能
 */

// ========== 常量定义 ==========

/** 缩略图尺寸配置 */
export const THUMBNAIL_SIZES = {
  small: 64,
  medium: 128,
  large: 256,
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

/** 支持的图片 MIME 类型 */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
] as const;

/** 支持的图片扩展名 */
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'] as const;

/** 默认最大文件大小：5MB */
export const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// ========== 文件类型判断 ==========

/**
 * 根据 MIME 类型判断是否为图片文件
 * @param mimeType 文件的 MIME 类型
 * @returns 是否为图片文件
 */
export function isImageFile(mimeType: string): boolean {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }
  return IMAGE_MIME_TYPES.includes(mimeType as typeof IMAGE_MIME_TYPES[number]);
}

/**
 * 根据文件扩展名判断是否为图片文件
 * @param filename 文件名
 * @returns 是否为图片文件
 */
export function isImageByExtension(filename: string): boolean {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) {
    return false;
  }
  return IMAGE_EXTENSIONS.includes(ext as typeof IMAGE_EXTENSIONS[number]);
}

/**
 * 判断文件是否为图片（综合 MIME 类型和扩展名）
 * @param file 文件对象或文件信息
 * @returns 是否为图片文件
 */
export function isImage(file: File | { name: string; type?: string }): boolean {
  // 优先使用 MIME 类型判断
  if (file.type && isImageFile(file.type)) {
    return true;
  }
  // 回退到扩展名判断
  return isImageByExtension(file.name);
}

// ========== 文件验证 ==========

export interface ValidateImageResult {
  valid: boolean;
  error?: string;
}

export interface ValidateImageOptions {
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 允许的 MIME 类型，默认为所有图片类型 */
  allowedTypes?: string[];
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateImageFile(
  file: File,
  options: ValidateImageOptions = {}
): ValidateImageResult {
  const { maxSize = DEFAULT_MAX_IMAGE_SIZE, allowedTypes } = options;

  // 检查文件是否存在
  if (!file) {
    return { valid: false, error: '请选择文件' };
  }

  // 检查文件类型
  const isValidType = allowedTypes
    ? allowedTypes.includes(file.type)
    : isImage(file);

  if (!isValidType) {
    return {
      valid: false,
      error: '只支持 JPG、PNG、GIF、WebP 格式的图片',
    };
  }

  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `图片大小不能超过 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

// ========== 缩略图 URL 生成 ==========

/**
 * 生成腾讯云 COS 缩略图 URL
 * 使用 COS 图片处理能力生成指定尺寸的缩略图
 * @param originalUrl 原图 URL
 * @param size 缩略图尺寸（像素）或尺寸名称
 * @returns 缩略图 URL
 */
export function generateThumbnailUrl(
  originalUrl: string,
  size: number | ThumbnailSize
): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return '';
  }

  // 如果是 blob URL（本地预览），直接返回原 URL，不添加缩略图参数
  if (originalUrl.startsWith('blob:')) {
    return originalUrl;
  }

  // 如果 URL 已经包含签名参数（sign= 或 q-sign-algorithm=），直接返回原 URL
  // 因为添加缩略图参数会破坏签名
  if (originalUrl.includes('sign=') || originalUrl.includes('q-sign-algorithm=')) {
    return originalUrl;
  }

  // 如果是尺寸名称，转换为像素值
  const sizeValue = typeof size === 'string' ? THUMBNAIL_SIZES[size] : size;

  // 检查是否已经有图片处理参数
  const hasQuery = originalUrl.includes('?');
  const hasImageMogr = originalUrl.includes('imageMogr2');

  // 如果已经有 imageMogr2 参数，不重复添加
  if (hasImageMogr) {
    return originalUrl;
  }

  // COS 图片处理参数
  // 参考：https://cloud.tencent.com/document/product/436/44880
  const separator = hasQuery ? '&' : '?';
  return `${originalUrl}${separator}imageMogr2/thumbnail/${sizeValue}x${sizeValue}`;
}

/**
 * 生成不同尺寸的缩略图 URL 集合
 * @param originalUrl 原图 URL
 * @returns 包含各尺寸缩略图 URL 的对象
 */
export function generateThumbnailUrls(originalUrl: string): Record<ThumbnailSize, string> {
  return {
    small: generateThumbnailUrl(originalUrl, 'small'),
    medium: generateThumbnailUrl(originalUrl, 'medium'),
    large: generateThumbnailUrl(originalUrl, 'large'),
  };
}

// ========== 文件图标映射 ==========

/** 文件类型图标映射 */
export const FILE_TYPE_ICONS: Record<string, string> = {
  // 文档类型
  'application/pdf': 'file-pdf',
  'application/msword': 'file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
  'application/vnd.ms-excel': 'file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel',
  'application/vnd.ms-powerpoint': 'file-ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-ppt',
  // 压缩文件
  'application/zip': 'file-zip',
  'application/x-rar-compressed': 'file-zip',
  'application/x-7z-compressed': 'file-zip',
  // 文本文件
  'text/plain': 'file-text',
  'text/html': 'file-text',
  'text/css': 'file-text',
  'text/javascript': 'file-text',
  'application/json': 'file-text',
  // 音视频
  'audio/mpeg': 'file-audio',
  'audio/wav': 'file-audio',
  'video/mp4': 'file-video',
  'video/webm': 'file-video',
};

/**
 * 根据 MIME 类型获取文件图标名称
 * @param mimeType 文件的 MIME 类型
 * @returns 图标名称
 */
export function getFileIcon(mimeType: string): string {
  if (isImageFile(mimeType)) {
    return 'file-image';
  }
  return FILE_TYPE_ICONS[mimeType] || 'file';
}

/**
 * 根据文件名获取文件图标名称
 * @param filename 文件名
 * @returns 图标名称
 */
export function getFileIconByName(filename: string): string {
  if (isImageByExtension(filename)) {
    return 'file-image';
  }
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const extToIcon: Record<string, string> = {
    pdf: 'file-pdf',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-ppt',
    pptx: 'file-ppt',
    zip: 'file-zip',
    rar: 'file-zip',
    '7z': 'file-zip',
    txt: 'file-text',
    mp3: 'file-audio',
    wav: 'file-audio',
    mp4: 'file-video',
    webm: 'file-video',
  };
  
  return extToIcon[ext || ''] || 'file';
}
