# BLOG SİSTEMİ İÇERİK ANALİZİ

## Frontend Sayfaları

### 1. Blog Ana Sayfası (`/pages/blog/index.tsx`)

**Temel Özellikler:**
- Blog yazılarını liste halinde gösterir
- Öne çıkan blog yazısı bölümü
- Blog yazılarını kategori ve etiketlere göre filtreleme
- Arama fonksiyonu
- Sayfalama (pagination)

**Teknik Detaylar:**
- `GetServerSideProps` ile sunucu tarafında veri çekme
- Blog yazılarını en son yayınlanandan en eskiye doğru sıralama
- Yanıt verilen filtrelere göre (kategori, etiket, arama terimi) blog yazılarını filtreleme
- SEO optimizasyonu için meta etiketleri (title, description, keywords, OpenGraph)
- Responsive tasarım (grid sistem ile mobil ve masaüstü uyumlu)

**Veri Yapısı:**
- `BlogPost` - Blog yazılarının temel veri yapısı (id, title, slug, excerpt, content, imageUrl, published, publishedAt, vb.)
- `BlogCategory` - Kategori bilgileri (id, name, slug, _count)
- `BlogTag` - Etiket bilgileri (id, name, slug, _count)

### 2. Blog Detay Sayfası (`/pages/blog/[slug].tsx`)

**Temel Özellikler:**
- Tam blog yazı içeriği
- Yazar bilgileri ve yayın tarihi
- İlgili kategoriler ve etiketler
- Sosyal medya paylaşım linkleri
- İlgili/benzer blog yazıları
- Görüntülenme sayacı

**Teknik Detaylar:**
- `GetServerSideProps` ile sunucu tarafında veri çekme ve slug'a göre blog yazısını bulma
- Görüntülenme sayısını artırma (bot olmayan gerçek kullanıcılar için)
- İlgili blog yazılarını getirme (aynı kategori veya etiketlere sahip)
- JSON-LD yapılandırılmış veri ekleme (SEO)
- Blog içeriğini HTML olarak işleme (dangerouslySetInnerHTML)

**SEO Optimizasyonları:**
- Dinamik meta etiketleri 
- Open Graph ve Twitter card etiketleri
- Canonical URL
- Yapılandırılmış veri (schema.org BlogPosting)

### 3. Kategori Sayfası (`/pages/blog/category/[slug].tsx`)

**Temel Özellikler:**
- Belirli bir kategoriye ait blog yazılarını gösterme
- Kategori başlığı ve açıklaması
- Sayfalama

**Teknik Detaylar:**
- `GetServerSideProps` ile kategori slug'ına göre ilgili yazıları getirme
- Sayfa başına belirli sayıda (9) yazı gösterme
- Yazıları tarihe göre sıralama (son yayınlananlar ilk)
- Kategori SEO bilgilerini sayfaya ekleme

### 4. Etiket Sayfası (`/pages/blog/tag/[slug].tsx`)

**Özellikler ve Yapısı:**
- Kategori sayfasına benzer şekilde, belirli etiketle ilişkilendirilmiş blog yazılarını gösterir
- Etiket bilgisi ve ilişkili yazı sayısını gösterir
- Yazıları tarihe göre sıralar
- Sayfalama özellikleri içerir

## Admin Panel Sayfaları

### 1. Blog Yönetim Sayfası (`/pages/dashboard/blog/index.tsx`)

**Temel Özellikler:**
- Blog yazılarını liste veya grid görünümünde listeleme
- Blog yazılarını filtreleme (durum, kategori, tarih aralığı)
- Arama fonksiyonu
- Sıralama (başlık, yayın tarihi, görüntülenme)
- Toplu işlemler (seçili yazıları silme, durumlarını değiştirme)
- Dışa aktarma (JSON, CSV, Excel)

**Teknik Detaylar:**
- React hooks (useState, useEffect, useMemo) ile durum yönetimi
- Blog yazılarını çekmek için API çağrıları
- Filtreleme ve sıralama işlemlerini client-side gerçekleştirme
- Seçili yazıları işlemek için toplu işlemler
- Liste ve grid görünümleri arasında geçiş

**Veri İşlemleri:**
- Blog yazılarını silme
- Blog yazısı durumunu değiştirme (taslak/yayında)
- Seçilen yazılar için toplu işlemler
- Verileri farklı formatlarda dışa aktarma

### 2. Yeni Blog Yazısı Ekleme Sayfası (`/pages/dashboard/blog/new.tsx`)

**Temel Özellikler:**
- Form tabanlı blog yazısı oluşturma arayüzü
- Zengin metin editörü (TinyMCE)
- Kategori seçimi ve etiket ekleme
- Öne çıkan görsel yükleme
- Yayınlama durumu seçimi (taslak, yayında)
- SEO ayarları (meta başlık, açıklama, anahtar kelimeler)

