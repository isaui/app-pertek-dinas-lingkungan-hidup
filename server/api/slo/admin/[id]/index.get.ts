// server/api/slo/admin/[id]/index.get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { SLOStatus } from "@prisma/client"

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
    
    // Get SLO ID from route params
    const sloId = getRouterParam(event, 'id')
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Get SLO detail with all relations
    const slo = await prisma.sLO.findUnique({
      where: { id: sloId },
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
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found'
      })
    }
    
    // Categorize documents by type
    const documentsByType = {
      persyaratan: slo.documents.filter(d => d.type === 'PERSYARATAN'),
      revisi: slo.documents.filter(d => d.type === 'REVISI'),
      suratUndangan: slo.documents.filter(d => d.type === 'SURAT_UNDANGAN_VERIFIKASI'),
      sloFinal: slo.documents.filter(d => d.type === 'SLO_FINAL')
    }
    
    // Categorize feedback
    const feedbackByStatus = {
      active: slo.requirementFeedback.filter(f => !f.isResolved),
      resolved: slo.requirementFeedback.filter(f => f.isResolved)
    }
    
    return {
      success: true,
      data: {
        ...slo,
        documentsByType,
        feedbackByStatus
      },
      availableTransitions: getAvailableTransitions(slo.status),
      nextActions: getNextActions(slo.status, slo.documents, slo.requirementFeedback)
    }
    
  } catch (error: any) {
    console.error('Error fetching SLO detail for admin:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengambil detail SLO'
    })
  }
})

// Helper: Get available status transitions for SLO
function getAvailableTransitions(currentStatus: string): SLOStatus[] {
  const transitions: Record<string, SLOStatus[]> = {
    'SUBMITTED': [SLOStatus.VERIFICATION, SLOStatus.INCOMPLETE_REQUIREMENTS, SLOStatus.COMPLETE_REQUIREMENTS, SLOStatus.REJECTED],
    'VERIFICATION': [SLOStatus.INCOMPLETE_REQUIREMENTS, SLOStatus.COMPLETE_REQUIREMENTS, SLOStatus.REJECTED],
    'INCOMPLETE_REQUIREMENTS': [SLOStatus.VERIFICATION, SLOStatus.COMPLETE_REQUIREMENTS, SLOStatus.REJECTED],
    'COMPLETE_REQUIREMENTS': [SLOStatus.FIELD_VERIFICATION_SCHEDULED, SLOStatus.INCOMPLETE_REQUIREMENTS],
    'FIELD_VERIFICATION_SCHEDULED': [SLOStatus.FIELD_VERIFICATION_COMPLETED, SLOStatus.COMPLETE_REQUIREMENTS],
    'FIELD_VERIFICATION_COMPLETED': [SLOStatus.REVISION_SUBMITTED],
    'REVISION_SUBMITTED': [SLOStatus.REVISION_REVIEW],
    'REVISION_REVIEW': [SLOStatus.REVISION_APPROVED, SLOStatus.REVISION_REJECTED],
    'REVISION_REJECTED': [SLOStatus.REVISION_SUBMITTED],
    'REVISION_APPROVED': [SLOStatus.SLO_ISSUED]
  }
  
  return transitions[currentStatus] || []
}

// Helper: Get suggested next actions for SLO
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
      actions.push('Jadwalkan verifikasi lapangan')
      actions.push('Tentukan tanggal dan lokasi verifikasi')
      actions.push('Siapkan surat undangan verifikasi')
      break
      
    case 'FIELD_VERIFICATION_SCHEDULED':
      actions.push('Laksanakan verifikasi lapangan sesuai jadwal')
      actions.push('Update status setelah verifikasi selesai')
      break
      
    case 'FIELD_VERIFICATION_COMPLETED':
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
      actions.push('Silahkan update status ke SLO Diterbitkan apabila dokumen SLO sudah siap.')
      break
      
    case 'SLO_ISSUED':
      const hasFinalDocument = documents.some(d => d.type === 'SLO_FINAL')
      if (hasFinalDocument) {
        actions.push('SLO resmi sudah diterbitkan')
      } else {
        actions.push('Upload dokumen SLO final')
        actions.push('Siapkan dokumen SLO untuk penerbitan')
      }
      break
      
    case 'REJECTED':
      actions.push('Permohonan ditolak')
      actions.push('Berikan penjelasan alasan penolakan')
      break
  }
  
  return actions
}