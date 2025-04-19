import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RocketIcon, FileTextIcon, UsersIcon, MessageSquareIcon } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  // Artık yetki kontrolü DashboardLayout bileşeninde yapılıyor

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Hoş geldiniz, {session?.user?.name || session?.user?.email}. Blog yönetim panelinize hoş geldiniz.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
            <FileTextIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">
              Toplam yazı sayısı
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
            <MessageSquareIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">
              Toplam yorum sayısı
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <UsersIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">
              Toplam kullanıcı sayısı
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Görüntülenmeler</CardTitle>
            <RocketIcon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">
              Toplam görüntülenme
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex items-center p-2 rounded-md hover:bg-gray-100">
              <div className="mr-2 rounded-full p-1 bg-blue-100">
                <FileTextIcon className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <a 
                  href="/dashboard/blog/new" 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Yeni Blog Yazısı Ekle
                </a>
                <p className="text-sm text-gray-500">
                  Blog yazısı oluşturmak için tıklayın
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-2 rounded-md hover:bg-gray-100">
              <div className="mr-2 rounded-full p-1 bg-green-100">
                <UsersIcon className="w-4 h-4 text-green-700" />
              </div>
              <div>
                <a 
                  href="/dashboard/blog/categories" 
                  className="text-green-600 font-medium hover:underline"
                >
                  Kategori Ekle/Düzenle
                </a>
                <p className="text-sm text-gray-500">
                  Blog kategorilerini yönetin
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-2 rounded-md hover:bg-gray-100">
              <div className="mr-2 rounded-full p-1 bg-purple-100">
                <MessageSquareIcon className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <a 
                  href="/dashboard/comments" 
                  className="text-purple-600 font-medium hover:underline"
                >
                  Yorumları Yönet
                </a>
                <p className="text-sm text-gray-500">
                  Yorumları inceleyin ve yanıtlayın
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Son Güncellemeler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="border-b pb-2">
              <div className="font-medium">Blog sistemi kuruldu</div>
              <div className="text-gray-500 text-xs">Bugün</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Set a title for this page
Dashboard.title = 'Admin Dashboard';

// Custom layout for dashboard to avoid the global layout if needed
Dashboard.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 