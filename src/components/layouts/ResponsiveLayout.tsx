"use client";

import { Layout } from "antd";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";

const { Content } = Layout;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function ResponsiveLayout({ children, user }: ResponsiveLayoutProps) {
  const { collapsed, isMobile, toggleSidebar, setCollapsed } = useSidebar();

  return (
    <Layout hasSider>
      <Sidebar user={user} />
      
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
        <Header user={user} />
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