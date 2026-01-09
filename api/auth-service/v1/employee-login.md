# 员工登录接口说明

## 接口概述

本项目提供两种员工登录方式：

1. **密码登录**: 员工使用用户名和密码进行登录认证
2. **验证码登录**: 员工使用验证码进行登录认证，无需输入密码

两种登录方式均基于 **OAuth2 Password 模式**实现，成功后下发 JWT 格式的 Access Token 和 Refresh Token。

---claudecl

## 1. 员工密码登录

### 接口信息

**接口名称**: 员工密码登录
**接口功能**: 员工使用用户名和密码进行登录认证，成功后下发 OAuth2 令牌
**接口路径**: `/employee/login/password`
**请求方法**: `POST`
**Content-Type**: `application/json`

### 请求地址

#### 开发环境（通过 Vite 代理访问）

**前端请求路径**:
```
POST /api/employee/login/password
```

**代理转发路径**:
```
POST http://localhost:8099/employee/login/password
```

> **重要说明**:
> - 前端请求 `/api/employee/login/password`
> - Vite 代理会去掉 `/api` 前缀，转发到 `http://localhost:8099/employee/login/password`
> - 这样可以解决跨域问题，并且路径更清晰

### 请求参数

#### Headers

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| Content-Type | String | 是 | 请求内容类型 | application/json |

#### Body 参数

| 参数名 | 类型 | 必填 | 说明 | 验证规则 | 示例值 |
|--------|------|------|------|----------|--------|
| username | String | 是 | 用户名 | 4-16 个字符 | `testuser` |
| password | String | 是 | 密码 | 6-20 个字符 | `password123` |

### 请求示例

#### cURL

```bash
curl -X POST http://localhost:8099/employee/login/password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### JavaScript (Fetch)

```javascript
fetch('http://localhost:8099/employee/login/password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### JavaScript (Axios)

```javascript
axios.post('http://localhost:8099/employee/login/password', {
  username: 'testuser',
  password: 'password123'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data));
```

### 响应结果

#### 成功响应

**HTTP Status Code**: `200 OK`

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTczNTQ4ODAwMDAsImlhdCI6MTczNTQ4MDgwMDAsInNjb3BlcyIpbInJlYWQiLCJ3cml0ZSJdfQ.signed-token-here",
    "refreshToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTczNjA5MjgwMDAsImlhdCI6MTczNTQ4MDgwMDAsInNjb3BlcyIpbInJlYWQiLCJ3cml0ZSJdfQ.signed-refresh-token-here",
    "expiresIn": "1735488000000",
    "tokenType": "Bearer"
  },
  "timestamp": 1735480800000
}
```

#### 错误响应

**1. 用户名或密码错误**

**HTTP Status Code**: `200 OK` (业务错误)

```json
{
  "code": 0,
  "message": "用户名或密码错误",
  "data": null,
  "timestamp": 1735480800000
}
```

**2. 参数校验失败**

**HTTP Status Code**: `400 Bad Request`

```json
{
  "code": 0,
  "message": "用户名不能为空",
  "data": null,
  "timestamp": 1735480800000
}
```

**3. 系统错误**

**HTTP Status Code**: `500 Internal Server Error`

```json
{
  "code": 0,
  "message": "登录失败",
  "data": null,
  "timestamp": 1735480800000
}
```

---

## 2. 员工验证码登录

### 接口信息

**接口名称**: 员工验证码登录
**接口功能**: 员工使用验证码进行登录认证，无需输入密码，成功后下发 OAuth2 令牌
**接口路径**: `/employee/login/captcha`
**请求方法**: `POST`
**Content-Type**: `application/json`

### 请求地址

#### 开发环境（通过 Vite 代理访问）

**前端请求路径**:
```
POST /api/employee/login/captcha
```

**代理转发路径**:
```
POST http://localhost:8099/employee/login/captcha
```

> **重要说明**:
> - 前端请求 `/api/employee/login/captcha`
> - Vite 代理会去掉 `/api` 前缀，转发到 `http://localhost:8099/employee/login/captcha`
> - 这样可以解决跨域问题，并且路径更清晰

