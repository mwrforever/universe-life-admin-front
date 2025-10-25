/**
 * 简化的API代理服务器
 * 运行在5000端口，直接处理和转发请求
 */

import express from 'express';
import cors from 'cors';

const app = express();
const WEBSOCKET_SERVER_URL = 'http://localhost:8088';
const PORT = 8091;

// 中间件
app.use(cors({
  origin: ['http://localhost:5000'],
  credentials: true
}));

app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'simple-api-proxy',
    timestamp: new Date().toISOString(),
    port: PORT,
    target: WEBSOCKET_SERVER_URL
  });
});

// 代理认证接口
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log(`代理登录请求到: ${WEBSOCKET_SERVER_URL}/api/auth/login`);

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    res.status(response.status).json(data);
    console.log(`登录代理响应: ${response.status}`);
  } catch (error) {
    console.error('登录代理错误:', error);
    res.status(500).json({
      error: '代理服务器错误',
      message: '无法连接到认证服务'
    });
  }
});

// 代理统计接口
app.get('/api/stats', async (req, res) => {
  try {
    console.log(`代理统计请求到: ${WEBSOCKET_SERVER_URL}/api/stats`);

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/stats`);
    const data = await response.json();

    res.status(response.status).json(data);
    console.log(`统计代理响应: ${response.status}`);
  } catch (error) {
    console.error('统计代理错误:', error);
    res.status(500).json({
      error: '代理服务器错误',
      message: '无法连接到统计服务'
    });
  }
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '简化API代理服务器运行中',
    endpoints: {
      health: '/health',
      login: 'POST /api/auth/login',
      stats: '/api/stats'
    },
    websocket_server: WEBSOCKET_SERVER_URL,
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl,
    availableEndpoints: ['/health', '/api/auth/login', '/api/stats']
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 简化API代理服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🎯 WebSocket服务: ${WEBSOCKET_SERVER_URL}`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 前端应用: http://localhost:5000`);
  console.log(``);
  console.log(`📝 可用接口:`);
  console.log(`   - POST ${PORT}/api/auth/login (代理到 ${WEBSOCKET_SERVER_URL}/api/auth/login)`);
  console.log(`   - GET  ${PORT}/api/stats (代理到 ${WEBSOCKET_SERVER_URL}/api/stats)`);
  console.log(`   - GET  ${PORT}/health`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，正在关闭简化API代理服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n收到SIGTERM信号，正在关闭简化API代理服务器...');
  process.exit(0);
});