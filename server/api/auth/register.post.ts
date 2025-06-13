// server/api/auth/register.post.ts

import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { emailRegex } from "../../utils/auth-utils"
import { dbEmailQueue } from "../../utils/db-queue-utils"

/**
 * Register handler for creating new user accounts
 */
export default defineEventHandler(async (event) => {
  console.log('【LOG】 Register API started')
  
  try {
    // Extract request body
    const body = await readBody(event)
    const { email, password, name, username, instansi, nomorHp } = body
    
    console.log('【LOG】 Register body received:', { 
      email: email ? '✓ (provided)' : '✗ (missing)', 
      name: name ? '✓ (provided)' : '✗ (missing)',
      username: username ? '✓ (provided)' : '✗ (missing)',
      password: password ? '✓ (provided)' : '✗ (missing)', 
      instansi: instansi ? '✓ (provided)' : '✗ (missing)', 
      nomorHp: nomorHp ? '✓ (provided)' : '✗ (missing)'
    })
    
    // Validate all required inputs
    validateRegisterInputs(email, password, name, username)
    console.log('【LOG】 Input validation passed')
    
    // Check if email or username already exists
    await checkUserAvailability(email, username)
    console.log('【LOG】 Email and username availability check passed')
    
    // Register user via Better Auth
    console.log('【LOG】 Attempting to register with auth service')
    const result = await registerWithAuth(email, password, name)
    console.log('【LOG】 Auth registration successful, user ID:', result?.user?.id)
    
    // Update custom fields in user profile
    console.log('【LOG】 Updating user profile with custom fields')
    await updateUserProfile(result.user.id, { username, instansi, nomorHp })
    console.log('【LOG】 User profile updated successfully')
    
    // Generate and store verification token
    console.log('【LOG】 Generating verification token')
    const verificationToken = await generateVerificationToken(result.user.id, email)
    console.log('【LOG】 Verification token generated')
    
    // Queue verification email using database queue
    console.log('【LOG】 Queuing verification email for:', email)
    try {
      await dbEmailQueue.add('verification-email', {
        to: email,
        name,
        verificationLink: verificationToken
      });
      console.log('【LOG】 Verification email queued successfully in database')
    } catch (emailError: any) {
      // Log email error but don't fail registration
      console.error('【ERROR】 Failed to queue verification email:', {
        error: emailError.message,
        userId: result.user.id,
        email
      })
      // We won't throw an error here to allow registration to complete
      // User can request verification email resend later
    }
    
    return { 
      success: true,
      message: 'Registrasi berhasil. Silakan periksa email Anda untuk verifikasi.'
    }
  } catch (error: any) {
    // Enhanced error logging
    console.error('【ERROR】 Registration failed:', { 
      message: error.message || 'Unknown error',
      statusCode: error.statusCode, 
      statusMessage: error.statusMessage,
      stack: error.stack
    })
    
    // Pass through error message from previous error handling
    throw error.statusMessage ? error : createError({
      statusCode: 400,
      statusMessage: error.message || 'Registrasi gagal'
    })
  }
})

/**
 * Validates that all required registration fields are present and properly formatted
 */
function validateRegisterInputs(
  email: string | undefined, 
  password: string | undefined, 
  name: string | undefined,
  username: string | undefined
): void {
  console.log('【LOG】 Validating registration inputs')
  
  // Check if all required fields are present
  if (!email) {
    console.log('【ERROR】 Validation failed: Email tidak ada')
    throw createError({
      statusCode: 400,
      statusMessage: 'Email diperlukan'
    })
  }
  
  if (!password) {
    console.log('【ERROR】 Validation failed: Kata sandi tidak ada')
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi diperlukan'
    })
  }
  
  if (!name) {
    console.log('【ERROR】 Validation failed: Nama tidak ada')
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama diperlukan'
    })
  }
  
  if (!username) {
    console.log('【ERROR】 Validation failed: Username tidak ada')
    throw createError({
      statusCode: 400,
      statusMessage: 'Username diperlukan'
    })
  }
  
  // Validate email format
  if (!emailRegex.test(email)) {
    console.log('【ERROR】 Validation failed: Format email tidak valid:', email)
    throw createError({
      statusCode: 400,
      statusMessage: 'Format email tidak valid'
    })
  }
  
  // Validate password length
  if (password.length < 6) {
    console.log('【ERROR】 Validation failed: Kata sandi terlalu pendek')
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi harus minimal 6 karakter'
    })
  }
  
  // Validate username length and format
  if (username.length < 3) {
    console.log('【ERROR】 Validation failed: Username terlalu pendek:', username)
    throw createError({
      statusCode: 400,
      statusMessage: 'Username harus minimal 3 karakter'
    })
  }
  
  // Username only allows alphanumeric and underscore
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    console.log('【ERROR】 Validation failed: Username mengandung karakter tidak valid:', username)
    throw createError({
      statusCode: 400,
      statusMessage: 'Username hanya boleh mengandung huruf, angka, dan garis bawah'
    })
  }
  
  console.log('【LOG】 All input validations passed')
}

