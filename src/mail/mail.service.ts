import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    const host = this.configService.get<string>('mail.host');
    const user = this.configService.get<string>('mail.user');
    const password = this.configService.get<string>('mail.password');
    const from = this.configService.get<string>('mail.from');

    const port = this.configService.get<number>('mail.port') || 587;

    if (!host || !user || !password || !from) {
      throw new ServiceUnavailableException(
        'Email configuration is missing',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
    });

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return {
      message: 'Email sent successfully',
      messageId: result.messageId,
    };
  }
}