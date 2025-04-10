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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Tag, 
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Tags() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState([]);
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
  const [dialogTitle, setDialogTitle] = useState("Yeni Etiket Ekle");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Renk seçenekleri
  const colorOptions = [
    { name: "Yeşil", value: "#22c55e" },
    { name: "Mavi", value: "#3b82f6" },
    { name: "Kırmızı", value: "#ef4444" },
    { name: "Sarı", value: "#eab308" },
    { name: "Mor", value: "#a855f7" },
    { name: "Turuncu", value: "#f97316" },
    { name: "Pembe", value: "#ec4899" },
    { name: "Gri", value: "#6b7280" }
  ];

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTags();
    }
  }, [status]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog/tags");
      
      if (!response.ok) {
        throw new Error("Etiketler yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setTags(data);
      
    } catch (err) {
      console.error("Etiketler yüklenirken hata:", err);
      setError("Etiketler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Bu etiketi silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      setActionError(null);
      const response = await fetch(`/api/blog/tags/${slug}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Etiket silinirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchTags();
      
    } catch (err) {
      console.error("Etiket silinirken hata:", err);
      setActionError(err.message || "Etiket silinirken bir hata oluştu");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setActionError(null);
      
      const url = editMode 
        ? `/api/blog/tags/${formData.slug}` 
        : "/api/blog/tags";
        
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
        throw new Error(errorData.error || "Etiket kaydedilirken bir hata oluştu");
      }
      
      // Formu sıfırla ve listeyi güncelle
      resetForm();
      fetchTags();
      
    } catch (err) {
      console.error("Etiket kaydedilirken hata:", err);
      setActionError(err.message || "Etiket kaydedilirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tag) => {
    setFormData({
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      description: tag.description || '',
      isActive: tag.isActive
    });
    setEditMode(true);
    setDialogTitle("Etiket Düzenle");
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setDialogTitle("Yeni Etiket Ekle");
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
      const response = await fetch(`/api/blog/tags/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Etiket durumu güncellenirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchTags();
      
    } catch (err) {
      console.error("Etiket durumu güncellenirken hata:", err);
      setActionError(err.message || "Etiket durumu güncellenirken bir hata oluştu");
    }
  };

  // Filtreleme fonksiyonu
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dialog içeriği
  const renderDialogContent = () => {
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Etiket Adı</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Docker, Kubernetes, CI/CD vb."
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
            placeholder="Etiket açıklaması..."
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
          <h1 className="text-3xl font-bold tracking-tight">Etiketler</h1>
          <p className="text-gray-500">
            Blog etiketlerini yönetin, ekleyin veya silin.
          </p>
        </div>
        
        {/* Yeni etiket ekleme dialog'u */}
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
              <Alert variant="destructive">
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {renderDialogContent()}
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>Kaydet</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {actionError && (
            <div className="mb-4">
              <Alert variant="destructive">
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="flex mb-6 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Etiketlerde ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
              <Button className="mt-4" onClick={fetchTags}>
                Tekrar Dene
              </Button>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz bir etiket eklenmemiş.</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={handleNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Etiket Ekle
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Etiket Adı</TableHead>
                    <TableHead>Renk</TableHead>
                    <TableHead>Yazı Sayısı</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          {tag.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className="text-white" 
                          style={{ backgroundColor: tag.color || "#22c55e" }}
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{tag.postCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className={`flex items-center ${tag.isActive ? "text-green-600" : "text-gray-500"}`}
                          >
                            {tag.isActive ? (
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
                            onClick={() => handleEdit(tag)}
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
                                onClick={() => handleStatusChange(tag.slug, !tag.isActive)}
                              >
                                {tag.isActive ? "Pasife Al" : "Aktifleştir"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(tag.slug)}
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
Tags.title = "Etiket Yönetimi";

// Dashboard layout'unu kullan
Tags.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 