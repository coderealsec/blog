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
    children: [] // Will be filled dynamically
  },
  { name: 'Projeler', href: '/projects' },
  { name: 'Hakkımda', href: '/about' },
  { name: 'İletişim', href: '/contact' },
];

// Helper function to get user initials for avatar fallback
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default function Navbar({ session }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [navigationWithCategories, setNavigationWithCategories] = useState(navigation);
  const [isOpen, setIsOpen] = useState(false);

  // Handle sign out function
  const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut({ callbackUrl: "/" });
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/blog/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          // Filter active categories
          const activeCategories = categoriesData.filter(cat => cat.isActive);
          
          // Update categories state
          setCategories(activeCategories);
          
          // Update navigation with fetched categories
          const updatedNavigation = navigation.map(item => {
            if (item.name === 'Teknolojiler') {
              return {
                ...item,
                children: activeCategories.map(category => ({
                  name: category.name,
                  href: `/category/${category.slug}`
                }))
              };
            }
            return item;
          });
          
          setNavigationWithCategories(updatedNavigation);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Terminal className="h-8 w-8 text-green-500" />
              <span className="ml-2 text-xl font-bold text-white font-mono">DevOps<span className="text-green-500">Hub</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              {navigationWithCategories.map((item) => {
                if (item.children && item.children.length > 0) {
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center">
                          {item.name} <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.name} asChild className="text-gray-200 hover:text-white focus:bg-gray-700">
                            <Link href={child.href}>{child.name}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                
                return (
                  <Link key={item.name} href={item.href} passHref>
                    <Button 
                      variant="ghost" 
                      className={`text-gray-300 hover:text-white hover:bg-gray-800 ${
                        router.pathname === item.href ? 'bg-gray-800 text-white' : ''
                      }`}
                    >
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

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
              <SheetContent side="right" className="w-full sm:max-w-md bg-gray-900 border-gray-700 text-white p-0">
                <div className="flex flex-col h-full space-y-6 p-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                      <Terminal className="h-8 w-8 text-green-500 mr-2" />
                      <span className="text-xl font-bold font-mono">DevOps<span className="text-green-500">Hub</span></span>
                    </Link>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-1 py-4">
                      {navigationWithCategories.map((item) => {
                        if (item.children && item.children.length > 0) {
                          return (
                            <div key={item.name} className="mb-2">
                              <div className="text-lg font-semibold text-gray-200 mb-1">{item.name}</div>
                              <div className="space-y-1 pl-4">
                                {item.children.map((child) => (
                                  <SheetClose asChild key={child.name}>
                                    <Link href={child.href} passHref>
                                      <Button 
                                        variant="ghost" 
                                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800" 
                                      >
                                        {child.name}
                                      </Button>
                                    </Link>
                                  </SheetClose>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <SheetClose asChild key={item.name}>
                            <Link href={item.href} passHref>
                              <Button 
                                variant="ghost" 
                                className={`w-full justify-start text-lg ${
                                  router.pathname === item.href 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                }`}
                              >
                                {item.name}
                              </Button>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>

                  {session ? (
                    <div className="pt-6 border-t border-gray-800">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={session.user?.image} alt={session.user?.name || 'User'} />
                          <AvatarFallback className="bg-green-700 text-white">{getInitials(session.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{session.user?.name}</div>
                          <div className="text-sm text-gray-400">{session.user?.email}</div>
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
                    <div className="pt-6 border-t border-gray-800 space-y-2">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 