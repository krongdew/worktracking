// src/server/actions/public-view-actions.ts
"use server";

import { db } from "@/lib/db";

// ดึงข้อมูลสำหรับแสดงในหน้า public view
export async function getUserPublicData(userId: string) {
  try {
    // ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    
    if (!user) {
      return null;
    }
    
    // ดึงข้อมูล Year Plan
    const yearPlans = await db.yearPlan.findMany({
      where: { userId },
      include: { activities: true },
      orderBy: { year: "desc" },
    });
    
    // ดึงข้อมูล Todo List
    const todoLists = await db.todoList.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
    
    // ดึงข้อมูล Task
    const tasks = await db.task.findMany({
      where: { userId },
      include: { 
        progress: true,
        activity: true
      },
      orderBy: { startDateTime: "desc" },
    });
    
    // ดึงข้อมูล Flowchart
    const flowcharts = await db.flowchart.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    
    return {
      user,
      yearPlans,
      todoLists,
      tasks,
      flowcharts,
    };
  } catch (error) {
    console.error("Error fetching public data:", error);
    throw new Error("ไม่สามารถดึงข้อมูลได้");
  }
}