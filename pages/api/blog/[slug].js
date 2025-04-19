import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

/**
 * Belirli bir blog yazısı için işlemler
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Blog yazısı ID veya slug\'ı gereklidir' });
    }
    
    // İlk olarak slug bir UUID veya CUID mi kontrol et (CUID formatını genişlettim)
    const isId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug) || 
                /^[a-z0-9]{25,}$/.test(slug); // CUID formatı için daha esnek bir kontrol
    
    // Blog yazısını getir
    let post;
    
    try {
      // Sorgu zaman aşımı olmaması için daha az ilişki ile ilk sorgu
      if (isId) {
        // ID ile ara - Sadece temel verileri getir
        post = await prisma.blogPost.findUnique({
          where: { id: slug }
        });
      } else {
        // Slug ile ara - Sadece temel verileri getir
        post = await prisma.blogPost.findUnique({
          where: { slug }
        });
      }

      // Eğer post bulunursa, ilişkili verileri ayrı sorgularla getir
      if (post) {
        // Yazar bilgilerini getir
        const author = await prisma.user.findUnique({
          where: { id: post.authorId },
          select: {
            id: true,
            name: true,
            image: true
          }
        });

        // Kategorileri getir
        const categories = await prisma.blogPostToCategory.findMany({
          where: { postId: post.id },
          include: {
            category: true
          }
        });

        // Etiketleri getir
        const tags = await prisma.blogPostToTag.findMany({
          where: { postId: post.id },
          include: {
            tag: true
          }
        });

        // Sonuç objesine ilişkisel verileri ekle
        post = {
          ...post,
          author,
          categories,
          tags
        };
      }
    } catch (error) {
      console.error('Blog post sorgu hatası:', error);
      throw new Error('Blog yazısı bilgileri alınırken veritabanı hatası oluştu.');
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Blog yazısı bulunamadı' });
    }
    
    if (req.method === 'GET') {
      try {
        // Bot olmayanlar için görüntülenme sayısını artır
        const userAgent = req.headers['user-agent'] || '';
        const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
        
        if (!isBot) {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
          });
        }
      } catch (error) {
        console.error('Görüntülenme sayacı hatası:', error);
        // Sayaç hatası olsa bile devam et
      }
      
      // Sonucu formatla
      const formattedPost = {
        ...post,
        categories: post.categories.map(pc => pc.category),
        tags: post.tags.map(pt => pt.tag)
      };
      
      // İlgili blog yazılarını getir (aynı kategorideki son 3 yazı)
      let relatedPosts = [];
      
      try {
        if (post.categories.length > 0) {
          const categoryIds = post.categories.map(pc => pc.category.id);
          
          relatedPosts = await prisma.blogPost.findMany({
            where: {
              id: { not: post.id },
              published: true,
              categories: {
                some: {
                  categoryId: { in: categoryIds }
                }
              }
            },
            orderBy: {
              publishedAt: 'desc'
            },
            take: 3,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              imageUrl: true,
              publishedAt: true
            }
          });
        }
      } catch (error) {
        console.error('İlgili yazılar sorgu hatası:', error);
        // İlgili yazılar getirilemezse boş dizi ile devam et
      }
      
      return res.status(200).json({
        post: formattedPost,
        relatedPosts
      });
      
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Yetkilendirme kontrolü - sadece admin ve editor kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      // Editor rolünün kendi yazılarını düzenleyebilmesi ve admin'in tüm yazıları düzenleyebilmesi kontrolü
      if (session.user.role === 'EDITOR' && post.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Sadece kendi yazılarınızı düzenleyebilirsiniz' });
      }
      
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
          try {
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
          } catch (error) {
            console.error('Slug kontrolü hatası:', error);
            updates.slug = `${newSlug}-${Date.now()}`; // Hata durumunda benzersiz bir slug oluştur
          }
        }
      }
      
      if (content !== undefined) {
        if (content.trim().length < 50) {
          return res.status(400).json({ error: 'İçerik en az 50 karakter olmalıdır' });
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
      }, {
        // Transaction için zaman aşımı süresini artır
        timeout: 20000 // 20 saniye
      });
      
      // Güncellenmiş yazıyı tüm ilişkileriyle birlikte getir
      const fullUpdatedPost = await prisma.blogPost.findUnique({
        where: { id: post.id },
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
      
      // Sonucu formatla
      const formattedPost = {
        ...fullUpdatedPost,
        categories: fullUpdatedPost.categories.map(pc => pc.category),
        tags: fullUpdatedPost.tags.map(pt => pt.tag)
      };
      
      return res.status(200).json(formattedPost);
      
    } else if (req.method === 'DELETE') {
      // Yetkilendirme kontrolü - sadece admin ve editor kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      // Blog yazısını kontrol et
      const post = await prisma.blogPost.findUnique({
        where: { slug }
      });
      
      if (!post) {
        return res.status(404).json({ error: 'Blog yazısı bulunamadı' });
      }
      
      // Editor rolünün kendi yazılarını silebilmesi ve admin'in tüm yazıları silebilmesi kontrolü
      if (session.user.role === 'EDITOR' && post.authorId !== session.user.id) {
        return res.status(403).json({ error: 'Sadece kendi yazılarınızı silebilirsiniz' });
      }
      
      // Yazıyı sil - Cascade sayesinde ilişkiler de silinecek
      await prisma.blogPost.delete({
        where: { id: post.id }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Blog yazısı başarıyla silindi' 
      });
      
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('Blog API hatası:', error);
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