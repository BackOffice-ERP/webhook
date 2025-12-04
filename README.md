# Webhook Router v2.0

A simple, modular webhook router that forwards incoming webhooks to configured URLs with comprehensive logging and monitoring.

## Features

- ✅ **Modular Provider System** - Easy to add new webhook providers
- ✅ **Multi-target Forwarding** - Forward to multiple URLs per provider
- ✅ **Payload Validation** - Validate incoming webhooks with Zod schemas
- ✅ **Comprehensive Logging** - Track all webhook activities with detailed logs
- ✅ **Statistics & Monitoring** - Provider stats, success rates, response times
- ✅ **Failure Alerts** - Built-in alerting for high failure rates
- ✅ **Multiple Deployment Options** - Node.js, Docker, Cloudflare Workers

## Quick Start

### Local Development

```bash
cd v2
npm install
npm run dev
```

The server will start on `http://localhost:3000`

### Docker

```bash
npm run build
npm run docker:build
npm run docker:run
```

### Cloudflare Workers

```bash
npm run cf:deploy
```

## API Endpoints

### Webhook Endpoints
- `GET /webhooks/facebook` - Facebook webhook verification
- `POST /webhooks/facebook` - Facebook webhook handler
- `GET /webhooks/instagram` - Instagram webhook verification  
- `POST /webhooks/instagram` - Instagram webhook handler

### Monitoring APIs
- `GET /` - Health check
- `GET /api/logs` - Get webhook logs (query: `?provider=facebook&limit=50`)
- `GET /api/logs/:id` - Get specific log by ID
- `GET /api/stats` - Get provider statistics (query: `?provider=facebook`)
- `GET /api/alerts` - Get failure alerts (query: `?threshold=50&min_requests=10`)
- `GET /api/providers` - List all providers and their configurations

## Adding New Providers

1. **Create provider folder**: `src/providers/yourprovider/`

2. **Define types** (optional): `src/providers/yourprovider/types.ts`
```typescript
import { z } from 'zod';

export const YourProviderSchema = z.object({
  // Define your webhook structure
  event: z.string(),
  data: z.any()
});
```

3. **Create provider**: `src/providers/yourprovider/index.ts`
```typescript
import { WebhookProvider } from '../../types';
import { ForwardingService } from '../../services/forwarding';
import { LoggingService } from '../../services/logging';

export class YourProvider implements WebhookProvider {
  name = 'yourprovider';
  
  forwardTargets = [
    { url: 'https://your-app.com/webhooks/yourprovider' }
  ];

  constructor(
    private forwardingService: ForwardingService,
    private loggingService: LoggingService
  ) {}

  validatePayload(payload: unknown): boolean {
    // Add your validation logic
    return true;
  }

  routes = {
    webhook: async (c: any) => {
      // Handle webhook logic
      const payload = await c.req.json();
      
      if (!this.validatePayload(payload)) {
        // Log validation failure and return error
      }
      
      const results = await this.forwardingService.forwardWebhook(
        this.forwardTargets,
        payload
      );
      
      // Log results and return response
    }
  };
}
```

4. **Register in app**: Add to `src/app.ts`
```typescript
import { YourProvider } from './providers/yourprovider';

const providers: Record<string, WebhookProvider> = {
  facebook: new FacebookProvider(forwardingService, loggingService),
  instagram: new InstagramProvider(forwardingService, loggingService),
  yourprovider: new YourProvider(forwardingService, loggingService)
};
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `FACEBOOK_VERIFY_TOKEN` - Facebook webhook verification token
- `INSTAGRAM_VERIFY_TOKEN` - Instagram webhook verification token

### Provider Forward Targets

Edit the `forwardTargets` array in each provider to customize where webhooks are forwarded:

```typescript
forwardTargets: ForwardTarget[] = [
  { url: 'https://your-app.com/webhooks/provider' },
  { 
    url: 'https://backup-app.com/webhooks/provider',
    headers: { 'X-Auth-Token': 'your-token' }
  }
];
```

## Monitoring & Debugging

### View Recent Logs
```bash
curl http://localhost:3000/api/logs?provider=facebook&limit=10
```

### Check Statistics
```bash
curl http://localhost:3000/api/stats?provider=facebook
```

### Get Failure Alerts
```bash
curl http://localhost:3000/api/alerts?threshold=50&min_requests=5
```

## Architecture

```
src/
├── types/           # TypeScript interfaces
├── services/        # Core services (logging, forwarding)
├── providers/       # Webhook providers (facebook, instagram, etc.)
│   └── facebook/
│       ├── index.ts # Provider implementation
│       └── types.ts # Provider-specific types
├── app.ts          # Main application
├── server.ts       # Node.js entry point
└── cloudflare.ts   # Cloudflare Workers entry point
```

## Production Deployment

### Environment Variables (Cloudflare)
Set these in your Cloudflare Workers dashboard:
- `FACEBOOK_VERIFY_TOKEN`
- `INSTAGRAM_VERIFY_TOKEN`

### Environment Variables (Docker/Node.js)
Create a `.env` file based on `.env.example`

### Monitoring
Use the `/api/alerts` endpoint to monitor for high failure rates and set up external alerting based on the response.