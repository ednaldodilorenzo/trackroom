"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_js_1 = require("../utils/env.js");
class EmailService {
    transporter = nodemailer_1.default.createTransport({
        host: env_js_1.env.smtpHost,
        port: env_js_1.env.smtpPort,
        secure: env_js_1.env.smtpSecure,
        auth: {
            user: env_js_1.env.smtpUser,
            pass: env_js_1.env.smtpPassword,
        },
    });
    async sendAccountConfirmation(params) {
        const displayName = "usuário";
        const confirmationUrl = `https://${env_js_1.env.appHost}/confirm/${encodeURIComponent(params.token)}`;
        const subject = "Confirme sua conta no TrackRoom";
        const text = [
            "Olá,",
            "",
            "Recebemos seu cadastro no TrackRoom.",
            "Para confirmar sua conta, acesse o link abaixo:",
            confirmationUrl,
            "E informe o código de confirmação:",
            params.code,
            "Se você não solicitou esse cadastro, ignore este e-mail."
        ].join("\n");
        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Confirme sua conta no TrackRoom</h2>
        <p>Olá, <strong>${escapeHtml(displayName)}</strong>!</p>
        <p>Recebemos seu cadastro no TrackRoom.</p>
        <p>Para confirmar sua conta, clique no botão abaixo:</p>
        <p>
          <a
            href="${escapeHtml(confirmationUrl)}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Confirmar conta
          </a>
          E informe o código de confirmação: <strong>${escapeHtml(params.code)}</strong>
        </p>
        <p>Ou, se preferir, use este link:</p>
        <p>
          <a href="${escapeHtml(confirmationUrl)}">
            ${escapeHtml(confirmationUrl)}
          </a>
        </p>
        <p>Se você não solicitou esse cadastro, ignore este e-mail.</p>
      </div>
    `;
        await this.transporter.sendMail({
            from: env_js_1.env.smtpFrom,
            to: params.to,
            subject,
            text,
            html,
        });
    }
}
exports.EmailService = EmailService;
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
