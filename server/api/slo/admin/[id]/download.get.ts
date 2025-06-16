// server/api/slo/admin/[id]/download.get.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import archiver from 'archiver'
import { Readable } from 'stream'

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
    
    // Get SLO ID
    const sloId = getRouterParam(event, 'id')
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Get SLO with documents
    const slo = await prisma.sLO.findUnique({
      where: { id: sloId },
      include: {
        documents: {
          orderBy: {
            uploadedAt: 'asc'
          }
        },
        user: {
          select: {
            name: true
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
    
    if (slo.documents.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tidak ada dokumen untuk didownload'
      })
    }
    
    // Set response headers for ZIP download
    const zipFilename = `SLO_${slo.company.replace(/[^a-zA-Z0-9]/g, '_')}_${slo.id.slice(0, 8)}.zip`
    
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', `attachment; filename="${zipFilename}"`)
    
    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error creating archive'
      })
    })
    
    // Add documents to archive
    for (const document of slo.documents) {
      try {
        // Fetch document from MinIO/storage
        const response = await fetch(document.fileUrl)
        if (!response.ok) {
          console.warn(`Failed to fetch document: ${document.filename}`)
          continue
        }
        
        const buffer = await response.arrayBuffer()
        
        // Create folder structure in ZIP
        const folderName = getFolderName(document.type)
        const fileName = `${folderName}/${document.filename}`
        
        // Add file to archive
        archive.append(Buffer.from(buffer), { name: fileName })
        
      } catch (error) {
        console.warn(`Error processing document ${document.filename}:`, error)
        // Continue with other documents
      }
    }
    
    // Add metadata file
    const metadata = {
      slo: {
        id: slo.id,
        company: slo.company,
        address: slo.address,
        type: slo.type,
        status: slo.status,
        sloNumber: slo.sloNumber,
        createdAt: slo.createdAt,
        approvedAt: slo.approvedAt
      },
      user: {
        name: slo.user.name
      },
      documents: slo.documents.map(doc => ({
        filename: doc.filename,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploadedAt
      })),
      downloadedAt: new Date().toISOString(),
      downloadedBy: user.name
    }
    
    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' })
    
    // Finalize archive
    await archive.finalize()
    
    // Convert archive to readable stream for response
    return new Response(Readable.toWeb(archive) as ReadableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`
      }
    })
    
  } catch (error: any) {
    console.error('Error creating bulk download:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat membuat download'
    })
  }
})

// Helper: Get folder name for document type
function getFolderName(documentType: string): string {
  const folderMap: Record<string, string> = {
    'PERSYARATAN': '01_Dokumen_Persyaratan',
    'REVISI': '02_Dokumen_Revisi', 
    'SURAT_UNDANGAN_VERIFIKASI': '03_Surat_Undangan_Verifikasi',
    'SLO_FINAL': '04_SLO_Final'
  }
  
  return folderMap[documentType] || '99_Lainnya'
}