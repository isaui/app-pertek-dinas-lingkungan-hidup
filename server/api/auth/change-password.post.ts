// server/api/change-password.post.ts (Smart approach)
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const { newPassword } = await readBody(event)
  
  try {
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
        statusMessage: 'Unauthorized'
      })
    }
    
    // Validation
    if (!newPassword || newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password minimal 6 karakter'
      })
    }
    
    // 🧠 SMART: Set password jadi null dulu
    await prisma.account.updateMany({
      where: {
        userId: session.user.id,
        providerId: "credential"
      },
      data: {
        password: null
      }
    })
    
    // ✅ Sekarang setPassword bakal work karena "ga ada password"
    await auth.api.setPassword({
      body: { newPassword },
      headers: headers
    })
    
    return {
      success: true,
      message: 'Password berhasil diubah'
    }
    
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message || 'Gagal mengubah password'
    })
  }
})