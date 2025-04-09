// src/components/task-tracking/TaskTable.tsx
"use client";

import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TaskWithRelations extends Task {
  progress: any[];
  activity: YearPlanActivity | null;
}

interface TaskTableProps {
  tasks: TaskWithRelations[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (taskId: string) => void;
  onViewDetail: (task: TaskWithRelations) => void;
}

export default function TaskTable({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetail,
}: TaskTableProps) {
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
    return format(new Date(dateTime), "d MMM yyyy, HH:mm น.", {
      locale: th,
    });
  };
  
  // ฟังก์ชันคำนวณความคืบหน้าล่าสุด
  const getLatestProgress = (progress: any[]) => {
    if (!progress || progress.length === 0) return 0;
    
    // เรียงตามเวลาที่บันทึก
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedProgress[0].percentComplete;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {tasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">งาน</th>
                <th className="py-3 px-4 text-left font-semibold">กิจกรรมจาก Year Plan</th>
                <th className="py-3 px-4 text-left font-semibold">วันและเวลา</th>
                <th className="py-3 px-4 text-left font-semibold">สถานที่</th>
                <th className="py-3 px-4 text-left font-semibold">ความคืบหน้า</th>
                <th className="py-3 px-4 text-left font-semibold">สถานะ</th>
                <th className="py-3 px-4 text-center font-semibold">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <button
                        onClick={() => onViewDetail(task)}
                        className="font-medium text-blue-600 hover:text-blue-800 text-left"
                      >
                        {task.title}
                      </button>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {task.activity ? (
                      <span className="font-medium text-indigo-600">
                        {task.activity.title}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span>{formatDateTime(task.startDateTime)}</span>
                      {task.endDateTime && (
                        <span className="text-sm text-gray-600 mt-1">
                          ถึง {formatDateTime(task.endDateTime)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {task.location || <span className="text-gray-500">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${getLatestProgress(task.progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      {getLatestProgress(task.progress)}%
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-md border-none ${
                        taskStatusColors[task.status]
                      }`}
                    >
                      <option value="PENDING">รอดำเนินการ</option>
                      <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                      <option value="COMPLETED">เสร็จสิ้น</option>
                      <option value="DELAYED">ล่าช้า</option>
                      <option value="CANCELLED">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>ไม่พบรายการงาน</p>
        </div>
      )}
    </div>
  );
}