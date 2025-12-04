import { Hono } from 'hono';
import { LoggingService } from './services/logging';
import { ForwardingService } from './services/forwarding';
import { FacebookProvider } from './providers/facebook';
import { InstagramProvider } from './providers/instagram';
import { WebhookProvider } from './types';

const app = new Hono();

// Initialize services
const loggingService = new LoggingService();
const forwardingService = new ForwardingService();

// Initialize providers
const providers: Record<string, WebhookProvider> = {
  facebook: new FacebookProvider(forwardingService, loggingService),
  instagram: new InstagramProvider(forwardingService, loggingService)
};

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'webhook-router',
    status: 'healthy',
    version: '2.0.0',
    providers: Object.keys(providers),
    timestamp: new Date().toISOString()
  });
});

// Register provider routes dynamically
Object.entries(providers).forEach(([name, provider]) => {
  // Verification endpoint (GET)
  if (provider.routes.verification) {
    app.get(`/webhooks/${name}`, provider.routes.verification);
    console.log(`✅ Registered GET /webhooks/${name} (verification)`);
  }

  // Webhook endpoint (POST)
  app.post(`/webhooks/${name}`, provider.routes.webhook);
  console.log(`✅ Registered POST /webhooks/${name} (webhook)`);
});

// API endpoints for monitoring and debugging

// Get logs
app.get('/api/logs', (c) => {
  const provider = c.req.query('provider');
  const limit = parseInt(c.req.query('limit') || '50');
  
  const logs = loggingService.getLogs(provider, limit);
  
  return c.json({
    logs,
    count: logs.length,
    provider: provider || 'all'
  });
});

// Get specific log
app.get('/api/logs/:id', (c) => {
  const id = c.req.param('id');
  const log = loggingService.getLog(id);
  
  if (!log) {
    return c.json({ error: 'Log not found' }, 404);
  }
  
  return c.json(log);
});

// Get statistics
app.get('/api/stats', (c) => {
  const provider = c.req.query('provider');
  const stats = loggingService.getStats(provider);
  
  return c.json({
    stats,
    provider: provider || 'all',
    timestamp: new Date().toISOString()
  });
});

// Get failure alerts
app.get('/api/alerts', (c) => {
  const threshold = parseInt(c.req.query('threshold') || '50');
  const minRequests = parseInt(c.req.query('min_requests') || '10');
  
  const alerts = loggingService.getFailureAlerts(threshold, minRequests);
  
  return c.json({
    alerts,
    count: alerts.length,
    threshold,
    minRequests
  });
});

// List all providers and their configurations
app.get('/api/providers', (c) => {
  const providerInfo = Object.entries(providers).map(([name, provider]) => ({
    name,
    forwardTargets: provider.forwardTargets
  }));
  
  return c.json({
    providers: providerInfo,
    count: providerInfo.length
  });
});

console.log('🚀 Webhook Router v2.0 initialized');
console.log(`📊 Providers: ${Object.keys(providers).join(', ')}`);

export default app;