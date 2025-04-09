"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Layout, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Card, 
  Space
} from "antd";
import {
  CalendarOutlined,
  CheckSquareOutlined,
  LineChartOutlined,
  NodeIndexOutlined
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return <div>กำลังโหลด...</div>;
  }
  
  return (
    <Layout className="layout">
      <Header style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%"
        }}>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            ระบบติดตามงาน
          </Title>
          
          <Space>
            <Link href="/auth/login">
              <Button type="primary" size="large">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="large">
                สมัครสมาชิก
              </Button>
            </Link>
          </Space>
        </div>
      </Header>
      
      <Content>
        <div style={{ 
          textAlign: "center", 
          padding: "80px 24px",
          background: "linear-gradient(to right, #1890ff, #52c41a)", 
          color: "white"
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Title style={{ color: "white", marginBottom: 24 }}>
              ติดตามงานของคุณอย่างมีประสิทธิภาพ
            </Title>
            <Paragraph style={{ fontSize: 18, color: "white", marginBottom: 32 }}>
              ระบบติดตามงานช่วยให้คุณวางแผน จัดการ และติดตามความคืบหน้าของงานได้อย่างมีประสิทธิภาพ
              เหมาะสำหรับทั้งบุคคลทั่วไปและองค์กร
            </Paragraph>
            <Link href="/auth/register">
              <Button type="primary" size="large" ghost style={{ fontSize: 16, height: 48, padding: "0 32px" }}>
                เริ่มใช้งานฟรี
              </Button>
            </Link>
          </div>
        </div>
        
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 48 }}>
            คุณสมบัติเด่น
          </Title>
          
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{ height: "100%" }}
                bordered={false}
                className="hover:shadow-lg transition-shadow"
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <CalendarOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </div>
                <Title level={4} style={{ textAlign: "center" }}>แผนงานประจำปี</Title>
                <Paragraph style={{ textAlign: "center" }}>
                  วางแผนกิจกรรมและงานตลอดทั้งปีด้วย Gantt Chart ที่ใช้งานง่าย
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{ height: "100%" }}
                bordered={false}
                className="hover:shadow-lg transition-shadow"
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <CheckSquareOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </div>
                <Title level={4} style={{ textAlign: "center" }}>รายการสิ่งที่ต้องทำ</Title>
                <Paragraph style={{ textAlign: "center" }}>
                  จัดการงานรายวัน รายสัปดาห์ และรายเดือนได้อย่างมีระบบ
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{ height: "100%" }}
                bordered={false}
                className="hover:shadow-lg transition-shadow"
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <LineChartOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </div>
                <Title level={4} style={{ textAlign: "center" }}>ติดตามความคืบหน้า</Title>
                <Paragraph style={{ textAlign: "center" }}>
                  ติดตามและบันทึกความคืบหน้าของงานแต่ละชิ้นได้อย่างละเอียด
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{ height: "100%" }}
                bordered={false}
                className="hover:shadow-lg transition-shadow"
              >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <NodeIndexOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </div>
                <Title level={4} style={{ textAlign: "center" }}>แผนผังกระบวนการ</Title>
                <Paragraph style={{ textAlign: "center" }}>
                  สร้างแผนผังกระบวนการทำงานด้วยเครื่องมือสร้าง Flowchart ที่ใช้งานง่าย
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
        
        <div style={{ background: "#f5f5f5", padding: "80px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: 24 }}>
              เริ่มใช้งานวันนี้
            </Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 32 }}>
              สมัครสมาชิกฟรี และเริ่มจัดการงานของคุณได้อย่างมีประสิทธิภาพ
            </Paragraph>
            <Link href="/auth/register">
              <Button type="primary" size="large" style={{ fontSize: 16, height: 48, padding: "0 32px" }}>
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </Content>
      
      <Footer style={{ textAlign: "center", background: "#001529", color: "rgba(255,255,255,0.65)", padding: "24px" }}>
        <Text style={{ color: "rgba(255,255,255,0.65)" }}>
          © 2025 ระบบติดตามงาน. สงวนลิขสิทธิ์
        </Text>
      </Footer>
    </Layout>
  );
}