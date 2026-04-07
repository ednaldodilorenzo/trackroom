import {z} from "zod";

export const passwordResetMessageSchema = z.object({
    email: z.string().email(),
    token: z.string(),
});

export type PasswordResetMessage = z.infer<typeof passwordResetMessageSchema>;