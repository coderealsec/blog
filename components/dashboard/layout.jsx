"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      
      <div className="flex-1 md:ml-72">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
} 