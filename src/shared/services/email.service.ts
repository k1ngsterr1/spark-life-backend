import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly email: string;
  private readonly password: string;

  constructor(private configService: ConfigService) {
    const EMAIL_USER = this.configService.get<string>('EMAIL_USER');
    const EMAIL_PASS = this.configService.get<string>('EMAIL_PASS');
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error('EMAIL OR PASSWORD IS NOT SET IN EMAIL SERVICE');
    }
    this.email = EMAIL_USER;
    this.password = EMAIL_PASS;
  }

  async sendChangePasswordEmail(link: string, lang: 'en' | 'ru' | 'kz') {
    const emailTemplate = this.getEmailTemplate(link, lang);

    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'pkz66.hoster.kz',
      port: 465,
      secure: true,
      auth: {
        user: this.email,
        pass: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.email,
      to: this.email, // тут можно поставить реальный получатель
      subject: this.getSubject(lang),
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
  }

  private getSubject(lang: string): string {
    switch (lang) {
      case 'ru':
        return 'Сброс пароля Spark Health';
      case 'kz':
        return 'Spark Health құпия сөзді қалпына келтіру';
      default:
        return 'Reset Your Spark Health Password';
    }
  }

  private getEmailTemplate(link: string, lang: string): string {
    const translations = {
      en: {
        title: 'Reset Your Password',
        greeting: 'Hello,',
        instruction:
          'We received a request to reset your password for your Spark Health account. Enter the verification code below to reset your password:',
        codeInstruction: 'Your verification code is:',
        codeExpire: 'This code will expire in 15 minutes.',
        notRequested:
          'If you didn’t request a password reset, you can safely ignore this email.',
        support: 'If you’re having trouble, contact our support team at',
        regards: 'Best regards, The Spark Health Team',
        button: 'Reset Password',
      },
      ru: {
        title: 'Сброс пароля',
        greeting: 'Здравствуйте,',
        instruction:
          'Мы получили запрос на сброс пароля для вашей учетной записи Spark Health. Введите код подтверждения ниже, чтобы сбросить пароль:',
        codeInstruction: 'Ваш код подтверждения:',
        codeExpire: 'Этот код действителен в течение 15 минут.',
        notRequested:
          'Если вы не запрашивали сброс пароля, проигнорируйте это письмо.',
        support:
          'Если возникли проблемы, обратитесь в нашу службу поддержки по адресу',
        regards: 'С уважением, команда Spark Health',
        button: 'Сбросить пароль',
      },
      kz: {
        title: 'Құпия сөзді қалпына келтіру',
        greeting: 'Сәлеметсіз бе,',
        instruction:
          'Біз Spark Health тіркелгісіне құпия сөзді қалпына келтіру сұрауын алдық. Құпия сөзді қалпына келтіру үшін төмендегі кодты енгізіңіз:',
        codeInstruction: 'Сіздің растау кодыңыз:',
        codeExpire: 'Бұл код 15 минут ішінде жарамды.',
        notRequested:
          'Егер сіз құпия сөзді қалпына келтіруді сұрамаған болсаңыз, бұл электрондық поштаны елемеңіз.',
        support: 'Қиындықтар туындаса, біздің қолдау қызметіне хабарласыңыз',
        regards: 'Құрметпен, Spark Health командасы',
        button: 'Құпия сөзді қалпына келтіру',
      },
    };

    const t = translations[lang] || translations.en;

    return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title} - Spark Health</title>
      <style>
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f8fa; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
        .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); border-radius: 8px 8px 0 0; }
        .header img { max-width: 150px; height: auto; }
        .content { padding: 30px; color: #333333; }
        .code-container { margin: 30px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center; }
        .verification-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284c7; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; margin: 20px 0; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; background-color: #f8fafc; border-radius: 0 0 8px 8px; }
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; padding: 10px !important; }
          .content { padding: 20px !important; }
          .verification-code { font-size: 24px !important; }
        }
      </style>
    </head>
    <body>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f8fa">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table class="container" width="600" border="0" cellspacing="0" cellpadding="0">
              <tr><td class="header">
                <img src="https://example.com/spark-health-logo.png" alt="Spark Health">
              </td></tr>
              <tr><td class="content">
                <h1 style="color: #0284c7; margin-top: 0;">${t.title}</h1>
                <p>${t.greeting}</p>
                <p>${t.instruction}</p>
                <div class="code-container">
                  <p style="margin: 0; color: #64748b;">${t.codeInstruction}</p>
                  <div class="verification-code">123456</div>
                  <p style="margin: 0; color: #64748b;">${t.codeExpire}</p>
                </div>
                <p>${t.notRequested}</p>
                <div style="text-align: center;">
                  <a href="${link}" class="button">${t.button}</a>
                </div>
                <p style="margin-top: 30px;">${t.support} <a href="mailto:support@sparkhealth.com" style="color: #0284c7;">support@sparkhealth.com</a>.</p>
                <p>${t.regards}</p>
              </td></tr>
              <tr><td class="footer">
                <p>© 2025 Spark Health. All rights reserved.</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }
}
