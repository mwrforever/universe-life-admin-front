# Data Model: 万象生活后台管理端

**Date**: 2025-10-18
**Purpose**: Define frontend data structures and state management schema

## Core Domain Models

### User Management

#### User Entity
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  address: string;
  avatar?: string;
  bio?: string;
  verificationLevel: VerificationLevel;
  statistics: UserStatistics;
  rating: UserRating;
  bankAccounts: BankAccount[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  status: UserStatus;
  role: UserRole;
}

interface UserStatistics {
  perfectTasksCount: number;
  normalTasksCount: number;
  overtimeTasksCount: number;
  incompleteTasksCount: number;
  totalTasksTaken: number;
  totalEarnings: number;
  successRate: number;
}

interface UserRating {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
}

interface BankAccount {
  id: string;
  type: 'wechat' | 'alipay' | 'bank';
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isVerified: boolean;
}

enum VerificationLevel {
  BASIC = 'basic',
  VERIFIED = 'verified',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  WORKER = 'worker'
}
```

#### Authentication State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}
```

### Task Management

#### Task Entity
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  content: string;
  commission: number;
  deadline: Date;
  status: TaskStatus;
  category: TaskCategory;
  priority: TaskPriority;
  merchantId: string;
  merchant: User;
  workerId?: string;
  worker?: User;
  attachments: TaskAttachment[];
  requirements: TaskRequirement[];
  timeline: TaskTimeline[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  assignedAt?: Date;
  completedAt?: Date;
  confirmedAt?: Date;
}

interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface TaskRequirement {
  id: string;
  description: string;
  type: RequirementType;
  isRequired: boolean;
  options?: string[];
}

interface TaskTimeline {
  id: string;
  eventType: TaskEventType;
  description: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

enum TaskStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

enum TaskCategory {
  DELIVERY = 'delivery',
  CONSULTING = 'consulting',
  DESIGN = 'design',
  DEVELOPMENT = 'development',
  WRITING = 'writing',
  TRANSLATION = 'translation',
  CUSTOMER_SERVICE = 'customer_service',
  OTHER = 'other'
}

enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### Payment & Transactions

#### Payment Entity
```typescript
interface Payment {
  id: string;
  taskId: string;
  task: Task;
  amount: number;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  merchantId: string;
  workerId?: string;
  transactionId?: string;
  platformFee?: number;
  escrowReleasedAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  processedAt?: Date;
}

interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  referenceType?: TransactionReferenceType;
  createdAt: Date;
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  ESCROW = 'escrow'
}

enum PaymentType {
  TASK_COMMISSION = 'task_commission',
  PLATFORM_FEE = 'platform_fee',
  REFUND = 'refund',
  PENALTY = 'penalty',
  BONUS = 'bonus'
}

enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TASK_PAYMENT = 'task_payment',
  REFUND = 'refund',
  FEE = 'fee'
}
```

### Chat & Messaging

#### Chat Entity
```typescript
interface Chat {
  id: string;
  type: ChatType;
  participants: ChatParticipant[];
  taskId?: string;
  task?: Task;
  lastMessage?: Message;
  unreadCounts: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachments?: MessageAttachment[];
  replyToId?: string;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  readReceipts: MessageReadReceipt[];
  createdAt: Date;
}

interface ChatParticipant {
  userId: string;
  user: User;
  role: ChatRole;
  joinedAt: Date;
  lastReadAt?: Date;
  isOnline: boolean;
  lastSeenAt?: Date;
}

interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface MessageReadReceipt {
  userId: string;
  readAt: Date;
}

enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  TASK_CHAT = 'task_chat'
}

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  VOICE = 'voice'
}

enum ChatRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}
```

### Reports & Analytics

#### Report Entity
```typescript
interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  config: ReportConfig;
  template: ReportTemplate;
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  permissions: ReportPermission[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastGeneratedAt?: Date;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  layout: ReportLayout;
  charts: ChartConfig[];
  dataSource: DataSource;
  format: ReportFormat;
}

interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataSource: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  styling: ChartStyling;
}

interface DataSource {
  type: DataSourceType;
  endpoint: string;
  query: string;
  refreshInterval?: number;
  parameters?: Record<string, any>;
}

enum ReportType {
  USER_ANALYTICS = 'user_analytics',
  TASK_ANALYTICS = 'task_analytics',
  FINANCIAL_REPORT = 'financial_report',
  PERFORMANCE_REPORT = 'performance_report',
  CUSTOM_REPORT = 'custom_report'
}

enum ReportCategory {
  USERS = 'users',
  TASKS = 'tasks',
  PAYMENTS = 'payments',
  CHAT = 'chat',
  SYSTEM = 'system'
}
```

### AI Customer Service

#### AI Service Entity
```typescript
interface AIServiceSession {
  id: string;
  userId: string;
  taskId?: string;
  status: SessionStatus;
  messages: AIServiceMessage[];
  context: ServiceContext;
  satisfaction?: number;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

interface AIServiceMessage {
  id: string;
  sessionId: string;
  sender: MessageSender;
  content: string;
  type: MessageType;
  confidence?: number;
  suggestions?: string[];
  escalatedToHuman: boolean;
  createdAt: Date;
}

interface ServiceContext {
  taskId?: string;
  previousIssues?: string[];
  userTier: string;
  language: string;
  preferences: UserPreferences;
}

enum SessionStatus {
  ACTIVE = 'active',
  WAITING = 'waiting',
  ESCALATED = 'escalated',
  CLOSED = 'closed'
}

enum MessageSender {
  USER = 'user',
  AI = 'ai',
  HUMAN_AGENT = 'human_agent'
}
```

## State Management Structure

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  users: UsersState;
  tasks: TasksState;
  payments: PaymentsState;
  chat: ChatState;
  reports: ReportsState;
  aiService: AIServiceState;
  ui: UIState;
  notifications: NotificationsState;
}
```

### Feature States
```typescript
// Users Slice
interface UsersState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: Pagination;
}

