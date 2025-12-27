/**
 * 日志工具模块
 * 提供统一的日志记录功能，支持不同级别和模块的日志输出
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

const formatMessage = (module: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${module}] ${message}`;
};

const createLogger = (module: string) => ({
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage(module, message), ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(formatMessage(module, message), ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage(module, message), ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(formatMessage(module, message), ...args);
    }
  },
});

export const authLogger = createLogger('AUTH');
export const httpLogger = createLogger('HTTP');
export const appLogger = createLogger('APP');

export default createLogger;
