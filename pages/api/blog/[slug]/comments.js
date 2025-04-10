import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * @swagger
 * /api/blog/{slug}/comments:
 *   get:
 *     summary: Get comments for a blog post
 *     description: Retrieve all comments for a specific blog post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: Slug of the blog post
 *     responses:
 *       200:
 *         description: A list of comments
 *       404:
 *         description: Blog post not found
 *   post:
 *     summary: Add a comment to a blog post
 *     description: Add a new comment to a specific blog post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: Slug of the blog post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */

async function handleGetComments(req, res) {
  const { slug } = req.query;

  try {
    // Get blog post by slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }

    // Get comments for this blog post
    const comments = await prisma.comment.findMany({
      where: { 
        blogId: post.id,
        isApproved: true,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return res.status(500).json({ message: 'Yorumlar getirilirken bir hata oluştu' });
  }
}

async function handleCreateComment(req, res) {
  const { slug } = req.query;
  const { content } = req.body;
  
  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Bu işlem için giriş yapmanız gerekiyor' });
  }

  // Validate input
  if (!content || content.trim().length < 2) {
    return res.status(400).json({ message: 'Yorum içeriği en az 2 karakter olmalıdır' });
  }

  try {
    // Get blog post by slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    
    // Determine if the comment should be auto-approved
    const userRole = session.user.role;
    const isAutoApproved = userRole === 'ADMIN' || userRole === 'EDITOR';

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        isApproved: isAutoApproved,
        blog: {
          connect: { id: post.id }
        },
        author: {
          connect: { id: session.user.id }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    return res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu' });
  }
}

/**
 * API handler for blog comments
 */
async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return handleGetComments(req, res);
  } else if (req.method === 'POST') {
    return handleCreateComment(req, res);
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// Apply rate limiting: 20 requests per minute
export default withRateLimit(handler, { limit: 20 }); 