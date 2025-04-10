import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

/**
 * Blog API endpoint for handling individual blog operations
 * Supports GET, PUT, PATCH, DELETE methods
 * Protected by authentication and rate limiting
 */
async function handler(req, res) {
  // Get the session to check authentication
  const session = await getServerSession(req, res, authOptions);
  
  // Check if the user is authenticated
  if (!session) {
    return res.status(401).json({ error: "Bu işlemi gerçekleştirmek için oturum açmanız gerekiyor." });
  }
  
  // Get blog ID from the URL
  const { id } = req.query;
  
  // Validate blog ID
  if (!id) {
    return res.status(400).json({ error: "Geçersiz blog ID." });
  }
  
  try {
    // Check if blog exists
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!blog) {
      return res.status(404).json({ error: "Blog bulunamadı." });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        // Return blog details
        return res.status(200).json(blog);
        
      case "PUT":
        // Update blog content
        await handleBlogUpdate(req, res, blog, session);
        break;
        
      case "PATCH":
        // Update blog status
        await handleStatusUpdate(req, res, blog, session);
        break;
        
      case "DELETE":
        // Delete blog
        await handleBlogDelete(req, res, blog, session);
        break;
        
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Blog API error:", error);
    return res.status(500).json({ error: "İşlem sırasında bir hata oluştu." });
  }
}

/**
 * Handle blog content update
 */
async function handleBlogUpdate(req, res, blog, session) {
  // Check if user is the author or an admin
  if (blog.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Bu blogu düzenleme yetkiniz yok." });
  }
  
  const { title, content, summary, categoryId, published, tags } = req.body;
  
  // Validate required fields
  if (!title || !content || !summary || !categoryId) {
    return res.status(400).json({ error: "Başlık, içerik, özet ve kategori zorunludur." });
  }
  
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: parseInt(categoryId) }
  });
  
  if (!categoryExists) {
    return res.status(400).json({ error: "Belirtilen kategori bulunamadı." });
  }
  
  // Update blog
  const updatedBlog = await prisma.blogPost.update({
    where: { id: blog.id },
    data: {
      title,
      content,
      summary,
      categoryId: parseInt(categoryId),
      published: published !== undefined ? published : blog.published,
      updatedAt: new Date()
    }
  });
  
  // Handle tags if provided
  if (tags && Array.isArray(tags)) {
    // Delete existing tag relationships
    await prisma.blogTag.deleteMany({
      where: { blogId: blog.id }
    });
    
    // Add new tags
    const tagPromises = tags.map(async (tag) => {
      // Find or create tag
      const existingTag = await prisma.tag.findFirst({
        where: { name: tag.toLowerCase() }
      });
      
      const tagId = existingTag 
        ? existingTag.id 
        : (await prisma.tag.create({ data: { name: tag.toLowerCase() } })).id;
      
      // Create blog-tag relation
      return prisma.blogTag.create({
        data: {
          blogId: blog.id,
          tagId
        }
      });
    });
    
    await Promise.all(tagPromises);
  }
  
  return res.status(200).json(updatedBlog);
}

/**
 * Handle blog status update
 */
async function handleStatusUpdate(req, res, blog, session) {
  // Check if user is the author or an admin
  if (blog.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Bu blogun durumunu değiştirme yetkiniz yok." });
  }
  
  const { published } = req.body;
  
  // Validate published status
  if (published === undefined) {
    return res.status(400).json({ error: "Yayın durumu (published) belirtilmelidir." });
  }
  
  // Update blog status
  const updatedBlog = await prisma.blogPost.update({
    where: { id: blog.id },
    data: {
      published: !!published,
      updatedAt: new Date()
    }
  });
  
  return res.status(200).json(updatedBlog);
}

/**
 * Handle blog deletion
 */
async function handleBlogDelete(req, res, blog, session) {
  // Check if user is the author or an admin
  if (blog.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Bu blogu silme yetkiniz yok." });
  }
  
  // Delete all related blog tags first
  await prisma.blogTag.deleteMany({
    where: { blogId: blog.id }
  });
  
  // Delete blog comments
  await prisma.comment.deleteMany({
    where: { blogId: blog.id }
  });
  
  // Delete the blog
  await prisma.blogPost.delete({
    where: { id: blog.id }
  });
  
  return res.status(200).json({ success: true, message: "Blog başarıyla silindi." });
}

// Apply rate limiting - 20 requests per minute
export default withRateLimit(handler, { interval: 60, limit: 20 }); 