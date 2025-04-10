import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * Dashboard için analitik verileri API'si
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
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // İsteğe bağlı parametreler
    const { period = 'month' } = req.query;
    
    // Tarih aralığı hesaplama
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // 1. Toplam blog yazı sayısı
    const totalPosts = await prisma.blogPost.count();
    
    // 2. Yayınlanmış blog yazı sayısı
    const publishedPosts = await prisma.blogPost.count({
      where: { published: true }
    });
    
    // 3. Toplam görüntülenme sayısı
    const totalViews = await prisma.blogPost.aggregate({
      _sum: { viewCount: true }
    });
    
    // 4. Son 30 gündeki toplam yorum sayısı
    const totalComments = await prisma.comment.count({
      where: { 
        createdAt: { gte: startDate },
        isDeleted: false
      }
    });
    
    // 5. Son 30 gündeki beğeni sayısı
    const totalLikes = await prisma.blogLike.count({
      where: { createdAt: { gte: startDate } }
    });
    
    // 6. Son 12 ayın görüntülenme verileri
    const monthlyViewsData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // Bu ay içinde oluşturulan yazıların toplam görüntülenme sayısı
      const monthData = await prisma.blogPost.aggregate({
        where: {
          publishedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { viewCount: true }
      });
      
      const monthName = monthStart.toLocaleString('tr-TR', { month: 'short' });
      monthlyViewsData.push({
        name: monthName,
        views: monthData._sum.viewCount || 0
      });
    }
    
    // 7. En çok okunan blog yazıları
    const topPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        viewCount: true
      }
    });
    
    // 8. Kategori bazlı yazı sayıları
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    const categoryData = categories.map(category => ({
      name: category.name,
      value: category._count.posts
    })).sort((a, b) => b.value - a.value).slice(0, 6);
    
    // 9. Etiket bazlı yazı sayıları
    const tags = await prisma.blogTag.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    const tagData = tags.map(tag => ({
      name: tag.name,
      value: tag._count.posts
    })).sort((a, b) => b.value - a.value).slice(0, 10);
    
    // 10. Son eklenen yorumlar
    const recentComments = await prisma.comment.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        blog: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });
    
    // Önceki dönemle karşılaştırma için değişim oranları
    // Şu an için varsayılan değerler, gerçek hesaplama için ek sorgular gerekli
    const changeRates = {
      viewsChange: 12.8,
      commentsChange: 5.2,
      likesChange: 7.5,
      postsChange: 3.2
    };
    
    // Tüm istatistikleri döndür
    return res.status(200).json({
      stats: {
        totalPosts,
        publishedPosts,
        totalViews: totalViews._sum.viewCount || 0,
        totalComments,
        totalLikes
      },
      changeRates,
      monthlyViewsData,
      topPosts,
      categoryData,
      tagData,
      recentComments
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
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