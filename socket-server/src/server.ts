import { createServer } from 'http';
import { Server } from 'socket.io';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { authenticateSocket } from './middleware/auth.js';
import { messageHandler } from './handlers/messageHandler.js';
import { userHandler } from './handlers/userHandler.js';
import { roomHandler } from './handlers/roomHandler.js';

const app = express();
const server = createServer(app);

// Socket.IO configuration with modern options
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(compression());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    uptime: process.uptime(),
  });
});

// JWT generation endpoint for development
app.post('/api/auth/token', async (req: Request, res: Response) => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const signOptions: SignOptions = {
      expiresIn: '7d',
    };

    const token = jwt.sign({ userId, username }, config.jwt.secret, signOptions);

    res.json({ token, expiresIn: config.jwt.expiresIn });
  } catch (error) {
    logger.error({ error }, 'Token generation error');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket authentication middleware
io.use(authenticateSocket);

// Socket connection handling
io.on('connection', socket => {
  logger.info(`User connected: ${socket.user.userId} (${socket.user.username})`);

  // Register handlers
  messageHandler(io, socket);
  userHandler(io, socket);
  roomHandler(io, socket);

  // Handle disconnection
  socket.on('disconnect', reason => {
    logger.info(`User disconnected: ${socket.user.userId} (${reason})`);
  });

  // Handle errors
  socket.on('error', error => {
    logger.error({ error, userId: socket.user.userId }, 'Socket error for user');
  });
});

// Global error handling
io.on('error', error => {
  logger.error({ error }, 'Socket.IO server error');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', error => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// Start server
const PORT = config.server.port || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Socket.IO server running on port ${PORT}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

export { app, io };
