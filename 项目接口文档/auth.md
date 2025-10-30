# 万象生活管理系统 - 认证接口文档

## API 概述

本文档描述了万象生活管理系统的认证相关接口，包括用户注册、登录、忘记密码等功能。所有接口遵循 RESTful API 设计规范。

### 基础信息
- **Base URL**: `https://api.wanxiang.com/v1`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **认证方式**: Bearer Token (JWT)

### 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据内容
  },
  "message": "操作成功",
  "timestamp": "2025-10-29T08:30:00.000Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "field": "field_name", // 可选，字段验证错误时使用
    "details": {} // 可选，详细错误信息
  },
  "timestamp": "2025-10-29T08:30:00.000Z",
  "path": "/api/v1/auth/login"
}
```

---

## 1. 用户注册

### 1.1 用户注册
- **URL**: `POST /auth/register`
- **描述**: 用户注册新账号

#### 请求参数
```json
{
  "username": "string", // 用户名，3-20个字符
  "email": "string", // 邮箱地址
  "phone": "string", // 手机号（中国大陆格式）
  "password": "string", // 密码，8-50个字符
  "confirmPassword": "string", // 确认密码
  "gender": "male|female|other", // 性别
  "age": "number", // 年龄
  "address": "string", // 地址
  "agreement": "boolean" // 用户协议同意状态
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "testuser",
      "email": "test@example.com",
      "phone": "138****1234",
      "role": "merchant",
      "status": "pending_verification",
      "createdAt": "2025-10-29T08:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 3600
    }
  },
  "message": "注册成功"
}
```

#### 错误代码
- `VALIDATION_ERROR`: 参数验证失败
- `USERNAME_ALREADY_EXISTS`: 用户名已存在
- `EMAIL_ALREADY_EXISTS`: 邮箱已存在
- `PHONE_ALREADY_EXISTS`: 手机号已存在
- `WEAK_PASSWORD`: 密码强度不够

---

## 2. 用户认证

### 2.1 账号密码登录
- **URL**: `POST /auth/login`
- **描述**: 使用用户名/手机号/邮箱和密码登录

#### 请求参数
```json
{
  "identifier": "string", // 用户名/手机号/邮箱
  "password": "string", // 密码
  "remember": "boolean" // 记住登录状态
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "testuser",
      "email": "test@example.com",
      "phone": "138****1234",
      "role": "admin|merchant|worker",
      "avatar": "https://example.com/avatar.jpg",
      "lastLoginAt": "2025-10-29T08:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 3600
    }
  },
  "message": "登录成功"
}
```

#### 错误代码
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `USER_NOT_FOUND`: 用户不存在
- `USER_DISABLED`: 账号被禁用
- `ACCOUNT_NOT_VERIFIED`: 账号未验证

### 2.2 验证码登录
- **URL**: `POST /auth/login/code`
- **描述**: 使用手机号或邮箱验证码登录

#### 请求参数
```json
{
  "phone": "string", // 手机号（手机号登录时必填）
  "email": "string", // 邮箱（邮箱登录时必填）
  "code": "string", // 6位数字验证码
  "remember": "boolean"
}
```

#### 响应示例
同账号密码登录响应格式

#### 错误代码
- `INVALID_CODE`: 验证码错误或已过期
- `CODE_EXPIRED`: 验证码已过期
- `RATE_LIMIT_EXCEEDED`: 请求频率超限

---

## 3. 验证码管理

### 3.1 发送验证码
- **URL**: `POST /auth/send-code`
- **描述**: 发送手机或邮箱验证码

#### 请求参数
```json
{
  "target": "string", // 手机号或邮箱
  "type": "login|register|reset_password" // 验证码类型
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "cooldown": 60, // 冷却时间（秒）
    "expiresIn": 600 // 验证码有效期（秒）
  },
  "message": "验证码已发送"
}
```

#### 错误代码
- `CODE_SEND_FAILED`: 验证码发送失败
- `RATE_LIMIT_EXCEEDED`: 请求频率超限
- `INVALID_TARGET`: 手机号或邮箱格式错误

### 3.2 验证验证码
- **URL**: `POST /auth/verify-code`
- **描述**: 验证手机或邮箱验证码

#### 请求参数
```json
{
  "target": "string", // 手机号或邮箱
  "code": "string", // 6位数字验证码
  "type": "login|register|reset_password"
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "verified": true,
    "verifyToken": "temporary-token" // 临时验证令牌
  },
  "message": "验证成功"
}
```

---

## 4. 密码管理

### 4.1 忘记密码 - 身份验证
- **URL**: `POST /auth/forgot-password/verify`
- **描述**: 忘记密码时验证用户身份

#### 请求参数
```json
{
  "method": "password|phone|email", // 验证方式
  "identifier": "string", // 用户标识（用户名/手机号/邮箱）
  "currentPassword": "string", // 当前密码（method=password时必填）
  "verificationCode": "string" // 验证码（method=phone/email时必填）
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "resetToken": "password-reset-token",
    "expiresIn": 1800 // 重置令牌有效期（秒）
  },
  "message": "身份验证成功"
}
```

#### 错误代码
- `INVALID_CURRENT_PASSWORD`: 当前密码错误
- `INVALID_CODE`: 验证码错误
- `RESET_TOKEN_EXPIRED`: 重置令牌已过期

### 4.2 重置密码
- **URL**: `POST /auth/reset-password`
- **描述**: 设置新密码

#### 请求参数
```json
{
  "token": "string", // 重置令牌
  "newPassword": "string", // 新密码
  "confirmPassword": "string" // 确认新密码
}
```

#### 响应示例
```json
{
  "success": true,
  "data": null,
  "message": "密码重置成功"
}
```

#### 错误代码
- `INVALID_RESET_TOKEN`: 重置令牌无效
- `TOKEN_EXPIRED`: 重置令牌已过期
- `WEAK_PASSWORD`: 密码强度不够

### 4.3 修改密码
- **URL**: `POST /auth/change-password`
- **描述**: 已登录用户修改密码
- **认证**: 需要 Bearer Token

#### 请求参数
```json
{
  "currentPassword": "string", // 当前密码
  "newPassword": "string", // 新密码
  "confirmPassword": "string" // 确认新密码
}
```

#### 响应示例
```json
{
  "success": true,
  "data": null,
  "message": "密码修改成功"
}
```

---

## 5. 令牌管理

### 5.1 刷新令牌
- **URL**: `POST /auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌

