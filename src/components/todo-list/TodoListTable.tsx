// src/components/todo-list/TodoListTable.tsx
"use client";

import { useState } from "react";
import { TodoList, TodoStatus, TodoType, Priority } from "@prisma/client";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TodoListTableProps {
  todoLists: TodoList[];
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
  onEdit: (todo: TodoList) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoListTable({
  todoLists,
  onStatusChange,
  onEdit,
  onDelete,
}: TodoListTableProps) {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {todoLists.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">รายการ</th>
                <th className="py-3 px-4 text-left font-semibold">ประเภท</th>
                <th className="py-3 px-4 text-left font-semibold">ความสำคัญ</th>
                <th className="py-3 px-4 text-left font-semibold">วันที่ครบกำหนด</th>
                <th className="py-3 px-4 text-left font-semibold">สถานะ</th>
                <th className="py-3 px-4 text-center font-semibold">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {todoLists.map((todo) => (
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
                    <select
                      value={todo.status}
                      onChange={(e) => onStatusChange(todo.id, e.target.value as TodoStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-md border-none ${todoStatusColors[todo.status]}`}
                    >
                      <option value="PENDING">รอดำเนินการ</option>
                      <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                      <option value="COMPLETED">เสร็จสิ้น</option>
                      <option value="CANCELLED">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(todo)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => onDelete(todo.id)}
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
          <p>ไม่พบรายการที่ต้องทำ</p>
        </div>
      )}
    </div>
  );
}