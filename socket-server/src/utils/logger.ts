import pino from 'pino';
import { config } from '../config/index.js';

export const logger = config.logging.pretty
  ? pino({
      level: config.logging.level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    })
  : pino({
      level: config.logging.level,
      timestamp: pino.stdTimeFunctions.isoTime,
    });
