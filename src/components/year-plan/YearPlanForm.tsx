"use client";

import { useState } from "react";
import { Form, Input, Select, Modal, Button, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface YearPlanFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
  isEditing: boolean;
}

export default function YearPlanForm({
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: YearPlanFormProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // คำนวณปีปัจจุบันและปีรอบๆ
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 10 },
    (_, i) => currentYear - 2 + i
  );
  
  // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
  const initialValues = isEditing
    ? {
        title: initialData.title,
        description: initialData.description || "",
        year: initialData.year,
      }
    : {
        title: "",
        description: "",
        year: currentYear,
      };
      
  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      title={
        <div>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {isEditing ? "แก้ไขแผนการดำเนินงาน" : "สร้างแผนการดำเนินงานใหม่"}
        </div>
      }
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFormSubmit}
      >
        <Form.Item
          name="title"
          label="ชื่อแผนการดำเนินงาน"
          rules={[{ required: true, message: "กรุณากรอกชื่อแผนการดำเนินงาน" }]}
        >
          <Input placeholder="ชื่อแผนการดำเนินงาน" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="รายละเอียด (ไม่บังคับ)"
        >
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม" />
        </Form.Item>
        
        <Form.Item
          name="year"
          label="ปี"
          rules={[{ required: true, message: "กรุณาเลือกปี" }]}
        >
          <Select placeholder="เลือกปี">
            {yearOptions.map((year) => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'end', gap: 8 }}>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting}
            >
              {isEditing ? "บันทึกการแก้ไข" : "สร้างแผน"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}