"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const emailMessage_js_1 = require("../types/emailMessage.js");
const emailService_js_1 = require("../services/emailService.js");
const emailService = new emailService_js_1.EmailService();
async function sendAccountConfirmation(message, context) {
    console.log("Received queue message for account confirmation.");
    let payload;
    try {
        const parsed = typeof message === "string" ? JSON.parse(message) : message;
        payload = emailMessage_js_1.accountConfirmationMessageSchema.parse(parsed);
    }
    catch (error) {
        context.error("Invalid queue message payload.", error);
        throw error;
    }
    try {
        await emailService.sendAccountConfirmation({
            to: payload.email,
            token: payload.token,
            code: payload.code,
        });
        console.log(`Confirmation email sent to ${payload.email}.`);
    }
    catch (error) {
        context.error(`Failed to send confirmation email to ${payload.email}.`, error);
        throw error;
    }
}
functions_1.app.storageQueue("sendAccountConfirmation", {
    queueName: "account-confirmation",
    connection: "QUEUE_STORAGE_CONNECTION",
    handler: sendAccountConfirmation,
});
