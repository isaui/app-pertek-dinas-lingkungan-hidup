// server/api/me.get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    // Convert headers yang bener
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    // Convert dari Nuxt headers ke Web API Headers
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    // Get session dari Better Auth
    const session = await auth.api.getSession({
      headers: headers
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    // Get full user data dari database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        role: true,
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return { 
      success: true,
      user 
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
})