**Teknik Detaylar:**
- React Hook Form ve Zod ile form validasyonu
  - Form şeması ile zorunlu alanların doğrulaması (başlık min 5 karakter, özet 10-300 karakter, içerik min 50 karakter)
- Görsel yükleme için axios ile form-data gönderimi
  - Dosya türü (jpg, png, gif, webp) ve boyut (max 5MB) doğrulaması
  - Yükleme ilerleme çubuğu
- TinyMCE editör entegrasyonu
- SEO verilerinin otomatik doldurulması
  - Başlık ve özet içeriğinden SEO meta bilgilerini oluşturma
- Form gönderildiğinde API'ye veri gönderme
- İlgili bileşenler: 
  - Editor.tsx - TinyMCE entegrasyonu
  - TagInput.tsx - Etiket seçimi ve ekleme fonksiyonları

**Form Alanları:**
- Başlık, özet, içerik
- Kategori ve etiketler
- Öne çıkan görsel
- Durum (taslak/yayında/planlı)
- Yayın tarihi (zamanlanmış yayın için)
- SEO bilgileri (title, description, keywords)

### 3. Blog Yazısı Düzenleme Sayfası (`/pages/dashboard/blog/edit/[id].tsx`)

**Temel Özellikler:**
- Var olan blog yazısını düzenleme
- New sayfasına benzer form alanları
- Mevcut verileri otomatik doldurma
- İçerik düzenleme ve güncelleme
- İstatistikleri görüntüleme (görüntülenme sayısı, vb.)

**Teknik Detaylar:**
- ID'ye göre blog verisini çekme
- Form alanlarını mevcut verilerle doldurma
- Görüntülenme ve oluşturulma tarihi gibi istatistik verilerini gösterme
- Değişiklikleri kaydetme ve veritabanını güncelleme
- İçeriği yayınlama veya taslak olarak saklama seçenekleri

### 4. Kategori Yönetim Sayfası (`/pages/dashboard/blog/categories/index.tsx`)

**Temel Özellikler:**
- Kategori listeleme ve yönetimi
- Yeni kategori ekleme
- Kategori düzenleme ve silme
- Kategorilerin detaylı bilgilerini görüntüleme
- Liste ve grid görünüm seçenekleri

**Teknik Detaylar:**
- Kategori şeması validasyonu (Zod ile)
  - İsim min 2 karakter
  - Slug regex kontrolü (küçük harfler, sayılar ve tire)
- Kategorileri listeleme ve filtreleme fonksiyonları
  - İsim, durum, yazı sayısı ve tarih filtrelemeleri
  - Sütunlara göre sıralama fonksiyonu
- Toplu işlemler (seçili kategorileri silme veya aktif/pasif yapma)
- Grid ve liste görünümü arasında geçiş
- Ekleme/düzenleme modalları
- Dışa aktarma fonksiyonları (JSON, CSV, Excel)

**İşlevler:**
- Yeni kategori oluşturma
  - İsim otomatik slug oluşturma
  - Kategori açıklaması ve durum (aktif/pasif) belirleme
- Kategori düzenleme
  - Mevcut verileri form alanlarına doldurma
  - Değişiklikleri kaydetme
- Kategori silme
  - Tekli veya toplu silme işlemleri
  - Silme onayı dialogu
- Durum değiştirme (aktif/pasif)
- Kategori içeriklerini görüntüleme

### 5. Etiket Yönetim Sayfası (`/pages/dashboard/blog/tags/index.tsx`)

**Temel Özellikler:**
- Etiket listeleme ve yönetimi
- Yeni etiket ekleme
- Etiket düzenleme ve silme
- Etiketlerin kullanım istatistiklerini görüntüleme

**Teknik Detaylar:**
- Etiket şeması validasyonu (Zod ile)
  - İsim min 2 karakter
  - Slug regex kontrolü (küçük harfler, sayılar ve tire)
- Etiketleri listeleme ve filtreleme fonksiyonları
  - İsim, kullanım sayısı ve tarih filtrelemeleri
  - Sütunlara göre sıralama
- Toplu işlemler (seçili etiketleri silme)
- Grid ve liste görünümü
- Ekleme/düzenleme modalları
- Dışa aktarma fonksiyonları (JSON, CSV, Excel)

**İşlevler:**
- Yeni etiket oluşturma
  - İsimden otomatik slug oluşturma
- Etiket düzenleme
  - Mevcut verileri form alanlarına doldurma
  - Değişiklikleri kaydetme
