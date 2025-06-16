// server/api/slo/list.get.ts
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
    
    // Parse query parameters
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const type = query.type as string || undefined
    const status = query.status as string || undefined
    const sort = query.sort as string || 'created_desc'
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      userId: session.user.id,
    }
    
    // Add optional filters
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    }
    
    // Build orderBy clause based on sort parameter
    let orderBy: any = { createdAt: 'desc' } // Default fallback
    
    switch (sort) {
      case 'created_desc':
        orderBy = { createdAt: 'desc' }
        break
      case 'created_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'updated_desc':
        orderBy = { updatedAt: 'desc' }
        break
      case 'updated_asc':
        orderBy = { updatedAt: 'asc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }
    
    // Get total count for pagination
    const totalCount = await prisma.sLO.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    
    // Get SLO items with relations
    const slo = await prisma.sLO.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        documents: {
          select: {
            id: true,
            type: true,
            filename: true,
            fileUrl: true,
            uploadedAt: true
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Ambil status terbaru saja
        },
        requirementFeedback: {
          where: {
            isResolved: false // Hanya feedback yang belum diselesaikan
          },
          select: {
            id: true,
            requirementType: true,
            feedbackText: true,
            createdAt: true
          }
        }
      }
    })
    
    return { 
      success: true,
      data: slo,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: totalCount
      },
      filters: {
        status,
        type,
        sort
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching SLO list:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil daftar SLO'
    })
  }
})