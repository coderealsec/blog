import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle2, Mail, Calendar, ArrowRight } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect to login if not authenticated or to dashboard if admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, router, session]);

  // Update page title
  useEffect(() => {
    document.title = 'Profil - Harun ÖNER';
  }, []);

  // Helper function to get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-8">
        <div className="w-full mb-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-2" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-4 md:gap-8">
          <div className="md:col-span-1">
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="md:col-span-3 space-y-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or is admin, and not in loading state
  if (!session || session?.user?.role === 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
          <p className="text-gray-500">
            Hesap bilgilerinizi ve ayarlarınızı buradan yönetebilirsiniz.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="settings">Hesap Ayarları</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                    <AvatarFallback className="text-xl bg-primary/10">{getInitials(session.user?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{session.user?.name || 'Kullanıcı'}</CardTitle>
                    <CardDescription className="text-base flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {session.user?.email || 'E-posta adresi yok'}
                    </CardDescription>
                    <CardDescription className="text-base flex items-center mt-1">
                      <UserCircle2 className="h-4 w-4 mr-2" />
                      {session.user?.role || 'USER'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Son Etkinlikler</CardTitle>
                  <CardDescription>En son etkinlikleriniz ve hareketleriniz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz hiç etkinlik yok</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>İstatistikler</CardTitle>
                  <CardDescription>Hesabınızla ilgili temel istatistikler</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-gray-500">Yorum</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-gray-500">Beğeni</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-gray-500">Kayıtlı</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-gray-500">Okuma</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>İlgili Konular</CardTitle>
                <CardDescription>İlginizi çekebilecek blog yazıları</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/blog">
                  <Button className="w-full justify-between">
                    Blog Yazılarını Keşfet
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hesap Ayarları</CardTitle>
                <CardDescription>Hesap bilgilerinizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">Yakında kullanılabilir</p>
                  <p className="text-sm text-gray-400 mt-2">Hesap ayarları henüz yapım aşamasındadır</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 