import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const provider = this.config.get('EMAIL_PROVIDER');

    if (provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),
        port: parseInt(this.config.get('SMTP_PORT') || '587', 10),
        secure: false,
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASSWORD'),
        },
      });
    } else {
      // For development: use ethereal email (test account)
      console.warn('No email provider configured, using console logging for emails');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const emailFrom = this.config.get('EMAIL_FROM') || 'noreply@pttracker.com';

    if (!this.transporter) {
      console.log('=== EMAIL (Console Mode) ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text || options.html}`);
      console.log('============================');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/magic?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Your Magic Link for PT Tracker',
      html: `
        <h1>PT Tracker - Magic Link</h1>
        <p>Click the link below to sign in to your account:</p>
        <p><a href="${magicLink}">${magicLink}</a></p>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Sign in to PT Tracker: ${magicLink}\n\nThis link expires in 15 minutes.`,
    });
  }
}
