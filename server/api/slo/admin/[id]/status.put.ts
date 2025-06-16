// server/api/slo/admin/[id]/status.put.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { uploadBuffer } from "~/lib/minio"
import { randomUUID } from "crypto"
import { SLODocumentType, SLORequirementFeedbackType, SLOStatus } from "@prisma/client"
import { dbEmailQueue } from "~/server/utils/db-queue-utils"

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
    
    // Get params
    const sloId = getRouterParam(event, 'id')
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No form data received'
      })
    }
    
    // Extract form fields
    const getFormField = (name: string) => {
      const field = formData.find(part => part.name === name)
      return field ? field.data.toString() : ''
    }
    
    const getFormFile = (name: string) => {
      return formData.find(part => part.name === name && part.filename)
    }
    
    const newStatus = getFormField('newStatus')
    const notes = getFormField('notes')
    const documentId = getFormField('documentId')
    const requirementType = getFormField('requirementType')
    const verifikasiDate = getFormField('verifikasiDate')
    const verifikasiLocation = getFormField('verifikasiLocation')
    const sloNumber = getFormField('sloNumber')
    const approvalDate = getFormField('approvalDate')
    const adminOverride = getFormField('adminOverride') === 'true'
    const requirementFeedbacksStr = getFormField('requirementFeedbacks')
    
    // Parse requirement feedbacks
    let requirementFeedbacks: Array<any> = []
    if (requirementFeedbacksStr) {
      try {
        requirementFeedbacks = JSON.parse(requirementFeedbacksStr)
      } catch (error) {
        console.error('Error parsing requirement feedbacks:', error)
      }
    }
    
    const suratUndanganFile = getFormFile('suratUndangan')
    const sloFinalFile = getFormFile('sloFinal')
    
    if (!newStatus) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New status is required'
      })
    }
    
    // Get current SLO
    const currentSlo = await prisma.sLO.findUnique({
      where: { id: sloId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!currentSlo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found'
      })
    }
    
    // Validate status transition (skip if admin override)
    if (!adminOverride) {
      const validTransitions = getValidTransitions(currentSlo.status)
      if (!validTransitions.includes(newStatus as SLOStatus)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid status transition from ${currentSlo.status} to ${newStatus}`
        })
      }
    }
    
    // Validate required fields for specific statuses (skip if admin override)
    if (!adminOverride) {
      // Only FIELD_VERIFICATION_SCHEDULED requires verifikasi details
      if (newStatus === 'FIELD_VERIFICATION_SCHEDULED') {
        if (!verifikasiDate || !verifikasiLocation) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Verification date and location are required for scheduled verification status'
          })
        }
      }
      
      // SLO_ISSUED requires SLO number and final document
      if (newStatus === 'SLO_ISSUED') {
        if (!sloNumber) {
          throw createError({
            statusCode: 400,
            statusMessage: 'SLO number is required for SLO issuance'
          })
        }
        if (!sloFinalFile) {
          throw createError({
            statusCode: 400,
            statusMessage: 'SLO final document is required for SLO issuance'
          })
        }
      }
    }
    
    // Validate requirement type if provided
    if (requirementType && !Object.values(SLORequirementFeedbackType).includes(requirementType as SLORequirementFeedbackType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid requirement type'
      })
    }
    
    // Process in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      }
      
      // Add conditional fields
      if (notes) {
        updateData.feedbackToUser = notes
      }
      
      // Only set verifikasi details for FIELD_VERIFICATION_SCHEDULED status
      if (newStatus === 'FIELD_VERIFICATION_SCHEDULED') {
        if (verifikasiDate) {
          updateData.verifikasiDate = new Date(verifikasiDate)
        }
        if (verifikasiLocation) {
          updateData.verifikasiLocation = verifikasiLocation
        }
      }
      
      // Set SLO issuance details for SLO_ISSUED status
      if (newStatus === 'SLO_ISSUED') {
        if (sloNumber) {
          updateData.sloNumber = sloNumber
        }
        updateData.approvedAt = approvalDate ? new Date(approvalDate) : new Date()
      }
      
      // Update SLO
      const updatedSlo = await tx.sLO.update({
        where: { id: sloId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      // Create status history record with bypass indicator
      const statusHistoryNotes = adminOverride 
        ? `[ADMIN BYPASS] ${notes || 'Status bypassed normal workflow validation'}`
        : (notes || null)
        
      const statusHistory = await tx.sLOStatusHistory.create({
        data: {
          sloId: sloId,
          status: newStatus as SLOStatus,
          notes: statusHistoryNotes,
          changedById: user.id
        }
      })
      
      // Create requirement feedback if notes provided or specific requirement feedbacks
      if (notes) {
        const feedbackType = requirementType 
          ? requirementType as SLORequirementFeedbackType
          : getRequirementTypeFromStatus(newStatus)
          
        await tx.sLORequirementFeedback.create({
          data: {
            sloId: sloId,
            statusHistoryId: statusHistory.id,
            documentId: documentId || null,
            requirementType: feedbackType,
            feedbackText: notes,
            isResolved: false
          }
        })
      }
      
      // Create specific requirement feedbacks
      if (requirementFeedbacks.length > 0) {
        for (const feedback of requirementFeedbacks) {
          if (feedback.requirementType && feedback.feedbackText) {
            await tx.sLORequirementFeedback.create({
              data: {
                sloId: sloId,
                statusHistoryId: statusHistory.id,
                documentId: feedback.documentId || null,
                requirementType: feedback.requirementType as SLORequirementFeedbackType,
                feedbackText: feedback.feedbackText,
                isResolved: false
              }
            })
          }
        }
      }
      
      // Handle file uploads
      const uploadedDocuments = []
      
      // Upload surat undangan verifikasi
      if (suratUndanganFile && suratUndanganFile.filename) {
        const fileExt = suratUndanganFile.filename.split('.').pop() || ''
        const uniqueFilename = `${randomUUID()}.${fileExt}`
        const objectName = `admin-documents/${sloId}/${uniqueFilename}`
        
        const fileUrl = await uploadBuffer(
          objectName,
          suratUndanganFile.data,
          suratUndanganFile.type || 'application/octet-stream'
        )
        
        const document = await tx.sLODocument.create({
          data: {
            sloId: sloId,
            type: 'SURAT_UNDANGAN_VERIFIKASI' as SLODocumentType,
            filename: suratUndanganFile.filename,
            fileUrl: fileUrl,
            size: suratUndanganFile.data.length,
            mimeType: suratUndanganFile.type || 'application/octet-stream',
            description: 'Surat undangan verifikasi lapangan (auto-uploaded)'
          }
        })
        
        uploadedDocuments.push(document)
      }
      
      // Upload SLO final document
      if (sloFinalFile && sloFinalFile.filename) {
        const fileExt = sloFinalFile.filename.split('.').pop() || ''
        const uniqueFilename = `${randomUUID()}.${fileExt}`
        const objectName = `admin-documents/${sloId}/${uniqueFilename}`
        
        const fileUrl = await uploadBuffer(
          objectName,
          sloFinalFile.data,
          sloFinalFile.type || 'application/pdf'
        )
        
        const document = await tx.sLODocument.create({
          data: {
            sloId: sloId,
            type: 'SLO_FINAL' as SLODocumentType,
            filename: sloFinalFile.filename,
            fileUrl: fileUrl,
            size: sloFinalFile.data.length,
            mimeType: sloFinalFile.type || 'application/pdf',
            description: 'Dokumen SLO final (auto-uploaded)'
          }
        })
        
        uploadedDocuments.push(document)
      }
      
      return {
        slo: updatedSlo,
        uploadedDocuments
      }
    })
    
    // Send email notification to user if they have verified email
    if (result.slo.user?.email) {
      try {
        // Queue email notification to be sent asynchronously
        await dbEmailQueue.add('slo-status-update-notification', {
          to: result.slo.user.email,
          name: result.slo.user.name || 'User',
          companyName: result.slo.company,
          sloNumber: result.slo.sloNumber || result.slo.id,
          newStatus: newStatus,
          statusLabel: getStatusLabel(newStatus),
          notes: notes || undefined
        }, {
          maxAttempts: 3,
          delaySeconds: 1
        })
        console.log(`[SLO Status] Email notification queued for ${result.slo.user.email}`)
      } catch (emailError) {
        console.error('Error queueing status notification email:', emailError)
      }
    }
    
    const message = adminOverride 
      ? `Status berhasil diubah ke ${getStatusLabel(newStatus)} (BYPASS MODE)`
      : `Status berhasil diubah ke ${getStatusLabel(newStatus)}`
    
    const totalFeedbacks = (notes ? 1 : 0) + requirementFeedbacks.length
    const feedbackMessage = totalFeedbacks > 0 ? ` dengan ${totalFeedbacks} feedback` : ''
    
    return {
      success: true,
      data: result.slo,
      uploadedDocuments: result.uploadedDocuments,
      message: message + feedbackMessage,
      adminOverride: adminOverride,
      feedbacksCreated: totalFeedbacks
    }
    
  } catch (error: any) {
    console.error('Error updating SLO status:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengubah status SLO'
    })
  }
})

// Helper: Get valid status transitions for SLO
function getValidTransitions(currentStatus: string): SLOStatus[] {
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

// Helper: Get status label in Indonesian for SLO
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUBMITTED': 'Diajukan',
    'VERIFICATION': 'Verifikasi',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
    'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'SLO_ISSUED': 'SLO Diterbitkan',
    'REJECTED': 'Ditolak'
  }
  
  return labels[status] || status
}

// Helper: Get requirement type based on status for SLO
function getRequirementTypeFromStatus(status: string): SLORequirementFeedbackType {
  const typeMap: Record<string, SLORequirementFeedbackType> = {
    'INCOMPLETE_REQUIREMENTS': SLORequirementFeedbackType.PERSETUJUAN_TEKNIS,
    'COMPLETE_REQUIREMENTS': SLORequirementFeedbackType.PERSETUJUAN_TEKNIS,
    'FIELD_VERIFICATION_SCHEDULED': SLORequirementFeedbackType.PERSETUJUAN_TEKNIS,
    'REVISION_REJECTED': SLORequirementFeedbackType.DOKUMEN_REVISI,
    'REVISION_APPROVED': SLORequirementFeedbackType.DOKUMEN_REVISI
  }
  
  return typeMap[status] || SLORequirementFeedbackType.OTHER
}