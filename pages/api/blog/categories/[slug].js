import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

/**
 * Belirli bir kategori için işlemler
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Kategori slug\'ı gereklidir' });
    }
    
    // Kategoriyi bul - slug ya da ID olabilir
    let category;
    
    // Eğer slug bir UUID gibi görünüyorsa (ID olabilir) önce ID ile deneyelim
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
    
    if (isUuid) {
      category = await prisma.blogCategory.findUnique({
        where: { id: slug },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
    }
    
    // ID ile bulunamadıysa veya UUID formatında değilse, slug ile deneyelim
    if (!category) {
      category = await prisma.blogCategory.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    if (req.method === 'GET') {
      // Kategoriyi döndür
      return res.status(200).json(category);
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Yetkilendirme kontrolü - sadece admin kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      const { name, description, isActive } = req.body;
      
      // Validasyon
      if (name && name.trim().length < 2) {
        return res.status(400).json({ error: 'Kategori adı en az 2 karakter olmalıdır' });
      }
      
      // Güncellenecek veriler
      const updateData = {};
      
      // Slug değişiyorsa, yeni slug'ın benzersiz olup olmadığını kontrol et
      if (name && name !== category.name) {
        const newSlug = slugify(name);
        
        // Aynı slug ile başka kategori var mı kontrol et (bu kategori hariç)
        const existingCategory = await prisma.blogCategory.findFirst({
          where: {
            slug: newSlug,
            id: { not: category.id }
          }
        });
        
        if (existingCategory) {
          return res.status(400).json({ error: 'Bu isimde bir kategori zaten var' });
        }
        
        updateData.name = name;
        updateData.slug = newSlug;
      }
      
      // Diğer alanları kontrol et ve güncelleme verisine ekle
      if (name && !updateData.name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      try {
        // Kategoriyi güncelle
        const updatedCategory = await prisma.blogCategory.update({
          where: { id: category.id },
          data: updateData
        });
        
        return res.status(200).json(updatedCategory);
      } catch (updateError) {
        console.error('Kategori güncelleme hatası:', updateError);
        return res.status(400).json({ 
          error: 'Kategori güncellenemedi', 
          message: updateError.message 
        });
      }
      
    } else if (req.method === 'DELETE') {
      // Yetkilendirme kontrolü - sadece admin kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      // İlişkili blog yazılarını kontrol et
      const postCount = category._count.posts;
      
      if (postCount > 0) {
        return res.status(400).json({ 
          error: 'Bu kategori silinemiyor', 
          message: `Bu kategoriye bağlı ${postCount} blog yazısı var. Önce bu ilişkileri kaldırın.` 
        });
      }
      
      // Kategoriyi sil
      await prisma.blogCategory.delete({
        where: { id: category.id }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Kategori başarıyla silindi' 
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Kategori API hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: error.message 
    });
  }
}

// Export handler directly
export default handler; 