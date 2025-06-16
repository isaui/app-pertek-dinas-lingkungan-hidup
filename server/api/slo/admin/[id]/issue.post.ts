// server/api/slo/admin/[id]/issue.post.ts
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
    const sloId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    const { sloNumber, approvalDate } = body
    
    if (!sloNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO number is required'
      })
    }
    
    // Validate SLO exists and is ready for issuance
    const slo = await prisma.sLO.findUnique({
      where: { id: sloId },
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
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found'
      })
    }
    
    // Validate current status
    if (slo.status !== 'REVISION_APPROVED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO harus dalam status "Revisi Disetujui" untuk dapat diterbitkan'
      })
    }
    
    // Check if SLO final document exists
    const hasFinalDocument = slo.documents.some(doc => doc.type === 'SLO_FINAL')
    if (!hasFinalDocument) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dokumen SLO final harus diupload sebelum menerbitkan SLO'
      })
    }
    
    // Check if SLO number is already used
    const existingSlo = await prisma.sLO.findFirst({
      where: {
        sloNumber: sloNumber,
        id: { not: sloId }
      }
    })
    
    if (existingSlo) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nomor SLO sudah digunakan'
      })
    }
    
    // Parse approval date
    const approvedAtDate = approvalDate ? new Date(approvalDate) : new Date()
    
    // Issue SLO in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update SLO
      const updatedSlo = await tx.sLO.update({
        where: { id: sloId },
        data: {
          status: 'SLO_ISSUED',
          sloNumber: sloNumber,
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
              type: 'SLO_FINAL'
            }
          }
        }
      })
      
      // Create status history
      await tx.sLOStatusHistory.create({
        data: {
          sloId: sloId,
          status: 'SLO_ISSUED',
          notes: `SLO diterbitkan dengan nomor: ${sloNumber}`,
          changedById: user.id
        }
      })
      
      return updatedSlo
    })
    
    // TODO: Send email notification to user
    // await sendSloIssuedNotification(
    //   result.user.email, 
    //   result.company, 
    //   result.sloNumber,
    //   result.documents[0]?.fileUrl // SLO final document URL
    // )
    
    return {
      success: true,
      data: result,
      message: `SLO berhasil diterbitkan dengan nomor ${sloNumber}`
    }
    
  } catch (error: any) {
    console.error('Error issuing SLO:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat menerbitkan SLO'
    })
  }
})