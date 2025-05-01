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
  Typography,
  Row,
  Col,
  Modal,
  Descriptions,
  Divider,
  Timeline
} from 'antd';
import { FilterOutlined, CalendarOutlined, EnvironmentOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

interface TaskProgress {
  id: string;
  description: string;
  percentComplete: number;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date | null;
  location: string | null;
  status: TaskStatus;
  activity: YearPlanActivity | null;
  progress: TaskProgress[];
}

interface PublicTaskTrackingProps {
  tasks: Task[];
}

export default function PublicTaskTracking({ tasks }: PublicTaskTrackingProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{
    status: TaskStatus | "ALL";
    dateRange: [Date | null, Date | null];
  }>({
    status: "ALL",
    dateRange: [null, null],
  });

  // เพิ่ม state สำหรับการแสดง Modal และเก็บข้อมูลงานที่เลือก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ตรวจสอบขนาดหน้าจอ
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

  // ฟังก์ชั่นสำหรับจัดเรียงลำดับงาน
  const sortTasks = (a: Task, b: Task) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const aDate = new Date(a.startDateTime);
    const bDate = new Date(b.startDateTime);
    
    // คำนวณความสำคัญของงานตามสถานะและวันที่
    const getPriority = (task: Task, date: Date) => {
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
  
  // ฟิลเตอร์รายการตามเงื่อนไข
  useEffect(() => {
    let filtered = [...tasks];
    
    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter(task => task.status === activeFilter.status);
    }
    
    if (activeFilter.dateRange[0] || activeFilter.dateRange[1]) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.startDateTime).getTime();
        
        if (activeFilter.dateRange[0] && activeFilter.dateRange[1]) {
          const startDate = new Date(activeFilter.dateRange[0]).setHours(0, 0, 0, 0);
          const endDate = new Date(activeFilter.dateRange[1]).setHours(23, 59, 59, 999);
          return taskDate >= startDate && taskDate <= endDate;
        } else if (activeFilter.dateRange[0]) {
          const startDate = new Date(activeFilter.dateRange[0]).setHours(0, 0, 0, 0);
          return taskDate >= startDate;
        } else if (activeFilter.dateRange[1]) {
          const endDate = new Date(activeFilter.dateRange[1]).setHours(23, 59, 59, 999);
          return taskDate <= endDate;
        }
        
        return true;
      });
    }
    
    // เรียงลำดับก่อนที่จะอัปเดต state
    filtered.sort(sortTasks);
    
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);
  
  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };
  
  const taskStatusColors = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    DELAYED: "warning",
    CANCELLED: "error",
  };
  
  const taskStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "DELAYED", label: "ล่าช้า" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];
  
  const formatDateTime = (dateTime: Date) => {
    return new Date(dateTime).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getLatestProgress = (progress: TaskProgress[]) => {
    if (!progress || progress.length === 0) return 0;
    
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedProgress[0].percentComplete;
  };
  
  const handleFilterChange = (status: TaskStatus | "ALL", dateRange: [Date | null, Date | null]) => {
    setActiveFilter({ status, dateRange });
  };

  // เพิ่มฟังก์ชันสำหรับเปิด Modal แสดงรายละเอียดงาน
  const showTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Desktop columns
  const desktopColumns: ColumnsType<Task> = [
    {
      title: 'งาน',
      dataIndex: 'title',
      key: 'title-desktop',
      width: 180,
      render: (text: string, task: Task) => (
        <Text 
          strong 
          style={{ color: "#1890ff", cursor: "pointer" }} 
          onClick={() => showTaskDetail(task)}
        >
          {text}
        </Text>
      )
    },
    {
      title: 'กิจกรรมจาก Year Plan',
      dataIndex: 'activity',
      key: 'activity-desktop',
      width: 150,
      render: (activity: YearPlanActivity) => activity ? activity.title : '-',
      responsive: ['md'],
    },
    {
      title: 'วันและเวลา',
      dataIndex: 'startDateTime',
      key: 'startDateTime-desktop',
      width: 200,
      render: (_: string, task: Task) => (
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
      key: 'location-desktop',
      width: 120,
      render: (location: string) => location || '-', 
      responsive: ['md'],
    },
    {
      title: 'ความคืบหน้า',
      dataIndex: 'progress',
      key: 'progress-desktop', 
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
      key: 'status-desktop',
      width: 120,
      render: (status: TaskStatus) => (
        <Tag color={taskStatusColors[status as keyof typeof taskStatusColors]}>
          {taskStatusLabels[status]}
        </Tag>
      ),
    },
  ];

  // Mobile columns
  const mobileColumns: ColumnsType<Task> = [
    {
      title: 'งาน',
      dataIndex: 'title',
      key: 'title-mobile',
      width: '60%',
      render: (text: string, task: Task) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text 
            strong 
            style={{ color: "#1890ff", cursor: "pointer" }} 
            onClick={() => showTaskDetail(task)}
          >
            {text}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatDateTime(task.startDateTime)}
          </Text>
          {task.activity && (
            <Tag color="purple" style={{ marginTop: 4 }}>
              {task.activity.title}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'สถานะ',
      key: 'status-mobile',
      width: '40%',
      render: (_: string, task: Task) => (
        <Space direction="vertical" size={4}>
          <Tag color={taskStatusColors[task.status as keyof typeof taskStatusColors]}>
            {taskStatusLabels[task.status]}
          </Tag>
          <Progress 
            percent={getLatestProgress(task.progress)} 
            size="small" 
            format={percent => `${percent}%`}
          />
        </Space>
      )
    }
  ];

  // Filter components แยกตามขนาดหน้าจอ
  const DesktopFilter = () => (
    <Row gutter={24} align="middle">
      <Col>
        <Space>
          <FilterOutlined />
          <Text strong>กรองงาน:</Text>
        </Space>
      </Col>
      <Col>
        <Space size="middle">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 8 }}>สถานะ:</Text>
            <Select
              style={{ width: 150 }}
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
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 8 }}>ช่วงวันที่:</Text>  
            <RangePicker
              style={{ width: 280 }}
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
        </Space>
      </Col>
      <Col>
        <Button
          onClick={() => handleFilterChange('ALL', [null, null])}
          type="link"
        >
          รีเซ็ตฟิลเตอร์
        </Button>
      </Col>
    </Row>
  );

  // Mobile filter
  const MobileFilter = () => (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <FilterOutlined style={{ marginRight: 8 }} />
        <Text strong>กรองงาน</Text>
      </div>
      
      <Row gutter={[8, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Text style={{ marginRight: 8 }}>สถานะ:</Text>
          <Select
            style={{ width: 'calc(100% - 70px)' }}
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
        </Col>
        
        <Col span={24}>
          <Text style={{ marginRight: 8 }}>ช่วงวันที่:</Text>
          <RangePicker
            style={{ width: 'calc(100% - 70px)' }}
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
        </Col>
        
        <Col span={24} style={{ textAlign: 'right' }}>
          <Button
            onClick={() => handleFilterChange('ALL', [null, null])}
            type="link"
          >
            รีเซ็ตฟิลเตอร์
          </Button>
        </Col>
      </Row>
    </Space>
  );

  // สร้าง component แสดงความคืบหน้าของงาน
  const TaskProgressTimeline = ({ progress }: { progress: TaskProgress[] }) => {
    if (!progress || progress.length === 0) {
      return <Text type="secondary">ยังไม่มีการบันทึกความคืบหน้า</Text>;
    }

    // เรียงความคืบหน้าล่าสุดไว้ด้านบน
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
      <Timeline
        items={sortedProgress.map((p) => ({
          children: (
            <Space direction="vertical" size={2}>
              <Text strong>{p.percentComplete}% ความคืบหน้า</Text>
              <Text>{p.description}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(p.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </Space>
          )
        }))}
      />
    );
  };

  return (
    <>
      <Card>
        <Space 
          direction="vertical" 
          size="middle" 
          style={{ width: '100%' }}
        >
          {isMobile ? <MobileFilter /> : <DesktopFilter />}
          
            <div style={{ width: '100%', overflowX: 'auto' }}>
            <Table 
              columns={isMobile ? mobileColumns : desktopColumns}
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
              scroll={{ x: isMobile ? undefined : 800 }}
              style={{ minWidth: isMobile ? undefined : 600 }}
              sortDirections={['descend', 'ascend']}
            />
            </div>
        </Space>
      </Card>

      {/* Modal สำหรับแสดงรายละเอียดงาน */}
      <Modal
        title={<Title level={4}>รายละเอียดงาน</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            ปิด
          </Button>
        ]}
        width={isMobile ? '100%' : 700}
      >
        {selectedTask && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={4}>{selectedTask.title}</Title>
            
            <Descriptions column={isMobile ? 1 : 2} bordered size="small">
              <Descriptions.Item 
                label={<Space><CalendarOutlined /> วันที่เริ่ม</Space>} 
                span={isMobile ? 1 : 2}
              >
                {formatDateTime(selectedTask.startDateTime)}
              </Descriptions.Item>
              
              {selectedTask.endDateTime && (
                <Descriptions.Item 
                  label={<Space><CalendarOutlined /> วันที่สิ้นสุด</Space>} 
                  span={isMobile ? 1 : 2}
                >
                  {formatDateTime(selectedTask.endDateTime)}
                </Descriptions.Item>
              )}
              
              {selectedTask.location && (
                <Descriptions.Item 
                  label={<Space><EnvironmentOutlined /> สถานที่</Space>} 
                  span={isMobile ? 1 : 2}
                >
                  {selectedTask.location}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item 
                label={<Space><InfoCircleOutlined /> สถานะ</Space>}
                span={isMobile ? 1 : 2}
              >
                <Tag color={taskStatusColors[selectedTask.status as keyof typeof taskStatusColors]}>
                  {taskStatusLabels[selectedTask.status]}
                </Tag>
              </Descriptions.Item>
              
              {selectedTask.activity && (
                <Descriptions.Item 
                  label="กิจกรรมจาก Year Plan" 
                  span={isMobile ? 1 : 2}
                >
                  <Tag color="purple">{selectedTask.activity.title}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {selectedTask.description && (
              <>
                <Divider orientation="left">คำอธิบาย</Divider>
                <Paragraph>{selectedTask.description}</Paragraph>
              </>
            )}
            
            <Divider orientation="left">ความคืบหน้า</Divider>
            <Progress 
              percent={getLatestProgress(selectedTask.progress)} 
              status="active"
              style={{ marginBottom: 16 }}
            />
            
            <TaskProgressTimeline progress={selectedTask.progress} />
          </Space>
        )}
      </Modal>
    </>
  );
}