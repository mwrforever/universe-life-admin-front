/**
 * 聊天列表页面
 *
 * 显示所有聊天室和会话列表
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Space, Typography, Tag } from 'antd'

const { Title, Text } = Typography
const { Search } = Input

const ChatList: React.FC = () => {
  const navigate = useNavigate()

  // 模拟聊天室数据
  const chatRooms = [
    {
      id: 'general',
      name: '公共聊天室',
      description: '大家都可以聊天的公共空间',
      memberCount: 156,
      tags: ['公共', '活跃'],
      lastMessage: '刚刚有人发送了一条消息',
      unreadCount: 3
    },
    {
      id: 'tech',
      name: '技术交流',
      description: '讨论技术问题和分享经验',
      memberCount: 89,
      tags: ['技术', '问答'],
      lastMessage: '有人问了一个关于React的问题',
      unreadCount: 0
    },
    {
      id: 'random',
      name: '随机聊天',
      description: '随机话题，轻松聊天',
      memberCount: 234,
      tags: ['休闲', '娱乐'],
      lastMessage: '分享了一个有趣的链接',
      unreadCount: 7
    }
  ]

  const handleJoinRoom = (roomId: string) => {
    navigate(`/chat/${roomId}`)
  }

  return (
    <div className="chat-list-page" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>聊天室</Title>
        <Text type="secondary">选择一个聊天室开始对话</Text>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Space size="middle">
          <Search
            placeholder="搜索聊天室..."
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Button type="primary">创建聊天室</Button>
        </Space>
      </div>

      <div className="chat-rooms-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {chatRooms.map(room => (
          <Card
            key={room.id}
            hoverable
            size="small"
            actions={[
              <Button
                type="primary"
                onClick={() => handleJoinRoom(room.id)}
                style={{ width: '100%' }}
              >
                进入聊天室
              </Button>
            ]}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{room.name}</span>
                  {room.unreadCount > 0 && (
                    <Tag color="red">{room.unreadCount}</Tag>
                  )}
                </div>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {room.description}
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    {room.tags.map(tag => (
                      <Tag key={tag} style={{ marginRight: '4px', fontSize: '12px' }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    <div>成员: {room.memberCount}人</div>
                    <div>最新: {room.lastMessage}</div>
                  </div>
                </div>
              }
            />
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ChatList