import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

/**
 * Belirli bir etiket için işlemler
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Etiket slug\'ı gereklidir' });
    }
    
    // Etiketi bul
    const tag = await prisma.blogTag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });
    
    if (!tag) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    if (req.method === 'GET') {
      // Etiketi döndür
      return res.status(200).json(tag);
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Yetkilendirme kontrolü - sadece admin kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      const { name, description, isActive } = req.body;
      
      // Sadece isActive güncellemesi yapılıyorsa ve name verilmemişse
      const isOnlyStatusUpdate = isActive !== undefined && !name;
      
      // Normal validasyon (isActive dışında güncelleme varsa)
      if (!isOnlyStatusUpdate && (!name || name.trim().length < 2)) {
        return res.status(400).json({ error: 'Etiket adı en az 2 karakter olmalıdır' });
      }
      
      // Data nesnesi oluştur
      let updateData = {};
      
      // isActive varsa ekle
      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
      }
      
      // Description varsa ekle
      if (description !== undefined) {
        updateData.description = description;
      }
      
      // Eğer name varsa, slug kontrolü ve diğer işlemleri yap
      if (name) {
        const newSlug = slugify(name);
        
        if (newSlug !== slug) {
          // Aynı slug ile başka etiket var mı kontrol et
          const existingTag = await prisma.blogTag.findFirst({
            where: {
              slug: newSlug,
              id: { not: tag.id }
            }
          });
          
          if (existingTag) {
            return res.status(400).json({ error: 'Bu isimde bir etiket zaten var' });
          }
        }
        
        // Name ve slug'ı updateData'ya ekle
        updateData.name = name;
        updateData.slug = newSlug;
      }
      
      // Etiketi güncelle
      const updatedTag = await prisma.blogTag.update({
        where: { id: tag.id },
        data: updateData
      });
      
      return res.status(200).json(updatedTag);
      
    } else if (req.method === 'DELETE') {
      // Yetkilendirme kontrolü - sadece admin kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      // İlişkili blog yazılarını kontrol et
      const postCount = tag._count.posts;
      
      if (postCount > 0) {
        return res.status(400).json({ 
          error: 'Bu etiket silinemiyor', 
          message: `Bu etikete bağlı ${postCount} blog yazısı var. Önce bu ilişkileri kaldırın.` 
        });
      }
      
      // Etiketi sil
      await prisma.blogTag.delete({
        where: { id: tag.id }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Etiket başarıyla silindi' 
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Etiket API hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: error.message 
    });
  }
}

// Export handler directly
export default handler; 