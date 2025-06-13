import { Client } from 'minio';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

// Configuration for MinIO hosted on Railway
const endpoint = process.env.MINIO_ENDPOINT || 'your-minio-app.railway.app';
const port = parseInt(process.env.MINIO_PORT || '443');
const useSSL = process.env.MINIO_USE_SSL !== 'false'; // Default to true for Railway
const accessKey = process.env.MINIO_ACCESS_KEY || '';
const secretKey = process.env.MINIO_SECRET_KEY || '';
const bucketName = process.env.MINIO_BUCKET_NAME || 'dlh-bucket';

// Default chunk size for multipart uploads (5MB - MinIO minimum is 5MB)
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

// Multipart upload status interface
export interface MultipartUploadStatus {
  uploadId: string;
  key: string;
  bucket: string;
  parts: {
    etag: string;
    part: number; // Using 'part' instead of 'partNumber' to match MinIO's API
  }[];
  bytesUploaded: number;
  totalSize: number;
}

// Initialize MinIO client
export const minioClient = new Client({
  endPoint: endpoint,
  port: port,
  useSSL: useSSL,
  accessKey: accessKey,
  secretKey: secretKey,
});

// Check if bucket exists, create if it doesn't
export async function ensureBucketExists(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket '${bucketName}' created successfully`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

// Upload a file to MinIO
export async function uploadFile(
  objectName: string,
  filePath: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  try {
    await minioClient.fPutObject(bucketName, objectName, filePath, {
      'Content-Type': contentType,
    });
    return getFileUrl(objectName);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Upload a Buffer to MinIO
export async function uploadBuffer(
  objectName: string,
  buffer: Buffer,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  try {
    const metaData = {
      'Content-Type': contentType,
    };
    // Pass the buffer's length as the size parameter (required by MinIO types)
    await minioClient.putObject(bucketName, objectName, buffer, buffer.length, metaData);
    return getFileUrl(objectName);
  } catch (error) {
    console.error('Error uploading buffer:', error);
    throw error;
  }
}

// Get temporary URL for file (valid for specified seconds)
export async function getFileUrl(objectName: string, expirySeconds: number = 604800): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

// List all objects in the bucket with optional prefix
export async function listFiles(prefix: string = ''): Promise<string[]> {
  try {
    const objectsList: string[] = [];
    const stream = minioClient.listObjects(bucketName, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          objectsList.push(obj.name);
        }
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
      
      stream.on('end', () => {
        resolve(objectsList);
      });
    });
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Delete a file from MinIO
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(bucketName, objectName);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// =========== STREAMING/MULTIPART UPLOAD FUNCTIONS ===========

/**
 * Initiates a multipart upload for streaming large files
 * @param objectName The name to give the file in MinIO
 * @param contentType MIME type of the file
 * @returns Upload ID and object info
 */
export async function initiateMultipartUpload(
  objectName: string,
  contentType: string = 'application/octet-stream'
): Promise<{ uploadId: string; key: string; bucket: string }> {
  try {
    const uploadId = await minioClient.initiateNewMultipartUpload(
      bucketName,
      objectName,
      { 'Content-Type': contentType }
    );

    return {
      uploadId,
      key: objectName,
      bucket: bucketName
    };
  } catch (error) {
    console.error('Error initiating multipart upload:', error);
    throw error;
  }
}

/**
 * Uploads a single part in a multipart upload
 * @param uploadId The upload ID from initiateMultipartUpload
 * @param objectName The object name in MinIO
 * @param partNumber The part number (1 to 10000)
 * @param buffer The buffer containing this part's data
 * @returns ETag of the uploaded part
 */
export async function uploadPart(
  uploadId: string,
  objectName: string,
  partNumber: number,
  buffer: Buffer
): Promise<string> {
  try {
    const etag = await minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      {
        'X-Amz-Part-Number': partNumber.toString(),
        'X-Amz-Upload-Id': uploadId
      }
    );
    // MinIO client might return UploadedObjectInfo, extract etag or convert to string
    return typeof etag === 'string' ? etag : etag.etag || String(etag);
  } catch (error) {
    console.error(`Error uploading part ${partNumber}:`, error);
    throw error;
  }
}

/**
 * Completes a multipart upload by combining all parts
 * @param uploadId The upload ID from initiateMultipartUpload
 * @param objectName The object name in MinIO
 * @param parts Array of ETags and part numbers
 * @returns URL of the complete file
 */
export async function completeMultipartUpload(
  uploadId: string,
  objectName: string,
  parts: { etag: string; part: number }[]
): Promise<string> {
  try {
    // Sort parts by part number (required by S3 API)
    const sortedParts = [...parts].sort((a, b) => a.part - b.part);
    
    await minioClient.completeMultipartUpload(
      bucketName,
      objectName,
      uploadId,
      sortedParts
    );
    
    return getFileUrl(objectName);
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    throw error;
  }
}

/**
 * Aborts a multipart upload in case of failure
 * @param uploadId The upload ID to abort
 * @param objectName The object name in MinIO
 */
export async function abortMultipartUpload(
  uploadId: string,
  objectName: string
): Promise<void> {
  try {
    await minioClient.abortMultipartUpload(bucketName, objectName, uploadId);
  } catch (error) {
    console.error('Error aborting multipart upload:', error);
    throw error;
  }
}

/**
 * Stream upload of a large file from disk using multipart upload
 * @param filePath Path to local file
 * @param objectName Name to give the file in MinIO
 * @param contentType MIME type of the file
 * @param chunkSize Size of each chunk in bytes (min 5MB for MinIO)
 * @param progressCallback Optional callback for tracking progress
 * @returns URL of the uploaded file
 */
export async function streamUploadFile(
  filePath: string,
  objectName: string,
  contentType: string = 'application/octet-stream',
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  progressCallback?: (status: MultipartUploadStatus) => void
): Promise<string> {
  // Ensure minimum 5MB chunk size (MinIO requirement)
  chunkSize = Math.max(chunkSize, 5 * 1024 * 1024);
  
  try {
    // Get file stats to determine size
    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;
    
    // Initiate multipart upload
    const { uploadId, key, bucket } = await initiateMultipartUpload(objectName, contentType);
    
    // Track upload status
    const uploadStatus: MultipartUploadStatus = {
      uploadId,
      key,
      bucket,
      parts: [],
      bytesUploaded: 0,
      totalSize: fileSize
    };
    
    // Calculate number of parts needed
    const numParts = Math.ceil(fileSize / chunkSize);
    
    // Create read stream for the file
    const fileStream = createReadStream(filePath, { highWaterMark: chunkSize });
    
    let partNumber = 1;
    let buffer: Buffer[] = [];
    let currentSize = 0;
    
    // Process the file in chunks
    for await (const chunk of fileStream) {
      buffer.push(chunk);
      currentSize += chunk.length;
      
      // If we have a full chunk or reached EOF, upload it
      if (currentSize >= chunkSize || partNumber === numParts) {
        const partBuffer = Buffer.concat(buffer);
        
        // Upload this part
        const etag = await uploadPart(uploadId, objectName, partNumber, partBuffer);
        
        // Update status
        uploadStatus.parts.push({ etag, part: partNumber });
        uploadStatus.bytesUploaded += partBuffer.length;
        
        // Call progress callback if provided
        if (progressCallback) {
          progressCallback({ ...uploadStatus });
        }
        
        // Reset buffer for next chunk
        buffer = [];
        currentSize = 0;
        partNumber++;
      }
    }
    
    // Complete the multipart upload
    return await completeMultipartUpload(uploadId, objectName, uploadStatus.parts);
    
  } catch (error) {
    console.error('Error in stream upload:', error);
    throw error;
  }
}

/**
 * Stream upload a buffer using multipart upload (for large in-memory data)
 * @param buffer The buffer to upload
 * @param objectName Name to give the object in MinIO
 * @param contentType MIME type 
 * @param chunkSize Size of each chunk in bytes (min 5MB)
 * @param progressCallback Optional callback for tracking progress
 * @returns URL of the uploaded file
 */
export async function streamUploadBuffer(
  buffer: Buffer,
  objectName: string,
  contentType: string = 'application/octet-stream',
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  progressCallback?: (status: MultipartUploadStatus) => void
): Promise<string> {
  // Ensure minimum chunk size 
  chunkSize = Math.max(chunkSize, 5 * 1024 * 1024);
  
  try {
    const fileSize = buffer.length;
    
    // For small files, use the regular upload method
    if (fileSize <= chunkSize) {
      const url = await uploadBuffer(objectName, buffer, contentType);
      return url;
    }
    
    // Initiate multipart upload
    const { uploadId, key, bucket } = await initiateMultipartUpload(objectName, contentType);
    
    // Track upload status
    const uploadStatus: MultipartUploadStatus = {
      uploadId,
      key,
      bucket,
      parts: [],
      bytesUploaded: 0,
      totalSize: fileSize
    };
    
    // Calculate number of parts needed
    const numParts = Math.ceil(fileSize / chunkSize);
    
    // Upload each chunk
    for (let partNumber = 1; partNumber <= numParts; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(partNumber * chunkSize, fileSize);
      const partBuffer = buffer.subarray(start, end);
      
      // Upload this part
      const etag = await uploadPart(uploadId, objectName, partNumber, partBuffer);
      
      // Update status
      uploadStatus.parts.push({ etag, part: partNumber });
      uploadStatus.bytesUploaded += partBuffer.length;
      
      // Call progress callback if provided
      if (progressCallback) {
        progressCallback({ ...uploadStatus });
      }
    }
    
    // Complete the multipart upload
    return await completeMultipartUpload(uploadId, objectName, uploadStatus.parts);
    
  } catch (error) {
    console.error('Error in streaming buffer upload:', error);
    throw error;
  }
}
