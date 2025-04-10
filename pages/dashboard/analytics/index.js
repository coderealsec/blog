import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  ThumbsUp,
  FileText,
  Tag,
  AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Renkler
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [analytics, setAnalytics] = useState({
    stats: {
      totalPosts: 0,
      publishedPosts: 0,
      totalViews: 0,
      totalComments: 0,
      totalLikes: 0
    },
    changeRates: {
      viewsChange: 0,
      commentsChange: 0,
      likesChange: 0,
      postsChange: 0
    },
    monthlyViewsData: [],
    topPosts: [],
    categoryData: [],
    tagData: [],
    recentComments: []
  });

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Gerçek veri yükleme
    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error("İstatistikler yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setAnalytics(data);
      
    } catch (err) {
      console.error("İstatistikler yüklenirken hata:", err);
      setError("İstatistikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Yükleniyor durumu
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-2">Yükleniyor...</p>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
          <p className="text-gray-500">
            Blog performansını ve ziyaretçi istatistiklerini görüntüleyin.
          </p>
        </div>
        
        <div className="bg-red-50 p-6 rounded-md border border-red-200 text-red-600 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Veriler yüklenemedi</h2>
          <p className="mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={fetchAnalytics}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const { stats, changeRates, monthlyViewsData, topPosts, categoryData, tagData, recentComments } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İstatistikler</h1>
        <p className="text-gray-500">
          Blog performansını ve ziyaretçi istatistiklerini görüntüleyin.
        </p>
      </div>
      
      {/* Periyot seçimi */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              period === 'week' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 text-sm font-medium ${
              period === 'month' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            Aylık
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              period === 'year' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Yıllık
          </button>
        </div>
      </div>
      
      {/* Özet metrikler */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Toplam Görüntülenme" 
          value={stats.totalViews.toLocaleString()} 
          icon={<Eye className="h-4 w-4" />}
          change={changeRates.viewsChange}
          description={`Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
        />
        
        <StatCard 
          title="Toplam Yorum" 
          value={stats.totalComments.toLocaleString()} 
          icon={<MessageSquare className="h-4 w-4" />}
          change={changeRates.commentsChange}
          description={`Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
        />
        
        <StatCard 
          title="Toplam Beğeni" 
          value={stats.totalLikes.toLocaleString()} 
          icon={<ThumbsUp className="h-4 w-4" />}
          change={changeRates.likesChange}
          description={`Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
        />
        
        <StatCard 
          title="Toplam Yazı" 
          value={`${stats.publishedPosts}/${stats.totalPosts}`} 
          icon={<FileText className="h-4 w-4" />}
          change={changeRates.postsChange}
          description="Yayınlanan / Toplam"
        />
      </div>
      
      {/* Grafikler */}
      <Tabs defaultValue="views">
        <TabsList className="mb-4">
          <TabsTrigger value="views">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Görüntülenme
          </TabsTrigger>
          <TabsTrigger value="content">
            <BarChart3 className="h-4 w-4 mr-2" />
            İçerik
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Kategoriler
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Görüntülenme</CardTitle>
              <CardDescription>Son 12 ayda sayfa görüntülenme sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={monthlyViewsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    name="Görüntülenme" 
                    stroke="#22c55e" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>En Çok Okunan Yazılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPosts.length > 0 ? (
                    topPosts.map((post) => (
                      <div key={post.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">
                            {post.publishedAt ? formatDate(post.publishedAt) : 'Yayınlanmadı'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{post.viewCount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Henüz görüntülenme yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Son Yorumlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentComments.length > 0 ? (
                    recentComments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {comment.author.image ? (
                            <img
                              src={comment.author.image}
                              alt={comment.author.name || "Kullanıcı"}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{comment.author.name || "İsimsiz Kullanıcı"}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                          <p className="text-sm mt-1 line-clamp-2">{comment.content}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {comment.blog.title}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Henüz yorum yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etiketler</CardTitle>
              <CardDescription>En çok kullanılan etiketler</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={tagData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Yazı Sayısı" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kategoriler</CardTitle>
              <CardDescription>Kategori bazlı içerik dağılımı</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} yazı`, 'Toplam']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon, change, description }) {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none text-gray-500">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {change !== undefined && (
            <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUpRight className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
          <span className="text-gray-500 ml-2">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Sayfa başlığı
Analytics.title = "İstatistikler";

// Dashboard layout'unu kullan
Analytics.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 