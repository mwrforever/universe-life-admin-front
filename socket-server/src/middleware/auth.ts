import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Extend Socket interface to include user data
declare module 'socket.io' {
  interface Socket {
    user: {
      userId: string;
      username: string;
      iat?: number;
      exp?: number;
    };
  }
}

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    if (!decoded.userId || !decoded.username) {
      return next(new Error('Invalid token payload'));
    }

    socket.user = {
      userId: decoded.userId,
      username: decoded.username,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    logger.debug(`User authenticated: ${socket.user.userId}`);
    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    next(new Error('Invalid authentication token'));
  }
};
