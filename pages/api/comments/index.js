import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * Dashboard için yorumlar API'si
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
      const { status } = req.query;
      
      // Filtreleme koşulları
      const where = {};
      
      // Duruma göre filtreleme
      if (status === 'approved') {
        where.isApproved = true;
        where.isDeleted = false;
        where.isReported = false;
      } else if (status === 'pending') {
        where.isApproved = false;
        where.isDeleted = false;
        where.isReported = false;
      } else if (status === 'reported') {
        where.isReported = true;
        where.isDeleted = false;
      } else if (status === 'deleted') {
        where.isDeleted = true;
      }
      
      // Yorumları getir
      const comments = await prisma.comment.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true
            }
          },
          blog: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });
      
      return res.status(200).json(comments);
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Dashboard comments API error:', error);
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