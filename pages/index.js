import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { useEffect, useState } from 'react';
import { Terminal, Server, Cloud, GitBranch, FileCode, Workflow } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.error === 'admin_required') {
      setError('Yalnızca yönetici hesapları dashboard\'a erişebilir.');
    }
  }, [router.query.error]);

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 max-w-xl mx-auto">
          {error}
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto my-16">
        <Terminal className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-5xl font-bold mb-6">DevOps<span className="text-green-500">Hub</span></h1>
        <p className="text-xl text-gray-600 mb-8">
          Docker, Kubernetes, CI/CD, Cloud ve Infrastructure as Code konularında teknik içerikler, uygulamalı örnekler ve en iyi pratikler.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link href="/blog">
            <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700">Tüm Yazılar</Button>
          </Link>
          {!session && (
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="px-8 border-green-600 text-green-600 hover:bg-green-50">Kayıt Ol</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <Cloud className="h-20 w-20 text-green-500" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Cloud & Infrastructure</h3>
            <p className="text-gray-600 mb-4">AWS, Azure ve GCP servisleri, IaC araçları ve modern altyapı yönetimi çözümleri.</p>
            <Link href="/category/cloud">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">Keşfet</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <Server className="h-20 w-20 text-green-500" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">Containerization</h3>
            <p className="text-gray-600 mb-4">Docker, Kubernetes, service mesh ve modern container orchestration çözümleri.</p>
            <Link href="/category/containers">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">Keşfet</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <Workflow className="h-20 w-20 text-green-500" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">CI/CD & Automation</h3>
            <p className="text-gray-600 mb-4">Jenkins, GitLab CI, GitHub Actions ve modern CI/CD pipeline'ları için otomatizasyon çözümleri.</p>
            <Link href="/category/cicd">
              <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">Keşfet</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-xl mb-16">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4 text-white">En Son İçerikler</h2>
          <p className="text-gray-300 mb-8">
            DevOps dünyasındaki en güncel teknolojiler ve pratik çözümler hakkında yazılar
          </p>
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <span className="bg-green-500 text-green-100 px-2 py-0.5 rounded text-xs font-medium">Kubernetes</span>
                <span className="mx-2">•</span>
                <span>15 Nisan 2023</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Kubernetes'te Otomatik Ölçeklendirme: HPA vs. VPA vs. CA</h3>
              <p className="text-gray-300 mb-4">Kubernetes'in sunduğu üç farklı otomatik ölçeklendirme mekanizmasının karşılaştırması ve gerçek dünya senaryolarındaki uygulamaları.</p>
              <Link href="/blog/kubernetes-scaling">
                <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-gray-600 p-0">Devamını Oku →</Button>
              </Link>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <span className="bg-green-500 text-green-100 px-2 py-0.5 rounded text-xs font-medium">Terraform</span>
                <span className="mx-2">•</span>
                <span>10 Nisan 2023</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Terraform ile Multi-Cloud Stratejileri</h3>
              <p className="text-gray-300 mb-4">Farklı bulut sağlayıcılarında Terraform ile altyapı yönetimi ve modüler yaklaşımlarla tekrar kullanılabilir kod yapısı oluşturma.</p>
              <Link href="/blog/terraform-multi-cloud">
                <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-gray-600 p-0">Devamını Oku →</Button>
              </Link>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <span className="bg-green-500 text-green-100 px-2 py-0.5 rounded text-xs font-medium">CI/CD</span>
                <span className="mx-2">•</span>
                <span>5 Nisan 2023</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">GitHub Actions ile Güvenli Docker Image CI/CD</h3>
              <p className="text-gray-300 mb-4">GitHub Actions kullanarak Docker imajlarının güvenli bir şekilde build edilmesi, test edilmesi ve dağıtılması için modern pipeline yaklaşımları.</p>
              <Link href="/blog/github-actions-docker">
                <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-gray-600 p-0">Devamını Oku →</Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/blog">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Tüm Yazıları Görüntüle</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Teknoloji Yığını</h2>
        <p className="text-gray-600 mb-8">
          Bu blogda paylaşılan teknolojiler ve araçlar
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-100 flex flex-col items-center">
            <Terminal className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Linux & Shell</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-100 flex flex-col items-center">
            <Cloud className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">AWS & Azure</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-100 flex flex-col items-center">
            <Server className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Docker & K8s</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-100 flex flex-col items-center">
            <GitBranch className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Git & CI/CD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Set a title for this page to be used in the Layout
Home.title = 'Ana Sayfa';
