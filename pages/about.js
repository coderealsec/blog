import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function About() {
  // Update page title
  useEffect(() => {
    document.title = 'Hakkımda - DevOpsHub';
  }, []);

  const skills = [
    {
      category: 'Cloud Platformları',
      icon: <Cloud className="w-5 h-5 text-blue-600" />,
      items: ['AWS (EC2, S3, EKS, Lambda)', 'Azure (AKS, Functions)', 'Google Cloud Platform']
    },
    {
      category: 'Konteynerizasyon',
      icon: <Server className="w-5 h-5 text-green-600" />,
      items: ['Docker', 'Kubernetes', 'Helm', 'Istio']
    },
    {
      category: 'Altyapı Otomasyonu',
      icon: <Code className="w-5 h-5 text-purple-600" />,
      items: ['Terraform', 'Ansible', 'CloudFormation']
    },
    {
      category: 'CI/CD',
      icon: <GitBranch className="w-5 h-5 text-orange-600" />,
      items: ['Jenkins', 'GitHub Actions', 'GitLab CI/CD', 'ArgoCD']
    },
    {
      category: 'Programlama',
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      items: ['Python', 'Bash', 'Go (öğrenme aşamasında)', 'JavaScript']
    }
  ];

  const experience = [
    {
      period: '2020 - Günümüz',
      title: 'Senior DevOps Engineer',
      company: 'FinTech A.Ş.',
      description: 'Kubernetes kümelerinin yönetimi, CI/CD pipeline\'larının oluşturulması, altyapı otomasyonu ve ekip liderliği.'
    },
    {
      period: '2018 - 2020',
      title: 'DevOps Engineer',
      company: 'Teknoloji Ltd.',
      description: 'AWS bulut altyapısı kurulumu, Docker konteynerizasyonu, Jenkins ve GitLab CI/CD entegrasyonları.'
    },
    {
      period: '2016 - 2018',
      title: 'Sistem Yöneticisi',
      company: 'BT Sistemleri',
      description: 'Linux sunucu yönetimi, altyapı izleme, otomasyon scripti geliştirme ve günlük operasyonlar.'
    }
  ];

  const certifications = [
    {
      title: 'AWS Certified DevOps Engineer - Professional',
      organization: 'Amazon Web Services',
      year: '2022'
    },
    {
      title: 'Certified Kubernetes Administrator (CKA)',
      organization: 'Cloud Native Computing Foundation',
      year: '2021'
    },
    {
      title: 'HashiCorp Certified: Terraform Associate',
      organization: 'HashiCorp',
      year: '2020'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <Card className="mb-12 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-green-500 to-green-700 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex justify-center -mt-16 mb-4 md:mb-0">
                <div className="relative w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image 
                src="/images/harun-oner.jpg" 
                alt="Harun Öner" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
              <div className="md:w-2/3 md:pl-4 text-center md:text-left pt-4 md:pt-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Harun Öner</h1>
                <h2 className="text-lg font-medium text-gray-600 mb-3">Senior DevOps Engineer</h2>
                
                <div className="flex justify-center md:justify-start space-x-4 mb-4">
                  <a href="https://github.com/harunoner" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-600 hover:text-black transition-colors">
              <Github className="w-5 h-5" />
            </a>
                  <a href="https://linkedin.com/in/harunoner" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-600 hover:text-blue-600 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
                  <a href="https://twitter.com/harunoner" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-600 hover:text-blue-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
                  <a href="mailto:harun@devopshub.com" 
                     className="text-gray-600 hover:text-red-500 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
                  <a href="https://harunoner.com" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-600 hover:text-green-600 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
                
                <p className="text-gray-600 text-sm">
                  7+ yıllık DevOps ve Cloud deneyimine sahip, altyapı otomasyonu ve sürekli entegrasyon/dağıtım (CI/CD) konularında uzmanlaşmış bir mühendisim.
          </p>
        </div>
      </div>
          </div>
        </Card>

      {/* Bio Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hakkımda</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 space-y-4">
            <p>
          Merhaba, ben Harun. İstanbul'da yaşayan bir DevOps mühendisiyim. Kariyerime geleneksel sistem yöneticisi olarak başladım ve zaman içinde modern DevOps pratiklerini benimseyerek bu alanda uzmanlaştım.
        </p>
            <p>
          Şu anda fintech sektöründe büyük ölçekli bir şirkette Senior DevOps Engineer olarak çalışıyorum. Görevim, geliştirme ekiplerine hızlı ve güvenli bir şekilde kod dağıtmalarını sağlayacak altyapıyı sunmak ve bu süreçleri sürekli iyileştirmek.
        </p>
        <p>
          Bu blog, DevOps dünyasındaki deneyimlerimi, karşılaştığım zorlukları ve bulduğum çözümleri paylaşmak için oluşturduğum bir platform. Özellikle Kubernetes, Docker, Terraform, AWS ve CI/CD pipeline'ları hakkında içerikler bulacaksınız.
        </p>
          </CardContent>
        </Card>

      {/* Experience Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-gray-500" />
                Deneyim
            </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {experience.map((job, index) => (
                <div key={index} className="relative pl-6 pb-1">
                  {index !== experience.length - 1 && (
                    <div className="absolute top-1 left-[7px] bottom-0 w-[1px] bg-gray-200"></div>
                  )}
                  <div className="absolute top-1 left-0 w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 mb-1 sm:mb-0">
                      <Badge variant="outline" className="text-xs font-normal">{job.period}</Badge>
            </div>
            <div className="sm:w-2/3">
                      <h3 className="font-bold">{job.title}</h3>
                      <p className="text-gray-700 text-sm mb-1">{job.company}</p>
                      <p className="text-gray-600 text-sm">{job.description}</p>
            </div>
          </div>
        </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">
                  <div className="flex items-center">
                    <Code className="mr-2 h-5 w-5 text-gray-500" />
                    Yetenekler
            </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        {skill.icon}
                        <h3 className="font-medium ml-2">{skill.category}</h3>
            </div>
                      <ul className="text-gray-600 text-sm space-y-1">
                        {skill.items.map((item, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {item}
                          </li>
                        ))}
            </ul>
          </div>
                  ))}
            </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">
                  <div className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-gray-500" />
                    Sertifikalar
            </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <h3 className="font-medium text-sm">{cert.title}</h3>
                      <div className="flex items-center justify-between text-gray-600 text-xs">
                        <span>{cert.organization}</span>
                        <Badge variant="secondary" className="ml-2">{cert.year}</Badge>
          </div>
            </div>
                  ))}
          </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-0">
          <CardHeader>
            <CardTitle>Bana Ulaşın</CardTitle>
            <CardDescription>
          DevOps, bulut teknolojileri veya altyapı otomasyonu konularında işbirliği yapmak, danışmanlık almak veya sadece sohbet etmek isterseniz, iletişime geçmekten çekinmeyin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-green-600 hover:bg-green-700">
            <Mail className="mr-2 h-4 w-4" />
            İletişim Sayfası
          </Button>
        </Link>
              <Link href="/blog">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Blog Yazılarım
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Set page title for Layout component
About.title = 'Hakkımda'; 