# Design Document: 批量 URL 签名优化

## Overview

本设计文档描述了批量 URL 签名优化、用户详情只读查看和错误提示格式化的技术实现方案。主要目标是通过批量 API 调用减少网络请求次数，提升页面加载性能，同时增强用户体验。

## Architecture

### 系统架构图

```mermaid
graph TB
    subgraph Frontend
        UC[UserManagement Component]
        BS[Batch Signing Service]
        SC[Signed URL Cache]
        EF[Error Formatter]
        UDV[User Detail Viewer]
    end
    
    subgraph Backend API
        BA[/api/common/download/token/batch]
        SA[/api/common/download/token]
        UA[/api/user/detail]
    end
    
    UC -->|1. Fetch paginated data| UC
    UC -->|2. Collect URLs| BS
    BS -->|3. Check cache| SC
    BS -->|4. Batch sign request| BA
    BA -->|5. Signed URLs| BS
    BS -->|6. Update cache| SC
    BS -->|7. Return signed URLs| UC
    
    UC -->|View details| UDV
    UDV -->|Fetch user detail| UA
    
    UC -->|Error handling| EF
    EF -->|Formatted message| UC
```

### 数据流

1. 页面加载时获取分页数据
2. 从响应中收集需要签名的文件 URL
3. 检查本地缓存，过滤已缓存且未过期的 URL
4. 将需要签名的 URL 分批（每批最多 50 个）发送到批量签名接口
5. 接收签名结果并更新本地缓存
6. 将签名后的 URL 更新到显示数据中

## Components and Interfaces

### 1. 批量签名服务 (Batch Signing Service)

位置: `src/utils/signedUrl.ts`

```typescript
/**
 * 批量获取签名 URL（使用批量接口）
 * @param fileUrls 文件 URL 列表
 * @returns Map<原始URL, 签名URL>
 */
export async function batchGetSignedUrlsV2(
  fileUrls: string[]
): Promise<Map<string, string>>;

/**
 * 将 URL 列表分割成批次
 * @param urls URL 列表
 * @param batchSize 每批大小，默认 50
 * @returns 分批后的 URL 数组
 */
export function splitIntoBatches(
  urls: string[],
  batchSize?: number
): string[][];
```

### 2. API 服务扩展

位置: `src/services/upload/uploadApi.ts`

```typescript
/**
 * 批量获取下载凭证
 * @param params.fileUrls 文件地址列表（最多 50 个）
 */
static async getBatchDownloadToken(
  params: BatchDownloadTokenRequest
): Promise<ApiResponse<BatchDownloadTokenResponse>>;
```

### 3. 错误格式化器 (Error Formatter)

位置: `src/utils/errorFormatter.ts`

```typescript
/**
 * 格式化错误消息
 * @param message 原始错误消息
 * @param options 格式化选项
 * @returns 格式化后的消息
 */
export function formatErrorMessage(
  message: string,
  options?: ErrorFormatOptions
): string;

interface ErrorFormatOptions {
  maxCharsPerLine?: number;  // 默认 20
  maxLines?: number;         // 默认 5
  ellipsis?: string;         // 默认 "..."
}
```

### 4. 用户详情查看器

位置: `src/pages/System/UserManagement.tsx`

新增只读查看模式，复用现有的 `useUserDetail` Hook。

## Data Models

### 批量签名请求/响应类型

位置: `src/types/upload.ts`

```typescript
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
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 批量签名返回正确的 Map 结构

*For any* list of file URLs (up to 50), the batch signing function SHALL return a Map where each input URL that needs signing has a corresponding signed URL entry, and URLs that don't need signing are returned unchanged.

**Validates: Requirements 1.1, 1.6**

### Property 2: 大列表正确分批处理

*For any* list of file URLs with length N > 50, the batch splitting function SHALL produce ceil(N/50) batches, where each batch has at most 50 URLs and the total URLs across all batches equals N.

**Validates: Requirements 1.2**

### Property 3: 签名结果正确更新缓存

*For any* batch signing response, all items in the response SHALL be cached with the correct expiration time, and subsequent cache lookups for those URLs SHALL return the cached signed URLs.

**Validates: Requirements 1.4**

### Property 4: URL 收集和显示数据更新

*For any* paginated data response containing file URLs, the system SHALL correctly identify all URLs that need signing, and after signing, the display data SHALL contain the signed URLs in the correct positions.

**Validates: Requirements 2.1, 2.3**

### Property 5: 缓存感知的签名优化

*For any* list of file URLs where some are already cached and not expired, the batch signing service SHALL only request signatures for uncached or expired URLs, and the final result SHALL include both cached and newly signed URLs.

**Validates: Requirements 2.4**

### Property 6: 用户详情字段禁用状态

*For any* user detail displayed in view mode, all form fields SHALL be in disabled state and no submit/save buttons SHALL be present.

**Validates: Requirements 3.4, 3.5**

### Property 7: 错误消息格式化

*For any* error message string, the formatted output SHALL have:
- Each line with at most 20 characters
- At most 5 lines total
- An ellipsis appended if content was truncated
- Correct handling of both Chinese and English characters

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

## Error Handling

### 批量签名错误处理

1. **网络错误**: 批量签名失败时，回退到逐个签名
2. **部分失败**: 如果批量响应中某些 URL 签名失败，使用原始 URL
3. **超时处理**: 设置合理的请求超时时间（10 秒）

### 用户详情加载错误

1. **加载失败**: 显示错误提示，允许用户重试
2. **网络超时**: 显示超时提示

### 错误消息格式化

1. **空消息**: 返回空字符串
2. **特殊字符**: 保留原始特殊字符

## Testing Strategy

### 单元测试

1. **批量分割函数测试**
   - 测试空列表
   - 测试小于 50 的列表
   - 测试正好 50 的列表
   - 测试大于 50 的列表

2. **错误格式化函数测试**
   - 测试短消息（不需要截断）
   - 测试长消息（需要截断）
   - 测试中英文混合消息
   - 测试边界情况

3. **用户详情查看器测试**
   - 测试只读模式下所有字段禁用
   - 测试没有提交按钮

### 属性测试

使用 fast-check 库进行属性测试，每个属性测试至少运行 100 次迭代。

1. **Property 1**: 生成随机 URL 列表，验证返回 Map 结构正确
2. **Property 2**: 生成随机长度列表，验证分批逻辑正确
3. **Property 3**: 模拟批量响应，验证缓存更新正确
4. **Property 5**: 生成混合缓存状态的 URL 列表，验证优化逻辑
5. **Property 7**: 生成随机错误消息，验证格式化规则

### 测试配置

```typescript
// 属性测试配置
const propertyTestConfig = {
  numRuns: 100,  // 最少 100 次迭代
  verbose: true,
};
```

### 测试标签格式

每个属性测试必须包含注释标签：
```typescript
// Feature: batch-url-signing-optimization, Property 1: 批量签名返回正确的 Map 结构
// Validates: Requirements 1.1, 1.6
```
