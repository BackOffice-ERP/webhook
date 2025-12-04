// Entry point for Node.js (local development / Docker)
import { serve } from '@hono/node-server';
import app from './app';
const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Starting webhook router on port ${port}`);
serve({
    fetch: app.fetch,
    port,
});
console.log(`✅ Webhook router running on http://localhost:${port}`);
