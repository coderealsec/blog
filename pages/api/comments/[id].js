import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * Dashboard için belirli bir yorum için işlemler
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
      return res.status(400).json({ error: 'Yorum ID\'si gereklidir' });
    }
    
    // Yorumu bul
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
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
    
    if (!comment) {
      return res.status(404).json({ error: 'Yorum bulunamadı' });
    }
    
    if (req.method === 'GET') {
      // Tek bir yorumu getir
      return res.status(200).json(comment);
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      const { content, isApproved, isReported, isDeleted, status } = req.body;
      
      // Güncelleme verisi
      const updateData = {};
      
      // Normal güncelleme (PUT ya da tek alan PATCH)
      if (content !== undefined) {
        if (content.trim().length < 2) {
          return res.status(400).json({ error: 'Yorum içeriği en az 2 karakter olmalıdır' });
        }
        updateData.content = content.trim();
      }
      
      if (isApproved !== undefined) {
        updateData.isApproved = Boolean(isApproved);
      }
      
      if (isReported !== undefined) {
        updateData.isReported = Boolean(isReported);
      }
      
      if (isDeleted !== undefined) {
        updateData.isDeleted = Boolean(isDeleted);
      }
      
      // Durum değişikliği için shorthand (PATCH)
      if (status) {
        switch (status) {
          case 'approve':
            updateData.isApproved = true;
            updateData.isReported = false;
            break;
          case 'reject':
            updateData.isApproved = false;
            break;
          case 'delete':
            updateData.isDeleted = true;
            break;
          case 'restore':
            updateData.isDeleted = false;
            break;
          case 'unreport':
            updateData.isReported = false;
            break;
          default:
            // Tanınmayan durum
            return res.status(400).json({ error: 'Geçersiz durum değeri' });
        }
      }
      
      // Yorumu güncelle
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
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
      
      return res.status(200).json(updatedComment);
      
    } else if (req.method === 'DELETE') {
      // Admin için kalıcı silme / Düzenleyici için işaretli silme
      if (session.user.role === 'ADMIN' && req.query.permanent === 'true') {
        // Kalıcı silme
        await prisma.comment.delete({
          where: { id }
        });
      } else {
        // İşaretli silme
        await prisma.comment.update({
          where: { id },
          data: { isDeleted: true }
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Yorum başarıyla silindi' 
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Dashboard comment API error:', error);
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