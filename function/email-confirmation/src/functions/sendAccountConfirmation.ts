import { app, InvocationContext } from "@azure/functions";
import { accountConfirmationMessageSchema, type AccountConfirmationMessage } from "../types/emailMessage.js";
import { EmailService } from "../services/emailService.js";

const emailService = new EmailService();

async function sendAccountConfirmation(
    message: unknown,
    context: InvocationContext
): Promise<void> {
    context.log("Received queue message for account confirmation.");

    let payload: AccountConfirmationMessage;

    try {
        const parsed =
            typeof message === "string" ? JSON.parse(message) : message;

        payload = accountConfirmationMessageSchema.parse(parsed);
    } catch (error) {
        context.error("Invalid queue message payload.", error);
        throw error;
    }

    try {
        await emailService.sendAccountConfirmation({
            to: payload.email,
            token: payload.token,
            code: payload.code,
        });

        context.log(`Confirmation email sent to ${payload.email}.`);
    } catch (error) {
        context.error(
            `Failed to send confirmation email to ${payload.email}.`,
            error
        );
        throw error;
    }
}

app.storageQueue("sendAccountConfirmation", {
    queueName: "account-confirmation",
    connection: "QUEUE_STORAGE_CONNECTION",
    handler: sendAccountConfirmation,
});