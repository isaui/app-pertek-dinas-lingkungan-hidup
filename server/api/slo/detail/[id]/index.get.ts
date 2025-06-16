// server/api/slo/detail/[id]/index.get.ts
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
    
    // Get SLO ID from route params
    const sloId = getRouterParam(event, 'id')
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Get SLO detail with ownership validation and all relations
    const slo = await prisma.sLO.findFirst({
      where: { 
        id: sloId,
        userId: session.user.id // Validate ownership - user can only access their own SLO
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
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found or you do not have permission to access it'
      })
    }
    
    return {
      success: true,
      data: slo
    }
    
  } catch (error: any) {
    console.error('Error fetching SLO detail for user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil detail SLO'
    })
  }
})