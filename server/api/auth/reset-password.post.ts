import { createError } from 'h3';
import prisma from "~/lib/prisma";
import { auth } from '~/lib/auth';

/**
 * Reset password handler
 * POST /api/auth/reset-password
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { token, password } = body;
    
    if (!token || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token dan password baru harus diisi'
      });
    }
    
    // Validate password
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password harus minimal 6 karakter'
      });
    }
    
    console.log('【LOG】 Processing password reset with token');
    
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
      throw createError({
        statusCode: 410,
        statusMessage: 'Token reset password telah kadaluarsa'
      });
    }
    
    // Find user by email (stored in identifier)
    const email = resetToken.identifier;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });
    
    if (!user) {
      console.log('【ERROR】 User not found for email:', email);
      throw createError({
        statusCode: 404,
        statusMessage: 'User tidak ditemukan'
      });
    }
    
    // Find the user's password account
    const passwordAccount = user.accounts.find(account => 
      account.providerId === 'credential'
    );
    
    if (!passwordAccount) {
      console.log('【ERROR】 Password account not found for user');
      throw createError({
        statusCode: 400,
        statusMessage: 'Akun password tidak ditemukan'
      });
    }
    
    // Hash the new password
    const authContext = await auth.$context;
    const hashedPassword = await authContext.password.hash(password);
    
    // Update user's password
    await prisma.account.update({
      where: { id: passwordAccount.id, providerId: 'credential' },
      data: { password: hashedPassword }
    });
    
    console.log('【LOG】 Password updated successfully');
    
    // Delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { identifier: email }
    });
    
    console.log('【LOG】 Reset tokens deleted');
    
    // Return success
    return {
      statusCode: 200,
      statusMessage: 'Password berhasil diubah',
      data: {
        email
      }
    };
  } catch (error) {
    console.error('【ERROR】 Password reset failed:', error);
    throw error;
  }
});
