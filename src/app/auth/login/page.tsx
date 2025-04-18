"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // ใช้ URLSearchParams แทน useSearchParams
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const registered = searchParams?.get("registered") === "true";

  const onFinish = async (values: FormValues) => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
        return;
      }
      
      router.push(callbackUrl);
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card style={{ width: 400, maxWidth: "100%" }} bordered={false}>
        <div className="text-center mb-6">
          <Title level={2} style={{ marginBottom: 8 }}>เข้าสู่ระบบติดตามงาน</Title>
        </div>
        
        {registered && (
          <Alert
            message="ลงทะเบียนสำเร็จ"
            description="คุณสามารถเข้าสู่ระบบด้วยข้อมูลที่ลงทะเบียนได้เลย"
            type="success"
            showIcon
            className="mb-4"
          />
        )}
        
        {error && (
          <Alert 
            message={error}
            type="error" 
            showIcon 
            className="mb-4" 
          />
        )}
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="อีเมล" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="รหัสผ่าน" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              size="large"
              block
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center">
          <Text>
            ยังไม่มีบัญชี?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              สมัครสมาชิก
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}