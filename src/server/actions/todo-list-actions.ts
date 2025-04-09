// src/server/actions/todo-list-actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TodoType, TodoStatus, Priority } from "@prisma/client";

// ดึงรายการ To-do List ทั้งหมดของผู้ใช้
export async function getUserTodoLists(userId: string) {
  try {
    const todoLists = await db.todoList.findMany({
      where: { userId },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
    
    return todoLists;
  } catch (error) {
    console.error("Error fetching todo lists:", error);
    throw new Error("ไม่สามารถดึงข้อมูลรายการสิ่งที่ต้องทำได้");
  }
}

// สร้างรายการ To-do List ใหม่
export async function createTodoList(data: {
  title: string;
  description?: string;
  dueDate: string;
  type: TodoType;
  priority: Priority;
  userId: string;
}) {
  try {
    const todoList = await db.todoList.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        type: data.type,
        priority: data.priority,
        status: TodoStatus.PENDING,
        userId: data.userId,
      },
    });
    
    revalidatePath("/todo-list");
    return todoList;
  } catch (error) {
    console.error("Error creating todo list:", error);
    throw new Error("ไม่สามารถสร้างรายการสิ่งที่ต้องทำได้");
  }
}

// อัปเดตสถานะของรายการ To-do List
export async function updateTodoStatus(todoId: string, data: {
  status?: TodoStatus;
  title?: string;
  description?: string;
  dueDate?: string;
  type?: TodoType;
  priority?: Priority;
}) {
  try {
    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.type) updateData.type = data.type;
    if (data.priority) updateData.priority = data.priority;
    
    const todoList = await db.todoList.update({
      where: { id: todoId },
      data: updateData,
    });
    
    revalidatePath("/todo-list");
    return todoList;
  } catch (error) {
    console.error("Error updating todo status:", error);
    throw new Error("ไม่สามารถอัปเดตสถานะรายการได้");
  }
}

// ลบรายการ To-do List
export async function deleteTodoList(todoId: string) {
  try {
    await db.todoList.delete({
      where: { id: todoId },
    });
    
    revalidatePath("/todo-list");
    return { success: true };
  } catch (error) {
    console.error("Error deleting todo list:", error);
    throw new Error("ไม่สามารถลบรายการได้");
  }
}