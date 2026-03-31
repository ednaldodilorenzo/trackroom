function required(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function optionalBoolean(name: string, defaultValue: boolean): boolean {
    const value = process.env[name];
    if (!value) return defaultValue;
    return value.toLowerCase() === "true";
}

function optionalNumber(name: string, defaultValue: number): number {
    const value = process.env[name];
    if (!value) return defaultValue;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number`);
    }
    return parsed;
}

export const env = {
    smtpHost: required("SMTP_HOST"),
    smtpPort: optionalNumber("SMTP_PORT", 587),
    smtpSecure: optionalBoolean("SMTP_SECURE", false),
    smtpUser: required("SMTP_USER"),
    smtpPassword: required("SMTP_PASSWORD"),
    smtpFrom: required("SMTP_FROM"),
    appHost: required("APP_HOST"),
};