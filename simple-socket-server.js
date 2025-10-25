/**
 * 简化版Socket.IO服务器
 * 用于快速测试聊天功能
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// 配置Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 中间件
app.use(cors());
app.use(express.json());

// 简单的用户数据存储（实际应用中应使用数据库）
const users = new Map();
const rooms = new Map();
const messages = new Map();

// 默认聊天室
const defaultRooms = [
  { id: 'general', name: '公共聊天室', description: '大家都可以聊天的公共空间', memberCount: 0 },
  { id: 'tech', name: '技术交流', description: '讨论技术问题和分享经验', memberCount: 0 },
  { id: 'random', name: '随机聊天', description: '随机话题，轻松聊天', memberCount: 0 }
];

// 初始化默认聊天室
defaultRooms.forEach(room => {
  rooms.set(room.id, room);
  messages.set(room.id, []);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: io.sockets.sockets.size,
    rooms: rooms.size
  });
});

// 系统统计
app.get('/api/stats', (req, res) => {
  res.json({
    connections: {
      total: users.size,
      active: io.sockets.sockets.size
    },
    rooms: {
      total: rooms.size,
      list: Array.from(rooms.values())
    },
    messages: {
      total: Array.from(messages.values()).reduce((sum, msgList) => sum + msgList.length, 0)
    }
  });
});

// 认证接口（简化版）
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // 简单验证（开发环境）
  if (username && username.length >= 3 && password && password.length >= 6) {
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      role: 'user'
    };

    // 简单的JWT token（实际应用中应使用真正的JWT）
    const token = Buffer.from(JSON.stringify(user)).toString('base64');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } else {
    res.status(400).json({
      error: 'Validation failed',
      details: ['用户名至少3个字符', '密码至少6个字符']
    });
  }
});

// Socket.IO连接处理
io.on('connection', (socket) => {
  console.log(`用户连接: ${socket.id}`);

  // 处理认证
  socket.on('authenticate', (data) => {
    try {
      const decoded = JSON.parse(Buffer.from(data.token, 'base64').toString());
      socket.userId = decoded.id;
      socket.username = decoded.username;
      socket.userRole = decoded.role;

      users.set(socket.id, {
        userId: decoded.id,
        username: decoded.username,
        role: decoded.role,
        connectedAt: new Date()
      });

      socket.emit('authenticated', { success: true });
      console.log(`用户认证成功: ${decoded.username}`);

    } catch (error) {
      socket.emit('authentication_failed', { message: 'Invalid token' });
      socket.disconnect();
    }
  });

  // 加入房间
  socket.on('join_room', (data) => {
    if (!socket.userId) {
      socket.emit('error', { code: 'NOT_AUTHENTICATED', message: '请先认证' });
      return;
    }

    const { roomId, roomName } = data;
    const room = rooms.get(roomId);

    if (room) {
      socket.join(roomId);
      socket.currentRoom = roomId;

      // 更新房间成员数
      room.memberCount++;

      // 发送加入成功消息
      socket.emit('room_joined', { roomId, roomName: room.name });

      // 通知房间其他用户
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });

      // 发送房间历史消息
      const roomMessages = messages.get(roomId) || [];
      socket.emit('room_messages', { roomId, messages: roomMessages });

      console.log(`${socket.username} 加入房间 ${room.name}`);
    } else {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: '房间不存在' });
    }
  });

  // 离开房间
  socket.on('leave_room', (data) => {
    if (!socket.userId) return;

    const { roomId } = data;
    const room = rooms.get(roomId);

    if (room && socket.currentRoom === roomId) {
      socket.leave(roomId);

      // 更新房间成员数
      room.memberCount = Math.max(0, room.memberCount - 1);

      socket.emit('room_left', { roomId });

      // 通知房间其他用户
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });

      socket.currentRoom = null;
      console.log(`${socket.username} 离开房间 ${room.name}`);
    }
  });

  // 发送消息
  socket.on('send_message', (data) => {
    if (!socket.userId) {
      socket.emit('error', { code: 'NOT_AUTHENTICATED', message: '请先认证' });
      return;
    }

    if (!socket.currentRoom) {
      socket.emit('error', { code: 'NOT_IN_ROOM', message: '请先加入房间' });
      return;
    }

    const { roomId, content, type = 'text' } = data;

    if (!content || content.trim().length === 0) {
      socket.emit('error', { code: 'EMPTY_MESSAGE', message: '消息不能为空' });
      return;
    }

    if (content.length > 1000) {
      socket.emit('error', { code: 'MESSAGE_TOO_LONG', message: '消息不能超过1000个字符' });
      return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      userId: socket.userId,
      username: socket.username,
      content: content.trim(),
      type,
      timestamp: Date.now()
    };

    // 存储消息
    const roomMessages = messages.get(roomId) || [];
    roomMessages.push(message);

    // 限制消息数量
    if (roomMessages.length > 100) {
      roomMessages.splice(0, roomMessages.length - 100);
    }
    messages.set(roomId, roomMessages);

    // 广播消息到房间
    io.to(roomId).emit('new_message', message);

    // 确认发送成功
    socket.emit('message_sent', { messageId: message.id });

    console.log(`${socket.username} 在房间 ${roomId} 发送消息: ${content.substring(0, 50)}...`);
  });

  // 获取房间列表
  socket.on('get_rooms', () => {
    if (!socket.userId) {
      socket.emit('error', { code: 'NOT_AUTHENTICATED', message: '请先认证' });
      return;
    }

    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      memberCount: room.memberCount
    }));

    socket.emit('rooms_list', { rooms: roomList });
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    if (socket.userId && socket.currentRoom) {
      const room = rooms.get(socket.currentRoom);
      if (room) {
        room.memberCount = Math.max(0, room.memberCount - 1);

        // 通知房间其他用户
        socket.to(socket.currentRoom).emit('user_left', {
          userId: socket.userId,
          username: socket.username,
          roomId: socket.currentRoom
        });
      }
    }

    users.delete(socket.id);
    console.log(`用户断开连接: ${socket.username || socket.id} (${reason})`);
  });

  // 错误处理
  socket.on('error', (error) => {
    console.error(`Socket错误 (${socket.id}):`, error);
  });
});

// 启动服务器
const PORT = process.env.PORT || 8088;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket.IO服务器启动成功！`);
  console.log(`📡 WebSocket服务地址: ws://localhost:${PORT}`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health`);
  console.log(`📊 系统统计: http://localhost:${PORT}/api/stats`);
  console.log(`🔧 支持的房间: ${defaultRooms.map(r => r.name).join(', ')}`);
  console.log(``);
  console.log(`🎯 前端应用: http://localhost:5000`);
  console.log(`🌐 API代理服务: http://localhost:8091`);
  console.log(`📝 测试步骤:`);
  console.log(`   1. 打开前端应用`);
  console.log(`   2. 点击仪表板中的"进入聊天室"按钮`);
  console.log(`   3. 使用任意用户名和密码登录（用户名至少3个字符，密码至少6个字符）`);
  console.log(`   4. 加入聊天室开始测试`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});