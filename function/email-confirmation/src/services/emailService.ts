import nodemailer from "nodemailer";
import { env } from "../utils/env.js";

export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });

  async sendPasswordReset(params: {
    to: string;
    token: string;
  }): Promise<void> {
    const resetUrl = `${env.appHost}/password-recover/${encodeURIComponent(params.token)}`;

    const subject = "Redefina sua senha no TrackRoom";

    const text = [
      "Olá,",
      "",
      "Recebemos uma solicitação para redefinir sua senha no TrackRoom.",
      "Para criar uma nova senha, acesse o link abaixo:",
      resetUrl,
      "Se você não solicitou essa alteração, ignore este e-mail."
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Redefina sua senha no TrackRoom</h2>
        <p>Olá!</p>
        <p>Recebemos uma solicitação para redefinir sua senha no TrackRoom.</p>
        <p>Para criar uma nova senha, clique no botão abaixo:</p>
        <p>
          <a
            href="${escapeHtml(resetUrl)}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Redefinir senha
          </a>
        </p>
        <p>Ou, se preferir, use este link:</p>
        <p>
          <a href="${escapeHtml(resetUrl)}">
            ${escapeHtml(resetUrl)}
          </a>
        </p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.smtpFrom,
      to: params.to,
      subject,
      text,
      html,
    });
  }

  async sendAccountConfirmation(params: {
    to: string;
    token: string;
    code: string;
  }): Promise<void> {
    const displayName = "usuário";
    const confirmationUrl = `${env.appHost}/confirm/${encodeURIComponent(params.token)}`;

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
          <p>E informe o código de confirmação: <strong>${escapeHtml(params.code)}</strong><p>
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
      from: env.smtpFrom,
      to: params.to,
      subject,
      text,
      html,
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}