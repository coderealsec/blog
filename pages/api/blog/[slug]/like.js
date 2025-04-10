import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

/**
 * @swagger
 * /api/blog/{slug}/like:
 *   post:
 *     summary: Like or unlike a blog post
 *     description: Toggle like status for a blog post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         description: Slug of the blog post
 *     responses:
 *       200:
 *         description: Like status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likeCount:
 *                   type: integer
 *                   description: Current like count
 *                 userLiked:
 *                   type: boolean
 *                   description: Whether the user has liked the post
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */

async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  
  // Auth check
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Bu işlem için giriş yapmanız gerekiyor' });
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

    // Check if the user has already liked this post
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId: session.user.id,
          blogId: post.id
        }
      }
    });

    let userLiked = false;

    if (existingLike) {
      // Unlike - delete the like
      await prisma.blogLike.delete({
        where: {
          userId_blogId: {
            userId: session.user.id,
            blogId: post.id
          }
        }
      });
    } else {
      // Like - create a new like
      await prisma.blogLike.create({
        data: {
          user: {
            connect: { id: session.user.id }
          },
          blog: {
            connect: { id: post.id }
          }
        }
      });
      userLiked = true;
    }

    // Get updated like count
    const likeCount = await prisma.blogLike.count({
      where: { blogId: post.id }
    });

    // Update blog post with new like count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { likeCount }
    });

    return res.status(200).json({ likeCount, userLiked });
  } catch (error) {
    console.error('Blog like error:', error);
    return res.status(500).json({ message: 'Beğeni işlemi sırasında bir hata oluştu' });
  }
}

// Apply rate limiting: 10 requests per minute
export default withRateLimit(handler, { limit: 10 }); 