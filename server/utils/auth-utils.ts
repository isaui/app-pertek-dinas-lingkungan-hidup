import { PrismaClient } from '@prisma/client'
import { H3Event } from 'h3'

const prisma = new PrismaClient()

// Regex validasi email
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Memvalidasi bahwa field login yang diperlukan sudah ada
 */
export function validateLoginInputs(identifier: string | undefined, password: string | undefined): void {
  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email atau username diperlukan'
    })
  }
  
  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi diperlukan'
    })
  }
}

/**
 * Mengubah identifier (email atau username) menjadi alamat email
 */
export async function resolveEmailFromIdentifier(identifier: string): Promise<string> {
  // Cek apakah identifier adalah email menggunakan regex
  const isEmail = emailRegex.test(identifier)
  
  try {
    // Jika bukan email, coba cari user berdasarkan username
    if (!isEmail) {
      return await getUserEmailByUsername(identifier)
    } else {
      // Verifikasi email ada dalam sistem
      await verifyEmailExists(identifier)
      return identifier
    }
  } catch (error) {
    // Lempar kembali error untuk ditangani oleh handler utama
    throw error
  }
}

/**
 * Mencari user berdasarkan username dan mengembalikan email mereka
 */
export async function getUserEmailByUsername(username: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Username tidak ditemukan'
      })
    }
    
    return user.email
  } catch (dbError) {
    if ((dbError as any).statusCode) {
      throw dbError
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Kesalahan database saat login'
    })
  }
}

/**
 * Memverifikasi bahwa email ada dalam database
 */
export async function verifyEmailExists(email: string): Promise<void> {
  try {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!emailExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Email tidak terdaftar'
      })
    }
  } catch (dbError) {
    if ((dbError as any).statusCode) {
      throw dbError
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Kesalahan database saat login'
    })
  }
}

/**
 * Mempersiapkan headers untuk request autentikasi
 */
export function prepareHeaders(event: H3Event): Headers {
  const headers = new Headers()
  const eventHeaders = getHeaders(event)
  
  Object.entries(eventHeaders).forEach(([key, value]) => {
    if (value) headers.set(key, value)
  })
  
  return headers
}
