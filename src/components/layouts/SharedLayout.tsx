// src/components/layouts/SharedLayout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Layout, Spin } from "antd";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import { useSidebar } from "@/contexts/SidebarContext";

const { Content } = Layout;

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { collapsed, isMobile, setCollapsed } = useSidebar();
  
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
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <Layout hasSider>
      <Sidebar user={session?.user || {}} />
      
      {isMobile && !collapsed && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            transition: 'opacity 0.3s'
          }}
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 256),
        transition: 'margin 0.2s',
        minHeight: "100vh"
      }}>
        <Header user={session?.user || {}} />
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff', 
          borderRadius: 4 
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}