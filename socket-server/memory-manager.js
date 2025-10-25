/**
 * 内存管理和垃圾回收优化模块
 *
 * 主要功能：
 * 1. 对象池管理和复用
 * 2. 内存泄漏检测和预防
 * 3. 垃圾回收优化
 * 4. 内存使用监控
 * 5. 缓存管理
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');
const v8 = require('v8');

class MemoryManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.maxMemoryUsage = options.maxMemoryUsage || 0.8; // 80%
    this.gcInterval = options.gcInterval || 30000; // 30秒
    this.memoryCheckInterval = options.memoryCheckInterval || 10000; // 10秒
    this.objectPoolMaxSize = options.objectPoolMaxSize || 1000;
    this.cacheMaxSize = options.cacheMaxSize || 10000;
    this.cacheCleanupInterval = options.cacheCleanupInterval || 60000; // 1分钟

    // 对象池
    this.objectPools = new Map();
    this.poolStats = new Map();

    // 缓存管理
    this.caches = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };

    // 内存统计
    this.memoryStats = {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      peakHeapUsed: 0,
      gcCount: 0,
      gcDuration: 0
    };

    // 内存泄漏检测
    this.memorySnapshots = [];
    this.maxSnapshots = 10;
    this.leakDetectionThreshold = 50 * 1024 * 1024; // 50MB

    // V8堆统计
    this.heapStats = null;

    // 初始化
    this.initialize();
  }

  /**
   * 初始化内存管理器
   */
  initialize() {
    // 启动定时GC
    this.startPeriodicGC();

    // 启动内存监控
    this.startMemoryMonitoring();

    // 启动缓存清理
    this.startCacheCleanup();

    // 监听GC事件
    this.setupGCMonitoring();

    console.log('Memory manager initialized');
  }

  /**
   * 创建对象池
   */
  createObjectPool(name, createFn, resetFn, maxSize = this.objectPoolMaxSize) {
    const pool = {
      name,
      createFn,
      resetFn,
      pool: [],
      maxSize,
      createCount: 0,
      reuseCount: 0,
      hitRate: 0
    };

    this.objectPools.set(name, pool);
    this.poolStats.set(name, {
      totalCreated: 0,
      totalReused: 0,
      currentSize: 0,
      hitRate: 0
    });

    return {
      acquire: () => this.acquireFromPool(name),
      release: (obj) => this.releaseToPool(name, obj),
      clear: () => this.clearPool(name),
      getStats: () => this.getPoolStats(name)
    };
  }

  /**
   * 从对象池获取对象
   */
  acquireFromPool(poolName) {
    const pool = this.objectPools.get(poolName);
    if (!pool) {
      throw new Error(`Object pool '${poolName}' not found`);
    }

    if (pool.pool.length > 0) {
      const obj = pool.pool.pop();
      pool.reuseCount++;
      this.updatePoolStats(poolName);
      return obj;
    }

    const obj = pool.createFn();
    pool.createCount++;
    this.updatePoolStats(poolName);
    return obj;
  }

  /**
   * 将对象放回对象池
   */
  releaseToPool(poolName, obj) {
    const pool = this.objectPools.get(poolName);
    if (!pool) {
      throw new Error(`Object pool '${poolName}' not found`);
    }

    if (pool.pool.length < pool.maxSize) {
      if (pool.resetFn) {
        pool.resetFn(obj);
      }
      pool.pool.push(obj);
      this.updatePoolStats(poolName);
    }
  }

  /**
   * 清空对象池
   */
  clearPool(poolName) {
    const pool = this.objectPools.get(poolName);
    if (pool) {
      pool.pool = [];
      this.updatePoolStats(poolName);
    }
  }

  /**
   * 更新对象池统计
   */
  updatePoolStats(poolName) {
    const pool = this.objectPools.get(poolName);
    const stats = this.poolStats.get(poolName);

    if (pool && stats) {
      stats.totalCreated = pool.createCount;
      stats.totalReused = pool.reuseCount;
      stats.currentSize = pool.pool.length;
      const total = pool.createCount + pool.reuseCount;
      stats.hitRate = total > 0 ? (pool.reuseCount / total * 100) : 0;
    }
  }

  /**
   * 获取对象池统计
   */
  getPoolStats(poolName) {
    return this.poolStats.get(poolName) || null;
  }

  /**
   * 创建缓存
   */
  createCache(name, options = {}) {
    const cache = {
      name,
      data: new Map(),
      maxSize: options.maxSize || this.cacheMaxSize,
      ttl: options.ttl || 0, // 0表示永不过期
      accessTimes: new Map(),
      hitCount: 0,
      missCount: 0,
      evictionCount: 0
    };

    this.caches.set(name, cache);

    return {
      get: (key) => this.getFromCache(name, key),
      set: (key, value) => this.setInCache(name, key, value),
      delete: (key) => this.deleteFromCache(name, key),
      clear: () => this.clearCache(name),
      has: (key) => this.hasInCache(name, key),
      size: () => this.getCacheSize(name),
      getStats: () => this.getCacheStats(name)
    };
  }

  /**
   * 从缓存获取值
   */
  getFromCache(cacheName, key) {
    const cache = this.caches.get(cacheName);
    if (!cache) return undefined;

    const item = cache.data.get(key);
    if (!item) {
      cache.missCount++;
      this.cacheStats.misses++;
      return undefined;
    }

    // 检查是否过期
    if (cache.ttl > 0 && Date.now() - item.timestamp > cache.ttl) {
      cache.data.delete(key);
      cache.accessTimes.delete(key);
      cache.missCount++;
      this.cacheStats.misses++;
      return undefined;
    }

    // 更新访问时间
    cache.accessTimes.set(key, Date.now());
    cache.hitCount++;
    this.cacheStats.hits++;

    return item.value;
  }

  /**
   * 设置缓存值
   */
  setInCache(cacheName, key, value) {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;

    // 检查容量限制
    if (cache.data.size >= cache.maxSize) {
      this.evictFromCache(cacheName);
    }

    const item = {
      value,
      timestamp: Date.now()
    };

    cache.data.set(key, item);
    cache.accessTimes.set(key, Date.now());

    return true;
  }

  /**
   * 从缓存删除值
   */
  deleteFromCache(cacheName, key) {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;

    const deleted = cache.data.delete(key);
    cache.accessTimes.delete(key);

    return deleted;
  }

  /**
   * 清空缓存
   */
  clearCache(cacheName) {
    const cache = this.caches.get(cacheName);
    if (cache) {
      cache.data.clear();
      cache.accessTimes.clear();
    }
  }

  /**
   * 检查缓存是否包含键
   */
  hasInCache(cacheName, key) {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;

    return cache.data.has(key);
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(cacheName) {
    const cache = this.caches.get(cacheName);
    return cache ? cache.data.size : 0;
  }

  /**
   * 缓存淘汰策略（LRU）
   */
  evictFromCache(cacheName) {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, time] of cache.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.data.delete(oldestKey);
      cache.accessTimes.delete(oldestKey);
      cache.evictionCount++;
      this.cacheStats.evictions++;
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(cacheName) {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const total = cache.hitCount + cache.missCount;
    return {
      size: cache.data.size,
      maxSize: cache.maxSize,
      hitCount: cache.hitCount,
      missCount: cache.missCount,
      evictionCount: cache.evictionCount,
      hitRate: total > 0 ? (cache.hitCount / total * 100) : 0
    };
  }

  /**
   * 启动定时GC
   */
  startPeriodicGC() {
    setInterval(() => {
      this.performGC();
    }, this.gcInterval);
  }

  /**
   * 执行垃圾回收
   */
  performGC() {
    const startTime = performance.now();

    try {
      // 执行全局GC
      if (global.gc) {
        global.gc();
      }

      // 执行增量GC
      if (v8.writeHeapSnapshot) {
        // 可选：生成堆快照用于分析
        if (this.memoryStats.heapUsed > this.memoryStats.peakHeapUsed * 1.2) {
          this.takeHeapSnapshot();
        }
      }

      const duration = performance.now() - startTime;
      this.memoryStats.gcCount++;
      this.memoryStats.gcDuration += duration;

      this.emit('gc:performed', { duration, memoryUsage: this.getMemoryUsage() });
    } catch (error) {
      console.error('GC execution failed:', error);
    }
  }

  /**
   * 强制执行垃圾回收
   */
  forceGC() {
    this.performGC();
  }

  /**
   * 设置GC监控
   */
  setupGCMonitoring() {
    // 监听GC事件（如果可用）
    if (v8.getHeapStatistics) {
      setInterval(() => {
        this.updateHeapStatistics();
      }, 5000);
    }
  }

  /**
   * 更新堆统计
   */
  updateHeapStatistics() {
    try {
      this.heapStats = v8.getHeapStatistics();
      this.emit('heap:stats_updated', this.heapStats);
    } catch (error) {
      console.error('Failed to update heap statistics:', error);
    }
  }

  /**
   * 启动内存监控
   */
  startMemoryMonitoring() {
    setInterval(() => {
      this.checkMemoryUsage();
    }, this.memoryCheckInterval);
  }

  /**
   * 检查内存使用情况
   */
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();

    this.memoryStats.heapUsed = memUsage.heapUsed;
    this.memoryStats.heapTotal = memUsage.heapTotal;
    this.memoryStats.external = memUsage.external;
    this.memoryStats.rss = memUsage.rss;

    // 更新峰值内存使用
    if (memUsage.heapUsed > this.memoryStats.peakHeapUsed) {
      this.memoryStats.peakHeapUsed = memUsage.heapUsed;
    }

    // 检查内存使用率
    const usageRatio = memUsage.heapUsed / memUsage.heapTotal;
    if (usageRatio > this.maxMemoryUsage) {
      console.warn(`High memory usage detected: ${(usageRatio * 100).toFixed(2)}%`);

      // 触发内存清理
      this.performMemoryCleanup();

      this.emit('memory:high_usage', {
        usage: usageRatio,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      });
    }

    // 内存泄漏检测
    this.detectMemoryLeak();

    this.emit('memory:checked', this.memoryStats);
  }

  /**
   * 执行内存清理
   */
  performMemoryCleanup() {
    // 强制GC
    this.forceGC();

    // 清理对象池
    for (const [name] of this.objectPools) {
      const pool = this.objectPools.get(name);
      if (pool.pool.length > pool.maxSize * 0.8) {
        pool.pool = pool.pool.slice(0, Math.floor(pool.maxSize * 0.5));
        this.updatePoolStats(name);
      }
    }

    // 清理缓存
    for (const [name] of this.caches) {
      const cache = this.caches.get(name);
      if (cache.data.size > cache.maxSize * 0.8) {
        const targetSize = Math.floor(cache.maxSize * 0.5);
        while (cache.data.size > targetSize) {
          this.evictFromCache(name);
        }
      }
    }

    this.emit('memory:cleaned');
  }

  /**
   * 内存泄漏检测
   */
  detectMemoryLeak() {
    const currentSnapshot = {
      timestamp: Date.now(),
      heapUsed: this.memoryStats.heapUsed,
      heapTotal: this.memoryStats.heapTotal,
      rss: this.memoryStats.rss
    };

    this.memorySnapshots.push(currentSnapshot);

    // 保持快照数量在限制内
    if (this.memorySnapshots.length > this.maxSnapshots) {
      this.memorySnapshots.shift();
    }

    // 检测内存泄漏
    if (this.memorySnapshots.length >= 3) {
      const recent = this.memorySnapshots.slice(-3);
      const growth1 = recent[1].heapUsed - recent[0].heapUsed;
      const growth2 = recent[2].heapUsed - recent[1].heapUsed;

      // 如果连续增长且超过阈值
      if (growth1 > this.leakDetectionThreshold && growth2 > this.leakDetectionThreshold) {
        console.warn('Potential memory leak detected');
        this.emit('memory:leak_detected', {
          snapshots: recent,
          growth1,
          growth2
        });
      }
    }
  }

  /**
   * 生成堆快照
   */
  takeHeapSnapshot() {
    try {
      const filename = `heap-snapshot-${Date.now()}.heapsnapshot`;
      const snapshot = v8.writeHeapSnapshot(filename);

      console.log(`Heap snapshot saved: ${filename}`);
      this.emit('heap:snapshot_taken', { filename });

      return filename;
    } catch (error) {
      console.error('Failed to take heap snapshot:', error);
      return null;
    }
  }

  /**
   * 启动缓存清理
   */
  startCacheCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.cacheCleanupInterval);
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let totalCleaned = 0;

    for (const [name, cache] of this.caches) {
      if (cache.ttl > 0) {
        const toDelete = [];

        for (const [key, item] of cache.data) {
          if (now - item.timestamp > cache.ttl) {
            toDelete.push(key);
          }
        }

        for (const key of toDelete) {
          cache.data.delete(key);
          cache.accessTimes.delete(key);
          totalCleaned++;
        }
      }
    }

    if (totalCleaned > 0) {
      console.log(`Cleaned up ${totalCleaned} expired cache entries`);
      this.emit('cache:cleaned', { count: totalCleaned });
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    return {
      ...process.memoryUsage(),
      usageRatio: this.memoryStats.heapUsed / this.memoryStats.heapTotal,
      peakUsage: this.memoryStats.peakHeapUsed
    };
  }

  /**
   * 获取详细内存统计
   */
  getDetailedStats() {
    return {
      memory: {
        ...this.memoryStats,
        current: this.getMemoryUsage()
      },
      objectPools: Array.from(this.poolStats.entries()).map(([name, stats]) => ({
        name,
        ...stats
      })),
      caches: Array.from(this.caches.entries()).map(([name, cache]) => ({
        name,
        ...this.getCacheStats(name)
      })),
      globalCache: this.cacheStats,
      heapStats: this.heapStats
    };
  }

  /**
   * 优化内存分配
   */
  optimizeMemoryAllocation() {
    // Node.js内存优化建议
    const recommendations = [];

    const memUsage = this.getMemoryUsage();

    if (memUsage.usageRatio > 0.8) {
      recommendations.push({
        type: 'high_usage',
        message: '内存使用率过高，建议增加内存或优化代码',
        priority: 'high'
      });
    }

    // 检查对象池效率
    for (const [name, stats] of this.poolStats) {
      if (stats.hitRate < 50 && stats.totalCreated > 100) {
        recommendations.push({
          type: 'pool_efficiency',
          message: `对象池 '${name}' 命中率较低 (${stats.hitRate.toFixed(1)}%)，考虑调整池大小或使用模式`,
          priority: 'medium'
        });
      }
    }

    // 检查缓存效率
    for (const [name, cache] of this.caches) {
      const stats = this.getCacheStats(name);
      if (stats && stats.hitRate < 60 && stats.hitCount + stats.missCount > 100) {
        recommendations.push({
          type: 'cache_efficiency',
          message: `缓存 '${name}' 命中率较低 (${stats.hitRate.toFixed(1)}%)，考虑调整缓存策略`,
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }

  /**
   * 设置内存限制警告
   */
  setMemoryWarningLimit(limit) {
    this.maxMemoryUsage = limit;
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.memoryStats = {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0,
      peakHeapUsed: 0,
      gcCount: 0,
      gcDuration: 0
    };

    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };

    this.memorySnapshots = [];

    // 重置对象池统计
    for (const [name] of this.poolStats) {
      this.poolStats.set(name, {
        totalCreated: 0,
        totalReused: 0,
        currentSize: 0,
        hitRate: 0
      });
    }
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down memory manager...');

    // 清理所有对象池
    for (const [name] of this.objectPools) {
      this.clearPool(name);
    }

    // 清理所有缓存
    for (const [name] of this.caches) {
      this.clearCache(name);
    }

    // 最后一次GC
    this.forceGC();

    console.log('Memory manager shutdown complete');
  }
}

module.exports = MemoryManager;