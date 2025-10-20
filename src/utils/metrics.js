class MetricsCollector {
  constructor() {
    this.metrics = {
      messagesSent: 0,
      messagesFailed: 0,
      mediaSent: 0,
      mediaFailed: 0,
      bulkRequests: 0,
      bulkMessagesSent: 0,
      bulkMessagesFailed: 0,
      qrCodeRequests: 0,
      apiRequests: 0,
      apiErrors: 0,
      startTime: Date.now(),
      lastActivity: Date.now()
    };
    
    this.hourlyStats = new Map();
    this.dailyStats = new Map();
  }
  
  incrementCounter(counterName, value = 1) {
    if (this.metrics[counterName] !== undefined) {
      this.metrics[counterName] += value;
    }
    this.metrics.lastActivity = Date.now();
    this.updateHourlyStats(counterName, value);
    this.updateDailyStats(counterName, value);
  }
  
  updateHourlyStats(counterName, value) {
    const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    if (!this.hourlyStats.has(hour)) {
      this.hourlyStats.set(hour, {});
    }
    
    const hourData = this.hourlyStats.get(hour);
    hourData[counterName] = (hourData[counterName] || 0) + value;
  }
  
  updateDailyStats(counterName, value) {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (!this.dailyStats.has(day)) {
      this.dailyStats.set(day, {});
    }
    
    const dayData = this.dailyStats.get(day);
    dayData[counterName] = (dayData[counterName] || 0) + value;
  }
  
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const lastActivity = Date.now() - this.metrics.lastActivity;
    
    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000), // in seconds
      lastActivity: Math.floor(lastActivity / 1000), // seconds ago
      successRate: this.calculateSuccessRate(),
      hourlyStats: Object.fromEntries(this.hourlyStats),
      dailyStats: Object.fromEntries(this.dailyStats)
    };
  }
  
  calculateSuccessRate() {
    const totalMessages = this.metrics.messagesSent + this.metrics.messagesFailed;
    const totalMedia = this.metrics.mediaSent + this.metrics.mediaFailed;
    const totalBulk = this.metrics.bulkMessagesSent + this.metrics.bulkMessagesFailed;
    
    const totalSent = this.metrics.messagesSent + this.metrics.mediaSent + this.metrics.bulkMessagesSent;
    const totalFailed = this.metrics.messagesFailed + this.metrics.mediaFailed + this.metrics.bulkMessagesFailed;
    const total = totalSent + totalFailed;
    
    return total > 0 ? Math.round((totalSent / total) * 100) : 0;
  }
  
  resetMetrics() {
    this.metrics = {
      messagesSent: 0,
      messagesFailed: 0,
      mediaSent: 0,
      mediaFailed: 0,
      bulkRequests: 0,
      bulkMessagesSent: 0,
      bulkMessagesFailed: 0,
      qrCodeRequests: 0,
      apiRequests: 0,
      apiErrors: 0,
      startTime: Date.now(),
      lastActivity: Date.now()
    };
    
    this.hourlyStats.clear();
    this.dailyStats.clear();
  }
  
  // Cleanup old stats (keep only last 7 days)
  cleanupOldStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10);
    
    for (const [date] of this.dailyStats) {
      if (date < cutoffDate) {
        this.dailyStats.delete(date);
      }
    }
    
    // Keep only last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const cutoffHour = twentyFourHoursAgo.toISOString().slice(0, 13);
    
    for (const [hour] of this.hourlyStats) {
      if (hour < cutoffHour) {
        this.hourlyStats.delete(hour);
      }
    }
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

// Cleanup old stats every hour
setInterval(() => {
  metricsCollector.cleanupOldStats();
}, 60 * 60 * 1000);

module.exports = metricsCollector;
