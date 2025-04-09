// src/server/actions/task-tracking-actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TaskStatus } from "@prisma/client";

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
    console.error("Error fetching tasks:", error);
    throw new Error("ไม่สามารถดึงข้อมูลงานได้");
  }
}

// สร้างงานใหม่
export async function createTask(data: {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
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
        startDateTime: new Date(data.startDateTime),
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
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
    console.error("Error creating task:", error);
    throw new Error("ไม่สามารถสร้างงานได้");
  }
}

// อัปเดตข้อมูลของงาน
export async function updateTaskStatus(taskId: string, data: {
  status?: TaskStatus;
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  notes?: string;
  deliveryDetails?: string;
  activityId?: string | null;
}) {
  try {
    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDateTime) updateData.startDateTime = new Date(data.startDateTime);
    if (data.endDateTime === "") updateData.endDateTime = null;
    else if (data.endDateTime) updateData.endDateTime = new Date(data.endDateTime);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.deliveryDetails !== undefined) updateData.deliveryDetails = data.deliveryDetails;
    if (data.activityId !== undefined) updateData.activityId = data.activityId;
    
    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
    });
    
    revalidatePath("/task-tracking");
    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("ไม่สามารถอัปเดตข้อมูลงานได้");
  }
}

// เพิ่มความคืบหน้าของงาน
export async function updateTaskProgress(taskId: string, data: {
  description: string;
  percentComplete: number;
}) {
  try {
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
    console.error("Error updating task progress:", error);
    throw new Error("ไม่สามารถบันทึกความคืบหน้าได้");
  }
}

// ลบงาน
export async function deleteTask(taskId: string) {
  try {
    await db.task.delete({
      where: { id: taskId },
    });
    
    revalidatePath("/task-tracking");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("ไม่สามารถลบงานได้");
  }
}