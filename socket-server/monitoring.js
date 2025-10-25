/**
 * 监控和性能指标系统
 *
 * 主要功能：
 * 1. 实时性能指标收集
 * 2. Prometheus指标导出
 * 3. 自定义指标定义
 * 4. 性能分析和报告
 * 5. 告警和通知
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class MonitoringSystem extends EventEmitter {
  constructor(options = {}) {
    super();

    // 配置选项
    this.metricsInterval = options.metricsInterval || 10000; // 10秒
    this.reportInterval = options.reportInterval || 60000;  // 1分钟
    this.alertThresholds = options.alertThresholds || {
      cpuUsage: 80,        // CPU使用率阈值 (%)
      memoryUsage: 85,     // 内存使用率阈值 (%)
      responseTime: 1000,  // 响应时间阈值 (ms)
      errorRate: 5,        // 错误率阈值 (%)
      connectionCount: 4500 // 连接数阈值
    };

    // 指标存储
    this.metrics = new Map();
    this.histograms = new Map();
    this.counters = new Map();
    this.gauges = new Map();

    // 时间窗口数据
    this.timeSeriesData = new Map();
    this.maxDataPoints = options.maxDataPoints || 1000;

    // 告警状态
    this.alerts = new Map();
    this.alertHistory = [];

    // 性能计时器
    this.timers = new Map();

    // 初始化指标
    this.initializeMetrics();

    // 启动监控
    this.startMonitoring();
  }

  /**
   * 初始化指标
   */
  initializeMetrics() {
    // HTTP指标
    this.createCounter('http_requests_total', 'Total HTTP requests', ['method', 'status', 'route']);
    this.createHistogram('http_request_duration_ms', 'HTTP request duration', [50, 100, 200, 500, 1000, 2000, 5000], ['method', 'route']);
    this.createGauge('http_connections_current', 'Current HTTP connections');

    // WebSocket指标
    this.createGauge('websocket_connections_current', 'Current WebSocket connections');
    this.createCounter('websocket_connections_total', 'Total WebSocket connections', ['status']);
    this.createCounter('websocket_messages_total', 'Total WebSocket messages', ['direction', 'type']);
    this.createHistogram('websocket_message_duration_ms', 'WebSocket message processing duration', [10, 50, 100, 200, 500]);

    // 系统指标
    this.createGauge('system_cpu_usage_percent', 'CPU usage percentage');
    this.createGauge('system_memory_usage_percent', 'Memory usage percentage');
    this.createGauge('system_memory_heap_used_mb', 'Heap memory used (MB)');
    this.createGauge('system_memory_heap_total_mb', 'Heap memory total (MB)');
    this.createGauge('system_event_loop_lag_ms', 'Event loop lag (ms)');

    // 应用指标
    this.createCounter('app_errors_total', 'Total application errors', ['type', 'severity']);
    this.createCounter('app_gc_operations_total', 'Total GC operations', ['type']);
    this.createHistogram('app_gc_duration_ms', 'GC operation duration', [1, 5, 10, 50, 100, 500]);

    // 业务指标
    this.createCounter('room_operations_total', 'Total room operations', ['operation']);
    this.createGauge('rooms_active', 'Active rooms count');
    this.createGauge('users_active', 'Active users count');
    this.createCounter('messages_sent_total', 'Total messages sent', ['type']);
    this.createHistogram('message_broadcast_duration_ms', 'Message broadcast duration', [5, 10, 25, 50, 100, 200, 500]);

    // 数据库指标
    this.createHistogram('db_query_duration_ms', 'Database query duration', [10, 50, 100, 200, 500, 1000, 2000], ['operation', 'table']);
    this.createCounter('db_queries_total', 'Total database queries', ['operation', 'table', 'status']);

    // 缓存指标
    this.createCounter('cache_operations_total', 'Total cache operations', ['operation', 'result']);
    this.createGauge('cache_hit_ratio', 'Cache hit ratio');
    this.createGauge('cache_size', 'Cache size', ['cache_name']);
  }

  /**
   * 创建计数器指标
   */
  createCounter(name, help, labels = []) {
    const counter = {
      type: 'counter',
      name,
      help,
      labels,
      value: 0,
      labelValues: new Map()
    };

    this.counters.set(name, counter);
    this.metrics.set(name, counter);

    return {
      inc: (labels = {}, value = 1) => this.incrementCounter(name, labels, value),
      get: (labels = {}) => this.getCounterValue(name, labels),
      reset: (labels = {}) => this.resetCounter(name, labels)
    };
  }

  /**
   * 创建仪表盘指标
   */
  createGauge(name, help, labels = []) {
    const gauge = {
      type: 'gauge',
      name,
      help,
      labels,
      value: 0,
      labelValues: new Map()
    };

    this.gauges.set(name, gauge);
    this.metrics.set(name, gauge);

    return {
      set: (value, labels = {}) => this.setGaugeValue(name, value, labels),
      get: (labels = {}) => this.getGaugeValue(name, labels),
      inc: (labels = {}, value = 1) => this.incrementGauge(name, labels, value),
      dec: (labels = {}, value = 1) => this.decrementGauge(name, labels, value)
    };
  }

  /**
   * 创建直方图指标
   */
  createHistogram(name, help, buckets = [100, 200, 500, 1000], labels = []) {
    const histogram = {
      type: 'histogram',
      name,
      help,
      labels,
      buckets,
      counts: new Array(buckets.length + 1).fill(0),
      sum: 0,
      count: 0,
      labelValues: new Map()
    };

    this.histograms.set(name, histogram);
    this.metrics.set(name, histogram);

    return {
      observe: (value, labels = {}) => this.observeHistogram(name, value, labels),
      get: (labels = {}) => this.getHistogramValue(name, labels)
    };
  }

  /**
   * 增加计数器
   */
  incrementCounter(name, labels = {}, value = 1) {
    const counter = this.counters.get(name);
    if (!counter) return;

    const labelKey = this.getLabelKey(labels);
    let current = counter.labelValues.get(labelKey) || 0;
    current += value;
    counter.labelValues.set(labelKey, current);
    counter.value += value;
  }

  /**
   * 获取计数器值
   */
  getCounterValue(name, labels = {}) {
    const counter = this.counters.get(name);
    if (!counter) return 0;

    const labelKey = this.getLabelKey(labels);
    return counter.labelValues.get(labelKey) || 0;
  }

  /**
   * 重置计数器
   */
  resetCounter(name, labels = {}) {
    const counter = this.counters.get(name);
    if (!counter) return;

    const labelKey = this.getLabelKey(labels);
    const current = counter.labelValues.get(labelKey) || 0;
    counter.labelValues.delete(labelKey);
    counter.value -= current;
  }

  /**
   * 设置仪表盘值
   */
  setGaugeValue(name, value, labels = {}) {
    const gauge = this.gauges.get(name);
    if (!gauge) return;

    const labelKey = this.getLabelKey(labels);
    gauge.labelValues.set(labelKey, value);
    gauge.value = value; // 简化处理，实际应该按标签管理
  }

  /**
   * 获取仪表盘值
   */
  getGaugeValue(name, labels = {}) {
    const gauge = this.gauges.get(name);
    if (!gauge) return 0;

    const labelKey = this.getLabelKey(labels);
    return gauge.labelValues.get(labelKey) || 0;
  }

  /**
   * 增加仪表盘值
   */
  incrementGauge(name, labels = {}, value = 1) {
    const gauge = this.gauges.get(name);
    if (!gauge) return;

    const labelKey = this.getLabelKey(labels);
    let current = gauge.labelValues.get(labelKey) || 0;
    current += value;
    gauge.labelValues.set(labelKey, current);
    gauge.value = current;
  }

  /**
   * 减少仪表盘值
   */
  decrementGauge(name, labels = {}, value = 1) {
    this.incrementGauge(name, labels, -value);
  }

  /**
   * 观察直方图值
   */
  observeHistogram(name, value, labels = {}) {
    const histogram = this.histograms.get(name);
    if (!histogram) return;

    const labelKey = this.getLabelKey(labels);
    let labelHistogram = histogram.labelValues.get(labelKey);
    if (!labelHistogram) {
      labelHistogram = {
        counts: new Array(histogram.buckets.length + 1).fill(0),
        sum: 0,
        count: 0
      };
      histogram.labelValues.set(labelKey, labelHistogram);
    }

    // 找到正确的bucket
    let bucketIndex = histogram.buckets.length;
    for (let i = 0; i < histogram.buckets.length; i++) {
      if (value <= histogram.buckets[i]) {
        bucketIndex = i;
        break;
      }
    }

    // 更新计数
    for (let i = bucketIndex; i <= histogram.buckets.length; i++) {
      labelHistogram.counts[i]++;
    }
    labelHistogram.sum += value;
    labelHistogram.count++;
  }

  /**
   * 获取直方图值
   */
  getHistogramValue(name, labels = {}) {
    const histogram = this.histograms.get(name);
    if (!histogram) return null;

    const labelKey = this.getLabelKey(labels);
    return histogram.labelValues.get(labelKey) || {
      counts: new Array(histogram.buckets.length + 1).fill(0),
      sum: 0,
      count: 0
    };
  }

  /**
   * 生成标签键
   */
  getLabelKey(labels) {
    const keys = Object.keys(labels).sort();
    return keys.map(key => `${key}="${labels[key]}"`).join(',');
  }

  /**
   * 开始计时
   */
  startTimer(name, labels = {}) {
    const timerKey = `${name}_${this.getLabelKey(labels)}`;
    this.timers.set(timerKey, performance.now());
  }

  /**
   * 结束计时并记录到直方图
   */
  endTimer(name, labels = {}) {
    const timerKey = `${name}_${this.getLabelKey(labels)}`;
    const startTime = this.timers.get(timerKey);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.timers.delete(timerKey);

    // 自动观察到对应的直方图
    this.observeHistogram(name, duration, labels);

    return duration;
  }

  /**
   * 记录HTTP请求
   */
  recordHttpRequest(method, route, statusCode, duration) {
    this.incrementCounter('http_requests_total', { method, status: statusCode.toString(), route });
    this.observeHistogram('http_request_duration_ms', duration, { method, route });

    // 检查错误率
    if (statusCode >= 400) {
      this.incrementCounter('app_errors_total', { type: 'http_error', severity: statusCode >= 500 ? 'high' : 'medium' });
    }
  }

  /**
   * 记录WebSocket连接
   */
  recordWebSocketConnection(status) {
    this.incrementCounter('websocket_connections_total', { status });
  }

  /**
   * 记录WebSocket消息
   */
  recordWebSocketMessage(direction, type, duration) {
    this.incrementCounter('websocket_messages_total', { direction, type });
    this.observeHistogram('websocket_message_duration_ms', duration);
  }

  /**
   * 更新系统指标
   */
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // 内存指标
    this.setGaugeValue('system_memory_heap_used_mb', memUsage.heapUsed / 1024 / 1024);
    this.setGaugeValue('system_memory_heap_total_mb', memUsage.heapTotal / 1024 / 1024);
    this.setGaugeValue('system_memory_usage_percent', (memUsage.heapUsed / memUsage.heapTotal) * 100);

    // CPU使用率（简化计算）
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) * 100;
    this.setGaugeValue('system_cpu_usage_percent', Math.min(cpuPercent, 100));

    // 事件循环延迟
    this.measureEventLoopLag();
  }

  /**
   * 测量事件循环延迟
   */
  measureEventLoopLag() {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // 转换为毫秒
      this.setGaugeValue('system_event_loop_lag_ms', lag);
    });
  }

  /**
   * 更新业务指标
   */
  updateBusinessMetrics(data = {}) {
    // 连接数
    if (data.connectionCount !== undefined) {
      this.setGaugeValue('websocket_connections_current', data.connectionCount);
    }

    // 房间数
    if (data.roomCount !== undefined) {
      this.setGaugeValue('rooms_active', data.roomCount);
    }

    // 用户数
    if (data.userCount !== undefined) {
      this.setGaugeValue('users_active', data.userCount);
    }

    // 消息统计
    if (data.messageStats) {
      this.incrementCounter('messages_sent_total', { type: 'chat' }, data.messageStats.chatMessages || 0);
      this.incrementCounter('messages_sent_total', { type: 'system' }, data.messageStats.systemMessages || 0);
      this.incrementCounter('messages_sent_total', { type: 'broadcast' }, data.messageStats.broadcastMessages || 0);
    }
  }

  /**
   * 启动监控
   */
  startMonitoring() {
    // 定期更新系统指标
    setInterval(() => {
      this.updateSystemMetrics();
      this.collectCustomMetrics();
    }, this.metricsInterval);

    // 定期生成报告
    setInterval(() => {
      this.generateReport();
    }, this.reportInterval);

    // 定期检查告警
    setInterval(() => {
      this.checkAlerts();
    }, 30000); // 30秒检查一次

    console.log('Monitoring system started');
  }

  /**
   * 收集自定义指标
   */
  collectCustomMetrics() {
    // 触发自定义指标收集事件
    this.emit('metrics:collect');
  }

  /**
   * 检查告警条件
   */
  checkAlerts() {
    const alerts = [];

    // CPU使用率告警
    const cpuUsage = this.getGaugeValue('system_cpu_usage_percent');
    if (cpuUsage > this.alertThresholds.cpuUsage) {
      alerts.push({
        name: 'high_cpu_usage',
        severity: 'warning',
        message: `CPU使用率过高: ${cpuUsage.toFixed(2)}%`,
        value: cpuUsage,
        threshold: this.alertThresholds.cpuUsage
      });
    }

    // 内存使用率告警
    const memoryUsage = this.getGaugeValue('system_memory_usage_percent');
    if (memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push({
        name: 'high_memory_usage',
        severity: 'warning',
        message: `内存使用率过高: ${memoryUsage.toFixed(2)}%`,
        value: memoryUsage,
        threshold: this.alertThresholds.memoryUsage
      });
    }

    // 连接数告警
    const connectionCount = this.getGaugeValue('websocket_connections_current');
    if (connectionCount > this.alertThresholds.connectionCount) {
      alerts.push({
        name: 'high_connection_count',
        severity: 'warning',
        message: `连接数过高: ${connectionCount}`,
        value: connectionCount,
        threshold: this.alertThresholds.connectionCount
      });
    }

    // 事件循环延迟告警
    const eventLoopLag = this.getGaugeValue('system_event_loop_lag_ms');
    if (eventLoopLag > this.alertThresholds.responseTime) {
      alerts.push({
        name: 'high_event_loop_lag',
        severity: 'warning',
        message: `事件循环延迟过高: ${eventLoopLag.toFixed(2)}ms`,
        value: eventLoopLag,
        threshold: this.alertThresholds.responseTime
      });
    }

    // 处理告警
    for (const alert of alerts) {
      this.handleAlert(alert);
    }
  }

  /**
   * 处理告警
   */
  handleAlert(alert) {
    const alertKey = `${alert.name}_${alert.severity}`;
    const existingAlert = this.alerts.get(alertKey);

    // 如果是新的告警或告警状态改变
    if (!existingAlert || existingAlert.status !== 'active') {
      alert.status = 'active';
      alert.timestamp = Date.now();
      this.alerts.set(alertKey, alert);
      this.alertHistory.push(alert);

      console.warn(`ALERT: ${alert.message}`);
      this.emit('alert:triggered', alert);
    }
  }

  /**
   * 解除告警
   */
  resolveAlert(alertName) {
    for (const [key, alert] of this.alerts) {
      if (key.startsWith(alertName)) {
        alert.status = 'resolved';
        alert.resolvedAt = Date.now();
        this.emit('alert:resolved', alert);
      }
    }
  }

  /**
   * 生成监控报告
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      system: {
        cpuUsage: this.getGaugeValue('system_cpu_usage_percent'),
        memoryUsage: this.getGaugeValue('system_memory_usage_percent'),
        heapUsed: this.getGaugeValue('system_memory_heap_used_mb'),
        eventLoopLag: this.getGaugeValue('system_event_loop_lag_ms')
      },
      connections: {
        current: this.getGaugeValue('websocket_connections_current'),
        total: this.getCounterValue('websocket_connections_total', { status: 'connected' })
      },
      performance: {
        avgResponseTime: this.calculateAverageResponseTime(),
        totalRequests: this.getCounterValue('http_requests_total'),
        errorRate: this.calculateErrorRate()
      },
      business: {
        activeRooms: this.getGaugeValue('rooms_active'),
        activeUsers: this.getGaugeValue('users_active'),
        messagesSent: this.getCounterValue('messages_sent_total')
      },
      alerts: {
        active: Array.from(this.alerts.values()).filter(a => a.status === 'active').length,
        recent: this.alertHistory.slice(-10)
      }
    };

    this.emit('report:generated', report);
    return report;
  }

  /**
   * 计算平均响应时间
   */
  calculateAverageResponseTime() {
    const histogram = this.getHistogramValue('http_request_duration_ms');
    if (!histogram || histogram.count === 0) return 0;
    return histogram.sum / histogram.count;
  }

  /**
   * 计算错误率
   */
  calculateErrorRate() {
    const totalRequests = this.getCounterValue('http_requests_total');
    const totalErrors = this.getCounterValue('app_errors_total', { type: 'http_error' });

    if (totalRequests === 0) return 0;
    return (totalErrors / totalRequests) * 100;
  }

  /**
   * 导出Prometheus格式指标
   */
  exportPrometheusMetrics() {
    let output = '';

    // 导出计数器
    for (const [name, counter] of this.counters) {
      output += `# HELP ${counter.name} ${counter.help}\n`;
      output += `# TYPE ${counter.name} counter\n`;

      for (const [labels, value] of counter.labelValues) {
        const labelStr = labels ? `{${labels}}` : '';
        output += `${counter.name}${labelStr} ${value}\n`;
      }
    }

    // 导出仪表盘
    for (const [name, gauge] of this.gauges) {
      output += `# HELP ${gauge.name} ${gauge.help}\n`;
      output += `# TYPE ${gauge.name} gauge\n`;

      for (const [labels, value] of gauge.labelValues) {
        const labelStr = labels ? `{${labels}}` : '';
        output += `${gauge.name}${labelStr} ${value}\n`;
      }
    }

    // 导出直方图
    for (const [name, histogram] of this.histograms) {
      output += `# HELP ${name} ${histogram.help}\n`;
      output += `# TYPE ${name} histogram\n`;

      for (const [labels, data] of histogram.labelValues) {
        const labelStr = labels ? `{${labels}}` : '';

        // Bucket计数
        for (let i = 0; i < histogram.buckets.length; i++) {
          output += `${name}_bucket{le="${histogram.buckets[i]}"${labelStr ? ', ' + labelStr : ''}} ${data.counts[i]}\n`;
        }
        output += `${name}_bucket{le="+Inf"${labelStr ? ', ' + labelStr : ''}} ${data.counts[data.counts.length - 1]}\n`;

        // 总和和计数
        output += `${name}_sum${labelStr} ${data.sum}\n`;
        output += `${name}_count${labelStr} ${data.count}\n`;
      }
    }

    return output;
  }

  /**
   * 保存指标到文件
   */
  async saveMetricsToFile(filePath) {
    try {
      const metrics = this.exportPrometheusMetrics();
      await fs.promises.writeFile(filePath, metrics);
      console.log(`Metrics saved to ${filePath}`);
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * 获取实时指标数据
   */
  getRealTimeMetrics() {
    return {
      timestamp: Date.now(),
      metrics: {
        system: {
          cpu: this.getGaugeValue('system_cpu_usage_percent'),
          memory: this.getGaugeValue('system_memory_usage_percent'),
          heap: this.getGaugeValue('system_memory_heap_used_mb'),
          eventLoopLag: this.getGaugeValue('system_event_loop_lag_ms')
        },
        connections: {
          current: this.getGaugeValue('websocket_connections_current'),
          total: this.getCounterValue('websocket_connections_total')
        },
        performance: {
          avgResponseTime: this.calculateAverageResponseTime(),
          requestsPerSecond: this.calculateRequestsPerSecond(),
          errorRate: this.calculateErrorRate()
        }
      },
      alerts: Array.from(this.alerts.values()).filter(a => a.status === 'active')
    };
  }

  /**
   * 计算每秒请求数
   */
  calculateRequestsPerSecond() {
    // 简化实现，实际应该基于时间窗口计算
    const totalRequests = this.getCounterValue('http_requests_total');
    return totalRequests / (process.uptime() || 1);
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * 清理过期数据
   */
  cleanup() {
    // 清理过期告警历史
    const oneHourAgo = Date.now() - 3600000;
    this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > oneHourAgo);

    // 清理已解决的告警
    for (const [key, alert] of this.alerts) {
      if (alert.status === 'resolved' && alert.resolvedAt &&
          (Date.now() - alert.resolvedAt) > 300000) { // 5分钟后清理
        this.alerts.delete(key);
      }
    }

    this.emit('cleanup:completed');
  }

  /**
   * 设置告警阈值
   */
  setAlertThreshold(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeHandles: process._getActiveHandles().length,
      activeRequests: process._getActiveRequests().length,
      metrics: {
        totalMetrics: this.metrics.size,
        totalCounters: this.counters.size,
        totalGauges: this.gauges.size,
        totalHistograms: this.histograms.size
      },
      alerts: {
        active: Array.from(this.alerts.values()).filter(a => a.status === 'active').length,
        total: this.alertHistory.length
      }
    };
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    console.log('Shutting down monitoring system...');

    // 保存最终指标
    await this.saveMetricsToFile(`./metrics/final-metrics-${Date.now()}.prom`);

    // 清理资源
    this.metrics.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.alerts.clear();
    this.alertHistory = [];
    this.timers.clear();

    console.log('Monitoring system shutdown complete');
  }
}

module.exports = MonitoringSystem;