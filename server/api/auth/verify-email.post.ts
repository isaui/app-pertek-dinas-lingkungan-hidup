import { createError } from 'h3';
import prisma from "~/lib/prisma";

/**
 * Email verification handler
 * POST /api/auth/verify-email
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token } = body;
    
    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token verifikasi tidak valid'
      });
    }
    
    console.log('【LOG】 Verifying email with token:', token);
    
    // Find the verification token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });
    
    if (!verificationToken) {
      console.log('【ERROR】 Verification token not found:', token);
      throw createError({
        statusCode: 404,
        statusMessage: 'Token verifikasi tidak ditemukan'
      });
    }
    
    // Check if the token is expired
    const now = new Date();
    if (now > verificationToken.expires) {
      console.log('【ERROR】 Verification token expired:', token);
      
      // Find the user by identifier to include email in response
      const user = await prisma.user.findFirst({
        where: { email: verificationToken.identifier }
      });
      
      throw createError({
        statusCode: 410, // Gone - Resource no longer available
        statusMessage: 'Token verifikasi sudah kadaluarsa',
        data: { email: user?.email || '' }
      });
    }
    
    // Get the user by email, since identifier contains email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    });
    
    if (!user) {
      console.log('【ERROR】 User not found for token:', token);
      throw createError({
        statusCode: 404,
        statusMessage: 'Pengguna tidak ditemukan'
      });
    }
    
    // Update user to set email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: true,
      }
    });
    
    console.log('【LOG】 User email verified successfully, user:', user.id);
    
    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });
    
    return { 
      success: true,
      email: user.email,
      message: 'Email berhasil diverifikasi'
    };
    
  } catch (error: any) {
    console.error('【ERROR】 Email verification error:', error);
    throw error;
  }
})
