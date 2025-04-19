import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  MoreHorizontal,
  ArrowUpDown, 
  ChevronDown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function BlogPosts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState({ field: "createdAt", direction: "desc" });

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status, sorting]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts from API with sorting
      const response = await fetch(`/api/dashboard/blog?orderBy=${sorting.field}&order=${sorting.direction}`);
      
      if (!response.ok) {
        throw new Error("Blog yazıları alınamadı");
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      
    } catch (err) {
      console.error("Blog yazıları alınamadı:", err);
      setError("Blog yazıları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/dashboard/blog/${slug}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Blog yazısı silinemedi");
      }
      
      // Yazı silindikten sonra listeyi güncelle
      fetchPosts();
      
    } catch (err) {
      console.error("Blog yazısı silinemedi:", err);
      alert("Blog yazısı silinirken bir hata oluştu");
    }
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleStatusChange = async (slug, published) => {
    try {
      const response = await fetch(`/api/dashboard/blog/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published,
          publishedAt: published ? new Date().toISOString() : null
        }),
      });
      
      if (!response.ok) {
        throw new Error("Blog yazısı güncellenemedi");
      }
      
      // Listeyi güncelle
      fetchPosts();
      
    } catch (err) {
      console.error("Blog yazısı güncellenemedi:", err);
      alert("Blog yazısı güncellenirken bir hata oluştu");
    }
  };

  // Filtreleme fonksiyonu
  const filteredPosts = posts
    .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(post => {
      if (statusFilter === "all") return true;
      return statusFilter === "published" ? post.published : !post.published;
    });

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-2">Yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Yazıları</h1>
          <p className="text-gray-500">
            Tüm blog yazılarını yönetin, düzenleyin veya silin.
          </p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Blog yazılarında ara..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex min-w-[180px]">
                    <span className="mr-auto">
                      {statusFilter === "all" ? "Tüm Yazılar" : 
                       statusFilter === "published" ? "Yayınlananlar" : "Taslaklar"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Tüm Yazılar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                    Yayınlananlar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Taslaklar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" onClick={fetchPosts}>
                Yenile
              </Button>
            </div>
          </div>
          
          {error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
              <Button className="mt-4" onClick={fetchPosts}>
                Tekrar Dene
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz bir blog yazısı yok.</p>
              <Link href="/dashboard/blog/new">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Yazı Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <Button
                        variant="ghost"
                        className="font-medium"
                        onClick={() => handleSort("title")}
                      >
                        Başlık
                        {sorting.field === "title" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="font-medium"
                        onClick={() => handleSort("publishedAt")}
                      >
                        Tarih
                        {sorting.field === "publishedAt" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="font-medium"
                        onClick={() => handleSort("viewCount")}
                      >
                        Görüntülenme
                        {sorting.field === "viewCount" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{formatDate(post.publishedAt || post.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className={`flex items-center ${post.published ? "text-green-600" : "text-gray-500"}`}
                          >
                            {post.published ? (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                <span>Yayında</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-4 w-4" />
                                <span>Taslak</span>
                              </>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{post.viewCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Görüntüle</span>
                            </Button>
                          </Link>
                          <Link href={`/dashboard/blog/edit/${post.slug}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Düzenle</span>
                            </Button>
                          </Link>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Daha Fazla</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(post.slug, !post.published)}>
                                {post.published ? "Taslağa Çevir" : "Yayınla"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(post.slug)}
                              >
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Set a title for this page
BlogPosts.title = "Blog Yazıları Yönetimi";

// Custom layout for dashboard to avoid the global layout
BlogPosts.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 