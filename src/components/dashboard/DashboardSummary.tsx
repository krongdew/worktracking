"use client";

import React from "react";
import Link from "next/link";
import { TodoStatus, TaskStatus } from "@prisma/client";
import { Card, Row, Col, Typography, Tag, Space, List, Divider } from "antd";
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileOutlined,
  RightOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface DashboardData {
  yearPlans: number;
  todoLists: {
    total: number;
    byStatus: Record<TodoStatus, number>;
    upcoming: Array<{
      id: string;
      title: string;
      dueDate: string;
      status: TodoStatus;
    }>;
  };
  tasks: {
    total: number;
    byStatus: Record<TaskStatus, number>;
    inProgress: Array<{
      id: string;
      title: string;
      startDateTime: string;
      status: TaskStatus;
      activity?: {
        title: string;
      };
    }>;
  };
  flowcharts: number;
}

interface DashboardSummaryProps {
  data: DashboardData;
  userId: string;
}

export default function DashboardSummary({ data, userId }: DashboardSummaryProps) {
  const todoStatusLabels: Record<TodoStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    CANCELLED: "ยกเลิก",
  };
  
  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };
  
  const todoStatusColors: Record<TodoStatus, string> = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    CANCELLED: "error",
  };
  
  const taskStatusColors: Record<TaskStatus, string> = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    DELAYED: "warning",
    CANCELLED: "error",
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center">
              <CalendarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0 }}>แผนงานประจำปี</Title>
            </Space>
            <Title level={2} style={{ margin: '8px 0', textAlign: 'center' }}>{data.yearPlans}</Title>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center">
              <FileOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>รายการสิ่งที่ต้องทำ</Title>
            </Space>
            <Title level={2} style={{ margin: '8px 0', textAlign: 'center' }}>{data.todoLists.total}</Title>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>งานที่เสร็จแล้ว</Title>
            </Space>
            <Title level={2} style={{ margin: '8px 0', textAlign: 'center' }}>
              {data.tasks.byStatus.COMPLETED || 0}
            </Title>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card hoverable>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <Title level={4} style={{ margin: 0 }}>งานที่รอดำเนินการ</Title>
            </Space>
            <Title level={2} style={{ margin: '8px 0', textAlign: 'center' }}>
              {data.tasks.byStatus.PENDING || 0}
            </Title>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24} md={12}>
        <Card 
          title="รายการที่กำลังดำเนินการ"
          style={{ height: '100%' }}
        >
          {data.tasks.inProgress.length > 0 ? (
            <List
              dataSource={data.tasks.inProgress}
              renderItem={(task) => (
                <List.Item>
                  <Link href={`/task-tracking?id=${task.id}`} style={{ display: 'block', width: '100%' }}>
                    <Card 
                      size="small" 
                      hoverable 
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{task.title}</Text>
                        
                        {task.activity && (
                          <Text type="secondary">
                            กิจกรรม: {task.activity.title}
                          </Text>
                        )}
                        
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text type="secondary">
                              เริ่ม: {formatDate(task.startDateTime)}
                            </Text>
                          </Col>
                          <Col>
                            <Tag color={taskStatusColors[task.status as TaskStatus]}>
                              {taskStatusLabels[task.status as TaskStatus]}
                            </Tag>
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Link>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">ไม่มีงานที่กำลังดำเนินการ</Text>
          )}
        </Card>
      </Col>
      
      <Col xs={24} md={12}>
        <Card 
          title="รายการที่ใกล้ถึงกำหนด"
          style={{ height: '100%' }}
        >
          {data.todoLists.upcoming.length > 0 ? (
            <List
              dataSource={data.todoLists.upcoming}
              renderItem={(todo) => (
                <List.Item>
                  <Link href={`/todo-list?id=${todo.id}`} style={{ display: 'block', width: '100%' }}>
                    <Card 
                      size="small" 
                      hoverable 
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{todo.title}</Text>
                        
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text type="secondary">
                              กำหนด: {formatDate(todo.dueDate)}
                            </Text>
                          </Col>
                          <Col>
                            <Tag color={todoStatusColors[todo.status as TodoStatus]}>
                              {todoStatusLabels[todo.status as TodoStatus]}
                            </Tag>
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Link>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">ไม่มีรายการที่ใกล้ถึงกำหนด</Text>
          )}
        </Card>
      </Col>
    </Row>
  );
}