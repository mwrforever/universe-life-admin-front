/**
 * 房间管理和广播优化模块
 *
 * 主要功能：
 * 1. 智能房间分配和管理
 * 2. 分片广播优化
 * 3. 房间负载均衡
 * 4. 广播性能优化
 * 5. 房间生命周期管理
 */

const EventEmitter = require('events');
const Redis = require('ioredis');
const { performance } = require('perf_hooks');

class RoomManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.maxRoomSize = options.maxRoomSize || 100;
    this.maxShards = options.maxShards || 10;
    this.shardThreshold = options.shardThreshold || 200;
    this.broadcastBatchSize = options.broadcastBatchSize || 50;
    this.broadcastDelay = options.broadcastDelay || 10;
    this.redisUrl = options.redisUrl || 'redis://localhost:6379';

    // 房间数据结构
    this.rooms = new Map(); // roomId -> room info
    this.userRooms = new Map(); // userId -> Set of roomIds
    this.shards = new Map(); // shardId -> Set of socketIds

    // 广播队列
    this.broadcastQueue = [];
    this.broadcastTimer = null;

    // Redis客户端用于跨服务器房间管理
    this.redis = new Redis(this.redisUrl);
    this.redisSubscriber = new Redis(this.redisUrl);

    // 性能统计
    this.stats = {
      totalRooms: 0,
      totalUsers: 0,
      totalShards: 0,
      broadcastsSent: 0,
      avgBroadcastTime: 0,
      roomOperations: 0
    };

    // 初始化
    this.initialize();
  }

  /**
   * 初始化房间管理器
   */
  async initialize() {
    try {
      // 设置Redis订阅
      await this.redisSubscriber.subscribe('room:events');
      this.redisSubscriber.on('message', (channel, message) => {
        this.handleRedisMessage(channel, message);
      });

      // 启动广播处理器
      this.startBroadcastProcessor();

      // 定期清理空房间
      this.startRoomCleanup();

      console.log('Room manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize room manager:', error);
      throw error;
    }
  }

  /**
   * 创建或加入房间
   */
  async joinRoom(socket, roomId, userInfo = {}) {
    const startTime = performance.now();

    try {
      // 获取或创建房间
      let room = this.rooms.get(roomId);
      if (!room) {
        room = await this.createRoom(roomId, userInfo);
      }

      // 检查房间容量
      if (room.members.size >= this.maxRoomSize) {
        // 房间已满，尝试分配到分片房间
        const shardRoomId = await this.findOrCreateShardRoom(roomId);
        return this.joinRoom(socket, shardRoomId, userInfo);
      }

      // 检查是否需要分片
      if (room.members.size >= this.shardThreshold && !room.isShard) {
        await this.createShards(roomId);
        const shardRoomId = await this.findAvailableShard(roomId);
        return this.joinRoom(socket, shardRoomId, userInfo);
      }

      // 添加用户到房间
      const memberInfo = {
        socketId: socket.id,
        userId: userInfo.userId || socket.id,
        username: userInfo.username || `user_${socket.id.substr(0, 8)}`,
        joinedAt: Date.now(),
        isActive: true,
        role: userInfo.role || 'member'
      };

      room.members.set(socket.id, memberInfo);
      room.lastActivity = Date.now();

      // 更新用户房间映射
      if (!this.userRooms.has(memberInfo.userId)) {
        this.userRooms.set(memberInfo.userId, new Set());
      }
      this.userRooms.get(memberInfo.userId).add(roomId);

      // socket加入房间
      socket.join(roomId);

      // 通知房间其他用户
      socket.to(roomId).emit('user_joined', {
        roomId,
        user: {
          userId: memberInfo.userId,
          username: memberInfo.username,
          role: memberInfo.role
        }
      });

      // 发送房间信息给新用户
      socket.emit('room_joined', {
        roomId,
        roomInfo: {
          id: roomId,
          name: room.name,
          memberCount: room.members.size,
          isShard: room.isShard,
          shardId: room.shardId
        },
        members: Array.from(room.members.values()).map(m => ({
          userId: m.userId,
          username: m.username,
          role: m.role,
          joinedAt: m.joinedAt
        }))
      });

      // 同步到Redis
      await this.syncRoomToRedis(room);

      // 更新统计
      this.stats.roomOperations++;
      this.updateBroadcastTime(performance.now() - startTime);

      // 发送事件
      this.emit('user:joined_room', { roomId, userId: memberInfo.userId, socketId: socket.id });

      return roomId;
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  /**
   * 离开房间
   */
  async leaveRoom(socket, roomId) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) return false;

      const member = room.members.get(socket.id);
      if (!member) return false;

      // 从房间移除用户
      room.members.delete(socket.id);
      room.lastActivity = Date.now();

      // 更新用户房间映射
      if (this.userRooms.has(member.userId)) {
        this.userRooms.get(member.userId).delete(roomId);
        if (this.userRooms.get(member.userId).size === 0) {
          this.userRooms.delete(member.userId);
        }
      }

      // socket离开房间
      socket.leave(roomId);

      // 通知房间其他用户
      socket.to(roomId).emit('user_left', {
        roomId,
        user: {
          userId: member.userId,
          username: member.username
        }
      });

      // 如果是分片房间且用户数很少，考虑合并
      if (room.isShard && room.members.size < 20) {
        await this.considerShardMerge(roomId);
      }

      // 同步到Redis
      await this.syncRoomToRedis(room);

      // 发送事件
      this.emit('user:left_room', { roomId, userId: member.userId, socketId: socket.id });

      return true;
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  /**
   * 创建新房间
   */
  async createRoom(roomId, userInfo = {}) {
    const room = {
      id: roomId,
      name: userInfo.roomName || roomId,
      members: new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isShard: false,
      shardId: null,
      parentRoomId: null,
      metadata: userInfo.metadata || {}
    };

    this.rooms.set(roomId, room);
    this.stats.totalRooms++;

    // 通知Redis
    await this.redis.hset('rooms', roomId, JSON.stringify({
      id: roomId,
      name: room.name,
      memberCount: 0,
      createdAt: room.createdAt,
      isShard: room.isShard
    }));

    this.emit('room:created', { roomId, room });
    return room;
  }

  /**
   * 创建房间分片
   */
  async createShards(parentRoomId) {
    const parentRoom = this.rooms.get(parentRoomId);
    if (!parentRoom || parentRoom.isShard) return;

    const shardCount = Math.min(
      Math.ceil(parentRoom.members.size / this.shardThreshold),
      this.maxShards
    );

    for (let i = 0; i < shardCount; i++) {
      const shardId = `${parentRoomId}_shard_${i}`;
      const shardRoom = {
        id: shardId,
        name: `${parentRoom.name} - Shard ${i + 1}`,
        members: new Map(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        isShard: true,
        shardId: i,
        parentRoomId: parentRoomId,
        metadata: { ...parentRoom.metadata }
      };

      this.rooms.set(shardId, shardRoom);
      this.shards.set(shardId, new Set());
      this.stats.totalShards++;
    }

    // 通知Redis
    await this.redis.hset('room_shards', parentRoomId, shardCount.toString());

    this.emit('room:sharded', { parentRoomId, shardCount });
  }

  /**
   * 查找可用的分片房间
   */
  async findAvailableShard(parentRoomId) {
    const shards = Array.from(this.rooms.values())
      .filter(room => room.parentRoomId === parentRoomId && room.isShard)
      .sort((a, b) => a.members.size - b.members.size);

    return shards.length > 0 ? shards[0].id : await this.createAdditionalShard(parentRoomId);
  }

  /**
   * 创建额外的分片
   */
  async createAdditionalShard(parentRoomId) {
    const currentShards = Array.from(this.rooms.values())
      .filter(room => room.parentRoomId === parentRoomId && room.isShard).length;

    const shardId = `${parentRoomId}_shard_${currentShards}`;
    const shardRoom = {
      id: shardId,
      name: `${parentRoomId} - Shard ${currentShards + 1}`,
      members: new Map(),
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isShard: true,
      shardId: currentShards,
      parentRoomId: parentRoomId,
      metadata: {}
    };

    this.rooms.set(shardId, shardRoom);
    this.stats.totalShards++;

    return shardId;
  }

  /**
   * 广播消息到房间
   */
  async broadcastToRoom(roomId, event, data, options = {}) {
    const startTime = performance.now();

    try {
      const room = this.rooms.get(roomId);
      if (!room) return false;

      // 如果是分片房间，需要广播到所有分片
      if (!room.isShard) {
        const shards = this.getRoomShards(roomId);
        for (const shard of shards) {
          this.queueBroadcast(shard.id, event, data, options);
        }
      }

      // 添加到广播队列
      this.queueBroadcast(roomId, event, data, options);

      // 如果不是延迟广播，立即处理
      if (!options.delayed) {
        this.processBroadcastQueue();
      }

      this.stats.broadcastsSent++;
      this.updateBroadcastTime(performance.now() - startTime);

      return true;
    } catch (error) {
      console.error('Failed to broadcast to room:', error);
      throw error;
    }
  }

  /**
   * 广播消息到多个房间
   */
  async broadcastToRooms(roomIds, event, data, options = {}) {
    const startTime = performance.now();

    try {
      for (const roomId of roomIds) {
        await this.broadcastToRoom(roomId, event, data, { ...options, delayed: true });
      }

      this.processBroadcastQueue();
      this.updateBroadcastTime(performance.now() - startTime);

      return true;
    } catch (error) {
      console.error('Failed to broadcast to rooms:', error);
      throw error;
    }
  }

  /**
   * 添加广播到队列
   */
  queueBroadcast(roomId, event, data, options = {}) {
    this.broadcastQueue.push({
      roomId,
      event,
      data,
      options,
      timestamp: Date.now(),
      attempts: 0
    });
  }

  /**
   * 处理广播队列
   */
  async processBroadcastQueue() {
    if (this.broadcastTimer) return;

    this.broadcastTimer = setTimeout(async () => {
      while (this.broadcastQueue.length > 0) {
        const batch = this.broadcastQueue.splice(0, this.broadcastBatchSize);

        for (const broadcast of batch) {
          try {
            await this.executeBroadcast(broadcast);
          } catch (error) {
            console.error('Broadcast execution failed:', error);
            // 重试逻辑
            if (broadcast.attempts < 3) {
              broadcast.attempts++;
              this.broadcastQueue.unshift(broadcast);
            }
          }
        }

        // 避免阻塞事件循环
        if (this.broadcastQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.broadcastDelay));
        }
      }

      this.broadcastTimer = null;
    }, 0);
  }

  /**
   * 执行广播
   */
  async executeBroadcast(broadcast) {
    const { roomId, event, data, options } = broadcast;

    // 发送到Redis进行跨服务器广播
    if (options.global !== false) {
      await this.redis.publish('room:broadcast', JSON.stringify({
        roomId,
        event,
        data,
        serverId: process.env.SERVER_ID || 'unknown'
      }));
    }

    // 本地广播
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }

    this.emit('broadcast:executed', { roomId, event, data });
  }

  /**
   * 获取房间的所有分片
   */
  getRoomShards(roomId) {
    return Array.from(this.rooms.values())
      .filter(room => room.parentRoomId === roomId && room.isShard);
  }

  /**
   * 获取房间信息
   */
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      name: room.name,
      memberCount: room.members.size,
      isShard: room.isShard,
      shardId: room.shardId,
      parentRoomId: room.parentRoomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      metadata: room.metadata
    };
  }

  /**
   * 获取用户所在的房间
   */
  getUserRooms(userId) {
    const roomIds = this.userRooms.get(userId);
    if (!roomIds) return [];

    return Array.from(roomIds)
      .map(roomId => this.getRoomInfo(roomId))
      .filter(room => room !== null);
  }

  /**
   * 获取房间成员列表
   */
  getRoomMembers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.members.values()).map(member => ({
      socketId: member.socketId,
      userId: member.userId,
      username: member.username,
      role: member.role,
      joinedAt: member.joinedAt,
      isActive: member.isActive
    }));
  }

  /**
   * 考虑分片合并
   */
  async considerShardMerge(shardRoomId) {
    const shard = this.rooms.get(shardRoomId);
    if (!shard || !shard.isShard) return;

    const shards = this.getRoomShards(shard.parentRoomId);
    if (shards.length <= 1) return;

    // 找到用户最少的分片
    const smallestShard = shards
      .filter(s => s.id !== shardRoomId)
      .sort((a, b) => a.members.size - b.members.size)[0];

    if (smallestShard && smallestShard.members.size + shard.members.size <= this.shardThreshold) {
      await this.mergeShards(shardRoomId, smallestShard.id);
    }
  }

  /**
   * 合并分片
   */
  async mergeShards(fromShardId, toShardId) {
    const fromShard = this.rooms.get(fromShardId);
    const toShard = this.rooms.get(toShardId);

    if (!fromShard || !toShard) return;

    // 迁移用户
    for (const [socketId, member] of fromShard.members) {
      toShard.members.set(socketId, { ...member });

      // 更新用户房间映射
      if (this.userRooms.has(member.userId)) {
        this.userRooms.get(member.userId).delete(fromShardId);
        this.userRooms.get(member.userId).add(toShardId);
      }

      // 通知用户房间变更
      if (this.io && this.io.sockets.sockets.get(socketId)) {
        this.io.sockets.sockets.get(socketId).leave(fromShardId);
        this.io.sockets.sockets.sockets.get(socketId).join(toShardId);
        this.io.sockets.sockets.sockets.get(socketId).emit('room_merged', {
          fromRoom: fromShardId,
          toRoom: toShardId,
          roomInfo: this.getRoomInfo(toShardId)
        });
      }
    }

    // 删除原分片
    this.rooms.delete(fromShardId);
    this.stats.totalShards--;

    this.emit('shards:merged', { fromShardId, toShardId });
  }

  /**
   * 启动广播处理器
   */
  startBroadcastProcessor() {
    setInterval(() => {
      if (this.broadcastQueue.length > 0) {
        this.processBroadcastQueue();
      }
    }, 100);
  }

  /**
   * 启动房间清理
   */
  startRoomCleanup() {
    setInterval(async () => {
      const now = Date.now();
      const inactiveThreshold = 30 * 60 * 1000; // 30分钟

      for (const [roomId, room] of this.rooms) {
        if (room.members.size === 0 && (now - room.lastActivity) > inactiveThreshold) {
          await this.deleteRoom(roomId);
        }
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 删除房间
   */
  async deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // 从Redis删除
    await this.redis.hdel('rooms', roomId);
    if (room.isShard) {
      await this.redis.hdel('room_shards', room.parentRoomId);
    }

    // 从内存删除
    this.rooms.delete(roomId);
    this.stats.totalRooms--;

    this.emit('room:deleted', { roomId });
  }

  /**
   * 处理Redis消息
   */
  handleRedisMessage(channel, message) {
    try {
      const data = JSON.parse(message);

      if (channel === 'room:events') {
        this.handleRoomEvent(data);
      } else if (channel === 'room:broadcast') {
        this.handleBroadcast(data);
      }
    } catch (error) {
      console.error('Failed to handle Redis message:', error);
    }
  }

  /**
   * 处理房间事件
   */
  handleRoomEvent(data) {
    // 处理来自其他服务器的房间事件
    this.emit('redis:room_event', data);
  }

  /**
   * 处理广播消息
   */
  handleBroadcast(data) {
    if (data.serverId === process.env.SERVER_ID) return; // 忽略自己发送的消息

    if (this.io) {
      this.io.to(data.roomId).emit(data.event, data.data);
    }
  }

  /**
   * 同步房间到Redis
   */
  async syncRoomToRedis(room) {
    await this.redis.hset('rooms', room.id, JSON.stringify({
      id: room.id,
      name: room.name,
      memberCount: room.members.size,
      isShard: room.isShard,
      shardId: room.shardId,
      parentRoomId: room.parentRoomId,
      lastActivity: room.lastActivity
    }));
  }

  /**
   * 更新广播时间统计
   */
  updateBroadcastTime(broadcastTime) {
    const alpha = 0.1;
    this.stats.avgBroadcastTime =
      this.stats.avgBroadcastTime * (1 - alpha) + broadcastTime * alpha;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalUsers: this.userRooms.size,
      queueSize: this.broadcastQueue.length
    };
  }

  /**
   * 设置IO实例
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down room manager...');

    // 清理广播队列
    this.broadcastQueue = [];
    if (this.broadcastTimer) {
      clearTimeout(this.broadcastTimer);
    }

    // 关闭Redis连接
    await this.redis.quit();
    await this.redisSubscriber.quit();

    console.log('Room manager shutdown complete');
  }
}

module.exports = RoomManager;