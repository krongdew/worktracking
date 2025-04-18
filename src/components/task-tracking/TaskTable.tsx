// src/components/task-tracking/TaskTable.tsx
"use client";

import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Table, Tag, Button, Dropdown, Progress, Space, Typography, Tooltip } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text, Paragraph } = Typography;

interface TaskWithRelations extends Task {
  progress: any[];
  activity: YearPlanActivity | null;
}

interface TaskTableProps {
  tasks: TaskWithRelations[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (taskId: string) => void;
  onViewDetail: (task: TaskWithRelations) => void;
}

export default function TaskTable({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetail,
}: TaskTableProps) {
  // ข้อมูลสำหรับแสดงสถานะ
  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };
  
  // สีของ Tag สำหรับแต่ละสถานะ
  const taskStatusColors: Record<TaskStatus, string> = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    DELAYED: "warning",
    CANCELLED: "error",
  };
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่และเวลา
  const formatDateTime = (dateTime: Date) => {
    return format(new Date(dateTime), "d MMM yyyy, HH:mm น.", {
      locale: th,
    });
  };
  
  // ฟังก์ชันคำนวณความคืบหน้าล่าสุด
  const getLatestProgress = (progress: any[]) => {
    if (!progress || progress.length === 0) return 0;
    
    // เรียงตามเวลาที่บันทึก
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedProgress[0].percentComplete;
  };

  // กำหนด columns สำหรับ Ant Design Table
  const columns: ColumnsType<TaskWithRelations> = [
    {
      title: "งาน",
      dataIndex: "title",
      key: "title",
      render: (text, task) => (
        <Space direction="vertical" size={0}>
          <Text 
            strong 
            style={{ color: "#1890ff", cursor: "pointer" }} 
            onClick={() => onViewDetail(task)}
          >
            {text}
          </Text>
          {task.description && (
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 0 }}>
              {task.description}
            </Paragraph>
          )}
        </Space>
      ),
    },
    {
      title: "กิจกรรมจาก Year Plan",
      dataIndex: "activity",
      key: "activity",
      render: (activity) => (
        activity ? (
          <Text type="secondary" strong style={{ color: "#722ed1" }}>
            {activity.title}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: "วันและเวลา",
      key: "dateTime",
      render: (_, task) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDateTime(task.startDateTime)}</Text>
          {task.endDateTime && (
            <Text type="secondary">
              ถึง {formatDateTime(task.endDateTime)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
      render: (location) => location || <Text type="secondary">-</Text>,
    },
    {
      title: "ความคืบหน้า",
      key: "progress",
      render: (_, task) => {
        const progressValue = getLatestProgress(task.progress);
        return <Progress percent={progressValue} size="small" />;
      },
    },
    {
      title: "สถานะ",
      key: "status",
      render: (_, task) => (
        <Dropdown
          menu={{
            items: [
              { key: "PENDING", label: "รอดำเนินการ" },
              { key: "IN_PROGRESS", label: "กำลังดำเนินการ" },
              { key: "COMPLETED", label: "เสร็จสิ้น" },
              { key: "DELAYED", label: "ล่าช้า" },
              { key: "CANCELLED", label: "ยกเลิก" },
            ],
            onClick: ({ key }) => onStatusChange(task.id, key as TaskStatus),
          }}
          trigger={["click"]}
        >
          <Tag color={taskStatusColors[task.status]} style={{ cursor: "pointer" }}>
            {taskStatusLabels[task.status]}
          </Tag>
        </Dropdown>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      align: "center",
      render: (_, task) => (
        <Space size="small">
          <Tooltip title="ดูรายละเอียด">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => onViewDetail(task)} 
            />
          </Tooltip>
          <Tooltip title="แก้ไข">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(task)} 
            />
          </Tooltip>
          <Tooltip title="ลบ">
            <Button 
              type="text" 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(task.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tasks.map(task => ({ ...task, key: task.id }))}
      pagination={{ pageSize: 10 }}
      rowClassName={() => "hover:bg-gray-50"}
      locale={{ emptyText: "ไม่พบรายการงาน" }}
      bordered
      size="middle"
    />
  );
}