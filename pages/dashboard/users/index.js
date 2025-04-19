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
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  UserPlus, 
  Users, 
  UserCog, 
  ShieldCheck, 
  Shield, 
  User,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    role: "user",
    emailVerified: true
  });

  // Kullanıcı rolleri
  const roles = [
    { value: "ADMIN", label: "Admin" },
    { value: "EDITOR", label: "Editör" },
    { value: "USER", label: "Kullanıcı" }
  ];

  // Artık kimlik doğrulama kontrolü DashboardLayout bileşeni tarafından yapılıyor

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      
      if (!response.ok) {
        throw new Error("Kullanıcılar yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      
      // Kullanıcıların aktif durumunu emailVerified tarihine göre belirle
      const processedUsers = data.map(user => ({
        ...user,
        // Kullanıcı aktif olarak kabul edilir eğer emailVerified null DEĞİLSE
        isActive: user.emailVerified !== null
      }));
      
      console.log("Kullanıcılar yüklendi:", processedUsers);
      setUsers(processedUsers);
      
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata:", err);
      setError("Kullanıcılar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Kullanıcı silinirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchUsers();
      
    } catch (err) {
      console.error("Kullanıcı silinirken hata:", err);
      alert("Kullanıcı silinirken bir hata oluştu");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editMode 
        ? `/api/users/${formData.id}` 
        : "/api/users";
        
      const method = editMode ? "PUT" : "POST";
      
      // emailVerified değerini isActive olarak API'ye gönder
      // frontend'de emailVerified = true/false, API'de isActive = true/false
      const apiData = {
        ...formData,
        isActive: formData.emailVerified,
        emailVerified: undefined // API'de bu alanı kullanmıyoruz
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error("Kullanıcı kaydedilirken bir hata oluştu");
      }
      
      // Formu sıfırla ve listeyi güncelle
      resetForm();
      fetchUsers();
      
    } catch (err) {
      console.error("Kullanıcı kaydedilirken hata:", err);
      alert("Kullanıcı kaydedilirken bir hata oluştu");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "USER",
      emailVerified: user.emailVerified !== null
    });
    setSelectedUser(user);
    setEditMode(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      role: "USER",
      emailVerified: true
    });
    setSelectedUser(null);
    setEditMode(false);
    setOpenDialog(false);
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        throw new Error("Kullanıcı durumu güncellenirken bir hata oluştu");
      }
      
      // Listeyi güncelle
      fetchUsers();
      
    } catch (err) {
      console.error("Kullanıcı durumu güncellenirken hata:", err);
      alert("Kullanıcı durumu güncellenirken bir hata oluştu");
    }
  };

  // Kullanıcı rol badgesi
  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-600">Admin</Badge>;
      case "EDITOR":
        return <Badge className="bg-blue-600">Editör</Badge>;
      case "USER":
        return <Badge variant="outline">Kullanıcı</Badge>;
      default:
        return <Badge variant="outline">Kullanıcı</Badge>;
    }
  };

  // Filtreleme fonksiyonu
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Kullanıcı adı için kısaltma oluştur
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
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
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcılar</h1>
          <p className="text-gray-500">
            Blog kullanıcılarını yönetin, düzenleyin veya silin.
          </p>
        </div>
        
        {/* Yeni kullanıcı ekleme dialog'u */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Kullanıcı
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
              </DialogTitle>
              {!editMode && (
                <DialogDescription>
                  Kullanıcı eklendikten sonra otomatik olarak bir şifre oluşturulacak ve 
                  kullanıcıya e-posta gönderilecektir.
                </DialogDescription>
              )}
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ad Soyad"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@mail.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    İptal
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editMode ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex mb-6 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Kullanıcılarda ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {error ? (
            <div className="text-center text-red-500 py-12">
              <p>{error}</p>
              <Button className="mt-4" onClick={fetchUsers}>
                Tekrar Dene
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Henüz bir kullanıcı bulunmuyor.</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setOpenDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Yeni Kullanıcı Ekle
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className={`flex items-center ${user.isActive ? "text-green-600" : "text-red-500"}`}
                          >
                            {user.isActive ? (
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
                            onClick={() => handleEdit(user)}
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
                                onClick={() => window.location.href = `mailto:${user.email}`}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                <span>E-posta Gönder</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(user.id, !user.isActive)}
                              >
                                {user.isActive ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Pasife Al</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <span>Aktifleştir</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(user.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sayfa başlığı
UsersPage.title = "Kullanıcı Yönetimi";

// Dashboard layout'unu kullan
UsersPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 