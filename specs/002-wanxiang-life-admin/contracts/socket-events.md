# Socket.IO Events Contract

**Date**: 2025-10-18
**Purpose**: Define real-time communication events between frontend and backend

## Connection Management

### Client-to-Server Events

#### authenticate
**Purpose**: 用户身份认证
**Payload**:
```typescript
{
  token: string; // JWT access token
}
```
**Server Response**: `authenticated` | `authentication_error`

#### disconnect
**Purpose**: 断开连接
**Payload**: 无

#### heartbeat
**Purpose**: 心跳检测
**Payload**: 无
**Server Response**: `pong`

### Server-to-Client Events

#### authenticated
**Purpose**: 认证成功
**Payload**:
```typescript
{
  user: User;
  permissions: Permission[];
  sessionId: string;
}
```

#### authentication_error
**Purpose**: 认证失败
**Payload**:
```typescript
{
  error: string;
  code: string;
}
```

#### pong
**Purpose**: 心跳响应
**Payload**: 无

#### disconnected
**Purpose**: 连接断开
**Payload**:
```typescript
{
  reason: 'timeout' | 'server_shutdown' | 'client_disconnect';
  message?: string;
}
```

## Chat Events

### Client-to-Server Events

#### join_chat
**Purpose**: 加入聊天房间
**Payload**:
```typescript
{
  chatId: string;
}
```

#### leave_chat
**Purpose**: 离开聊天房间
**Payload**:
```typescript
{
  chatId: string;
}
```

#### send_message
**Purpose**: 发送消息
**Payload**:
```typescript
{
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  replyToId?: string;
  attachments?: string[]; // file IDs
}
```

#### mark_messages_read
**Purpose**: 标记消息已读
**Payload**:
```typescript
{
  chatId: string;
  messageIds: string[];
}
```

#### typing_start
**Purpose**: 开始输入
**Payload**:
```typescript
{
  chatId: string;
}
```

#### typing_stop
**Purpose**: 停止输入
**Payload**:
```typescript
{
  chatId: string;
}
```

#### delete_message
**Purpose**: 删除消息
**Payload**:
```typescript
{
  messageId: string;
  chatId: string;
}
```

#### edit_message
**Purpose**: 编辑消息
**Payload**:
```typescript
{
  messageId: string;
  chatId: string;
  content: string;
}
```

### Server-to-Client Events

#### message_received
**Purpose**: 接收到新消息
**Payload**:
```typescript
{
  message: Message;
  chatId: string;
}
```

#### message_updated
**Purpose**: 消息更新
**Payload**:
```typescript
{
  messageId: string;
  chatId: string;
  content: string;
  editedAt: string;
}
```

#### message_deleted
**Purpose**: 消息删除
**Payload**:
```typescript
{
  messageId: string;
  chatId: string;
  deletedAt: string;
}
```

#### user_joined_chat
**Purpose**: 用户加入聊天
**Payload**:
```typescript
{
  userId: string;
  user: User;
  chatId: string;
  joinedAt: string;
}
```

#### user_left_chat
**Purpose**: 用户离开聊天
**Payload**:
```typescript
{
  userId: string;
  chatId: string;
  leftAt: string;
}
```

#### user_typing
**Purpose**: 用户正在输入
**Payload**:
```typescript
{
  userId: string;
  username: string;
  chatId: string;
}
```

#### user_stopped_typing
**Purpose**: 用户停止输入
**Payload**:
```typescript
{
  userId: string;
  chatId: string;
}
```

#### messages_read
**Purpose**: 消息已读
**Payload**:
```typescript
{
  chatId: string;
  userId: string;
  messageIds: string[];
  readAt: string;
}
```

#### chat_updated
**Purpose**: 聊天信息更新
**Payload**:
```typescript
{
  chatId: string;
  updates: Partial<Chat>;
  updatedAt: string;
}
```

## User Status Events

### Server-to-Client Events

#### user_online
**Purpose**: 用户上线
**Payload**:
```typescript
{
  userId: string;
  onlineAt: string;
}
```

#### user_offline
**Purpose**: 用户下线
**Payload**:
```typescript
{
  userId: string;
  offlineAt: string;
  lastSeen: string;
}
```

#### user_status_changed
**Purpose**: 用户状态变更
**Payload**:
```typescript
{
  userId: string;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  changedAt: string;
}
```

#### user_profile_updated
**Purpose**: 用户资料更新
**Payload**:
```typescript
{
  userId: string;
  updates: Partial<User>;
  updatedAt: string;
}
```

## Task Events

### Server-to-Client Events

#### task_created
**Purpose**: 新任务创建
**Payload**:
```typescript
{
  task: Task;
  createdBy: string;
  createdAt: string;
}
```

#### task_updated
**Purpose**: 任务更新
**Payload**:
```typescript
{
  taskId: string;
  updates: Partial<Task>;
  updatedBy: string;
  updatedAt: string;
}
```

