// server/api/pertek/admin/[id]/download.get.ts
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
    
    // Get PERTEK ID
    const pertekId = getRouterParam(event, 'id')
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
      })
    }
    
    // Get PERTEK with documents
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
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
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    if (pertek.documents.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tidak ada dokumen untuk didownload'
      })
    }
    
    // Set response headers for ZIP download
    const zipFilename = `PERTEK_${pertek.company.replace(/[^a-zA-Z0-9]/g, '_')}_${pertek.id.slice(0, 8)}.zip`
    
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
    for (const document of pertek.documents) {
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
      pertek: {
        id: pertek.id,
        company: pertek.company,
        address: pertek.address,
        type: pertek.type,
        status: pertek.status,
        pertekNumber: pertek.pertekNumber,
        createdAt: pertek.createdAt,
        approvedAt: pertek.approvedAt
      },
      user: {
        name: pertek.user.name
      },
      documents: pertek.documents.map(doc => ({
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
    'SURAT_UNDANGAN_PAPARAN': '03_Surat_Undangan_Paparan',
    'PERTEK_FINAL': '04_PERTEK_Final'
  }
  
  return folderMap[documentType] || '99_Lainnya'
}