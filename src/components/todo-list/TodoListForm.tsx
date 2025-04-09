// src/components/todo-list/TodoListForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TodoType, TodoStatus, Priority } from "@prisma/client";
import { format } from "date-fns";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: isEditing
      ? {
          ...initialData,
          dueDate: format(new Date(initialData.dueDate), "yyyy-MM-dd"),
        }
      : {
          title: "",
          description: "",
          dueDate: format(new Date(), "yyyy-MM-dd"),
          type: TodoType.DAILY,
          priority: Priority.MEDIUM,
          status: TodoStatus.PENDING,
        },
  });
  
  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await onSubmit({
          id: initialData.id,
          ...data,
        });
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ
              </label>
              <input
                type="text"
                {...register("title", { required: "กรุณากรอกหัวข้อ" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message?.toString()}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด (ไม่บังคับ)
              </label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <select
                {...register("type", { required: "กรุณาเลือกประเภท" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAILY">รายวัน</option>
                <option value="WEEKLY">รายสัปดาห์</option>
                <option value="MONTHLY">รายเดือน</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความสำคัญ
              </label>
              <select
                {...register("priority", { required: "กรุณาเลือกความสำคัญ" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">ต่ำ</option>
                <option value="MEDIUM">ปานกลาง</option>
                <option value="HIGH">สูง</option>
                <option value="URGENT">เร่งด่วน</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่ครบกำหนด
              </label>
              <input
                type="date"
                {...register("dueDate", { required: "กรุณาเลือกวันที่ครบกำหนด" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message?.toString()}</p>
              )}
            </div>
            
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  {...register("status", { required: "กรุณาเลือกสถานะ" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">รอดำเนินการ</option>
                  <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                  <option value="COMPLETED">เสร็จสิ้น</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting
                ? "กำลังบันทึก..."
                : isEditing
                ? "บันทึกการแก้ไข"
                : "เพิ่มรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}