"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import ResponsiveLayout from "@/components/layouts/ResponsiveLayout";
import { Layout, Spin } from "antd";

const { Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large"  />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <ResponsiveLayout user={session?.user || {}}>
        {children}
      </ResponsiveLayout>
    </SidebarProvider>
  );
}