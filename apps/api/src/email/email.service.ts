import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');

    // Se SMTP não estiver configurado, desabilita envio
    this.enabled = !!(smtpHost && smtpUser);

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: smtpUser,
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });

      this.logger.log(`Email service enabled with SMTP: ${smtpHost}`);
    } else {
      this.logger.warn(
        'Email service disabled - SMTP credentials not configured',
      );
    }
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
  ): Promise<{ sent: boolean; token?: string }> {
    if (!this.enabled) {
      this.logger.warn(
        `[DEV MODE] Email not sent to ${to}. Token: ${token.substring(0, 20)}...`,
      );
      return { sent: false, token }; // Retorna token em modo dev
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://guildmesh.duckdns.org';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const htmlTemplate = this.getPasswordResetTemplate(resetLink);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'SMTP_FROM',
          '"Guild Mesh" <noreply@guildmesh.com>',
        ),
        to,
        subject: 'Recuperação de Senha - Guild Mesh',
        html: htmlTemplate,
      });

      this.logger.log(`Password reset email sent to ${to}`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      this.logger.error('Error details:', error.message || error);

      // Em caso de falha no envio, retorna token (fallback para modo dev)
      this.logger.warn(
        `[FALLBACK] Returning token due to email send failure. Token: ${token.substring(0, 20)}...`,
      );
      return { sent: false, token };
    }
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">🔐 Guild Mesh</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Recuperação de Senha</h2>

              <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
                Você solicitou a recuperação de senha da sua conta no <strong>Guild Mesh</strong>.
              </p>

              <p style="margin: 0 0 30px; color: #666; font-size: 16px; line-height: 1.6;">
                Clique no botão abaixo para redefinir sua senha. Este link é válido por <strong>1 hora</strong>.
              </p>

              <!-- Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 40px; color: white; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Resetar Minha Senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin: 10px 0; padding: 12px; background: #f4f4f7; border-radius: 4px; word-break: break-all; font-size: 12px; color: #666;">
                ${resetLink}
              </p>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

              <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">
                ⚠️ <strong>Não solicitou esta alteração?</strong><br>
                Se você não pediu para redefinir sua senha, ignore este email. Sua senha permanecerá inalterada.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background: #f9f9f9; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Guild Mesh - Sistema de Gerenciamento de Clãs
              </p>
              <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                <a href="http://guildmesh.duckdns.org" style="color: #667eea; text-decoration: none;">guildmesh.duckdns.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
