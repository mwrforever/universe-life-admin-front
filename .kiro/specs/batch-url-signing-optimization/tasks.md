# Implementation Plan: 批量 URL 签名优化

## Overview

实现批量 URL 签名优化、用户详情只读查看和错误提示格式化功能。采用 TypeScript 开发，使用 fast-check 进行属性测试。

## Tasks

- [x] 1. 添加批量签名 API 类型定义和服务
  - [x] 1.1 在 `src/types/upload.ts` 中添加批量签名类型定义
    - 添加 `BatchDownloadTokenRequest` 接口
    - 添加 `BatchDownloadTokenItem` 接口
    - 添加 `BatchDownloadTokenResponse` 接口
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.2 在 `src/services/upload/uploadApi.ts` 中添加批量签名 API 方法
    - 实现 `getBatchDownloadToken` 静态方法
    - 发送 POST 请求到 `/common/download/token/batch`
    - _Requirements: 1.3, 5.4_

- [x] 2. 实现批量签名工具函数
  - [x] 2.1 在 `src/utils/signedUrl.ts` 中添加批量分割函数
    - 实现 `splitIntoBatches` 函数，每批最多 50 个 URL
    - _Requirements: 1.2_

  - [x] 2.2 实现批量签名函数 `batchGetSignedUrlsV2`
    - 过滤不需要签名的 URL
    - 检查缓存，过滤已缓存且未过期的 URL
    - 调用批量签名 API
    - 更新缓存并返回结果 Map
    - 失败时回退到逐个签名
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 2.4_

  - [ ]* 2.3 编写批量分割函数属性测试
    - **Property 2: 大列表正确分批处理**
    - **Validates: Requirements 1.2**

  - [ ]* 2.4 编写批量签名函数属性测试
    - **Property 1: 批量签名返回正确的 Map 结构**
    - **Property 3: 签名结果正确更新缓存**
    - **Property 5: 缓存感知的签名优化**
    - **Validates: Requirements 1.1, 1.4, 1.6, 2.4**

- [x] 3. Checkpoint - 确保批量签名功能测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 实现错误消息格式化器
  - [x] 4.1 创建 `src/utils/errorFormatter.ts` 文件
    - 实现 `formatErrorMessage` 函数
    - 支持每行最多 20 字符
    - 支持最多 5 行
    - 超出部分用省略号替换
    - 正确处理中英文字符
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 编写错误格式化属性测试
    - **Property 7: 错误消息格式化**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

- [x] 5. 集成错误格式化到错误通知服务
  - [x] 5.1 修改 `src/services/error/errorNotificationService.ts`
    - 在 `showError` 方法中调用 `formatErrorMessage`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. 修改分页数据签名处理
  - [x] 6.1 修改 `src/pages/System/UserManagement.tsx` 中的 `signAvatarUrls` 函数
    - 使用 `batchGetSignedUrlsV2` 替代逐个签名
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 6.2 编写分页数据签名属性测试
    - **Property 4: URL 收集和显示数据更新**
    - **Validates: Requirements 2.1, 2.3**

- [x] 7. Checkpoint - 确保分页签名功能测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 8. 实现用户详情只读查看功能
  - [x] 8.1 在 `src/pages/System/UserManagement.tsx` 中添加查看详情功能
    - 在操作列添加"查看详情"按钮
    - 添加 `viewingUser` 状态和 `viewModalVisible` 状态
    - 实现 `handleView` 函数
    - _Requirements: 3.1, 3.2_

  - [x] 8.2 创建用户详情只读弹窗
    - 复用 `useUserDetail` Hook 获取详情
    - 所有字段设置为 disabled 状态
    - 只显示关闭按钮，不显示提交按钮
    - 显示加载状态
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 8.3 编写用户详情只读属性测试
    - **Property 6: 用户详情字段禁用状态**
    - **Validates: Requirements 3.4, 3.5**

- [x] 9. Final Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选测试任务，可根据需要跳过
- 批量签名接口单次最多支持 50 个文件
- 错误格式化需要正确处理中英文混合字符
- 属性测试使用 fast-check 库，每个测试至少 100 次迭代