- Etiket silme
  - Tekli veya toplu silme işlemleri
  - Silme onayı dialogu
- Etiket kullanım istatistiklerini görüntüleme
- Etiketleri arama ve filtreleme

## API Endpoints

### 1. Blog API Endpoints (`/pages/api/blog/`)

**`/pages/api/blog/index.ts` - Blog yazılarını listeleme ve yeni yazı oluşturma:**
- **GET** - Blog yazılarını listeleme
  - Filtreleme parametreleri: page, limit, category, tag, published, search
  - SEO için optimize edilmiş veri çıktısı
  - Yazılara ait kategoriler ve etiketleri de içeren kapsamlı veri
  - Sayfalama bilgileri (toplam yazı sayısı, toplam sayfa, mevcut sayfa)
- **POST** - Yeni blog yazısı oluşturma (admin yetkisi gerekli)
  - Başlık, içerik, özet, görsel URL'i, yayın durumu vb. alanlar
  - Slug oluşturma ve benzersizlik kontrolü
  - Kategori ve etiketlere bağlama işlemleri

**`/pages/api/blog/[slug].ts` - Belirli bir blog yazısı işlemleri:**
- **GET** - Blog yazısını detaylarıyla getirme
  - Görüntülenme sayısını artırma
  - Yazıya ait kategori ve etiketleri de içeren kapsamlı veri
  - SEO için optimize edilmiş veri
- **PUT** - Blog yazısını güncelleme (admin yetkisi gerekli)
  - Tüm blog yazısı alanlarını güncelleme
  - Kategori ve etiket bağlantılarını güncelleme
- **DELETE** - Blog yazısını silme (admin yetkisi gerekli)
  - İlişkili verilerin silinmesi (etiketler, kategoriler)

**`/pages/api/blog/categories/index.ts` - Blog kategorileri işlemleri:**
- **GET** - Tüm kategorileri listeleme
  - Her kategoriye ait yazı sayısını içeren veri

**`/pages/api/blog/tags/index.ts` - Blog etiketleri işlemleri:**
- **GET** - Tüm etiketleri listeleme
  - Her etikete ait yazı sayısını içeren veri

### 2. Dashboard API Endpoints (`/pages/api/dashboard/blog/`)

**`/pages/api/dashboard/blog/index.ts` - Admin blog yönetimi:**
- **GET** - Tüm blog yazılarını listeleme (admin yetkisi gerekli)
  - Hem yayınlanmış hem taslak durumundaki yazıları içerir
  - Detaylı filtreleme ve sıralama desteği
- **POST** - Yeni blog yazısı oluşturma (admin yetkisi gerekli)
  - Başlık, içerik, kategori, etiket, SEO bilgileri vb.

**`/pages/api/dashboard/blog/[id].ts` - Admin blog yazısı işlemleri:**
- **GET** - Belirli bir blog yazısını getirme (admin yetkisi gerekli)
- **PUT** - Blog yazısını güncelleme (admin yetkisi gerekli)
- **PATCH** - Blog yazısını kısmi güncelleme (admin yetkisi gerekli)
- **DELETE** - Blog yazısını silme (admin yetkisi gerekli)

**`/pages/api/dashboard/blog/categories/index.ts` - Admin kategori yönetimi:**
- **GET** - Tüm kategorileri listeleme (admin yetkisi gerekli)
  - Her kategoriye ait blog yazısı sayısını içerir
- **POST** - Yeni kategori oluşturma (admin yetkisi gerekli)
  - İsim, açıklama ve SEO bilgileri
  - Slug benzersizlik kontrolü

**`/pages/api/dashboard/blog/categories/[id].ts` - Admin kategori işlemleri:**
- **GET** - Belirli bir kategoriyi getirme (admin yetkisi gerekli)
- **PUT** - Kategoriyi güncelleme (admin yetkisi gerekli)
- **DELETE** - Kategoriyi silme (admin yetkisi gerekli)

**`/pages/api/dashboard/blog/tags/index.ts` - Admin etiket yönetimi:**
- **GET** - Tüm etiketleri listeleme (admin yetkisi gerekli)
- **POST** - Yeni etiket oluşturma (admin yetkisi gerekli)

**`/pages/api/dashboard/blog/tags/[id].ts` - Admin etiket işlemleri:**
- **GET** - Belirli bir etiketi getirme (admin yetkisi gerekli)
- **PUT** - Etiketi güncelleme (admin yetkisi gerekli)
- **DELETE** - Etiketi silme (admin yetkisi gerekli)

## Veri Modelleri (Prisma)

### Temel Blog Modelleri

