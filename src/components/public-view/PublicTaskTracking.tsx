"use client";

import { useState, useEffect } from "react";
import { TaskStatus, YearPlanActivity } from "@prisma/client";
import dayjs from 'dayjs';

import { 
  Table, 
  Select, 
  DatePicker, 
  Button, 
  Progress, 
  Tag, 
  Space, 
  Card, 
  Typography 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

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

  const columns: ColumnsType<Task> = [
    {
      title: 'งาน',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (_: any, task: Task) => (
        <Space direction="vertical" size={0}>
          <Text strong>{task.title}</Text>
          {task.description && (
            <Text 
              type="secondary" 
              ellipsis={{ tooltip: task.description }}
            >
              {task.description}
            </Text>
          )}
        </Space>
      ),
      responsive: ['md'],
    },
    {
      title: 'กิจกรรมจาก Year Plan',
      dataIndex: 'activity',
      key: 'activity', 
      width: 150,
      render: (activity: YearPlanActivity) => activity ? activity.title : '-',
      responsive: ['md'],
    },
    {
      title: 'วันและเวลา',
      dataIndex: 'startDateTime',
      key: 'startDateTime',
      width: 200,
      render: (_: any, task: Task) => (
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
      title: 'สถานที่',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location || '-', 
      responsive: ['md'],
    },
    {
      title: 'ความคืบหน้า',
      dataIndex: 'progress',
      key: 'progress', 
      width: 120,
      render: (progress: TaskProgress[]) => (
        <Space direction="vertical" size={0}>
          <Progress percent={getLatestProgress(progress)} size="small" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getLatestProgress(progress)}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TaskStatus) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'red'}>
          {taskStatusLabels[status]}
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Text>สถานะ:</Text>
              <Select
                style={{ width: 200 }}
                className="flex-1 sm:flex-none"
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
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Text>ช่วงวันที่:</Text>  
              <RangePicker
                style={{ width: 300 }}
                className="flex-1 sm:flex-none"
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
            className="self-end sm:self-auto"
          >
            รีเซ็ตฟิลเตอร์
          </Button>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table 
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            locale={{
              emptyText: 'ไม่พบรายการงาน',
            }}
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