"use client";

import { useState, useEffect } from "react";
import { Select, Table, Tag, Typography, Card, Space } from 'antd';
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
  
  const columns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          {record.description && (
            <Typography.Paragraph 
              type="secondary" 
              style={{ marginBottom: 0 }}
              ellipsis={{ tooltip: record.description }}
            >
              {record.description}
            </Typography.Paragraph>
          )}
        </Space>
      ),
      responsive: ['md'],
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: TodoType) => todoTypeLabels[type],
      responsive: ['md'],
    },
    {
      title: 'ความสำคัญ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: Priority) => (
        <Tag color={priorityColors[priority]}>
          {priorityLabels[priority]}
        </Tag>
      ),
      responsive: ['md'],
    },
    {
      title: 'วันที่ครบกำหนด',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TodoStatus) => (
        <Tag color={todoStatusColors[status]}>
          {todoStatusLabels[status]}
        </Tag>
      ),
    },
  ];
  
  return (
    <Card>
      <Space 
        direction="vertical" 
        size="middle" 
        style={{ width: '100%' }}
      >
        <Space 
          direction="horizontal" 
          size="middle" 
          style={{ 
            width: '100%', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start' 
          }}
        >
          <Select
            style={{ width: 200 }}
            className="w-full sm:w-auto"
            value={activeFilter.type}
            onChange={(value: TodoType | "ALL") => setActiveFilter(prev => ({ ...prev, type: value }))}
            placeholder="กรองตามประเภท"
          >
            <Select.Option value="ALL">ทั้งหมด</Select.Option>
            <Select.Option value="DAILY">รายวัน</Select.Option>
            <Select.Option value="WEEKLY">รายสัปดาห์</Select.Option>
            <Select.Option value="MONTHLY">รายเดือน</Select.Option>
          </Select>
          
          <Select
            style={{ width: 200 }}
            className="w-full sm:w-auto"
            value={activeFilter.status}
            onChange={(value: TodoStatus | "ALL") => setActiveFilter(prev => ({ ...prev, status: value }))}
            placeholder="กรองตามสถานะ"
          >
            <Select.Option value="ALL">ทุกสถานะ</Select.Option>
            <Select.Option value="PENDING">รอดำเนินการ</Select.Option>
            <Select.Option value="IN_PROGRESS">กำลังดำเนินการ</Select.Option>
            <Select.Option value="COMPLETED">เสร็จสิ้น</Select.Option>
            <Select.Option value="CANCELLED">ยกเลิก</Select.Option>
          </Select>
        </Space>
        
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={filteredTodoLists} 
            rowKey="id"
            locale={{ emptyText: 'ไม่พบรายการ' }}
            pagination={{ 
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              responsive: true
            }}
            scroll={{ x: true }}
            style={{ minWidth: 600 }}
          />
        </div>
      </Space>
    </Card>
  );
}