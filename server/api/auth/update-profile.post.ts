// server/api/update-profile.post.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const { name, username, instansi, nomorHp } = await readBody(event)
  
  try {
    // Get current session
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    const session = await auth.api.getSession({
      headers: headers
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Tolong login terlebih dahulu'
      })
    }
    
    // Validation
    if (!name?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nama lengkap diperlukan'
      })
    }
    
    if (!username?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username diperlukan'
      })
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username hanya boleh mengandung huruf, angka, dan garis bawah'
      })
    }
    
    if (username.length < 3) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username harus minimal 3 karakter'
      })
    }
    
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        NOT: {
          id: session.user.id
        }
      }
    })
    
    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username sudah digunakan oleh pengguna lain'
      })
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: name.trim(),
        username: username.trim(),
        instansi: instansi?.trim() || null,
        nomorHp: nomorHp?.trim() || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        instansi: true,
        nomorHp: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return {
      success: true,
      message: 'Profil berhasil diperbarui',
      user: updatedUser
    }
    
  } catch (error: any) {
    console.error('Update profile error:', error)
    
    // Handle specific errors
    if (error.statusCode) {
      throw error
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username sudah digunakan'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat memperbarui profil'
    })
  }
})