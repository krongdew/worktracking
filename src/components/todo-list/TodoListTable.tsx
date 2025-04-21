import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Popconfirm, 
  Space, 
  Typography, 
  Dropdown, 
  Modal,
  Tooltip
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
  // State for tracking screen width
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

  // Status dropdown render function
  const renderStatusDropdown = (status: TodoStatus, record: TodoList) => (
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
      <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : status === 'CANCELLED' ? 'red' : 'default'} style={{ cursor: 'pointer' }}>
        {todoStatusLabels[status]}
      </Tag>
    </Dropdown>
  );

  // Mobile columns
  const mobileColumns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title-mobile',
      width: '60%',
      render: (text: string, record: TodoList) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text strong ellipsis={{ tooltip: text }}>
            {text}
          </Text>
          <Text type="secondary">
            {formatDate(record.dueDate, record)}
          </Text>
          <Tag color={priorityColors[record.priority]} style={{ marginTop: 4 }}>
            {record.priority}
          </Tag>
        </Space>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status-mobile',
      width: '30%',
      render: (status: TodoStatus, record: TodoList) => renderStatusDropdown(status, record)
    },
    {
      title: '',
      key: 'mobile-actions',
      width: '10%',
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
      )
    }
  ];

  // Desktop columns
  const desktopColumns: ColumnsType<TodoList> = [
    {
      title: 'รายการ',
      dataIndex: 'title',
      key: 'title-desktop',
      width: 180,
      render: (text: string, record: TodoList) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Tooltip title={text}>
            <Text strong style={{ width: '100%' }} ellipsis>
              {text}
            </Text>
          </Tooltip>
          {record.description && (
            <Text 
              type="secondary"
              style={{ width: '100%' }}
              ellipsis={{ tooltip: record.description }}
            >
              {truncateText(record.description, 40)}
            </Text>
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
          {priority}
        </Tag>
      )
    },
    {
      title: 'วันที่ครบกำหนด',
      dataIndex: 'dueDate',
      key: 'dueDate-desktop',
      width: 150,
      render: (dueDate: Date, record: TodoList) => formatDate(dueDate, record)
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status-desktop',
      width: 130,
      render: (status: TodoStatus, record: TodoList) => renderStatusDropdown(status, record)
    },
    {
      title: 'การดำเนินการ',
      key: 'actions-desktop',
      width: 110,
      render: (record: TodoList) => (
        <Space size="small">
          <Button type="text" onClick={() => onEdit(record)} icon={<EditOutlined />} />
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
            onConfirm={() => onDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <Table 
        columns={isMobile ? mobileColumns : desktopColumns}
        dataSource={todoLists} 
        rowKey="id"
        locale={{ emptyText: 'ไม่พบรายการที่ต้องทำ' }}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          responsive: true
        }}
        scroll={{ x: isMobile ? undefined : 770 }}
      />
    </div>
  );
}