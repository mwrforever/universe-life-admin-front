/**
 * COS 文件上传 Hook
 * 封装 cos-js-sdk-v5，支持秒传、断点续传、进度显示、错误重试
 * 
 * 上传流程（符合接口文档）：
 * 1. 计算文件 SHA256 哈希值
 * 2. 调用 /upload/token 获取上传凭证（同时进行秒传检测）
 *    - 如果 instantUpload=true（秒传命中），直接获取 fileId，跳过上传
 *    - 如果 instantUpload=false，继续上传流程
 * 3. 使用 STS 凭证直传文件到 COS 临时桶
 * 4. 上传完成后调用 /upload/done
 * 5. 调用 /download/token 获取签名 URL
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import COS from 'cos-js-sdk-v5';
import { calculateSHA256 } from '@/utils/sha256';
import { stsCache, StsRefreshError } from '@/services/upload/STSCache';
import { COSUploadApiService } from '@/services/upload/uploadApi';
import type {
  UploadTask,
  UploadStatus,
  UseCOSUploadOptions,
  UseCOSUploadReturn,
  STSCredential,
} from '@/types/upload';

// 配置常量
const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const SLICE_SIZE = 8 * 1024 * 1024; // 8MB
const ASYNC_LIMIT = 3;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;

/**
 * 生成唯一任务 ID
 */
function generateTaskId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 生成 UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

/**
 * 生成 UUID 文件名（保留原扩展名）
 */
function generateUUIDFilename(originalFilename: string): string {
  const ext = getFileExtension(originalFilename);
  const uuid = generateUUID();
  return ext ? `${uuid}.${ext}` : uuid;
}

/**
 * COS 文件上传 Hook
 */
