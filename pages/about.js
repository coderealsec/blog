import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Award, 
  BookOpen, 
  Briefcase, 
  Code,
  Database,
  Server,
  Cloud,
  GitBranch
} from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <div className="container max-w-4xl py-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 pt-10 pb-6">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-green-500/20">
              <Image 
                src="/images/harun-oner.jpg" 
                alt="Harun Öner" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        <div className="md:w-2/3 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Harun Öner</h1>
          <h2 className="text-2xl font-medium text-gray-600 mb-4">Senior DevOps Engineer</h2>
          <div className="flex items-center justify-center md:justify-start space-x-4 mb-6">
            <a href="https://github.com/harunoner" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/harunoner" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/harunoner" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-400">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:harun@devopshub.com" className="text-gray-700 hover:text-red-500">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://harunoner.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">
              <Globe className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-700">
            7+ yıllık DevOps ve Cloud deneyimine sahip, altyapı otomasyonu ve sürekli entegrasyon/dağıtım (CI/CD) konularında uzmanlaşmış bir mühendisim. Bu blogda, DevOps pratikleri, konteyner teknolojileri ve bulut altyapıları hakkında deneyimlerimi ve öğrendiklerimi paylaşıyorum.
          </p>
        </div>
      </div>

      {/* Bio Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Hakkımda</h2>
        <p className="mb-4">
          Merhaba, ben Harun. İstanbul'da yaşayan bir DevOps mühendisiyim. Kariyerime geleneksel sistem yöneticisi olarak başladım ve zaman içinde modern DevOps pratiklerini benimseyerek bu alanda uzmanlaştım.
        </p>
        <p className="mb-4">
          Şu anda fintech sektöründe büyük ölçekli bir şirkette Senior DevOps Engineer olarak çalışıyorum. Görevim, geliştirme ekiplerine hızlı ve güvenli bir şekilde kod dağıtmalarını sağlayacak altyapıyı sunmak ve bu süreçleri sürekli iyileştirmek.
        </p>
        <p>
          Bu blog, DevOps dünyasındaki deneyimlerimi, karşılaştığım zorlukları ve bulduğum çözümleri paylaşmak için oluşturduğum bir platform. Özellikle Kubernetes, Docker, Terraform, AWS ve CI/CD pipeline'ları hakkında içerikler bulacaksınız.
        </p>
      </section>

      {/* Experience Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Deneyim</h2>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <p className="text-gray-600 font-medium">2020 - Günümüz</p>
            </div>
            <div className="sm:w-2/3">
              <h3 className="font-bold text-lg">Senior DevOps Engineer</h3>
              <p className="text-gray-700 mb-2">FinTech A.Ş.</p>
              <p className="text-gray-600">Kubernetes kümelerinin yönetimi, CI/CD pipeline'larının oluşturulması, altyapı otomasyonu ve ekip liderliği.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <p className="text-gray-600 font-medium">2018 - 2020</p>
            </div>
            <div className="sm:w-2/3">
              <h3 className="font-bold text-lg">DevOps Engineer</h3>
              <p className="text-gray-700 mb-2">Teknoloji Ltd.</p>
              <p className="text-gray-600">AWS bulut altyapısı kurulumu, Docker konteynerizasyonu, Jenkins ve GitLab CI/CD entegrasyonları.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <p className="text-gray-600 font-medium">2016 - 2018</p>
            </div>
            <div className="sm:w-2/3">
              <h3 className="font-bold text-lg">Sistem Yöneticisi</h3>
              <p className="text-gray-700 mb-2">BT Sistemleri</p>
              <p className="text-gray-600">Linux sunucu yönetimi, altyapı izleme, otomasyon scripti geliştirme ve günlük operasyonlar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 flex items-center">
            <BookOpen className="mr-2 h-5 w-5" /> Eğitim
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Bilgisayar Mühendisliği, Yüksek Lisans</h3>
              <p className="text-gray-700">İstanbul Teknik Üniversitesi (2015-2017)</p>
            </div>
            <div>
              <h3 className="font-bold">Bilgisayar Mühendisliği, Lisans</h3>
              <p className="text-gray-700">Yıldız Teknik Üniversitesi (2011-2015)</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2 flex items-center">
            <Award className="mr-2 h-5 w-5" /> Sertifikalar
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">AWS Certified DevOps Engineer - Professional</h3>
              <p className="text-gray-700">Amazon Web Services (2022)</p>
            </div>
            <div>
              <h3 className="font-bold">Certified Kubernetes Administrator (CKA)</h3>
              <p className="text-gray-700">Cloud Native Computing Foundation (2021)</p>
            </div>
            <div>
              <h3 className="font-bold">HashiCorp Certified: Terraform Associate</h3>
              <p className="text-gray-700">HashiCorp (2020)</p>
            </div>
          </div>
        </section>
      </div>

      {/* Skills Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 flex items-center">
          <Briefcase className="mr-2 h-5 w-5" /> Yeteneklerim
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <Cloud className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="font-bold">Cloud Platformları</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>AWS (EC2, S3, EKS, Lambda)</li>
              <li>Azure (AKS, Functions)</li>
              <li>Google Cloud Platform</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <Server className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="font-bold">Konteynerizasyon</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Docker</li>
              <li>Kubernetes</li>
              <li>Helm</li>
              <li>Istio</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <Code className="w-5 h-5 mr-2 text-purple-600" />
              <h3 className="font-bold">Altyapı Otomasyonu</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Terraform</li>
              <li>Ansible</li>
              <li>CloudFormation</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <GitBranch className="w-5 h-5 mr-2 text-orange-600" />
              <h3 className="font-bold">CI/CD</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Jenkins</li>
              <li>GitHub Actions</li>
              <li>GitLab CI/CD</li>
              <li>ArgoCD</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <Database className="w-5 h-5 mr-2 text-red-600" />
              <h3 className="font-bold">Veritabanları</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Next.js</li>
              <li>PostgreSQL</li>
              <li>Cloudflare R2</li>
              <li>TailwindCSS</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
              <h3 className="font-bold">Programlama</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Python</li>
              <li>Bash</li>
              <li>Go (öğrenme aşamasında)</li>
              <li>JavaScript</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Bana Ulaşın</h2>
        <p className="mb-6 max-w-xl mx-auto">
          DevOps, bulut teknolojileri veya altyapı otomasyonu konularında işbirliği yapmak, danışmanlık almak veya sadece sohbet etmek isterseniz, iletişime geçmekten çekinmeyin.
        </p>
        <Link href="/contact" passHref>
          <Button size="lg">
            <Mail className="mr-2 h-4 w-4" />
            İletişim Sayfası
          </Button>
        </Link>
      </section>
    </div>
  );
}

About.getLayout = function getLayout(page) {
  return (
    <Layout title="Hakkımda">
      {page}
    </Layout>
  );
}; 