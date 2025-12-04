export interface ForwardTarget {
  url: string;
  headers?: Record<string, string>;
}

export interface WebhookProvider {
  name: string;
  forwardTargets: ForwardTarget[];
  validatePayload: (payload: unknown) => boolean;
  routes: {
    verification?: (c: any) => any;
    webhook: (c: any) => Promise<any>;
  };
}

export interface WebhookLog {
  id: string;
  provider: string;
  timestamp: string;
  payload: unknown;
  results: ForwardResult[];
  success: boolean;
  error?: string;
}

export interface ForwardResult {
  url: string;
  status: number;
  success: boolean;
  error?: string;
  responseTime: number;
}

export interface ProviderStats {
  provider: string;
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  avgResponseTime: number;
  lastHour: number;
  last24Hours: number;
}