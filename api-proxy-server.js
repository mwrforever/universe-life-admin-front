/**
 * API代理服务器
 * 运行在5000端口，代理WebSocket服务器(5050)的API请求
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const API_TARGET_URL = 'http://localhost:5050';
const PORT = 5000;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
    service: 'api-proxy',
    timestamp: new Date().toISOString(),
    port: PORT,
    target: API_TARGET_URL
  });
});

// 代理所有API请求到WebSocket服务器
const apiProxy = createProxyMiddleware({
  target: API_TARGET_URL,
  changeOrigin: true,
  // 不需要pathRewrite，因为我们想保持完整的路径
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).json({
      error: '代理服务器错误',
      message: '无法连接到后端服务'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`代理请求: ${req.method} ${req.path} -> ${API_TARGET_URL}${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`代理响应: ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  }
});

// 应用代理中间件
app.use('/api', apiProxy);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'API代理服务器运行中',
    endpoints: {
      health: '/health',
      api: '/api/*',
      target: API_TARGET_URL
    },
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl,
    availableEndpoints: ['/health', '/api/*']
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 API代理服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🎯 目标服务: ${API_TARGET_URL}`);
  console.log(`💊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 前端应用: http://localhost:5173`);
  console.log(``);
  console.log(`📝 代理的API接口:`);
  console.log(`   - POST ${PORT}/api/auth/login -> ${API_TARGET_URL}/api/auth/login`);
  console.log(`   - GET  ${PORT}/api/stats -> ${API_TARGET_URL}/api/stats`);
  console.log(`   - GET  ${PORT}/health -> ${API_TARGET_URL}/health`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，正在关闭API代理服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n收到SIGTERM信号，正在关闭API代理服务器...');
  process.exit(0);
});