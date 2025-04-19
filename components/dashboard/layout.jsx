"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Oturum kontrolü
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Yetki kontrolü - Sadece ADMIN ve EDITOR kullanıcılara izin ver
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'EDITOR') {
      router.push('/'); // Yetkisiz kullanıcıları anasayfaya yönlendir
    }
  }, [session, status, router]);

  // Yükleniyor durumu
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-2">Yükleniyor...</p>
      </div>
    );
  }

  // Yetki kontrolü - Yetkisiz kullanıcılar için erken dönüş
  if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'EDITOR') {
    return null; // Yönlendirme beklenirken hiçbir şey gösterme
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <div className="flex-1 md:ml-72">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
} 