import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { uploadFile } from '@/lib/storage';
import { isValidImage } from '@/lib/utils';
import formidable from 'formidable';
import fs from 'fs';

// formidable için body parsing devre dışı bırak
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Görsel yükleme API endpoint'i
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // Yetkilendirme kontrolü - sadece giriş yapmış kullanıcılar
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }
    
    // Formidable ile formu parse et
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: false,
    });
    
    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parse hatası:', err);
          res.status(500).json({ error: 'Dosya yükleme hatası', message: err.message });
          return resolve();
        }
        
        const file = files.file;
        
        if (!file) {
          res.status(400).json({ error: 'Dosya bulunamadı' });
          return resolve();
        }
        
        // Dosya geçerliliğini kontrol et
        if (!isValidImage(file)) {
          res.status(400).json({ 
            error: 'Geçersiz dosya türü', 
            message: 'Sadece JPEG, PNG, GIF ve WebP dosyaları yüklenebilir' 
          });
          return resolve();
        }
        
        try {
          // Dosya içeriğini oku
          const fileData = await fs.promises.readFile(file.filepath);
          
          // Dosyayı Cloudflare R2'ye yükle
          let folder = 'blog';
          if (fields.folder && typeof fields.folder === 'string') {
            folder = fields.folder;
          }
          
          const result = await uploadFile(fileData, file.originalFilename, folder);
          
          if (!result.success) {
            res.status(500).json({ error: 'Dosya yükleme hatası', message: result.error });
            return resolve();
          }
          
          // Başarılı yanıt
          res.status(200).json({
            success: true,
            file: {
              url: result.url,
              key: result.key,
              name: result.filename,
              size: result.size,
              type: file.mimetype
            }
          });
          return resolve();
          
        } catch (error) {
          console.error('Dosya yükleme hatası:', error);
          res.status(500).json({ error: 'Dosya yükleme hatası', message: error.message });
          return resolve();
        } finally {
          // Geçici dosyayı temizle
          fs.promises.unlink(file.filepath).catch(console.error);
        }
      });
    });
    
  } catch (error) {
    console.error('Yükleme API hatası:', error);
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