import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * Handle GET, PUT, PATCH, DELETE requests for a single category
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Kategori slug\'ı belirtilmedi' });
  }
  
  try {
    if (req.method === 'GET') {
      return await handleGetCategory(req, res, slug);
    } else if (req.method === 'PUT') {
      // Yetkilendirme kontrolü
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      return await handleUpdateCategory(req, res, slug);
    } else if (req.method === 'PATCH') {
      // Yetkilendirme kontrolü
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      return await handlePatchCategory(req, res, slug);
    } else if (req.method === 'DELETE') {
      // Yetkilendirme kontrolü
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Yetkisiz erişim' });
      }
      
      return await handleDeleteCategory(req, res, slug);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Category API error:', error);
    return res.status(500).json({ error: 'Kategori işlemi sırasında bir hata oluştu' });
  }
}

/**
 * Get a category by slug
 */
async function handleGetCategory(req, res, slug) {
  // Find the category
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    }
  });
  
  if (!category) {
    return res.status(404).json({ error: 'Kategori bulunamadı' });
  }
  
  // Format the response
  const formattedCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    postCount: category._count.posts,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
  
  return res.status(200).json(formattedCategory);
}

/**
 * Update a category (replace all fields)
 */
async function handleUpdateCategory(req, res, slug) {
  const { name, description, isActive } = req.body;
  
  // Basic validation
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Kategori adı en az 2 karakter olmalıdır' });
  }
  
  // Check if category exists
  const existingCategory = await prisma.blogCategory.findUnique({
    where: { slug }
  });
  
  if (!existingCategory) {
    return res.status(404).json({ error: 'Kategori bulunamadı' });
  }
  
  // Check if new name would create a duplicate slug
  if (name !== existingCategory.name) {
    const newSlug = slugify(name);
    const duplicateCategory = await prisma.blogCategory.findUnique({
      where: { slug: newSlug }
    });
    
    if (duplicateCategory && duplicateCategory.id !== existingCategory.id) {
      return res.status(400).json({ error: 'Bu isimde bir kategori zaten var' });
    }
  }
  
  // Update the category
  const updatedCategory = await prisma.blogCategory.update({
    where: { id: existingCategory.id },
    data: {
      name,
      description,
      isActive: isActive !== undefined ? Boolean(isActive) : existingCategory.isActive
    }
  });
  
  return res.status(200).json(updatedCategory);
}

/**
 * Partially update a category (update only provided fields)
 */
async function handlePatchCategory(req, res, slug) {
  const { name, description, isActive } = req.body;
  
  // Check if category exists
  const existingCategory = await prisma.blogCategory.findUnique({
    where: { slug }
  });
  
  if (!existingCategory) {
    return res.status(404).json({ error: 'Kategori bulunamadı' });
  }
  
  // Check if new name would create a duplicate slug
  if (name && name !== existingCategory.name) {
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Kategori adı en az 2 karakter olmalıdır' });
    }
    
    const newSlug = slugify(name);
    const duplicateCategory = await prisma.blogCategory.findUnique({
      where: { slug: newSlug }
    });
    
    if (duplicateCategory && duplicateCategory.id !== existingCategory.id) {
      return res.status(400).json({ error: 'Bu isimde bir kategori zaten var' });
    }
  }
  
  // Create update data object with only provided fields
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  
  // Update the category
  const updatedCategory = await prisma.blogCategory.update({
    where: { id: existingCategory.id },
    data: updateData
  });
  
  return res.status(200).json(updatedCategory);
}

/**
 * Delete a category
 */
async function handleDeleteCategory(req, res, slug) {
  // Check if category exists
  const existingCategory = await prisma.blogCategory.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    }
  });
  
  if (!existingCategory) {
    return res.status(404).json({ error: 'Kategori bulunamadı' });
  }
  
  // Prevent deletion if category has posts
  if (existingCategory._count.posts > 0) {
    return res.status(400).json({ 
      error: 'Bu kategori blog yazıları ile ilişkilendirilmiş. Silmeden önce yazıları başka bir kategoriye taşıyın veya kategoriden çıkarın.'
    });
  }
  
  // Delete the category
  await prisma.blogCategory.delete({
    where: { id: existingCategory.id }
  });
  
  return res.status(200).json({ success: true, message: 'Kategori başarıyla silindi' });
}

// Apply rate limiting with higher limits for categories
export default withRateLimit(handler, { 
  interval: 60, 
  limit: 30  // Increase limit to 30 requests per minute
}); 