// src/components/public-view/PublicTaskTracking.tsx
"use client";

import { useState, useEffect } from "react";
import { TaskStatus, YearPlanActivity } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TaskProgress {
  id: string;
  description: string;
  percentComplete: number;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime?: Date;
  location?: string;
  status: TaskStatus;
  notes?: string;
  deliveryDetails?: string;
  activity?: YearPlanActivity;
  progress: TaskProgress[];
  createdAt: Date;
  updatedAt: Date;
}

interface PublicTaskTrackingProps {
  tasks: Task[];
}

export default function PublicTaskTracking({ tasks }: PublicTaskTrackingProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [activeFilter, setActiveFilter] = useState<{
    status: TaskStatus | "ALL";
    startDate: string | null;
    endDate: string | null;
  }>({
    status: "ALL",
    startDate: null,
    endDate: null,
  });
  
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
  
  const taskStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "DELAYED", label: "ล่าช้า" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];
  
  useEffect(() => {
    // ฟิลเตอร์ตามสถานะและวันที่
    let filtered = [...tasks];
    
    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter((task) => task.status === activeFilter.status);
    }
    
    if (activeFilter.startDate) {
      const startDate = new Date(activeFilter.startDate);
      filtered = filtered.filter(
        (task) => new Date(task.startDateTime) >= startDate
      );
    }
    
    if (activeFilter.endDate) {
      const endDate = new Date(activeFilter.endDate);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(
        (task) => new Date(task.startDateTime) <= endDate
      );
    }
    
    // เรียงตามวันที่เริ่มต้น (ล่าสุดอยู่บนสุด)
    filtered.sort((a, b) => {
      return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
    });
    
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);
  
  const handleFilterChange = (
    status: TaskStatus | "ALL",
    startDate: string | null,
    endDate: string | null
  ) => {
    setActiveFilter({ status, startDate, endDate });
  };
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่และเวลา
  const formatDateTime = (dateTime: Date) => {
    return format(new Date(dateTime), "d MMM yyyy, HH:mm น.", {
      locale: th,
    });
  };
  
  // ฟังก์ชันคำนวณความคืบหน้าล่าสุด
  const getLatestProgress = (progress: TaskProgress[]) => {
    if (!progress || progress.length === 0) return 0;
    
    // เรียงตามเวลาที่บันทึก
    const sortedProgress = [...progress].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedProgress[0].percentComplete;
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">สถานะ:</span>
            <select
              value={activeFilter.status}
              onChange={(e) => handleFilterChange(e.target.value as TaskStatus | "ALL", activeFilter.startDate, activeFilter.endDate)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {taskStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">จากวันที่:</span>
            <input
              type="date"
              value={activeFilter.startDate || ""}
              onChange={(e) => handleFilterChange(activeFilter.status, e.target.value || null, activeFilter.endDate)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">ถึงวันที่:</span>
            <input
              type="date"
              value={activeFilter.endDate || ""}
              onChange={(e) => handleFilterChange(activeFilter.status, activeFilter.startDate, e.target.value || null)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => handleFilterChange("ALL", null, null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            รีเซ็ตฟิลเตอร์
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTasks.length > 0 ? (
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
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{task.title}</span>
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
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        taskStatusColors[task.status]
                      }`}>
                        {taskStatusLabels[task.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {}}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ดูรายละเอียด
                      </button>
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
    </div>
  );
}