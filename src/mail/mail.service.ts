import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  async sendOtpWithEmail(to: string, otp: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'FlowBoard <onboarding@resend.dev>',
      to,
      subject: 'FlowBoard - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Reset your FlowBoard password 🔐</h2>

          <p>
            We received a request to reset your FlowBoard password.
          </p>

          <p>Your verification code is:</p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 16px;
              text-align: center;
              background: #f4f4f5;
              border-radius: 8px;
            "
          >
            ${otp}
          </div>

          <p>This code will expire in 10 minutes.</p>

          <p>
            If you didn't request a password reset, you can safely ignore this email.
          </p>

          <p>— FlowBoard Team</p>
        </div>
      `,
    });

    if (error) {
      throw new ServiceUnavailableException(
        'Unable to send the verification email. Please try again later.',
      );
    }

    return data;
  }
}
