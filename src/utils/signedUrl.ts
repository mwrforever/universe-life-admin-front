/**
 * 签名链接管理工具函数
 * 
 * 重要设计原则：
 * - 签名链接的刷新采用【按需检查】策略，不使用定时任务
 * - 每次使用签名链接时检查是否过期，如果过期则用原始 key 重新获取签名
 */

import { COSUploadApiService } from '@/services/upload/uploadApi';

/**
 * 签名 URL 缓存结构
 */
export interface SignedUrlCache {
  /** 签名后的完整 URL */
  url: string;
  /** 过期时间戳（秒） */
  expireAt: number;
  /** 原始文件 key，用于重新签名 */
  originalKey: string;
}

// 签名 URL 缓存（key 为原始文件路径）
const signedUrlCache = new Map<string, SignedUrlCache>();

// 缓冲时间（秒），提前这么多秒认为过期
const EXPIRE_BUFFER_SECONDS = 60;

/**
 * 判断是否需要签名
 * - 空值不需要签名
 * - blob URL 不需要签名
 * - 完整 URL（http/https 开头）不需要签名
 * - 相对路径需要签名
 */
export function needsSignedUrl(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('blob:')) return false;
  if (src.startsWith('http://') || src.startsWith('https://')) return false;
  return true;
}

/**
 * 检查签名链接是否过期（按需检查，非定时任务）
 * 预留 60 秒缓冲时间
 */
export function isSignedUrlExpired(fileUrl: string): boolean {
  const cached = signedUrlCache.get(fileUrl);
  if (!cached) return true;
  return cached.expireAt <= Date.now() / 1000 + EXPIRE_BUFFER_SECONDS;
}

/**
 * 获取缓存中的签名 URL（不检查过期）
 */
export function getCachedSignedUrl(fileUrl: string): SignedUrlCache | undefined {
  return signedUrlCache.get(fileUrl);
}


/**
 * 更新缓存中的签名 URL
 * 同时保存原始 key 以便后续重新签名
 */
export function updateSignedUrlCache(
  originalKey: string,
  signedUrl: string,
  expireAt: number
): void {
  signedUrlCache.set(originalKey, {
    url: signedUrl,
    expireAt,
    originalKey,
  });
}

/**
 * 清除指定 key 的缓存
 */
export function clearSignedUrlCache(originalKey: string): void {
  signedUrlCache.delete(originalKey);
}

/**
 * 清除所有缓存
 */
export function clearAllSignedUrlCache(): void {
  signedUrlCache.clear();
}

/**
 * 获取原始文件 key
 * 如果传入的是已签名的 URL，尝试从缓存中查找原始 key
 * 如果传入的是原始 key，直接返回
 */
export function getOriginalKey(signedUrlOrKey: string): string {
  // 如果不是完整 URL，直接返回（已经是原始 key）
  if (!signedUrlOrKey.startsWith('http://') && !signedUrlOrKey.startsWith('https://')) {
    return signedUrlOrKey;
  }
  
  // 遍历缓存查找匹配的签名 URL
  for (const [key, cache] of signedUrlCache.entries()) {
    if (cache.url === signedUrlOrKey) {
      return key;
    }
  }
  
  // 如果找不到，返回原值
  return signedUrlOrKey;
}

/**
 * 获取签名 URL（带缓存，按需刷新）
 * 1. 检查缓存是否存在且未过期
 * 2. 如果过期，使用原始 key 重新获取签名
 * 3. 更新缓存并返回
 */
export async function getSignedUrl(fileUrl: string): Promise<string | null> {
  // 如果不需要签名，直接返回原值
  if (!needsSignedUrl(fileUrl)) {
    return fileUrl || null;
  }

  // 检查缓存是否有效
  const cached = signedUrlCache.get(fileUrl);
  if (cached && !isSignedUrlExpired(fileUrl)) {
    return cached.url;
  }

  // 缓存不存在或已过期，重新获取签名
  try {
    const res = await COSUploadApiService.getDownloadToken({ fileUrl });
    if (res.code === 1 && res.data?.expiredUrl) {
      // 更新缓存
      updateSignedUrlCache(fileUrl, res.data.expiredUrl, res.data.expireAt);
      return res.data.expiredUrl;
    }
    return null;
  } catch (error) {
    console.error('获取签名 URL 失败:', error);
    return null;
  }
}

/**
 * 批量获取签名 URL
 * 对每个 URL 按需检查过期状态，只对需要签名且过期的重新签名
 */
