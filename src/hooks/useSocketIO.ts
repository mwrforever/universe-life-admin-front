/**
 * Socket.IO客户端Hook
 *
 * 提供Socket.IO连接管理的React Hook
 * 包含自动重连、错误处理、消息缓存等功能
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketConfig {
  url?: string;
  token?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  rooms: string[];
  messages: any[];
  connectionCount: number;
}

interface UseSocketIOReturn {
  socket: Socket | null;
  state: SocketState;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string, roomName?: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: string) => Promise<void>;
  getRooms: () => Promise<void>;
  clearMessages: () => void;
}

export const useSocketIO = (config: SocketConfig = {}): UseSocketIOReturn => {
  const {
    url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
    token,
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 10,
    reconnectionDelay = 1000,
    reconnectionDelayMax = 30000
  } = config;

  // Socket实例
  const socketRef = useRef<Socket | null>(null);

  // 状态管理
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
    rooms: [],
    messages: [],
    connectionCount: 0
  });

  // 消息缓存
  const messageCacheRef = useRef<Map<string, any[]>>(new Map());

  // 重连状态
  const reconnectTimeoutRef = useRef<number | null>(null);
  const maxReconnectDelay = reconnectionDelayMax;

  /**
   * 更新状态
   */
  const updateState = useCallback((updates: Partial<SocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 创建Socket连接
   */
  const createSocket = useCallback(() => {
    if (!token) {
      updateState({ error: '未提供认证令牌' });
      return null;
    }

    const socket = io(url, {
      auth: { token },
      autoConnect: false,
      reconnection: false, // 我们手动处理重连
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // 设置事件监听器
    setupSocketListeners(socket);

    return socket;
  }, [url, token, updateState]);

  /**
   * 设置Socket事件监听器
   */
  const setupSocketListeners = useCallback((socket: Socket) => {
    // 连接事件
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);

      // 发送认证信息
      if (token) {
        socket.emit('authenticate', { token });
      }

      updateState({
        connected: true,
        connecting: false,
        error: null,
        connectionCount: state.connectionCount + 1
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      updateState({
        connected: false,
        connecting: false,
        error: reason
      });

      // 如果是服务器主动断开，尝试重连
      if (reason === 'io server disconnect' && reconnection) {
        scheduleReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      updateState({
        connected: false,
        connecting: false,
        error: error.message
      });

      if (reconnection) {
        scheduleReconnect();
      }
    });

    // 认证事件
    socket.on('authenticated', (data) => {
      console.log('Authentication successful:', data);
      // 认证成功，可以开始发送消息
    });

    socket.on('authentication_failed', (data) => {
      console.error('Authentication failed:', data);
      updateState({ error: `认证失败: ${data.message}` });
    });

    // 房间事件
    socket.on('room_joined', (data) => {
      console.log('Joined room:', data);
      updateState(prev => ({
        rooms: [...prev.rooms.filter(room => room !== data.roomId), data.roomId]
      }));
    });

    socket.on('room_left', (data) => {
      console.log('Left room:', data);
      updateState(prev => ({
        rooms: prev.rooms.filter(room => room !== data.roomId)
      }));
    });

    socket.on('rooms_list', (data) => {
      console.log('Received rooms list:', data);
      updateState({ rooms: data.rooms.map((room: any) => room.id) });
    });

    // 消息事件
    socket.on('new_message', (message) => {
      console.log('Received message:', message);

      // 添加到消息列表
      updateState(prev => ({
        messages: [...prev.messages, message]
      }));

      // 缓存消息
      if (!messageCacheRef.current.has(message.roomId)) {
        messageCacheRef.current.set(message.roomId, []);
      }
      messageCacheRef.current.get(message.roomId)!.push(message);

      // 限制缓存大小
      const roomMessages = messageCacheRef.current.get(message.roomId)!;
      if (roomMessages.length > 100) {
        roomMessages.splice(0, roomMessages.length - 100);
      }
    });

    socket.on('message_sent', (data) => {
      console.log('Message sent:', data);
    });

    // 错误事件
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      updateState({ error: error.message || '发生未知错误' });
    });

    // 重连事件
    socket.on('reconnection_successful', (data) => {
      console.log('Reconnection successful:', data);
      updateState({ error: null });
    });

    socket.on('reconnection_failed', (data) => {
      console.error('Reconnection failed:', data);
      updateState({
        error: `重连失败，已尝试 ${data.totalAttempts} 次。请刷新页面重试。`
      });
    });

  }, [reconnection, state.connectionCount, updateState]);

  /**
   * 安排重连
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const attempt = state.connectionCount;
    if (attempt >= reconnectionAttempts) {
      updateState({
        error: '已达到最大重连次数，请刷新页面重试'
      });
      return;
    }

    // 指数退避算法
    const delay = Math.min(
      reconnectionDelay * Math.pow(2, attempt),
      maxReconnectDelay
    );

    console.log(`Scheduling reconnection in ${delay}ms (attempt ${attempt + 1})`);
    updateState({ connecting: true });

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [
    state.connectionCount,
    reconnectionAttempts,
    reconnectionDelay,
    maxReconnectDelay,
    updateState
  ]);

  /**
   * 连接到Socket.IO服务器
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (!token) {
      updateState({ error: '未提供认证令牌' });
      return;
    }

    console.log('Connecting to Socket.IO server...');
    updateState({ connecting: true, error: null });

    const socket = createSocket();
    if (socket) {
      socketRef.current = socket;
      socket.connect();
    }
  }, [token, createSocket, updateState]);

  /**
   * 断开Socket连接
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('Disconnecting from Socket.IO server...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    updateState({
      connected: false,
      connecting: false,
      error: null,
      rooms: [],
      messages: []
    });

    // 清空消息缓存
    messageCacheRef.current.clear();
  }, [updateState]);

  /**
   * 加入房间
   */
  const joinRoom = useCallback(async (roomId: string, roomName?: string) => {
    if (!socketRef.current?.connected) {
      throw new Error('未连接到服务器');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('加入房间超时'));
      }, 10000);

      socketRef.current!.emit('join_room', { roomId, roomName });

      const handleRoomJoined = (data: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('room_joined', handleRoomJoined);
        socketRef.current!.off('error', handleError);
        resolve();
      };

      const handleError = (error: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('room_joined', handleRoomJoined);
        socketRef.current!.off('error', handleError);
        reject(new Error(error.message || '加入房间失败'));
      };

      socketRef.current!.once('room_joined', handleRoomJoined);
      socketRef.current!.once('error', handleError);
    });
  }, []);

  /**
   * 离开房间
   */
  const leaveRoom = useCallback(async (roomId: string) => {
    if (!socketRef.current?.connected) {
      throw new Error('未连接到服务器');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('离开房间超时'));
      }, 10000);

      socketRef.current!.emit('leave_room', { roomId });

      const handleRoomLeft = (data: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('room_left', handleRoomLeft);
        socketRef.current!.off('error', handleError);
        resolve();
      };

      const handleError = (error: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('room_left', handleRoomLeft);
        socketRef.current!.off('error', handleError);
        reject(new Error(error.message || '离开房间失败'));
      };

      socketRef.current!.once('room_left', handleRoomLeft);
      socketRef.current!.once('error', handleError);
    });
  }, []);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(async (
    roomId: string,
    content: string,
    type: string = 'text'
  ) => {
    if (!socketRef.current?.connected) {
      throw new Error('未连接到服务器');
    }

    if (!content.trim()) {
      throw new Error('消息内容不能为空');
    }

    if (content.length > 1000) {
      throw new Error('消息内容不能超过1000个字符');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('发送消息超时'));
      }, 10000);

      socketRef.current!.emit('send_message', { roomId, content, type });

      const handleMessageSent = (data: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('message_sent', handleMessageSent);
        socketRef.current!.off('error', handleError);
        resolve();
      };

      const handleError = (error: any) => {
        clearTimeout(timeout);
        socketRef.current!.off('message_sent', handleMessageSent);
        socketRef.current!.off('error', handleError);
        reject(new Error(error.message || '发送消息失败'));
      };

      socketRef.current!.once('message_sent', handleMessageSent);
      socketRef.current!.once('error', handleError);
    });
  }, []);

  /**
   * 获取房间列表
   */
  const getRooms = useCallback(async () => {
    if (!socketRef.current?.connected) {
      throw new Error('未连接到服务器');
    }

    socketRef.current.emit('get_rooms');
  }, []);

  /**
   * 清空消息列表
   */
  const clearMessages = useCallback(() => {
    updateState({ messages: [] });
    messageCacheRef.current.clear();
  }, [updateState]);

  // 组件挂载时自动连接
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    state,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    getRooms,
    clearMessages
  };
};

export default useSocketIO;