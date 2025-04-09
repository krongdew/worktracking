"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Typography, Spin } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ redirect: false });
      router.push("/auth/login?logged_out=true");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card style={{ width: 400, maxWidth: "100%", textAlign: "center" }} bordered={false}>
        <LogoutOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
        <Title level={3}>กำลังออกจากระบบ...</Title>
        <div className="flex justify-center mt-6">
          <Spin size="large" />
        </div>
      </Card>
    </div>
  );
}