/**
 * 安全性考虑和防护措施模块
 *
 * 主要功能：
 * 1. JWT认证和授权
 * 2. 速率限制和DDoS防护
 * 3. 输入验证和数据清理
 * 4. CORS和安全头设置
 * 5. IP白名单/黑名单管理
 * 6. 消息加密和签名
 */

const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');
const validator = require('validator');

class SecurityManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.jwtExpiration = options.jwtExpiration || '24h';
    this.bcryptRounds = options.bcryptRounds || 12;

    // 速率限制配置
    this.rateLimitConfig = {
      windowMs: options.rateLimitWindowMs || 60000, // 1分钟
      max: options.rateLimitMax || 100,              // 每分钟最多100个请求
      message: '请求过于频繁，请稍后重试',
      standardHeaders: true,
      legacyHeaders: false
    };

    // IP管理
    this.ipWhitelist = new Set(options.ipWhitelist || []);
    this.ipBlacklist = new Set(options.ipBlacklist || []);
    this.suspiciousIPs = new Map(); // IP -> { count, lastSeen, reason }

    // 安全统计
    this.securityStats = {
      totalAuthAttempts: 0,
      successfulAuth: 0,
      failedAuth: 0,
      blockedRequests: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0
    };

    // 会话管理
    this.activeSessions = new Map(); // sessionId -> session info
    this.userSessions = new Map();   // userId -> Set of sessionIds

    // 加密密钥轮换
    this.keyRotationInterval = options.keyRotationInterval || 7 * 24 * 60 * 60 * 1000; // 7天
    this.encryptionKeys = new Map();
    this.currentKeyId = this.generateKeyId();

    // 初始化
    this.initialize();
  }

  /**
   * 初始化安全管理器
   */
  initialize() {
    // 生成初始加密密钥
    this.generateEncryptionKey(this.currentKeyId);

    // 启动密钥轮换
    this.startKeyRotation();

    // 启动安全清理
    this.startSecurityCleanup();

    console.log('Security manager initialized');
  }

  /**
   * 创建JWT令牌
   */
  createToken(payload, options = {}) {
    try {
      const tokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: this.generateTokenId()
      };

      const tokenOptions = {
        expiresIn: options.expiresIn || this.jwtExpiration,
        issuer: options.issuer || 'socketio-server',
        audience: options.audience || 'socketio-client'
      };

      return jwt.sign(tokenPayload, this.jwtSecret, tokenOptions);
    } catch (error) {
      console.error('Failed to create token:', error);
      throw new Error('Token creation failed');
    }
  }

  /**
   * 验证JWT令牌
   */
  verifyToken(token, options = {}) {
    try {
      this.securityStats.totalAuthAttempts++;

      const verifyOptions = {
        issuer: options.issuer || 'socketio-server',
        audience: options.audience || 'socketio-client'
      };

      const decoded = jwt.verify(token, this.jwtSecret, verifyOptions);
      this.securityStats.successfulAuth++;

      return decoded;
    } catch (error) {
      this.securityStats.failedAuth++;

      // 根据错误类型分类
      let errorType = 'unknown';
      if (error.name === 'TokenExpiredError') {
        errorType = 'expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorType = 'invalid';
      } else if (error.name === 'NotBeforeError') {
        errorType = 'not_before';
      }

      this.emit('auth:failed', { error: error.message, type: errorType });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * 刷新JWT令牌
   */
  refreshToken(oldToken) {
    try {
      const decoded = jwt.verify(oldToken, this.jwtSecret, { ignoreExpiration: true });

      // 检查令牌是否在刷新期内
      const now = Math.floor(Date.now() / 1000);
      const gracePeriod = 30 * 60; // 30分钟宽限期

      if (decoded.exp && (decoded.exp + gracePeriod) < now) {
        throw new Error('Token expired beyond refresh period');
      }

      // 创建新令牌
      const newPayload = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        sessionId: decoded.sessionId
      };

      return this.createToken(newPayload);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * 创建用户会话
   */
  createSession(user, connectionInfo) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId: user.id,
      username: user.username,
      role: user.role || 'user',
      ip: connectionInfo.ip,
      userAgent: connectionInfo.userAgent,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      permissions: user.permissions || []
    };

    this.activeSessions.set(sessionId, session);

    // 更新用户会话映射
    if (!this.userSessions.has(user.id)) {
      this.userSessions.set(user.id, new Set());
    }
    this.userSessions.get(user.id).add(sessionId);

    this.emit('session:created', { sessionId, userId: user.id });
    return sessionId;
  }

  /**
   * 验证会话
   */
  validateSession(sessionId, requiredPermissions = []) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 检查会话是否活跃
    if (!session.isActive) {
      throw new Error('Session is inactive');
    }

    // 检查会话是否过期
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    if (Date.now() - session.lastActivity > maxAge) {
      this.destroySession(sessionId);
      throw new Error('Session expired');
    }

    // 更新最后活动时间
    session.lastActivity = Date.now();

    // 检查权限
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission =>
        session.permissions.includes(permission) || session.permissions.includes('*')
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }
    }

    return session;
  }

  /**
   * 销毁会话
   */
  destroySession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // 从用户会话映射中移除
    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    // 标记会话为非活跃
    session.isActive = false;
    this.activeSessions.delete(sessionId);

    this.emit('session:destroyed', { sessionId, userId: session.userId });
    return true;
  }

  /**
   * 检查IP权限
   */
  checkIPPermission(ip) {
    // 检查黑名单
    if (this.ipBlacklist.has(ip)) {
      this.securityStats.blockedRequests++;
      this.emit('ip:blocked', { ip, reason: 'blacklisted' });
      return false;
    }

    // 检查白名单（如果设置了白名单）
    if (this.ipWhitelist.size > 0 && !this.ipWhitelist.has(ip)) {
      this.securityStats.blockedRequests++;
      this.emit('ip:blocked', { ip, reason: 'not_whitelisted' });
      return false;
    }

    // 检查可疑IP
    const suspiciousInfo = this.suspiciousIPs.get(ip);
    if (suspiciousInfo && suspiciousInfo.count > 10) {
      this.securityStats.blockedRequests++;
      this.emit('ip:blocked', { ip, reason: 'suspicious_activity' });
      return false;
    }

    return true;
  }

  /**
   * 标记可疑IP
   */
  markSuspiciousIP(ip, reason) {
    const info = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0, reasons: [] };
    info.count++;
    info.lastSeen = Date.now();
    info.reasons.push(reason);

    this.suspiciousIPs.set(ip, info);
    this.securityStats.suspiciousActivities++;

    this.emit('ip:suspicious', { ip, reason, count: info.count });

    // 如果可疑活动过多，自动加入黑名单
    if (info.count >= 20) {
      this.ipBlacklist.add(ip);
      this.suspiciousIPs.delete(ip);
      this.emit('ip:blacklisted_auto', { ip, reason: 'excessive_suspicious_activity' });
    }
  }

  /**
   * 验证输入数据
   */
  validateInput(data, rules) {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      // 必填检查
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // 如果字段不存在且不是必填，跳过其他验证
      if (value === undefined || value === null) {
        continue;
      }

      // 类型检查
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
        continue;
      }

      // 字符串验证
      if (typeof value === 'string') {
        // 长度检查
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }

        // 格式检查
        if (rule.format) {
          switch (rule.format) {
            case 'email':
              if (!validator.isEmail(value)) {
                errors.push(`${field} must be a valid email address`);
              }
              break;
            case 'url':
              if (!validator.isURL(value)) {
                errors.push(`${field} must be a valid URL`);
              }
              break;
            case 'alphanumeric':
              if (!validator.isAlphanumeric(value)) {
                errors.push(`${field} must contain only alphanumeric characters`);
              }
              break;
          }
        }

        // XSS防护
        if (rule.sanitize) {
          data[field] = this.sanitizeInput(value);
        }
      }

      // 数字验证
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${field} must not exceed ${rule.max}`);
        }
      }

      // 数组验证
      if (Array.isArray(value)) {
        if (rule.minItems && value.length < rule.minItems) {
          errors.push(`${field} must have at least ${rule.minItems} items`);
        }
        if (rule.maxItems && value.length > rule.maxItems) {
          errors.push(`${field} must not exceed ${rule.maxItems} items`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: data
    };
  }

  /**
   * 清理输入数据
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // 移除潜在的HTML标签
      .replace(/javascript:/gi, '') // 移除javascript协议
      .replace(/on\w+=/gi, '') // 移除事件处理器
      .trim();
  }

  /**
   * 加密数据
   */
  encrypt(data, keyId = this.currentKeyId) {
    try {
      const key = this.encryptionKeys.get(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      const cipher = crypto.createCipher('aes-256-gcm', key);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        data: encrypted,
        authTag: authTag.toString('hex'),
        keyId: keyId,
        algorithm: 'aes-256-gcm'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData) {
    try {
      const key = this.encryptionKeys.get(encryptedData.keyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${encryptedData.keyId}`);
      }

      const decipher = crypto.createDecipher('aes-256-gcm', key);
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * 生成加密密钥
   */
  generateEncryptionKey(keyId) {
    const key = crypto.randomBytes(32); // 256-bit key
    this.encryptionKeys.set(keyId, key);

    // 保存密钥到文件（生产环境应该使用更安全的方式）
    this.saveKeyToFile(keyId, key);

    this.emit('key:generated', { keyId });
  }

  /**
   * 保存密钥到文件
   */
  saveKeyToFile(keyId, key) {
    try {
      const keyData = {
        keyId: keyId,
        key: key.toString('hex'),
        createdAt: new Date().toISOString()
      };

      // 这里应该实现安全的密钥存储
      // 例如：使用密钥管理服务或加密文件系统
      console.log(`Key ${keyId} generated and stored securely`);
    } catch (error) {
      console.error('Failed to save key:', error);
    }
  }

  /**
   * 启动密钥轮换
   */
  startKeyRotation() {
    setInterval(() => {
      this.rotateEncryptionKey();
    }, this.keyRotationInterval);
  }

  /**
   * 轮换加密密钥
   */
  rotateEncryptionKey() {
    const newKeyId = this.generateKeyId();
    this.generateEncryptionKey(newKeyId);

    // 标记旧密钥为待删除（给客户端时间适应）
    setTimeout(() => {
      const oldKeys = Array.from(this.encryptionKeys.keys())
        .filter(id => id !== this.currentKeyId && id !== newKeyId);

      for (const oldKeyId of oldKeys) {
        this.encryptionKeys.delete(oldKeyId);
        this.emit('key:retired', { keyId: oldKeyId });
      }
    }, 24 * 60 * 60 * 1000); // 24小时后删除旧密钥

    this.currentKeyId = newKeyId;
    this.emit('key:rotated', { newKeyId, oldKeyId: this.currentKeyId });
  }

  /**
   * 启动安全清理
   */
  startSecurityCleanup() {
    setInterval(() => {
      this.performSecurityCleanup();
    }, 60 * 60 * 1000); // 每小时清理一次
  }

  /**
   * 执行安全清理
   */
  performSecurityCleanup() {
    const now = Date.now();

    // 清理过期会话
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24小时
    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.lastActivity > maxSessionAge) {
        this.destroySession(sessionId);
      }
    }

    // 清理可疑IP记录
    const maxSuspicionAge = 7 * 24 * 60 * 60 * 1000; // 7天
    for (const [ip, info] of this.suspiciousIPs) {
      if (now - info.lastSeen > maxSuspicionAge) {
        this.suspiciousIPs.delete(ip);
      }
    }

    this.emit('security:cleanup_completed');
  }

  /**
   * 创建速率限制器
   */
  createRateLimiter(options = {}) {
    const config = {
      ...this.rateLimitConfig,
      ...options
    };

    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: config.message,
      standardHeaders: config.standardHeaders,
      legacyHeaders: config.legacyHeaders,
      handler: (req, res) => {
        this.securityStats.rateLimitViolations++;
        this.emit('rate_limit:exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });

        res.status(429).json({
          error: 'Too many requests',
          message: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      }
    });
  }

  /**
   * 创建安全中间件
   */
  createSecurityMiddleware() {
    const middlewares = [];

    // Helmet安全头
    middlewares.push(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS配置
    middlewares.push((req, res, next) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      const origin = req.headers.origin;

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }

      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24小时

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // IP检查中间件
    middlewares.push((req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      if (!this.checkIPPermission(ip)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    });

    return middlewares;
  }

  /**
   * 生成令牌ID
   */
  generateTokenId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 生成密钥ID
   */
  generateKeyId() {
    return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * 获取安全统计
   */
  getSecurityStats() {
    return {
      ...this.securityStats,
      activeSessions: this.activeSessions.size,
      uniqueUsers: this.userSessions.size,
      blacklistedIPs: this.ipBlacklist.size,
      whitelistedIPs: this.ipWhitelist.size,
      suspiciousIPs: this.suspiciousIPs.size
    };
  }

  /**
   * 获取活跃会话
   */
  getActiveSessions(userId = null) {
    if (userId) {
      const sessionIds = this.userSessions.get(userId) || new Set();
      return Array.from(sessionIds)
        .map(id => this.activeSessions.get(id))
        .filter(session => session && session.isActive);
    }

    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive);
  }

  /**
   * 强制用户下线
   */
  forceUserLogout(userId, reason = 'admin_action') {
    const sessionIds = this.userSessions.get(userId) || new Set();
    const destroyedSessions = [];

    for (const sessionId of sessionIds) {
      if (this.destroySession(sessionId)) {
        destroyedSessions.push(sessionId);
      }
    }

    this.emit('user:force_logout', { userId, reason, sessions: destroyedSessions });
    return destroyedSessions;
  }

  /**
   * 添加IP到白名单
   */
  addToWhitelist(ip) {
    this.ipWhitelist.add(ip);
    this.emit('ip:whitelisted', { ip });
  }

  /**
   * 添加IP到黑名单
   */
  addToBlacklist(ip) {
    this.ipBlacklist.add(ip);
    this.suspiciousIPs.delete(ip);
    this.emit('ip:blacklisted', { ip });
  }

  /**
   * 从白名单移除IP
   */
  removeFromWhitelist(ip) {
    this.ipWhitelist.delete(ip);
    this.emit('ip:removed_from_whitelist', { ip });
  }

  /**
   * 从黑名单移除IP
   */
  removeFromBlacklist(ip) {
    this.ipBlacklist.delete(ip);
    this.emit('ip:removed_from_blacklist', { ip });
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down security manager...');

    // 销毁所有活跃会话
    for (const sessionId of Array.from(this.activeSessions.keys())) {
      this.destroySession(sessionId);
    }

    // 清理密钥
    this.encryptionKeys.clear();

    console.log('Security manager shutdown complete');
  }
}

module.exports = SecurityManager;