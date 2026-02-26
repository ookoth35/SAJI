import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send welcome email
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to SAJI!</h1>
        <p>Hi ${firstName},</p>
        <p>Thank you for joining our platform. We're excited to have you onboard.</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Exploring available services</li>
          <li>Booking your first appointment</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // Update this with your verified domain
      to: email,
      subject,
      html,
    });

    console.log("Welcome email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

// Send booking confirmation
export async function sendBookingConfirmation(
  email: string,
  bookingCode: string,
  professionalName: string,
  bookingDate: string,
  amount: number
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Confirmed!</h1>
        <p>Your booking has been confirmed.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Booking Code:</strong> ${bookingCode}</p>
          <p><strong>Professional:</strong> ${professionalName}</p>
          <p><strong>Date & Time:</strong> ${bookingDate}</p>
          <p><strong>Amount:</strong> KES ${amount}</p>
        </div>
        <p>You will receive a reminder email 24 hours before your appointment.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Booking Confirmed - ${bookingCode}`,
      html,
    });

    console.log("Booking confirmation email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return false;
  }
}

// Send payment confirmation
export async function sendPaymentConfirmation(
  email: string,
  transactionId: string,
  amount: number,
  method: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Confirmed</h1>
        <p>Your payment has been processed successfully.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount:</strong> KES ${amount}</p>
          <p><strong>Payment Method:</strong> ${method}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Thank you for your payment. Your booking is now secured.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Payment Received - ${transactionId}`,
      html,
    });

    console.log("Payment confirmation email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("Error sending payment confirmation:", error);
    return false;
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  verificationLink: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify Your Email</h1>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If you didn't sign up for this account, you can ignore this email.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email Address",
      html,
    });

    console.log("Verification email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset Your SAJI Password",
      html,
    });

    console.log("Password reset email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
