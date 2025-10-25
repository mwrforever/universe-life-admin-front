# Quick Start Guide: 万象生活后台管理端

**Date**: 2025-10-18
**Purpose**: 快速上手指南，帮助开发者快速开始项目开发

## 项目概述

万象生活后台管理端是一个企业级的任务管理平台，支持用户管理、任务发布、交易处理、实时聊天、AI客服、数据报表等11个核心功能模块。

### 技术栈
- **前端**: React 18+ + TypeScript + Vite
- **UI框架**: Ant Design 5.x
- **状态管理**: Redux Toolkit + RTK Query
- **路由**: React Router v6
- **实时通信**: Socket.IO Client
- **表单**: React Hook Form + Zod
- **图表**: ECharts + Recharts
- **构建工具**: Vite
- **测试**: Jest + React Testing Library + Cypress

## 环境准备

### 系统要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git >= 2.30.0

### IDE推荐设置
- **VS Code** + 以下插件：
  - TypeScript Importer
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

### 开发工具配置

#### VS Code settings.json
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 项目初始化

### 1. 克隆项目
```bash
git clone <repository-url>
cd universe-life-admin-front
```

### 2. 安装依赖
```bash
npm install
# 或
yarn install
```

### 3. 环境变量配置
创建 `.env.local` 文件：
```bash
# API配置
VITE_API_BASE_URL=http://localhost:3001/v1
VITE_SOCKET_URL=http://localhost:3001

# 应用配置
VITE_APP_NAME=万象生活管理端
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_AI_SERVICE=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false

# 第三方服务
VITE_UPLOAD_URL=http://localhost:3001/upload
VITE_CDN_URL=http://localhost:3001/static
```

### 4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:5173 查看应用

## 项目结构详解

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用基础组件
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── layout/         # 布局组件
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   └── charts/         # 图表组件
│       ├── LineChart/
│       ├── BarChart/
│       └── PieChart/
├── pages/              # 页面组件
│   ├── auth/           # 认证相关页面
│   │   ├── Login/
│   │   ├── Register/
│   │   └── ForgotPassword/
│   ├── dashboard/      # 仪表板
│   ├── users/          # 用户管理
│   ├── tasks/          # 任务管理
│   ├── payments/       # 支付管理
│   ├── chat/           # 聊天功能
│   ├── ai-service/     # AI客服
│   ├── reports/        # 报表管理
│   └── admin/          # 系统管理
├── store/              # Redux状态管理
│   ├── slices/         # Redux Toolkit切片
│   │   ├── authSlice.ts
│   │   ├── usersSlice.ts
│   │   ├── tasksSlice.ts
│   │   └── index.ts
│   └── api/            # RTK Query API
│       ├── authApi.ts
│       ├── usersApi.ts
│       └── index.ts
├── services/           # 业务逻辑服务
│   ├── api/            # HTTP客户端配置
│   │   ├── client.ts
│   │   └── interceptors.ts
│   ├── socket/         # Socket.IO客户端
│   │   ├── client.ts
│   │   ├── events.ts
│   │   └── hooks.ts
│   ├── auth/           # 认证服务
│   └── storage/        # 本地存储服务
├── hooks/              # 自定义React Hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── utils/              # 工具函数
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/              # TypeScript类型定义
│   ├── api.ts
│   ├── auth.ts
│   ├── user.ts
│   ├── task.ts
│   └── index.ts
├── constants/          # 常量定义
│   ├── endpoints.ts
│   ├── roles.ts
│   └── status.ts
└── assets/             # 静态资源
    ├── images/
    ├── icons/
    └── fonts/
```

## 开发规范

### 组件开发规范

#### 1. 组件文件结构
每个组件都应该有独立的文件夹：
```
ComponentName/
├── index.ts            # 导出文件
├── ComponentName.tsx   # 主组件文件
├── ComponentName.test.tsx # 测试文件
├── ComponentName.styles.ts # 样式文件
├── types.ts            # 类型定义
└── hooks.ts            # 组件专用hooks
```

#### 2. 组件模板
```typescript
// ComponentName/ComponentName.tsx
import React from 'react';
import { ComponentNameProps } from './types';
import { useStyles } from './ComponentName.styles';

/**
 * 组件描述
 */
const ComponentName: React.FC<ComponentNameProps> = ({
  // props
}) => {
  const styles = useStyles();

  return (
    <div css={styles.container}>
      {/* 组件内容 */}
    </div>
  );
};

export default ComponentName;
```

#### 3. 类型定义
```typescript
// ComponentName/types.ts
export interface ComponentNameProps {
  /** 属性描述 */
  title: string;
  /** 可选属性 */
  subtitle?: string;
  /** 事件处理 */
  onClick?: (event: React.MouseEvent) => void;
}
```

### 状态管理规范

#### 1. Redux Slice模板
```typescript
// store/slices/featureSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureState } from '../types';

