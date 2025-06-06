"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Layout, Typography, Button, Space, Avatar, Dropdown } from "antd";
import { 
  UserOutlined, 
  DownOutlined, 
  LogoutOutlined, 
  ShareAltOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { useSidebar } from "@/contexts/SidebarContext";

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

interface HeaderProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const { collapsed, isMobile, toggleSidebar } = useSidebar(); 
  // Safety check for user object
  const safeUser = user || {};
  const [publicUrl, setPublicUrl] = useState<string>("");
  
  useEffect(() => {
    if (safeUser.id) {
      setPublicUrl(`/public-view/${safeUser.id}`);
    }
  }, [safeUser.id]);
  
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Link href="/auth/logout">
          <Space>
            <LogoutOutlined />
            ออกจากระบบ
          </Space>
        </Link>
      ),
    },
  ];
  
  return (
    <AntHeader style={{ 
      background: 'white', 
      padding: '0 24px', 
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)', 
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isMobile && (
          <Button 
            type="text" 
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            onClick={toggleSidebar}
            style={{ marginRight: 16, fontSize: '16px' }}
          />
        )}
        {/* Hide welcome text on mobile */}
        {!isMobile && (
          <Title level={4} style={{ margin: 0 }}>
            ยินดีต้อนรับ, {safeUser.name || "ผู้ใช้งาน"}
          </Title>
        )}
      </div>
      
      <Space>
        {publicUrl && (
          <Link href={publicUrl} target="_blank">
            <Button type="primary" icon={<ShareAltOutlined />}>
              {!isMobile ? "หน้าแสดงผลสาธารณะ" : ""}
            </Button>
          </Link>
        )}
        
        <Dropdown menu={{ items }}>
          <Button type="text">
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              {!isMobile ? safeUser.name || "ผู้ใช้งาน" : ""}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}