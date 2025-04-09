// src/components/task-tracking/TaskForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
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
    if (!dateTime) return "";
    const dt = new Date(dateTime);
    return format(dt, "yyyy-MM-dd'T'HH:mm");
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: isEditing
      ? {
          ...initialData,
          startDateTime: formatDateTimeForInput(initialData.startDateTime),
          endDateTime: formatDateTimeForInput(initialData.endDateTime),
          activityId: initialData.activityId || "",
        }
      : {
          title: "",
          description: "",
          startDateTime: formatDateTimeForInput(new Date()),
          endDateTime: "",
          location: "",
          notes: "",
          deliveryDetails: "",
          status: TaskStatus.PENDING,
          activityId: "",
        },
  });
  
  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // ถ้า activityId เป็นสตริงว่าง ให้เปลี่ยนเป็น null
      if (data.activityId === "") {
        data.activityId = null;
      }
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl my-8">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? "แก้ไขข้อมูลงาน" : "เพิ่มงานใหม่"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้องาน
              </label>
              <input
                type="text"
                {...register("title", { required: "กรุณากรอกหัวข้องาน" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message?.toString()}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                กิจกรรมจาก Year Plan (ไม่บังคับ)
              </label>
              <select
                {...register("activityId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ไม่เลือกกิจกรรม</option>
                {yearPlanActivities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด (ไม่บังคับ)
              </label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันและเวลาเริ่มต้น
                </label>
                <input
                  type="datetime-local"
                  {...register("startDateTime", { required: "กรุณาเลือกวันและเวลาเริ่มต้น" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.startDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDateTime.message?.toString()}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันและเวลาสิ้นสุด (ไม่บังคับ)
                </label>
                <input
                  type="datetime-local"
                  {...register("endDateTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานที่ (ไม่บังคับ)
              </label>
              <input
                type="text"
                {...register("location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมายเหตุ (ไม่บังคับ)
              </label>
              <textarea
                {...register("notes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดการส่งมอบงาน (ไม่บังคับ)
              </label>
              <textarea
                {...register("deliveryDetails")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              ></textarea>
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
                  <option value="DELAYED">ล่าช้า</option>
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
                : "เพิ่มงาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
