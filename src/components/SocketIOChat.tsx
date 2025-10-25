/**
 * Socket.IO聊天组件
 *
 * 提供完整的聊天功能，包括：
 * - 房间管理
 * - 消息发送和接收
 * - 连接状态显示
 * - 错误处理
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSocketIO } from '../hooks/useSocketIO';
import './SocketIOChat.css';

interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  type: string;
  timestamp: number;
}

interface Room {
  id: string;
  name: string;
  memberCount: number;
  isShard: boolean;
  shardId?: number;
}

const SocketIOChat: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [messageError, setMessageError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocketIO({
    token: isAuthenticated ? token : undefined,
    autoConnect: isAuthenticated
  });

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [socket.state.messages]);

  // 处理登录
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setIsAuthenticated(true);
        setAuthError('');
        setPassword(''); // 清空密码
      } else {
        setAuthError(data.error || '登录失败');
      }
    } catch (error) {
      setAuthError('网络错误，请重试');
    }
  };

  // 处理加入房间
  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      setMessageError('请输入房间ID');
      return;
    }

    try {
      await socket.joinRoom(roomInput.trim(), roomNameInput.trim() || undefined);
      setCurrentRoom(roomInput.trim());
      setRoomInput('');
      setRoomNameInput('');
      setShowJoinRoom(false);
      setMessageError('');
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : '加入房间失败');
    }
  };

  // 处理离开房间
  const handleLeaveRoom = async () => {
    if (!currentRoom) return;

    try {
      await socket.leaveRoom(currentRoom);
      setCurrentRoom('');
      socket.clearMessages();
      setMessageError('');
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : '离开房间失败');
    }
  };

  // 处理发送消息
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    if (!currentRoom) {
      setMessageError('请先加入房间');
      return;
    }

    try {
      await socket.sendMessage(currentRoom, messageInput.trim());
      setMessageInput('');
      setMessageError('');
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : '发送消息失败');
    }
  };

  // 格式化时间戳
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取连接状态颜色
  const getConnectionStatusColor = () => {
    if (socket.state.connected) return '#4CAF50';
    if (socket.state.connecting) return '#FF9800';
    return '#F44336';
  };

  // 获取连接状态文本
  const getConnectionStatusText = () => {
    if (socket.state.connected) return '已连接';
    if (socket.state.connecting) return '连接中...';
    return '未连接';
  };

  // 如果未认证，显示登录界面
  if (!isAuthenticated) {
    return (
      <div className="socketio-chat">
        <div className="auth-container">
          <div className="auth-card">
            <h2>Socket.IO 聊天室</h2>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">用户名:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="请输入用户名"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">密码:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="请输入密码"
                />
              </div>
              {authError && <div className="error-message">{authError}</div>}
              <button type="submit" className="auth-button">
                登录
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="socketio-chat">
      {/* 连接状态栏 */}
      <div className="status-bar">
        <div className="connection-status">
          <span
            className="status-indicator"
            style={{ backgroundColor: getConnectionStatusColor() }}
          />
          <span>{getConnectionStatusText()}</span>
          {socket.state.connectionCount > 0 && (
            <span className="connection-count">
              (重连次数: {socket.state.connectionCount})
            </span>
          )}
        </div>
        <div className="user-info">
          <span>用户: {username}</span>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setToken('');
              socket.disconnect();
            }}
            className="logout-button"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {socket.state.error && (
        <div className="error-bar">
          <span className="error-icon">⚠️</span>
          <span>{socket.state.error}</span>
        </div>
      )}

      {messageError && (
        <div className="error-bar">
          <span className="error-icon">⚠️</span>
          <span>{messageError}</span>
          <button onClick={() => setMessageError('')} className="error-close">×</button>
        </div>
      )}

      <div className="chat-container">
        {/* 侧边栏 */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>房间管理</h3>
            <div className="room-actions">
              <button
                onClick={() => setShowJoinRoom(!showJoinRoom)}
                className="room-button"
                disabled={!socket.state.connected}
              >
                加入房间
              </button>
              <button
                onClick={() => socket.getRooms()}
                className="room-button"
                disabled={!socket.state.connected}
              >
                刷新房间
              </button>
            </div>
          </div>

          {/* 加入房间表单 */}
          {showJoinRoom && (
            <div className="join-room-form">
              <input
                type="text"
                placeholder="房间ID"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="room-input"
              />
              <input
                type="text"
                placeholder="房间名称 (可选)"
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                className="room-input"
              />
              <div className="room-form-actions">
                <button onClick={handleJoinRoom} className="join-button">
                  加入
                </button>
                <button
                  onClick={() => {
                    setShowJoinRoom(false);
                    setRoomInput('');
                    setRoomNameInput('');
                  }}
                  className="cancel-button"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 当前房间 */}
          {currentRoom && (
            <div className="current-room">
              <h4>当前房间</h4>
              <div className="room-item active">
                <span className="room-name">{currentRoom}</span>
                <button
                  onClick={handleLeaveRoom}
                  className="leave-button"
                  disabled={!socket.state.connected}
                >
                  离开
                </button>
              </div>
            </div>
          )}

          {/* 房间列表 */}
          <div className="rooms-list">
            <h4>已加入房间 ({socket.state.rooms.length})</h4>
            {socket.state.rooms.length === 0 ? (
              <p className="no-rooms">暂无房间</p>
            ) : (
              socket.state.rooms.map((roomId) => (
                <div
                  key={roomId}
                  className={`room-item ${roomId === currentRoom ? 'active' : ''}`}
                  onClick={() => setCurrentRoom(roomId)}
                >
                  <span className="room-name">{roomId}</span>
                </div>
              ))
            )}
          </div>

          {/* 统计信息 */}
          <div className="stats">
            <h4>统计信息</h4>
            <div className="stat-item">
              <span>消息数:</span>
              <span>{socket.state.messages.length}</span>
            </div>
            <div className="stat-item">
              <span>连接状态:</span>
              <span style={{ color: getConnectionStatusColor() }}>
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="chat-area">
          <div className="chat-header">
            <h3>
              {currentRoom ? `房间: ${currentRoom}` : '请选择一个房间'}
            </h3>
          </div>

          <div className="messages-container">
            {socket.state.messages.length === 0 ? (
              <div className="no-messages">
                {currentRoom ? '暂无消息，开始聊天吧！' : '请先加入一个房间'}
              </div>
            ) : (
              socket.state.messages
                .filter(msg => currentRoom ? msg.roomId === currentRoom : true)
                .map((message: Message) => (
                  <div key={message.id} className="message">
                    <div className="message-header">
                      <span className="message-author">{message.username}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 消息输入框 */}
          <form onSubmit={handleSendMessage} className="message-input-container">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={
                !socket.state.connected
                  ? '连接中...'
                  : !currentRoom
                  ? '请先加入房间'
                  : '输入消息...'
              }
              className="message-input"
              disabled={!socket.state.connected || !currentRoom}
              maxLength={1000}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!socket.state.connected || !currentRoom || !messageInput.trim()}
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SocketIOChat;