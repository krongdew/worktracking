"use client";

import { useState, useEffect } from "react";
import TodoListFilter from "@/components/todo-list/TodoListFilter";
import TodoListTable from "@/components/todo-list/TodoListTable";
import TodoListForm from "@/components/todo-list/TodoListForm";
import { useRouter } from "next/navigation";
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createTodoList, updateTodoStatus, deleteTodoList } from "@/server/actions/todo-list-actions";

// Local type definitions to avoid Prisma import
type TodoType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TodoList {
  id: string;
  title: string;
  description: string | null;
  type: TodoType;
  status: TodoStatus;
  priority: Priority;
  dueDate: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoListManagerProps {
  initialTodoLists: TodoList[];
  userId: string;
}

export default function TodoListManager({ 
  initialTodoLists, 
  userId 
}: TodoListManagerProps) {
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
      
      // อัพเดต state โดยตรงโดยคงการเรียงลำดับเดิม
      const updatedTodos = [...todoLists, newTodo];
      setTodoLists(updatedTodos);
      
      // เรียงลำดับใหม่ตามวันที่ครบกำหนด
      sortTodoLists(updatedTodos);
      
      setShowTodoForm(false);
      // ลบ router.refresh(); เพื่อไม่ให้รีเฟรชหน้า
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };
  
  const handleUpdateTodoList = async (data: any) => {
    try {
      const updatedTodo = await updateTodoStatus(data.id, data);
      
      // อัพเดต state โดยตรงและคงการเรียงลำดับเดิมไว้
      const updatedTodos = todoLists.map((todo) => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      setTodoLists(updatedTodos);
      
      // เรียงลำดับใหม่ตามวันที่ครบกำหนด
      sortTodoLists(updatedTodos);
      
      setShowTodoForm(false);
      setIsEditing(false);
      setEditingItem(null);
      // ลบ router.refresh(); เพื่อไม่ให้รีเฟรชหน้า
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    try {
      const updatedTodo = await updateTodoStatus(todoId, { status: newStatus });
      
      // อัพเดต state โดยตรง
      const updatedTodos = todoLists.map((todo) => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      setTodoLists(updatedTodos);
      
      // เรียงลำดับใหม่ตามวันที่ครบกำหนด
      sortTodoLists(updatedTodos);
      
      // ลบ router.refresh(); เพื่อไม่ให้รีเฟรชหน้า
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
        
        // อัพเดต state โดยตรง
        setTodoLists(todoLists.filter((todo) => todo.id !== todoId));
        
        // ลบ router.refresh(); เพื่อไม่ให้รีเฟรชหน้า
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };

  // เพิ่มฟังก์ชัน helper สำหรับการเรียงลำดับ
  const sortTodoLists = (todos: TodoList[]) => {
    const sorted = [...todos].sort((a, b) => {
      // เรียงตามวันที่ครบกำหนด (ใกล้หมดเวลาจะอยู่บนสุด)
      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      
      // ถ้าวันที่เท่ากัน ให้เรียงตามความสำคัญ
      if (dateComparison === 0) {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return dateComparison;
    });
    
    setFilteredTodoLists(
      sorted.filter(todo => {
        let matches = true;
        if (activeFilter.type !== "ALL") matches = matches && todo.type === activeFilter.type;
        if (activeFilter.status !== "ALL") matches = matches && todo.status === activeFilter.status;
        return matches;
      })
    );
  };
  
  // เมื่อ activeFilter เปลี่ยน ให้ใช้ sortTodoLists อีกครั้ง
  useEffect(() => {
    sortTodoLists(todoLists);
  }, [activeFilter, todoLists]);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <TodoListFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        
        <Button 
  type="primary" 
  icon={<PlusOutlined />}
  onClick={() => {
    setIsEditing(false);
    setEditingItem(null);
    setShowTodoForm(true);
  }}
  className="md:w-auto w-full"
>
  เพิ่มรายการใหม่
</Button>
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