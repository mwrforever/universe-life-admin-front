/**
 * STS 凭证缓存服务
 * 采用「惰性缓存 + 30 秒预刷新」单例模式
 */

import type { STSCredential, STSCacheEntry } from '@/types/upload';

/**
 * STS 刷新错误
 * 当 STS 凭证刷新失败时抛出此错误
 */
export class StsRefreshError extends Error {
  readonly cause?: Error;
  
  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = 'StsRefreshError';
    this.cause = options?.cause;
  }
}

/**
 * STS 凭证缓存类
 * 单例模式，全局共享凭证缓存
 * 
 * 注意：凭证由 useCOSUpload 在获取上传 token 时设置，
 * 此类只负责缓存和返回凭证，不主动获取。
 */
class STSCache {
  private cache: Map<string, STSCacheEntry> = new Map();
  private readonly REFRESH_THRESHOLD = 30 * 1000; // 30秒

  /**
   * 生成缓存键
   */
  private getCacheKey(bucket: string, region: string): string {
    return `${bucket}#${region}`;
  }

  /**
   * 检查是否需要刷新凭证
   */
  needsRefresh(entry: STSCacheEntry | undefined): boolean {
    if (!entry) return true;
    return entry.expireAt - Date.now() < this.REFRESH_THRESHOLD;
  }

  /**
   * 设置凭证（由 useCOSUpload 在获取上传 token 后调用）
   */
  setCredential(bucket: string, region: string, credential: STSCredential, expiredTime: number): void {
    this.cache.set(this.getCacheKey(bucket, region), {
      credential,
      expireAt: expiredTime * 1000,
    });
  }

  /**
   * 获取凭证（从缓存中获取）
   * 如果缓存中没有凭证，抛出错误
   */
  async getCredential(bucket: string, region: string): Promise<STSCredential> {
    const cacheKey = this.getCacheKey(bucket, region);
    const cachedEntry = this.cache.get(cacheKey);

    // 如果缓存有效，直接返回
    if (cachedEntry && !this.needsRefresh(cachedEntry)) {
      return cachedEntry.credential;
    }

    // 如果缓存无效或不存在，抛出错误
    // 凭证应该由 useCOSUpload 在调用 getUploadToken 后设置
    throw new StsRefreshError('STS 凭证未初始化或已过期，请重新上传');
  }

  /**
   * 清除指定 bucket/region 的缓存
   */
  clearCache(bucket: string, region: string): void {
    this.cache.delete(this.getCacheKey(bucket, region));
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存状态（调试用）
   */
  getCacheStatus(): { key: string; expireAt: number; remainingMs: number }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expireAt: entry.expireAt,
      remainingMs: entry.expireAt - now,
    }));
  }
}

// 导出单例实例
export const stsCache = new STSCache();
