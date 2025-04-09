// src/components/todo-list/TodoListFilter.tsx
"use client";

import { TodoType, TodoStatus } from "@prisma/client";

interface TodoListFilterProps {
  activeFilter: {
    type: TodoType | "ALL";
    status: TodoStatus | "ALL";
  };
  onFilterChange: (type: TodoType | "ALL", status: TodoStatus | "ALL") => void;
}

export default function TodoListFilter({
  activeFilter,
  onFilterChange,
}: TodoListFilterProps) {
  const todoTypes = [
    { value: "ALL", label: "ทั้งหมด" },
    { value: "DAILY", label: "รายวัน" },
    { value: "WEEKLY", label: "รายสัปดาห์" },
    { value: "MONTHLY", label: "รายเดือน" },
  ];
  
  const todoStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];
  
  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">ประเภท:</span>
        <select
          value={activeFilter.type}
          onChange={(e) => onFilterChange(e.target.value as TodoType | "ALL", activeFilter.status)}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {todoTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">สถานะ:</span>
        <select
          value={activeFilter.status}
          onChange={(e) => onFilterChange(activeFilter.type, e.target.value as TodoStatus | "ALL")}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {todoStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}