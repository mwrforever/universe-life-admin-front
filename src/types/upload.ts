/**
 * 文件上传中心类型定义
 * 腾讯云 COS 直传功能相关类型
 */

// ========== STS 凭证相关 ==========

/** STS 临时凭证 */
export interface STSCredential {
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  expiredTime: number;
}

/** STS 缓存条目 */
export interface STSCacheEntry {
  credential: STSCredential;
  expireAt: number;
}

// ========== 上传状态相关 ==========

/** 上传状态类型 */
export type UploadStatus =
  | 'pending'    // 等待中
  | 'hashing'    // 计算哈希
  | 'checking'   // 秒传检查
  | 'uploading'  // 上传中
  | 'paused'     // 已暂停
  | 'completed'  // 已完成
  | 'failed';    // 失败

/** 上传任务 */
export interface UploadTask {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  hash?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
  fileId?: string;
  /** 正式桶中的文件路径（用于数据保存） */
  downloadPath?: string;
  /** 签名后的下载 URL（用于图片显示） */
  signedUrl?: string;
  /** 签名 URL 的过期时间戳（秒） */
  expireAt?: number;
  bucket?: string;
  /** 临时桶中的文件路径 */
  key?: string;
}

// ========== API 请求/响应类型 ==========

/** 获取上传凭证请求 */
export interface UploadTokenRequest {
  filename: string;
  size: number;
  hash: string;
}

/** 获取上传凭证响应 */
export interface UploadTokenResponse {
  /** 存储桶名称 */
  bucket: string;
  /** 存储区域 */
  region: string;
  /** 文件存储路径 */
  key: string;
  /** STS 临时凭证（秒传时为 null） */
  credentials: STSCredential | null;
  /** 凭证过期时间戳（秒）（秒传时为 null） */
  expiredTime: number | null;
  /** 是否秒传（true 表示文件已存在） */
  instantUpload: boolean;
  /** 文件 ID（秒传时返回） */
  fileId: string | null;
}

/** 上传完成通知请求 */
export interface UploadDoneRequest {
  bucket: string;
  key: string;
  size: number;
  hash: string;
}

/** 上传完成通知响应 */
export interface UploadDoneResponse {
  fileId: string;
  downloadPath: string;
}

/** 获取下载凭证请求 */
export interface DownloadTokenRequest {
  /** 文件地址（文件在正式桶中的 key） */
  fileUrl: string;
}

/** 获取下载凭证响应 */
export interface DownloadTokenResponse {
  expiredUrl: string;
  expireAt: number;
}

/** 批量获取下载凭证请求 */
export interface BatchDownloadTokenRequest {
  /** 文件地址列表（最多 50 个） */
  fileUrls: string[];
}

/** 批量下载凭证项 */
export interface BatchDownloadTokenItem {
  /** 原始文件地址 */
  fileUrl: string;
  /** 带签名的下载 URL */
  expiredUrl: string;
}

/** 批量获取下载凭证响应 */
export interface BatchDownloadTokenResponse {
  /** 下载凭证列表 */
  items: BatchDownloadTokenItem[];
  /** URL 过期时间戳（秒） */
  expireAt: number;
}

// ========== Hook 相关类型 ==========

/** useCOSUpload Hook 配置选项 */
export interface UseCOSUploadOptions {
  bucket?: string;
  region?: string;
  onComplete?: (task: UploadTask) => void;
  onError?: (task: UploadTask, error: Error) => void;
}

/** useCOSUpload Hook 返回值 */
export interface UseCOSUploadReturn {
  tasks: UploadTask[];
  addFiles: (files: File[]) => void;
  pause: (taskId: string) => void;
  resume: (taskId: string) => void;
  cancel: (taskId: string) => void;
  retry: (taskId: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  cancelAll: () => void;
  isUploading: boolean;
  isOnline: boolean;
}

// ========== 组件 Props 类型 ==========

/** 上传管理器组件属性 */
export interface UploadManagerProps {
  bucket?: string;
  region?: string;
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  onComplete?: (fileId: string, downloadPath: string) => void;
  onError?: (error: Error) => void;
}

/** 文件项组件属性 */
export interface FileItemProps {
  task: UploadTask;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

/** 下载链接组件属性 */
export interface DownloadLinkProps {
  fileId: string;
  filename?: string;
  children?: React.ReactNode;
}
