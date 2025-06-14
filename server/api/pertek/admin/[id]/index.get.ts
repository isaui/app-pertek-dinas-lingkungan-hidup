// server/api/pertek/admin/[id]/index.get.ts
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

    // Get user and check admin role
    const user = await prisma.user.findFirst({
      where: { id: session.user.id }
    })
    
    if (!user || user.role !== 'administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Administrator access required'
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
    
    // Get PERTEK detail with all relations
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
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
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
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
                type: true
              }
            }
          }
        }
      }
    })
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    // Categorize documents by type
    const documentsByType = {
      persyaratan: pertek.documents.filter(d => d.type === 'PERSYARATAN'),
      revisi: pertek.documents.filter(d => d.type === 'REVISI'),
      suratUndangan: pertek.documents.filter(d => d.type === 'SURAT_UNDANGAN_PAPARAN'),
      pertekFinal: pertek.documents.filter(d => d.type === 'PERTEK_FINAL')
    }
    
    // Categorize feedback
    const feedbackByStatus = {
      active: pertek.requirementFeedback.filter(f => !f.isResolved),
      resolved: pertek.requirementFeedback.filter(f => f.isResolved)
    }
    
    return {
      success: true,
      data: {
        ...pertek,
        documentsByType,
        feedbackByStatus,
        canTransition: getAvailableTransitions(pertek.status),
        nextActions: getNextActions(pertek.status, pertek.documents, pertek.requirementFeedback)
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching PERTEK detail for admin:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil detail PERTEK'
    })
  }
})

// Helper: Get available status transitions
function getAvailableTransitions(currentStatus: string) {
  const transitions: Record<string, string[]> = {
    'SUBMITTED': ['VERIFICATION', 'INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS'],
    'VERIFICATION': ['INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS'],
    'INCOMPLETE_REQUIREMENTS': ['VERIFICATION', 'COMPLETE_REQUIREMENTS'],
    'COMPLETE_REQUIREMENTS': ['SCHEDULED_PAPARAN'],
    'SCHEDULED_PAPARAN': ['PAPARAN_COMPLETED'],
    'PAPARAN_COMPLETED': ['REVISION_SUBMITTED'],
    'REVISION_SUBMITTED': ['REVISION_REVIEW'],
    'REVISION_REVIEW': ['REVISION_APPROVED', 'REVISION_REJECTED'],
    'REVISION_REJECTED': ['REVISION_SUBMITTED'],
    'REVISION_APPROVED': ['PERTEK_ISSUED']
  }
  
  return transitions[currentStatus] || []
}

// Helper: Get suggested next actions
function getNextActions(status: string, documents: any[], feedback: any[]) {
  const actions = []
  
  switch (status) {
    case 'SUBMITTED':
      actions.push('verify_requirements')
      break
    case 'VERIFICATION':
      actions.push('approve_requirements', 'request_corrections')
      break
    case 'INCOMPLETE_REQUIREMENTS':
      const hasActiveFeedback = feedback.some(f => !f.isResolved)
      if (!hasActiveFeedback) {
        actions.push('recheck_requirements')
      }
      break
    case 'COMPLETE_REQUIREMENTS':
      actions.push('schedule_paparan')
      break
    case 'SCHEDULED_PAPARAN':
      actions.push('complete_paparan')
      break
    case 'PAPARAN_COMPLETED':
      actions.push('request_revision')
      break
    case 'REVISION_REVIEW':
      actions.push('approve_revision', 'reject_revision')
      break
    case 'REVISION_APPROVED':
      const hasFinalDocument = documents.some(d => d.type === 'PERTEK_FINAL')
      if (hasFinalDocument) {
        actions.push('issue_pertek')
      } else {
        actions.push('upload_final_document')
      }
      break
  }
  
  return actions
}