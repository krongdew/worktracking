"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ActivityType } from "@prisma/client";
import { format } from "date-fns";
import { createActivity, updateActivity } from "@/server/actions/year-plan-actions";
import { useRouter } from "next/navigation";
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space,
  Typography
} from "antd";
import locale from 'antd/lib/date-picker/locale/th_TH';
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface ActivityFormProps {
  onClose: () => void;
  yearPlanId: string;
  initialData: any;
  isEditing: boolean;
}

export default function ActivityForm({
  onClose,
  yearPlanId,
  initialData,
  isEditing,
}: ActivityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  
  const activityTypeNames = {
    ONGOING: "งานต่อเนื่องตลอดปี",
    PARTIAL: "งานต่อเนื่องบางช่วง",
    EVENT: "กิจกรรมนักศึกษา",
    TRAINING: "การอบรม",
    DESIGN: "งานออกแบบ",
    OTHER: "งานอื่นๆ"
  };
  
  // กำหนดค่าเริ่มต้นสำหรับฟอร์ม
  const initialValues = isEditing
    ? {
        title: initialData.title,
        description: initialData.description || "",
        startDate: dayjs(initialData.startDate),
        endDate: dayjs(initialData.endDate),
        category: initialData.category || "",
        type: initialData.type,
      }
    : {
        title: "",
        description: "",
        startDate: dayjs(),
        endDate: dayjs(),
        category: "",
        type: ActivityType.OTHER,
      };
      
  const onSubmitForm = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };
      
      if (isEditing) {
        await updateActivity({
          id: initialData.id,
          ...formattedData,
        });
      } else {
        await createActivity({
          ...formattedData,
          yearPlanId,
        });
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving activity:", error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      title={isEditing ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onSubmitForm}
      >
        <Form.Item
          name="title"
          label="ชื่อกิจกรรม"
          rules={[{ required: true, message: "กรุณากรอกชื่อกิจกรรม" }]}
        >
          <Input placeholder="ชื่อกิจกรรม" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="รายละเอียด (ไม่บังคับ)"
        >
          <TextArea rows={2} placeholder="รายละเอียดเพิ่มเติม" />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="ประเภทกิจกรรม"
          rules={[{ required: true, message: "กรุณาเลือกประเภทกิจกรรม" }]}
        >
          <Select placeholder="เลือกประเภทกิจกรรม">
            {Object.entries(activityTypeNames).map(([type, name]) => (
              <Option key={type} value={type}>{name}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="category"
          label="หมวดหมู่ (ไม่บังคับ)"
        >
          <Input placeholder="หมวดหมู่" />
        </Form.Item>
        
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const activityType = getFieldValue('type');
            
            return (
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                  name="startDate"
                  label="วันที่เริ่มต้น"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มต้น" }]}
                  style={{ flex: 1 }}
                >
                  <DatePicker 
                    locale={locale}
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
                
                <Form.Item
                  name="endDate"
                  label="วันที่สิ้นสุด"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}
                  style={{ flex: 1 }}
                >
                  <DatePicker 
                    locale={locale}
                    style={{ width: '100%' }} 
                    format="DD/MM/YYYY"
                    disabled={activityType === 'ONGOING'}
                  />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>
        
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'end', gap: 8 }}>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting}
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : isEditing
                ? "บันทึกการแก้ไข"
                : "เพิ่มกิจกรรม"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}