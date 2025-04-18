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
import { Button, Modal } from "antd";
import { App } from 'antd';

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
  const { modal } = App.useApp(); // Add this hook
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithProgress[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithProgress[]>(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{
    status: TaskStatus | "ALL";
    dateRange: [Date | null, Date | null];
  }>({
    status: "ALL",
    dateRange: [null, null],
  });
  
  useEffect(() => {
    let filtered = [...tasks];
    
    if (activeFilter.status !== "ALL") {
      filtered = filtered.filter((task) => task.status === activeFilter.status);
    }
    
    if (activeFilter.dateRange[0]) {
      filtered = filtered.filter(
        (task) => new Date(task.startDateTime) >= activeFilter.dateRange[0]!
      );
    }
    
    if (activeFilter.dateRange[1]) {
      filtered = filtered.filter(  
        (task) => new Date(task.startDateTime) <= activeFilter.dateRange[1]!
      );
    }
    
    filtered.sort((a, b) => {
      return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
    });
    
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);
  
  const handleFilterChange = (
    status: TaskStatus | "ALL",
    dateRange: [Date | null, Date | null]
  ) => {
    setActiveFilter({ status, dateRange });
  };
  
  const handleCreateTask = async (data: any) => {
    try {
      const newTask = await createTask({
        ...data,
        userId,
      });
      
      router.refresh();
      
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
      
      // Reset all modals and forms
      setShowTaskForm(false);
      setSelectedTask(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  const handleUpdateTask = async (data: any) => {
    try {
      // Check if selectedTask exists and has an id
      if (!selectedTask || !selectedTask.id) {
        console.error('No task selected for update');
        return;
      }
  
      // Prepare clean data for update
      const updateData = {
        id: selectedTask.id, // Use the id from selectedTask
        title: data.title,
        description: data.description,
        startDateTime: data.startDateTime instanceof Date 
          ? data.startDateTime.toISOString() 
          : data.startDateTime,
        endDateTime: data.endDateTime instanceof Date 
          ? data.endDateTime.toISOString() 
          : data.endDateTime,
        location: data.location,
        notes: data.notes,
        deliveryDetails: data.deliveryDetails,
        status: data.status,
        activityId: data.activityId,
      };
  
      const updatedTask = await updateTaskStatus(updateData.id, updateData);
      
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
      // Optionally show an error message to the user
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      
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
    
    // Reset task detail modal
    if (showTaskDetail) {
      setShowTaskDetail(false);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    modal.confirm({
      title: 'ยืนยันการลบงาน',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteTask(taskId);
          
          setTasks(tasks.filter((task) => task.id !== taskId));
          
          // Reset modal states
          setShowTaskDetail(false);
          setSelectedTask(null);
          
          router.refresh();
        } catch (error) {
          console.error("Error deleting task:", error);
          // Optionally show an error message
          modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: 'ไม่สามารถลบงานได้'
          });
        }
      },
    });
  };
  
  const handleViewTaskDetail = (task: TaskWithProgress) => {
    setSelectedTask(task);  
    setShowTaskDetail(true);
    
    // Close task form if open
    if (showTaskForm) {
      setShowTaskForm(false);
      setIsEditing(false);
    }
  };
  
  const handleCloseTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };
  
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setSelectedTask(null);
    setIsEditing(false);
  };
  
  return (
    <>
      <div className="mb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <TaskFilter
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange}
        />
        
        <Button
          type="primary"
          onClick={() => {
            setIsEditing(false);
            setSelectedTask(null);
            setShowTaskForm(true);
            
            // Close task detail if open
            if (showTaskDetail) {
              setShowTaskDetail(false);
            }
          }}
        >
          เพิ่มงานใหม่
        </Button>
      </div>
      
      <TaskTable
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onEdit={handleEditTask}  
        onDelete={handleDeleteTask}
        onViewDetail={handleViewTaskDetail}
      />
      
      {showTaskForm && (
        <Modal
          title={isEditing ? "แก้ไขงาน" : "เพิ่มงานใหม่"}
          open={showTaskForm} 
          onCancel={handleCloseTaskForm}
          footer={null}
        >
          <TaskForm
            onClose={handleCloseTaskForm}
            onSubmit={isEditing ? handleUpdateTask : handleCreateTask}
            initialData={isEditing ? selectedTask : null}
            isEditing={isEditing}
            yearPlanActivities={yearPlanActivities}
          />
        </Modal>
      )}
      
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseTaskDetail}
          onEdit={() => {
            handleCloseTaskDetail();
            setIsEditing(true);
            setShowTaskForm(true);
          }}
          visible={showTaskDetail}
        />
      )}
    </>
  );
}