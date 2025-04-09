// src/components/task-tracking/TaskFilter.tsx
"use client";

import { TaskStatus } from "@prisma/client";
import { format } from "date-fns";

interface TaskFilterProps {
  activeFilter: {
    status: TaskStatus | "ALL";
    startDate: string | null;
    endDate: string | null;
  };
  onFilterChange: (
    status: TaskStatus | "ALL",
    startDate: string | null,
    endDate: string | null
  ) => void;
}

export default function TaskFilter({
  activeFilter,
  onFilterChange,
}: TaskFilterProps) {
  const taskStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "DELAYED", label: "ล่าช้า" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(
      e.target.value as TaskStatus | "ALL",
      activeFilter.startDate,
      activeFilter.endDate
    );
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(
      activeFilter.status,
      e.target.value || null,
      activeFilter.endDate
    );
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange(
      activeFilter.status,
      activeFilter.startDate,
      e.target.value || null
    );
  };
  
  const handleResetFilter = () => {
    onFilterChange("ALL", null, null);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">สถานะ:</span>
        <select
          value={activeFilter.status}
          onChange={handleStatusChange}
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
          onChange={handleStartDateChange}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">ถึงวันที่:</span>
        <input
          type="date"
          value={activeFilter.endDate || ""}
          onChange={handleEndDateChange}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <button
        onClick={handleResetFilter}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        รีเซ็ตฟิลเตอร์
      </button>
    </div>
  );
}
