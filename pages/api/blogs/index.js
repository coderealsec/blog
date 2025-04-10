import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

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

/**
 * Blog API endpoint for handling blog collection operations
 * Supports GET (list blogs) and POST (create blog) methods
 * Protected by authentication and rate limiting
 */
async function handler(req, res) {
  // Get the session to check authentication
  const session = await getServerSession(req, res, authOptions);
  
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        // List blogs
        await handleGetBlogs(req, res, session);
        break;
        
      case "POST":
        // Create a new blog
        if (!session) {
          return res.status(401).json({ error: "Blog oluşturmak için oturum açmanız gerekiyor." });
        }
        await handleCreateBlog(req, res, session);
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
 * Handle getting a list of blogs with filtering and pagination
 */
async function handleGetBlogs(req, res, session) {
  const { 
    page = 1, 
    limit = 10, 
    categoryId, 
    authorId, 
    tag, 
    search,
    published = true 
  } = req.query;
  
  // Parse pagination parameters
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;
  
  // Build filter conditions
  const where = {};
  
  // Only show published blogs to public users
  // Admins and authors can see their own unpublished blogs
  if (published === "true" || published === true) {
    where.published = true;
  } else if (session) {
    if (session.user.role === "ADMIN") {
      // Admin can see all blogs
    } else {
      // Regular users can only see their own unpublished blogs
      where.OR = [
        { published: true },
        { authorId: session.user.id }
      ];
    }
  } else {
    // Public users can only see published blogs
    where.published = true;
  }
  
  // Filter by category if provided
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Filter by author if provided
  if (authorId) {
    where.authorId = authorId;
  }
  
  // Filter by search term if provided
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Filter by tag if provided
  let blogIds = [];
  if (tag) {
    const taggedBlogs = await prisma.blogTag.findMany({
      where: {
        tag: {
          name: {
            equals: tag.toLowerCase(),
            mode: 'insensitive'
          }
        }
      },
      select: { blogId: true }
    });
    
    blogIds = taggedBlogs.map(item => item.blogId);
    
    if (blogIds.length > 0) {
      where.id = { in: blogIds };
    } else {
      // If no blogs with this tag, return empty result
      return res.status(200).json({
        blogs: [],
        pagination: { page: pageNumber, limit: pageSize, total: 0, pages: 0 }
      });
    }
  }
  
  // Get total count for pagination
  const totalBlogs = await prisma.blogPost.count({ where });
  
  // Get blogs with pagination
  const blogs = await prisma.blogPost.findMany({
    where,
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
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize
  });
  
  // Format blogs to include tags array
  const formattedBlogs = blogs.map(blog => {
    const { tags, categories, ...rest } = blog;
    return {
      ...rest,
      categories: categories.map(c => c.category),
      tags: tags.map(t => t.tag),
      commentCount: blog._count.comments
    };
  });
  
  // Return blogs with pagination info
  return res.status(200).json({
    blogs: formattedBlogs,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total: totalBlogs,
      pages: Math.ceil(totalBlogs / pageSize)
    }
  });
}

/**
 * Handle creating a new blog
 */
async function handleCreateBlog(req, res, session) {
  const { title, content, summary, categoryIds = [], published = false, tags = [] } = req.body;
  
  // Validate required fields
  if (!title || !content || !summary) {
    return res.status(400).json({ error: "Başlık, içerik ve özet zorunludur." });
  }
  
  // Check if categories exist
  if (categoryIds.length > 0) {
    const categories = await prisma.blogCategory.findMany({
      where: {
        id: { in: categoryIds }
      }
    });
    
    if (categories.length !== categoryIds.length) {
      return res.status(400).json({ error: "Belirtilen kategorilerden bazıları bulunamadı." });
    }
  }
  
  // Create the blog
  const blog = await prisma.blogPost.create({
    data: {
      title,
      content,
      summary,
      slug: createSlug(title), // You'd need to implement this function
      published: !!published,
      authorId: session.user.id,
      publishedAt: published ? new Date() : null
    }
  });
  
  // Connect categories
  if (categoryIds.length > 0) {
    await prisma.blogPostToCategory.createMany({
      data: categoryIds.map(categoryId => ({
        postId: blog.id,
        categoryId
      }))
    });
  }
  
  // Handle tags if provided
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagPromises = tags.map(async (tagName) => {
      // Find or create tag
      const existingTag = await prisma.blogTag.findFirst({
        where: { 
          name: { 
            equals: tagName,
            mode: 'insensitive'
          }
        }
      });
      
      let tagId;
      
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create a new tag with a slug
        const newTag = await prisma.blogTag.create({
          data: {
            name: tagName,
            slug: createSlug(tagName) // You'd need to implement this function
          }
        });
        tagId = newTag.id;
      }
      
      // Create blog-tag relation
      return prisma.blogPostToTag.create({
        data: {
          postId: blog.id,
          tagId
        }
      });
    });
    
    await Promise.all(tagPromises);
  }
  
  // Return the blog with related data
  const blogWithRelations = await prisma.blogPost.findUnique({
    where: { id: blog.id },
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
  
  return res.status(201).json(blogWithRelations);
}

// Apply rate limiting - 30 requests per minute
export default withRateLimit(handler, { interval: 60, limit: 30 }); 