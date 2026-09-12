import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Resend } from 'resend';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly frontUrl = process.env.FRONTEND_UR;

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

  async sendProjectInviteEmail(to: string, project: Project) {
    const { data, error } = await this.resend.emails.send({
      from: 'FlowBoard <onboarding@resend.dev>',
      to,
      subject: `FlowBoard - You've been invited to ${project.title}`,
      html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 10px 24px;
          color: #18181b;
        "
      >
        <h2 style="margin-bottom: 8px;">
          You've been invited to a project 🎉
        </h2>

        <p style="color: #52525b; margin-top: 0;">
          You have been invited to join a project on FlowBoard.
        </p>

        <div
          style="
            margin: 24px 0;
            padding: 20px;
            background: #f4f4f5;
            border-radius: 10px;
          "
        >
          <h3 style="margin: 0 0 10px;">
            ${project.title}
          </h3>

          ${
            project.description
              ? `
                <p
                  style="
                    margin: 0;
                    color: #52525b;
                    line-height: 1.6;
                  "
                >
                  ${project.description}
                </p>
              `
              : ''
          }
        </div>

        <p style="color: #52525b;">
          You've been added as a member of this project. 
          Open FlowBoard to view the project and start collaborating with your team.
        </p>

        <div style="margin: 28px 0;">
          <a
            href="${this.frontUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #18181b;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Open FlowBoard
          </a>
        </div>

        <p
          style="
            margin-top: 32px;
            color: #71717a;
            font-size: 13px;
          "
        >
          — FlowBoard Team
        </p>
      </div>
    `,
    });

    if (error) {
      throw new ServiceUnavailableException(
        'Unable to send the project invitation email. Please try again later.',
      );
    }

    return data;
  }

  async sendTaskAssignmentEmail(to: string, task: Task) {
    const { data, error } = await this.resend.emails.send({
      from: 'FlowBoard <onboarding@resend.dev>',
      to,
      subject: `FlowBoard - You've been assigned a task`,
      html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 24px;
          color: #18181b;
        "
      >
        <h2 style="margin-bottom: 8px;">
          You've been assigned a task 📋
        </h2>

        <p style="color: #52525b;">
          A task has been assigned to you on FlowBoard.
        </p>

        <div
          style="
            margin: 24px 0;
            padding: 20px;
            background: #f4f4f5;
            border-radius: 10px;
          "
        >
          <h3 style="margin: 0 0 10px;">
            ${task.title}
          </h3>

          ${
            task.description
              ? `
                <p
                  style="
                    margin: 0;
                    color: #52525b;
                    line-height: 1.6;
                  "
                >
                  ${task.description}
                </p>
              `
              : ''
          }
        </div>

        <p style="color: #52525b;">
          You can open FlowBoard to view the task and start working on it.
        </p>

        <div style="margin: 28px 0;">
          <a
            href="${process.env.FRONTEND_URL}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #18181b;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Open FlowBoard
          </a>
        </div>

        <p
          style="
            margin-top: 32px;
            color: #71717a;
            font-size: 13px;
          "
        >
          — FlowBoard Team
        </p>
      </div>
    `,
    });

    if (error) {
      console.error('Resend API Error:', error);

      throw new ServiceUnavailableException(
        'Unable to send the task assignment email. Please try again later.',
      );
    }

    return data;
  }
}
