/**
 * 聊天室页面
 *
 * 集成Socket.IO聊天功能的主要页面组件
 */

import React from 'react'
import SocketIOChat from '@/components/SocketIOChat'

const ChatRoom: React.FC = () => {
  return (
    <div className="chat-room-page">
      <SocketIOChat />
    </div>
  )
}

export default ChatRoom