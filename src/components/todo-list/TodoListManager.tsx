// src/components/todo-list/TodoListManager.tsx
"use client";

import { useState, useEffect } from "react";
import { TodoList, TodoStatus, TodoType, Priority } from "@prisma/client";
import TodoListFilter from "@/components/todo-list/TodoListFilter";
import TodoListTable from "@/components/todo-list/TodoListTable";
import TodoListForm from "@/components/todo-list/TodoListForm";
import { useRouter } from "next/navigation";
import { createTodoList, updateTodoStatus, deleteTodoList } from "@/server/actions/todo-list-actions";

interface TodoListManagerProps {
  initialTodoLists: TodoList[];
  userId: string;
}

export default function TodoListManager({ initialTodoLists, userId }: TodoListManagerProps) {
  const router = useRouter();
  const [todoLists, setTodoLists] = useState<TodoList[]>(initialTodoLists);
  const [filteredTodoLists, setFilteredTodoLists] = useState<TodoList[]>(initialTodoLists);
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoList | null>(null);
  const [activeFilter, setActiveFilter] = useState<{
    type: TodoType | "ALL";
    status: TodoStatus | "ALL";
  }>({
    type: "ALL",
    status: "ALL",
  });
  
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
  
  const handleCreateTodoList = async (data: any) => {
    try {
      const newTodo = await createTodoList({
        ...data,
        userId,
      });
      
      setTodoLists([...todoLists, newTodo]);
      setShowTodoForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };
  
  const handleUpdateTodoList = async (data: any) => {
    try {
      const updatedTodo = await updateTodoStatus(data.id, data);
      
      // อัปเดตค่าใน state
      setTodoLists(
        todoLists.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      
      setShowTodoForm(false);
      setIsEditing(false);
      setEditingItem(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };
  
  const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    try {
      const updatedTodo = await updateTodoStatus(todoId, { status: newStatus });
      
      // อัปเดตค่าใน state
      setTodoLists(
        todoLists.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      
      router.refresh();
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };
  
  const handleEditTodoList = (todo: TodoList) => {
    setEditingItem(todo);
    setIsEditing(true);
    setShowTodoForm(true);
  };
  
  const handleDeleteTodoList = async (todoId: string) => {
    if (confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
      try {
        await deleteTodoList(todoId);
        
        // อัปเดตค่าใน state
        setTodoLists(todoLists.filter((todo) => todo.id !== todoId));
        
        router.refresh();
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <TodoListFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        
        <button
          onClick={() => {
            setIsEditing(false);
            setEditingItem(null);
            setShowTodoForm(true);
          }}
          className="md:w-auto w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          เพิ่มรายการใหม่
        </button>
      </div>
      
      <TodoListTable
        todoLists={filteredTodoLists}
        onStatusChange={handleStatusChange}
        onEdit={handleEditTodoList}
        onDelete={handleDeleteTodoList}
      />
      
      {showTodoForm && (
        <TodoListForm
          onClose={() => {
            setShowTodoForm(false);
            setIsEditing(false);
            setEditingItem(null);
          }}
          onSubmit={isEditing ? handleUpdateTodoList : handleCreateTodoList}
          initialData={isEditing ? editingItem : null}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}