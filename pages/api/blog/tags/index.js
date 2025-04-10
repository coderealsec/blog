import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';

/**
 * @swagger
 * /api/blog/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve a list of all blog tags
 *     responses:
 *       200:
 *         description: A list of tags
 */
async function handleGetTags(req, res) {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
    });

    // Transform data to include post count
    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      isActive: tag.isActive,
      postCount: tag._count.posts
    }));

    return res.status(200).json(formattedTags);
  } catch (error) {
    console.error('Tags fetch error:', error);
    return res.status(500).json({ message: 'Etiketler getirilirken bir hata oluştu' });
  }
}

/**
 * Blog etiketlerini listele veya yeni etiket oluştur
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method
  if (req.method === 'GET') {
    return handleGetTags(req, res);
  } else if (req.method === 'POST') {
    // Yetkilendirme kontrolü - sadece admin kullanıcılar
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Yetkisiz erişim' 
      });
    }
    
    const { name, description, isActive = true } = req.body;
    
    // Validasyon
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Etiket adı en az 2 karakter olmalıdır' 
      });
    }
    
    // Slug oluştur
    const slug = slugify(name);
    
    // Aynı slug ile başka etiket var mı kontrol et
    const existingTag = await prisma.blogTag.findUnique({
      where: { slug }
    });
    
    if (existingTag) {
      return res.status(400).json({ 
        error: 'Bu isimde bir etiket zaten var' 
      });
    }
    
    // Yeni etiket oluştur
    const newTag = await prisma.blogTag.create({
      data: {
        name,
        slug,
        description,
        isActive: Boolean(isActive)
      }
    });
    
    return res.status(201).json(newTag);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Export handler directly
export default handler; 