### 请求参数

#### Headers

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| Content-Type | String | 是 | 请求内容类型 | application/json |

#### Body 参数

| 参数名 | 类型 | 必填 | 说明 | 验证规则 | 示例值 |
|--------|------|------|------|----------|--------|
| identification | String | 是 | 用户标识（用户名/手机号/邮箱） | 4-50 个字符 | `testuser@example.com` |
| captcha | String | 是 | 验证码 | 4-8 个字符 | `123456` |
| captchaUsageType | Integer | 是 | 验证码使用类型 | 枚举值：1, 2, 3 等 | `1` |

#### CaptchaUsageType 枚举值说明

| 枚举值 | 显示名称 | 描述 | 使用场景 |
|--------|----------|------|----------|
| `1` | `login` | 安全登录验证 | 用户登录 |
| `2` | `register` | 用户注册验证 | 新用户注册 |
| `3` | `reset_password` | 密码重置验证 | 忘记密码 |
| `4` | `bind_email` | 邮箱绑定验证 | 绑定邮箱 |
| `5` | `unbind_email` | 邮箱解绑验证 | 解绑邮箱 |
| `6` | `modify_pay_password` | 支付密码修改验证 | 修改支付密码 |

> **注意**: 本接口主要用于登录场景，建议使用 `captchaUsageType = 1`

### 请求示例

#### cURL

```bash
curl -X POST http://localhost:8099/employee/login/captcha \
  -H "Content-Type: application/json" \
  -d '{
    "identification": "testuser@example.com",
    "captcha": "123456",
    "captchaUsageType": 1
  }'
```

#### JavaScript (Fetch)

```javascript
fetch('http://localhost:8099/employee/login/captcha', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    identification: 'testuser@example.com',
    captcha: '123456',
    captchaUsageType: 1
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### JavaScript (Axios)

```javascript
axios.post('http://localhost:8099/employee/login/captcha', {
  identification: 'testuser@example.com',
  captcha: '123456',
  captchaUsageType: 1
}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data));
```

### 响应结果

#### 成功响应

**HTTP Status Code**: `200 OK`

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImV4cCI6MTczNTQ4ODAwMDAsImlhdCI6MTczNTQ4MDgwMDAsInNjb3BlcyIpbInJlYWQiLCJ3cml0ZSJdfQ.signed-token-here",
    "refreshToken": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImV4cCI6MTczNjA5MjgwMDAsImlhdCI6MTczNTQ4MDgwMDAsInNjb3BlcyIpbInJlYWQiLCJ3cml0ZSJdfQ.signed-refresh-token-here",
    "expiresIn": "1735488000000",
    "tokenType": "Bearer"
  },
  "timestamp": 1735480800000
}
```

#### 错误响应

**1. 验证码错误或已过期**

**HTTP Status Code**: `200 OK` (业务错误)

```json
{
  "code": 0,
  "message": "验证码错误或已过期",
  "data": null,
  "timestamp": 1735480800000
}
```

**原因**:
- 验证码输入错误
- 验证码已超过有效期（通常 5 分钟）
- 验证码已被使用

**解决方案**:
- 提示用户重新获取验证码
- 检查验证码是否输入正确

**2. 用户不存在**

**HTTP Status Code**: `200 OK` (业务错误)

```json
{
  "code": 0,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1735480800000
}
```

**原因**:
- 输入的用户标识（用户名/手机号/邮箱）在系统中不存在

**解决方案**:
- 提示用户先注册账号
- 或使用其他登录方式（如密码登录）

**3. 参数校验失败**

**HTTP Status Code**: `400 Bad Request`

```json
{
  "code": 0,
  "message": "用户标识不能为空",
  "data": null,
  "timestamp": 1735480800000
}
```

**常见参数校验错误**:

| 错误消息 | 原因 | 解决方案 |
|----------|------|----------|
| 用户标识不能为空 | identification 字段为空 | 确保传入用户标识 |
| 验证码不能为空 | captcha 字段为空 | 确保传入验证码 |
| 验证码使用类型不能为空 | captchaUsageType 字段为空 | 确保传入验证码类型 |
| 用户标识长度必须在4-50之间 | identification 长度不符合要求 | 检查用户标识长度 |
| 验证码长度必须在4-8之间 | captcha 长度不符合要求 | 检查验证码长度 |

