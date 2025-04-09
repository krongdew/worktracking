// src/components/task-tracking/TaskTrackingManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus, YearPlanActivity } from "@prisma/client";
import TaskFilter from "@/components/task-tracking/TaskFilter";
import TaskTable from "@/components/task-tracking/TaskTable";
import TaskForm from "@/components/task-tracking/TaskForm";
import TaskDetailModal from "@/components/task-tracking/TaskDetailModal";
import { useRouter } from "next/navigation";
import { createTask, updateTaskStatus, deleteTask } from "@/server/actions/task-tracking-actions";

interface TaskWithProgress extends Task {
  progress: any[];
  activity: YearPlanActivity | null;
}

interface TaskTrackingManagerProps {
  initialTasks: TaskWithProgress[];
  yearPlanActivities: YearPlanActivity[];
  userId: string;
}

export default function TaskTrackingManager({ 
  initialTasks,
  yearPlanActivities,
  userId 
}: TaskTrackingManagerProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithProgress[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithProgress[]>(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{
    status: TaskStatus | "ALL";
    startDate: string | null;
    endDate: string | null;
  }>({
    status: "ALL",
    startDate: null,
    endDate: null,
  });
  
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
  
  const handleCreateTask = async (data: any) => {
    try {
      const newTask = await createTask({
        ...data,
        userId,
      });
      
      // เนื่องจาก newTask อาจไม่มีข้อมูล progress และ activity ที่เชื่อมโยง
      // เราต้องดึงข้อมูลใหม่เพื่อให้แสดงผลถูกต้อง
      router.refresh();
      
      // อัปเดต state ชั่วคราว
      const activity = data.activityId 
        ? yearPlanActivities.find(act => act.id === data.activityId) || null
        : null;
      
      setTasks([
        {
          ...newTask,
          progress: [],
          activity,
        },
        ...tasks,
      ]);
      
      setShowTaskForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  const handleUpdateTask = async (data: any) => {
    try {
      const updatedTask = await updateTaskStatus(data.id, data);
      
      // อัปเดตค่าใน state
      setTasks(
        tasks.map((task) => {
          if (task.id === updatedTask.id) {
            return {
              ...updatedTask,
              progress: task.progress,
              activity: task.activity,
            };
          }
          return task;
        })
      );
      
      setShowTaskForm(false);
      setIsEditing(false);
      setSelectedTask(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      
      // อัปเดตค่าใน state
      setTasks(
        tasks.map((task) => {
          if (task.id === updatedTask.id) {
            return {
              ...updatedTask,
              progress: task.progress,
              activity: task.activity,
            };
          }
          return task;
        })
      );
      
      router.refresh();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  const handleEditTask = (task: TaskWithProgress) => {
    setSelectedTask(task);
    setIsEditing(true);
    setShowTaskForm(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("คุณต้องการลบงานนี้ใช่หรือไม่?")) {
      try {
        await deleteTask(taskId);
        
        // อัปเดตค่าใน state
        setTasks(tasks.filter((task) => task.id !== taskId));
        
        router.refresh();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };
  
  const handleViewTaskDetail = (task: TaskWithProgress) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <TaskFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedTask(null);
            setShowTaskForm(true);
          }}
          className="md:w-auto w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          เพิ่มงานใหม่
        </button>
      </div>
      
      <TaskTable
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onViewDetail={handleViewTaskDetail}
      />
      
      {showTaskForm && (
        <TaskForm
          onClose={() => {
            setShowTaskForm(false);
            setIsEditing(false);
            setSelectedTask(null);
          }}
          onSubmit={isEditing ? handleUpdateTask : handleCreateTask}
          initialData={isEditing ? selectedTask : null}
          isEditing={isEditing}
          yearPlanActivities={yearPlanActivities}
        />
      )}
      
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setShowTaskDetail(false);
            setIsEditing(true);
            setShowTaskForm(true);
          }}
        />
      )}
    </div>
  );
}