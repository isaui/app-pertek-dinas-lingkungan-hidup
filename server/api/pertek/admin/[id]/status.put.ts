// server/api/pertek/admin/[id]/status.put.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { uploadBuffer } from "~/lib/minio"
import { randomUUID } from "crypto"
import { PertekDocumentType, RequirementFeedbackType, PertekStatus } from "@prisma/client"
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
    const pertekId = getRouterParam(event, 'id')
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
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
    const paparanDate = getFormField('paparanDate')
    const paparanLocation = getFormField('paparanLocation')
    const pertekNumber = getFormField('pertekNumber')
    const approvalDate = getFormField('approvalDate')
    const adminOverride = getFormField('adminOverride') === 'true' // Parse boolean flag
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
    const pertekFinalFile = getFormFile('pertekFinal')
    
    if (!newStatus) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New status is required'
      })
    }
    
    // Get current PERTEK
    const currentPertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!currentPertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    // Validate status transition (skip if admin override)
    if (!adminOverride) {
      const validTransitions = getValidTransitions(currentPertek.status)
      if (!validTransitions.includes(newStatus as PertekStatus)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid status transition from ${currentPertek.status} to ${newStatus}`
        })
      }
    }
    
    // Validate required fields for specific statuses (skip if admin override)
    if (!adminOverride) {
      // Only SCHEDULED_PAPARAN requires paparan details
      if (newStatus === 'SCHEDULED_PAPARAN') {
        if (!paparanDate || !paparanLocation) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Paparan date and location are required for scheduled paparan status'
          })
        }
      }
      
      // PERTEK_ISSUED requires PERTEK number and final document
      if (newStatus === 'PERTEK_ISSUED') {
        if (!pertekNumber) {
          throw createError({
            statusCode: 400,
            statusMessage: 'PERTEK number is required for PERTEK issuance'
          })
        }
        if (!pertekFinalFile) {
          throw createError({
            statusCode: 400,
            statusMessage: 'PERTEK final document is required for PERTEK issuance'
          })
        }
      }
    }
    
    // Validate requirement type if provided
    if (requirementType && !Object.values(RequirementFeedbackType).includes(requirementType as RequirementFeedbackType)) {
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
      
      // Only set paparan details for SCHEDULED_PAPARAN status
      if (newStatus === 'SCHEDULED_PAPARAN') {
        if (paparanDate) {
          updateData.paparanDate = new Date(paparanDate)
        }
        if (paparanLocation) {
          updateData.paparanLocation = paparanLocation
        }
      }
      
      // Set PERTEK issuance details for PERTEK_ISSUED status
      if (newStatus === 'PERTEK_ISSUED') {
        if (pertekNumber) {
          updateData.pertekNumber = pertekNumber
        }
        updateData.approvedAt = approvalDate ? new Date(approvalDate) : new Date()
      }
      
      // Update PERTEK
      const updatedPertek = await tx.pertek.update({
        where: { id: pertekId },
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
        
      const statusHistory = await tx.pertekStatusHistory.create({
        data: {
          pertekId: pertekId,
          status: newStatus as PertekStatus,
          notes: statusHistoryNotes,
          changedById: user.id
        }
      })
      
      // Create requirement feedback if notes provided or specific requirement feedbacks
      if (notes) {
        const feedbackType = requirementType 
          ? requirementType as RequirementFeedbackType
          : getRequirementTypeFromStatus(newStatus)
          
        await tx.pertekRequirementFeedback.create({
          data: {
            pertekId: pertekId,
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
            await tx.pertekRequirementFeedback.create({
              data: {
                pertekId: pertekId,
                statusHistoryId: statusHistory.id,
                documentId: feedback.documentId || null,
                requirementType: feedback.requirementType as RequirementFeedbackType,
                feedbackText: feedback.feedbackText,
                isResolved: false
              }
            })
          }
        }
      }
      
      // Handle file uploads
      const uploadedDocuments = []
      
      // Upload surat undangan paparan
      if (suratUndanganFile && suratUndanganFile.filename) {
        const fileExt = suratUndanganFile.filename.split('.').pop() || ''
        const uniqueFilename = `${randomUUID()}.${fileExt}`
        const objectName = `admin-documents/${pertekId}/${uniqueFilename}`
        
        const fileUrl = await uploadBuffer(
          objectName,
          suratUndanganFile.data,
          suratUndanganFile.type || 'application/octet-stream'
        )
        
        const document = await tx.pertekDocument.create({
          data: {
            pertekId: pertekId,
            type: 'SURAT_UNDANGAN_PAPARAN' as PertekDocumentType,
            filename: suratUndanganFile.filename,
            fileUrl: fileUrl,
            size: suratUndanganFile.data.length,
            mimeType: suratUndanganFile.type || 'application/octet-stream',
            description: 'Surat undangan paparan (auto-uploaded)'
          }
        })
        
        uploadedDocuments.push(document)
      }
      
      // Upload PERTEK final document
      if (pertekFinalFile && pertekFinalFile.filename) {
        const fileExt = pertekFinalFile.filename.split('.').pop() || ''
        const uniqueFilename = `${randomUUID()}.${fileExt}`
        const objectName = `admin-documents/${pertekId}/${uniqueFilename}`
        
        const fileUrl = await uploadBuffer(
          objectName,
          pertekFinalFile.data,
          pertekFinalFile.type || 'application/pdf'
        )
        
        const document = await tx.pertekDocument.create({
          data: {
            pertekId: pertekId,
            type: 'PERTEK_FINAL' as PertekDocumentType,
            filename: pertekFinalFile.filename,
            fileUrl: fileUrl,
            size: pertekFinalFile.data.length,
            mimeType: pertekFinalFile.type || 'application/pdf',
            description: 'Dokumen PERTEK final (auto-uploaded)'
          }
        })
        
        uploadedDocuments.push(document)
      }
      
      return {
        pertek: updatedPertek,
        uploadedDocuments
      }
    })
    
    // Send email notification to user if they have verified email
    if (result.pertek.user?.email) {
      try {
        // Queue email notification to be sent asynchronously
        await dbEmailQueue.add('status-update-notification', {
          to: result.pertek.user.email,
          name: result.pertek.user.name || 'User',
          companyName: result.pertek.company, // Company name from PERTEK model
          pertekNumber: result.pertek.pertekNumber || result.pertek.id, // Use PERTEK number if available, fallback to ID
          newStatus: newStatus,
          statusLabel: getStatusLabel(newStatus),
          notes: notes || undefined
        }, {
          maxAttempts: 3,
          delaySeconds: 1 // Small delay to ensure transaction is fully committed
        })
        console.log(`[PERTEK Status] Email notification queued for ${result.pertek.user.email}`)
      } catch (emailError) {
        // Log error but don't fail the request
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
      data: result.pertek,
      uploadedDocuments: result.uploadedDocuments,
      message: message + feedbackMessage,
      adminOverride: adminOverride,
      feedbacksCreated: totalFeedbacks
    }
    
  } catch (error: any) {
    console.error('Error updating PERTEK status:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengubah status PERTEK'
    })
  }
})

// Helper: Get valid status transitions
function getValidTransitions(currentStatus: string): PertekStatus[] {
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

// Helper: Get status label in Indonesian
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUBMITTED': 'Diajukan',
    'VERIFICATION': 'Verifikasi',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
    'PAPARAN_COMPLETED': 'Paparan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'PERTEK_ISSUED': 'PERTEK Diterbitkan',
    'REJECTED': 'Ditolak'
  }
  
  return labels[status] || status
}

// Helper: Get requirement type based on status
function getRequirementTypeFromStatus(status: string): RequirementFeedbackType {
  const typeMap: Record<string, RequirementFeedbackType> = {
    'INCOMPLETE_REQUIREMENTS': RequirementFeedbackType.DOKUMEN_TEKNIS,
    'COMPLETE_REQUIREMENTS': RequirementFeedbackType.DOKUMEN_TEKNIS,
    'SCHEDULED_PAPARAN': RequirementFeedbackType.DOKUMEN_TEKNIS,
    'REVISION_REJECTED': RequirementFeedbackType.DOKUMEN_REVISI,
    'REVISION_APPROVED': RequirementFeedbackType.DOKUMEN_REVISI
  }
  
  return typeMap[status] || RequirementFeedbackType.OTHER
}