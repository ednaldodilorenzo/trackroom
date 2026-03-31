"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountConfirmationMessageSchema = void 0;
const zod_1 = require("zod");
exports.accountConfirmationMessageSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string(),
    code: zod_1.z.string(),
});
