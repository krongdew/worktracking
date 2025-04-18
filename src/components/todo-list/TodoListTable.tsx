import React, { useState } from 'react';
import { 
  Table, 
  Tag, 
  Select, 
  Button, 
  Popconfirm, 
  Space, 
  Typography, 
  Dropdown, 
  Modal 
} from 'antd';
import { 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  TodoList, 
  TodoStatus, 
  TodoType, 
  Priority 
} from "@prisma/client";

const { Text } = Typography;
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
  const [selectedTodo, setSelectedTodo] = useState<TodoList | null>(null);

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
  
  const formatDate = (dueDate: Date, record: TodoList) => {
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
  };

  const columns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: TodoList) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && (
            <Text 
              type="secondary" 
              ellipsis={{ tooltip: record.description }}
            >
              {record.description}
            </Text>
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
          {priority}
        </Tag>
      ),
      responsive: ['md'],
    },
    {
      title: 'วันที่ครบกำหนด',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (dueDate: Date, record: TodoList) => formatDate(dueDate, record),
      responsive: ['md'],
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: TodoStatus, record: TodoList) => (
        <Dropdown
          menu={{
            items: Object.values(TodoStatus).map(statusOption => ({
              key: statusOption,
              label: todoStatusLabels[statusOption],
              onClick: () => onStatusChange(record.id, statusOption)
            })),
          }}
          trigger={['click']}
        >
          <Tag color={status === 'COMPLETED' ? 'green' : 'default'} style={{ cursor: 'pointer' }}>
            {todoStatusLabels[status]}
          </Tag>
        </Dropdown>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      width: 120,
      render: (record: TodoList) => (
        <Space>
          <Button type="text" onClick={() => onEdit(record)}>
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
            onConfirm={() => onDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="text" danger>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
      responsive: ['md'],
    },
    {
      title: '',
      key: 'mobile-actions',
      width: 60,
      render: (record: TodoList) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'แก้ไข',
                icon: <EditOutlined />,
                onClick: () => onEdit(record)
              },
              {
                key: 'delete',
                label: 'ลบ',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  setSelectedTodo(record);
                  Modal.confirm({
                    title: 'ยืนยันการลบ',
                    content: 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
                    okText: 'ใช่',
                    cancelText: 'ไม่',
                    onOk: () => onDelete(record.id)
                  });
                }
              },
              {
                key: 'details',
                label: 'รายละเอียด',
                onClick: () => {
                  setSelectedTodo(record);
                  Modal.info({
                    title: 'รายละเอียดรายการที่ต้องทำ',
                    content: (
                      <div>
                        <p><strong>ชื่อ:</strong> {record.title}</p>
                        <p><strong>คำอธิบาย:</strong> {record.description || '-'}</p>
                        <p><strong>ประเภท:</strong> {todoTypeLabels[record.type]}</p>
                        <p><strong>ความสำคัญ:</strong> {record.priority}</p>
                        <p><strong>วันที่ครบกำหนด:</strong> {formatDate(record.dueDate, record)}</p>
                        <p><strong>สถานะ:</strong> {todoStatusLabels[record.status]}</p>
                      </div>
                    ),
                    okText: 'ปิด'
                  });
                }
              }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Table 
        columns={columns} 
        dataSource={todoLists} 
        rowKey="id"
        locale={{ emptyText: 'ไม่พบรายการที่ต้องทำ' }}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          responsive: true
        }}
        style={{ minWidth: 600 }}
        scroll={{ x: true }}
      />
    </div>
  );
}