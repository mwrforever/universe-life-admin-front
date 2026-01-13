/**
 * COS 直传 API 服务类
 * 所有接口通过网关服务访问
 * 
 * 注意：request.ts 的响应拦截器已经返回 response.data，
 * 所以这里的返回类型直接是 ApiResponse<T>
 */

import { post } from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import type {
  UploadTokenRequest,
  UploadTokenResponse,
  UploadDoneRequest,
  UploadDoneResponse,
  DownloadTokenRequest,
  DownloadTokenResponse,
  BatchDownloadTokenRequest,
  BatchDownloadTokenResponse,
} from '@/types/upload';

/**
 * COS 上传 API 服务
 */
export class COSUploadApiService {
  /**
   * 获取上传凭证（支持秒传检测）
   * 
   * 如果 instantUpload=true，表示文件已存在（秒传命中），直接返回 fileId
   * 如果 instantUpload=false，返回 STS 凭证用于上传
   */
  static async getUploadToken(
    params: UploadTokenRequest
  ): Promise<ApiResponse<UploadTokenResponse>> {
    // request.ts 拦截器已返回 response.data，需要通过 unknown 进行类型转换
    return post('/common/upload/token', params) as unknown as Promise<ApiResponse<UploadTokenResponse>>;
  }

  /**
   * 通知后端上传完成
   */
  static async uploadDone(
    params: UploadDoneRequest
  ): Promise<ApiResponse<UploadDoneResponse>> {
    return post('/common/upload/done', params) as unknown as Promise<ApiResponse<UploadDoneResponse>>;
  }

  /**
   * 获取下载凭证
   * @param params.fileUrl 文件地址（文件在正式桶中的 key）
   */
  static async getDownloadToken(
    params: DownloadTokenRequest
  ): Promise<ApiResponse<DownloadTokenResponse>> {
    return post('/common/download/token', params) as unknown as Promise<ApiResponse<DownloadTokenResponse>>;
  }

  /**
   * 批量获取下载凭证
   * 单次最多支持 50 个文件
   * @param params.fileUrls 文件地址列表（最多 50 个）
   */
  static async getBatchDownloadToken(
    params: BatchDownloadTokenRequest
  ): Promise<ApiResponse<BatchDownloadTokenResponse>> {
    return post('/common/download/token/batch', params) as unknown as Promise<ApiResponse<BatchDownloadTokenResponse>>;
  }

  /**
   * 带重试的上传完成通知
   * 使用指数退避策略
   * @param params 上传完成参数
   * @param maxRetries 最大重试次数，默认 3
   * @param baseDelay 基础延迟毫秒数，默认 1000
   */
  static async uploadDoneWithRetry(
    params: UploadDoneRequest,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<ApiResponse<UploadDoneResponse>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadDone(params);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          // 指数退避：delay = baseDelay * 2^attempt
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