export async function batchGetSignedUrls(
  fileUrls: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const needSignUrls: string[] = [];

  // 第一遍：检查哪些需要签名，哪些可以用缓存
  for (const url of fileUrls) {
    if (!url) continue;
    
    if (!needsSignedUrl(url)) {
      // 不需要签名，直接使用原值
      result.set(url, url);
    } else if (!isSignedUrlExpired(url)) {
      // 缓存有效，使用缓存
      const cached = signedUrlCache.get(url);
      if (cached) {
        result.set(url, cached.url);
      }
    } else {
      // 需要重新签名
      needSignUrls.push(url);
    }
  }

  // 第二遍：并行获取需要签名的 URL
  if (needSignUrls.length > 0) {
    const signPromises = needSignUrls.map(async (url) => {
      const signedUrl = await getSignedUrl(url);
      return { originalUrl: url, signedUrl };
    });

    const signResults = await Promise.all(signPromises);
    
    for (const { originalUrl, signedUrl } of signResults) {
      if (signedUrl) {
        result.set(originalUrl, signedUrl);
      } else {
        // 签名失败，使用原值
        result.set(originalUrl, originalUrl);
      }
    }
  }

  return result;
}

/**
 * 获取有效的签名 URL（如果过期则刷新）
 * 这是一个便捷方法，用于在使用签名 URL 前确保其有效
 */
export async function getValidSignedUrl(
  originalKeyOrSignedUrl: string
): Promise<string | null> {
  // 获取原始 key
  const originalKey = getOriginalKey(originalKeyOrSignedUrl);
  
  // 如果不需要签名，直接返回
  if (!needsSignedUrl(originalKey)) {
    return originalKeyOrSignedUrl || null;
  }
  
  // 获取签名 URL（会自动处理过期刷新）
  return getSignedUrl(originalKey);
}

// ========== 批量签名相关 ==========

/** 批量签名每批最大数量 */
const BATCH_SIZE = 50;

/**
 * 将 URL 列表分割成批次
 * @param urls URL 列表
 * @param batchSize 每批大小，默认 50
 * @returns 分批后的 URL 数组
 */
export function splitIntoBatches(
  urls: string[],
  batchSize: number = BATCH_SIZE
): string[][] {
  if (!urls || urls.length === 0) {
    return [];
  }
  
  const batches: string[][] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * 批量获取签名 URL（使用批量接口，V2 版本）
 * 1. 过滤不需要签名的 URL
 * 2. 根据 forceRefresh 参数决定是否使用缓存
 * 3. 将需要签名的 URL 分批调用批量签名 API
 * 4. 更新缓存并返回结果 Map
 * 5. 失败时回退到逐个签名
 * 
 * @param fileUrls 文件 URL 列表
 * @param forceRefresh 是否强制刷新（忽略缓存），默认 false
 * @returns Map<原始URL, 签名URL>
 */
export async function batchGetSignedUrlsV2(
  fileUrls: string[],
  forceRefresh: boolean = false
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const needSignUrls: string[] = [];

  // 第一遍：检查哪些需要签名
  for (const url of fileUrls) {
    if (!url) continue;
    
    if (!needsSignedUrl(url)) {
      // 不需要签名，直接使用原值
      result.set(url, url);
    } else if (!forceRefresh && !isSignedUrlExpired(url)) {
      // 非强制刷新且缓存有效，使用缓存
      const cached = signedUrlCache.get(url);
      if (cached) {
        result.set(url, cached.url);
      } else {
        // 缓存不存在，需要签名
        needSignUrls.push(url);
      }
    } else {
      // 强制刷新或缓存过期，需要重新签名
      needSignUrls.push(url);
    }
  }

  // 如果没有需要签名的 URL，直接返回
  if (needSignUrls.length === 0) {
    return result;
  }

  // 分批处理
  const batches = splitIntoBatches(needSignUrls);
  
  for (const batch of batches) {
    try {
      // 调用批量签名 API
      const res = await COSUploadApiService.getBatchDownloadToken({ fileUrls: batch });
      
      if (res.code === 1 && res.data?.items) {
        // 更新缓存并添加到结果
        const expireAt = res.data.expireAt;
        for (const item of res.data.items) {
          updateSignedUrlCache(item.fileUrl, item.expiredUrl, expireAt);
          result.set(item.fileUrl, item.expiredUrl);
        }
      } else {
        // 批量签名失败，回退到逐个签名
        console.warn('批量签名失败，回退到逐个签名:', res.message);
        await fallbackToIndividualSigning(batch, result);
      }
    } catch (error) {
      // 批量签名异常，回退到逐个签名
      console.error('批量签名异常，回退到逐个签名:', error);
      await fallbackToIndividualSigning(batch, result);
    }
  }

  return result;
}

/**
 * 回退到逐个签名
 * @param urls 需要签名的 URL 列表
 * @param result 结果 Map
 */
async function fallbackToIndividualSigning(
  urls: string[],
  result: Map<string, string>
): Promise<void> {
  const signPromises = urls.map(async (url) => {
    const signedUrl = await getSignedUrl(url);
    return { originalUrl: url, signedUrl };
  });

  const signResults = await Promise.all(signPromises);
  
  for (const { originalUrl, signedUrl } of signResults) {
    if (signedUrl) {
      result.set(originalUrl, signedUrl);
    } else {
      // 签名失败，使用原值
      result.set(originalUrl, originalUrl);
    }
  }
}
