import { WebhookProvider, ForwardTarget } from '../../types';
import { ForwardingService } from '../../services/forwarding';
import { LoggingService } from '../../services/logging';
export declare class FacebookProvider implements WebhookProvider {
    private forwardingService;
    private loggingService;
    name: string;
    forwardTargets: ForwardTarget[];
    constructor(forwardingService: ForwardingService, loggingService: LoggingService);
    validatePayload(payload: unknown): boolean;
    routes: {
        verification: (c: any) => any;
        webhook: (c: any) => Promise<any>;
    };
}
