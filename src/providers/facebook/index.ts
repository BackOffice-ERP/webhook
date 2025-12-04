import { WebhookProvider, ForwardTarget } from '../../types';
import { FacebookWebhookSchema } from './types';
import { ForwardingService } from '../../services/forwarding';
import { LoggingService } from '../../services/logging';

export class FacebookProvider implements WebhookProvider {
  name = 'facebook';
  
  forwardTargets: ForwardTarget[] = [
    { url: 'https://bo.ge/facebook/hook/facebook' },
    { url: 'https://omni.bo.ge/' }
  ];

  constructor(
    private forwardingService: ForwardingService,
    private loggingService: LoggingService
  ) {}

  validatePayload(payload: unknown): boolean {
    try {
      FacebookWebhookSchema.parse(payload);
      return true;
    } catch (error) {
      console.log('❌ Facebook payload validation failed:', error);
      return false;
    }
  }

  routes = {
    // GET /webhooks/facebook - Webhook verification
    verification: (c: any) => {
      const mode = c.req.query('hub.mode');
      const token = c.req.query('hub.verify_token');
      const challenge = c.req.query('hub.challenge');
      const env = c.env as any || {};

      if (mode === 'subscribe' && token === env.FACEBOOK_VERIFY_TOKEN && challenge) {
        console.log('✅ Facebook webhook verified');
        return c.text(challenge);
      }

      console.log('❌ Facebook webhook verification failed');
      return c.text('Forbidden', 403);
    },

    // POST /webhooks/facebook - Webhook payload
    webhook: async (c: any) => {
      try {
        const payload = await c.req.json();
        
        console.log('📥 Facebook webhook received');

        // Validate payload
        if (!this.validatePayload(payload)) {
          const logId = this.loggingService.addLog({
            provider: this.name,
            payload,
            results: [],
            success: false,
            error: 'Invalid payload structure'
          });

          return c.json({
            success: false,
            message: 'Invalid payload structure',
            logId
          }, 400);
        }

        // Get original headers for forwarding
        const headers: Record<string, string> = {};
        const headerEntries = c.req.header();
        for (const [key, value] of Object.entries(headerEntries)) {
          if (typeof value === 'string') {
            headers[key.toLowerCase()] = value;
          }
        }

        // Forward to targets
        const results = await this.forwardingService.forwardWebhook(
          this.forwardTargets,
          payload,
          headers
        );

        const successCount = results.filter(r => r.success).length;
        const success = successCount > 0;

        // Log the result
        const logId = this.loggingService.addLog({
          provider: this.name,
          payload,
          results,
          success,
          ...(success ? {} : { error: `Only ${successCount}/${results.length} forwards succeeded` })
        });

        return c.json({
          success,
          message: `Forwarded to ${successCount}/${results.length} targets`,
          logId,
          results
        });

      } catch (error) {
        console.error('❌ Facebook webhook error:', error);
        
        const logId = this.loggingService.addLog({
          provider: this.name,
          payload: null,
          results: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        return c.json({
          success: false,
          message: 'Internal server error',
          logId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
    }
  };
}