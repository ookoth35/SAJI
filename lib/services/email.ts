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
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to SAJI",
      html,
    });

    console.log("[v0] Welcome email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending welcome email:", error);
    return false;
  }
}

// Send login notification email with device & location
export async function sendLoginNotificationEmail(
  email: string,
  firstName: string,
  deviceName: string,
  location: string,
  timestamp: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Login Detected</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        <p>We detected a new login to your SAJI account. Here are the details:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 10px 0;"><strong>Device:</strong> ${deviceName}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 10px 0;"><strong>Date & Time:</strong> ${timestamp}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #856404;"><strong>If this wasn't you,</strong> please change your password immediately by clicking the link below.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://app.saji.com/auth/forgot-password" style="background-color: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Secure Your Account
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          For security, we never ask for your password via email. If you received a suspicious email claiming to be from SAJI, please report it.
        </p>
        
        <p>Best regards,<br/><strong>SAJI Security Team</strong></p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "New Login to Your SAJI Account",
      html,
    });

    console.log("[v0] Login notification email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending login notification:", error);
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

    console.log("[v0] Booking confirmation email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending booking confirmation:", error);
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

    console.log("[v0] Payment confirmation email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending payment confirmation:", error);
    return false;
  }
}

// Send email verification email
export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  firstName: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a></p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        
        <p>If you didn't sign up for this account, you can ignore this email.</p>
        <p>Best regards,<br/>SAJI Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email Address - SAJI",
      html,
    });

    console.log("[v0] Verification email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending verification email:", error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  firstName: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #ff6b6b 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${resetLink}" style="color: #ff9800;">${resetLink}</a></p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #856404;"><strong>Important:</strong> This link will expire in 1 hour for security purposes.</p>
        </div>
        
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email. Your account remains secure.</p>
        
        <p>Best regards,<br/>SAJI Security Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset Your SAJI Password",
      html,
    });

    console.log("[v0] Password reset email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending password reset email:", error);
    return false;
  }
}

// Send password reset code via SMS
export async function sendPasswordResetCodeSMS(
  phone: string,
  code: string
): Promise<boolean> {
  try {
    // Resend SMS API
    const result = await resend.sms.send({
      from: "SAJI",
      to: phone,
      text: `Your SAJI password reset code is: ${code}. This code expires in 10 minutes. Never share this code with anyone.`,
    });

    console.log("[v0] Password reset SMS sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending password reset SMS:", error);
    return false;
  }
}

