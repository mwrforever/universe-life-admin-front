/**
 * 日志工具模块
 * 基于 loglevel 库提供统一的日志记录功能，支持不同级别和模块的日志输出
 */

import log from 'loglevel';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

// 根据环境变量设置全局日志级别
const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];
const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel;
const currentLevel: LogLevel = validLevels.includes(envLevel) ? envLevel : 'info';

// 设置 loglevel 的默认级别
log.setLevel(currentLevel);

const formatMessage = (module: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${module}] ${message}`;
};

const createLogger = (module: string) => {
  const logger = log.getLogger(module);
  logger.setLevel(currentLevel);

  return {
    trace: (message: string, ...args: unknown[]) => {
      logger.trace(formatMessage(module, message), ...args);
    },
    debug: (message: string, ...args: unknown[]) => {
      logger.debug(formatMessage(module, message), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      logger.info(formatMessage(module, message), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      logger.warn(formatMessage(module, message), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      logger.error(formatMessage(module, message), ...args);
    },
  };
};

export const authLogger = createLogger('AUTH');
export const httpLogger = createLogger('HTTP');
export const appLogger = createLogger('APP');
export const uploadLogger = createLogger('UPLOAD');

export default createLogger;
