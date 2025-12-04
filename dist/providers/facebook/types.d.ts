import { z } from 'zod';
export declare const FacebookWebhookSchema: z.ZodObject<{
    object: z.ZodString;
    entry: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        time: z.ZodNumber;
        messaging: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        changes: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        time: number;
        messaging?: any[] | undefined;
        changes?: any[] | undefined;
    }, {
        id: string;
        time: number;
        messaging?: any[] | undefined;
        changes?: any[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    object: string;
    entry: {
        id: string;
        time: number;
        messaging?: any[] | undefined;
        changes?: any[] | undefined;
    }[];
}, {
    object: string;
    entry: {
        id: string;
        time: number;
        messaging?: any[] | undefined;
        changes?: any[] | undefined;
    }[];
}>;
export type FacebookWebhook = z.infer<typeof FacebookWebhookSchema>;
