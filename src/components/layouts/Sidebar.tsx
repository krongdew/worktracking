"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography, Avatar, Divider } from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from 'antd';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  // Safety check for user object
  const safeUser = user || {};
  const pathname = usePathname() || '';
  
  const menuItems: MenuProps['items'] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">แดชบอร์ด</Link>,
    },
    {
      key: "/year-plan",
      icon: <CalendarOutlined />,
      label: <Link href="/year-plan">แผนงานประจำปี</Link>,
    },
    {
      key: "/todo-list",
      icon: <CheckSquareOutlined />,
      label: <Link href="/todo-list">รายการสิ่งที่ต้องทำ</Link>,
    },
    {
      key: "/task-tracking",
      icon: <LineChartOutlined />,
      label: <Link href="/task-tracking">ติดตามงาน</Link>,
    },
    {
      key: "/flowchart",
      icon: <NodeIndexOutlined />,
      label: <Link href="/flowchart">แผนผังกระบวนการ</Link>,
    },
  ];
  
  const logoutMenuItem: MenuProps['items'] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <Link href="/auth/logout">ออกจากระบบ</Link>,
    },
  ];
  
  return (
    <Sider
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
      theme="dark"
      width={256}
    >
      <div className="p-4 flex items-center justify-center">
        <Title level={4} style={{ margin: 0, color: "white" }}>
          ระบบติดตามงาน
        </Title>
      </div>
      
      <div className="p-4 text-center">
        <Avatar 
          size={64} 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff' }} 
        />
        <div className="mt-2">
          <Text strong style={{ color: "white" }}>
            {safeUser.name || "ผู้ใช้งาน"}
          </Text>
          <div>
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
              {safeUser.email || ""}
            </Text>
          </div>
        </div>
      </div>
      
      <Divider style={{ margin: '0 0 16px', borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Menu 
          theme="dark" 
          mode="inline"
          items={logoutMenuItem}
        />
      </div>
    </Sider>
  );
}