**4. 系统错误**

**HTTP Status Code**: `500 Internal Server Error`

```json
{
  "code": 0,
  "message": "验证码登录失败",
  "data": null,
  "timestamp": 1735480800000
}
```

**原因**: 服务器内部错误

**解决方案**:
- 联系系统管理员
- 或稍后重试

---

## 响应字段说明

### 顶层字段

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| code | Integer | 响应状态码 | `1` (成功) / `0` (失败) |
| message | String | 响应消息 | `success` / 错误描述 |
| data | Object | 响应数据 | 见下方 data 字段说明 |
| timestamp | Long | 响应时间戳（毫秒） | `1735480800000` |

### data 字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| accessToken | String | 访问令牌（JWT 格式） | `eyJhbGciOiJSUzI1NiJ9...` |
| refreshToken | String | 刷新令牌（JWT 格式） | `eyJhbGciOiJSUzI1NiJ9...` |
| expiresIn | String | 令牌过期时间（毫秒时间戳） | `1735488000000` |
| tokenType | String | 令牌类型 | `Bearer` |

---

## 状态码说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

### 业务状态码 (code)

| code | message | 说明 |
|------|---------|------|
| 1 | success | 登录成功 |
| 0 | 用户名或密码错误 | 密码登录认证失败 |
| 0 | 验证码错误或已过期 | 验证码校验失败 |
| 0 | 用户不存在 | 用户不存在 |
| 0 | 登录失败 / 验证码登录失败 | 其他登录失败 |

---

## 使用说明

### 1. 获取令牌

登录成功后，会在响应的 `data.accessToken` 字段返回访问令牌。

### 2. 使用令牌

在后续需要认证的接口请求中，需要在 HTTP Header 中添加：

```
Authorization: Bearer {accessToken}
```

示例：

```bash
curl -X POST http://localhost:8099/api/resource \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiJ9..."
```

### 3. 令牌刷新

访问令牌过期后，可以使用 `refreshToken` 调用刷新接口获取新的访问令牌（具体刷新接口待实现）。

---

## 与密码登录的对比

| 特性 | 密码登录 | 验证码登录 |
|------|----------|------------|
| **接口路径** | `/employee/login/password` | `/employee/login/captcha` |
| **认证方式** | 用户名 + 密码 | 用户标识 + 验证码 |
| **安全性** | 中等（依赖密码强度） | 高（验证码有时效性） |
| **用户体验** | 需要记忆密码 | 无需记忆密码 |
| **适用场景** | 标准登录 | 忘记密码/临时登录 |
| **Token 格式** | 完全相同 | 完全相同 |
| **Token 权限** | 完全相同 | 完全相同 |

> **注意**: 两种登录方式生成的 Token 格式和权限完全相同，可以无缝切换使用。

---

## 业务场景

### 密码登录适用场景

1. **日常登录**: 标准的登录方式，适用于大多数场景
2. **长期使用**: 用户记忆密码，频繁使用
3. **内部员工**: 适用于内部可信应用

### 验证码登录适用场景

1. **忘记密码**: 用户忘记密码时，可以使用验证码快速登录
2. **临时登录**: 不方便输入密码的场景，如公共设备
3. **快速登录**: 提升用户体验，减少输入步骤
4. **安全登录**: 相比密码，验证码有时效性限制，更加安全

### 验证码登录不适用场景

1. **首次登录**: 新用户需要先注册账号
2. **无手机/邮箱**: 用户未绑定手机号或邮箱时无法使用
3. **频繁登录**: 验证码有发送频率限制，不适合频繁登录

---

## 安全建议

### 1. 密码传输安全

- **HTTPS 传输**: 生产环境中，密码必须通过 HTTPS 加密传输
- **密码强度**: 建议要求密码包含大小写字母、数字和特殊字符
- **密码存储**: 服务端使用 BCrypt 加密存储

### 2. 验证码安全

