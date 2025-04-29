'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Tag, Calendar, Eye, User, Clock, Share2, Bookmark, ThumbsUp } from 'lucide-react';

// Yorum komponenti
const Comment = ({ comment }) => (
  <div className="border-b border-gray-100 py-4 last:border-0">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt={comment.author.name}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium">{comment.author.name}</div>
          <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
        </div>
        <div className="text-gray-700">{comment.content}</div>
      </div>
    </div>
  </div>
);

// Yorum formu komponenti
const CommentForm = ({ onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { slug } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // İstek gönderilirken 3 deneme yap
      let retryCount = 0;
      let success = false;
      let newComment;
      
      while (retryCount < 2 && !success) {
        try {
          const response = await fetch(`/api/blog/${slug}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
            }),
            // Daha uzun bir zaman aşımı süresi
            timeout: 5000
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
              throw new Error('Yorum yapmak için giriş yapmalısınız');
            } else {
              throw new Error(errorData.message || 'Yorum eklenirken bir hata oluştu');
            }
          }
          
          newComment = await response.json();
          success = true;
        } catch (err) {
          retryCount++;
          
          // 401 (Yetkisiz) hataları için tekrar deneme yapma
          if (err.message.includes('giriş yapmalısınız') || retryCount >= 2) {
            throw err;
          }
          
          console.error(`Yorum ekleme denemesi ${retryCount}/2 başarısız:`, err);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      onCommentAdded(newComment);
      setContent('');
    } catch (err) {
      setError(err.message || 'Yorum gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Yorum Yap</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Düşüncelerinizi paylaşın..."
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
        disabled={isSubmitting}
      />
      <div className="flex justify-end mt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || !content.trim()} 
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
        </Button>
      </div>
    </form>
  );
};

export default function BlogPostDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  
  // Blog yazısını getir
  useEffect(() => {
    if (router.isReady && slug) {
      fetchBlogPost();
      fetchComments();
    }
  }, [router.isReady, slug]);
  
  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Hata denemesi sayısı
      let retryCount = 0;
      let success = false;
      let data;
      
      // Bağlantı sorunu varsa 3 kez deneme yap
      while (retryCount < 3 && !success) {
        try {
          const response = await fetch(`/api/blog/${slug}`, {
            // Daha uzun bir zaman aşımı süresi
            timeout: 15000
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Blog yazısı bulunamadı');
            } else {
              throw new Error(`Sunucu hatası: ${response.status}`);
            }
          }
          
          data = await response.json();
          success = true;
        } catch (err) {
          retryCount++;
          console.error(`Blog yazısı getirme denemesi ${retryCount}/3 başarısız:`, err);
          
          // Eğer son deneme değilse biraz bekle
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw err;
          }
        }
      }
      
      setPost(data.post);
      setRelatedPosts(data.relatedPosts || []);
      setLikeCount(data.post.likeCount || 0);
      setUserLiked(data.userLiked || false);
      
    } catch (err) {
      console.error('Blog yazısı getirme hatası:', err);
      setError('Blog yazısı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Yorumları getir
  const fetchComments = async () => {
    try {
      let retryCount = 0;
      let success = false;
      let data;
      
      // Bağlantı sorunu varsa 2 kez deneme yap
      while (retryCount < 2 && !success) {
        try {
          const response = await fetch(`/api/blog/${slug}/comments`);
          
          if (!response.ok) {
            throw new Error('Yorumlar getirilemedi');
          }
          
          data = await response.json();
          success = true;
        } catch (err) {
          retryCount++;
          console.error(`Yorumları getirme denemesi ${retryCount}/2 başarısız:`, err);
          
          // Eğer son deneme değilse biraz bekle
          if (retryCount < 2) {
            await new Promise(resolve => setTimeout(resolve, 800));
          } else {
            throw err;
          }
        }
      }
      
      setComments(data.comments || []);
      
    } catch (err) {
      console.error('Yorumları getirme hatası:', err);
      // Yorumlar yüklenemezse sessizce başarısız ol, sayfa yine de çalışabilir
      setComments([]);
    }
  };
  
  // Blog yazısını beğen/beğenme
  const handleLike = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Daha uzun bir zaman aşımı süresi
        timeout: 5000
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Kullanıcı girişi yapmamış
          alert('Beğenmek için giriş yapmalısınız.');
          return;
        }
        throw new Error('İşlem gerçekleştirilemedi');
      }
      
      const data = await response.json();
      setLikeCount(data.likeCount);
      setUserLiked(data.userLiked);
      
    } catch (err) {
      console.error('Beğenme hatası:', err);
      // Kullanıcıya görsel bir geri bildirim göster
      alert('Beğeni işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };
  
  // Blog yazısını paylaş
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || 'Harun ÖNER\'de bir yazı',
        url: window.location.href,
      })
      .catch((error) => console.log('Paylaşım hatası:', error));
    } else {
      // Kopyala
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Bağlantı kopyalandı!'))
        .catch(err => console.error('Kopyalama hatası:', err));
    }
  };
  
  // Yeni yorum eklendiğinde yorumları güncelle
  const handleCommentAdded = (newComment) => {
    try {
      setComments(prevComments => [newComment, ...prevComments]);
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      // Hatayı sessizce yakala ve yorum listesini değiştirme
    }
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Blog yazısı yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => router.push('/blog')}
            className="bg-green-600 hover:bg-green-700"
          >
            Blog Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }
  
  // Blog yazısı bulunamadı
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-xl mb-4">Blog yazısı bulunamadı</p>
          <Button 
            onClick={() => router.push('/blog')}
            className="bg-green-600 hover:bg-green-700"
          >
            Blog Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Geri dön butonu */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50 -ml-2" 
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Geri Dön
          </Button>
        </div>
        
        {/* Blog başlık ve meta bilgileri */}
        <div className="mb-8">
          {post.imageUrl && (
            <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2">
            <div className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            
            <div className="flex items-center mr-4">
              <User className="h-4 w-4 mr-1" />
              <span>{post.author.name}</span>
            </div>
            
            <div className="flex items-center mr-4">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.viewCount} görüntülenme</span>
            </div>
            
            <div className="flex items-center mr-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>{Math.ceil(post.content.length / 1000)} dk okuma</span>
            </div>
            
            {post.categories.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mt-2 md:mt-0">
                {post.categories.map(category => (
                  <Link 
                    key={category.id} 
                    href={`/blog?category=${category.slug}`}
                    className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium hover:bg-green-200 flex items-center"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* İçerik */}
        <div className="prose prose-green max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        {/* Etiketler */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link 
                  key={tag.id} 
                  href={`/blog?tag=${tag.slug}`}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Etkileşim butonları */}
        <div className="flex justify-between items-center border-t border-b border-gray-200 py-4 mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant={userLiked ? 'default' : 'outline'} 
              size="sm"
              className={userLiked ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {likeCount} Beğeni
            </Button>
            
            <Button variant="outline" size="sm" className="border-gray-300" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Paylaş
            </Button>
          </div>
          
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4 mr-1" />
            Kaydet
          </Button>
        </div>
        
        {/* Yazar bilgisi */}
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Yazar: {post.author.name}</h3>
              <p className="text-gray-600">{post.author.bio || 'DevOps mühendisi ve teknoloji tutkunu.'}</p>
              <div className="mt-2">
                <Link href={`/authors/${post.author.id}`}>
                  <Button variant="outline" size="sm" className="text-sm mt-2">
                    Yazarın Diğer Yazıları
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* İlgili yazılar */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Benzer Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Card key={relatedPost.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {relatedPost.imageUrl && (
                    <div className="aspect-video relative bg-gray-200">
                      <Image
                        src={relatedPost.imageUrl}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold hover:text-green-600 line-clamp-2">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Yorumlar */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Yorumlar ({comments.length})</h2>
          
          <CommentForm onCommentAdded={handleCommentAdded} />
          
          <div className="mt-8">
            {comments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Bu yazı için henüz yorum yapılmamış.</p>
                <p className="text-gray-500 mt-1">İlk yorumu yapan siz olun!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map(comment => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 