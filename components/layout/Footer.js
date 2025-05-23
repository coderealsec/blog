import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Github, Mail, Youtube, Linkedin, Rss, Terminal, Server, Cloud } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState([
    { name: 'GitHub', icon: Github, href: 'https://github.com/harunoner' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/in/harunoner' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/harunoner' },
    { name: 'RSS', icon: Rss, href: '/rss.xml' },
  ]);

  useEffect(() => {
    // Fetch social media settings from API
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch('/api/settings?section=social');
        const data = await response.json();
        
        if (data.success) {
          const socialData = data.data;
          const updatedLinks = [];
          
          if (socialData.github) {
            updatedLinks.push({ name: 'GitHub', icon: Github, href: socialData.github });
          }
          
          if (socialData.linkedin) {
            updatedLinks.push({ name: 'LinkedIn', icon: Linkedin, href: socialData.linkedin });
          }
          
          if (socialData.twitter) {
            updatedLinks.push({ name: 'Twitter', icon: Twitter, href: socialData.twitter });
          }
          
          if (socialData.facebook) {
            updatedLinks.push({ name: 'Facebook', icon: Facebook, href: socialData.facebook });
          }
          
          if (socialData.instagram) {
            updatedLinks.push({ name: 'Instagram', icon: Instagram, href: socialData.instagram });
          }
          
          if (socialData.youtube) {
            updatedLinks.push({ name: 'YouTube', icon: Youtube, href: socialData.youtube });
          }
          
          // Always include RSS
          updatedLinks.push({ name: 'RSS', icon: Rss, href: '/rss.xml' });
          
          if (updatedLinks.length > 0) {
            setSocialLinks(updatedLinks);
          }
        }
      } catch (error) {
        console.error('Error fetching social media links:', error);
      }
    };
    
    fetchSocialLinks();
  }, []);

  const footerLinks = [
    {
      title: 'İçerikler',
      links: [
        { name: 'Tüm Yazılar', href: '/blog' },
      ],
    },
    {
      title: 'Teknolojiler',
      links: [
        { name: 'Linux & Shell', href: '/category/linux-shell' },
        { name: 'AWS & Azure', href: '/category/aws-azure' },
        { name: 'Docker & K8s', href: '/category/docker-k8s' },
        { name: 'Git & CI/CD', href: '/category/git-cicd' },
        { name: 'Cloud & Infrastructure', href: '/category/cloud-infrastructure' },
        { name: 'Containerization', href: '/category/containerization' },
        { name: 'CI/CD & Automation', href: '/category/cicd-automation' },
      ],
    },
    {
      title: 'Kaynaklar',
      links: [
        { name: 'GitHub Repo', href: 'https://github.com/harunoner' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Terminal className="h-8 w-8 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-white font-mono">Harun <span className="text-green-500">ÖNER</span></span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              DevOps, bulut teknolojileri, container orchestration, CI/CD pipeline'ları ve altyapı otomasyonu 
              konularında güncel, teknik içerikler ve pratik çözümler sunan kişisel blog.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Navigation */}
          {footerLinks.map((column) => (
            <div key={column.title} className="mt-8 lg:mt-0">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Harun ÖNER Bülteni
            </h3>
            <p className="text-gray-400 mb-4">
              Haftalık DevOps ipuçları, yeni yazılar ve teknoloji güncellemeleri için abone olun.
            </p>
            <form className="flex gap-2">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="E-posta adresiniz"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span>Abone Ol</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {currentYear} Harun ÖNER. Tüm hakları saklıdır.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-green-500 text-sm">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-green-500 text-sm">
              Kullanım Koşulları
            </Link>
            <Link href="/sitemap.xml" className="text-gray-400 hover:text-green-500 text-sm">
              Site Haritası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 