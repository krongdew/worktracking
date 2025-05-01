// src/components/task-tracking/TaskTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Table, Tag, Button, Dropdown, Progress, Space, Typography, Tooltip } from "antd";
import {  EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
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
    // เพิ่ม state สำหรับตรวจสอบขนาดหน้าจอ
    const [isMobile, setIsMobile] = useState(false);
    // เพิ่ม state เพื่อเก็บงานที่เรียงลำดับแล้ว
    const [sortedTasks, setSortedTasks] = useState<TaskWithRelations[]>([]);
    
    // ตรวจสอบขนาดหน้าจอเมื่อ component ถูกโหลดและเมื่อมีการ resize
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
  
    // เพิ่มฟังก์ชันจัดเรียงงาน
    const sortTasks = (a: TaskWithRelations, b: TaskWithRelations) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const aDate = new Date(a.startDateTime);
      const bDate = new Date(b.startDateTime);
      
      // คำนวณความสำคัญของงานตามสถานะและวันที่
      const getPriority = (task: TaskWithRelations, date: Date) => {
        // งานที่กำลังดำเนินการ
        if (task.status === 'IN_PROGRESS') return 0;
        // งานที่รอดำเนินการและอยู่ในเดือนปัจจุบัน
        if (task.status === 'PENDING' && date >= today && date <= endOfMonth) return 1;
        // งานที่รอดำเนินการและยังไม่ถึงกำหนด
        if (task.status === 'PENDING' && date > endOfMonth) return 2;
        // งานที่ล่าช้า
        if (task.status === 'DELAYED') return 3;
        // งานที่เสร็จสิ้นแล้ว
        if (task.status === 'COMPLETED') return 4;
        // งานที่ยกเลิก
        if (task.status === 'CANCELLED') return 5;
        // อื่นๆ
        return 6;
      };
      
      const aPriority = getPriority(a, aDate);
      const bPriority = getPriority(b, bDate);
      
      // เรียงตามความสำคัญก่อน
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // ถ้าความสำคัญเท่ากัน ให้เรียงตามวันที่
      return aDate.getTime() - bDate.getTime();
    };
  
    // อัพเดท sortedTasks เมื่อ tasks มีการเปลี่ยนแปลง
    useEffect(() => {
      if (tasks && tasks.length > 0) {
        const newSortedTasks = [...tasks].sort(sortTasks);
        setSortedTasks(newSortedTasks);
      } else {
        setSortedTasks([]);
      }
    }, [tasks]); // เมื่อ tasks เปลี่ยน ให้เรียงใหม่
    
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
  
    // กำหนด sorter ในคอลัมน์วันที่
    const desktopColumns: ColumnsType<TaskWithRelations> = [
      {
        title: "งาน",
        dataIndex: "title",
        key: "title-desktop",
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
        key: "activity-desktop",
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
        key: "dateTime-desktop",
        defaultSortOrder: 'ascend', // กำหนดการเรียงลำดับเริ่มต้น
        sorter: (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
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
      key: "location-desktop",
      render: (location) => location || <Text type="secondary">-</Text>,
    },
    {
      title: "ความคืบหน้า",
      key: "progress-desktop",
      render: (_, task) => {
        const progressValue = getLatestProgress(task.progress);
        return <Progress percent={progressValue} size="small" />;
      },
    },
    {
      title: "สถานะ",
      key: "status-desktop",
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
      key: "action-desktop",
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
  // Define columns for mobile view
  const mobileColumns: ColumnsType<TaskWithRelations> = [
    {
      title: "งาน",
      dataIndex: "title",
      key: "title-mobile",
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
            <Paragraph ellipsis={{ rows: 1 }} type="secondary" style={{ marginBottom: 0 }}>
              {task.description}
            </Paragraph>
          )}
        </Space>
      ),
    },
    {
      title: "สถานะ",
      key: "status-mobile",
      render: (_, task) => (
        <Tag color={taskStatusColors[task.status]}>
          {taskStatusLabels[task.status]}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
    <Table
      columns={isMobile ? mobileColumns : desktopColumns}
      dataSource={sortedTasks.map(task => ({ ...task, key: task.id }))}
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        responsive: true 
      }}
      rowClassName={() => "hover:bg-gray-50"}
      locale={{ emptyText: "ไม่พบรายการงาน" }}
      bordered
      size="middle"
      scroll={{ x: isMobile ? undefined : 1000 }}
      sortDirections={['descend', 'ascend']}
    />
  </div>
);
}