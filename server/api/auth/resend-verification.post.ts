import { createError } from 'h3';
import prisma from "~/lib/prisma";
import { dbEmailQueue } from "../../utils/db-queue-utils";

/**
 * Generate a verification token for a user
 */
const generateVerificationToken = async (userId: string, email: string) => {
  // Create a random token
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  
  // Set expiration to 24 hours from now
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  
  // Store token in database
  await prisma.verificationToken.create({
    data: {
      identifier: userId,
      token,
      expires
    }
  });

  // Create a verification URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/akun/verify?token=${token}`;
  
  return verificationUrl;
};

/**
 * Resend verification email handler
 * POST /api/auth/resend-verification
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
    
    console.log('【LOG】 Resending verification email for:', email);
    
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
    
    // Check if email already verified
    if (user.emailVerified) {
      console.log('【ERROR】 Email already verified:', email);
      throw createError({
        statusCode: 400,
        statusMessage: 'Email sudah terverifikasi'
      });
    }
    
    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.id }
    });
    
    // Generate a new verification token
    const verificationToken = await generateVerificationToken(user.id, email);
    console.log('【LOG】 New verification token generated');
    
    // Queue verification email
    await dbEmailQueue.add('verification-email', {
      to: email,
      name: user.name || '',
      verificationLink: verificationToken
    });
    
    console.log('【LOG】 Verification email queued successfully');
    
    return { 
      success: true,
      message: 'Email verifikasi telah dikirim ulang'
    };
    
  } catch (error: any) {
    console.error('【ERROR】 Resend verification email error:', error);
    throw error;
  }
})
