import { useEffect } from 'react';
import Link from 'next/link';
import { Github, Construction, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  // Update page title
  useEffect(() => {
    document.title = 'Projeler - DevOpsHub';
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">Projeler</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            DevOps, Container orchestration ve Cloud native projelerimiz
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-12 border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Construction className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Çok Yakında</CardTitle>
            <CardDescription className="text-base">
              Proje sayfamız şu anda geliştirme aşamasındadır. Çok yakında burada DevOps, Kubernetes ve Cloud projelerimi paylaşacağım.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Şimdilik GitHub repolarımı inceleyebilir veya blog yazılarımı okuyabilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://github.com/devopshub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub Profilim
              </a>
              <Link href="/blog">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Blog Yazılarım
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Links */}
        <div className="grid grid-cols-1 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Teknoloji Kategorileri</CardTitle>
              <CardDescription>
                Teknoloji kategorilerine göre yazıları keşfedin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cloud, Containerization, CI/CD ve diğer teknoloji kategorilerindeki yazıları görüntüleyin.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/blog" className="text-green-600 hover:text-green-700 inline-flex items-center">
                Kategorileri keşfet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Note */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Projeler sayfası çok yakında burada olacak. Sorularınız veya işbirliği teklifleriniz için{' '}
            <Link href="/contact" className="text-green-600 hover:text-green-700">
              iletişim sayfasını
            </Link>{' '}
            ziyaret edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

// Set page title for Layout component
ProjectsPage.title = 'Projeler'; 