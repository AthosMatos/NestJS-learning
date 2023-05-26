import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  Transporter,
} from 'nodemailer';

@Injectable()
export class NodeMailerService implements OnModuleInit {
  private transporter: Transporter;

  async onModuleInit() {
    try {
      console.log('Creating NodeMailer');
      const testAccount = await createTestAccount();

      this.transporter = createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.log('Error creating NodeMailer:', error);
    }
  }

  async sendEmail(
    from: string,
    to: string,
    subject: string,
    text: string,
  ): Promise<string> {
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
      });

      console.log('Email sent:', info.messageId);
      console.log('Preview URL:', getTestMessageUrl(info));

      return info.messageId;
    } catch (error) {
      console.log('Error sending email:', error);
      return null;
    }
  }
}
