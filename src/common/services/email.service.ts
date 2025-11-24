import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const emailConfig = this.configService.get<any>('email');
    const nodeEnv = this.configService.get<string>('server.nodeEnv');

    // Si hay configuración de Gmail, usarla (incluso en desarrollo)
    if (emailConfig?.provider === 'gmail') {
      // Eliminar espacios de la App Password (Gmail las genera con espacios pero no deben usarse)
      const appPassword = (emailConfig.password || '').replace(/\s+/g, '');
      
      if (!appPassword || appPassword.length !== 16) {
        this.logger.error(`App Password de Gmail inválida. Debe tener exactamente 16 caracteres sin espacios.`);
        throw new Error('App Password de Gmail inválida');
      }
      
      // Usar configuración SMTP directa en lugar del servicio 'gmail' para mejor compatibilidad con Render
      const smtpConfig: any = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: emailConfig.user,
          pass: appPassword, // App Password sin espacios
        },
        // Timeouts más largos para Render y conexiones lentas
        connectionTimeout: 60000, // 60 segundos
        greetingTimeout: 30000,
        socketTimeout: 60000,
        // Usar TLS explícito
        requireTLS: true,
        tls: {
          // No rechazar certificados no autorizados (necesario en algunos entornos)
          rejectUnauthorized: false,
        },
      };
      
      // Opciones de debug (solo en desarrollo)
      if (nodeEnv === 'development') {
        smtpConfig.debug = true;
        smtpConfig.logger = true;
      }
      
      this.transporter = nodemailer.createTransport(smtpConfig);
      this.logger.log(`Gmail configurado para envío de emails (SMTP directo). Usuario: ${emailConfig.user}`);
      
      // Verificar conexión en background (no bloquea)
      this.verifyConnection().catch(() => {
        // Error ya manejado en verifyConnection
      });
      
    } else if (emailConfig?.provider === 'resend') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: emailConfig.apiKey,
        },
      });
      this.logger.log('Resend configurado para envío de emails');
    } else if (emailConfig?.host) {
      // Configuración SMTP personalizada
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
      this.logger.log(`SMTP personalizado configurado: ${emailConfig.host}`);
    } else {
      // Fallback a Ethereal solo si no hay configuración y estamos en desarrollo
      if (nodeEnv === 'development') {
        this.logger.warn('No hay configuración de email. Usando Ethereal Email como fallback...');
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } else {
        throw new Error('Configuración de email requerida en producción');
      }
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.transporter) {
      throw new Error('Servicio de email no inicializado');
    }

    try {
      const fromEmail = this.configService.get<string>('email.from') || 'noreply@controlactivos.com';
      const fromName = this.configService.get<string>('email.fromName') || 'Sistema de Control de Activos';

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || this.htmlToText(options.html),
        html: options.html,
      };

      this.logger.debug(`Intentando enviar email a ${options.to} desde ${fromEmail}`);
      
      // Agregar timeout al envío (60 segundos para conexiones lentas en Render)
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout al enviar email')), 60000)
      );
      
      const info = await Promise.race([sendPromise, timeoutPromise]) as any;

      const nodeEnv = this.configService.get<string>('server.nodeEnv');
      if (nodeEnv === 'development') {
        // En desarrollo, mostrar el enlace de Ethereal si está disponible
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`✅ Email enviado. Preview: ${previewUrl}`);
        } else {
          this.logger.log(`✅ Email enviado a ${options.to}. Message ID: ${info.messageId}`);
        }
      } else {
        this.logger.log(`✅ Email enviado a ${options.to}. Message ID: ${info.messageId}`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Error al enviar email: ${error.message}`);
      this.logger.error(`Detalles del error:`, error);
      
      // Mensajes de error más específicos
      if (error.code === 'EAUTH') {
        this.logger.error('Error de autenticación. Verifica tu App Password de Gmail.');
        throw new Error('Error de autenticación con Gmail. Verifica tu App Password.');
      } else if (error.code === 'ECONNECTION') {
        this.logger.error('Error de conexión con el servidor de email.');
        throw new Error('Error de conexión con el servidor de email.');
      }
      
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string, userName?: string): Promise<void> {
    const subject = 'Recuperación de Contraseña - Sistema de Control de Activos';
    const html = this.getPasswordResetTemplate(resetLink, userName);

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  private getPasswordResetTemplate(resetLink: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e0e0e0;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">Sistema de Control de Activos</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin-top: 0;">Recuperación de Contraseña</h2>
      
      ${userName ? `<p>Hola <strong>${userName}</strong>,</p>` : '<p>Hola,</p>'}
      
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Control de Activos.</p>
      
      <p>Si solicitaste este cambio, haz clic en el siguiente botón para restablecer tu contraseña:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; font-weight: bold;">
          Restablecer Contraseña
        </a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280;">
        O copia y pega este enlace en tu navegador:<br>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
      </p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora. Si no solicitaste este cambio, 
          puedes ignorar este correo de forma segura.
        </p>
      </div>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        Este es un correo automático, por favor no respondas a este mensaje.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
      <p>© ${new Date().getFullYear()} Sistema de Control de Activos. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private async verifyConnection() {
    if (!this.transporter) return;
    
    try {
      // Timeout de 15 segundos para la verificación (más tiempo para Render)
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      this.logger.log('Conexión con Gmail verificada exitosamente');
    } catch (error: any) {
      if (error.message === 'Timeout') {
        this.logger.warn('Verificación de conexión con Gmail timeout. El envío de emails se intentará de todas formas.');
      } else {
        this.logger.warn(`Error al verificar conexión con Gmail: ${error.message}. El envío de emails se intentará de todas formas.`);
      }
    }
  }

  private htmlToText(html: string): string {
    // Conversión simple de HTML a texto plano
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

