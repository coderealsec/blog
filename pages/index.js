import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/button';
import { useEffect, useState } from 'react';
import { Terminal, Server, Cloud, GitBranch, FileCode, Workflow } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [latestPosts, setLatestPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (router.query.error === 'admin_required') {
      setError('Yalnızca yönetici hesapları dashboard\'a erişebilir.');
    }
  }, [router.query.error]);

  // Fetch latest blog posts
  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoadingPosts(true);
        
        // Fetch the latest 3 published posts
        const params = new URLSearchParams();
        params.append('limit', 3);
        params.append('orderBy', 'publishedAt');
        params.append('order', 'desc');
        
        const response = await fetch(`/api/blog?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Blog posts could not be fetched');
        }
        
        const data = await response.json();
        setLatestPosts(data.posts);
      } catch (err) {
        console.error('Error fetching latest posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    
    fetchLatestPosts();
  }, []);

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
            <Link href="/category/cloud-infrastructure">
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
            <Link href="/category/containerization">
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
            <Link href="/category/cicd-automation">
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
          
          {loadingPosts ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-400">İçerikler yükleniyor...</p>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Henüz içerik bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {latestPosts.map(post => (
                <div key={post.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center text-sm text-gray-400 mb-1">
                    {post.categories.length > 0 && (
                      <>
                        <Link 
                          href={`/category/${post.categories[0].slug}`}
                          className="bg-green-500 text-green-100 px-2 py-0.5 rounded text-xs font-medium hover:bg-green-600"
                        >
                          {post.categories[0].name}
                        </Link>
                        <span className="mx-2">•</span>
                      </>
                    )}
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {post.excerpt || post.content.substring(0, 150)}
                    {(!post.excerpt && post.content.length > 150) ? '...' : ''}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-gray-600 p-0">
                      Devamını Oku →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          
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
          <Link href="/category/linux-shell" className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 flex flex-col items-center transition-colors">
            <Terminal className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Linux & Shell</span>
          </Link>
          <Link href="/category/aws-azure" className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 flex flex-col items-center transition-colors">
            <Cloud className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">AWS & Azure</span>
          </Link>
          <Link href="/category/docker-k8s" className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 flex flex-col items-center transition-colors">
            <Server className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Docker & K8s</span>
          </Link>
          <Link href="/category/git-cicd" className="p-4 rounded-lg bg-gray-100 hover:bg-gray-200 flex flex-col items-center transition-colors">
            <GitBranch className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Git & CI/CD</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Set a title for this page to be used in the Layout
Home.title = 'Ana Sayfa';
