import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { Menu, Code, ChevronDown, Terminal, Server, Cloud, GitBranch } from 'lucide-react';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '../ui/sheet';

// Navigation links for the navbar
const navigation = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Blog', href: '/blog' },
  { 
    name: 'Teknolojiler', 
    href: '#',
    children: [
      { name: 'Docker', href: '/category/docker' },
      { name: 'Kubernetes', href: '/category/kubernetes' },
      { name: 'CI/CD', href: '/category/cicd' },
      { name: 'AWS', href: '/category/aws' },
      { name: 'Azure', href: '/category/azure' },
      { name: 'Infrastructure as Code', href: '/category/iac' },
    ]
  },
  { name: 'Projeler', href: '/projects' },
  { name: 'Hakkımda', href: '/about' },
  { name: 'İletişim', href: '/contact' },
];

export default function Navbar({ session }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to handle signout
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-900 shadow-md' 
          : 'bg-gray-900/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Terminal className="h-8 w-8 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-white font-mono">DevOps<span className="text-green-500">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => 
              !item.children ? (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    router.pathname === item.href
                      ? 'border-green-500 text-white'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {item.name}
                </Link>
              ) : (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-gray-300 hover:text-white hover:border-gray-500">
                    {item.name} <ChevronDown size={16} className="ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-gray-800 border-gray-700">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.name} asChild className="text-gray-200 hover:text-white focus:bg-gray-700">
                        <Link href={child.href} className="w-full">
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            )}
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-10 w-10 bg-gray-800 hover:bg-gray-700">
                    <Avatar>
                      <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-green-700 text-white">{getInitials(session.user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="text-gray-200">
                    <div className="flex flex-col">
                      <span>{session.user?.name}</span>
                      <span className="text-xs text-gray-400">{session.user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild className="text-gray-200 hover:text-white focus:bg-gray-700">
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  {session.user?.role === 'ADMIN' && (
                    <DropdownMenuItem asChild className="text-gray-200 hover:text-white focus:bg-gray-700">
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-gray-200 hover:text-white focus:bg-gray-700">
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login" passHref>
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">Giriş</Button>
                </Link>
                <Link href="/auth/register" passHref>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-gray-300 hover:text-white hover:bg-gray-800">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-gray-900 text-gray-200 border-gray-800">
                <div className="flex flex-col h-full">
                  <div className="py-6 px-4 space-y-6">
                    {/* Mobile navigation */}
                    <nav className="flex flex-col space-y-4">
                      {navigation.map((item) => 
                        !item.children ? (
                          <SheetClose asChild key={item.name}>
                            <Link 
                              href={item.href}
                              className={`text-base font-medium ${
                                router.pathname === item.href
                                  ? 'text-green-500'
                                  : 'text-gray-200 hover:text-green-400'
                              }`}
                            >
                              {item.name}
                            </Link>
                          </SheetClose>
                        ) : (
                          <div key={item.name} className="space-y-2">
                            <div className="text-base font-medium text-gray-200">
                              {item.name}
                            </div>
                            <div className="pl-4 space-y-3 border-l-2 border-gray-700">
                              {item.children.map((child) => (
                                <SheetClose asChild key={child.name}>
                                  <Link 
                                    href={child.href}
                                    className="text-sm text-gray-300 hover:text-green-400 block"
                                  >
                                    {child.name}
                                  </Link>
                                </SheetClose>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </nav>
                  </div>

                  {/* Mobile auth buttons */}
                  <div className="mt-auto border-t border-gray-800 py-6 px-4">
                    {session ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                            <AvatarFallback className="bg-green-700 text-white">{getInitials(session.user?.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{session.user?.name}</p>
                            <p className="text-xs text-gray-400">{session.user?.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <SheetClose asChild>
                            <Link href="/profile" passHref>
                              <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800">Profil</Button>
                            </Link>
                          </SheetClose>
                          {session.user?.role === 'ADMIN' && (
                            <SheetClose asChild>
                              <Link href="/dashboard" passHref>
                                <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800">Dashboard</Button>
                              </Link>
                            </SheetClose>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800" 
                            onClick={handleSignOut}
                          >
                            Çıkış Yap
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <SheetClose asChild>
                          <Link href="/auth/login" passHref>
                            <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800">Giriş</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/auth/register" passHref>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Kayıt Ol</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 