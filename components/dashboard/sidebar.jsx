"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  Plus,
  BarChart,
  MessageSquare,
  ImageIcon,
  Upload
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Sidebar menü öğeleri
const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: "Blog Yönetimi",
    items: [
      {
        title: "Tüm Yazılar",
        href: "/dashboard/blog/posts",
        icon: <FileText className="h-5 w-5" />
      },
      {
        title: "Yeni Yazı Ekle",
        href: "/dashboard/blog/new",
        icon: <Plus className="h-5 w-5" />
      },
      {
        title: "Kategoriler",
        href: "/dashboard/blog/categories",
        icon: <FolderOpen className="h-5 w-5" />
      },
      {
        title: "Etiketler",
        href: "/dashboard/blog/tags",
        icon: <Tag className="h-5 w-5" />
      }
    ]
  },
  {
    title: "Yorumlar",
    href: "/dashboard/comments",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    title: "Medya",
    href: "/dashboard/media",
    icon: <ImageIcon className="h-5 w-5" />
  },
  {
    title: "İstatistikler",
    href: "/dashboard/analytics",
    icon: <BarChart className="h-5 w-5" />
  },
  {
    title: "Kullanıcılar",
    href: "/dashboard/users",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Ayarlar",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />
  }
];

export function DashboardSidebar({ className }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // Alt menü açma/kapama durumlarını yönet
  const [openSubmenu, setOpenSubmenu] = useState({});
  
  const toggleSubmenu = (title) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Oturumu kapat
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Mobile menü bileşeni
  const MobileSidebar = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü Aç</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <ScrollArea className="h-full py-6">
          <SidebarContent closeMenu={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
  
  // Sidebar içeriği
  const SidebarContent = ({ closeMenu = () => {} }) => (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <div className="mb-6 px-4">
          <Link href="/dashboard" onClick={closeMenu}>
            <h2 className="text-2xl font-bold">Harun ÖNER</h2>
            <p className="text-sm text-gray-500">Yönetim Paneli</p>
          </Link>
        </div>
        <div className="space-y-1">
          {sidebarItems.map((item, i) => {
            // Alt menüsü olan öğeler
            if (item.items) {
              return (
                <div key={i} className="mb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium"
                    onClick={() => toggleSubmenu(item.title)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`ml-auto h-4 w-4 transition-transform ${
                        openSubmenu[item.title] ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </Button>
                  {openSubmenu[item.title] && (
                    <div className="ml-4 pl-4 border-l space-y-1 my-1">
                      {item.items.map((subItem, j) => (
                        <Link
                          key={j}
                          href={subItem.href}
                          onClick={closeMenu}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                            router.pathname === subItem.href
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-500"
                          )}
                        >
                          {subItem.icon}
                          <span>{subItem.title}</span>
                          {subItem.title === "Yeni Yazı Ekle" && (
                            <Upload className="ml-auto h-4 w-4 text-green-500" />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // Normal menü öğeleri
            return (
              <Link
                key={i}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                  router.pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
          
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 font-medium mt-4"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Çıkış Yap</span>
          </Button>
        </div>
      </div>
      
      {/* Oturum bilgisi */}
      <div className="mt-auto border-t pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
            {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "?"}
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium truncate">{session?.user?.name || session?.user?.email}</p>
            <div className="flex items-center">
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                session?.user?.role === 'ADMIN' 
                  ? 'bg-red-100 text-red-700' 
                  : session?.user?.role === 'EDITOR' 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {session?.user?.role || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobil menü */}
      <MobileSidebar />
      
      {/* Masaüstü sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-10 hidden w-72 border-r bg-white md:flex md:flex-col", className)}>
        <ScrollArea className="flex-1 pt-4">
          <SidebarContent />
        </ScrollArea>
      </aside>
    </>
  );
} 