import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * Single category API endpoint - supports GET, PUT, DELETE methods
 * GET is public, PUT and DELETE are admin-only
 */
async function handler(req, res) {
  // Get the category ID from the URL
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Kategori ID'si belirtilmedi." });
  }
  
  try {
    // Check if category exists first
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: "Kategori bulunamadı." });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        // Get category details - public access
        return handleGetCategory(res, category);
      
      case "PUT":
      case "DELETE":
        // For both PUT and DELETE, require admin access
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).json({ error: "Bu işlem için giriş yapmanız gerekiyor." });
        }
        
        if (session.user.role !== "ADMIN") {
          return res.status(403).json({ error: "Bu işlem için yetkiniz bulunmuyor." });
        }
        
        if (req.method === "PUT") {
          return await handleUpdateCategory(req, res, id);
        } else {
          return await handleDeleteCategory(res, id, category._count.posts);
        }
      
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Category API error:", error);
    return res.status(500).json({ error: "İşlem sırasında bir hata oluştu." });
  }
}

/**
 * Handle getting a single category with its blog count
 */
function handleGetCategory(res, category) {
  const formattedCategory = {
    ...category,
    blogCount: category._count.posts
  };
  
  delete formattedCategory._count;
  
  return res.status(200).json(formattedCategory);
}

/**
 * Handle updating a category
 */
async function handleUpdateCategory(req, res, id) {
  const { name, description, seoTitle, seoDescription, seoKeywords, isActive } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: "Kategori adı zorunludur." });
  }
  
  // Create slug from name if name is being changed
  const slug = createSlug(name);
  
  // Check if another category with the same name or slug exists
  const existingCategory = await prisma.blogCategory.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { slug }
      ],
      NOT: { id }
    }
  });
  
  if (existingCategory) {
    return res.status(400).json({ error: "Bu isimde veya slug'da bir kategori zaten mevcut." });
  }
  
  // Update the category
  const updatedCategory = await prisma.blogCategory.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || "",
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || "",
      seoKeywords: seoKeywords || "",
      isActive: isActive === undefined ? true : isActive
    }
  });
  
  return res.status(200).json(updatedCategory);
}

/**
 * Handle deleting a category
 */
async function handleDeleteCategory(res, id, blogCount) {
  // Check if category is being used by blogs
  if (blogCount > 0) {
    return res.status(400).json({ 
      error: "Bu kategori bloglarda kullanılıyor. Silmeden önce blogların kategorisini değiştirin."
    });
  }
  
  // Delete the category
  await prisma.blogCategory.delete({
    where: { id }
  });
  
  return res.status(200).json({ success: true, message: "Kategori başarıyla silindi." });
}

/**
 * Helper function to create a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - URL-friendly slug
 */
function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
}

// Apply rate limiting - 20 requests per minute
export default withRateLimit(handler, { interval: 60, limit: 20 }); 