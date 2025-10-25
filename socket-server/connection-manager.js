/**
 * WebSocket连接管理和资源优化模块
 *
 * 主要功能：
 * 1. 连接池管理
 * 2. 资源限制和优化
 * 3. 连接生命周期管理
 * 4. 性能监控和统计
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class ConnectionManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.maxConnections = options.maxConnections || 5000;
    this.connectionTimeout = options.connectionTimeout || 60000;
    this.heartbeatInterval = options.heartbeatInterval || 25000;
    this.cleanupInterval = options.cleanupInterval || 30000;

    // 连接管理
    this.connections = new Map(); // socket.id -> connection info
    this.userConnections = new Map(); // userId -> Set of socket ids
    this.ipConnections = new Map(); // ip -> Set of socket ids
    this.connectionStats = {
      totalConnections: 0,
      activeConnections: 0,
      rejectedConnections: 0,
      averageLatency: 0
    };

    // 性能统计
    this.messageStats = {
      totalMessages: 0,
      messagesPerSecond: 0,
      lastMinuteMessages: [],
      errors: 0
    };

    // 对象池用于优化内存使用
    this.messagePool = new MessagePool();

    // 启动定时任务
    this.startPeriodicTasks();
  }

  /**
   * 添加新连接
   */
  addConnection(socket, userInfo = {}) {
    const connectionId = socket.id;
    const now = Date.now();

    // 检查连接数限制
    if (this.connections.size >= this.maxConnections) {
      this.connectionStats.rejectedConnections++;
      socket.emit('error', { code: 'MAX_CONNECTIONS', message: '服务器连接数已达上限' });
      socket.disconnect();
      return false;
    }

    // 检查IP连接限制
    const ip = socket.handshake.address;
    const ipConnectionCount = this.ipConnections.get(ip)?.size || 0;
    if (ipConnectionCount >= 10) { // 每个IP最多10个连接
      this.connectionStats.rejectedConnections++;
      socket.emit('error', { code: 'IP_LIMIT', message: '该IP连接数已达上限' });
      socket.disconnect();
      return false;
    }

    // 创建连接信息
    const connectionInfo = {
      id: connectionId,
      socket: socket,
      userId: userInfo.userId || null,
      username: userInfo.username || `user_${connectionId.substr(0, 8)}`,
      ip: ip,
      userAgent: socket.handshake.headers['user-agent'],
      connectedAt: now,
      lastActivity: now,
      latency: 0,
      messageCount: 0,
      roomCount: 0,
      isActive: true
    };

    // 保存连接信息
    this.connections.set(connectionId, connectionInfo);

    // 更新用户连接映射
    if (userInfo.userId) {
      if (!this.userConnections.has(userInfo.userId)) {
        this.userConnections.set(userInfo.userId, new Set());
      }
      this.userConnections.get(userInfo.userId).add(connectionId);
    }

    // 更新IP连接映射
    if (!this.ipConnections.has(ip)) {
      this.ipConnections.set(ip, new Set());
    }
    this.ipConnections.get(ip).add(connectionId);

    // 更新统计信息
    this.connectionStats.totalConnections++;
    this.connectionStats.activeConnections = this.connections.size;

    // 设置socket事件监听
    this.setupSocketEventListeners(socket, connectionInfo);

    // 发送连接确认
    socket.emit('connected', {
      connectionId,
      serverTime: now,
      heartbeatInterval: this.heartbeatInterval
    });

    this.emit('connection:added', connectionInfo);
    return true;
  }

  /**
   * 移除连接
   */
  removeConnection(socketId, reason = 'disconnect') {
    const connectionInfo = this.connections.get(socketId);
    if (!connectionInfo) return;

    const { userId, ip, socket } = connectionInfo;
    const duration = Date.now() - connectionInfo.connectedAt;

    // 清理用户连接映射
    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(socketId);
        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }

    // 清理IP连接映射
    if (ip) {
      const ipSockets = this.ipConnections.get(ip);
      if (ipSockets) {
        ipSockets.delete(socketId);
        if (ipSockets.size === 0) {
          this.ipConnections.delete(ip);
        }
      }
    }

    // 移除连接信息
    this.connections.delete(socketId);
    this.connectionStats.activeConnections = this.connections.size;

    // 清理socket事件监听
    this.cleanupSocketEventListeners(socket);

    this.emit('connection:removed', {
      connectionId: socketId,
      userId,
      duration,
      reason
    });
  }

  /**
   * 设置socket事件监听
   */
  setupSocketEventListeners(socket, connectionInfo) {
    // 心跳检测
    const pingInterval = setInterval(() => {
      if (!connectionInfo.isActive) return;

      const startTime = performance.now();
      socket.emit('ping', startTime);

      // 等待pong响应
      const timeout = setTimeout(() => {
        if (connectionInfo.latency === -1) {
          this.removeConnection(socket.id, 'heartbeat_timeout');
        }
      }, 5000);

      connectionInfo.pingTimeout = timeout;
    }, this.heartbeatInterval);

    socket.on('pong', (startTime) => {
      if (connectionInfo.pingTimeout) {
        clearTimeout(connectionInfo.pingTimeout);
      }
      connectionInfo.latency = performance.now() - startTime;
      connectionInfo.lastActivity = Date.now();
      this.updateLatencyStats(connectionInfo.latency);
    });

    // 消息处理
    socket.on('message', (data) => {
      this.handleMessage(socket, connectionInfo, data);
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      clearInterval(pingInterval);
      if (connectionInfo.pingTimeout) {
        clearTimeout(connectionInfo.pingTimeout);
      }
      this.removeConnection(socket.id, reason);
    });

    // 错误处理
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
      this.messageStats.errors++;
    });

    // 保存定时器引用用于清理
    connectionInfo.pingInterval = pingInterval;
  }

  /**
   * 清理socket事件监听
   */
  cleanupSocketEventListeners(socket) {
    socket.removeAllListeners();
  }

  /**
   * 处理消息
   */
  handleMessage(socket, connectionInfo, data) {
    try {
      // 更新活动时间和消息计数
      connectionInfo.lastActivity = Date.now();
      connectionInfo.messageCount++;

      // 更新消息统计
      this.updateMessageStats();

      // 消息验证和处理
      const processedMessage = this.messagePool.acquire();
      processedMessage.id = this.generateMessageId();
      processedMessage.from = connectionInfo.userId || connectionInfo.id;
      processedMessage.timestamp = Date.now();
      processedMessage.data = data;

      // 发送消息处理事件
      this.emit('message:received', {
        socket: socket,
        connection: connectionInfo,
        message: processedMessage
      });

      // 释放消息对象到池中
      this.messagePool.release(processedMessage);

    } catch (error) {
      console.error('Message handling error:', error);
      this.messageStats.errors++;
      socket.emit('error', { code: 'MESSAGE_ERROR', message: '消息处理失败' });
    }
  }

  /**
   * 更新延迟统计
   */
  updateLatencyStats(latency) {
    const alpha = 0.1; // 平滑因子
    this.connectionStats.averageLatency =
      this.connectionStats.averageLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * 更新消息统计
   */
  updateMessageStats() {
    const now = Date.now();
    this.messageStats.totalMessages++;
    this.messageStats.lastMinuteMessages.push(now);

    // 清理一分钟前的消息记录
    const oneMinuteAgo = now - 60000;
    this.messageStats.lastMinuteMessages =
      this.messageStats.lastMinuteMessages.filter(time => time > oneMinuteAgo);

    this.messageStats.messagesPerSecond = this.messageStats.lastMinuteMessages.length / 60;
  }

  /**
   * 获取用户的所有连接
   */
  getUserConnections(userId) {
    const socketIds = this.userConnections.get(userId);
    if (!socketIds) return [];

    return Array.from(socketIds)
      .map(id => this.connections.get(id))
      .filter(conn => conn && conn.isActive);
  }

  /**
   * 获取活跃连接数
   */
  getActiveConnectionCount() {
    return this.connections.size;
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats() {
    return {
      ...this.connectionStats,
      currentConnections: this.connections.size,
      uniqueUsers: this.userConnections.size,
      uniqueIPs: this.ipConnections.size,
      messageStats: this.messageStats
    };
  }

  /**
   * 清理非活跃连接
   */
  cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = this.connectionTimeout;
    let cleanedCount = 0;

    for (const [socketId, connectionInfo] of this.connections) {
      if (now - connectionInfo.lastActivity > inactiveThreshold) {
        connectionInfo.socket.disconnect();
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} inactive connections`);
    }
  }

  /**
   * 启动定时任务
   */
  startPeriodicTasks() {
    // 清理非活跃连接
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, this.cleanupInterval);

    // 定期输出统计信息
    setInterval(() => {
      const stats = this.getConnectionStats();
      console.log('Connection Stats:', {
        activeConnections: stats.currentConnections,
        uniqueUsers: stats.uniqueUsers,
        messagesPerSecond: stats.messageStats.messagesPerSecond.toFixed(2),
        averageLatency: stats.averageLatency.toFixed(2) + 'ms'
      });
    }, 60000);
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down connection manager...');

    // 关闭所有连接
    for (const [socketId, connectionInfo] of this.connections) {
      connectionInfo.socket.emit('server_shutdown', {
        message: '服务器正在重启，请稍后重连'
      });
      connectionInfo.socket.disconnect();
    }

    // 清理资源
    this.connections.clear();
    this.userConnections.clear();
    this.ipConnections.clear();
    this.messagePool.clear();

    console.log('Connection manager shutdown complete');
  }
}

/**
 * 消息对象池 - 优化内存使用和GC性能
 */
class MessagePool {
  constructor(maxSize = 1000) {
    this.pool = [];
    this.maxSize = maxSize;
    this.createCount = 0;
    this.reuseCount = 0;
  }

  acquire() {
    if (this.pool.length > 0) {
      this.reuseCount++;
      const message = this.pool.pop();
      this.resetMessage(message);
      return message;
    }

    this.createCount++;
    return {
      id: null,
      from: null,
      timestamp: null,
      data: null,
      type: null
    };
  }

  release(message) {
    if (this.pool.length < this.maxSize) {
      this.pool.push(message);
    }
  }

  resetMessage(message) {
    message.id = null;
    message.from = null;
    message.timestamp = null;
    message.data = null;
    message.type = null;
  }

  clear() {
    this.pool = [];
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      createCount: this.createCount,
      reuseCount: this.reuseCount,
      reuseRate: this.reuseCount / (this.createCount + this.reuseCount) * 100
    };
  }
}

module.exports = {
  ConnectionManager,
  MessagePool
};