#### task_assigned
**Purpose**: 任务分配
**Payload**:
```typescript
{
  task: Task;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
}
```

#### task_status_changed
**Purpose**: 任务状态变更
**Payload**:
```typescript
{
  taskId: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}
```

#### task_completed
**Purpose**: 任务完成
**Payload**:
```typescript
{
  task: Task;
  completedBy: string;
  completedAt: string;
  completionNotes?: string;
}
```

#### task_confirmed
**Purpose**: 任务确认完成
**Payload**:
```typescript
{
  task: Task;
  confirmedBy: string;
  confirmedAt: string;
  rating?: number;
  feedback?: string;
}
```

#### task_cancelled
**Purpose**: 任务取消
**Payload**:
```typescript
{
  taskId: string;
  cancelledBy: string;
  cancelledAt: string;
  reason: string;
}
```

#### task_disputed
**Purpose**: 任务纠纷
**Payload**:
```typescript
{
  task: Task;
  disputeId: string;
  disputedBy: string;
  disputedAt: string;
  reason: string;
}
```

## Payment Events

### Server-to-Client Events

#### payment_created
**Purpose**: 支付创建
**Payload**:
```typescript
{
  payment: Payment;
  createdAt: string;
}
```

#### payment_status_changed
**Purpose**: 支付状态变更
**Payload**:
```typescript
{
  paymentId: string;
  oldStatus: PaymentStatus;
  newStatus: PaymentStatus;
  changedAt: string;
  transactionId?: string;
}
```

#### payment_completed
**Purpose**: 支付完成
**Payload**:
```typescript
{
  payment: Payment;
  completedAt: string;
}
```

#### payment_refunded
**Purpose**: 支付退款
**Payload**:
```typescript
{
  payment: Payment;
  refundedAt: string;
  refundReason: string;
  refundAmount: number;
}
```

#### escrow_released
**Purpose**: 托管资金释放
**Payload**:
```typescript
{
  paymentId: string;
  taskId: string;
  amount: number;
  releasedTo: string;
  releasedAt: string;
}
```

## Notification Events

### Client-to-Server Events

#### subscribe_notifications
**Purpose**: 订阅通知
**Payload**:
```typescript
{
  types?: NotificationType[];
  preferences?: NotificationPreferences;
}
```

#### unsubscribe_notifications
**Purpose**: 取消订阅通知
**Payload**:
```typescript
{
  types?: NotificationType[];
}
```

#### mark_notification_read
**Purpose**: 标记通知已读
**Payload**:
```typescript
{
  notificationId: string;
}
```

### Server-to-Client Events

#### notification_received
**Purpose**: 接收通知
**Payload**:
```typescript
{
  notification: Notification;
  createdAt: string;
}
```

#### notifications_marked_read
**Purpose**: 通知已读标记
**Payload**:
```typescript
{
  notificationIds: string[];
  markedBy: string;
  markedAt: string;
}
```

#### notification_preferences_updated
**Purpose**: 通知偏好更新
**Payload**:
```typescript
{
  userId: string;
  preferences: NotificationPreferences;
  updatedAt: string;
}
```

## AI Service Events

### Client-to-Server Events

#### join_ai_session
**Purpose**: 加入AI客服会话
**Payload**:
```typescript
{
  sessionId: string;
}
```

#### leave_ai_session
**Purpose**: 离开AI客服会话
**Payload**:
```typescript
{
  sessionId: string;
}
```

#### send_ai_message
**Purpose**: 发送AI消息
**Payload**:
```typescript
{
  sessionId: string;
  content: string;
  type: 'text';
  context?: Record<string, any>;
}
```

#### rate_ai_service
**Purpose**: 评价AI服务
**Payload**:
```typescript
{
  sessionId: string;
  rating: number; // 1-5
  feedback?: string;
}
```

### Server-to-Client Events

#### ai_message_received
**Purpose**: 接收AI回复
**Payload**:
```typescript
{
  sessionId: string;
  message: AIMessage;
  responseTime: number; // ms
}
```

#### ai_session_started
**Purpose**: AI会话开始
**Payload**:
```typescript
{
  session: AISession;
  startedAt: string;
}
```

#### ai_session_escalated
**Purpose**: AI会话升级到人工
**Payload**:
```typescript
{
  sessionId: string;
  escalatedTo: string; // human agent ID
  escalatedAt: string;
  reason: string;
}
```

#### ai_session_ended
**Purpose**: AI会话结束
**Payload**:
```typescript
{
  sessionId: string;
  endedAt: string;
  reason: 'resolved' | 'timeout' | 'user_ended' | 'escalated';
  resolved: boolean;
}
```

#### ai_typing
**Purpose**: AI正在输入
**Payload**:
```typescript
{
  sessionId: string;
  typing: boolean;
}
```

## System Events

### Server-to-Client Events

#### system_maintenance
**Purpose**: 系统维护通知
**Payload**:
```typescript
{
  type: 'scheduled' | 'emergency';
  startTime: string;
  endTime?: string;
  message: string;
  affectedFeatures: string[];
}
```