#### 验证码有效期
- 验证码有效期：**5 分钟**（可在系统配置中调整）
- 验证码使用后立即失效
- 同一验证码只能使用一次

#### 验证码发送频率限制
- 同一手机号/邮箱：**1 分钟内最多发送 1 次**
- 同一 IP 地址：**1 分钟内最多发送 5 次**
- 同一设备：**1 天内最多发送 10 次**

#### 验证码错误次数限制
- 同一手机号/邮箱：**1 小时内最多尝试 5 次**
- 超过限制后：**锁定 30 分钟**

### 3. 令牌有效期

- **Access Token 有效期**: 2 小时
- **Refresh Token 有效期**: 7 天

### 4. 令牌存储建议

- 建议将 `accessToken` 存储在内存中（如 Vuex/Pinia store）
- 建议将 `refreshToken` 存储在 `localStorage` 中（用于刷新令牌）
- 避免将密码存储在本地

### 5. 登录失败防护

- 建议启用登录失败次数限制，防止暴力破解
- 登录失败后不应提示用户名或密码具体哪一项错误
- 前端不要明文显示密码

### 6. 令牌过期处理

- 建议在前端设置定时器，在令牌过期前 5 分钟自动刷新
- 如果返回 `401 Unauthorized`，应引导用户重新登录

---

## 业务流程图

### 密码登录流程

```
┌─────────┐                 ┌──────────────┐                 ┌─────────────┐
│  前端   │                 │  授权服务     │                 │  OAuth2     │
│ (App)   │                 │ (Auth Service)│                 │  Token Store │
└────┬────┘                 └──────┬───────┘                 └──────┬──────┘
     │                             │                                 │
     │  1. POST /employee/login/password           │
     │     {username, password}                     │
     │─────────────────────────────────────────────>│
     │                             │                                 │
     │                             │  2. 验证用户名密码                │
     │                             │  3. 生成 Access Token           │
     │                             │  4. 生成 Refresh Token         │
     │                             │───────────────────────────────>│
     │                             │                                 │  5. 保存授权记录
     │                             │<────────────────────────────────│
     │                             │
     │  6. 返回 {accessToken, refreshToken}         │
     │<─────────────────────────────────────────────│
     │                             │
     │  7. 存储 accessToken & refreshToken           │
     │                             │
     ▼                             ▼                                 ▼
```

### 验证码登录流程

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐
│  前端   │         │  授权服务     │         │  验证码服务  │
│ (App)   │         │ (Auth Service)│         │(Captcha)    │
└────┬────┘         └──────┬───────┘         └──────┬──────┘
     │                     │                        │
     │ 1. 点击获取验证码    │                        │
     │─────────────────────>│                        │
     │                     │ 2. 生成验证码            │
     │                     │──────────────────────────>│
     │                     │                        │
     │                     │ 3. 发送验证码            │
     │                     │<─────────────────────────│
     │                     │                        │
     │ 4. 显示验证码输入框  │                        │
     │<─────────────────────│                        │
     │                     │                        │
     │ 5. 输入验证码并登录 │                        │
     │─────────────────────>│                        │
     │                     │ 6. 校验验证码            │
     │                     │──────────────────────────>│
     │                     │<─────────────────────────│
     │                     │ 7. 加载用户信息          │
     │                     │ 8. 生成 Access Token     │
     │                     │ 9. 生成 Refresh Token    │
     │                     │ 10. 保存授权记录         │
     │                     │────────────┐            │
     │                     │            │            │
     │ 11. 返回 Token       │            ▼            │
     │<─────────────────────│                        │
     │                     │                        │
     │ 12. 存储 Token       │                        │
     │                     │                        │
     ▼                     ▼                        ▼
```

---

## 相关接口

### 发送验证码接口

验证码登录前需要先调用发送验证码接口：

**前端请求路径**:
```
POST /api/common/captcha/send
```

**代理转发路径**:
```
POST http://localhost:8101/api/common/captcha/send
```

> **重要说明**:
> - 前端请求 `/api/common/captcha/send`
> - Vite 代理会保留 `/api` 前缀，转发到 `http://localhost:8101/api/common/captcha/send`
> - 与登录接口不同，发送验证码需要走网关服务（8101端口）

