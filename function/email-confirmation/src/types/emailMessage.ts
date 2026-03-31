import { z } from "zod";

export const accountConfirmationMessageSchema = z.object({
    email: z.string().email(),
    token: z.string(),
    code: z.string(),
});

export type AccountConfirmationMessage = z.infer<
    typeof accountConfirmationMessageSchema
>;