// src/components/flowchart/FlowchartForm.tsx
"use client";

import { useState } from "react";
import { Modal, Form, Input } from "antd";
import { FlowchartFormData } from "@/types/flowchart";
// สร้าง interface สำหรับข้อมูลแผนผัง
// FlowchartForm.tsx


interface FlowchartFormProps {
  onClose: () => void;
  onSubmit: (data: FlowchartFormData) => Promise<void>;
  initialData?: FlowchartFormData;
  isEditing?: boolean;
}


export default function FlowchartForm({ 
  onClose, 
  onSubmit, 
  initialData,
  isEditing = false 
}: FlowchartFormProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
        onClose();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={isEditing ? "แก้ไขข้อมูลแผนผัง" : "สร้างแผนผังใหม่"}
      open={true}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      okText={isEditing ? "บันทึกการแก้ไข" : "สร้างแผนผัง"}
      cancelText="ยกเลิก"
    >
      <Form 
        form={form}
        layout="vertical"
        initialValues={{
          title: isEditing ? initialData?.title || '' : '',
          description: isEditing ? initialData?.description || '' : '',
        }}
      >
        <Form.Item
          name="title"
          label="ชื่อแผนผัง"
          rules={[
            { 
              required: true, 
              message: 'กรุณากรอกชื่อแผนผัง' 
            }
          ]}
        >
          <Input placeholder="กรอกชื่อแผนผัง" />
        </Form.Item>

        <Form.Item
          name="description"
          label="รายละเอียด (ไม่บังคับ)"
        >
          <Input.TextArea 
            placeholder="คำอธิบายแผนผัง" 
            rows={3} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}