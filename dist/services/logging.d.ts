import { WebhookLog, ProviderStats } from '../types';
export declare class LoggingService {
    private logs;
    private maxLogs;
    addLog(log: Omit<WebhookLog, 'id' | 'timestamp'>): string;
    getLogs(provider?: string, limit?: number): WebhookLog[];
    getLog(id: string): WebhookLog | undefined;
    getStats(provider?: string): ProviderStats[];
    getFailureAlerts(failureThreshold?: number, minRequests?: number): string[];
}
