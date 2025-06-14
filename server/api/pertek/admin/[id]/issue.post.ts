// server/api/pertek/admin/[id]/issue.post.ts
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
    
    // Get params and body
    const pertekId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
      })
    }
    
    const { pertekNumber, approvalDate } = body
    
    if (!pertekNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK number is required'
      })
    }
    
    // Validate PERTEK exists and is ready for issuance
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
      include: {
        documents: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
    
    // Validate current status
    if (pertek.status !== 'REVISION_APPROVED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK harus dalam status "Revisi Disetujui" untuk dapat diterbitkan'
      })
    }
    
    // Check if PERTEK final document exists
    const hasFinalDocument = pertek.documents.some(doc => doc.type === 'PERTEK_FINAL')
    if (!hasFinalDocument) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dokumen PERTEK final harus diupload sebelum menerbitkan PERTEK'
      })
    }
    
    // Check if PERTEK number is already used
    const existingPertek = await prisma.pertek.findFirst({
      where: {
        pertekNumber: pertekNumber,
        id: { not: pertekId }
      }
    })
    
    if (existingPertek) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nomor PERTEK sudah digunakan'
      })
    }
    
    // Parse approval date
    const approvedAtDate = approvalDate ? new Date(approvalDate) : new Date()
    
    // Issue PERTEK in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update PERTEK
      const updatedPertek = await tx.pertek.update({
        where: { id: pertekId },
        data: {
          status: 'PERTEK_ISSUED',
          pertekNumber: pertekNumber,
          approvedAt: approvedAtDate,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          documents: {
            where: {
              type: 'PERTEK_FINAL'
            }
          }
        }
      })
      
      // Create status history
      await tx.pertekStatusHistory.create({
        data: {
          pertekId: pertekId,
          status: 'PERTEK_ISSUED',
          notes: `PERTEK diterbitkan dengan nomor: ${pertekNumber}`,
          changedById: user.id
        }
      })
      
      return updatedPertek
    })
    
    // TODO: Send email notification to user
    // await sendPertekIssuedNotification(
    //   result.user.email, 
    //   result.company, 
    //   result.pertekNumber,
    //   result.documents[0]?.fileUrl // PERTEK final document URL
    // )
    
    return {
      success: true,
      data: result,
      message: `PERTEK berhasil diterbitkan dengan nomor ${pertekNumber}`
    }
    
  } catch (error: any) {
    console.error('Error issuing PERTEK:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat menerbitkan PERTEK'
    })
  }
})