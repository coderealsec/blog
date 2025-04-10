import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FilePlus, 
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("Yeni Kategori Ekle");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/blog/categories");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kategoriler yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setCategories(data);
      
    } catch (err) {
      console.error("Kategoriler yüklenirken hata:", err);
      setError(err.message || "Kategoriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      setActionError(null);
      const response = await fetch(`/api/blog/categories/${slug}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kategori silinirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchCategories();
      
    } catch (err) {
      console.error("Kategori silinirken hata:", err);
      setActionError(err.message || "Kategori silinirken bir hata oluştu");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setActionError(null);
      
      const url = editMode 
        ? `/api/blog/categories/${formData.slug}` 
        : "/api/blog/categories";
        
      const method = editMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kategori kaydedilirken bir hata oluştu");
      }
      
      // Formu sıfırla ve listeyi güncelle
      resetForm();
      fetchCategories();
      
    } catch (err) {
      console.error("Kategori kaydedilirken hata:", err);
      setActionError(err.message || "Kategori kaydedilirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setDialogTitle("Kategori Düzenle");
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setDialogTitle("Yeni Kategori Ekle");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setEditMode(false);
    setIsDialogOpen(false);
    setActionError(null);
  };

  const handleStatusChange = async (slug, isActive) => {
    try {
      setActionError(null);
      const response = await fetch(`/api/blog/categories/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kategori durumu güncellenirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchCategories();
      
    } catch (err) {
      console.error("Kategori durumu güncellenirken hata:", err);
      setActionError(err.message || "Kategori durumu güncellenirken bir hata oluştu");
    }
  };

  // Filtreleme fonksiyonu
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dialog içeriği
  const renderDialogContent = () => {
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Kategori Adı</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Teknoloji, Yazılım, DevOps vb."
            className="col-span-3"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Kategori açıklaması..."
            className="col-span-3 min-h-[100px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => {
              setFormData({ ...formData, isActive: checked });
            }}
          />
          <Label htmlFor="isActive">Aktif</Label>
        </div>
      </div>
    );
  };

  // Form input değişikliğini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategoriler</h1>
          <p className="text-gray-500">
            Blog kategorilerini yönetin, ekleyin veya silin.
          </p>
        </div>
        
        {/* Yeni kategori ekleme dialog'u */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {dialogTitle}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogTitle}
              </DialogTitle>
            </DialogHeader>
            
            {actionError && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-600 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{actionError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {renderDialogContent()}
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    İptal
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {editMode ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {actionError && (
            <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-200 text-red-600 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{actionError}</p>
              <button 
                className="ml-auto text-gray-500 hover:text-gray-700" 
                onClick={() => setActionError(null)}
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex mb-6 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Kategorilerde ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
              <Button className="mt-4" onClick={fetchCategories}>
                Tekrar Dene
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz bir kategori eklenmemiş.</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={handleNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kategori Ekle
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Kategori Adı</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Yazı Sayısı</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>{category.postCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className={`flex items-center ${category.isActive ? "text-green-600" : "text-gray-500"}`}
                          >
                            {category.isActive ? (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-4 w-4" />
                                <span>Pasif</span>
                              </>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Düzenle</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Daha Fazla</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(category.slug, !category.isActive)}
                              >
                                {category.isActive ? "Pasife Al" : "Aktifleştir"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(category.slug)}
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

// Sayfa başlığı
Categories.title = "Kategori Yönetimi";

// Dashboard layout'unu kullan
Categories.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 