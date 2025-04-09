// src/server/actions/dashboard-actions.ts
"use server";

import { db } from "@/lib/db";
import { TodoStatus, TaskStatus } from "@prisma/client";

// ดึงข้อมูลสำหรับหน้า Dashboard
export async function getUserDashboardData(userId: string) {
  try {
    // นับจำนวนแผนงานประจำปี
    const yearPlansCount = await db.yearPlan.count({
      where: { userId },
    });
    
    // นับและหมวดหมู่รายการสิ่งที่ต้องทำ
    const todoLists = await db.todoList.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
    
    // จัดหมวดหมู่ตามสถานะ
    const todoStatusCounts: Record<TodoStatus, number> = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    
    todoLists.forEach((todo) => {
      todoStatusCounts[todo.status]++;
    });
    
    // รายการที่ใกล้ถึงกำหนด (7 วันข้างหน้า)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingTodos = todoLists
      .filter((todo) => {
        const dueDate = new Date(todo.dueDate);
        return (
          (todo.status === "PENDING" || todo.status === "IN_PROGRESS") &&
          dueDate >= now &&
          dueDate <= nextWeek
        );
      })
      .slice(0, 5);
    
    // นับและหมวดหมู่งานที่ต้องติดตาม
    const tasks = await db.task.findMany({
      where: { userId },
      include: { activity: true },
      orderBy: { startDateTime: "desc" },
    });
    
    // จัดหมวดหมู่ตามสถานะ
    const taskStatusCounts: Record<TaskStatus, number> = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      DELAYED: 0,
      CANCELLED: 0,
    };
    
    tasks.forEach((task) => {
      taskStatusCounts[task.status]++;
    });
    
    // งานที่กำลังดำเนินการ
    const inProgressTasks = tasks
      .filter((task) => task.status === "IN_PROGRESS")
      .slice(0, 5);
    
    // นับจำนวนแผนผัง
    const flowchartsCount = await db.flowchart.count({
      where: { userId },
    });
    
    return {
      yearPlans: yearPlansCount,
      todoLists: {
        total: todoLists.length,
        byStatus: todoStatusCounts,
        upcoming: upcomingTodos,
      },
      tasks: {
        total: tasks.length,
        byStatus: taskStatusCounts,
        inProgress: inProgressTasks,
      },
      flowcharts: flowchartsCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("ไม่สามารถดึงข้อมูลแดชบอร์ดได้");
  }
}