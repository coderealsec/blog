import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * Dashboard için medya dosyaları API'si
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
    
    if (req.method === 'GET') {
      // Query parametreleri
      const { 
        type, 
        search,
        limit = 50,
        page = 1
      } = req.query;
      
      // Filtreleme koşulları
      const where = {};
      
      // Dosya türüne göre filtreleme
      if (type === 'image') {
        where.mimeType = { startsWith: 'image/' };
      } else if (type === 'document') {
        where.mimeType = 'application/pdf';
      }
      
      // Arama sorgusu
      if (search) {
        where.OR = [
          { filename: { contains: search, mode: 'insensitive' } },
          { altText: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Sayfalama
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Medya dosyalarını getir
      const media = await prisma.mediaFile.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit),
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      // Toplam sayıyı getir
      const total = await prisma.mediaFile.count({ where });
      
      return res.status(200).json({
        media,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
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