// server/api/pertek/submit.post.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma";

// Definisikan interface untuk dokumen input
interface PertekDocumentInput {
  filename: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  description?: string;
}

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi session user aktif
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

    // Ambil data dari request body
    const body = await readBody(event)
    
    // Validasi input
    if (!body.type || !body.company || !body.address || !body.documents || body.documents.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Data tidak lengkap. Mohon lengkapi semua field yang diperlukan.'
      })
    }

    // Validasi tipe PERTEK
    const validTypes = ['EMISI', 'AIR_LIMBAH']
    if (!validTypes.includes(body.type)) {
      throw createError({
        statusCode: 400, 
        statusMessage: 'Tipe PERTEK tidak valid'
      })
    }

    // Gunakan transaction untuk memastikan semua operasi DB berhasil atau gagal bersama
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat record PERTEK
      const pertek = await tx.pertek.create({
        data: {
          userId: session.user.id,
          type: body.type,
          status: 'SUBMITTED',
          company: body.company,
          address: body.address,
          notes: body.notes || null,
        }
      })
      
      // 2. Buat status history awal
      await tx.pertekStatusHistory.create({
        data: {
          pertekId: pertek.id,
          status: 'SUBMITTED',
          notes: 'Permohonan baru diajukan',
          changedById: session.user.id
        }
      })
      
      // 3. Buat record untuk setiap dokumen
      const documentPromises = body.documents.map((doc: PertekDocumentInput) => {
        return tx.pertekDocument.create({
          data: {
            pertekId: pertek.id,
            type: 'PERSYARATAN',
            filename: doc.filename,
            fileUrl: doc.fileUrl,
            size: doc.size,
            mimeType: doc.mimeType,
            description: doc.description || null
          }
        })
      })
      
      await Promise.all(documentPromises)
      
      return pertek
    })
    
    return {
      success: true,
      message: 'Permohonan PERTEK berhasil diajukan',
      pertekId: result.id
    }
    
  } catch (error:any) {
    console.error('PERTEK submission error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Terjadi kesalahan saat mengajukan permohonan PERTEK'
    })
  }
})
