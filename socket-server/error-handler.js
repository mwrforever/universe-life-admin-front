/**
 * 错误处理和重连机制模块
 *
 * 主要功能：
 * 1. 全局错误处理和分类
 * 2. 自动重连和指数退避算法
 * 3. 断线重连状态管理
 * 4. 错误恢复和降级策略
 * 5. 故障转移和健康检查
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class ErrorHandler extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.maxRetries = options.maxRetries || 10;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitterFactor = options.jitterFactor || 0.1;

    // 错误分类
    this.errorTypes = {
      NETWORK_ERROR: 'network_error',
      CONNECTION_ERROR: 'connection_error',
      AUTHENTICATION_ERROR: 'authentication_error',
      RATE_LIMIT_ERROR: 'rate_limit_error',
      SERVER_ERROR: 'server_error',
      CLIENT_ERROR: 'client_error',
      TIMEOUT_ERROR: 'timeout_error',
      UNKNOWN_ERROR: 'unknown_error'
    };

    // 重连状态管理
    this.reconnectionStates = new Map(); // socketId -> reconnection info
    this.globalReconnectState = {
      isReconnecting: false,
      attempt: 0,
      lastAttempt: null,
      nextAttempt: null
    };

    // 错误统计
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      reconnectionAttempts: 0,
      successfulReconnections: 0,
      failedReconnections: 0
    };

    // 健康检查
    this.healthCheckInterval = options.healthCheckInterval || 30000;
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000;
    this.circuitBreakerState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

    // 初始化错误统计
    Object.keys(this.errorTypes).forEach(type => {
      this.errorStats.errorsByType[this.errorTypes[type]] = 0;
    });

    // 启动健康检查
    this.startHealthCheck();
  }

  /**
   * 分类错误类型
   */
  classifyError(error) {
    if (!error) return this.errorTypes.UNKNOWN_ERROR;

    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

    // 网络错误
    if (message.includes('network') || message.includes('enotfound') ||
        message.includes('econnrefused') || message.includes('econnreset') ||
        code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET') {
      return this.errorTypes.NETWORK_ERROR;
    }

    // 连接错误
    if (message.includes('disconnect') || message.includes('connection lost') ||
        code === 'DISCONNECTED') {
      return this.errorTypes.CONNECTION_ERROR;
    }

    // 认证错误
    if (message.includes('unauthorized') || message.includes('authentication') ||
        message.includes('forbidden') || code === 'UNAUTHORIZED') {
      return this.errorTypes.AUTHENTICATION_ERROR;
    }

    // 限流错误
    if (message.includes('rate limit') || message.includes('too many requests') ||
        code === 'RATE_LIMIT') {
      return this.errorTypes.RATE_LIMIT_ERROR;
    }

    // 超时错误
    if (message.includes('timeout') || code === 'TIMEOUT' || code === 'ETIMEDOUT') {
      return this.errorTypes.TIMEOUT_ERROR;
    }

    // 服务器错误
    if (message.includes('server error') || message.includes('internal error') ||
        code >= 500) {
      return this.errorTypes.SERVER_ERROR;
    }

    // 客户端错误
    if (code >= 400 && code < 500) {
      return this.errorTypes.CLIENT_ERROR;
    }

    return this.errorTypes.UNKNOWN_ERROR;
  }

  /**
   * 处理错误
   */
  async handleError(error, context = {}) {
    const errorInfo = {
      timestamp: Date.now(),
      type: this.classifyError(error),
      message: error.message,
      code: error.code,
      stack: error.stack,
      context: context,
      severity: this.getErrorSeverity(error)
    };

    // 更新统计
    this.errorStats.totalErrors++;
    this.errorStats.errorsByType[errorInfo.type]++;

    // 记录错误
    this.logError(errorInfo);

    // 更新熔断器状态
    this.updateCircuitBreaker(errorInfo);

    // 根据错误类型采取不同的处理策略
    switch (errorInfo.type) {
      case this.errorTypes.NETWORK_ERROR:
      case this.errorTypes.CONNECTION_ERROR:
        await this.handleConnectionError(errorInfo, context);
        break;

      case this.errorTypes.AUTHENTICATION_ERROR:
        await this.handleAuthenticationError(errorInfo, context);
        break;

      case this.errorTypes.RATE_LIMIT_ERROR:
        await this.handleRateLimitError(errorInfo, context);
        break;

      case this.errorTypes.TIMEOUT_ERROR:
        await this.handleTimeoutError(errorInfo, context);
        break;

      case this.errorTypes.SERVER_ERROR:
        await this.handleServerError(errorInfo, context);
        break;

      default:
        await this.handleUnknownError(errorInfo, context);
    }

    // 发送错误事件
    this.emit('error:handled', errorInfo);

    return errorInfo;
  }

  /**
   * 处理连接错误
   */
  async handleConnectionError(errorInfo, context) {
    const { socketId, socket } = context;

    if (socketId) {
      // 为特定socket启动重连
      await this.startReconnection(socketId, socket, errorInfo);
    } else {
      // 全局重连
      await this.startGlobalReconnection(errorInfo);
    }
  }

  /**
   * 处理认证错误
   */
  async handleAuthenticationError(errorInfo, context) {
    const { socket } = context;

    if (socket) {
      // 清除认证信息
      socket.authenticated = false;
      socket.userId = null;
      socket.userRole = null;

      // 通知客户端重新认证
      socket.emit('authentication_required', {
        reason: 'authentication_failed',
        message: '认证失败，请重新登录'
      });

      // 断开连接
      setTimeout(() => {
        socket.disconnect();
      }, 5000);
    }

    this.emit('error:authentication', errorInfo);
  }

  /**
   * 处理限流错误
   */
  async handleRateLimitError(errorInfo, context) {
    const { socket } = context;

    if (socket) {
      // 通知客户端限流
      socket.emit('rate_limited', {
        message: '请求过于频繁，请稍后重试',
        retryAfter: this.calculateRetryAfter(errorInfo)
      });

      // 临时禁用发送
      socket.rateLimitedUntil = Date.now() + 60000; // 1分钟
    }

    this.emit('error:rate_limit', errorInfo);
  }

  /**
   * 处理超时错误
   */
  async handleTimeoutError(errorInfo, context) {
    const { socket, operation } = context;

    if (socket) {
      // 通知客户端超时
      socket.emit('operation_timeout', {
        operation: operation || 'unknown',
        message: '操作超时，请重试'
      });
    }

    // 如果是连接超时，尝试重连
    if (errorInfo.message.includes('connection')) {
      await this.handleConnectionError(errorInfo, context);
    }

    this.emit('error:timeout', errorInfo);
  }

  /**
   * 处理服务器错误
   */
  async handleServerError(errorInfo, context) {
    const { socket } = context;

    if (socket) {
      // 通知客户端服务器错误
      socket.emit('server_error', {
        message: '服务器内部错误，我们正在处理',
        code: errorInfo.code
      });
    }

    // 如果是连续的服务器错误，可能需要降级服务
    if (this.shouldDegradeService()) {
      await this.degradeService();
    }

    this.emit('error:server', errorInfo);
  }

  /**
   * 处理未知错误
   */
  async handleUnknownError(errorInfo, context) {
    console.error('Unknown error occurred:', errorInfo);

    const { socket } = context;
    if (socket) {
      socket.emit('unknown_error', {
        message: '发生未知错误，请稍后重试'
      });
    }

    this.emit('error:unknown', errorInfo);
  }

  /**
   * 启动重连
   */
  async startReconnection(socketId, socket, errorInfo) {
    if (this.reconnectionStates.has(socketId)) {
      return; // 已经在重连过程中
    }

    const reconnectState = {
      socketId,
      socket,
      attempt: 0,
      maxAttempts: this.maxRetries,
      lastAttempt: null,
      nextAttempt: Date.now() + this.baseDelay,
      isActive: true,
      errorHistory: [errorInfo]
    };

    this.reconnectionStates.set(socketId, reconnectState);
    this.errorStats.reconnectionAttempts++;

    // 开始重连循环
    this.executeReconnection(socketId);
  }

  /**
   * 执行重连
   */
  async executeReconnection(socketId) {
    const reconnectState = this.reconnectionStates.get(socketId);
    if (!reconnectState || !reconnectState.isActive) return;

    const { socket, attempt, maxAttempts } = reconnectState;

    if (attempt >= maxAttempts) {
      // 重连失败
      await this.reconnectionFailed(socketId);
      return;
    }

    // 等待到下次重连时间
    const now = Date.now();
    if (now < reconnectState.nextAttempt) {
      setTimeout(() => this.executeReconnection(socketId), reconnectState.nextAttempt - now);
      return;
    }

    try {
      reconnectState.attempt++;
      reconnectState.lastAttempt = now;

      // 执行重连逻辑
      await this.performReconnection(socketId, socket);

      // 重连成功
      await this.reconnectionSucceeded(socketId);

    } catch (error) {
      // 重连失败，计算下次重连时间
      const delay = this.calculateReconnectionDelay(reconnectState.attempt);
      reconnectState.nextAttempt = now + delay;
      reconnectState.errorHistory.push(this.classifyError(error));

      console.log(`Reconnection attempt ${reconnectState.attempt} failed for ${socketId}, next attempt in ${delay}ms`);

      // 继续重连
      setTimeout(() => this.executeReconnection(socketId), delay);
    }
  }

  /**
   * 执行实际的重连操作
   */
  async performReconnection(socketId, socket) {
    if (!socket || !socket.connected) {
      throw new Error('Socket is not available for reconnection');
    }

    // 发送重连请求
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Reconnection timeout'));
      }, 10000);

      socket.emit('reconnect_request', { socketId, timestamp: Date.now() }, (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message || 'Reconnection rejected'));
        }
      });
    });
  }

  /**
   * 重连成功
   */
  async reconnectionSucceeded(socketId) {
    const reconnectState = this.reconnectionStates.get(socketId);
    if (!reconnectState) return;

    const { socket } = reconnectState;

    // 清理重连状态
    this.reconnectionStates.delete(socketId);
    this.errorStats.successfulReconnections++;

    // 通知客户端重连成功
    if (socket && socket.connected) {
      socket.emit('reconnection_successful', {
        socketId,
        attempt: reconnectState.attempt,
        timestamp: Date.now()
      });
    }

    this.emit('reconnection:success', { socketId, attempts: reconnectState.attempt });
  }

  /**
   * 重连失败
   */
  async reconnectionFailed(socketId) {
    const reconnectState = this.reconnectionStates.get(socketId);
    if (!reconnectState) return;

    const { socket } = reconnectState;

    // 清理重连状态
    this.reconnectionStates.delete(socketId);
    this.errorStats.failedReconnections++;

    // 通知客户端重连失败
    if (socket) {
      socket.emit('reconnection_failed', {
        socketId,
        totalAttempts: reconnectState.attempt,
        message: '重连失败，请手动刷新页面'
      });

      // 断开连接
      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    }

    this.emit('reconnection:failed', { socketId, attempts: reconnectState.attempt });
  }

  /**
   * 启动全局重连
   */
  async startGlobalReconnection(errorInfo) {
    if (this.globalReconnectState.isReconnecting) return;

    this.globalReconnectState.isReconnecting = true;
    this.globalReconnectState.attempt = 0;
    this.globalReconnectState.lastAttempt = null;

    await this.executeGlobalReconnection();
  }

  /**
   * 执行全局重连
   */
  async executeGlobalReconnection() {
    const state = this.globalReconnectState;

    if (state.attempt >= this.maxRetries) {
      state.isReconnecting = false;
      this.emit('global_reconnection:failed', { attempts: state.attempt });
      return;
    }

    const now = Date.now();
    if (state.nextAttempt && now < state.nextAttempt) {
      setTimeout(() => this.executeGlobalReconnection(), state.nextAttempt - now);
      return;
    }

    try {
      state.attempt++;
      state.lastAttempt = now;

      // 执行全局重连逻辑
      await this.performGlobalReconnection();

      // 全局重连成功
      state.isReconnecting = false;
      this.emit('global_reconnection:success', { attempts: state.attempt });

    } catch (error) {
      const delay = this.calculateReconnectionDelay(state.attempt);
      state.nextAttempt = now + delay;

      console.log(`Global reconnection attempt ${state.attempt} failed, next attempt in ${delay}ms`);

      setTimeout(() => this.executeGlobalReconnection(), delay);
    }
  }

  /**
   * 执行全局重连操作
   */
  async performGlobalReconnection() {
    // 这里可以实现具体的全局重连逻辑
    // 例如：重新连接到消息队列、数据库等
    console.log('Performing global reconnection...');

    // 模拟重连过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 检查重连是否成功
    if (Math.random() > 0.3) { // 70%成功率
      console.log('Global reconnection successful');
    } else {
      throw new Error('Global reconnection failed');
    }
  }

  /**
   * 计算重连延迟（指数退避 + 抖动）
   */
  calculateReconnectionDelay(attempt) {
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1),
      this.maxDelay
    );

    // 添加随机抖动
    const jitter = exponentialDelay * this.jitterFactor * Math.random();
    const delay = exponentialDelay + jitter;

    return Math.floor(delay);
  }

  /**
   * 计算重试时间
   */
  calculateRetryAfter(errorInfo) {
    // 根据错误类型计算重试时间
    switch (errorInfo.type) {
      case this.errorTypes.RATE_LIMIT_ERROR:
        return 60000; // 1分钟
      case this.errorTypes.SERVER_ERROR:
        return 30000; // 30秒
      default:
        return 5000;  // 5秒
    }
  }

  /**
   * 获取错误严重程度
   */
  getErrorSeverity(error) {
    switch (this.classifyError(error)) {
      case this.errorTypes.AUTHENTICATION_ERROR:
      case this.errorTypes.SERVER_ERROR:
        return 'high';
      case this.errorTypes.NETWORK_ERROR:
      case this.errorTypes.CONNECTION_ERROR:
        return 'medium';
      case this.errorTypes.RATE_LIMIT_ERROR:
      case this.errorTypes.TIMEOUT_ERROR:
        return 'low';
      default:
        return 'unknown';
    }
  }

  /**
   * 更新熔断器状态
   */
  updateCircuitBreaker(errorInfo) {
    const { type } = errorInfo;

    // 只有严重错误才会触发熔断器
    if (this.getErrorSeverity(errorInfo) !== 'high') return;

    if (this.circuitBreakerState === 'CLOSED') {
      // 检查是否需要打开熔断器
      const recentErrors = this.getRecentErrors(60000); // 最近1分钟
      if (recentErrors.length >= this.circuitBreakerThreshold) {
        this.circuitBreakerState = 'OPEN';
        this.circuitBreakerOpenedAt = Date.now();

        console.log('Circuit breaker opened due to high error rate');
        this.emit('circuit_breaker:opened', { errors: recentErrors });
      }
    } else if (this.circuitBreakerState === 'OPEN') {
      // 检查是否可以半开
      const timeSinceOpened = Date.now() - this.circuitBreakerOpenedAt;
      if (timeSinceOpened >= this.circuitBreakerTimeout) {
        this.circuitBreakerState = 'HALF_OPEN';
        console.log('Circuit breaker half-open');
        this.emit('circuit_breaker:half_open');
      }
    }
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(timeWindow) {
    // 这里应该从实际的错误日志中获取
    // 简化实现，返回模拟数据
    return [];
  }

  /**
   * 检查是否应该降级服务
 */
  shouldDegradeService() {
    const recentErrors = this.getRecentErrors(300000); // 最近5分钟
    return recentErrors.length >= 10; // 如果5分钟内有10个以上错误
  }

  /**
   * 降级服务
   */
  async degradeService() {
    console.log('Degrading service due to high error rate');

    // 实现服务降级逻辑
    // 例如：禁用非关键功能、降低消息频率等

    this.emit('service:degraded');
  }

  /**
   * 启动健康检查
   */
  startHealthCheck() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck() {
    try {
      const health = {
        timestamp: Date.now(),
        circuitBreakerState: this.circuitBreakerState,
        activeReconnections: this.reconnectionStates.size,
        globalReconnecting: this.globalReconnectState.isReconnecting,
        errorStats: this.errorStats
      };

      // 如果熔断器是半开状态，尝试关闭
      if (this.circuitBreakerState === 'HALF_OPEN') {
        const recentErrors = this.getRecentErrors(60000);
        if (recentErrors.length === 0) {
          this.circuitBreakerState = 'CLOSED';
          console.log('Circuit breaker closed');
          this.emit('circuit_breaker:closed');
        }
      }

      this.emit('health_check', health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  /**
   * 记录错误
   */
  logError(errorInfo) {
    const logLevel = this.getLogLevel(errorInfo.severity);
    console[logLevel](`[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`, {
      timestamp: errorInfo.timestamp,
      context: errorInfo.context,
      stack: errorInfo.stack
    });
  }

  /**
   * 获取日志级别
   */
  getLogLevel(severity) {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'log';
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.errorStats,
      circuitBreakerState: this.circuitBreakerState,
      activeReconnections: this.reconnectionStates.size,
      globalReconnecting: this.globalReconnectState.isReconnecting
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {},
      reconnectionAttempts: 0,
      successfulReconnections: 0,
      failedReconnections: 0
    };

    Object.keys(this.errorTypes).forEach(type => {
      this.errorStats.errorsByType[this.errorTypes[type]] = 0;
    });
  }

  /**
   * 手动触发熔断器
   */
  tripCircuitBreaker() {
    this.circuitBreakerState = 'OPEN';
    this.circuitBreakerOpenedAt = Date.now();
    this.emit('circuit_breaker:opened', { manual: true });
  }

  /**
   * 手动重置熔断器
   */
  resetCircuitBreaker() {
    this.circuitBreakerState = 'CLOSED';
    this.emit('circuit_breaker:reset');
  }
}

module.exports = ErrorHandler;