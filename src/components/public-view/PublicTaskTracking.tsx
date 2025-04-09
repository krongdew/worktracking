// src/components/public-view/PublicTaskTracking.tsx
"use client";

import { useState, useEffect } from "react";
import { TaskStatus, YearPlanActivity } from "@prisma/client";
import dayjs from 'dayjs';

import { Table, Select, DatePicker, Button, Progress, Tag } from 'antd';
const { RangePicker } = DatePicker;
const { Option } = Select;

interface TaskProgress {
  id: string;
  description: string;
  percentComplete: number;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string; 
  description?: string;
  startDateTime: Date;
  endDateTime?: Date;
  location?: string;
  status: TaskStatus;
  notes?: string;
  deliveryDetails?: string;
  activity?: YearPlanActivity;
  progress: TaskProgress[];
  createdAt: Date;
  updatedAt: Date;
}

interface PublicTaskTrackingProps {
  tasks: Task[];
}

export default function PublicTaskTracking({ tasks }: PublicTaskTrackingProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [activeFilter, setActiveFilter] = useState<{
    status: TaskStatus | "ALL";
    dateRange: [Date | null, Date | null];
  }>({
    status: "ALL",
    dateRange: [null, null],
  });

  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ", 
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };

  const taskStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" }, 
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "DELAYED", label: "ล่าช้า" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];

  useEffect(() => {
    let filtered = [...tasks];

    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter((task) => task.status === activeFilter.status);
    }
    
    if (activeFilter.dateRange[0]) {
      filtered = filtered.filter(
        (task) => new Date(task.startDateTime) >= activeFilter.dateRange[0]!
      );
    }

    if (activeFilter.dateRange[1]) {
      filtered = filtered.filter(  
        (task) => new Date(task.startDateTime) <= activeFilter.dateRange[1]!
      );
    }
    
    // เรียงตามวันที่เริ่มต้น (ล่าสุดอยู่บนสุด)
    filtered.sort((a, b) => {
      return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
    });

    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);

  const handleFilterChange = (
    status: TaskStatus | "ALL", 
    dateRange: [Date | null, Date | null]
  ) => {
    setActiveFilter({ status, dateRange });
  };

  const formatDateTime = (dateTime: Date) => {
    return dayjs(dateTime).format('D MMM YYYY, HH:mm น.');
  };

  const getLatestProgress = (progress: TaskProgress[]) => {
    if (!progress || progress.length === 0) return 0;

    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() 
    );

    return sortedProgress[0].percentComplete;
  };

  const columns = [
    {
      title: 'งาน',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, task: Task) => (
        <>
          <div className="font-medium">{task.title}</div>
          {task.description && <div className="text-gray-500">{task.description}</div>}
        </>
      ),
    },
    {
      title: 'กิจกรรมจาก Year Plan',
      dataIndex: 'activity',
      key: 'activity', 
      render: (activity: YearPlanActivity) => activity ? activity.title : '-',
    },
    {
      title: 'วันและเวลา',
      dataIndex: 'startDateTime',
      key: 'startDateTime',
      render: (_: any, task: Task) => (
        <>
          <div>{formatDateTime(task.startDateTime)}</div>
          {task.endDateTime && (
            <div className="text-gray-500">
              ถึง {formatDateTime(task.endDateTime)}
            </div>
          )}
        </>
      ),
    },
    {
      title: 'สถานที่',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-', 
    },
    {
      title: 'ความคืบหน้า',
      dataIndex: 'progress',
      key: 'progress', 
      render: (progress: TaskProgress[]) => (
        <>
          <Progress percent={getLatestProgress(progress)} size="small" />
          <div className="text-xs text-gray-500 mt-1">
            {getLatestProgress(progress)}%
          </div>
        </>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'red'}>
          {taskStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_: any, task: Task) => (
        <Button type="link">ดูรายละเอียด</Button>
      ),
    },
  ];
  
  return (
    <div>
      <div className="mb-4 flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          
          <div>
            <span className="mr-2">สถานะ:</span>
            <Select
              value={activeFilter.status}
              onChange={(value: TaskStatus | "ALL") => 
                handleFilterChange(value, activeFilter.dateRange)
              }
            >
              {taskStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </div>
          
          <div>
            <span className="mr-2">ช่วงวันที่:</span>  
            <RangePicker
              value={[
                activeFilter.dateRange[0] ? dayjs(activeFilter.dateRange[0]) : null,
                activeFilter.dateRange[1] ? dayjs(activeFilter.dateRange[1]) : null
              ]}
              onChange={(dates) => {
                handleFilterChange(
                  activeFilter.status,
                  [
                    dates && dates[0] ? dates[0].toDate() : null,
                    dates && dates[1] ? dates[1].toDate() : null,
                  ]
                );
              }}
              
            />
          </div>
        </div>

        <Button
          onClick={() => handleFilterChange('ALL', [null, null])}
          type="link"
        >
          รีเซ็ตฟิลเตอร์
        </Button>
        
      </div>

      <Table 
        dataSource={filteredTasks}
        columns={columns}
        rowKey="id"
        locale={{
          emptyText: 'ไม่พบรายการงาน',
        }}
      />
    </div>
  );
}