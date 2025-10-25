/**
 * 消息队列和持久化策略模块
 *
 * 主要功能：
 * 1. RabbitMQ消息队列管理
 * 2. Redis缓存和持久化
 * 3. MongoDB数据持久化
 * 4. 离线消息处理
 * 5. 消息重试和死信处理
 */

const amqp = require('amqplib');
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class MessageQueueManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.rabbitmqUrl = options.rabbitmqUrl || 'amqp://localhost:5672';
    this.redisUrl = options.redisUrl || 'redis://localhost:6379';
    this.mongodbUrl = options.mongodbUrl || 'mongodb://localhost:27017/socketio';

    // 连接实例
    this.rabbitmqConnection = null;
    this.redisClient = null;
    this.mongodbClient = null;

    // 通道和队列
    this.channels = {};
    this.queues = {
      realtime: 'socketio.realtime',      // 实时消息队列
      persistent: 'socketio.persistent',  // 持久化消息队列
      broadcast: 'socketio.broadcast',    // 广播消息队列
      dead_letter: 'socketio.dlq'        // 死信队列
    };

    // 消息缓冲区
    this.messageBuffer = new Map(); // roomId -> message[]
    this.bufferFlushInterval = 5000; // 5秒刷新一次
    this.maxBufferSize = 100;       // 最大缓冲大小

    // 性能统计
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      messagesBuffered: 0,
      messagesPersisted: 0,
      errors: 0,
      avgProcessingTime: 0
    };

    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    };
  }

  /**
   * 初始化所有连接
   */
  async initialize() {
    try {
      await Promise.all([
        this.connectRabbitMQ(),
        this.connectRedis(),
        this.connectMongoDB()
      ]);

      this.startBufferFlusher();
      this.startStatsCollector();

      console.log('Message queue manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize message queue manager:', error);
      throw error;
    }
  }

  /**
   * 连接RabbitMQ
   */
  async connectRabbitMQ() {
    try {
      this.rabbitmqConnection = await amqp.connect(this.rabbitmqUrl, {
        heartbeat: 60,
        timeout: 20000
      });

      // 创建通道
      const channel = await this.rabbitmqConnection.createChannel();
      this.channels.main = channel;

      // 设置预取数量
      await channel.prefetch(100);

      // 声明队列
      for (const [key, queueName] of Object.entries(this.queues)) {
        await channel.assertQueue(queueName, {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': this.queues.dead_letter
          }
        });
      }

      // 设置错误处理
      this.rabbitmqConnection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
        this.stats.errors++;
        this.emit('error', { source: 'rabbitmq', error });
      });

      this.rabbitmqConnection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.emit('connection:closed', { source: 'rabbitmq' });
      });

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * 连接Redis
   */
  async connectRedis() {
    try {
      this.redisClient = new Redis(this.redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // 连接事件监听
      this.redisClient.on('connect', () => {
        console.log('Connected to Redis');
      });

      this.redisClient.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.stats.errors++;
        this.emit('error', { source: 'redis', error });
      });

      await this.redisClient.connect();
      console.log('Redis connection established');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * 连接MongoDB
   */
  async connectMongoDB() {
    try {
      this.mongodbClient = new MongoClient(this.mongodbUrl, {
        poolSize: 10,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });

      await this.mongodbClient.connect();
      const db = this.mongodbClient.db();

      // 创建集合和索引
      await this.setupMongoDBIndexes(db);

      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * 设置MongoDB索引
   */
  async setupMongoDBIndexes(db) {
    const messagesCollection = db.collection('messages');
    const offlineMessagesCollection = db.collection('offline_messages');

    // 消息集合索引
    await messagesCollection.createIndex({ roomId: 1, timestamp: -1 });
    await messagesCollection.createIndex({ userId: 1, timestamp: -1 });
    await messagesCollection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7天过期

    // 离线消息集合索引
    await offlineMessagesCollection.createIndex({ userId: 1, createdAt: 1 });
    await offlineMessagesCollection.createIndex({
      createdAt: 1
    }, {
      expireAfterSeconds: 7 * 24 * 60 * 60 // 7天过期
    });
  }

  /**
   * 发送实时消息
   */
  async sendRealtimeMessage(message) {
    try {
      const startTime = performance.now();

      const messageData = {
        id: this.generateMessageId(),
        type: 'realtime',
        payload: message,
        timestamp: Date.now(),
        priority: message.priority || 'normal'
      };

      // 发送到RabbitMQ
      const sent = this.channels.main.sendToQueue(
        this.queues.realtime,
        Buffer.from(JSON.stringify(messageData)),
        {
          persistent: false,
          priority: this.getPriorityValue(messageData.priority)
        }
      );

      if (sent) {
        this.stats.messagesSent++;
        this.updateProcessingTime(performance.now() - startTime);
        this.emit('message:sent', messageData);
      }

      return messageData.id;
    } catch (error) {
      console.error('Failed to send realtime message:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 发送持久化消息
   */
  async sendPersistentMessage(message) {
    try {
      const startTime = performance.now();

      const messageData = {
        id: this.generateMessageId(),
        type: 'persistent',
        payload: message,
        timestamp: Date.now(),
        userId: message.userId,
        roomId: message.roomId,
        priority: message.priority || 'normal'
      };

      // 先保存到MongoDB
      await this.saveMessageToMongo(messageData);

      // 再发送到RabbitMQ
      const sent = this.channels.main.sendToQueue(
        this.queues.persistent,
        Buffer.from(JSON.stringify(messageData)),
        {
          persistent: true,
          priority: this.getPriorityValue(messageData.priority)
        }
      );

      if (sent) {
        this.stats.messagesPersisted++;
        this.stats.messagesSent++;
        this.updateProcessingTime(performance.now() - startTime);
        this.emit('message:persisted', messageData);
      }

      return messageData.id;
    } catch (error) {
      console.error('Failed to send persistent message:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 缓存消息到缓冲区
   */
  bufferMessage(roomId, message) {
    if (!this.messageBuffer.has(roomId)) {
      this.messageBuffer.set(roomId, []);
    }

    const buffer = this.messageBuffer.get(roomId);
    buffer.push({
      id: this.generateMessageId(),
      roomId,
      message,
      timestamp: Date.now()
    });

    this.stats.messagesBuffered++;

    // 如果缓冲区满了，立即刷新
    if (buffer.length >= this.maxBufferSize) {
      this.flushBuffer(roomId);
    }
  }

  /**
   * 刷新缓冲区
   */
  async flushBuffer(roomId) {
    const buffer = this.messageBuffer.get(roomId);
    if (!buffer || buffer.length === 0) return;

    try {
      // 保存到Redis缓存
      const cacheKey = `room:${roomId}:messages`;
      await this.redisClient.lpush(cacheKey, buffer.map(msg => JSON.stringify(msg)));

      // 设置过期时间
      await this.redisClient.expire(cacheKey, 24 * 60 * 60); // 24小时

      // 限制缓存大小
      await this.redisClient.ltrim(cacheKey, 0, 999);

      // 清空缓冲区
      this.messageBuffer.set(roomId, []);

      console.log(`Flushed ${buffer.length} messages for room ${roomId}`);
    } catch (error) {
      console.error(`Failed to flush buffer for room ${roomId}:`, error);
      this.stats.errors++;
    }
  }

  /**
   * 发送广播消息
   */
  async sendBroadcastMessage(message, targetRooms = null) {
    try {
      const startTime = performance.now();

      const broadcastData = {
        id: this.generateMessageId(),
        type: 'broadcast',
        payload: message,
        targetRooms,
        timestamp: Date.now(),
        priority: message.priority || 'normal'
      };

      const sent = this.channels.main.sendToQueue(
        this.queues.broadcast,
        Buffer.from(JSON.stringify(broadcastData)),
        {
          persistent: false,
          priority: this.getPriorityValue(broadcastData.priority)
        }
      );

      if (sent) {
        this.stats.messagesSent++;
        this.updateProcessingTime(performance.now() - startTime);
        this.emit('broadcast:sent', broadcastData);
      }

      return broadcastData.id;
    } catch (error) {
      console.error('Failed to send broadcast message:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 保存离线消息
   */
  async saveOfflineMessage(userId, message) {
    try {
      const offlineMessage = {
        id: this.generateMessageId(),
        userId,
        message,
        createdAt: new Date(),
        attempts: 0,
        nextRetryAt: new Date()
      };

      const db = this.mongodbClient.db();
      await db.collection('offline_messages').insertOne(offlineMessage);

      // 同时保存到Redis用于快速访问
      const cacheKey = `user:${userId}:offline_messages`;
      await this.redisClient.lpush(
        cacheKey,
        JSON.stringify(offlineMessage)
      );
      await this.redisClient.expire(cacheKey, 7 * 24 * 60 * 60); // 7天

      this.emit('offline_message:saved', offlineMessage);
    } catch (error) {
      console.error('Failed to save offline message:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 获取离线消息
   */
  async getOfflineMessages(userId) {
    try {
      // 先从Redis获取
      const cacheKey = `user:${userId}:offline_messages`;
      const cachedMessages = await this.redisClient.lrange(cacheKey, 0, -1);

      if (cachedMessages.length > 0) {
        return cachedMessages.map(msg => JSON.parse(msg));
      }

      // 如果Redis中没有，从MongoDB获取
      const db = this.mongodbClient.db();
      const messages = await db.collection('offline_messages')
        .find({ userId })
        .sort({ createdAt: 1 })
        .toArray();

      // 缓存到Redis
      if (messages.length > 0) {
        await this.redisClient.lpush(
          cacheKey,
          messages.map(msg => JSON.stringify(msg))
        );
        await this.redisClient.expire(cacheKey, 7 * 24 * 60 * 60);
      }

      return messages;
    } catch (error) {
      console.error('Failed to get offline messages:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 删除离线消息
   */
  async deleteOfflineMessages(userId, messageIds = null) {
    try {
      const db = this.mongodbClient.db();
      const cacheKey = `user:${userId}:offline_messages`;

      if (messageIds) {
        // 删除指定的消息
        await db.collection('offline_messages').deleteMany({
          userId,
          id: { $in: messageIds }
        });

        // 从Redis中删除
        for (const messageId of messageIds) {
          await this.redisClient.lrem(cacheKey, 1, JSON.stringify({ id: messageId }));
        }
      } else {
        // 删除用户的所有离线消息
        await db.collection('offline_messages').deleteMany({ userId });
        await this.redisClient.del(cacheKey);
      }

      this.emit('offline_messages:deleted', { userId, messageIds });
    } catch (error) {
      console.error('Failed to delete offline messages:', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 消费消息
   */
  async consumeMessages(queueName, callback) {
    try {
      const channel = this.channels.main;
      await channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
          const messageData = JSON.parse(msg.content.toString());
          const startTime = performance.now();

          // 处理消息
          await callback(messageData);

          // 确认消息
          channel.ack(msg);

          // 更新统计
          this.stats.messagesReceived++;
          this.updateProcessingTime(performance.now() - startTime);

          this.emit('message:processed', { queue: queueName, message: messageData });
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error);
          this.stats.errors++;

          // 检查是否需要重试
          if (msg.properties.headers && msg.properties.headers['x-death']) {
            // 消息已经重试过多次，发送到死信队列
            channel.nack(msg, false, false);
            this.emit('message:dead_lettered', { queue: queueName, message: msg.content.toString() });
          } else {
            // 重新入队进行重试
            channel.nack(msg, false, true);
          }
        }
      });

      console.log(`Started consuming messages from queue: ${queueName}`);
    } catch (error) {
      console.error(`Failed to consume messages from ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * 启动缓冲区刷新器
   */
  startBufferFlusher() {
    setInterval(() => {
      for (const roomId of this.messageBuffer.keys()) {
        this.flushBuffer(roomId);
      }
    }, this.bufferFlushInterval);
  }

  /**
   * 启动统计收集器
   */
  startStatsCollector() {
    setInterval(() => {
      const stats = {
        ...this.stats,
        timestamp: Date.now(),
        bufferSize: Array.from(this.messageBuffer.values())
          .reduce((sum, buffer) => sum + buffer.length, 0)
      };

      this.emit('stats:updated', stats);
    }, 60000); // 每分钟更新一次统计
  }

  /**
   * 保存消息到MongoDB
   */
  async saveMessageToMongo(messageData) {
    try {
      const db = this.mongodbClient.db();
      await db.collection('messages').insertOne({
        ...messageData,
        _id: messageData.id,
        createdAt: new Date(messageData.timestamp)
      });
    } catch (error) {
      console.error('Failed to save message to MongoDB:', error);
      throw error;
    }
  }

  /**
   * 获取优先级数值
   */
  getPriorityValue(priority) {
    const priorities = {
      low: 1,
      normal: 5,
      high: 10,
      urgent: 20
    };
    return priorities[priority] || 5;
  }

  /**
   * 更新处理时间统计
   */
  updateProcessingTime(processingTime) {
    const alpha = 0.1;
    this.stats.avgProcessingTime =
      this.stats.avgProcessingTime * (1 - alpha) + processingTime * alpha;
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      bufferSize: Array.from(this.messageBuffer.values())
        .reduce((sum, buffer) => sum + buffer.length, 0),
      queueSizes: Object.keys(this.queues).length
    };
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down message queue manager...');

    // 刷新所有缓冲区
    for (const roomId of this.messageBuffer.keys()) {
      await this.flushBuffer(roomId);
    }

    // 关闭RabbitMQ连接
    if (this.rabbitmqConnection) {
      await this.rabbitmqConnection.close();
    }

    // 关闭Redis连接
    if (this.redisClient) {
      await this.redisClient.quit();
    }

    // 关闭MongoDB连接
    if (this.mongodbClient) {
      await this.mongodbClient.close();
    }

    console.log('Message queue manager shutdown complete');
  }
}

module.exports = MessageQueueManager;