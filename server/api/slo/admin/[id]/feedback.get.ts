// server/api/slo/admin/[id]/feedback.get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    // Auth check
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

    const user = await prisma.user.findFirst({
      where: { id: session.user.id }
    })
    
    if (!user || user.role !== 'administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Administrator access required'
      })
    }
    
    // Get SLO ID and query params
    const sloId = getRouterParam(event, 'id')
    const query = getQuery(event)
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Parse query parameters
    const includeResolved = query.includeResolved === 'true' || query.includeResolved === true
    const requirementType = query.requirementType as string
    
    // Validate SLO exists
    const slo = await prisma.sLO.findUnique({
      where: { id: sloId },
      select: { id: true, company: true }
    })
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found'
      })
    }
    
    // Build where clause
    const where: any = {
      sloId: sloId
    }
    
    // Filter by resolution status
    if (!includeResolved) {
      where.isResolved = false
    }
    
    // Filter by requirement type
    if (requirementType) {
      where.requirementType = requirementType
    }
    
    // Get feedback with related data
    const feedback = await prisma.sLORequirementFeedback.findMany({
      where,
      orderBy: [
        { isResolved: 'asc' }, // Unresolved first
        { createdAt: 'desc' }  // Newest first
      ],
      include: {
        document: {
          select: {
            id: true,
            filename: true,
            type: true,
            fileUrl: true
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
    })
    
    // Get statistics
    const stats = await prisma.sLORequirementFeedback.groupBy({
      by: ['isResolved'],
      where: { sloId: sloId },
      _count: {
        id: true
      }
    })
    
    const statistics = {
      total: feedback.length,
      active: stats.find(s => !s.isResolved)?._count.id || 0,
      resolved: stats.find(s => s.isResolved)?._count.id || 0
    }
    
    // Group by requirement type for better organization
    const groupedFeedback = feedback.reduce((acc, item) => {
      const type = item.requirementType
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(item)
      return acc
    }, {} as Record<string, typeof feedback>)
    
    return {
      success: true,
      data: {
        feedback,
        groupedFeedback,
        statistics,
        slo: {
          id: slo.id,
          company: slo.company
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching feedback list:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil daftar feedback'
    })
  }
})

