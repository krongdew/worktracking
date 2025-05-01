// src/server/actions/task-tracking-actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TaskStatus } from "@prisma/client";

// Utility function for detailed logging
function logDetailedError(context: string, error: any) {
  console.error(`[ERROR in ${context}]`, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    additionalInfo: error
  });
}

// ดึงงานทั้งหมดของผู้ใช้
export async function getUserTasks(userId: string) {
  try {
    const tasks = await db.task.findMany({
      where: { userId },
      include: { 
        progress: true,
        activity: true
      },
      orderBy: { startDateTime: "desc" },
    });
    
    return tasks;
  } catch (error) {
    logDetailedError('getUserTasks', error);
    throw new Error("ไม่สามารถดึงข้อมูลงานได้");
  }
}

// สร้างงานใหม่
export async function createTask(data: {
  title: string;
  description?: string;
  startDateTime: string | Date;
  endDateTime?: string | Date | null;
  location?: string;
  notes?: string;
  deliveryDetails?: string;
  activityId?: string | null;
  userId: string;
}) {
  try {
    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description,
        startDateTime: data.startDateTime instanceof Date 
          ? data.startDateTime 
          : new Date(data.startDateTime),
        endDateTime: data.endDateTime 
          ? (data.endDateTime instanceof Date 
            ? data.endDateTime 
            : new Date(data.endDateTime)) 
          : null,
        location: data.location,
        notes: data.notes,
        deliveryDetails: data.deliveryDetails,
        status: TaskStatus.PENDING,
        activityId: data.activityId,
        userId: data.userId,
      },
    });
    
    revalidatePath("/task-tracking");
    return task;
  } catch (error) {
    logDetailedError('createTask', error);
    throw new Error("ไม่สามารถสร้างงานได้");
  }
}

// อัปเดตข้อมูลของงาน
export async function updateTaskStatus(taskId: string, data: {
  title?: string;
  description?: string;
  startDateTime?: string | Date;
  endDateTime?: string | Date | null;
  location?: string;
  notes?: string;
  deliveryDetails?: string;
  activityId?: string | null;
  status?: TaskStatus;
}) {
  try {
    // ตรวจสอบ taskId อย่างละเอียด
    console.log('Received taskId:', taskId);
    console.log('Received update data:', JSON.stringify(data, null, 2));

    // ตรวจสอบว่ามี taskId หรือไม่
    if (!taskId) {
      console.error('No task ID provided');
      throw new Error("ไม่มีรหัสงานที่ถูกต้อง");
    }

    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    
    // จัดการกับ startDateTime
    if (data.startDateTime) {
      updateData.startDateTime = data.startDateTime instanceof Date
        ? data.startDateTime
        : new Date(data.startDateTime);
    }
    
    // จัดการกับ endDateTime
    if (data.endDateTime === "") {
      updateData.endDateTime = null;
    } else if (data.endDateTime) {
      updateData.endDateTime = data.endDateTime instanceof Date
        ? data.endDateTime
        : new Date(data.endDateTime);
    }
    
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.deliveryDetails !== undefined) updateData.deliveryDetails = data.deliveryDetails;
    if (data.activityId !== undefined) updateData.activityId = data.activityId;
    
    // ตรวจสอบว่ามีข้อมูลที่จะอัปเดตหรือไม่
    if (Object.keys(updateData).length === 0) {
      console.error('No update data provided');
      throw new Error("ไม่มีข้อมูลที่ต้องการอัปเดต");
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
    });
    
    revalidatePath("/task-tracking");
    return task;
  } catch (error) {
    logDetailedError('updateTaskStatus', error);
    
    // Improve error handling to provide more context
    if (error instanceof Error) {
      throw new Error(`ไม่สามารถอัปเดตข้อมูลงานได้: ${error.message}`);
    }
    
    throw new Error("ไม่สามารถอัปเดตข้อมูลงานได้");
  }
}

// เพิ่มความคืบหน้าของงาน
export async function updateTaskProgress(taskId: string, data: {
  description: string;
  percentComplete: number;
}) {
  try {
    // ตรวจสอบ taskId อย่างละเอียด
    if (typeof taskId !== 'string' || taskId.trim() === '') {
      console.error('Invalid taskId:', taskId);
      throw new Error("รหัสงานไม่ถูกต้อง");
    }

    // บันทึกความคืบหน้า
    const progress = await db.taskProgress.create({
      data: {
        description: data.description,
        percentComplete: data.percentComplete,
        taskId,
      },
    });
    
    // ถ้าความคืบหน้า 100% ให้อัปเดตสถานะเป็น COMPLETED
    if (data.percentComplete === 100) {
      await db.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.COMPLETED },
      });
    }
    // ถ้าความคืบหน้า > 0% แต่ < 100% และสถานะเป็น PENDING ให้อัปเดตเป็น IN_PROGRESS
    else if (data.percentComplete > 0) {
      const task = await db.task.findUnique({
        where: { id: taskId },
        select: { status: true },
      });
      
      if (task && task.status === TaskStatus.PENDING) {
        await db.task.update({
          where: { id: taskId },
          data: { status: TaskStatus.IN_PROGRESS },
        });
      }
    }
    
    revalidatePath("/task-tracking");
    return progress;
  } catch (error) {
    // ...handle errors
    throw new Error("ไม่สามารถบันทึกความคืบหน้าได้");
  }
}

// ลบงาน
export async function deleteTask(taskId: string) {
  try {
    // ตรวจสอบ taskId อย่างละเอียด
    if (typeof taskId !== 'string' || taskId.trim() === '') {
      console.error('Invalid taskId:', taskId);
      throw new Error("รหัสงานไม่ถูกต้อง");
    }

    await db.task.delete({
      where: { id: taskId },
    });
    
    revalidatePath("/task-tracking");
    return { success: true };
  } catch (error) {
    logDetailedError('deleteTask', error);
    
    // Improve error handling to provide more context
    if (error instanceof Error) {
      throw new Error(`ไม่สามารถลบงานได้: ${error.message}`);
    }
    
    throw new Error("ไม่สามารถลบงานได้");
  }
}