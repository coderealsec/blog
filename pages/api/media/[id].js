import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import path from 'path';
import fs from 'fs/promises';

/**
 * Dashboard için belirli bir medya dosyası için işlemler
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
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Medya ID\'si gereklidir' });
    }
    
    // Medya dosyasını bul
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!mediaFile) {
      return res.status(404).json({ error: 'Medya dosyası bulunamadı' });
    }
    
    if (req.method === 'GET') {
      // Tek bir medya dosyasını getir
      return res.status(200).json(mediaFile);
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Sadece belirli alanlar güncellenebilir
      const { altText, description } = req.body;
      
      const updateData = {};
      
      if (altText !== undefined) {
        updateData.altText = altText;
      }
      
      if (description !== undefined) {
        updateData.description = description;
      }
      
      // Medya dosyasını güncelle
      const updatedMedia = await prisma.mediaFile.update({
        where: { id },
        data: updateData,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      return res.status(200).json(updatedMedia);
      
    } else if (req.method === 'DELETE') {
      // Dosyayı physical olarak sil
      try {
        const filePath = path.join(process.cwd(), 'public', mediaFile.filePath);
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Dosya sisteminden silinirken hata:', error);
        // Fiziksel silme hatası DB'den silmeyi etkilememeli
      }
      
      // Medya dosyasını veritabanından sil
      await prisma.mediaFile.delete({
        where: { id }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Medya dosyası başarıyla silindi' 
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Media API error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: error.message 
    });
  }
}

// Rate limit ile API handler'ı sar
export default withRateLimit(handler, {
  interval: 60, // 1 dakika
  limit: 30 // Dakikada 30 istek
}); 