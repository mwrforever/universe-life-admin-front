/**
 * 聊天室页面
 *
 * 集成Socket.IO聊天功能的主要页面组件
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import SocketIOChat from '@/components/SocketIOChat'

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="chat-room-page">
      <SocketIOChat />
    </div>
  )
}

export default ChatRoom