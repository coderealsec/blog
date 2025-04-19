import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BasicEditor } from "@/components/dashboard/BasicEditor";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { AlertCircle, ArrowLeft, Save, Image } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditBlogPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { slug } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postData, setPostData] = useState(null);
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

  // Fetch post data
  useEffect(() => {
    if (status === "authenticated" && slug) {
      fetchPost();
      fetchCategories();
      fetchTags();
    }
  }, [status, slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blog/${slug}`);
      
      if (!response.ok) {
        throw new Error("Blog yazısı getirilemedi");
      }
      
      const data = await response.json();
      
      if (!data || !data.post) {
        throw new Error("Blog yazısı bulunamadı");
      }
      
      const post = data.post;
      
      // Set form data
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        imageUrl: post.imageUrl || "",
        published: post.published || false,
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || "",
      });
      
      // Set selected categories and tags (Null check ekledim)
      if (post.categories && Array.isArray(post.categories)) {
        setSelectedCategories(post.categories.map(category => category.id));
      }
      
      if (post.tags && Array.isArray(post.tags)) {
        setSelectedTags(post.tags.map(tag => tag.id));
      }
      
      setPostData(post);
      
    } catch (err) {
      console.error("Blog yazısı getirilemedi:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    
    try {
      setSaveLoading(true);
      setError(null);
      
      // Update the post - using dashboard API endpoint for consistency
      const response = await fetch(`/api/dashboard/blog/${slug}`, {
        method: "PATCH",
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
        throw new Error(errorData.error || "Blog yazısı güncellenemedi");
      }
      
      // Show success message
      alert("Blog yazısı başarıyla güncellendi");
      
      // Redirect to the blog posts list
      router.push("/dashboard/blog/posts");
      
    } catch (err) {
      console.error("Blog yazısı güncellenemedi:", err);
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-2">Yükleniyor...</p>
      </div>
    );
  }

  // Error state if post can't be loaded
  if (error && !postData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Yazısı Düzenle</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/blog/posts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
        
        <div className="bg-red-50 p-6 rounded-md border border-red-200 text-red-600 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Blog yazısı yüklenemedi</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard/blog/posts")}>
            Blog Yazıları Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Yazısı Düzenle</h1>
          <p className="text-gray-500">
            "{formData.title}" başlıklı blog yazısını düzenleyin.
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
                    <BasicEditor
                      value={formData.content}
                      onChange={handleEditorChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bu basit editör ile içeriğinizi düzenleyebilir, resim ekleyebilir ve temel formatlamalar yapabilirsiniz.
                      İçerik zorunlu bir alandır.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">SEO Ayarları</h3>
                <p className="text-sm text-gray-500">
                  Bu ayarlar, arama motorlarında blog yazınızın nasıl görüneceğini etkiler.
                </p>

                <div>
                  <Label htmlFor="seoTitle">SEO Başlığı</Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="SEO için özel başlık (boş bırakırsanız normal başlık kullanılır)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opsiyonel olarak, arama motorları için özel bir başlık belirleyebilirsiniz.
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">Meta Açıklama</Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Arama sonuçlarında görünecek kısa açıklama (max. 160 karakter)"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Google arama sonuçlarında görünecek açıklama metni.
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoKeywords">Anahtar Kelimeler</Label>
                  <Input
                    id="seoKeywords"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    placeholder="Virgülle ayrılmış anahtar kelimeler"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opsiyonel. Virgülle ayrılmış anahtar kelimeler.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Yayın Durumu</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    name="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        published: checked === true,
                      });
                    }}
                  />
                  <Label htmlFor="published" className="font-normal">
                    Yayınla
                  </Label>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Öne Çıkan Görsel</h3>

                <div className="space-y-3">
                  {formData.imageUrl && (
                    <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Öne çıkan görsel"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0"
                        onClick={() => setFormData({...formData, imageUrl: ""})}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  {!formData.imageUrl && (
                    <div className="aspect-video bg-gray-100 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                      <Image className="h-8 w-8 mb-1" />
                      <p className="text-sm">Görsel Yok</p>
                    </div>
                  )}

                  <ImageUploader onImageUploaded={handleFeaturedImageUpload} />
                  <p className="text-xs text-gray-500">
                    Öne çıkan görsel, blog listesinde ve sosyal medya paylaşımlarında görünür.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Kategoriler</h3>

                <div>
                  <select
                    id="categories"
                    multiple
                    className="w-full h-32 rounded-md border border-gray-300 shadow-sm"
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Birden fazla seçmek için Ctrl (veya Command) tuşunu basılı tutun
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-medium">Etiketler</h3>

                <div>
                  <select
                    id="tags"
                    multiple
                    className="w-full h-32 rounded-md border border-gray-300 shadow-sm"
                    value={selectedTags}
                    onChange={handleTagChange}
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Birden fazla seçmek için Ctrl (veya Command) tuşunu basılı tutun
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

EditBlogPost.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 