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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  ExternalLink, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Flag,
  MessageCircle,
  User,
  MoreHorizontal
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Comments() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    content: "",
    isApproved: false
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchComments();
    }
  }, [status, activeTab]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      let url = "/api/comments";
      
      if (activeTab !== "all") {
        url += `?status=${activeTab}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Yorumlar yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setComments(data);
      
    } catch (err) {
      console.error("Yorumlar yüklenirken hata:", err);
      setError("Yorumlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error("Yorum durumu güncellenirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchComments();
      
    } catch (err) {
      console.error("Yorum durumu güncellenirken hata:", err);
      alert("Yorum durumu güncellenirken bir hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Yorum silinirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchComments();
      
    } catch (err) {
      console.error("Yorum silinirken hata:", err);
      alert("Yorum silinirken bir hata oluştu");
    }
  };

  const handleViewComment = (comment) => {
    setSelectedComment(comment);
    setOpenDialog(true);
    setEditMode(false);
  };

  const handleEditComment = (comment) => {
    setFormData({
      id: comment.id,
      content: comment.content,
      isApproved: comment.isApproved
    });
    setSelectedComment(comment);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert isApproved to status for API consistency
      const status = formData.isApproved ? 'approve' : 'reject';
      
      const response = await fetch(`/api/comments/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: formData.content,
          status
        })
      });
      
      if (!response.ok) {
        throw new Error("Yorum güncellenirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchComments();
      resetForm();
      
    } catch (err) {
      console.error("Yorum güncellenirken hata:", err);
      alert("Yorum güncellenirken bir hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      content: "",
      isApproved: false
    });
    setSelectedComment(null);
    setEditMode(false);
    setOpenDialog(false);
  };

  // Yorum durum badgeleri
  const getStatusBadge = (comment) => {
    if (comment.isDeleted) {
      return <Badge variant="destructive">Silinmiş</Badge>;
    }
    if (comment.isReported) {
      return <Badge className="bg-amber-500">Raporlanmış</Badge>;
    }
    if (comment.isApproved) {
      return <Badge className="bg-green-600">Onaylanmış</Badge>;
    }
    return <Badge variant="outline">Beklemede</Badge>;
  };

  // Filtreleme fonksiyonu
  const filteredComments = comments.filter(comment => 
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comment.author && comment.author.name && comment.author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (comment.blog && comment.blog.title && comment.blog.title.toLowerCase().includes(searchQuery.toLowerCase()))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yorumlar</h1>
          <p className="text-gray-500">
            Blog yorumlarını yönetin, onaylayın veya silin.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="pending">Bekleyen</TabsTrigger>
            <TabsTrigger value="approved">Onaylanan</TabsTrigger>
            <TabsTrigger value="reported">Raporlanan</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Yorumlarda ara..."
              className="pl-9 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <CommentList 
            comments={filteredComments}
            onView={handleViewComment}
            onEdit={handleEditComment}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            error={error}
            onRetry={fetchComments}
          />
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <CommentList 
            comments={filteredComments.filter(c => !c.isApproved && !c.isDeleted && !c.isReported)}
            onView={handleViewComment}
            onEdit={handleEditComment}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            error={error}
            onRetry={fetchComments}
          />
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <CommentList 
            comments={filteredComments.filter(c => c.isApproved)}
            onView={handleViewComment}
            onEdit={handleEditComment}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            error={error}
            onRetry={fetchComments}
          />
        </TabsContent>
        
        <TabsContent value="reported" className="space-y-4">
          <CommentList 
            comments={filteredComments.filter(c => c.isReported)}
            onView={handleViewComment}
            onEdit={handleEditComment}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            error={error}
            onRetry={fetchComments}
          />
        </TabsContent>
      </Tabs>
      
      {/* Yorum görüntüleme/düzenleme dialog'u */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Yorumu Düzenle" : "Yorum Detayları"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedComment && (
            <>
              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Yorum İçeriği
                    </label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Yorum içeriği"
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isApproved"
                      checked={formData.isApproved}
                      onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isApproved" className="text-sm font-medium">
                      Onaylanmış
                    </label>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        İptal
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Güncelle
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">{selectedComment.author?.name || "Anonim"}</span>
                      </div>
                      <div>
                        {getStatusBadge(selectedComment)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {formatDate(selectedComment.createdAt)}
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm">{selectedComment.content}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Yazı:</p>
                    <Link 
                      href={`/blog/${selectedComment.blog?.slug || ''}`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      target="_blank"
                    >
                      {selectedComment.blog?.title || "Bilinmeyen Yazı"}
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                  
                  <DialogFooter className="gap-2 sm:gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">
                        Kapat
                      </Button>
                    </DialogClose>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditComment(selectedComment)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Düzenle
                    </Button>
                    
                    {!selectedComment.isApproved ? (
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleStatusChange(selectedComment.id, { isApproved: true });
                          setOpenDialog(false);
                        }}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Onayla
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleStatusChange(selectedComment.id, { isApproved: false });
                          setOpenDialog(false);
                        }}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Onayı Kaldır
                      </Button>
                    )}
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Yorum listesi bileşeni
function CommentList({ comments, onView, onEdit, onDelete, onStatusChange, error, onRetry }) {
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
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-10 w-10 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">Henüz yorum bulunmuyor.</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yazar</TableHead>
              <TableHead>Yorum</TableHead>
              <TableHead>Yazı</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">
                  {comment.author?.name || "Anonim"}
                </TableCell>
                <TableCell>
                  <div className="line-clamp-2 text-sm">
                    {comment.content}
                  </div>
                </TableCell>
                <TableCell>
                  <Link 
                    href={`/blog/${comment.blog?.slug || ''}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    target="_blank"
                  >
                    {comment.blog?.title || "Bilinmeyen Yazı"}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(comment.createdAt)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(comment)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => onView(comment)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Görüntüle</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Daha Fazla</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(comment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Düzenle</span>
                        </DropdownMenuItem>
                        {!comment.isApproved ? (
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(comment.id, 'approve')}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            <span>Onayla</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => onStatusChange(comment.id, 'reject')}
                          >
                            <X className="mr-2 h-4 w-4" />
                            <span>Onayı Kaldır</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(comment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Sil</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Yorum durum badgeleri (ayrı bir fonksiyon olarak)
function getStatusBadge(comment) {
  if (comment.isDeleted) {
    return <Badge variant="destructive">Silinmiş</Badge>;
  }
  if (comment.isReported) {
    return <Badge className="bg-amber-500">Raporlanmış</Badge>;
  }
  if (comment.isApproved) {
    return <Badge className="bg-green-600">Onaylanmış</Badge>;
  }
  return <Badge variant="outline">Beklemede</Badge>;
}

// Sayfa başlığı
Comments.title = "Yorum Yönetimi";

// Dashboard layout'unu kullan
Comments.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 