"use client";

import { Typography, Card, Row, Col, Statistic } from "antd";
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileOutlined 
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  // ในโค้ดจริง คุณควรดึงข้อมูลจากฐานข้อมูลที่นี่
  const stats = {
    yearPlanCount: 3,
    todoCount: 12,
    completedTasks: 25,
    pendingTasks: 8,
  };

  return (
    <div>
      <Title level={2}>แดชบอร์ด</Title>
      <Paragraph>ยินดีต้อนรับสู่ระบบติดตามงาน ดูภาพรวมงานทั้งหมดของคุณได้ที่นี่</Paragraph>
      
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12} lg={6}>
          <Card >
            <Statistic
              title="แผนงานประจำปี"
              value={stats.yearPlanCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card >
            <Statistic
              title="รายการสิ่งที่ต้องทำ"
              value={stats.todoCount}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card >
            <Statistic
              title="งานที่เสร็จแล้ว"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card >
            <Statistic
              title="งานที่รอดำเนินการ"
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="mt-6">
        <Title level={3}>กิจกรรมล่าสุด</Title>
        <Card>
          <Paragraph>ยังไม่มีกิจกรรมล่าสุด</Paragraph>
        </Card>
      </div>
    </div>
  );
}