#### system_announcement
**Purpose**: 系统公告
**Payload**:
```typescript
{
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'merchants' | 'workers' | 'admins';
  publishedAt: string;
  expiresAt?: string;
}
```

#### feature_flag_updated
**Purpose**: 功能开关更新
**Payload**:
```typescript
{
  flagName: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  updatedAt: string;
}
```

#### rate_limit_warning
**Purpose**: 速率限制警告
**Payload**:
```typescript
{
  limitType: string;
  currentUsage: number;
  limit: number;
  resetTime: string;
  warningLevel: 'warning' | 'critical';
}
```

## Admin Events

### Server-to-Client Events (Admin-only)

#### admin_user_action
**Purpose**: 用户管理操作
**Payload**:
```typescript
{
  action: 'created' | 'updated' | 'suspended' | 'deleted' | 'verified';
  userId: string;
  performedBy: string;
  performedAt: string;
  details?: Record<string, any>;
}
```

#### admin_system_stats
**Purpose**: 系统统计更新
**Payload**:
```typescript
{
  stats: SystemStats;
  timestamp: string;
}
```

#### admin_security_alert
**Purpose**: 安全警报
**Payload**:
```typescript
{
  alertType: 'suspicious_login' | 'mass_registration' | 'api_abuse' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details: Record<string, any>;
  detectedAt: string;
}
```

#### admin_performance_metric
**Purpose**: 性能指标
**Payload**:
```typescript
{
  metric: string;
  value: number;
  unit: string;
  threshold?: number;
  timestamp: string;
  source: string;
}
```

## Error Events

### Server-to-Client Events

#### error
**Purpose**: 通用错误
**Payload**:
```typescript
{
  code: string;
  message: string;
  details?: Record<string, any>;
  eventId: string;
  timestamp: string;
}
```

#### rate_limited
**Purpose**: 速率限制
**Payload**:
```typescript
{
  endpoint: string;
  limit: number;
  windowMs: number;
  retryAfter: number;
  timestamp: string;
}
```

#### validation_error
**Purpose**: 数据验证错误
**Payload**:
```typescript
{
  field: string;
  message: string;
  value?: any;
  timestamp: string;
}
```

## Connection Rooms

### Default Rooms
- **user:{userId}**: 用户个人房间，接收个人通知
- **role:{role}**: 角色房间，接收角色相关通知
- **admin**: 管理员房间，接收管理员通知

### Dynamic Rooms
- **chat:{chatId}**: 聊天房间，接收聊天消息
- **task:{taskId}**: 任务房间，接收任务更新
- **ai_session:{sessionId}**: AI客服会话房间

## Event Acknowledgments

### Client Acknowledgment Pattern
客户端可以选择确认收到事件：

```typescript
// 客户端发送
socket.emit('send_message', messageData, (ack: Acknowledgment) => {
  if (ack.success) {
    console.log('Message sent successfully');
  } else {
    console.error('Failed to send message:', ack.error);
  }
});

// 服务端确认格式
interface Acknowledgment {
  success: boolean;
  data?: any;
  error?: string;
  eventId: string;
  timestamp: string;
}
```

## Message Format Standards

### Timestamp Format
所有时间戳使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.sssZ`

### ID Format
所有ID使用 UUID v4 格式的字符串

### Pagination
对于大量数据的事件，使用分页格式：

```typescript
interface PaginatedEvent<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
  eventId: string;
  timestamp: string;
}
```

## Security Considerations

### Authentication Required Events
以下事件需要身份认证：
- 所有聊天相关事件
- 所有用户状态更新事件
- 所有通知订阅事件
- 所有AI客服事件

### Rate Limiting
以下事件有速率限制：
- `send_message`: 10条/分钟
- `typing_start`: 30次/分钟
- `send_ai_message`: 20条/分钟

### Authorization Check
服务端会验证用户是否有权限：
- 加入特定聊天房间
- 接收特定任务更新
- 访问管理员事件

## Error Handling

### Client-Side Error Handling
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);

  switch (error.code) {
    case 'AUTHENTICATION_FAILED':
      // 重新认证
      break;
    case 'RATE_LIMITED':
      // 显示速率限制提示
      break;
    case 'VALIDATION_ERROR':
      // 显示验证错误
      break;
    default:
      // 显示通用错误
  }
});
```

### Reconnection Strategy
```typescript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // 服务器主动断开，需要重新连接
    socket.connect();
  }
  // 其他原因会自动重连
});
```

## Testing Events

### Mock Event Format
```typescript
interface MockSocketEvent {
  event: string;
  payload: any;
  acknowledgment?: (response: any) => void;
  timestamp: string;
}
```

### Event Validation
所有事件数据都应该通过对应的Zod schema验证：
```typescript
const messageEventSchema = z.object({
  message: messageSchema,
  chatId: z.string().uuid(),
});
```