"use client";

import { useState } from "react";
import { Form, Input, Select, DatePicker, Modal, Button } from 'antd';
import dayjs from 'dayjs';

// Local type definitions
type TodoType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TodoListFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
  isEditing: boolean;
}

export default function TodoListForm({
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: TodoListFormProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && initialData) {
        await onSubmit({
          ...values,
          id: initialData.id,
          dueDate: values.dueDate ? values.dueDate.toDate() : null,
        });
      } else {
        await onSubmit({
          ...values,
          dueDate: values.dueDate ? values.dueDate.toDate() : null,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Prepare initial values
  const initialValues = isEditing && initialData ? {
    ...initialData,
    dueDate: initialData.dueDate ? dayjs(initialData.dueDate) : null,
  } : {
    title: '',
    description: '',
    type: 'DAILY',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: dayjs(),
  };
  
  return (
    <Modal
      title={isEditing ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
      open={true}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="หัวข้อ"
          rules={[{ required: true, message: 'กรุณากรอกหัวข้อ' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="รายละเอียด (ไม่บังคับ)"
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="ประเภท"
          rules={[{ required: true, message: 'กรุณาเลือกประเภท' }]}
        >
          <Select>
            <Select.Option value="DAILY">รายวัน</Select.Option>
            <Select.Option value="WEEKLY">รายสัปดาห์</Select.Option>
            <Select.Option value="MONTHLY">รายเดือน</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="priority"
          label="ความสำคัญ"
          rules={[{ required: true, message: 'กรุณาเลือกความสำคัญ' }]}
        >
          <Select>
            <Select.Option value="LOW">ต่ำ</Select.Option>
            <Select.Option value="MEDIUM">ปานกลาง</Select.Option>
            <Select.Option value="HIGH">สูง</Select.Option>
            <Select.Option value="URGENT">เร่งด่วน</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="dueDate"
          label="วันที่ครบกำหนด"
          rules={[{ required: true, message: 'กรุณาเลือกวันที่ครบกำหนด' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        {isEditing && (
          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะ' }]}
          >
            <Select>
              <Select.Option value="PENDING">รอดำเนินการ</Select.Option>
              <Select.Option value="IN_PROGRESS">กำลังดำเนินการ</Select.Option>
              <Select.Option value="COMPLETED">เสร็จสิ้น</Select.Option>
              <Select.Option value="CANCELLED">ยกเลิก</Select.Option>
            </Select>
          </Form.Item>
        )}
        
        <Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>
              ยกเลิก
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting}
            >
              {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}