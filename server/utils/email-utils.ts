import nodemailer from 'nodemailer';

// Interface for email message
interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

// Get environment variables with validation
const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not set!`);
  }
  return value || '';
};

// SMTP config from environment variables
const smtpConfig = {
  host: getEnvVariable('EMAIL_SMTP_HOST', ''),
  port: parseInt(getEnvVariable('EMAIL_SMTP_PORT', '587'), 10),
  secure: getEnvVariable('EMAIL_SMTP_SECURE', 'false').toLowerCase() === 'true',
  auth: {
    user: getEnvVariable('EMAIL_SMTP_USER', ''),
    pass: getEnvVariable('EMAIL_SMTP_PASSWORD', ''),
  },
  tls: {
    rejectUnauthorized: getEnvVariable('EMAIL_SMTP_REJECT_UNAUTHORIZED', 'true').toLowerCase() === 'true',
  },
};

// Default sender email
const defaultFromEmail = getEnvVariable('EMAIL_FROM', 'noreply@dlh-project.com');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport(smtpConfig);
};

/**
 * Send email using SMTP
 * @param {EmailMessage} emailOptions - Email message options
 * @returns {Promise<any>} Send result
 */
export const sendEmail = async (emailOptions: EmailMessage): Promise<any> => {
  try {
    // Validate required fields
    if (!emailOptions.to) {
      throw new Error('Email recipient (to) is required');
    }
    
    if (!emailOptions.subject) {
      throw new Error('Email subject is required');
    }
    
    if (!emailOptions.text && !emailOptions.html) {
      throw new Error('Email must have either text or html content');
    }
    
    // Create a transporter
    const transporter = createTransporter();
    
    // Setup email data
    const mailOptions = {
      from: emailOptions.from || defaultFromEmail,
      to: emailOptions.to,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
      replyTo: emailOptions.replyTo,
      attachments: emailOptions.attachments,
    };
    
    // Send mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a verification email to a user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} verificationLink - Verification link
 * @returns {Promise<any>} Send result
 */
export const sendVerificationEmail = async (
  to: string, 
  name: string, 
  verificationLink: string
): Promise<any> => {
  const subject = 'Verifikasi Email Aplikasi Status Dokumen PERTEK/SLO';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Verifikasi Email Anda</h2>
      <p>Halo ${name},</p>
      <p>Terima kasih telah mendaftar di Aplikasi Status Dokumen PERTEK/SLO. Silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verifikasi Email</a>
      </div>
      <p>Jika Anda tidak mendaftar di Aplikasi Status Dokumen PERTEK/SLO, abaikan email ini.</p>
      <p>Link verifikasi ini akan kadaluarsa dalam 24 jam.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
    </div>
  `;
  
  const text = `
    Verifikasi Email Anda
    
    Halo ${name},
    
    Terima kasih telah mendaftar di Aplikasi Status Dokumen PERTEK/SLO. Silakan verifikasi email Anda dengan mengklik link di bawah ini:
    
    ${verificationLink}
    
    Jika Anda tidak mendaftar di Aplikasi Status Dokumen PERTEK/SLO, abaikan email ini.
    
    Link verifikasi ini akan kadaluarsa dalam 24 jam.
  `;
  
  return sendEmail({
    to,
    subject,
    html,
    text
  });
};

/**
 * Send a password reset email to a user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetLink - Reset password link
 * @returns {Promise<any>} Send result
 */
export const sendPasswordResetEmail = async (
  to: string, 
  name: string, 
  resetLink: string
): Promise<any> => {
  const subject = 'Reset Password Aplikasi Status Dokumen PERTEK/SLO';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Reset Password Anda</h2>
      <p>Halo ${name},</p>
      <p>Kami menerima permintaan untuk mereset password akun Aplikasi Status Dokumen PERTEK/SLO Anda. Klik tombol di bawah ini untuk mereset password Anda:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>Jika Anda tidak meminta reset password, abaikan email ini dan akun Anda akan tetap aman.</p>
      <p>Link reset password ini akan kadaluarsa dalam 1 jam.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
    </div>
  `;
  
  const text = `
    Reset Password Anda
    
    Halo ${name},
    
    Kami menerima permintaan untuk mereset password akun Aplikasi Status Dokumen PERTEK/SLO Anda. Klik link di bawah ini untuk mereset password Anda:
    
    ${resetLink}
    
    Jika Anda tidak meminta reset password, abaikan email ini dan akun Anda akan tetap aman.
    
    Link reset password ini akan kadaluarsa dalam 1 jam.
  `;
  
  return sendEmail({
    to,
    subject,
    html,
    text
  });
};
