"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
function required(name) {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function optionalBoolean(name, defaultValue) {
    const value = process.env[name];
    if (!value)
        return defaultValue;
    return value.toLowerCase() === "true";
}
function optionalNumber(name, defaultValue) {
    const value = process.env[name];
    if (!value)
        return defaultValue;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number`);
    }
    return parsed;
}
exports.env = {
    smtpHost: required("SMTP_HOST"),
    smtpPort: optionalNumber("SMTP_PORT", 587),
    smtpSecure: optionalBoolean("SMTP_SECURE", false),
    smtpUser: required("SMTP_USER"),
    smtpPassword: required("SMTP_PASSWORD"),
    smtpFrom: required("SMTP_FROM"),
    appHost: required("APP_HOST"),
};