// Tasks Slice
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: Pagination;
  categories: TaskCategory[];
}

// Chat Slice
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Record<string, Message[]>;
  onlineUsers: Record<string, boolean>;
  typingUsers: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

// Reports Slice
interface ReportsState {
  reports: Report[];
  templates: ReportTemplate[];
  currentReport: Report | null;
  reportData: Record<string, any[]>;
  loading: boolean;
  error: string | null;
}
```

## API Response Models

### Standard API Response
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta?: ResponseMeta;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp: string;
  requestId: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Filter Models
```typescript
interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  verificationLevel?: VerificationLevel;
  dateRange?: DateRange;
  search?: string;
}

interface TaskFilters {
  status?: TaskStatus[];
  category?: TaskCategory;
  priority?: TaskPriority;
  merchantId?: string;
  workerId?: string;
  dateRange?: DateRange;
  commissionRange?: NumberRange;
  search?: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface NumberRange {
  min: number;
  max: number;
}
```

## Validation Schemas

### User Validation (Zod)
```typescript
const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().min(18).max(100),
  address: z.string().min(5).max(200),
  bio: z.string().max(500).optional(),
  bankAccounts: z.array(bankAccountSchema).optional()
});

const bankAccountSchema = z.object({
  type: z.enum(['wechat', 'alipay', 'bank']),
  accountNumber: z.string().min(5),
  accountName: z.string().min(2),
  isDefault: z.boolean()
});
```

### Task Validation (Zod)
```typescript
const taskSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500),
  content: z.string().min(20),
  commission: z.number().min(1),
  deadline: z.date().min(new Date()),
  category: z.enum(taskCategoryValues),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  requirements: z.array(requirementSchema)
});

const requirementSchema = z.object({
  description: z.string().min(5),
  type: z.enum(['text', 'file', 'selection']),
  isRequired: z.boolean(),
  options: z.array(z.string()).optional()
});
```

## Socket.IO Event Types

### Client-to-Server Events
```typescript
interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void;

  // Chat events
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  send_message: (data: SendMessageData) => void;
  mark_messages_read: (chatId: string, messageIds: string[]) => void;
  typing_start: (chatId: string) => void;
  typing_stop: (chatId: string) => void;

  // Real-time notifications
  subscribe_notifications: () => void;
  unsubscribe_notifications: () => void;
}

interface SendMessageData {
  chatId: string;
  content: string;
  type: MessageType;
  attachments?: File[];
  replyToId?: string;
}
```

### Server-to-Client Events
```typescript
interface ServerToClientEvents {
  // Authentication
  authenticated: (user: User) => void;
  authentication_error: (error: string) => void;

  // Chat events
  message_received: (message: Message) => void;
  message_updated: (messageId: string, content: string) => void;
  message_deleted: (messageId: string) => void;
  user_joined_chat: (userId: string, chatId: string) => void;
  user_left_chat: (userId: string, chatId: string) => void;
  user_typing: (userId: string, chatId: string) => void;
  user_stopped_typing: (userId: string, chatId: string) => void;
  messages_read: (chatId: string, userId: string, messageIds: string[]) => void;

  // User status
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;

  // Notifications
  notification_received: (notification: Notification) => void;

  // Task updates
  task_updated: (task: Task) => void;
  task_assigned: (task: Task) => void;
  task_completed: (task: Task) => void;
}
```

## Data Flow Patterns

### Data Fetching Pattern
```typescript
// RTK Query API Slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Task', 'Chat', 'Payment', 'Report'],
  endpoints: (builder) => ({
    // User endpoints
    getUsers: builder.query<User[], UserFilters>({
      query: (filters) => ({ url: 'users', params: filters }),
      providesTags: ['User'],
    }),
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Task endpoints
    getTasks: builder.query<Task[], TaskFilters>({
      query: (filters) => ({ url: 'tasks', params: filters }),
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<Task, CreateTaskData>({
      query: (task) => ({
        url: 'tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});
```

### Real-time Data Sync Pattern
```typescript
// Socket Integration with Redux
export const socketMiddleware = (socket: Socket) => (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
  const result = next(action);

  // Handle specific actions that need to emit socket events
  if (sendMessage.match(action)) {
    socket.emit('send_message', action.payload);
  }

  if (joinChat.match(action)) {
    socket.emit('join_chat', action.payload);
  }

  return result;
};

// Socket event handlers
export const setupSocketListeners = (socket: Socket, dispatch: Dispatch) => {
  socket.on('message_received', (message: Message) => {
    dispatch(messageReceived(message));
  });

  socket.on('task_updated', (task: Task) => {
    dispatch(taskUpdated(task));
  });

  socket.on('notification_received', (notification: Notification) => {
    dispatch(notificationReceived(notification));
  });
};
```

This data model provides a comprehensive foundation for the 万象生活 admin frontend, covering all major domain entities with proper TypeScript typing, validation schemas, and state management patterns.