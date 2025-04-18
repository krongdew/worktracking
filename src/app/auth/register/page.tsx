"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Form, Input, Card, Typography, Alert} from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
};

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const onFinish = async (values: FormValues) => {
    setIsLoading(true);
    setGeneralError("");
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", values.name);
    formDataToSend.append("email", values.email);
    formDataToSend.append("password", values.password);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          // ถ้า error เป็น object มี field errors
          if (typeof data.error === 'object') {
            for (const [field, errors] of Object.entries(data.error)) {
              form.setFields([
                {
                  name: field,
                  errors: Array.isArray(errors) ? errors : [errors?.toString()]
                }
              ]);
            }
          } else {
            setGeneralError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
          }
        } else {
          setGeneralError("เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
        setIsLoading(false);
        return;
      }
      
      // Registration successful, redirect to login
      router.push("/auth/login?registered=true");
    } catch (error) {
      setGeneralError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card style={{ width: 400, maxWidth: "100%" }} bordered={false}>
        <div className="text-center mb-6">
          <Title level={2} style={{ marginBottom: 8 }}>สมัครสมาชิก</Title>
        </div>
        
        {generalError && (
          <Alert 
            message={generalError}
            type="error" 
            showIcon 
            className="mb-4" 
          />
        )}
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="ชื่อ"
            rules={[
              { required: true, message: 'กรุณากรอกชื่อ' },
              { min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="ชื่อ" size="large" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="อีเมล" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[
              { required: true, message: 'กรุณากรอกรหัสผ่าน' },
              { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="รหัสผ่าน" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="ยืนยันรหัสผ่าน" 
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
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center">
          <Text>
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}