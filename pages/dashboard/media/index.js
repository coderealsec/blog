import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  ExternalLink, 
  MoreHorizontal,
  X,
  Info,
  Check
} from "lucide-react";
import { formatDate, formatBytes } from "@/lib/utils";

export default function Media() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialog, setUploadDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMedia();
    }
  }, [status, activeTab]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      let url = "/api/media";
      
      if (activeTab !== "all") {
        url += `?type=${activeTab}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Medya dosyaları yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      // Handle the object structure returned by the API
      setMedia(data.media || []);
      
    } catch (err) {
      console.error("Medya dosyaları yüklenirken hata:", err);
      setError("Medya dosyaları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu medya dosyasını silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Medya dosyası silinirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchMedia();
      
      // Eğer önizleme açıksa ve silinen dosya seçiliyse kapatalım
      if (previewDialog && selectedImage && selectedImage.id === id) {
        setPreviewDialog(false);
        setSelectedImage(null);
      }
      
    } catch (err) {
      console.error("Medya dosyası silinirken hata:", err);
      alert("Medya dosyası silinirken bir hata oluştu");
    }
  };

  const handleCopyUrl = (fileUrl) => {
    navigator.clipboard.writeText(fileUrl);
    alert("URL panoya kopyalandı!");
  };

  const handlePreview = (image) => {
    setSelectedImage(image);
    setPreviewDialog(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleUpload(files);
    }
  };

  const handleUpload = async (files) => {
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => 
      file.type.startsWith("image/") || 
      file.type === "application/pdf"
    );
    
    if (validFiles.length === 0) {
      alert("Lütfen geçerli dosya türleri yükleyin (resim veya PDF)");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append("files", file);
      });
      
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      if (!response.ok) {
        throw new Error("Medya dosyaları yüklenirken bir hata oluştu");
      }
      
      // Yükleme tamamlandı, dialog'u kapat ve listeyi güncelle
      setUploadDialog(false);
      fetchMedia();
      
    } catch (err) {
      console.error("Medya dosyaları yüklenirken hata:", err);
      alert("Medya dosyaları yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // Dosya input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Filtreleme fonksiyonu
  const filteredMedia = media.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Medya</h1>
          <p className="text-gray-500">
            Blog için görselleri ve dosyaları yönetin.
          </p>
        </div>
        
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Medya Yükle
        </Button>
      </div>
      
      {/* Dosya yükleme dialog'u */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Medya Yükle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                dragActive 
                  ? "border-green-600 bg-green-50 dark:bg-green-900/20" 
                  : "border-gray-300 dark:border-gray-700"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Yüklenecek görselleri sürükleyip bırakın veya
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Bilgisayardan Seç
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Yükleniyor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <p>Desteklenen dosya türleri: JPG, PNG, GIF, SVG, WebP, PDF</p>
              <p className="mt-1">Maksimum dosya boyutu: 5MB</p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={uploading}>
                İptal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Görsel önizleme dialog'u */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Görsel Detayları</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <Image
                  src={selectedImage.fileUrl}
                  alt={selectedImage.altText || "Görsel"}
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dosya adı</p>
                  <p className="text-sm mt-1">{selectedImage.fileName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Boyut</p>
                  <p className="text-sm mt-1">{formatBytes(selectedImage.fileSize)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Boyutlar</p>
                  <p className="text-sm mt-1">
                    {selectedImage.width || '?'} × {selectedImage.height || '?'} piksel
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Yüklenme tarihi</p>
                  <p className="text-sm mt-1">{formatDate(selectedImage.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Alternatif metin</p>
                  <p className="text-sm mt-1">{selectedImage.altText || "-"}</p>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleCopyUrl(selectedImage.fileUrl)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    URL'yi Kopyala
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => {
                      setPreviewDialog(false);
                      handleDelete(selectedImage.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Görseli Sil
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="image">Görseller</TabsTrigger>
            <TabsTrigger value="document">Dokümanlar</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Medya ara..."
              className="pl-9 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <MediaGrid 
            items={filteredMedia}
            onPreview={handlePreview}
            onDelete={handleDelete}
            onCopyUrl={handleCopyUrl}
            error={error}
            onRetry={fetchMedia}
          />
        </TabsContent>
        
        <TabsContent value="image" className="mt-0">
          <MediaGrid 
            items={filteredMedia.filter(item => item.fileType === "image")}
            onPreview={handlePreview}
            onDelete={handleDelete}
            onCopyUrl={handleCopyUrl}
            error={error}
            onRetry={fetchMedia}
          />
        </TabsContent>
        
        <TabsContent value="document" className="mt-0">
          <MediaGrid 
            items={filteredMedia.filter(item => item.fileType === "document")}
            onPreview={handlePreview}
            onDelete={handleDelete}
            onCopyUrl={handleCopyUrl}
            error={error}
            onRetry={fetchMedia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Medya grid bileşeni
function MediaGrid({ items, onPreview, onDelete, onCopyUrl, error, onRetry }) {
  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>{error}</p>
        <Button className="mt-4" onClick={onRetry}>
          Tekrar Dene
        </Button>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">Henüz medya dosyası bulunmuyor.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="group overflow-hidden">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
            {item.fileType === "image" ? (
              <Image
                src={item.fileUrl}
                alt={item.altText || ""}
                fill
                className="object-cover transition-all group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-xs text-gray-500">{item.fileName}</p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => onPreview(item)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => onCopyUrl(item.fileUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 text-red-600"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-3">
            <div className="text-xs truncate" title={item.fileName}>
              {item.fileName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatBytes(item.fileSize)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sayfa başlığı
Media.title = "Medya Yönetimi";

// Dashboard layout'unu kullan
Media.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 