import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * Categories API endpoint for handling category collection operations
 * Supports GET (list categories) and POST (create category) methods
 * POST is admin-only, GET is public
 */
async function handler(req, res) {
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        // List categories - public access
        await handleGetCategories(req, res);
        break;
        
      case "POST":
        // Create category - admin only
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).json({ error: "Bu işlem için giriş yapmanız gerekiyor." });
        }
        
        if (session.user.role !== "ADMIN") {
          return res.status(403).json({ error: "Bu işlem için yetkiniz bulunmuyor." });
        }
        
        await handleCreateCategory(req, res);
        break;
        
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Category API error:", error);
    return res.status(500).json({ error: "İşlem sırasında bir hata oluştu." });
  }
}

/**
 * Handle getting all categories
 */
async function handleGetCategories(req, res) {
  // Get all categories with blog count
  const categories = await prisma.blogCategory.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  // Format categories to include blog count
  const formattedCategories = categories.map(category => ({
    ...category,
    blogCount: category._count.posts
  }));
  
  return res.status(200).json(formattedCategories);
}

/**
 * Handle creating a new category
 */
async function handleCreateCategory(req, res) {
  const { name, description, seoTitle, seoDescription, seoKeywords } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: "Kategori adı zorunludur." });
  }
  
  // Create slug from name
  const slug = createSlug(name);
  
  // Check if category already exists
  const existingCategory = await prisma.blogCategory.findFirst({
    where: { 
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        { slug }
      ]
    }
  });
  
  if (existingCategory) {
    return res.status(400).json({ error: "Bu isimde veya slug'da bir kategori zaten mevcut." });
  }
  
  // Create the category
  const category = await prisma.blogCategory.create({
    data: {
      name,
      slug,
      description: description || "",
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || "",
      seoKeywords: seoKeywords || ""
    }
  });
  
  return res.status(201).json(category);
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