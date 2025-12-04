import { z } from 'zod';
// Facebook webhook payload validation schema
export const FacebookWebhookSchema = z.object({
    object: z.string(),
    entry: z.array(z.object({
        id: z.string(),
        time: z.number(),
        messaging: z.array(z.any()).optional(),
        changes: z.array(z.any()).optional()
    }))
});
