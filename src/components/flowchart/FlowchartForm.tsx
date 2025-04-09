// src/components/flowchart/FlowchartForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface FlowchartFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData: any;
  isEditing: boolean;
}

export default function FlowchartForm({
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: FlowchartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: isEditing
      ? {
          title: initialData.title,
          description: initialData.description || "",
        }
      : {
          title: "",
          description: "",
        },
  });
  
  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
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
            {isEditing ? "แก้ไขข้อมูลแผนผัง" : "สร้างแผนผังใหม่"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อแผนผัง
              </label>
              <input
                type="text"
                {...register("title", { required: "กรุณากรอกชื่อแผนผัง" })}
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
                rows={3}
              ></textarea>
            </div>
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
                : "สร้างแผนผัง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
