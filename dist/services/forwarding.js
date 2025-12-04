export class ForwardingService {
    async forwardWebhook(targets, payload, originalHeaders) {
        console.log(`📤 Forwarding to ${targets.length} target(s)`);
        const forwardPromises = targets.map(async (target) => {
            const startTime = Date.now();
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'webhook-router/1.0',
                    ...target.headers,
                    // Preserve important webhook headers
                    ...(originalHeaders?.['x-hub-signature'] && {
                        'x-hub-signature': originalHeaders['x-hub-signature']
                    }),
                    ...(originalHeaders?.['x-hub-signature-256'] && {
                        'x-hub-signature-256': originalHeaders['x-hub-signature-256']
                    })
                };
                const response = await fetch(target.url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                const responseTime = Date.now() - startTime;
                const success = response.ok;
                console.log(`📤 ${target.url}: ${response.status} (${responseTime}ms) ${success ? '✅' : '❌'}`);
                return {
                    url: target.url,
                    status: response.status,
                    success,
                    responseTime,
                    ...(success ? {} : { error: `HTTP ${response.status}: ${response.statusText}` })
                };
            }
            catch (error) {
                const responseTime = Date.now() - startTime;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.log(`📤 ${target.url}: ERROR (${responseTime}ms) ❌ ${errorMessage}`);
                return {
                    url: target.url,
                    status: 0,
                    success: false,
                    error: errorMessage,
                    responseTime
                };
            }
        });
        return Promise.all(forwardPromises);
    }
}
