// Entry point for Cloudflare Workers
import app from './app';

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return app.fetch(request, env, ctx);
  }
};