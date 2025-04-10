import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

/**
 * @swagger
 * /api/blog/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all blog categories
 *     responses:
 *       200:
 *         description: A list of categories
 */
async function handleGetCategories(req, res) {
  try {
    const categories = await prisma.blogCategory.findMany({
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
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      postCount: category._count.posts
    }));

    return res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return res.status(500).json({ message: 'Kategoriler getirilirken bir hata oluştu' });
  }
}

/**
 * Blog kategorilerini listele veya yeni kategori oluştur
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method
  if (req.method === 'GET') {
    return handleGetCategories(req, res);
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
        error: 'Kategori adı en az 2 karakter olmalıdır' 
      });
    }
    
    // Slug oluştur
    const slug = slugify(name);
    
    // Aynı slug ile başka kategori var mı kontrol et
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Bu isimde bir kategori zaten var' 
      });
    }
    
    // Yeni kategori oluştur
    const newCategory = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        isActive: Boolean(isActive)
      }
    });
    
    return res.status(201).json(newCategory);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Export handler directly
export default handler; 