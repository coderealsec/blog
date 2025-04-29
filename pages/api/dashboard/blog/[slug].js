import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

/**
 * Dashboard için belirli bir blog yazısı için işlemler
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
    
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Blog yazısı ID veya slug\'ı gereklidir' });
    }
    
    // İlk olarak slug bir UUID mi kontrol et
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug) || 
                  /^[a-z0-9]{25,}$/.test(slug); // CUID formatı için daha esnek bir kontrol
    
    // Blog yazısını bul - ID veya slug ile
    let post;
    
    if (isUuid) {
      // ID ile ara
      post = await prisma.blogPost.findUnique({
        where: { id: slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    }
    
    // ID ile bulunamadıysa veya ID değilse, slug ile ara
    if (!post) {
      post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Blog yazısı bulunamadı' });
    }
    
    // Editor rolünün kendi yazılarını düzenleyebilmesi ve admin'in tüm yazıları düzenleyebilmesi kontrolü
    if (session.user.role === 'EDITOR' && post.authorId !== session.user.id) {
      return res.status(403).json({ error: 'Sadece kendi yazılarınızı düzenleyebilirsiniz' });
    }
    
    if (req.method === 'GET') {
      // Sonucu formatla
      const formattedPost = {
        ...post,
        categories: post.categories.map(pc => pc.category),
        tags: post.tags.map(pt => pt.tag)
      };
      
      return res.status(200).json({
        post: formattedPost
      });
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      const { 
        title, 
        content, 
        excerpt, 
        imageUrl, 
        published, 
        publishedAt, 
        seoTitle, 
        seoDescription, 
        seoKeywords,
        categories = [],
        tags = []
      } = req.body;
      
      // Validasyon
      const updates = {};
      
      if (title !== undefined) {
        if (title.trim().length < 5) {
          return res.status(400).json({ error: 'Başlık en az 5 karakter olmalıdır' });
        }
        updates.title = title;
        
        // Slug güncellemesi
        if (title !== post.title) {
          const newSlug = slugify(title);
          
          // Aynı slug'a sahip başka bir yazı var mı kontrol et
          const existingPost = await prisma.blogPost.findFirst({
            where: {
              slug: newSlug,
              id: { not: post.id }
            }
          });
          
          if (existingPost) {
            updates.slug = `${newSlug}-${Math.floor(Math.random() * 1000)}`;
          } else {
            updates.slug = newSlug;
          }
        }
      }
      
      if (content !== undefined) {
        if (content.trim().length < 10) {
          return res.status(400).json({ error: 'İçerik en az 10 karakter olmalıdır' });
        }
        updates.content = content;
      }
      
      if (excerpt !== undefined) {
        if (excerpt.trim().length > 0 && (excerpt.trim().length < 10 || excerpt.trim().length > 300)) {
          return res.status(400).json({ error: 'Özet 10-300 karakter arasında olmalıdır' });
        }
        updates.excerpt = excerpt || null;
      }
      
      if (imageUrl !== undefined) {
        updates.imageUrl = imageUrl || null;
      }
      
      if (published !== undefined) {
        updates.published = Boolean(published);
        
        // Eğer yazı yayınlanıyorsa ve daha önce yayınlanmadıysa, yayın tarihini şimdi olarak ayarla
        if (published && !post.publishedAt) {
          updates.publishedAt = new Date();
        }
      }
      
      if (publishedAt !== undefined) {
        updates.publishedAt = publishedAt ? new Date(publishedAt) : null;
      }
      
      if (seoTitle !== undefined) {
        updates.seoTitle = seoTitle || null;
      }
      
      if (seoDescription !== undefined) {
        updates.seoDescription = seoDescription || null;
      }
      
      if (seoKeywords !== undefined) {
        updates.seoKeywords = seoKeywords || null;
      }
      
      // Kategori ve etiket güncellemeleri için transaction oluştur
      const updatedPost = await prisma.$transaction(async (tx) => {
        // Önce yazıyı güncelle
        const updated = await tx.blogPost.update({
          where: { id: post.id },
          data: updates
        });
        
        // Kategori ilişkilerini güncelle
        if (categories.length > 0) {
          // Mevcut ilişkileri sil
          await tx.blogPostToCategory.deleteMany({
            where: { postId: post.id }
          });
          
          // Yeni ilişkileri ekle
          await tx.blogPostToCategory.createMany({
            data: categories.map(categoryId => ({
              postId: post.id,
              categoryId
            }))
          });
        }
        
        // Etiket ilişkilerini güncelle
        if (tags.length > 0) {
          // Mevcut ilişkileri sil
          await tx.blogPostToTag.deleteMany({
            where: { postId: post.id }
          });
          
          // Yeni ilişkileri ekle
          await tx.blogPostToTag.createMany({
            data: tags.map(tagId => ({
              postId: post.id,
              tagId
            }))
          });
        }
        
        return updated;
      });
      
      return res.status(200).json({
        post: updatedPost,
        message: 'Blog yazısı başarıyla güncellendi'
      });
      
    } else if (req.method === 'DELETE') {
      // İlişkileri sil ve yazıyı sil (transaction ile)
      await prisma.$transaction([
        // İlgili yorumları sil
        prisma.comment.deleteMany({
          where: { blogId: post.id }
        }),
        
        // İlgili beğenileri sil
        prisma.blogLike.deleteMany({
          where: { blogId: post.id }
        }),
        
        // İlgili yer imlerini sil
        prisma.blogBookmark.deleteMany({
          where: { blogId: post.id }
        }),
        
        // Kategori ilişkilerini sil
        prisma.blogPostToCategory.deleteMany({
          where: { postId: post.id }
        }),
        
        // Etiket ilişkilerini sil
        prisma.blogPostToTag.deleteMany({
          where: { postId: post.id }
        }),
        
        // Blog yazısını sil
        prisma.blogPost.delete({
          where: { id: post.id }
        })
      ]);
      
      return res.status(200).json({
        success: true,
        message: 'Blog yazısı başarıyla silindi'
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Dashboard Blog API hatası:', error);
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