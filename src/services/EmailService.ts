import { Resend } from 'resend';

// Initialize Resend with more detailed error logging
const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

// Types
type EmailProps = {
  to: string;
  name: string;
};

type ResetPasswordEmailProps = {
  to: string;
  resetToken: string;
  name: string;
};

type AccountBlockedEmailProps = {
  to: string;
  name: string;
  reason: string;
};

type RequestProcessedEmailProps = {
  to: string;
  name: string;
  requestType: string;
  approved: boolean;
};

export class EmailService {
  /**
   * Send registration confirmation email
   */
  async sendRegistrationEmail({ to, name }: EmailProps) {
    try {
      console.log(`Attempting to send registration email to: ${to}`);
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use the default sender from Resend
        to,
        subject: 'Registration Confirmation - Family Services',
        html: `
          <div>
            <h1>Registration Confirmation</h1>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Family Services. Your account is currently pending approval.</p>
            <p>You will receive another email once your account has been approved.</p>
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Registration email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send registration email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send account approval email
   */
  async sendApprovalEmail({ to, name }: EmailProps) {
    try {
      console.log(`Attempting to send approval email to: ${to}`);
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Account Approved - Family Services',
        html: `
          <div>
            <h1>Account Approved</h1>
            <p>Hello ${name},</p>
            <p>We're pleased to inform you that your Family Services account has been approved!</p>
            <p>You can now log in to access your dashboard and all our services.</p>
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Approval email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send approval email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send account blocked/restricted email
   */
  async sendAccountBlockedEmail({ to, name, reason }: AccountBlockedEmailProps) {
    try {
      console.log(`Attempting to send account blocked email to: ${to}`);
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Account Access Restricted - Family Services',
        html: `
          <div>
            <h1>Account Access Restricted</h1>
            <p>Hello ${name},</p>
            <p>We regret to inform you that your access to Family Services has been restricted due to ${reason}.</p>
            <p>If you believe this is an error or would like to discuss this further, please contact our support team.</p>
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Account blocked email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send account blocked email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send account activated email
   */
  async sendAccountActivatedEmail({ to, name }: EmailProps) {
    try {
      console.log(`Attempting to send account activated email to: ${to}`);
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Account Activated - Family Services',
        html: `
          <div>
            <h1>Account Activated</h1>
            <p>Hello ${name},</p>
            <p>We're pleased to inform you that your Family Services account has been activated!</p>
            <p>You can now log in to access your dashboard and all our services.</p>
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Account activated email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send account activated email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send reset password email
   */
  async sendResetPasswordEmail({ to, resetToken, name }: ResetPasswordEmailProps) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;
    console.log(`Reset password URL: ${resetUrl}`);

    try {
      console.log(`Attempting to send reset password email to: ${to}`);
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: 'Password Reset Request - Family Services',
        html: `
          <div>
            <h1>Password Reset Request</h1>
            <p>Hello ${name},</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="${resetUrl}">Reset Your Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Reset password email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send reset password email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send request processed notification email
   */
  async sendRequestProcessedEmail({ to, name, requestType, approved }: RequestProcessedEmailProps) {
    try {
      console.log(`Attempting to send request processed email to: ${to}`);
      
      const requestTypeFormatted = requestType.replace('_', ' ').toLowerCase();
      
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject: `Request ${approved ? 'Approved' : 'Rejected'} - Family Services`,
        html: `
          <div>
            <h1>Request ${approved ? 'Approved' : 'Rejected'}</h1>
            <p>Hello ${name},</p>
            <p>Your recent request to ${requestTypeFormatted} has been ${approved ? 'approved' : 'rejected'}.</p>
            ${approved 
              ? '<p>The changes have been applied to your account.</p>' 
              : '<p>If you have any questions, please contact our support team.</p>'
            }
            <p>Best regards,<br />Family Services Team</p>
          </div>
        `,
      });
      
      console.log('Request processed email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send request processed email:', error);
      return { success: false, error };
    }
  }
}