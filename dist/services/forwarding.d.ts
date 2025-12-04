import { ForwardTarget, ForwardResult } from '../types';
export declare class ForwardingService {
    forwardWebhook(targets: ForwardTarget[], payload: unknown, originalHeaders?: Record<string, string>): Promise<ForwardResult[]>;
}