/**
 * Checks if email or username is already in use
 */
async function checkUserAvailability(email: string, username: string): Promise<void> {
  console.log('【LOG】 Checking user availability for:', { email, username })
  try {
    console.log('【LOG】 Querying database for existing user')
    // First check for username availability (regardless of verification status)
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    
    if (existingUsername) {
      console.log('【ERROR】 Username already in use:', username)
      throw createError({
        statusCode: 400,
        statusMessage: 'Username sudah digunakan'
      })
    }
    
    // Then check for email, including verification status
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingEmail) {
      // Check if the email is verified
      if (existingEmail.emailVerified) {
        console.log('【ERROR】 Email already registered and verified:', email)
        throw createError({
          statusCode: 400,
          statusMessage: 'Email sudah terdaftar dan terverifikasi'
        })
      } else {
        // Email exists but not verified - special case
        console.log('【ERROR】 Email registered but not verified:', email)
        throw createError({
          statusCode: 409, // Conflict - special status code for unverified email
          statusMessage: 'Email sudah terdaftar tapi belum diverifikasi',
          data: { 
            email,
            unverifiedEmail: true 
          }
        })
      }
    }
    
    console.log('【LOG】 User availability check passed - email and username are available')
  } catch (error: any) {
    // Re-throw if it's already a handled error
    if (error.statusCode) {
      console.log('【ERROR】 Re-throwing handled error:', error.statusMessage)
      throw error
    }
    
    console.error('【ERROR】 Database error during availability check:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Kesalahan database saat memeriksa ketersediaan akun'
    })
  }
}

/**
 * Register user with auth service
 */
async function registerWithAuth(
  email: string, 
  password: string, 
  name: string
): Promise<any> {
  console.log('【LOG】 Registering user with auth service:', { email, name })
  try {
    console.log('【LOG】 Calling auth.api.signUpEmail')
    const result = await auth.api.signUpEmail({
      body: { email, password, name }
    })
    console.log('【LOG】 Auth registration successful:', { 
      success: !!result, 
      userId: result?.user?.id ? result.user.id : 'No user ID returned'
    })
    return result
  } catch (error: any) {
    console.error('【ERROR】 Auth registration failed:', { 
      message: error.message, 
      name: error.name,
      stack: error.stack?.split('\n')[0] || 'No stack trace'
    })
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Gagal melakukan registrasi'
    })
  }
}

/**
 * Creates a verification token for email verification
 */
async function generateVerificationToken(userId: string, email: string): Promise<string> {
  console.log('【LOG】 Creating verification token for user:', userId)
  try {
    // Generate a random token
    const token = crypto.randomUUID()
    
    // Compute expiration time (24 hours from now)
    const expires = new Date()
    expires.setHours(expires.getHours() + 24)
    
    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      }
    })
    
    // Create verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const verificationLink = `${frontendUrl}/akun/verify?token=${token}`
    
    console.log('【LOG】 Verification token created successfully')
    return verificationLink
  } catch (error: any) {
    console.error('【ERROR】 Failed to create verification token:', { 
      userId, 
      error: error.message 
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal membuat token verifikasi'
    })
  }
}

/**
 * Updates additional user profile fields
 */
async function updateUserProfile(
  userId: string, 
  profileData: { username: string, instansi?: string, nomorHp?: string }
): Promise<void> {
  console.log('【LOG】 Updating user profile:', { userId, profileData })
  try {
    console.log('【LOG】 Executing Prisma update')
    const result = await prisma.user.update({
      where: { id: userId },
      data: profileData
    })
    console.log('【LOG】 Profile update successful:', {
      userId: result.id,
      username: result.username,
      updatedAt: result.updatedAt
    })
  } catch (error: any) {
    console.error('【ERROR】 Failed to update user profile:', { 
      userId, 
      error: error.message, 
      code: error.code,
      meta: error.meta
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal memperbarui profil pengguna'
    })
  }
}