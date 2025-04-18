// src/components/task-tracking/TaskDetailModal.tsx
"use client";

import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useState, useEffect } from "react";
import { updateTaskProgress } from "@/server/actions/task-tracking-actions";
import { useRouter } from "next/navigation";
import { 
  Modal, 
  Typography, 
  Tag, 
  Space, 
  Descriptions, 
  Form,
  Input, 
  Button, 
  Slider, 
  Progress, 
  Card, 
  Timeline,
  Divider
} from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TaskProgress {
  id: string;
  description: string;
  percentComplete: number;
  createdAt: Date;
}

interface TaskWithRelations extends Task {
  progress: TaskProgress[];
  activity: YearPlanActivity | null;
}

interface TaskDetailModalProps {
  task: TaskWithRelations;
  onClose: () => void;
  onEdit: () => void;
  visible: boolean;
}

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
  visible = true,
}: TaskDetailModalProps) {
  const router = useRouter();
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  const [progressDescription, setProgressDescription] = useState("");
  const [progressPercent, setProgressPercent] = useState<number>(
    Math.max(
      task.progress.length > 0
        ? Math.max(...task.progress.map(p => p.percentComplete))
        : 0,
      0
    )
  );
  const [form] = Form.useForm();
  
  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };
  
  const taskStatusColors: Record<TaskStatus, string> = {
    PENDING: "default",
    IN_PROGRESS: "processing",
    COMPLETED: "success",
    DELAYED: "warning",
    CANCELLED: "error",
  };
  
  const formatDateTime = (dateTime: Date) => {
    return format(new Date(dateTime), "d MMMM yyyy, HH:mm น.", {
      locale: th,
    });
  };
  
  const handleAddProgress = async (values: { description: string }) => {
    if (!values.description.trim()) {
      return;
    }
    
    setIsSubmittingProgress(true);
    
    try {
      await updateTaskProgress(task.id, {
        description: values.description,
        percentComplete: progressPercent,
      });
      
      form.resetFields();
      setProgressDescription("");
      router.refresh();
    } catch (error) {
      console.error("Error adding progress:", error);
    } finally {
      setIsSubmittingProgress(false);
    }
  };
  
  const handleEdit = () => {
    onClose(); // ปิด Modal นี้ก่อน
    onEdit();  // จากนั้นจึงเรียก onEdit
  };
  
  // เรียงลำดับความคืบหน้าจากล่าสุดไปเก่าสุด
  const sortedProgress = [...task.progress].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <Modal
      open={visible}
      title="รายละเอียดงาน"
      onCancel={() => {
        // เพิ่มการเรียก onClose เมื่อปิด Modal
        onClose();
      }}
      width={800}
      maskClosable={true}
      footer={[
        <Button key="edit" type="primary" onClick={handleEdit} icon={<EditOutlined />}>
          แก้ไขข้อมูลงาน
        </Button>
      ]}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto", padding: "24px" } }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* เนื้อหาเดิม */}
        <div>
          <Title level={4}>{task.title}</Title>
          
          <Space style={{ marginBottom: 16 }}>
            <Tag color={taskStatusColors[task.status]}>
              {taskStatusLabels[task.status]}
            </Tag>
            
            {task.activity && (
              <Tag color="purple">{task.activity.title}</Tag>
            )}
          </Space>
          
          {task.description && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">รายละเอียด</Text>
              <Paragraph style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                {task.description}
              </Paragraph>
            </div>
          )}
          
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="เริ่มต้น">
              {formatDateTime(task.startDateTime)}
            </Descriptions.Item>
            
            {task.endDateTime && (
              <Descriptions.Item label="สิ้นสุด">
                {formatDateTime(task.endDateTime)}
              </Descriptions.Item>
            )}
            
            {task.location && (
              <Descriptions.Item label="สถานที่">
                {task.location}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {task.notes && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">หมายเหตุ</Text>
              <Paragraph style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                {task.notes}
              </Paragraph>
            </div>
          )}
          
          {task.deliveryDetails && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">รายละเอียดการส่งมอบงาน</Text>
              <Paragraph style={{ whiteSpace: 'pre-line', marginTop: 4 }}>
                {task.deliveryDetails}
              </Paragraph>
            </div>
          )}
        </div>
        
        <Divider />
        
        {/* ส่วนความคืบหน้า */}
        <div>
          <Title level={5}>ความคืบหน้า</Title>
          
          <Progress
            percent={progressPercent}
            status={progressPercent === 100 ? "success" : "active"}
            strokeColor={{
              from: '#108ee9',
              to: '#87d068',
            }}
            style={{ marginBottom: 16 }}
          />
          
          <Form 
            form={form}
            onFinish={handleAddProgress}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="description"
              label="เพิ่มความคืบหน้า"
              rules={[{ required: true, message: 'กรุณากรอกรายละเอียดความคืบหน้า' }]}
            >
              <TextArea
                rows={2}
                placeholder="รายละเอียดความคืบหน้า..."
                value={progressDescription}
                onChange={(e) => setProgressDescription(e.target.value)}
              />
            </Form.Item>
            
            <Form.Item label={`เปอร์เซ็นต์ความคืบหน้า: ${progressPercent}%`}>
              <Slider
                min={0}
                max={100}
                value={progressPercent}
                onChange={setProgressPercent}
              />
            </Form.Item>
            
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingProgress}
              >
                บันทึกความคืบหน้า
              </Button>
            </Form.Item>
          </Form>
          
          <Divider orientation="left" plain>
            ประวัติความคืบหน้า
          </Divider>
          
          {sortedProgress.length > 0 ? (
            <Timeline
              mode="left"
              items={sortedProgress.map((progress) => ({
                children: (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Tag color="blue">{progress.percentComplete}%</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {format(new Date(progress.createdAt), "d MMM yyyy, HH:mm น.", {
                          locale: th,
                        })}
                      </Text>
                    </div>
                    <Paragraph style={{ margin: 0 }}>{progress.description}</Paragraph>
                  </Card>
                ),
              }))}
            />
          ) : (
            <Text type="secondary">ยังไม่มีการบันทึกความคืบหน้า</Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}