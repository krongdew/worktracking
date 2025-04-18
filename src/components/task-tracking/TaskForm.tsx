// src/components/task-tracking/TaskForm.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TaskStatus, YearPlanActivity } from "@prisma/client";
import { Form, Input, DatePicker, Select, Button, Space } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any; // เพิ่ม ? เพื่อบอกว่า initialData อาจเป็น undefined
  isEditing: boolean;
  yearPlanActivities: YearPlanActivity[];
}

export default function TaskForm({
  onClose,
  onSubmit,
  initialData,
  isEditing,
  yearPlanActivities,
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTimeForInput = (dateTime: string | Date | null | undefined) => {
    if (!dateTime) return null;
    return dayjs(dateTime);
  };

  // ตั้งค่าค่าเริ่มต้นสำหรับฟอร์ม
  const defaultValues = isEditing && initialData
    ? {
        title: initialData?.title || "",
        description: initialData?.description || "",
        dateRange: initialData?.startDateTime 
          ? [
              formatDateTimeForInput(initialData.startDateTime),
              initialData.endDateTime ? formatDateTimeForInput(initialData.endDateTime) : null,
            ] as [dayjs.Dayjs, dayjs.Dayjs]
          : null,
        location: initialData?.location || "",
        notes: initialData?.notes || "",
        deliveryDetails: initialData?.deliveryDetails || "",
        status: initialData?.status || TaskStatus.PENDING,
        activityId: initialData?.activityId || "",
      }
    : {
        title: "",
        description: "",
        dateRange: null,
        location: "",
        notes: "",
        deliveryDetails: "",
        status: TaskStatus.PENDING,
        activityId: "",
      };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // แปลงค่าวันที่จาก Dayjs กลับเป็น Date
      const [startDateTime, endDateTime] = data.dateRange
        ? [data.dateRange[0].toDate(), data.dateRange[1]?.toDate()]
        : [null, null];
      
      await onSubmit({
        ...data,
        startDateTime,
        endDateTime,
        // ถ้า activityId เป็นสตริงว่าง ให้เปลี่ยนเป็น null
        activityId: data.activityId || null, 
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmitForm)}>
      <Controller
        name="title"
        control={control}
        rules={{ required: "กรุณากรอกหัวข้องาน" }}
        render={({ field }) => (
          <Form.Item 
            label="หัวข้องาน" 
            validateStatus={errors.title ? "error" : ""}
            help={errors.title?.message as string}
          >
            <Input {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="activityId"
        control={control}
        render={({ field }) => (
          <Form.Item label="กิจกรรมจาก Year Plan">
            <Select {...field} allowClear>
              <Option value="">ไม่เลือกกิจกรรม</Option>
              {yearPlanActivities.map((activity) => (
                <Option key={activity.id} value={activity.id}>
                  {activity.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Form.Item label="รายละเอียด">
            <TextArea {...field} rows={3} />
          </Form.Item>
        )}
      />

      <Controller
        name="dateRange"
        control={control}
        rules={{ required: "กรุณาเลือกวันและเวลา" }}
        render={({ field: { onChange, value, ...restField } }) => (
          <Form.Item 
            label="วันและเวลา" 
            validateStatus={errors.dateRange ? "error" : ""}
            help={errors.dateRange?.message as string}
          >
            <RangePicker 
              {...restField}
              value={value as [dayjs.Dayjs, dayjs.Dayjs]}
              onChange={(dates) => onChange(dates)}
              showTime={{ format: 'HH:mm' }}
              format="DD MMM YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <Form.Item label="สถานที่">
            <Input {...field} />
          </Form.Item>
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Form.Item label="หมายเหตุ">
            <TextArea {...field} rows={2} />
          </Form.Item>
        )}
      />

      <Controller
        name="deliveryDetails"
        control={control}
        render={({ field }) => (
          <Form.Item label="รายละเอียดการส่งมอบงาน">
            <TextArea {...field} rows={2} />
          </Form.Item>
        )}
      />

      {isEditing && (
        <Controller
          name="status"
          control={control}
          rules={{ required: "กรุณาเลือกสถานะ" }}
          render={({ field }) => (
            <Form.Item 
              label="สถานะ" 
              validateStatus={errors.status ? "error" : ""}
              help={errors.status?.message as string}
            >
              <Select {...field}>
                <Option value="PENDING">รอดำเนินการ</Option>
                <Option value="IN_PROGRESS">กำลังดำเนินการ</Option>
                <Option value="COMPLETED">เสร็จสิ้น</Option>
                <Option value="DELAYED">ล่าช้า</Option>
                <Option value="CANCELLED">ยกเลิก</Option>
              </Select>
            </Form.Item>
          )}
        />
      )}

      <Form.Item>
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isEditing ? "บันทึกการแก้ไข" : "เพิ่มงาน"} 
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}