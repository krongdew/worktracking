// src/components/public-view/PublicTodoList.tsx
"use client";

import { useState, useEffect } from "react";
import { TodoType, TodoStatus, Priority } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TodoList {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: TodoType;
  status: TodoStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicTodoListProps {
  todoLists: TodoList[];
}

export default function PublicTodoList({ todoLists }: PublicTodoListProps) {
  const [filteredTodoLists, setFilteredTodoLists] = useState<TodoList[]>(todoLists);
  const [activeFilter, setActiveFilter] = useState<{
    type: TodoType | "ALL";
    status: TodoStatus | "ALL";
  }>({
    type: "ALL",
    status: "ALL",
  });
  
  const todoTypeLabels: Record<TodoType, string> = {
    DAILY: "รายวัน",
    WEEKLY: "รายสัปดาห์",
    MONTHLY: "รายเดือน",
  };
  
  const todoStatusLabels: Record<TodoStatus, string> = {
    PENDING: "รอดำเนินการ",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
    CANCELLED: "ยกเลิก",
  };
  
  const priorityLabels: Record<Priority, string> = {
    LOW: "ต่ำ",
    MEDIUM: "ปานกลาง",
    HIGH: "สูง",
    URGENT: "เร่งด่วน",
  };
  
  const priorityColors: Record<Priority, string> = {
    LOW: "bg-blue-100 text-blue-800",
    MEDIUM: "bg-green-100 text-green-800",
    HIGH: "bg-yellow-100 text-yellow-800",
    URGENT: "bg-red-100 text-red-800",
  };
  
  const todoStatusColors: Record<TodoStatus, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  
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
  
  useEffect(() => {
    // ฟิลเตอร์ตามประเภทและสถานะ
    let filtered = [...todoLists];
    
    if (activeFilter.type !== "ALL") {
      filtered = filtered.filter((todo) => todo.type === activeFilter.type);
    }
    
    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter((todo) => todo.status === activeFilter.status);
    }
    
    // เรียงตามวันที่ครบกำหนด (ใกล้หมดเวลาจะอยู่บนสุด) และตาม priority
    filtered.sort((a, b) => {
      // เรียงตามวันที่ครบกำหนด
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      
      // ถ้าวันที่เท่ากัน ให้เรียงตามความสำคัญ
      if (dateComparison === 0) {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return dateComparison;
    });
    
    setFilteredTodoLists(filtered);
  }, [todoLists, activeFilter]);
  
  const handleFilterChange = (type: TodoType | "ALL", status: TodoStatus | "ALL") => {
    setActiveFilter({ type, status });
  };
  
  // ฟังก์ชันตรวจสอบว่าวันที่ครบกำหนดใกล้มาถึงหรือเลยกำหนดหรือไม่
  const isDueDateNear = (dueDate: Date) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 2 && diffDays >= 0;
  };
  
  const isPastDue = (dueDate: Date) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    return dueDateObj < today;
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">ประเภท:</span>
            <select
              value={activeFilter.type}
              onChange={(e) => handleFilterChange(e.target.value as TodoType | "ALL", activeFilter.status)}
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
              onChange={(e) => handleFilterChange(activeFilter.type, e.target.value as TodoStatus | "ALL")}
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
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTodoLists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">รายการ</th>
                  <th className="py-3 px-4 text-left font-semibold">ประเภท</th>
                  <th className="py-3 px-4 text-left font-semibold">ความสำคัญ</th>
                  <th className="py-3 px-4 text-left font-semibold">วันที่ครบกำหนด</th>
                  <th className="py-3 px-4 text-left font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTodoLists.map((todo) => (
                  <tr key={todo.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{todo.title}</p>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span>{todoTypeLabels[todo.type]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
                        {priorityLabels[todo.priority]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`${
                          todo.status !== "COMPLETED" && todo.status !== "CANCELLED"
                            ? isPastDue(todo.dueDate)
                              ? "text-red-600 font-semibold"
                              : isDueDateNear(todo.dueDate)
                              ? "text-yellow-600 font-semibold"
                              : ""
                            : ""
                        }`}
                      >
                        {format(new Date(todo.dueDate), "d MMMM yyyy", { locale: th })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${todoStatusColors[todo.status]}`}>
                        {todoStatusLabels[todo.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>ไม่พบรายการที่ต้องทำ</p>
          </div>
        )}
      </div>
    </div>
  );
}