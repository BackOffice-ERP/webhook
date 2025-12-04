import { WebhookProvider, ForwardTarget } from '../../types';
import { ForwardingService } from '../../services/forwarding';
import { LoggingService } from '../../services/logging';
import { z } from 'zod';

// Instagram webhook validation (simplified)
const InstagramWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(z.any())
});

export class InstagramProvider implements WebhookProvider {
  name = 'instagram';
  
  forwardTargets: ForwardTarget[] = [
    { url: 'https://bo.ge/instagram/hook/instagram' },
    { url: 'https://omni.bo.ge/instagram' }
  ];

  constructor(
    private forwardingService: ForwardingService,
    private loggingService: LoggingService
  ) {}

  validatePayload(payload: unknown): boolean {
    try {
      InstagramWebhookSchema.parse(payload);
      return true;
    } catch (error) {
      console.log('❌ Instagram payload validation failed:', error);
      return false;
    }
  }

  routes = {
    verification: (c: any) => {
      const mode = c.req.query('hub.mode');
      const token = c.req.query('hub.verify_token');
      const challenge = c.req.query('hub.challenge');
      const env = c.env as any || {};

      if (mode === 'subscribe' && token === env.INSTAGRAM_VERIFY_TOKEN && challenge) {
        console.log('✅ Instagram webhook verified');
        return c.text(challenge);
      }

      return c.text('Forbidden', 403);
    },

    webhook: async (c: any) => {
      try {
        const payload = await c.req.json();
        console.log('📥 Instagram webhook received');

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

        const results = await this.forwardingService.forwardWebhook(
          this.forwardTargets,
          payload
        );

        const successCount = results.filter(r => r.success).length;
        const success = successCount > 0;

        const logId = this.loggingService.addLog({
          provider: this.name,
          payload,
          results,
          success
        });

        return c.json({
          success,
          message: `Forwarded to ${successCount}/${results.length} targets`,
          logId,
          results
        });

      } catch (error) {
        console.error('❌ Instagram webhook error:', error);
        
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
          logId
        }, 500);
      }
    }
  };
}