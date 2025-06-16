// server/api/slo/admin/list.get.ts
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

    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id
      }
    })
    if(!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    // Check if user has administrator role
    if (user.role !== 'administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Administrator access required'
      })
    }
    
    // Parse query parameters
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const type = query.type as string || undefined
    const status = query.status as string || undefined
    const sort = query.sort as string || 'created_desc'
    const search = query.search as string || undefined // Optional search parameter
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit
    
    // Build where clause - NO userId filter for admin
    const where: any = {}
    
    // Add optional filters
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    }
    
    // Add search functionality (optional)
    if (search) {
      where.OR = [
        {
          company: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          address: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          sloNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
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
      case 'company_asc':
        orderBy = { company: 'asc' }
        break
      case 'company_desc':
        orderBy = { company: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }
    
    // Get total count for pagination
    const totalCount = await prisma.sLO.count({ where })
    const totalPages = Math.ceil(totalCount / limit)
    
    // Get SLO items with relations including user info
    const slo = await prisma.sLO.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { // Include user information for admin view
          select: {
            id: true,
            name: true,
            email: true,
            instansi: true
          }
        },
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
          take: 5 // Ambil beberapa history untuk admin
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
    
    // Calculate additional statistics for admin dashboard
    const stats = await calculateAdminStats(where)
    
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
        sort,
        search
      },
      stats // Additional stats for admin
    }
    
  } catch (error: any) {
    console.error('Error fetching SLO list for admin:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil daftar SLO'
    })
  }
})

// Helper function to calculate admin statistics
async function calculateAdminStats(baseWhere: any) {
  try {
    const [
      totalCount,
      submittedCount,
      inProgressCount,
      completedCount,
      rejectedCount
    ] = await Promise.all([
      // Total permohonan
      prisma.sLO.count({ where: baseWhere }),
      
      // Baru diajukan
      prisma.sLO.count({ 
        where: { 
          ...baseWhere, 
          status: 'SUBMITTED' 
        } 
      }),
      
      // Dalam proses (semua status kecuali final states)
      prisma.sLO.count({ 
        where: { 
          ...baseWhere, 
          status: {
            in: [
              'VERIFICATION',
              'INCOMPLETE_REQUIREMENTS',
              'COMPLETE_REQUIREMENTS',
              'FIELD_VERIFICATION_SCHEDULED',
              'FIELD_VERIFICATION_COMPLETED',
              'REVISION_SUBMITTED',
              'REVISION_REVIEW'
            ]
          }
        } 
      }),
      
      // Selesai (SLO issued)
      prisma.sLO.count({ 
        where: { 
          ...baseWhere, 
          status: 'SLO_ISSUED' 
        } 
      }),
      
      // Ditolak
      prisma.sLO.count({ 
        where: { 
          ...baseWhere, 
          status: {
            in: ['REJECTED', 'REVISION_REJECTED']
          }
        } 
      })
    ])
    
    return {
      total: totalCount,
      submitted: submittedCount,
      inProgress: inProgressCount,
      completed: completedCount,
      rejected: rejectedCount
    }
  } catch (error) {
    console.error('Error calculating admin stats:', error)
    return {
      total: 0,
      submitted: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0
    }
  }
}