#### 请求参数
```json
{
  "refreshToken": "string" // 刷新令牌
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token",
    "expiresIn": 3600
  },
  "message": "令牌刷新成功"
}
```

#### 错误代码
- `TOKEN_EXPIRED`: 刷新令牌已过期
- `TOKEN_INVALID`: 刷新令牌无效

### 5.2 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 用户登出，使令牌失效
- **认证**: 需要 Bearer Token

#### 请求参数
```json
{
  "allDevices": "boolean" // 是否登出所有设备
}
```

#### 响应示例
```json
{
  "success": true,
  "data": null,
  "message": "登出成功"
}
```

---

## 6. 第三方登录

### 6.1 获取第三方授权链接
- **URL**: `GET /auth/{platform}/authorize`
- **描述**: 获取第三方平台授权链接
- **路径参数**: `platform` - `wechat|qq|alipay|weibo`

#### 查询参数
```
?redirect_uri=https://example.com/callback&state=random_string
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "authorizeUrl": "https://platform.com/authorize?params...",
    "state": "random_string"
  },
  "message": "授权链接生成成功"
}
```

### 6.2 第三方登录回调
- **URL**: `POST /auth/{platform}/callback`
- **描述**: 处理第三方登录回调
- **路径参数**: `platform` - `wechat|qq|alipay|weibo`

#### 请求参数
```json
{
  "code": "string", // 授权码
  "state": "string", // 状态参数
  "redirectUri": "string" // 回调地址
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "用户名",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "merchant",
      "provider": "wechat", // 第三方平台
      "providerId": "platform-user-id" // 平台用户ID
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 3600
    }
  },
  "message": "第三方登录成功"
}
```

#### 错误代码
- `OAUTH_ERROR`: 第三方授权失败
- `USER_NOT_FOUND`: 用户不存在
- `ACCOUNT_NOT_LINKED`: 账号未关联

---

## 7. 用户信息

### 7.1 获取用户信息
- **URL**: `GET /users/profile`
- **描述**: 获取当前登录用户的详细信息
- **认证**: 需要 Bearer Token

