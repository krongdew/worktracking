"use client";

import { useState, useEffect } from "react";
import { Select, Table, Tag, Typography, Card, Space, Row, Col, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

// Local type definitions
type TodoType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TodoList {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: TodoType;
  status: TodoStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicTodoListProps {
  todoLists: TodoList[];
}

export default function PublicTodoList({ todoLists }: PublicTodoListProps) {
  const [filteredTodoLists, setFilteredTodoLists] = useState<TodoList[]>(todoLists);
  const [activeFilter, setActiveFilter] = useState<{
    type: TodoType | "ALL";
    status: TodoStatus | "ALL";
  }>({
    type: "ALL",
    status: "ALL",
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on component mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  const todoTypeLabels: Record<TodoType, string> = {
    DAILY: "รายวัน",
    WEEKLY: "รายสัปดาห์",
    MONTHLY: "รายเดือน",
  };
  
  const todoStatusLabels: Record<TodoStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    CANCELLED: "ยกเลิก",
  };
  
  const priorityLabels: Record<Priority, string> = {
    LOW: "ต่ำ",
    MEDIUM: "ปานกลาง",
    HIGH: "สูง",
    URGENT: "เร่งด่วน",
  };
  
  const priorityColors: Record<Priority, string> = {
    LOW: "blue",
    MEDIUM: "green",
    HIGH: "orange",
    URGENT: "red",
  };
  
  const todoStatusColors: Record<TodoStatus, string> = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    CANCELLED: "error",
  };
  
  useEffect(() => {
    // ฟิลเตอร์ตามประเภทและสถานะ
    let filtered = [...todoLists];
    
    if (activeFilter.type !== "ALL") {
      filtered = filtered.filter((todo) => todo.type === activeFilter.type);
    }
    
    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter((todo) => todo.status === activeFilter.status);
    }
    
    // เรียงตามวันที่ครบกำหนด (ใกล้หมดเวลาจะอยู่บนสุด) และตาม priority
    filtered.sort((a, b) => {
      // เรียงตามวันที่ครบกำหนด
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      
      // ถ้าวันที่เท่ากัน ให้เรียงตามความสำคัญ
      if (dateComparison === 0) {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return dateComparison;
    });
    
    setFilteredTodoLists(filtered);
  }, [todoLists, activeFilter]);
  
  // ฟังก์ชันตรวจสอบว่าวันที่ครบกำหนดใกล้มาถึงหรือเลยกำหนดหรือไม่
  const getDueDateStatus = (dueDate: Date, status: TodoStatus): 'warning' | 'danger' | undefined => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      return undefined;
    }
    
    if (dueDateObj < today) {
      return 'danger';
    }
    
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 2 ? 'warning' : undefined;
  };
  
  // Function to truncate text with ellipsis and tooltip
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text || text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength) + '...';
    return (
      <Tooltip title={text}>
        <span>{truncated}</span>
      </Tooltip>
    );
  };
  
  // Desktop columns with limited width
  const desktopColumns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title-desktop',
      width: 180,
      render: (text: string, record: TodoList) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Tooltip title={text}>
            <Typography.Text strong style={{ width: '100%' }} ellipsis>
              {text}
            </Typography.Text>
          </Tooltip>
          {record.description && (
            <Typography.Text 
              type="secondary"
              style={{ width: '100%' }}
              ellipsis={{ tooltip: record.description }}
            >
              {truncateText(record.description, 40)}
            </Typography.Text>
          )}
        </Space>
      )
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type-desktop',
      width: 100,
      render: (type: TodoType) => todoTypeLabels[type]
    },
    {
      title: 'ความสำคัญ',
      dataIndex: 'priority',
      key: 'priority-desktop',
      width: 100,
      render: (priority: Priority) => (
        <Tag color={priorityColors[priority]}>
          {priorityLabels[priority]}
        </Tag>
      )
    },
    {
      title: 'วันที่ครบกำหนด',
      dataIndex: 'dueDate',
      key: 'dueDate-desktop',
      width: 150,
      render: (dueDate: Date, record: TodoList) => {
        const dateStr = new Date(dueDate).toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        return (
          <Typography.Text type={getDueDateStatus(dueDate, record.status)}>
            {dateStr}
          </Typography.Text>
        );
      }
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status-desktop',
      width: 130,
      render: (status: TodoStatus) => (
        <Tag color={todoStatusColors[status]}>
          {todoStatusLabels[status]}
        </Tag>
      )
    }
  ];

  // Mobile columns
  const mobileColumns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title-mobile',
      width: '60%',
      render: (text: string, record: TodoList) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Typography.Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Typography.Text>
          <Space size={4}>
            <Tag color={priorityColors[record.priority]}>
              {priorityLabels[record.priority]}
            </Tag>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {todoTypeLabels[record.type]}
            </Typography.Text>
          </Space>
          <Typography.Text 
            type={getDueDateStatus(record.dueDate, record.status)}
            style={{ fontSize: '12px' }}
          >
            {new Date(record.dueDate).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status-mobile',
      width: '40%',
      render: (status: TodoStatus) => (
        <Tag color={todoStatusColors[status]}>
          {todoStatusLabels[status]}
        </Tag>
      )
    }
  ];

  // Filter components
  const FilterControls = () => {
    if (isMobile) {
      return (
        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <FilterOutlined style={{ marginRight: 8 }} />
            <Typography.Text strong>กรองรายการ</Typography.Text>
          </div>
          
          <Row gutter={[8, 16]} style={{ width: '100%' }}>
            <Col span={24}>
              <Select
                style={{ width: '100%' }}
                value={activeFilter.type}
                onChange={(value: TodoType | "ALL") => setActiveFilter(prev => ({ ...prev, type: value }))}
                placeholder="ประเภท"
              >
                <Select.Option value="ALL">ทั้งหมด</Select.Option>
                <Select.Option value="DAILY">รายวัน</Select.Option>
                <Select.Option value="WEEKLY">รายสัปดาห์</Select.Option>
                <Select.Option value="MONTHLY">รายเดือน</Select.Option>
              </Select>
            </Col>
            
            <Col span={24}>
              <Select
                style={{ width: '100%' }}
                value={activeFilter.status}
                onChange={(value: TodoStatus | "ALL") => setActiveFilter(prev => ({ ...prev, status: value }))}
                placeholder="สถานะ"
              >
                <Select.Option value="ALL">ทุกสถานะ</Select.Option>
                <Select.Option value="PENDING">รอดำเนินการ</Select.Option>
                <Select.Option value="IN_PROGRESS">กำลังดำเนินการ</Select.Option>
                <Select.Option value="COMPLETED">เสร็จสิ้น</Select.Option>
                <Select.Option value="CANCELLED">ยกเลิก</Select.Option>
              </Select>
            </Col>
          </Row>
        </Space>
      );
    }
    
    return (
      <Row gutter={24} align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <FilterOutlined />
            <Typography.Text strong>กรองรายการ:</Typography.Text>
          </Space>
        </Col>
        <Col>
          <Space size="middle">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography.Text style={{ marginRight: 8 }}>ประเภท:</Typography.Text>
              <Select
                style={{ width: 140 }}
                value={activeFilter.type}
                onChange={(value: TodoType | "ALL") => setActiveFilter(prev => ({ ...prev, type: value }))}
              >
                <Select.Option value="ALL">ทั้งหมด</Select.Option>
                <Select.Option value="DAILY">รายวัน</Select.Option>
                <Select.Option value="WEEKLY">รายสัปดาห์</Select.Option>
                <Select.Option value="MONTHLY">รายเดือน</Select.Option>
              </Select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography.Text style={{ marginRight: 8 }}>สถานะ:</Typography.Text>
              <Select
                style={{ width: 140 }}
                value={activeFilter.status}
                onChange={(value: TodoStatus | "ALL") => setActiveFilter(prev => ({ ...prev, status: value }))}
              >
                <Select.Option value="ALL">ทุกสถานะ</Select.Option>
                <Select.Option value="PENDING">รอดำเนินการ</Select.Option>
                <Select.Option value="IN_PROGRESS">กำลังดำเนินการ</Select.Option>
                <Select.Option value="COMPLETED">เสร็จสิ้น</Select.Option>
                <Select.Option value="CANCELLED">ยกเลิก</Select.Option>
              </Select>
            </div>
          </Space>
        </Col>
      </Row>
    );
  };
  
  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <FilterControls />
        
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table 
            columns={isMobile ? mobileColumns : desktopColumns}
            dataSource={filteredTodoLists} 
            rowKey="id"
            locale={{ emptyText: 'ไม่พบรายการ' }}
            pagination={{ 
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              responsive: true
            }}
            scroll={{ x: isMobile ? undefined : 660 }}
          />
        </div>
      </Space>
    </Card>
  );
}