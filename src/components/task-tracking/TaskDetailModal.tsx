// src/components/task-tracking/TaskDetailModal.tsx
"use client";

import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useState } from "react";
import { updateTaskProgress } from "@/server/actions/task-tracking-actions";
import { useRouter } from "next/navigation";

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
}

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
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
  
  const taskStatusLabels: Record<TaskStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    DELAYED: "ล่าช้า",
    CANCELLED: "ยกเลิก",
  };
  
  const taskStatusColors: Record<TaskStatus, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELAYED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่และเวลา
  const formatDateTime = (dateTime: Date) => {
    return format(new Date(dateTime), "d MMMM yyyy, HH:mm น.", {
      locale: th,
    });
  };
  
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!progressDescription.trim()) {
      alert("กรุณากรอกรายละเอียดความคืบหน้า");
      return;
    }
    
    setIsSubmittingProgress(true);
    
    try {
      await updateTaskProgress(task.id, {
        description: progressDescription,
        percentComplete: progressPercent,
      });
      
      setProgressDescription("");
      router.refresh();
    } catch (error) {
      console.error("Error adding progress:", error);
    } finally {
      setIsSubmittingProgress(false);
    }
  };
  
  // เรียงลำดับความคืบหน้าจากล่าสุดไปเก่าสุด
  const sortedProgress = [...task.progress].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl my-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">รายละเอียดงาน</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ปิด
          </button>
        </div>
        
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  taskStatusColors[task.status]
                }`}
              >
                {taskStatusLabels[task.status]}
              </span>
              
              {task.activity && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {task.activity.title}
                </span>
              )}
            </div>
            
            {task.description && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">รายละเอียด</h4>
                <p className="text-gray-800 whitespace-pre-line">{task.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">เริ่มต้น</h4>
                <p className="text-gray-800">{formatDateTime(task.startDateTime)}</p>
              </div>
              
              {task.endDateTime && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">สิ้นสุด</h4>
                  <p className="text-gray-800">{formatDateTime(task.endDateTime)}</p>
                </div>
              )}
              
              {task.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">สถานที่</h4>
                  <p className="text-gray-800">{task.location}</p>
                </div>
              )}
            </div>
            
            {task.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">หมายเหตุ</h4>
                <p className="text-gray-800 whitespace-pre-line">{task.notes}</p>
              </div>
            )}
            
            {task.deliveryDetails && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  รายละเอียดการส่งมอบงาน
                </h4>
                <p className="text-gray-800 whitespace-pre-line">{task.deliveryDetails}</p>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">ความคืบหน้า</h4>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 h-4 rounded-full text-xs text-white flex items-center justify-center"
                style={{ 
                  width: `${progressPercent}%`,
                  minWidth: '2rem' 
                }}
              >
                {progressPercent}%
              </div>
            </div>
            
            <form onSubmit={handleAddProgress} className="mb-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เพิ่มความคืบหน้า
                  </label>
                  <textarea
                    value={progressDescription}
                    onChange={(e) => setProgressDescription(e.target.value)}
                    placeholder="รายละเอียดความคืบหน้า..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เปอร์เซ็นต์ความคืบหน้า: {progressPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingProgress}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isSubmittingProgress ? "กำลังบันทึก..." : "บันทึกความคืบหน้า"}
                  </button>
                </div>
              </div>
            </form>
            
            <h4 className="text-sm font-medium text-gray-700 mb-2">ประวัติความคืบหน้า</h4>
            
            {sortedProgress.length > 0 ? (
              <div className="space-y-3">
                {sortedProgress.map((progress) => (
                  <div
                    key={progress.id}
                    className="p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{progress.percentComplete}%</span>
                      <span className="text-xs text-gray-600">
                        {format(new Date(progress.createdAt), "d MMM yyyy, HH:mm น.", {
                          locale: th,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{progress.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">ยังไม่มีการบันทึกความคืบหน้า</p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            แก้ไขข้อมูลงาน
          </button>
        </div>
      </div>
    </div>
  );
}