export function useCOSUpload(options: UseCOSUploadOptions = {}): UseCOSUploadReturn {
  const {
    bucket: defaultBucket = import.meta.env.VITE_COS_BUCKET || '',
    region: defaultRegion = import.meta.env.VITE_COS_REGION || 'ap-guangzhou',
    onComplete,
    onError,
  } = options;

  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const cosRef = useRef<COS | null>(null);
  const taskControllersRef = useRef<Map<string, { taskId: string; abort: () => void }>>(new Map());
  const pausedTasksRef = useRef<Set<string>>(new Set());
  
  // 使用 ref 存储回调，避免依赖链不稳定
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  
  // 同步更新 ref
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  /**
   * 初始化 COS 实例
   */
  const initCOS = useCallback(() => {
    if (cosRef.current) return cosRef.current;

    cosRef.current = new COS({
      getAuthorization: async (options, callback) => {
        try {
          const credential = await stsCache.getCredential(
            options.Bucket || defaultBucket,
            options.Region || defaultRegion
          );
          callback({
            TmpSecretId: credential.tmpSecretId,
            TmpSecretKey: credential.tmpSecretKey,
            SecurityToken: credential.sessionToken,
            StartTime: Math.floor(Date.now() / 1000),
            ExpiredTime: credential.expiredTime,
          });
        } catch (error) {
          callback(new Error('获取上传凭证失败') as any);
        }
      },
    });
    return cosRef.current;
  }, [defaultBucket, defaultRegion]);

  /**
   * 更新任务状态
   */
  const updateTask = useCallback((taskId: string, updates: Partial<UploadTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  /**
   * 执行上传（核心逻辑）
   * 
   * 流程（符合接口文档）：
   * 1. 计算文件 SHA256 哈希值
   * 2. 调用 /upload/token 获取上传凭证（同时进行秒传检测）
   * 3. 如果 instantUpload=true → 秒传成功，直接使用返回的 fileId
   * 4. 如果 instantUpload=false → 使用凭证上传到 COS → 调用 /upload/done
   * 5. 调用 /download/token 获取签名 URL
   */
  const executeUpload = useCallback(async (task: UploadTask) => {
    console.log('⚡ 开始执行上传任务:', task.id, task.file.name);
    const cos = initCOS();

    updateTask(task.id, { status: 'hashing', startTime: Date.now() });

    try {
      // 1. 计算文件哈希 (进度 0-10%)
      console.log('🔐 正在计算文件哈希...');
      let hash: string;
      try {
        hash = await calculateSHA256(task.file, (progress) => {
          if (progress < 100) {
            updateTask(task.id, { progress: Math.round(progress * 0.1) });
          }
        });
        console.log('🔐 哈希计算完成:', hash);
      } catch (hashError) {
        console.error('❌ 哈希计算失败:', hashError);
        throw hashError;
      }
      updateTask(task.id, { hash, status: 'checking' });

      // 2. 调用 /upload/token 获取上传凭证（同时进行秒传检测）
      // 使用 UUID 文件名替换原文件名
      const uuidFilename = generateUUIDFilename(task.file.name);
      console.log('🎫 正在获取上传凭证...', { originalName: task.file.name, uuidFilename });
      let tokenResponse;
      try {
        tokenResponse = await COSUploadApiService.getUploadToken({
          filename: uuidFilename,  // 使用 UUID 文件名
          size: task.file.size,
          hash,
        });
        console.log('🎫 凭证响应:', tokenResponse);
      } catch (tokenError) {
        console.error('❌ 获取上传凭证失败:', tokenError);
        throw tokenError;
      }

      if (!tokenResponse.data) {
        throw new Error('获取上传凭证失败');
      }

      const { bucket, region, key, credentials, expiredTime, instantUpload, fileId: instantFileId } = tokenResponse.data;
      console.log('📍 存储路径:', { bucket, region, key });
      console.log('⚡ 秒传状态:', { instantUpload, instantFileId });
      updateTask(task.id, { bucket, key });

      // 3. 检查是否秒传命中
      if (instantUpload && instantFileId) {
        // 秒传成功，直接使用返回的 fileId
        console.log('⚡ 秒传命中！文件已存在，跳过上传');
        updateTask(task.id, { progress: 90 });

        // 获取签名后的 URL
        console.log('🔗 获取签名 URL...');
        const downloadTokenResponse = await COSUploadApiService.getDownloadToken({ fileUrl: key });
        const signedUrl = downloadTokenResponse.data?.expiredUrl || '';
        const expireAt = downloadTokenResponse.data?.expireAt;
        console.log('🔗 签名 URL:', signedUrl, '过期时间:', expireAt);

        const completedTask: UploadTask = {
          ...task,
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
          fileId: instantFileId,
          downloadPath: key,  // 正式桶中的 key（用于数据保存）
          signedUrl,          // 签名后的 URL（用于图片显示）
          expireAt,           // 签名过期时间
          key,
        };

        updateTask(task.id, {
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
          fileId: completedTask.fileId,
          downloadPath: completedTask.downloadPath,
          signedUrl: completedTask.signedUrl,
          expireAt: completedTask.expireAt,
          key,
        });
        
        onCompleteRef.current?.(completedTask);
        return;
      }

      // 4. 非秒传，需要上传文件
      if (!credentials || !expiredTime) {
        throw new Error('服务器未返回上传凭证，请稍后重试');
      }

      // 缓存 STS 凭证
      const credentialWithExpiry: STSCredential = {
        ...credentials,
        expiredTime: credentials.expiredTime || expiredTime,
      };
      stsCache.setCredential(bucket, region, credentialWithExpiry, expiredTime);

      // 检查是否已暂停
      if (pausedTasksRef.current.has(task.id)) {
        updateTask(task.id, { status: 'paused' });
        return;
      }

      // 5. 执行上传 (进度 10-95%)
      console.log('📤 开始 COS 上传...');
      updateTask(task.id, { status: 'uploading', progress: 10 });

      await new Promise<void>((resolve, reject) => {
        const uploadConfig = {
          Bucket: bucket,
          Region: region,
          Key: key,
          Body: task.file,
          SliceSize: SLICE_SIZE,
          AsyncLimit: ASYNC_LIMIT,
          onProgress: (progressData: { percent: number }) => {
            console.log('📊 上传进度:', progressData.percent);
            updateTask(task.id, {
              progress: 10 + Math.round(progressData.percent * 85),
            });
          },
          onTaskReady: (cosTaskId: string) => {
            console.log('🎯 COS 任务就绪:', cosTaskId);
            taskControllersRef.current.set(task.id, {
              taskId: cosTaskId,
              abort: () => cos.cancelTask(cosTaskId),
            });
          },
        };

        const callback = (err: any, data: any) => {
          if (err) {
            console.error('❌ COS 上传错误:', err);
            reject(err);
          } else {
            console.log('✅ COS 上传成功:', data);
            resolve();
          }
        };

        // 根据文件大小选择上传方式
        if (task.file.size <= SMALL_FILE_THRESHOLD) {
          console.log('📤 使用 putObject 上传小文件');
          cos.putObject(uploadConfig, callback);
        } else {
          console.log('📤 使用 sliceUploadFile 分片上传大文件');
          cos.sliceUploadFile(uploadConfig, callback);
        }
      });

      // 6. 通知后端上传完成 (进度 95-100%)
      updateTask(task.id, { progress: 95 });
      
      const response = await COSUploadApiService.uploadDoneWithRetry({
        bucket,
        key,
        size: task.file.size,
        hash,
      });

      const { fileId, downloadPath } = response.data!;
      updateTask(task.id, { progress: 97 });

      // 7. 获取签名后的 URL
      console.log('🔗 获取签名 URL...');
      const downloadTokenResponse = await COSUploadApiService.getDownloadToken({ fileUrl: downloadPath });
      const signedUrl = downloadTokenResponse.data?.expiredUrl || '';
      const expireAt = downloadTokenResponse.data?.expireAt;
      console.log('🔗 签名 URL:', signedUrl, '过期时间:', expireAt);

      const completedTask: UploadTask = {
        ...task,
        status: 'completed',
        progress: 100,
        endTime: Date.now(),
        fileId,
        downloadPath,  // 正式桶中的 key（用于数据保存）
        signedUrl,     // 签名后的 URL（用于图片显示）
        expireAt,      // 签名过期时间
        key,
      };

      updateTask(task.id, {
        status: 'completed',
        progress: 100,
        endTime: Date.now(),
        fileId: completedTask.fileId,
        downloadPath: completedTask.downloadPath,
        signedUrl: completedTask.signedUrl,
        expireAt: completedTask.expireAt,
        key,
      });

      onCompleteRef.current?.(completedTask);

    } catch (error) {
      console.error('❌ 上传执行错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateTask(task.id, {
        status: 'failed',
        error: errorMessage,
        endTime: Date.now(),
      });
      onErrorRef.current?.({ ...task, status: 'failed', error: errorMessage }, error as Error);
    } finally {
      taskControllersRef.current.delete(task.id);
    }
  }, [initCOS, updateTask, defaultBucket, defaultRegion]);

  /**
   * 带重试的上传
   */
  const uploadWithRetry = useCallback(async (task: UploadTask, retryCount = 0) => {
    console.log('🔄 开始上传任务:', task.id, '重试次数:', retryCount);
    try {
      await executeUpload(task);
      console.log('✅ 上传任务完成:', task.id);
    } catch (error) {
      console.error('❌ 上传任务失败:', task.id, error);
      // StsRefreshError 不重试
      if (error instanceof StsRefreshError) {
        throw error;
      }
      
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, retryCount);
        console.log(`⏳ ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        await uploadWithRetry(task, retryCount + 1);
      } else {
        throw error;
      }
    }
  }, [executeUpload]);

  /**
   * 添加文件
   */
  const addFiles = useCallback((files: File[]) => {
    console.log('📤 添加文件，数量:', files.length);
    
    const newTasks: UploadTask[] = files.map(file => ({
      id: generateTaskId(),
      file,
      status: 'pending' as UploadStatus,
      progress: 0,
    }));

    console.log('📋 创建任务:', newTasks.map(t => ({ id: t.id, name: t.file.name })));
    setTasks(prev => [...prev, ...newTasks]);
    
    // 开始上传
    newTasks.forEach(task => {
      console.log('🚀 启动上传任务:', task.id);
      uploadWithRetry(task).catch((err) => {
        console.error('❌ 上传失败:', err);
        // 错误已在 executeUpload 中处理
      });
    });
  }, [uploadWithRetry]);

  /**
   * 暂停上传
   */
  const pause = useCallback((taskId: string) => {
    pausedTasksRef.current.add(taskId);
    taskControllersRef.current.get(taskId)?.abort();
    updateTask(taskId, { status: 'paused' });
  }, [updateTask]);

  /**
   * 继续上传
   */
  const resume = useCallback((taskId: string) => {
    pausedTasksRef.current.delete(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task?.status === 'paused') {
      updateTask(taskId, { status: 'pending' });
      uploadWithRetry(task).catch(() => {});
    }
  }, [tasks, updateTask, uploadWithRetry]);

  /**
   * 取消上传
   */
  const cancel = useCallback((taskId: string) => {
    taskControllersRef.current.get(taskId)?.abort();
    pausedTasksRef.current.delete(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  /**
   * 重试上传
   */
  const retry = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.status === 'failed') {
      updateTask(taskId, { status: 'pending', progress: 0, error: undefined });
      uploadWithRetry(task).catch(() => {});
    }
  }, [tasks, updateTask, uploadWithRetry]);

  /**
   * 暂停所有上传
   */
  const pauseAll = useCallback(() => {
    tasks.forEach(task => {
      if (['uploading', 'hashing', 'checking'].includes(task.status)) {
        pause(task.id);
      }
    });
  }, [tasks, pause]);

  /**
   * 继续所有上传
   */
  const resumeAll = useCallback(() => {
    tasks.forEach(task => {
      if (task.status === 'paused') {
        resume(task.id);
      }
    });
  }, [tasks, resume]);

  /**
   * 取消所有上传
   */
  const cancelAll = useCallback(() => {
    tasks.forEach(task => cancel(task.id));
  }, [tasks, cancel]);

  /**
   * 网络状态监听
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      resumeAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      pauseAll();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pauseAll, resumeAll]);

  const isUploading = tasks.some(task =>
    ['pending', 'hashing', 'checking', 'uploading'].includes(task.status)
  );

  return {
    tasks,
    addFiles,
    pause,
    resume,
    cancel,
    retry,
    pauseAll,
    resumeAll,
    cancelAll,
    isUploading,
    isOnline,
  };
}
