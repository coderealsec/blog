import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

/**
 * Tekil kullanıcı yönetimi API endpoint
 * GET: Belirli bir kullanıcının detaylarını alır
 * PUT: Kullanıcı bilgilerini günceller
 * PATCH: Kullanıcı durumunu günceller
 * DELETE: Kullanıcıyı siler
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
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Kullanıcı ID bilgisi eksik' });
    }
    
    // Kullanıcının varlığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: true,
            comments: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // GET: Kullanıcı bilgilerini getir
    if (req.method === 'GET') {
      // Güvenlik için şifreyi döndürme
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } 
    
    // PUT: Kullanıcı bilgilerini güncelle
    else if (req.method === 'PUT') {
      const { name, email, role, password } = req.body;
      
      // Güncellenecek verileri hazırla
      const updateData = {};
      
      // Sadece sağlanan alanları güncelle
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) {
        // E-posta adresinin kullanılıp kullanılmadığını kontrol et
        if (email !== user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });
          
          if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
          }
        }
        
        updateData.email = email;
      }
      if (role !== undefined) updateData.role = role;
      
      // Şifre güncellemesi varsa hash'le
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      // Kullanıcıyı güncelle
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });
      
      // Güvenlik için şifreyi döndürme
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } 
    
    // PATCH: Kullanıcı durumunu güncelle
    else if (req.method === 'PATCH') {
      // Bu örnekte PATCH metodunu sadece isActive durumunu güncellemek için kullanıyoruz
      // Gerçek uygulamada farklı alanlar için farklı PATCH endpointleri oluşturulabilir
      const { isActive } = req.body;
      
      if (isActive === undefined) {
        return res.status(400).json({ error: 'Geçersiz istek: isActive alanı gerekli' });
      }

      // Admin kullanıcısının kendi hesabını devre dışı bırakmasını engelle
      if (id === session.user.id && isActive === false) {
        return res.status(400).json({ 
          error: 'Kendi hesabınızı devre dışı bırakamazsınız' 
        });
      }
      
      // isActive alanını emailVerified alanına dönüştür
      // Kullanıcı aktif değilse emailVerified null, aktifse bir tarih değeri
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          emailVerified: isActive ? new Date() : null
        }
      });
      
      // Güvenlik için şifreyi döndürme
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json({
        ...userWithoutPassword,
        isActive // İstemci tarafının kolay kullanımı için isActive alanını döndür
      });
    } 
    
    // DELETE: Kullanıcıyı sil
    else if (req.method === 'DELETE') {
      // Admin kullanıcısının kendi hesabını silmesini engelle
      if (id === session.user.id) {
        return res.status(400).json({ 
          error: 'Kendi hesabınızı silemezsiniz' 
        });
      }
      
      // Kullanıcıyı sil
      await prisma.user.delete({
        where: { id }
      });
      
      return res.status(200).json({ success: true, message: 'Kullanıcı başarıyla silindi' });
    } 
    
    // Desteklenmeyen HTTP metodu
    else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
  } catch (error) {
    console.error('User API error:', error);
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