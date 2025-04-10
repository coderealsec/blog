import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Geçersiz dosya türü. Sadece resim ve PDF dosyaları yüklenebilir.'), false);
    }
  },
});

// Middleware to handle file upload
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// API Route Config - disable body parser since we're using multer
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Medya dosyası yükleme API'si
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    // Yetkilendirme kontrolü - sadece admin ve editor kullanıcılar
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // Multer middleware'i çalıştır
    await runMiddleware(req, res, upload.array('files', 10));
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenemedi. Lütfen geçerli bir dosya seçin.' });
    }
    
    // Uploads klasörünü oluştur (eğer yoksa)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Uploads directory creation error:', error);
    }
    
    // Dosyaları kaydet ve veritabanına ekle
    const uploadResults = [];
    
    for (const file of req.files) {
      try {
        // Dosya adını oluştur
        const fileExtension = path.extname(file.originalname);
        const safeFileName = file.originalname
          .replace(fileExtension, '')
          .replace(/[^a-zA-Z0-9]/g, '-')
          .toLowerCase();
        const uniqueFileName = `${safeFileName}-${nanoid(8)}${fileExtension}`;
        
        // Dosya yolu
        const relativePath = `/uploads/${uniqueFileName}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        // Dosyayı kaydet
        await fs.writeFile(filePath, file.buffer);
        
        // Dosya türünü belirle
        let fileType = 'document';
        let width = null;
        let height = null;
        
        if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
          // İmage boyutları buraya eklenebilir
          // Opsiyonel: sharp.js gibi bir kütüphane ile resim boyutları alınabilir
        }
        
        // MediaFile kaydını oluştur
        const mediaFile = await prisma.mediaFile.create({
          data: {
            fileName: file.originalname,
            filePath: relativePath,
            fileUrl: relativePath,
            fileType,
            mimeType: file.mimetype,
            fileSize: file.size,
            width,
            height,
            altText: safeFileName.replace(/-/g, ' '),
            uploadedBy: {
              connect: { id: session.user.id }
            }
          }
        });
        
        uploadResults.push(mediaFile);
        
      } catch (error) {
        console.error('File upload error:', error);
        uploadResults.push({
          error: true,
          originalname: file.originalname,
          message: error.message
        });
      }
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Dosyalar başarıyla yüklendi',
      files: uploadResults
    });
    
  } catch (error) {
    console.error('Media upload API error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: error.message 
    });
  }
}

// Rate limit ile API handler'ı sar
export default withRateLimit(handler, {
  interval: 60, // 1 dakika
  limit: 10 // Dakikada 10 istek
}); 