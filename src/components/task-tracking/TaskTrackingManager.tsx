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
  const { modal } = App.useApp();
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
  
  // 1. ปรับปรุง useEffect ให้เรียงลำดับงานตามความสำคัญก่อนวันที่
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
    
    // เรียงลำดับตามกฎที่กำหนด (งานที่กำลังดำเนินการ -> รอดำเนินการในเดือนนี้ -> ในอนาคต -> ล่าช้า -> เสร็จสิ้น -> ยกเลิก)
    filtered.sort((a, b) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const aDate = new Date(a.startDateTime);
      const bDate = new Date(b.startDateTime);
      
      // คำนวณความสำคัญของงานตามสถานะและวันที่
      const getPriority = (task: TaskWithProgress, date: Date) => {
        // งานที่กำลังดำเนินการ
        if (task.status === 'IN_PROGRESS') return 0;
        // งานที่รอดำเนินการและอยู่ในเดือนปัจจุบัน
        if (task.status === 'PENDING' && date >= today && date <= endOfMonth) return 1;
        // งานที่รอดำเนินการและยังไม่ถึงกำหนด
        if (task.status === 'PENDING' && date > endOfMonth) return 2;
        // งานที่ล่าช้า
        if (task.status === 'DELAYED') return 3;
        // งานที่เสร็จสิ้นแล้ว
        if (task.status === 'COMPLETED') return 4;
        // งานที่ยกเลิก
        if (task.status === 'CANCELLED') return 5;
        // อื่นๆ
        return 6;
      };
      
      const aPriority = getPriority(a, aDate);
      const bPriority = getPriority(b, bDate);
      
      // เรียงตามความสำคัญก่อน
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // ถ้าความสำคัญเท่ากัน ให้เรียงตามวันที่
      return aDate.getTime() - bDate.getTime();
    });
    
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);
  
  const handleFilterChange = (
    status: TaskStatus | "ALL",
    dateRange: [Date | null, Date | null]
  ) => {
    setActiveFilter({ status, dateRange });
  };
  
  // 2. ปรับปรุงการสร้างงานใหม่
  const handleCreateTask = async (data: any) => {
    try {
      // สร้าง plain object ใหม่และคัดลอกเฉพาะข้อมูลที่จำเป็น
      const plainData: {
        title: any;
        description: any | null;
        location: any | null;
        notes: any | null;
        deliveryDetails: any | null;
        status: any;
        activityId: any | null;
        startDateTime?: string;
        endDateTime?: string;
      } = {
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        notes: data.notes || null,
        deliveryDetails: data.deliveryDetails || null,
        status: data.status || "PENDING",
        activityId: data.activityId || null
      };

      // แปลงวันที่เป็น ISO string อย่างชัดเจน
      if (data.startDateTime) {
        if (typeof data.startDateTime === 'object' && data.startDateTime.$isDayjsObject) {
          plainData.startDateTime = data.startDateTime.format();
        } else {
          plainData.startDateTime = new Date(data.startDateTime).toISOString();
        }
      }

      if (data.endDateTime) {
        if (typeof data.endDateTime === 'object' && data.endDateTime.$isDayjsObject) {
          plainData.endDateTime = data.endDateTime.format();
        } else {
          plainData.endDateTime = new Date(data.endDateTime).toISOString();
        }
      }

      // แสดงข้อมูลที่จะส่งไป (debug)
      console.log('Creating task with data:', {
        ...plainData,
        userId
      });
      
      const newTask = await createTask({
        ...plainData,
        startDateTime: plainData.startDateTime || new Date().toISOString(), // Ensure startDateTime is defined
        endDateTime: plainData.endDateTime || null, // Ensure endDateTime is explicitly null if undefined
        userId,
      });
      
      // กำหนดค่า activity สำหรับงานใหม่
      const activity = data.activityId 
        ? yearPlanActivities.find(act => act.id === data.activityId) || null
        : null;
      
      // สร้าง Task object พร้อม relations สำหรับอัพเดท state
      const taskWithRelations = {
        ...newTask,
        progress: [],
        activity,
      };
      
      // อัพเดท state โดยเพิ่มงานใหม่ไว้ด้านบนสุด
      setTasks(prevTasks => [taskWithRelations, ...prevTasks]);
      
      // ปิด modal และรีเซ็ตข้อมูลฟอร์ม
      setShowTaskForm(false);
      setSelectedTask(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating task:", error);
      modal.error({
        title: 'เกิดข้อผิดพลาด',
        content: 'ไม่สามารถเพิ่มงานได้'
      });
    }
  };
  
  // 3. ปรับปรุงการอัพเดทงาน
  const handleUpdateTask = async (data: any) => {
    try {
      if (!selectedTask || !selectedTask.id) {
        console.error('No task selected for update');
        return;
      }

      // สร้าง plain object ใหม่
      const plainData: {
        id: string;
        title: any;
        description: any | null;
        location: any | null;
        notes: any | null;
        deliveryDetails: any | null;
        status: any;
        activityId: any | null;
        startDateTime?: string;
        endDateTime?: string;
      } = {
        id: selectedTask.id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        notes: data.notes || null,
        deliveryDetails: data.deliveryDetails || null,
        status: data.status || selectedTask.status,
        activityId: data.activityId || null
      };

      // แปลงวันที่เป็น ISO string อย่างชัดเจน
      if (data.startDateTime) {
        if (typeof data.startDateTime === 'object' && data.startDateTime.$isDayjsObject) {
          plainData.startDateTime = data.startDateTime.format();
        } else {
          plainData.startDateTime = new Date(data.startDateTime).toISOString();
        }
      }

      if (data.endDateTime) {
        if (typeof data.endDateTime === 'object' && data.endDateTime.$isDayjsObject) {
          plainData.endDateTime = data.endDateTime.format();
        } else {
          plainData.endDateTime = new Date(data.endDateTime).toISOString();
        }
      }

      // แสดงข้อมูลที่จะส่งไป (debug)
      console.log('Updating task with data:', plainData);
      
      const updatedTask = await updateTaskStatus(plainData.id, plainData);
      
      // กำหนดค่า activity สำหรับงานที่อัพเดท
      const activity = data.activityId 
        ? yearPlanActivities.find(act => act.id === data.activityId) || null
        : selectedTask.activity;
      
      // อัพเดท state โดยทันที
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === updatedTask.id) {
            return {
              ...updatedTask,
              progress: task.progress, // คงความคืบหน้าเดิมไว้
              activity: activity, // อัพเดท activity ถ้ามีการเปลี่ยนแปลง
            };
          }
          return task;
        })
      );
      
      // ปิด modal และรีเซ็ตข้อมูลฟอร์ม
      setShowTaskForm(false);
      setIsEditing(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      modal.error({
        title: 'เกิดข้อผิดพลาด',
        content: 'ไม่สามารถอัพเดทงานได้'
      });
    }
  };
  
  // 4. ปรับปรุงการเปลี่ยนสถานะ
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      console.log(`Changing task ${taskId} status to ${newStatus}`);
      
      const updatedTask = await updateTaskStatus(taskId, { status: newStatus });
      
      // อัพเดท state โดยทันที
      setTasks(prevTasks => 
        prevTasks.map(task => {
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
      
      // ไม่จำเป็นต้องใช้ router.refresh() แล้ว
      // router.refresh();  
    } catch (error) {
      console.error("Error updating task status:", error);
      modal.error({
        title: 'เกิดข้อผิดพลาด',
        content: 'ไม่สามารถเปลี่ยนสถานะงานได้'
      });
    }
  };
  
  // 5. ปรับปรุงการลบงาน
  const handleDeleteTask = async (taskId: string) => {
    modal.confirm({
      title: 'ยืนยันการลบงาน',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteTask(taskId);
          
          // อัพเดท state โดยลบงานที่มี id ตรงกับ taskId
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          
          // ปิด modal และรีเซ็ตข้อมูล
          setShowTaskDetail(false);
          setSelectedTask(null);
          
          // ไม่จำเป็นต้องใช้ router.refresh() แล้ว
          // router.refresh();
        } catch (error) {
          console.error("Error deleting task:", error);
          modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: 'ไม่สามารถลบงานได้'
          });
        }
      },
    });
  };
  
  // ส่วนที่เหลือไม่เปลี่ยนแปลง
  const handleViewTaskDetail = (task: TaskWithProgress) => {
    setSelectedTask(task);  
    setShowTaskDetail(true);
    
    // Close task form if open
    if (showTaskForm) {
      setShowTaskForm(false);
      setIsEditing(false);
    }
  };

  const handleEditTask = (task: TaskWithProgress) => {
    setSelectedTask(task);
    setIsEditing(true);
    setShowTaskForm(true);

    // Close task detail if open
    if (showTaskDetail) {
      setShowTaskDetail(false);
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

  // เพิ่มฟังก์ชันสำหรับอัพเดทความคืบหน้า
const handleProgressUpdate = (taskId: string, newProgress: any) => {
  setTasks(prevTasks => 
    prevTasks.map(task => {
      if (task.id === taskId) {
        // เพิ่มความคืบหน้าใหม่เข้าไปใน array progress ของงาน
        return {
          ...task,
          progress: [newProgress, ...task.progress],
          // ถ้าความคืบหน้าเป็น 100% ให้อัพเดทสถานะเป็น COMPLETED
          status: newProgress.percentComplete === 100 ? TaskStatus.COMPLETED : 
                (newProgress.percentComplete > 0 && task.status === TaskStatus.PENDING ? 
                  TaskStatus.IN_PROGRESS : task.status)
        };
      }
      return task;
    })
  );
};

  
  // 6. เพิ่มการ sync ข้อมูลจาก initialTasks เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    // อัพเดทข้อมูลเมื่อ initialTasks มีการเปลี่ยนแปลง (เช่น จากการโหลดหน้าใหม่)
    setTasks(initialTasks);
  }, [initialTasks]);
  
  
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
    onProgressUpdate={handleProgressUpdate} // เพิ่ม prop นี้
  />
)}
    </>
  );
}