import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { getMimeType } from './utils';

// Cloudflare R2 Storage client
const r2Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

/**
 * Dosya yükleme
 * @param {Buffer} fileBuffer - Dosya içeriği
 * @param {string} originalFilename - Orijinal dosya adı
 * @param {string} folder - Klasör yolu (opsiyonel)
 * @returns {Promise<Object>} Yükleme sonucu
 */
export async function uploadFile(fileBuffer, originalFilename, folder = 'uploads') {
  try {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalFilename.split('.').pop();
    
    // Benzersiz bir dosya adı oluştur
    const key = `${folder}/${timestamp}-${randomString}.${extension}`;
    
    // Dosyayı yükle
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: getMimeType(extension),
    });
    
    await r2Client.send(command);
    
    // Dosyanın URL'ini oluştur
    const fileUrl = `${publicUrl}/${key}`;
    
    return {
      success: true,
      url: fileUrl,
      key: key,
      size: fileBuffer.length,
      filename: originalFilename,
      extension: extension,
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Dosya silme
 * @param {string} key - Dosya anahtarı
 * @returns {Promise<Object>} Silme sonucu
 */
export async function deleteFile(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await r2Client.send(command);
    
    return {
      success: true,
      message: 'Dosya başarıyla silindi',
    };
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Dosya için imzalı URL oluşturma
 * @param {string} key - Dosya anahtarı
 * @param {number} expiresIn - Geçerlilik süresi (saniye)
 * @returns {Promise<string>} İmzalı URL
 */
export async function getSignedFileUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('İmzalı URL oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Dosya URL'sini oluşturma
 * @param {string} key - Dosya anahtarı
 * @returns {string} Dosya URL'si
 */
export function getFileUrl(key) {
  return `${publicUrl}/${key}`;
} 