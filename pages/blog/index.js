'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, truncateText } from '@/lib/utils';

// Sayfa başlığı
export const metadata = {
  title: 'DevOps Blog',
  description: 'En güncel DevOps teknolojileri ve uygulamaları hakkında bilgiler',
};

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL query parametreleri
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
    page: 1,
    limit: 9,
    orderBy: 'publishedAt',
    order: 'desc',
  });
  
  // URL'den query parametrelerini al
  useEffect(() => {
    if (router.isReady) {
      const { search, category, tag, page, orderBy, order } = router.query;
      
      const newFilters = {
        ...filters,
        search: search || '',
        category: category || '',
        tag: tag || '',
        page: page ? parseInt(page, 10) : 1,
        orderBy: orderBy || 'publishedAt',
        order: order || 'desc',
      };
      
      setFilters(newFilters);
    }
  }, [router.isReady, router.query]);
  
  // Filtreler değiştiğinde blog yazılarını getir
  useEffect(() => {
    if (router.isReady) {
      fetchPosts();
    }
  }, [filters, router.isReady]);
  
  // Sayfa yüklendiğinde kategorileri ve etiketleri getir
  useEffect(() => {
    if (router.isReady) {
      fetchCategories();
      fetchTags();
    }
  }, [router.isReady]);
  
  // Blog yazılarını getir
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // URL parametreleri oluştur
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.tag) params.append('tag', filters.tag);
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      params.append('orderBy', filters.orderBy);
      params.append('order', filters.order);
      
      // API'ye istek gönder
      const response = await fetch(`/api/blog?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Blog yazıları getirilemedi');
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Blog yazıları getirme hatası:', err);
      setError('Blog yazıları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Kategorileri getir
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      if (!response.ok) {
        console.error('Kategori API hatası:', response.status);
        // Hata fırlatmak yerine boş array ile devam et
        setCategories([]);
        return;
      }
      
      const data = await response.json();
      setCategories(data);
      
    } catch (err) {
      console.error('Kategorileri getirme hatası:', err);
      // Hata durumunda boş array kullan
      setCategories([]);
    }
  };
  
  // Etiketleri getir
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blog/tags');
      if (!response.ok) {
        console.error('Etiket API hatası:', response.status);
        // Hata fırlatmak yerine boş array ile devam et
        setTags([]);
        return;
      }
      
      const data = await response.json();
      setTags(data);
      
    } catch (err) {
      console.error('Etiketleri getirme hatası:', err);
      // Hata durumunda boş array kullan
      setTags([]);
    }
  };
  
  // Filtre değişikliklerini URL'e yansıt
  const applyFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // URL'i güncelle
    const query = { ...router.query };
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key]) {
        query[key] = updatedFilters[key];
      } else {
        delete query[key];
      }
    });
    
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };
  
  // Sıralama değiştir
  const changeSort = (field) => {
    if (filters.orderBy === field) {
      applyFilters({ orderBy: field, order: filters.order === 'asc' ? 'desc' : 'asc' });
    } else {
      applyFilters({ orderBy: field, order: 'desc' });
    }
  };
  
  // Sayfa değiştir
  const changePage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setFilters({ ...filters, page });
      
      const query = { ...router.query, page };
      router.push({
        pathname: router.pathname,
        query
      }, undefined, { shallow: true });
    }
  };
  
  // Arama yapma
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters({ search: e.target.search.value });
  };
  
  // Kategori filtresi değiştir
  const handleCategoryChange = (e) => {
    applyFilters({ category: e.target.value });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">DevOps Blog</h1>
        <p className="text-gray-600 mb-8">
          Docker, Kubernetes, CI/CD ve bulut teknolojileri hakkında güncel içerikler
        </p>
        
        {/* Arama ve filtreler */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                name="search"
                placeholder="Blog yazılarında ara..."
                defaultValue={filters.search}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Ara
            </Button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              className={`border-green-600 ${filters.orderBy === 'publishedAt' ? 'bg-green-50' : ''}`}
              onClick={() => changeSort('publishedAt')}
            >
              Tarih
              {filters.orderBy === 'publishedAt' && (
                filters.order === 'desc' ? <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              className={`border-green-600 ${filters.orderBy === 'viewCount' ? 'bg-green-50' : ''}`}
              onClick={() => changeSort('viewCount')}
            >
              Popüler
              {filters.orderBy === 'viewCount' && (
                filters.order === 'desc' ? <ArrowDown className="ml-1 h-4 w-4" /> : <ArrowUp className="ml-1 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Blog yazıları yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button 
            className="mt-4 bg-green-600 hover:bg-green-700"
            onClick={() => fetchPosts()}
          >
            Tekrar Dene
          </Button>
        </div>
      ) : (
        <>
          {/* Filtre durumunu göster */}
          {(filters.search || filters.category || filters.tag) && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-gray-600">
                  {filters.search && `"${filters.search}" için `}
                  {filters.category && categories.find(c => c.slug === filters.category) && 
                    `${categories.find(c => c.slug === filters.category).name} kategorisinde `}
                  {filters.tag && tags.find(t => t.slug === filters.tag) && 
                    `${tags.find(t => t.slug === filters.tag).name} etiketinde `}
                  {pagination.total} sonuç bulundu
                </span>
              </div>
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={() => {
                  setFilters({
                    ...filters,
                    search: '',
                    category: '',
                    tag: '',
                    page: 1
                  });
                  router.push('/blog');
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
          
          {/* Blog yazıları listesi */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aramanızla eşleşen blog yazısı bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="aspect-video relative bg-gray-200">
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      {post.categories.length > 0 && (
                        <Link 
                          href={`/blog?category=${post.categories[0].slug}`}
                          className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium hover:bg-green-200"
                        >
                          {post.categories[0].name}
                        </Link>
                      )}
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 hover:text-green-600">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt ? truncateText(post.excerpt, 150) : truncateText(post.content, 150)}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div className="text-sm text-gray-500">
                        <span>{post.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{post.viewCount} görüntülenme</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Devamını Oku
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Sayfalama */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="outline"
                onClick={() => changePage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="border-green-600"
              >
                Önceki
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // İlk, son ve aktif sayfanın etrafındaki 2 sayfayı göster
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - filters.page) <= 2
                  );
                })
                .reduce((acc, page, i, array) => {
                  if (i > 0 && array[i - 1] !== page - 1) {
                    // Sayfa atlanmışsa "..." ekle
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, index) => 
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2">...</span>
                  ) : (
                    <Button 
                      key={page}
                      variant={filters.page === page ? 'default' : 'outline'}
                      onClick={() => changePage(page)}
                      className={filters.page === page ? 'bg-green-600 hover:bg-green-700' : 'border-green-600'}
                    >
                      {page}
                    </Button>
                  )
                )
              }
              
              <Button 
                variant="outline"
                onClick={() => changePage(filters.page + 1)}
                disabled={!pagination.hasMore}
                className="border-green-600"
              >
                Sonraki
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 