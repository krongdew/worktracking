import React from 'react';
import { Table, Tag, Select, Button, Popconfirm } from 'antd';
import { 
  TodoList, 
  TodoStatus, 
  TodoType, 
  Priority 
} from "@prisma/client";

const { Option } = Select;

interface TodoListTableProps {
  todoLists: TodoList[];
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onEdit: (todo: TodoList) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoListTable({
  todoLists,
  onStatusChange,
  onEdit,
  onDelete,
}: TodoListTableProps) {
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
  
  const priorityColors: Record<Priority, string> = {
    LOW: "blue",
    MEDIUM: "green",
    HIGH: "orange",
    URGENT: "red",
  };
  
  const columns = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TodoList) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-sm text-gray-600">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      render: (type: TodoType) => todoTypeLabels[type],
    },
    {
      title: 'ความสำคัญ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => (
        <Tag color={priorityColors[priority]}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'วันที่ครบกำหนด',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate: Date, record: TodoList) => {
        const formattedDate = new Date(dueDate).toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const isPastDue = new Date(dueDate) < new Date() && record.status !== 'COMPLETED';
        
        return (
          <span style={{ color: isPastDue ? 'red' : 'inherit' }}>
            {formattedDate}
          </span>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: TodoStatus, record: TodoList) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(newStatus) => onStatusChange(record.id, newStatus)}
        >
          {Object.values(TodoStatus).map(statusOption => (
            <Option key={statusOption} value={statusOption}>
              {todoStatusLabels[statusOption]}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      render: (record: TodoList) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => onEdit(record)}>
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
            onConfirm={() => onDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="link" danger>
              ลบ
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={todoLists} 
      rowKey="id"
      locale={{ emptyText: 'ไม่พบรายการที่ต้องทำ' }}
      pagination={{
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
      }}
    />
  );
}