import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleEditor } from "@/components/dashboard/SimpleEditor";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { AlertCircle, ArrowLeft, Save, Image } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewBlogPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    published: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  // Fetch categories and tags
  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
      fetchTags();
    }
  }, [status]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories");
      if (!response.ok) {
        throw new Error("Kategoriler getirilemedi");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Kategoriler getirilemedi:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/blog/tags");
      if (!response.ok) {
        throw new Error("Etiketler getirilemedi");
      }
      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error("Etiketler getirilemedi:", err);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedCategories(selectedOptions);
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTags(selectedOptions);
  };

  const handleFeaturedImageUpload = (url) => {
    setFormData({
      ...formData,
      imageUrl: url
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title || formData.title.trim() === "") {
      setError("Başlık zorunludur");
      return;
    }
    
    if (!formData.content || formData.content.trim() === "") {
      setError("İçerik zorunludur");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create the post
      const response = await fetch("/api/dashboard/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categories: selectedCategories,
          tags: selectedTags,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Blog yazısı oluşturulamadı");
      }
      
      // Redirect to the blog posts list
      router.push("/dashboard/blog/posts");
      
    } catch (err) {
      console.error("Blog yazısı oluşturulamadı:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
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
          <h1 className="text-3xl font-bold tracking-tight">Yeni Blog Yazısı</h1>
          <p className="text-gray-500">
            Yeni bir blog yazısı oluşturun ve yayınlayın.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/blog/posts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Hata</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Blog yazısının başlığını girin"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Başlık zorunlu bir alandır.
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Özet</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Blog yazısının kısa bir özetini girin"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Özet opsiyonel bir alandır. Yazınızın kısa bir özetini içerir.
                  </p>
                </div>

                <div>
                  <Label htmlFor="editor">İçerik</Label>
                  <div className="mt-1.5">
                    <SimpleEditor
                      value={formData.content}
                      onChange={handleEditorChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">SEO Ayarları</h2>
                
                <div>
                  <Label htmlFor="seoTitle">SEO Başlık</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="SEO için özel başlık (boş bırakılırsa başlık kullanılır)"
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Açıklama</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Blog yazısının arama motorlarında görünecek açıklaması"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="seoKeywords">SEO Anahtar Kelimeleri</Label>
                  <Input
                    id="seoKeywords"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="Virgülle ayrılmış anahtar kelimeler"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Arama motorları için anahtar kelimeleri virgülle ayırarak yazın.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Yayınlama Ayarları</h2>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    name="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        published: checked
                      });
                    }}
                  />
                  <Label htmlFor="published" className="flex-grow">
                    Hemen yayınla
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Öne Çıkan Görsel
                </h2>
                
                {formData.imageUrl ? (
                  <div className="space-y-3">
                    <div className="border rounded-md p-2 bg-gray-50">
                      <img 
                        src={formData.imageUrl} 
                        alt="Featured" 
                        className="max-h-52 object-contain mx-auto"
                      />
                    </div>
                    <Input 
                      value={formData.imageUrl} 
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="Görsel URL'si"
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="imageUrl">Görsel URL'si</Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Uzak bir sunucudaki görselin URL'sini girin veya aşağıdan yeni bir görsel yükleyin.
                      </p>
                    </div>
                    <div>
                      <Label>Yeni Görsel Yükle</Label>
                      <ImageUploader onImageUploaded={handleFeaturedImageUpload} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Kategoriler</h2>
                
                <div>
                  <Label htmlFor="categories">Kategoriler</Label>
                  <select
                    id="categories"
                    name="categories"
                    multiple
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white h-32"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.postCount})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Birden fazla seçim için Ctrl (veya Command) tuşunu basılı tutun.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Etiketler</h2>
                
                <div>
                  <Label htmlFor="tags">Etiketler</Label>
                  <select
                    id="tags"
                    name="tags"
                    multiple
                    value={selectedTags}
                    onChange={handleTagChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white h-32"
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name} ({tag.postCount})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Birden fazla seçim için Ctrl (veya Command) tuşunu basılı tutun.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Set a title for this page
NewBlogPost.title = "Yeni Blog Yazısı";

// Custom layout for dashboard to avoid the global layout
NewBlogPost.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 