#### 响应示例
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "138****1234",
    "gender": "male",
    "age": 25,
    "address": "北京市朝阳区",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "verificationLevel": "verified",
    "statistics": {
      "totalOrders": 100,
      "totalRevenue": 50000.00,
      "rating": 4.8
    },
    "bankAccounts": [
      {
        "id": "uuid",
        "bankName": "中国银行",
        "accountNumber": "****1234",
        "isDefault": true
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-10-29T08:30:00.000Z",
    "lastLoginAt": "2025-10-29T08:30:00.000Z",
    "status": "active",
    "role": "merchant"
  },
  "message": "获取用户信息成功"
}
```

### 7.2 更新用户信息
- **URL**: `PUT /users/profile`
- **描述**: 更新用户基本信息
- **认证**: 需要 Bearer Token

#### 请求参数
```json
{
  "username": "string", // 可选
  "gender": "male|female|other", // 可选
  "age": "number", // 可选
  "address": "string", // 可选
  "bio": "string", // 可选
  "avatar": "string" // 可选，头像URL
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    // 更新后的用户信息
  },
  "message": "用户信息更新成功"
}
```

---

## 8. 邮箱验证

### 8.1 发送邮箱验证邮件
- **URL**: `POST /auth/send-verification-email`
- **描述**: 发送邮箱验证邮件
- **认证**: 需要 Bearer Token

#### 请求参数
```json
{
  "email": "string" // 邮箱地址
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "expiresIn": 86400 // 验证链接有效期（秒）
  },
  "message": "验证邮件已发送"
}
```

### 8.2 验证邮箱
- **URL**: `POST /auth/verify-email`
- **描述**: 验证邮箱地址

#### 请求参数
```json
{
  "token": "string" // 邮箱验证令牌
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "verified": true
  },
  "message": "邮箱验证成功"
}
```

---

## 9. 安全规范

### 9.1 密码安全要求
- **长度**: 8-50个字符
- **复杂度**: 必须包含以下四种类型中的至少三种：
  - 小写字母 (a-z)
  - 大写字母 (A-Z)
  - 数字 (0-9)
  - 特殊字符 (!@#$%^&*()_+-=[]{}|;:,.<>?)
- **禁用**: 常见弱密码、个人信息相关的密码

### 9.2 验证码安全
- **格式**: 6位数字
- **有效期**: 10分钟
- **发送限制**: 同一手机号/邮箱60秒内只能发送一次
- **每日限制**: 同一手机号/邮箱每日最多发送10次

### 9.3 令牌管理
- **访问令牌**: 有效期1小时
- **刷新令牌**: 有效期30天
- **令牌格式**: JWT (JSON Web Token)
- **加密算法**: RS256 或 HS256

### 9.4 API安全
- **传输协议**: HTTPS 强制要求
- **请求频率限制**: 每IP每分钟最多100次请求
- **数据验证**: 所有输入数据严格验证和过滤
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出数据转义处理

---

## 10. 错误代码完整列表

### 认证相关错误
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `USER_NOT_FOUND`: 用户不存在
- `USER_DISABLED`: 用户账号被禁用
- `ACCOUNT_NOT_VERIFIED`: 账号未验证
- `TOKEN_EXPIRED`: 令牌已过期
- `TOKEN_INVALID`: 令牌无效
- `TOKEN_REVOKED`: 令牌已撤销
- `INSUFFICIENT_PERMISSIONS`: 权限不足

### 验证相关错误
- `VALIDATION_ERROR`: 数据验证失败
- `EMAIL_ALREADY_EXISTS`: 邮箱已存在
- `PHONE_ALREADY_EXISTS`: 手机号已存在
- `USERNAME_ALREADY_EXISTS`: 用户名已存在
- `WEAK_PASSWORD`: 密码强度不够
- `INVALID_CODE`: 验证码错误或已过期
- `CODE_EXPIRED`: 验证码已过期
- `CODE_SEND_FAILED`: 验证码发送失败

### 业务相关错误
- `RATE_LIMIT_EXCEEDED`: 请求频率超限
- `ACCOUNT_LOCKED`: 账号被锁定
- `SERVICE_UNAVAILABLE`: 服务暂时不可用
- `MAINTENANCE_MODE`: 系统维护中
- `INVALID_REQUEST`: 请求格式错误
- `UNSUPPORTED_OPERATION`: 不支持的操作

---

## 11. 开发和测试

### 11.1 开发环境
- **Base URL**: `https://dev-api.wanxiang.com/v1`
- **测试账号**:
  - 管理员: admin@test.com / Test123456!
  - 商户: merchant@test.com / Test123456!
  - 工人: worker@test.com / Test123456!

### 11.2 测试用例
接口测试用例请参考项目根目录下的 `tests/api/auth.test.js` 文件。

### 11.3 SDK支持
我们提供以下语言的官方SDK：
- JavaScript/TypeScript
- Java
- Python
- Go

---

## 12. 更新日志

### v1.0.0 (2025-10-29)
- 初始版本发布
- 实现用户注册、登录、密码管理功能
- 支持第三方登录集成
- 完整的安全验证机制

---

## 13. 联系方式

如有任何问题或建议，请联系：
- **技术支持**: api-support@wanxiang.com
- **商务合作**: business@wanxiang.com
- **Bug反馈**: https://github.com/wanxiang/issues

---

*本文档最后更新时间: 2025-10-29*