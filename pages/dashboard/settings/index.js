import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Switch
} from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { 
  Settings, 
  Save,
  Globe, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  HardDrive, 
  FileJson, 
  FileText, 
  UserCog, 
  Hash, 
  Paintbrush,
  Pencil,
  AlertCircle
} from "lucide-react";

// Validation helpers
const isValidUrl = (url) => {
  if (!url || url.trim() === '') return true;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const isValidEmail = (email) => {
  if (!email || email.trim() === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidNumber = (num) => {
  return num === undefined || !isNaN(Number(num)) && Number(num) >= 0;
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({});
  const [settings, setSettings] = useState({
    general: {
      siteName: "",
      siteDescription: "",
      siteUrl: "",
      logoUrl: "",
      faviconUrl: "",
      defaultLanguage: "",
      dateFormat: "",
      timeFormat: "",
      timezone: "",
      postsPerPage: 10,
      showAuthor: true,
      showDate: true,
      showComments: true,
      showShareButtons: true
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      googleAnalyticsId: "",
      enableSitemap: true,
      enableRss: true,
      enableCanonical: true,
      enableRobotsTxt: true,
      enableSchemaMarkup: true,
      enableOpenGraph: true,
      enableTwitterCards: true,
      twitterUsername: "",
      facebookAppId: ""
    },
    comments: {
      enableComments: true,
      moderateComments: true,
      allowAnonymous: false,
      requireModeration: true,
      allowReplies: true,
      maxCommentLength: 1000,
      minCommentLength: 10,
      allowEditing: true,
      allowVoting: true,
      enableSpamProtection: true,
      enableProfanityFilter: true,
      profanityWords: ""
    },
    email: {
      smtpServer: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      senderEmail: "",
      senderName: "",
      enableEmailNotifications: true,
      notifyOnNewComment: true,
      notifyOnNewUser: true
    },
    social: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      github: "",
      youtube: "",
      medium: ""
    },
    appearance: {
      theme: "light",
      primaryColor: "#22c55e",
      secondaryColor: "#0f172a",
      accentColor: "#3b82f6",
      fontFamily: "Inter, sans-serif",
      headerStyle: "default",
      footerStyle: "default",
      enableDarkMode: true,
      customCss: ""
    }
  });

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Ayarları API'den yükleme
    if (status === "authenticated") {
      const fetchSettings = async () => {
        try {
          const response = await fetch('/api/settings');
          const data = await response.json();
          
          if (data.success) {
            setSettings(data.data);
          } else {
            console.error("Settings fetch error:", data.message);
          }
        } catch (error) {
          console.error("Settings fetch error:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchSettings();
    }
  }, [status]);

  const validateField = (section, field, value) => {
    const errors = { ...validation };
    const key = `${section}.${field}`;
    
    // Clear previous errors
    delete errors[key];
    
    // URL validation
    if (['siteUrl', 'logoUrl', 'faviconUrl', 'twitter', 'facebook', 'instagram', 'linkedin', 'github', 'youtube', 'medium'].includes(field)) {
      if (!isValidUrl(value)) {
        errors[key] = 'Geçerli bir URL giriniz';
      }
    }
    
    // Email validation
    if (['smtpUsername', 'senderEmail'].includes(field)) {
      if (!isValidEmail(value)) {
        errors[key] = 'Geçerli bir e-posta adresi giriniz';
      }
    }
    
    // Number validation
    if (['postsPerPage', 'smtpPort', 'maxCommentLength', 'minCommentLength'].includes(field)) {
      if (!isValidNumber(value)) {
        errors[key] = 'Geçerli bir sayı giriniz';
      }
    }
    
    // Required fields
    if (['siteName', 'siteDescription', 'metaTitle', 'metaDescription'].includes(field)) {
      if (!value || value.trim() === '') {
        errors[key] = 'Bu alan zorunludur';
      }
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (section, field, value) => {
    // Validate the field
    validateField(section, field, value);
    
    // Update the state
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateSection = (section) => {
    const sectionData = settings[section];
    let isValid = true;
    const errors = { ...validation };
    
    // Validate each field in the section
    for (const [field, value] of Object.entries(sectionData)) {
      const key = `${section}.${field}`;
      
      // URL validation
      if (['siteUrl', 'logoUrl', 'faviconUrl', 'twitter', 'facebook', 'instagram', 'linkedin', 'github', 'youtube', 'medium'].includes(field)) {
        if (!isValidUrl(value)) {
          errors[key] = 'Geçerli bir URL giriniz';
          isValid = false;
        }
      }
      
      // Email validation
      if (['smtpUsername', 'senderEmail'].includes(field)) {
        if (!isValidEmail(value)) {
          errors[key] = 'Geçerli bir e-posta adresi giriniz';
          isValid = false;
        }
      }
      
      // Number validation
      if (['postsPerPage', 'smtpPort', 'maxCommentLength', 'minCommentLength'].includes(field)) {
        if (!isValidNumber(value)) {
          errors[key] = 'Geçerli bir sayı giriniz';
          isValid = false;
        }
      }
      
      // Required fields
      if (['siteName', 'siteDescription', 'metaTitle', 'metaDescription'].includes(field)) {
        if (!value || value.trim() === '') {
          errors[key] = 'Bu alan zorunludur';
          isValid = false;
        }
      }
    }
    
    setValidation(errors);
    return isValid;
  };

  const handleSaveSettings = async (section) => {
    // Validate the entire section before saving
    if (!validateSection(section)) {
      toast({
        title: "Doğrulama Hatası",
        description: "Lütfen form alanlarındaki hataları düzeltin.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data: settings[section]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Ayarlar kaydedildi",
          description: `${section.charAt(0).toUpperCase() + section.slice(1)} ayarları başarıyla güncellendi.`,
        });
      } else {
        toast({
          title: "Hata",
          description: data.message || "Ayarlar kaydedilirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-gray-500">
          Blog ve sistem ayarlarını buradan yapılandırabilirsiniz.
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="comments">
            <Pencil className="h-4 w-4 mr-2" />
            Yorumlar
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            E-posta
          </TabsTrigger>
          <TabsTrigger value="social">
            <Hash className="h-4 w-4 mr-2" />
            Sosyal Medya
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Paintbrush className="h-4 w-4 mr-2" />
            Görünüm
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <SettingsForm
            title="Genel Ayarlar"
            description="Temel blog ayarlarını yapılandırın."
            settings={settings.general}
            section="general"
            onChange={handleChange}
            onSave={() => handleSaveSettings("general")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "siteName", label: "Site Adı", type: "text", required: true },
              { name: "siteDescription", label: "Site Açıklaması", type: "textarea", required: true },
              { name: "siteUrl", label: "Site URL", type: "url" },
              { name: "logoUrl", label: "Logo URL", type: "text" },
              { name: "faviconUrl", label: "Favicon URL", type: "text" },
              { name: "defaultLanguage", label: "Varsayılan Dil", type: "text" },
              { name: "dateFormat", label: "Tarih Formatı", type: "text" },
              { name: "timeFormat", label: "Saat Formatı", type: "select", options: [
                { value: "12h", label: "12 Saat (AM/PM)" },
                { value: "24h", label: "24 Saat" }
              ]},
              { name: "timezone", label: "Zaman Dilimi", type: "text" },
              { name: "postsPerPage", label: "Sayfa Başına Yazı", type: "number" },
              { name: "showAuthor", label: "Yazarı Göster", type: "switch" },
              { name: "showDate", label: "Tarihi Göster", type: "switch" },
              { name: "showComments", label: "Yorumları Göster", type: "switch" },
              { name: "showShareButtons", label: "Paylaşım Butonlarını Göster", type: "switch" }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="seo">
          <SettingsForm
            title="SEO Ayarları"
            description="Arama motoru optimizasyon ayarlarını yapılandırın."
            settings={settings.seo}
            section="seo"
            onChange={handleChange}
            onSave={() => handleSaveSettings("seo")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "metaTitle", label: "Meta Başlık", type: "text", required: true },
              { name: "metaDescription", label: "Meta Açıklama", type: "textarea", required: true },
              { name: "metaKeywords", label: "Meta Anahtar Kelimeler", type: "text" },
              { name: "googleAnalyticsId", label: "Google Analytics ID", type: "text" },
              { name: "enableSitemap", label: "Site Haritasını Etkinleştir", type: "switch" },
              { name: "enableRss", label: "RSS Beslemesini Etkinleştir", type: "switch" },
              { name: "enableCanonical", label: "Canonical URL'leri Etkinleştir", type: "switch" },
              { name: "enableRobotsTxt", label: "Robots.txt Etkinleştir", type: "switch" },
              { name: "enableSchemaMarkup", label: "Schema Markup Etkinleştir", type: "switch" },
              { name: "enableOpenGraph", label: "Open Graph Etiketlerini Etkinleştir", type: "switch" },
              { name: "enableTwitterCards", label: "Twitter Cards Etkinleştir", type: "switch" },
              { name: "twitterUsername", label: "Twitter Kullanıcı Adı", type: "text" },
              { name: "facebookAppId", label: "Facebook App ID", type: "text" }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="comments">
          <SettingsForm
            title="Yorum Ayarları"
            description="Yorum sistemi ayarlarını yapılandırın."
            settings={settings.comments}
            section="comments"
            onChange={handleChange}
            onSave={() => handleSaveSettings("comments")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "enableComments", label: "Yorumları Etkinleştir", type: "switch" },
              { name: "moderateComments", label: "Yorumları Denetle", type: "switch" },
              { name: "allowAnonymous", label: "Anonim Yorumlara İzin Ver", type: "switch" },
              { name: "requireModeration", label: "Yorumlar İçin Onay Gereksin", type: "switch" },
              { name: "allowReplies", label: "Yanıtlara İzin Ver", type: "switch" },
              { name: "maxCommentLength", label: "Maksimum Yorum Uzunluğu", type: "number" },
              { name: "minCommentLength", label: "Minimum Yorum Uzunluğu", type: "number" },
              { name: "allowEditing", label: "Yorum Düzenlemeye İzin Ver", type: "switch" },
              { name: "allowVoting", label: "Yorum Oylamaya İzin Ver", type: "switch" },
              { name: "enableSpamProtection", label: "Spam Korumasını Etkinleştir", type: "switch" },
              { name: "enableProfanityFilter", label: "Küfür Filtresini Etkinleştir", type: "switch" },
              { name: "profanityWords", label: "Yasaklı Kelimeler (virgülle ayırın)", type: "textarea" }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="email">
          <SettingsForm
            title="E-posta Ayarları"
            description="E-posta gönderim ayarlarını yapılandırın."
            settings={settings.email}
            section="email"
            onChange={handleChange}
            onSave={() => handleSaveSettings("email")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "smtpServer", label: "SMTP Sunucu", type: "text" },
              { name: "smtpPort", label: "SMTP Port", type: "number" },
              { name: "smtpUsername", label: "SMTP Kullanıcı Adı", type: "text" },
              { name: "smtpPassword", label: "SMTP Şifre", type: "password" },
              { name: "senderEmail", label: "Gönderen E-posta", type: "email" },
              { name: "senderName", label: "Gönderen Adı", type: "text" },
              { name: "enableEmailNotifications", label: "E-posta Bildirimlerini Etkinleştir", type: "switch" },
              { name: "notifyOnNewComment", label: "Yeni Yorum Bildirimi", type: "switch" },
              { name: "notifyOnNewUser", label: "Yeni Kullanıcı Bildirimi", type: "switch" }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="social">
          <SettingsForm
            title="Sosyal Medya Ayarları"
            description="Sosyal medya hesap bağlantılarını yapılandırın."
            settings={settings.social}
            section="social"
            onChange={handleChange}
            onSave={() => handleSaveSettings("social")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "twitter", label: "Twitter URL", type: "url" },
              { name: "facebook", label: "Facebook URL", type: "url" },
              { name: "instagram", label: "Instagram URL", type: "url" },
              { name: "linkedin", label: "LinkedIn URL", type: "url" },
              { name: "github", label: "GitHub URL", type: "url" },
              { name: "youtube", label: "YouTube URL", type: "url" },
              { name: "medium", label: "Medium URL", type: "url" }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="appearance">
          <SettingsForm
            title="Görünüm Ayarları"
            description="Site teması ve görünüm ayarlarını yapılandırın."
            settings={settings.appearance}
            section="appearance"
            onChange={handleChange}
            onSave={() => handleSaveSettings("appearance")}
            saving={saving}
            validation={validation}
            fields={[
              { name: "theme", label: "Tema", type: "select", options: [
                { value: "light", label: "Açık Tema" },
                { value: "dark", label: "Koyu Tema" },
                { value: "system", label: "Sistem Teması" }
              ]},
              { name: "primaryColor", label: "Ana Renk", type: "color" },
              { name: "secondaryColor", label: "İkincil Renk", type: "color" },
              { name: "accentColor", label: "Vurgu Rengi", type: "color" },
              { name: "fontFamily", label: "Yazı Tipi", type: "select", options: [
                { value: "Inter, sans-serif", label: "Inter" },
                { value: "Roboto, sans-serif", label: "Roboto" },
                { value: "Poppins, sans-serif", label: "Poppins" },
                { value: "Montserrat, sans-serif", label: "Montserrat" },
                { value: "Open Sans, sans-serif", label: "Open Sans" }
              ]},
              { name: "headerStyle", label: "Başlık Stili", type: "select", options: [
                { value: "default", label: "Varsayılan" },
                { value: "centered", label: "Ortalanmış" },
                { value: "minimal", label: "Minimal" }
              ]},
              { name: "footerStyle", label: "Altbilgi Stili", type: "select", options: [
                { value: "default", label: "Varsayılan" },
                { value: "minimal", label: "Minimal" },
                { value: "expanded", label: "Genişletilmiş" }
              ]},
              { name: "enableDarkMode", label: "Karanlık Mod Seçeneği", type: "switch" },
              { name: "customCss", label: "Özel CSS", type: "textarea" }
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsForm({ title, description, settings, section, onChange, onSave, saving, validation, fields }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => {
          const errorKey = `${section}.${field.name}`;
          const hasError = validation[errorKey];
          
          return (
            <div key={field.name} className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className={field.required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
                  {field.label}
                </Label>
                {hasError && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {hasError}
                  </div>
                )}
              </div>
              
              {field.type === "text" && (
                <Input
                  id={field.name}
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  className={hasError ? "border-red-500" : ""}
                  required={field.required}
                />
              )}
              
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  className={hasError ? "border-red-500" : ""}
                  required={field.required}
                />
              )}
              
              {field.type === "number" && (
                <Input
                  id={field.name}
                  type="number"
                  value={settings[field.name] || 0}
                  onChange={(e) => onChange(section, field.name, Number(e.target.value))}
                  className={hasError ? "border-red-500" : ""}
                  min={0}
                  required={field.required}
                />
              )}
              
              {field.type === "url" && (
                <Input
                  id={field.name}
                  type="url"
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  className={hasError ? "border-red-500" : ""}
                  required={field.required}
                />
              )}
              
              {field.type === "email" && (
                <Input
                  id={field.name}
                  type="email"
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  className={hasError ? "border-red-500" : ""}
                  required={field.required}
                />
              )}
              
              {field.type === "password" && (
                <Input
                  id={field.name}
                  type="password"
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  className={hasError ? "border-red-500" : ""}
                  required={field.required}
                />
              )}
              
              {field.type === "color" && (
                <div className="flex items-center gap-2">
                  <Input
                    id={field.name}
                    type="color"
                    className="w-12 h-10 p-1"
                    value={settings[field.name] || "#000000"}
                    onChange={(e) => onChange(section, field.name, e.target.value)}
                  />
                  <Input
                    value={settings[field.name] || "#000000"}
                    onChange={(e) => onChange(section, field.name, e.target.value)}
                    className={hasError ? "border-red-500" : ""}
                  />
                </div>
              )}
              
              {field.type === "select" && (
                <select
                  id={field.name}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${hasError ? "border-red-500" : ""}`}
                  value={settings[field.name] || ""}
                  onChange={(e) => onChange(section, field.name, e.target.value)}
                  required={field.required}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === "switch" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={field.name}
                    checked={settings[field.name] || false}
                    onCheckedChange={(checked) => onChange(section, field.name, checked)}
                  />
                  <Label htmlFor={field.name}>
                    {settings[field.name] ? "Açık" : "Kapalı"}
                  </Label>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              Kaydediliyor
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

SettingsPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}; 