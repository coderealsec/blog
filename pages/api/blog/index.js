import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

/**
 * Blog yazılarını listele veya yeni blog yazısı oluştur
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Query parametreleri
      const { 
        page = 1, 
        limit = 10, 
        published, 
        category, 
        tag, 
        search,
        orderBy = 'publishedAt',
        order = 'desc'
      } = req.query;
      
      // Filtreleme koşulları
      const where = {};
      
      // Yayınlanma durumu
      if (published !== undefined) {
        where.published = published === 'true';
      } else {
        where.published = true; // Varsayılan olarak sadece yayınlanmış yazılar
      }
      
      // Arama sorgusu
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Kategori filtresi
      let categoryFilter = undefined;
      if (category) {
        categoryFilter = {
          categories: {
            some: {
              category: {
                slug: category
              }
            }
          }
        };
      }
      
      // Etiket filtresi
      let tagFilter = undefined;
      if (tag) {
        tagFilter = {
          tags: {
            some: {
              tag: {
                slug: tag
              }
            }
          }
        };
      }
      
      // Tüm filtreleri birleştir
      const finalWhere = {
        ...where,
        ...(categoryFilter || {}),
        ...(tagFilter || {})
      };
      
      // Sıralama seçenekleri
      const validOrderFields = ['publishedAt', 'createdAt', 'title', 'viewCount'];
      const validOrderDirections = ['asc', 'desc'];
      
      const orderField = validOrderFields.includes(orderBy) ? orderBy : 'publishedAt';
      const orderDirection = validOrderDirections.includes(order) ? order : 'desc';
      
      // Sayfalama
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Yazıları say
      const totalCount = await prisma.blogPost.count({
        where: finalWhere
      });
      
      // Yazıları getir
      const posts = await prisma.blogPost.findMany({
        where: finalWhere,
        orderBy: {
          [orderField]: orderDirection
        },
        skip,
        take: limitNum,
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
      
      // Sonuçları formatla
      const formattedPosts = posts.map(post => ({
        ...post,
        categories: post.categories.map(pc => pc.category),
        tags: post.tags.map(pt => pt.tag)
      }));
      
      // Sayfalama bilgilerini hesapla
      const totalPages = Math.ceil(totalCount / limitNum);
      
      // Sonuçları döndür
      return res.status(200).json({
        posts: formattedPosts,
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasMore: pageNum < totalPages
        }
      });
      
    } else if (req.method === 'POST') {
      // Yetkilendirme kontrolü - sadece admin ve editor kullanıcılar
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
        return res.status(403).json({ 
          error: 'Yetkisiz erişim' 
        });
      }
      
      const { 
        title, 
        content, 
        excerpt, 
        imageUrl, 
        published = false, 
        publishedAt, 
        seoTitle, 
        seoDescription, 
        seoKeywords,
        categories = [],
        tags = []
      } = req.body;
      
      // Validasyon
      if (!title || title.trim().length < 5) {
        return res.status(400).json({ 
          error: 'Başlık en az 5 karakter olmalıdır' 
        });
      }
      
      if (!content || content.trim().length < 50) {
        return res.status(400).json({ 
          error: 'İçerik en az 50 karakter olmalıdır' 
        });
      }
      
      if (excerpt && (excerpt.trim().length < 10 || excerpt.trim().length > 300)) {
        return res.status(400).json({ 
          error: 'Özet 10-300 karakter arasında olmalıdır' 
        });
      }
      
      // Slug oluştur
      let slug = slugify(title);
      
      // Aynı slug ile blog yazısı var mı kontrol et
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug }
      });
      
      // Eğer aynı slug'a sahip yazı varsa, slug'a rastgele bir numara ekle
      if (existingPost) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
      
      // Yeni blog yazısı oluştur
      const newPost = await prisma.blogPost.create({
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || undefined,
          imageUrl: imageUrl || undefined,
          published: Boolean(published),
          publishedAt: publishedAt ? new Date(publishedAt) : published ? new Date() : null,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          seoKeywords: seoKeywords || undefined,
          authorId: session.user.id,
          categories: {
            create: categories.map(categoryId => ({
              category: {
                connect: { id: categoryId }
              }
            }))
          },
          tags: {
            create: tags.map(tagId => ({
              tag: {
                connect: { id: tagId }
              }
            }))
          }
        },
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
        ...newPost,
        categories: newPost.categories.map(pc => pc.category),
        tags: newPost.tags.map(pt => pt.tag)
      };
      
      return res.status(201).json(formattedPost);
      
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