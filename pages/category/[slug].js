'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, truncateText } from '@/lib/utils';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });
  const [categoryData, setCategoryData] = useState(null);
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
  
  // URL'den query parametrelerini al ve kategori slug'ını ayarla
  useEffect(() => {
    if (router.isReady && slug) {
      const { search, tag, page, orderBy, order } = router.query;
      
      const newFilters = {
        ...filters,
        search: search || '',
        category: slug,
        tag: tag || '',
        page: page ? parseInt(page, 10) : 1,
        orderBy: orderBy || 'publishedAt',
        order: order || 'desc',
      };
      
      setFilters(newFilters);
    }
  }, [router.isReady, router.query, slug]);
  
  // Filtreler değiştiğinde blog yazılarını getir
  useEffect(() => {
    let isMounted = true;
    
    if (router.isReady && slug) {
      // First try to fetch category data, then fetch posts regardless of whether category data fetch succeeds
      const fetchData = async () => {
        try {
          await fetchCategoryData();
        } catch (error) {
          console.error("Error fetching category data:", error);
        } finally {
          if (isMounted) {
            fetchPosts();
          }
        }
      };
      
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [filters, router.isReady, slug]);
  
  // Sayfa yüklendiğinde kategorileri ve etiketleri getir
  useEffect(() => {
    let isMounted = true;
    
    if (router.isReady) {
      Promise.all([
        fetchCategories(),
        fetchTags()
      ]).catch(err => {
        console.error("Error fetching categories or tags:", err);
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [router.isReady]);
  
  // Kategori bilgilerini getir
  const fetchCategoryData = useCallback(async () => {
    try {
      if (!slug) return;
      
      console.log(`Fetching category data for slug: ${slug}`);
      
      // API'ye istek gönder
      const response = await fetch(`/api/blog/categories/${slug}`);
      console.log(`Category API response status: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        
        // Rate limiting durumunda veya diğer hatalarda yine de devam et, 
        // ama konsola log at ve kategori bilgisini slug'dan tahmin et
        if (response.status === 429) {
          console.warn('Rate limiting hatası. Kategori bilgisi tahmin ediliyor.');
          // Kategori adını slug'dan tahmin et
          const formattedName = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setCategoryData({
            name: formattedName,
            description: 'Bu kategorideki yazıları keşfedin',
            slug: slug,
            isActive: true
          });
          
          return; // Hata fırlatma, devam et
        }
        
        // Diğer hatalar için hata fırlat ama sayfayı bloke etme
        throw new Error(`Kategori bilgileri getirilemedi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Category data received:', data);
      setCategoryData(data);
      document.title = `${data.name} - Harun ÖNER`;
      
    } catch (err) {
      console.error('Kategori bilgileri getirme hatası:', err);
      // Error state'i güncelle ama Fatal hataya dönüştürme
      setError(`Kategori bilgileri yüklenirken bir hata oluştu: ${err.message}`);
      
      // Kategori bilgisi olmadan da devam et, slug'dan tahmin et
      if (!categoryData) {
        const formattedName = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        setCategoryData({
          name: formattedName,
          description: 'Bu kategorideki yazıları keşfedin',
          slug: slug,
          isActive: true
        });
      }
    }
  }, [slug, router, categoryData]);
  
  // Blog yazılarını getir
  const fetchPosts = useCallback(async () => {
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
      
      console.log(`Fetching posts with params: ${params.toString()}`);
      
      // API'ye istek gönder
      const response = await fetch(`/api/blog?${params.toString()}`);
      console.log(`Posts API response status: ${response.status}`);
      
      if (!response.ok) {
        // Rate limiting durumunda boş liste kullan ve devam et
        if (response.status === 429) {
          console.warn('Blog posts API rate limiting hatası. Boş liste kullanılıyor.');
          setPosts([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            total: 0,
            hasMore: false,
          });
          return;
        }
        
        throw new Error(`Blog yazıları getirilemedi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.posts.length} posts`);
      setPosts(data.posts);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Blog yazıları getirme hatası:', err);
      setError(`Blog yazıları yüklenirken bir hata oluştu: ${err.message}`);
      // Even if there's an error, set posts to empty array to avoid undefined
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Kategorileri getir
  const fetchCategories = useCallback(async () => {
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
  }, []);
  
  // Etiketleri getir
  const fetchTags = useCallback(async () => {
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
  }, []);
  
  // Filtre değişikliklerini URL'e yansıt
  const applyFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // URL'i güncelle
    const query = { ...router.query };
    Object.keys(updatedFilters).forEach(key => {
      // Kategori parametresini URL'e ekleme çünkü zaten slug olarak var
      if (key === 'category') return;
      
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
    // Eğer seçilen kategori bu sayfanın kategorisiyse (slug), o zaman filtre değişmez
    // Farklı bir kategori seçilirse, o kategorinin sayfasına yönlendirilir
    if (e.target.value !== slug) {
      router.push(`/category/${e.target.value}`);
    }
  };
  
  // Etiket filtresi değiştir
  const handleTagChange = (e) => {
    applyFilters({ tag: e.target.value });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {categoryData ? categoryData.name : slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Kategori'}
        </h1>
        <p className="text-gray-600 mb-8">
          {categoryData ? categoryData.description : 'Bu kategorideki yazıları keşfedin'}
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
            
            <select
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.tag}
              onChange={handleTagChange}
            >
              <option value="">Tüm Etiketler</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.slug}>{tag.name}</option>
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
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Yazılar yükleniyor...</p>
        </div>
      ) : error && !posts.length ? (
        <div className="text-center py-20">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-xl mx-auto">
            <h3 className="text-yellow-800 font-semibold text-lg mb-2">Bir sorun oluştu</h3>
            <p className="text-yellow-700 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => {
                  setError(null);
                  fetchPosts(); 
                }}
              >
                Tekrar Dene
              </Button>
              <Link href="/blog">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Tüm Blog Yazılarına Git
                </Button>
              </Link>
            </div>
            
            {/* İlgili kategoriler */}
            {categories.length > 0 && (
              <div className="mt-8 pt-4 border-t border-yellow-200">
                <h3 className="text-yellow-800 font-medium mb-3">Diğer Kategoriler</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories
                    .filter(c => c.slug !== slug && c.isActive)
                    .slice(0, 5)
                    .map(category => (
                      <Link 
                        key={category.id} 
                        href={`/category/${category.slug}`}
                        className="bg-white hover:bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm border border-yellow-200"
                      >
                        {category.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">
            {error ? (
              <>
                <span className="text-yellow-600 font-medium">Not:</span> {error}
              </>
            ) : (
              'Bu kategoride henüz blog yazısı bulunmuyor.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link href="/blog">
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                Tüm Yazılara Geri Dön
              </Button>
            </Link>
            {error && (
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto"
                onClick={() => {
                  setError(null);
                  fetchPosts();
                }}
              >
                Tekrar Dene
              </Button>
            )}
          </div>
          
          {/* Kategori bilgileri göster */}
          {categoryData && (
            <div className="mt-12 border-t border-gray-200 pt-8 max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-2">{categoryData.name} Hakkında</h2>
              <p className="text-gray-600">{categoryData.description || 'Bu kategoriye henüz içerik eklenmemiştir. Daha sonra tekrar kontrol edebilirsiniz.'}</p>
              
              {/* İlgili kategoriler */}
              {categories.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-3">Diğer Kategoriler</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories
                      .filter(c => c.slug !== slug && c.isActive)
                      .slice(0, 5)
                      .map(category => (
                        <Link 
                          key={category.id} 
                          href={`/category/${category.slug}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {category.name}
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {post.imageUrl ? (
                  <div className="aspect-video relative">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Görsel yok</span>
                  </div>
                )}
                
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    {post.categories.length > 0 && (
                      <Link 
                        href={`/category/${post.categories[0].slug}`}
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
          
          {/* Sayfalama */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Önceki
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={filters.page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePage(i + 1)}
                    className={
                      filters.page === i + 1
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "border-green-600 text-green-600 hover:bg-green-50"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(filters.page + 1)}
                disabled={filters.page >= pagination.totalPages}
                className="border-green-600 text-green-600 hover:bg-green-50"
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