const initialState: FeatureState = {
  data: [],
  loading: false,
  error: null,
};

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // 其他reducers...
  },
});

export const { setLoading, setError } = featureSlice.actions;
export default featureSlice.reducer;
```

#### 2. API Slice模板
```typescript
// store/api/featureApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';

export const featureApi = createApi({
  reducerPath: 'featureApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/feature',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Feature'],
  endpoints: (builder) => ({
    getFeatures: builder.query<Feature[], void>({
      query: () => '',
      providesTags: ['Feature'],
    }),
    createFeature: builder.mutation<Feature, Partial<Feature>>({
      query: (feature) => ({
        url: '',
        method: 'POST',
        body: feature,
      }),
      invalidatesTags: ['Feature'],
    }),
  }),
});

export const { useGetFeaturesQuery, useCreateFeatureMutation } = featureApi;
```

### Socket.IO集成规范

#### 1. Socket客户端配置
```typescript
// services/socket/client.ts
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../auth';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }
}

export const socketClient = new SocketClient();
```

#### 2. Socket Hooks
```typescript
// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { socketClient } from '../services/socket/client';

export const useSocket = (autoConnect = true) => {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && autoConnect) {
      socketRef.current = socketClient.connect();
    }

    return () => {
      if (socketRef.current) {
        socketClient.disconnect();
      }
    };
  }, [isAuthenticated, autoConnect]);

  return socketRef.current;
};
```

### 表单处理规范

#### 1. 表单组件模板
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Form, Input } from 'antd';

const schema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
});

type FormData = z.infer<typeof schema>;

const ExampleForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // 提交逻辑
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        validateStatus={errors.username ? 'error' : ''}
        help={errors.username?.message}
      >
        <Input
          {...register('username')}
          placeholder="用户名"
        />
      </Form.Item>

      <Form.Item
        validateStatus={errors.email ? 'error' : ''}
        help={errors.email?.message}
      >
        <Input
          {...register('email')}
          type="email"
          placeholder="邮箱"
        />
      </Form.Item>

      <Form.Item
        validateStatus={errors.password ? 'error' : ''}
        help={errors.password?.message}
      >
        <Input.Password
          {...register('password')}
          placeholder="密码"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          block
        >
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ExampleForm;
```

## 测试规范

### 1. 单元测试
```typescript
// Component.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Component from './Component';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Component', () => {
  it('renders correctly', () => {
    renderWithProvider(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithProvider(<Component title="Test" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. 集成测试
```typescript
// Component.integration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../store';
import Component from './Component';

describe('Component Integration', () => {
  it('integrates with Redux store', async () => {
    renderWithProvider(<Component />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(store.getState().feature.data).toHaveLength(1);
    });
  });
});
```

## 部署规范

### 1. 构建命令
```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build:prod

# 分析构建包大小
npm run build:analyze
```

### 2. 环境变量
不同环境使用不同的环境变量文件：
- `.env.development` - 开发环境
- `.env.staging` - 测试环境
- `.env.production` - 生产环境

### 3. Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 常见问题

### 1. 开发环境问题
**Q: Socket.IO连接失败**
A: 检查环境变量配置，确保后端服务正在运行

**Q: 样式不生效**
A: 确保已安装所有依赖，检查CSS导入路径

### 2. 构建问题
**Q: TypeScript编译错误**
A: 检查类型定义，确保所有导入都有正确的类型

**Q: 构建包过大**
A: 运行 `npm run build:analyze` 分析包大小，优化依赖

### 3. 性能问题
**Q: 页面加载慢**
A: 检查代码分割配置，优化图片和静态资源

**Q: 内存占用过高**
A: 检查组件卸载时的清理逻辑，避免内存泄漏

## 贡献指南

### 1. 代码提交规范
使用 Conventional Commits 格式：
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

### 2. Pull Request规范
1. 分支名称：`feature/功能描述`
2. 提交信息：清晰描述变更内容
3. 测试覆盖：确保所有新代码都有测试
4. 代码审查：至少需要一人审查

### 3. 发布流程
1. 合并到develop分支
2. 部署到测试环境
3. 测试验证通过
4. 合并到main分支
5. 创建tag并发布

## 资源链接

- [React文档](https://react.dev/)
- [TypeScript文档](https://www.typescriptlang.org/)
- [Ant Design文档](https://ant.design/)
- [Redux Toolkit文档](https://redux-toolkit.js.org/)
- [Socket.IO文档](https://socket.io/docs/)
- [Vite文档](https://vitejs.dev/)

## 技术支持

如果在开发过程中遇到问题，可以通过以下方式寻求帮助：
1. 查看项目文档和API规范
2. 搜索相关技术社区和论坛
3. 联系项目维护团队
4. 提交Issue到项目仓库

---

**注意**: 本指南会随着项目的发展持续更新，建议定期查看最新版本。