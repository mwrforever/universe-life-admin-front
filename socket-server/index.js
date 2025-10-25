/**
 * Socket.IO高并发服务器主入口
 *
 * 集成所有模块：
 * 1. 连接管理
 * 2. 房间管理
 * 3. 消息队列
 * 4. 错误处理
 * 5. 内存管理
 * 6. 监控系统
 * 7. 安全管理
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 导入自定义模块
const ConnectionManager = require('./connection-manager');
const RoomManager = require('./room-manager');
const MessageQueueManager = require('./message-queue');
const ErrorHandler = require('./error-handler');
const MemoryManager = require('./memory-manager');
const MonitoringSystem = require('./monitoring');
const SecurityManager = require('./security');

class SocketIOServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3001,
      host: options.host || '0.0.0.0',
      env: process.env.NODE_ENV || 'development',
      serverId: process.env.SERVER_ID || `server-${Date.now()}`,
      ...options
    };

    // 初始化Express应用
    this.app = express();
    this.server = http.createServer(this.app);

    // 初始化Socket.IO
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: false
    });

    // 初始化管理器
    this.initializeManagers();

    // 设置路由和中间件
    this.setupMiddleware();
    this.setupRoutes();

    // 启动服务器
    this.startServer();

    // 设置优雅关闭
    this.setupGracefulShutdown();
  }

  /**
   * 初始化所有管理器
   */
  async initializeManagers() {
    try {
      // 初始化安全管理器
      this.securityManager = new SecurityManager({
        jwtSecret: process.env.JWT_SECRET,
        ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
        ipBlacklist: process.env.IP_BLACKLIST?.split(',') || []
      });

      // 初始化监控系统
      this.monitoring = new MonitoringSystem({
        metricsInterval: 10000,
        alertThresholds: {
          cpuUsage: 80,
          memoryUsage: 85,
          responseTime: 1000,
          errorRate: 5,
          connectionCount: 4500
        }
      });

      // 初始化内存管理器
      this.memoryManager = new MemoryManager({
        maxMemoryUsage: 0.8,
        gcInterval: 30000,
        objectPoolMaxSize: 1000,
        cacheMaxSize: 10000
      });

      // 初始化错误处理器
      this.errorHandler = new ErrorHandler({
        maxRetries: 10,
        baseDelay: 1000,
        maxDelay: 30000
      });

      // 初始化消息队列管理器
      this.messageQueue = new MessageQueueManager({
        rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/socketio'
      });

      // 初始化房间管理器
      this.roomManager = new RoomManager({
        maxRoomSize: 100,
        maxShards: 10,
        shardThreshold: 200,
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      this.roomManager.setIO(this.io);

      // 初始化连接管理器
      this.connectionManager = new ConnectionManager({
        maxConnections: 5000,
        connectionTimeout: 60000,
        heartbeatInterval: 25000
      });

      // 设置事件监听
      this.setupEventListeners();

      console.log('All managers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize managers:', error);
      process.exit(1);
    }
  }

  /**
   * 设置中间件
   */
  setupMiddleware() {
    // 安全中间件
    const securityMiddleware = this.securityManager.createSecurityMiddleware();
    securityMiddleware.forEach(middleware => this.app.use(middleware));

    // 基础中间件
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 速率限制
    const rateLimiter = this.securityManager.createRateLimiter();
    this.app.use('/api/', rateLimiter);

    // 请求日志
    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.monitoring.recordHttpRequest(
          req.method,
          req.path,
          res.statusCode,
          duration
        );
      });

      next();
    });
  }

  /**
   * 设置路由
   */
  setupRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        serverId: this.options.serverId,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: this.connectionManager.getActiveConnectionCount(),
        rooms: this.roomManager.getStats().totalRooms
      };

      res.json(health);
    });

    // Prometheus指标
    this.app.get('/metrics', (req, res) => {
      const metrics = this.monitoring.exportPrometheusMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    });

    // API路由
    this.app.get('/api/stats', (req, res) => {
      const stats = {
        connections: this.connectionManager.getConnectionStats(),
        rooms: this.roomManager.getStats(),
        queue: this.messageQueue.getStats(),
        memory: this.memoryManager.getDetailedStats(),
        security: this.securityManager.getSecurityStats(),
        monitoring: this.monitoring.getRealTimeMetrics()
      };

      res.json(stats);
    });

    // 认证接口
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { username, password } = req.body;

        // 输入验证
        const validation = this.securityManager.validateInput(req.body, {
          username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
          password: { required: true, type: 'string', minLength: 6, maxLength: 100 }
        });

        if (!validation.isValid) {
          return res.status(400).json({
            error: 'Validation failed',
            details: validation.errors
          });
        }

        // 这里应该实现真实的用户认证逻辑
        const user = { id: '123', username, role: 'user', permissions: ['read', 'write'] };

        // 创建JWT令牌
        const token = this.securityManager.createToken({
          userId: user.id,
          username: user.username,
          role: user.role
        });

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      } catch (error) {
        this.errorHandler.handleError(error, { ip: req.ip, endpoint: '/api/auth/login' });
        res.status(500).json({ error: 'Authentication failed' });
      }
    });

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // Socket.IO连接事件
    this.io.on('connection', (socket) => {
      this.handleSocketConnection(socket);
    });

    // 错误处理事件
    this.errorHandler.on('error:handled', (errorInfo) => {
      this.monitoring.incrementCounter('app_errors_total', {
        type: errorInfo.type,
        severity: errorInfo.severity
      });
    });

    // 内存管理事件
    this.memoryManager.on('memory:high_usage', (data) => {
      console.warn('High memory usage detected:', data);
      this.monitoring.setGaugeValue('system_memory_usage_percent', data.usage * 100);
    });

    // 监控告警事件
    this.monitoring.on('alert:triggered', (alert) => {
      console.warn('Alert triggered:', alert);
      // 这里可以集成通知系统（邮件、短信等）
    });

    // 安全事件
    this.securityManager.on('auth:failed', (data) => {
      this.monitoring.incrementCounter('app_errors_total', {
        type: 'authentication',
        severity: 'medium'
      });
    });

    this.securityManager.on('rate_limit:exceeded', (data) => {
      this.monitoring.incrementCounter('app_errors_total', {
        type: 'rate_limit',
        severity: 'low'
      });
    });

    // 消息队列事件
    this.messageQueue.on('message:received', (data) => {
      this.monitoring.observeHistogram('websocket_message_duration_ms', Date.now() - data.message.timestamp);
    });

    // 房间管理事件
    this.roomManager.on('user:joined_room', (data) => {
      this.monitoring.incrementCounter('room_operations_total', { operation: 'join' });
    });

    this.roomManager.on('user:left_room', (data) => {
      this.monitoring.incrementCounter('room_operations_total', { operation: 'leave' });
    });

    // 进程异常处理
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.errorHandler.handleError(error, { type: 'uncaught_exception' });
      this.gracefulShutdown('SIGTERM');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.errorHandler.handleError(reason, { type: 'unhandled_rejection' });
    });
  }

  /**
   * 处理Socket.IO连接
   */
  async handleSocketConnection(socket) {
    const startTime = Date.now();

    try {
      // IP检查
      const ip = socket.handshake.address;
      if (!this.securityManager.checkIPPermission(ip)) {
        socket.emit('error', { code: 'ACCESS_DENIED', message: '访问被拒绝' });
        socket.disconnect();
        return;
      }

      // 认证检查
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.emit('authentication_required');
        socket.disconnect();
        return;
      }

      let decoded;
      try {
        decoded = this.securityManager.verifyToken(token);
      } catch (error) {
        socket.emit('authentication_failed', { message: error.message });
        socket.disconnect();
        return;
      }

      // 创建用户会话
      const session = this.securityManager.createSession(decoded, {
        ip: ip,
        userAgent: socket.handshake.headers['user-agent']
      });

      // 添加连接到连接管理器
      const connectionSuccess = this.connectionManager.addConnection(socket, {
        userId: decoded.userId,
        username: decoded.username,
        sessionId: session.id
      });

      if (!connectionSuccess) {
        socket.disconnect();
        return;
      }

      // 记录连接
      this.monitoring.recordWebSocketConnection('connected');
      this.monitoring.setGaugeValue('websocket_connections_current', this.connectionManager.getActiveConnectionCount());

      // 设置socket事件处理
      this.setupSocketEventHandlers(socket, decoded, session);

      // 发送连接成功消息
      socket.emit('connected', {
        serverId: this.options.serverId,
        sessionId: session.id,
        timestamp: Date.now()
      });

      console.log(`User ${decoded.username} connected from ${ip} in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('Connection handling error:', error);
      this.errorHandler.handleError(error, { socketId: socket.id, ip: socket.handshake.address });
      socket.disconnect();
    }
  }

  /**
   * 设置Socket事件处理器
   */
  setupSocketEventHandlers(socket, user, session) {
    // 加入房间
    socket.on('join_room', async (data) => {
      try {
        this.monitoring.startTimer('room_join_operation');

        const validation = this.securityManager.validateInput(data, {
          roomId: { required: true, type: 'string', minLength: 1, maxLength: 100 },
          roomName: { type: 'string', maxLength: 100 }
        });

        if (!validation.isValid) {
          socket.emit('error', { code: 'INVALID_INPUT', details: validation.errors });
          return;
        }

        const roomId = await this.roomManager.joinRoom(socket, data.roomId, {
          userId: user.userId,
          username: user.username,
          role: user.role
        });

        const duration = this.monitoring.endTimer('room_join_operation');
        socket.emit('room_joined', { roomId, duration });

      } catch (error) {
        this.errorHandler.handleError(error, { socketId: socket.id, userId: user.userId });
        socket.emit('error', { code: 'ROOM_JOIN_FAILED', message: error.message });
      }
    });

    // 离开房间
    socket.on('leave_room', async (data) => {
      try {
        const validation = this.securityManager.validateInput(data, {
          roomId: { required: true, type: 'string' }
        });

        if (!validation.isValid) {
          socket.emit('error', { code: 'INVALID_INPUT', details: validation.errors });
          return;
        }

        await this.roomManager.leaveRoom(socket, data.roomId);
        socket.emit('room_left', { roomId: data.roomId });

      } catch (error) {
        this.errorHandler.handleError(error, { socketId: socket.id, userId: user.userId });
        socket.emit('error', { code: 'ROOM_LEAVE_FAILED', message: error.message });
      }
    });

    // 发送消息
    socket.on('send_message', async (data) => {
      try {
        this.monitoring.startTimer('message_send_operation');

        const validation = this.securityManager.validateInput(data, {
          roomId: { required: true, type: 'string' },
          content: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
          type: { type: 'string', maxLength: 50 }
        });

        if (!validation.isValid) {
          socket.emit('error', { code: 'INVALID_INPUT', details: validation.errors });
          return;
        }

        const message = {
          id: this.generateMessageId(),
          roomId: data.roomId,
          userId: user.userId,
          username: user.username,
          content: this.securityManager.sanitizeInput(data.content),
          type: data.type || 'text',
          timestamp: Date.now()
        };

        // 发送到消息队列
        await this.messageQueue.sendRealtimeMessage(message);

        // 广播到房间
        await this.roomManager.broadcastToRoom(data.roomId, 'new_message', message);

        this.monitoring.incrementCounter('messages_sent_total', { type: message.type });
        const duration = this.monitoring.endTimer('message_send_operation');

        socket.emit('message_sent', { messageId: message.id, duration });

      } catch (error) {
        this.errorHandler.handleError(error, { socketId: socket.id, userId: user.userId });
        socket.emit('error', { code: 'MESSAGE_SEND_FAILED', message: error.message });
      }
    });

    // 获取房间列表
    socket.on('get_rooms', async () => {
      try {
        const userRooms = this.roomManager.getUserRooms(user.userId);
        socket.emit('rooms_list', { rooms: userRooms });
      } catch (error) {
        this.errorHandler.handleError(error, { socketId: socket.id, userId: user.userId });
        socket.emit('error', { code: 'GET_ROOMS_FAILED', message: error.message });
      }
    });

    // 心跳响应
    socket.on('pong', (data) => {
      // 心跳由连接管理器处理
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      this.handleSocketDisconnection(socket, user, session, reason);
    });

    // 错误处理
    socket.on('error', (error) => {
      this.errorHandler.handleError(error, { socketId: socket.id, userId: user.userId });
    });
  }

  /**
   * 处理Socket断开连接
   */
  handleSocketDisconnection(socket, user, session, reason) {
    try {
      // 从连接管理器移除
      this.connectionManager.removeConnection(socket.id, reason);

      // 销毁会话
      this.securityManager.destroySession(session.id);

      // 更新监控
      this.monitoring.recordWebSocketConnection('disconnected');
      this.monitoring.setGaugeValue('websocket_connections_current', this.connectionManager.getActiveConnectionCount());

      console.log(`User ${user.username} disconnected: ${reason}`);

    } catch (error) {
      console.error('Disconnection handling error:', error);
    }
  }

  /**
   * 启动服务器
   */
  startServer() {
    this.server.listen(this.options.port, this.options.host, () => {
      console.log(`Socket.IO Server running on ${this.options.host}:${this.options.port}`);
      console.log(`Server ID: ${this.options.serverId}`);
      console.log(`Environment: ${this.options.env}`);
    });

    // 初始化消息队列
    this.messageQueue.initialize().catch(error => {
      console.error('Failed to initialize message queue:', error);
      process.exit(1);
    });

    // 启动消息消费者
    this.startMessageConsumers();
  }

  /**
   * 启动消息消费者
   */
  startMessageConsumers() {
    // 实时消息消费
    this.messageQueue.consumeMessages('socketio.realtime', async (message) => {
      try {
        if (message.payload.roomId) {
          await this.roomManager.broadcastToRoom(message.payload.roomId, 'realtime_message', message.payload);
        }
      } catch (error) {
        this.errorHandler.handleError(error, { source: 'message_consumer' });
      }
    });

    // 广播消息消费
    this.messageQueue.consumeMessages('socketio.broadcast', async (message) => {
      try {
        if (message.targetRooms) {
          await this.roomManager.broadcastToRooms(message.targetRooms, message.payload.event, message.payload.data);
        } else {
          this.io.emit(message.payload.event, message.payload.data);
        }
      } catch (error) {
        this.errorHandler.handleError(error, { source: 'broadcast_consumer' });
      }
    });
  }

  /**
   * 设置优雅关闭
   */
  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`Received ${signal}, starting graceful shutdown...`);
        this.gracefulShutdown(signal);
      });
    });
  }

  /**
   * 优雅关闭
   */
  async gracefulShutdown(signal) {
    try {
      console.log('Starting graceful shutdown...');

      // 停止接受新连接
      this.server.close(async () => {
        console.log('HTTP server closed');

        try {
          // 关闭所有Socket.IO连接
          this.io.close(() => {
            console.log('Socket.IO server closed');
          });

          // 关闭所有管理器
          await Promise.all([
            this.messageQueue.shutdown(),
            this.memoryManager.shutdown(),
            this.monitoring.shutdown(),
            this.securityManager.shutdown()
          ]);

          console.log('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // 强制退出超时
      setTimeout(() => {
        console.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
      }, 30000);

    } catch (error) {
      console.error('Graceful shutdown error:', error);
      process.exit(1);
    }
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 启动服务器
if (require.main === module) {
  const server = new SocketIOServer({
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0'
  });
}

module.exports = SocketIOServer;