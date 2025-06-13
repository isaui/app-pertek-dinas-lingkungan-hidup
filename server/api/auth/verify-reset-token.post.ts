import { createError } from 'h3';
import prisma from "~/lib/prisma";

/**
 * Verify password reset token handler
 * POST /api/auth/verify-reset-token
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token } = body;
    
    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token tidak boleh kosong'
      });
    }
    
    console.log('【LOG】 Verifying reset token:', token);
    
    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });
    
    if (!resetToken) {
      console.log('【ERROR】 Reset token not found');
      throw createError({
        statusCode: 404,
        statusMessage: 'Token reset password tidak valid'
      });
    }
    
    // Check if token has expired
    const now = new Date();
    if (resetToken.expires < now) {
      console.log('【ERROR】 Reset token expired');
      
      // Get user email from the identifier
      const email = resetToken.identifier;
      
      throw createError({
        statusCode: 410, // Gone
        statusMessage: 'Token reset password telah kadaluarsa',
        data: {
          expired: true,
          email
        }
      });
    }
    
    // Token is valid
    console.log('【LOG】 Reset token is valid');
    
    // Return success with the email (identifier)
    return {
      statusCode: 200,
      statusMessage: 'Token valid',
      data: {
        email: resetToken.identifier
      }
    };
  } catch (error) {
    console.error('【ERROR】 Reset token verification failed:', error);
    throw error;
  }
});
