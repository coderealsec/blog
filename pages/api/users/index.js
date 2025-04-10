import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

/**
 * Kullanıcı yönetimi API endpoint
 * GET: Tüm kullanıcıları listeler
 * POST: Yeni kullanıcı oluşturur
 * 
 * @param {Object} req - HTTP isteği
 * @param {Object} res - HTTP yanıtı
 */
async function handler(req, res) {
  try {
    // Yetkilendirme kontrolü - sadece admin kullanıcılar
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bu işlem için yönetici yetkileri gereklidir' });
    }
    
    // GET: Tüm kullanıcıları getir
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              blogPosts: true,
              comments: true
            }
          }
        }
      });
      
      return res.status(200).json(users);
    } 
    
    // POST: Yeni kullanıcı oluştur
    else if (req.method === 'POST') {
      const { name, email, role = 'USER', password } = req.body;
      
      // Zorunlu alanları kontrol et
      if (!name || !email) {
        return res.status(400).json({ error: 'Ad ve e-posta alanları zorunludur' });
      }
      
      // E-posta formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
      }
      
      // E-posta adresinin kullanılıp kullanılmadığını kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
      }
      
      // Rastgele şifre oluştur (eğer password parametresi gönderilmemişse)
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      } else {
        const randomPassword = Math.random().toString(36).slice(-8);
        hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        // TODO: Gerçek bir uygulamada buraya kullanıcıya e-posta gönderme kodu eklenebilir
        console.log(`Kullanıcı için oluşturulan şifre: ${randomPassword}`);
      }
      
      // Kullanıcıyı oluştur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          emailVerified: new Date() // Varsayılan olarak e-posta doğrulanmış olarak işaretle
        }
      });
      
      // Güvenlik için şifreyi döndürme
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } 
    
    // Desteklenmeyen HTTP metodu
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      message: error.message 
    });
  }
}

export default withRateLimit(handler, {
  interval: 60, // 1 dakika
  limit: 20 // Dakikada 20 istek
}); 