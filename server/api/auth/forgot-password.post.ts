import { createError } from 'h3';
import prisma from "~/lib/prisma";
import { dbEmailQueue } from "../../utils/db-queue-utils";

/**
 * Generate a password reset token for a user
 */
const generatePasswordResetToken = async (email: string) => {
  // Create a random token
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  
  // Set expiration to 1 hour from now
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  // Store token in database
  await prisma.passwordResetToken.create({
    data: {
      identifier: email, // Store email as identifier
      token,
      expires
    }
  });

  // Create a reset password URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/akun/reset-password?token=${token}`;
  
  return resetUrl;
};

/**
 * Forgot password handler
 * POST /api/auth/forgot-password
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email } = body;
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email tidak boleh kosong'
      });
    }
    
    console.log('【LOG】 Processing password reset request for:', email);
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('【ERROR】 User not found for email:', email);
      throw createError({
        statusCode: 404,
        statusMessage: 'Akun dengan email tersebut tidak ditemukan'
      });
    }
    
    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { identifier: email }
    });
    
    // Generate a new reset token
    const resetToken = await generatePasswordResetToken(email);
    console.log('【LOG】 New password reset token generated');
    
    // Queue password reset email
    await dbEmailQueue.add('password-reset-email', {
      to: email,
      name: user.name || '',
      resetLink: resetToken
    });
    
    console.log('【LOG】 Password reset email queued successfully');
    
    return {
      statusCode: 200,
      statusMessage: 'Email reset password telah dikirim',
      data: {
        email
      }
    };
  } catch (error) {
    console.error('【ERROR】 Password reset request failed:', error);
    throw error;
  }
});