**请求参数**:
```json
{
  "identification": "test@example.com",
  "usageType": 1
}
```

**参数说明**:
- `identification`: 用户标识（手机号/邮箱）
- `usageType`: 验证码用途类型，`1` 表示登录验证

---

### 其他相关接口

- [令牌刷新接口](./token-refresh.md) - 刷新访问令牌（待实现）
- [用户注销接口](./logout.md) - 用户登出（待实现）

---

## 常见问题

### Q1: 密码登录时为什么会提示"用户名或密码错误"？

**A**: 可能的原因：
1. 用户名输入错误
2. 密码输入错误
3. 用户账号不存在
4. 用户账号已被禁用

**解决方案**: 请检查用户名和密码是否正确，或联系系统管理员。

---

### Q2: 验证码一直提示"错误或已过期"怎么办？

**A**: 请检查以下几点：
1. 验证码是否输入正确（注意大小写）
2. 验证码是否已超过 5 分钟有效期
3. 验证码是否已被使用过（验证码只能使用一次）
4. 确认 `captchaUsageType` 是否正确（登录使用 `1`）

---

### Q3: 为什么会提示"用户不存在"？

**A**: 验证码登录使用 `identification` 字段查找用户，可能是以下原因：
1. 输入的手机号/邮箱未在系统中注册
2. 输入的用户名不正确
3. 用户账号已被禁用或删除

**解决方案**: 请先注册账号，或使用密码登录方式。

---

### Q4: 两种登录方式的 Token 有什么区别？

**A**: **没有区别**。两种登录方式：
- 使用相同的客户端配置
- 使用相同的 Token 生成逻辑
- 生成的 Token 格式、权限、有效期完全相同
- 可以互相替换使用

---

### Q5: 应该选择哪种登录方式？

**A**: 根据场景选择：
- **日常使用**: 推荐密码登录，方便快捷
- **忘记密码**: 使用验证码登录
- **临时登录**: 在公共设备上使用验证码登录更安全
- **安全要求高**: 验证码登录更安全，但需要接收验证码

---

## 更新日志

| 版本 | 日期 | 说明 | 作者 |
|------|------|------|------|
| 1.0.0 | 2025-12-29 | 初始版本，整合密码登录和验证码登录 | 毛伟然 |

---

## 附录

### CaptchaUsageType 枚举完整定义

```java
public enum CaptchaUsageType {
    LOGIN(1, "login", "安全登录验证"),
    REGISTER(2, "register", "用户注册验证"),
    RESET_PASSWORD(3, "reset_password", "密码重置验证"),
    BIND_EMAIL(4, "bind_email", "邮箱绑定验证"),
    UNBIND_EMAIL(5, "unbind_email", "邮箱解绑验证"),
    MODIFY_PAYMENT_PASSWORD(6, "modify_pay_password", "支付密码修改验证");

    private final Integer value;
    private final String displayName;
    private final String description;
}
```

### 验证码存储机制

验证码存储在 Redis 中，Key 格式：

```
AUTH:USER:CAPTCHA:{usageType}:{identification}:{field}
```

例如：
- `AUTH:USER:CAPTCHA:login:test@example.com:identification` - 存储验证码
- `AUTH:USER:CAPTCHA:login:test@example.com:issuer` - 存储授权标识

**验证码校验流程**：
1. 用户输入验证码
2. 系统从 Redis 中获取存储的验证码
3. 比对用户输入的验证码与存储的验证码是否一致
4. 验证通过后，立即删除 Redis 中的验证码（一次性使用）

### OAuth2 Password 模式说明

本接口使用 OAuth2 的 Password 模式进行认证，这是 OAuth2 标准定义的一种授权方式：

- **适用场景**: 适用于高度可信的应用，如官方客户端、内部管理系统等
- **优点**: 简化认证流程，用户体验好
- **缺点**: 需要用户直接提供密码给客户端，因此仅适用于可信的第一方应用

**注意事项**: 本接口仅适用于内部员工登录，不适用于第三方应用。
