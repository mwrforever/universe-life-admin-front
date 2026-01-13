/**
 * 路由工具函数
 * 
 * 提供路径与页面 key 的转换功能
 * 支持路径验证
 * 
 * @author James
 * @version 1.0.0
 */

import {
  pathToKeyMap,
  keyToPathMap,
  validPaths,
  validKeys,
  DEFAULT_PATH,
  DEFAULT_KEY,
} from '../routes/routeConfig';

/**
 * 根据 URL 路径获取页面 key
 * 
 * @param path - URL 路径
 * @returns 页面 key，如果路径无效则返回 null
 * 
 * @example
 * getPageKeyFromPath('/dashboard') // 'dashboard'
 * getPageKeyFromPath('/system/user') // 'system-user'
 * getPageKeyFromPath('/invalid') // null
 */
export function getPageKeyFromPath(path: string): string | null {
  if (!path || typeof path !== 'string') {
    return null;
  }
  
  // 移除尾部斜杠进行标准化
  const normalizedPath = path.endsWith('/') && path !== '/' 
    ? path.slice(0, -1) 
    : path;
  
  return pathToKeyMap.get(normalizedPath) ?? null;
}

/**
 * 根据页面 key 获取 URL 路径
 * 
 * @param key - 页面 key
 * @returns URL 路径，如果 key 无效则返回 null
 * 
 * @example
 * getPathFromPageKey('dashboard') // '/dashboard'
 * getPathFromPageKey('system-user') // '/system/user'
 * getPathFromPageKey('invalid') // null
 */
export function getPathFromPageKey(key: string): string | null {
  if (!key || typeof key !== 'string') {
    return null;
  }
  
  return keyToPathMap.get(key) ?? null;
}

/**
 * 验证路径是否有效
 * 
 * @param path - URL 路径
 * @returns 路径是否有效
 * 
 * @example
 * isValidPath('/dashboard') // true
 * isValidPath('/system/user') // true
 * isValidPath('/invalid') // false
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // 移除尾部斜杠进行标准化
  const normalizedPath = path.endsWith('/') && path !== '/' 
    ? path.slice(0, -1) 
    : path;
  
  return validPaths.has(normalizedPath);
}

/**
 * 验证页面 key 是否有效
 * 
 * @param key - 页面 key
 * @returns key 是否有效
 * 
 * @example
 * isValidKey('dashboard') // true
 * isValidKey('system-user') // true
 * isValidKey('invalid') // false
 */
export function isValidKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  return validKeys.has(key);
}

/**
 * 获取默认路径
 * 
 * @returns 默认页面路径
 */
export function getDefaultPath(): string {
  return DEFAULT_PATH;
}

/**
 * 获取默认页面 key
 * 
 * @returns 默认页面 key
 */
export function getDefaultKey(): string {
  return DEFAULT_KEY;
}

/**
 * 根据路径获取页面 key，如果无效则返回默认 key
 * 
 * @param path - URL 路径
 * @returns 页面 key
 */
export function getPageKeyFromPathOrDefault(path: string): string {
  return getPageKeyFromPath(path) ?? DEFAULT_KEY;
}

/**
 * 根据页面 key 获取路径，如果无效则返回默认路径
 * 
 * @param key - 页面 key
 * @returns URL 路径
 */
export function getPathFromPageKeyOrDefault(key: string): string {
  return getPathFromPageKey(key) ?? DEFAULT_PATH;
}
