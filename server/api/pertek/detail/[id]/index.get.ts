// server/api/pertek/detail/[id].get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    // Convert headers
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    // Get session
    const session = await auth.api.getSession({
      headers: headers
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Get user (no admin check required for user endpoints)
    const user = await prisma.user.findFirst({
      where: { id: session.user.id }
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - User not found'
      })
    }
    
    // Get PERTEK ID from route params
    const pertekId = getRouterParam(event, 'id')
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
      })
    }
    
    // Get PERTEK detail with ownership validation and all relations
    const pertek = await prisma.pertek.findFirst({
      where: { 
        id: pertekId,
        userId: session.user.id // Validate ownership - user can only access their own PERTEK
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            instansi: true,
            nomorHp: true
          }
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          },
          select: {
            id: true,
            type: true,
            filename: true,
            fileUrl: true,
            size: true,
            mimeType: true,
            description: true,
            uploadedAt: true,
            expired: true // Include expired field for user interface
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
        },
        requirementFeedback: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            document: {
              select: {
                id: true,
                filename: true,
                type: true,
                fileUrl: true,
                expired: true
              }
            },
            statusHistory: {
              select: {
                id: true,
                status: true,
                createdAt: true
              }
            }
          }
        }
      }
    })
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found or you do not have permission to access it'
      })
    }
    
    return {
      success: true,
      data: pertek
    }
    
  } catch (error: any) {
    console.error('Error fetching PERTEK detail for user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil detail PERTEK'
    })
  }
})