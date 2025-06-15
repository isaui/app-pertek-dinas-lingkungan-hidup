// server/api/pertek/admin/[id]/index.get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { PertekStatus } from "@prisma/client"

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
                type: true,
                expired: true
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
        feedbackByStatus
      },
      availableTransitions: getAvailableTransitions(pertek.status),
      nextActions: getNextActions(pertek.status, pertek.documents, pertek.requirementFeedback)
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
function getAvailableTransitions(currentStatus: string): PertekStatus[] {
  const transitions: Record<string, PertekStatus[]> = {
    'SUBMITTED': [PertekStatus.VERIFICATION, PertekStatus.INCOMPLETE_REQUIREMENTS, PertekStatus.COMPLETE_REQUIREMENTS, PertekStatus.REJECTED],
    'VERIFICATION': [PertekStatus.INCOMPLETE_REQUIREMENTS, PertekStatus.COMPLETE_REQUIREMENTS, PertekStatus.REJECTED],
    'INCOMPLETE_REQUIREMENTS': [PertekStatus.VERIFICATION, PertekStatus.COMPLETE_REQUIREMENTS, PertekStatus.REJECTED],
    'COMPLETE_REQUIREMENTS': [PertekStatus.SCHEDULED_PAPARAN, PertekStatus.INCOMPLETE_REQUIREMENTS],
    'SCHEDULED_PAPARAN': [PertekStatus.PAPARAN_COMPLETED, PertekStatus.COMPLETE_REQUIREMENTS],
    'PAPARAN_COMPLETED': [PertekStatus.REVISION_SUBMITTED],
    'REVISION_SUBMITTED': [PertekStatus.REVISION_REVIEW],
    'REVISION_REVIEW': [PertekStatus.REVISION_APPROVED, PertekStatus.REVISION_REJECTED],
    'REVISION_REJECTED': [PertekStatus.REVISION_SUBMITTED],
    'REVISION_APPROVED': [PertekStatus.PERTEK_ISSUED]
  }
  
  return transitions[currentStatus] || []
}

// Helper: Get suggested next actions
function getNextActions(status: string, documents: any[], feedback: any[]): string[] {
  const actions: string[] = []
  
  switch (status) {
    case 'SUBMITTED':
      actions.push('Mulai verifikasi dokumen persyaratan')
      actions.push('Periksa kelengkapan dokumen yang diupload')
      break
      
    case 'VERIFICATION':
      actions.push('Tentukan apakah persyaratan sudah lengkap')
      actions.push('Berikan feedback jika ada dokumen yang kurang/salah')
      break
      
    case 'INCOMPLETE_REQUIREMENTS':
      const hasActiveFeedback = feedback.some(f => !f.isResolved)
      if (hasActiveFeedback) {
        actions.push('Tunggu user memperbaiki feedback yang diberikan')
      } else {
        actions.push('Periksa kembali kelengkapan persyaratan')
      }
      break
      
    case 'COMPLETE_REQUIREMENTS':
      actions.push('Jadwalkan sesi paparan dengan pemohon')
      actions.push('Tentukan tanggal dan lokasi paparan')
      actions.push('Siapkan surat undangan paparan')
      break
      
    case 'SCHEDULED_PAPARAN':
      actions.push('Laksanakan sesi paparan sesuai jadwal')
      actions.push('Update status setelah paparan selesai')
      break
      
    case 'PAPARAN_COMPLETED':
      actions.push('Tunggu user mengupload dokumen revisi')
      actions.push('Berikan arahan revisi yang diperlukan')
      break
      
    case 'REVISION_SUBMITTED':
      actions.push('Mulai review dokumen revisi yang disubmit')
      break
      
    case 'REVISION_REVIEW':
      actions.push('Tentukan apakah revisi sudah sesuai')
      actions.push('Approve atau reject dokumen revisi')
      break
      
    case 'REVISION_REJECTED':
      actions.push('Berikan feedback detail untuk perbaikan')
      actions.push('Tunggu user submit ulang revisi')
      break
      
    case 'REVISION_APPROVED':
      actions.push('Revisi sudah disetujui.')
      actions.push('Silahkan update status ke PERTEK Diterbitkan apabila dokumen PERTEK sudah siap.')
      break
      
    case 'PERTEK_ISSUED':
      const hasFinalDocument = documents.some(d => d.type === 'PERTEK_FINAL')
      if (hasFinalDocument) {
        actions.push('PERTEK resmi sudah diterbitkan')
      } else {
        actions.push('Upload dokumen PERTEK final')
        actions.push('Siapkan dokumen PERTEK untuk penerbitan')
      }
      break
      
    case 'REJECTED':
      actions.push('Permohonan ditolak')
      actions.push('Berikan penjelasan alasan penolakan')
      break
  }
  
  return actions
}