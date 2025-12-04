import { WebhookLog, ForwardResult, ProviderStats } from '../types';

export class LoggingService {
  private logs: WebhookLog[] = [];
  private maxLogs = 1000;

  addLog(log: Omit<WebhookLog, 'id' | 'timestamp'>): string {
    const logEntry: WebhookLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(`📝 [${logEntry.provider}] ${logEntry.success ? '✅' : '❌'} ${logEntry.id}`);
    return logEntry.id;
  }

  getLogs(provider?: string, limit = 50): WebhookLog[] {
    let filtered = this.logs;
    
    if (provider) {
      filtered = this.logs.filter(log => log.provider === provider);
    }

    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getLog(id: string): WebhookLog | undefined {
    return this.logs.find(log => log.id === id);
  }

  getStats(provider?: string): ProviderStats[] {
    const providers = provider 
      ? [provider] 
      : [...new Set(this.logs.map(log => log.provider))];

    return providers.map(providerName => {
      const providerLogs = this.logs.filter(log => log.provider === providerName);
      const successful = providerLogs.filter(log => log.success).length;
      const total = providerLogs.length;
      
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const lastHour = providerLogs.filter(log => 
        new Date(log.timestamp) > oneHourAgo
      ).length;
      
      const last24Hours = providerLogs.filter(log => 
        new Date(log.timestamp) > oneDayAgo
      ).length;

      // Calculate average response time
      const responseTimes = providerLogs.flatMap(log => 
        log.results.map(result => result.responseTime)
      );
      const avgResponseTime = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      return {
        provider: providerName,
        total,
        successful,
        failed: total - successful,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
        avgResponseTime,
        lastHour,
        last24Hours
      };
    });
  }

  // Alert checking - returns providers with high failure rates
  getFailureAlerts(failureThreshold = 50, minRequests = 10): string[] {
    const stats = this.getStats();
    return stats
      .filter(stat => 
        stat.lastHour >= minRequests && 
        stat.successRate < failureThreshold
      )
      .map(stat => 
        `${stat.provider}: ${stat.successRate}% success rate (${stat.failed}/${stat.total} failed)`
      );
  }
}