```prisma
model BlogPost {
  id             String               @id @default(uuid())
  title          String
  slug           String               @unique
  content        String
  excerpt        String?
  imageUrl       String?
  published      Boolean              @default(false)
  publishedAt    DateTime?
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  viewCount      Int                  @default(0)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  authorId       Int
  author         User                 @relation(fields: [authorId], references: [id])
  categories     BlogPostToCategory[]
  tags           BlogPostToTag[]
}

model BlogCategory {
  id             String               @id @default(uuid())
  name           String
  slug           String               @unique
  description    String?
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  isActive       Boolean              @default(true)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  posts          BlogPostToCategory[]
}

model BlogTag {
  id        String          @id @default(uuid())
  name      String
  slug      String          @unique
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  posts     BlogPostToTag[]
}
```

### İlişki Tabloları

```prisma
model BlogPostToCategory {
  postId     String
  categoryId String
  assignedAt DateTime     @default(now())
  category   BlogCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  post       BlogPost     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([postId, categoryId])
}

model BlogPostToTag {
  postId     String
  tagId      String
  assignedAt DateTime @default(now())
  post       BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag        BlogTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}
```

### User Modeli İçindeki Blog İlişkisi

```prisma
model User {
  id                     Int                    @id @default(autoincrement())
  email                  String                 @unique
  password               String
  role                   Role                   @default(USER)
  firstName              String
  lastName               String
  // ... diğer alanlar
  blogPosts              BlogPost[]            // Blog yazıları ilişkisi - kullanıcı blog yazılarının yazarı olarak
  // ... diğer ilişkiler
}
```

### Role Enum (Blog Sistemi İçin)

```prisma
enum Role {
  USER
  ADMIN
  EDITOR  // Blog yazılarını düzenleyebilir ama tam admin yetkisine sahip değil
}
```

## Bileşenler

### Editor Bileşeni (`/components/Editor.tsx`)

**Özellikler:**
- TinyMCE zengin metin editörü entegrasyonu
- Görsel yükleme desteği
- Resim, bağlantı, tablo vb. formatlamalar
- Özelleştirilebilir araç çubukları
- HTML içerik düzenleme

### Etiket Giriş Bileşeni (`/components/TagInput.tsx`)

**Özellikler:**
- Etiket seçme ve ekleme
- Otomatik tamamlama
- Yeni etiket oluşturma
- Seçili etiketleri görüntüleme ve kaldırma
- Badge (rozet) stili ile etiket gösterimi

### UI Bileşenleri 

**Kullanılan UI Bileşenleri:**
- **Card** - İçerik kartları için (blog yazıları, kategoriler)
- **Button** - Tüm butonlar için
- **Input** - Form girişleri için
- **Textarea** - Uzun metin girişleri için
- **Select** - Dropdown seçimler için
- **Pagination** - Sayfalama için
- **Breadcrumb** - Navigasyon için
- **Badge** - Etiketler ve durumlar için
- **Tabs** - Sekmeli içerik için
- **Dialog** - Modal/diyalog pencereleri için
- **Form** - Form işlemleri için
- **Table** - Tablo görünümleri için

### Layout Bileşenleri

- **MainLayout** - Ana site düzeni (header, footer vb.)
- **DashboardLayout** - Yönetim paneli düzeni (sidebar, navbar vb.)

## Yardımcı Fonksiyonlar

### Genel Yardımcı Fonksiyonlar (`/lib/utils.ts`)

- **slugify** - Metni URL dostu slug'a dönüştürme
  ```typescript
  export function slugify(text: string): string {
    return text
      .toString()
      .normalize('NFKD')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  ```

- **formatDate** - Tarihleri biçimlendirme
  ```typescript
  export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }
  ```

### API Rate Limiting (`/lib/rateLimit.ts`)

- API isteklerini sınırlama
- DDoS koruması
- Belirli sürelerde belirli sayıda istek sınırlaması

## Güvenlik Önlemleri

- **Yetkilendirme Kontrolleri** - Admin yetkisi gerektiren işlemler için session kontrolleri
- **Rate Limiting** - API isteklerini sınırlama
- **Validasyon** - Giriş verilerinin doğrulanması
- **Hata İşleme** - Hataları yakalama ve güvenli şekilde işleme
- **Sanitizasyon** - HTML verileri için XSS koruması (TinyMCE editörü tarafında)

## Performans Optimizasyonları

- **Sayfalama** - Büyük veri setleri için verimli erişim
- **Filtreleme** - Sunucu tarafında verimli filtreleme
- **Sıralama** - Uygun indeksler ile verimli sıralama
- **SEO Optimizasyonu** - Sayfalar için meta etiketleri ve yapılandırılmış veri
- **Görüntü Optimizasyonu** - Görüntüler için boyut ve format optimizasyonu 