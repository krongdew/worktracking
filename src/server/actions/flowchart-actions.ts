// src/server/actions/flowchart-actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ดึงรายการ Flowchart ทั้งหมดของผู้ใช้
export async function getUserFlowcharts(userId: string) {
  try {
    const flowcharts = await db.flowchart.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    
    return flowcharts;
  } catch (error) {
    console.error("Error fetching flowcharts:", error);
    throw new Error("ไม่สามารถดึงข้อมูลแผนผังได้");
  }
}

// กำหนด interface สำหรับการสร้าง Flowchart
interface CreateFlowchartParams {
  title: string;
  description?: string | null;
  content: string;
  userId: string;
}

// สร้าง Flowchart ใหม่
export async function createFlowchart(data: CreateFlowchartParams) {
  try {
    const flowchart = await db.flowchart.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        userId: data.userId,
      },
    });
    
    revalidatePath("/flowchart");
    return flowchart;
  } catch (error) {
    console.error("Error creating flowchart:", error);
    throw new Error("ไม่สามารถสร้างแผนผังได้");
  }
}

// กำหนด interface สำหรับการอัปเดต Flowchart
interface UpdateFlowchartParams {
  id: string;
  title?: string;
  description?: string | null;
  content?: string;
}

// อัปเดต Flowchart
export async function updateFlowchart(data: UpdateFlowchartParams) {
  try {
    // สร้าง object สำหรับการอัปเดตที่มี type ถูกต้อง แทนการใช้ any
    const updateData: Partial<{
      title: string;
      description: string | null;
      content: string;
    }> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    
    const flowchart = await db.flowchart.update({
      where: { id: data.id },
      data: updateData,
    });
    
    revalidatePath("/flowchart");
    return flowchart;
  } catch (error) {
    console.error("Error updating flowchart:", error);
    throw new Error("ไม่สามารถอัปเดตแผนผังได้");
  }
}

// ลบ Flowchart
export async function deleteFlowchart(flowchartId: string) {
  try {
    await db.flowchart.delete({
      where: { id: flowchartId },
    });
    
    revalidatePath("/flowchart");
    return { success: true };
  } catch (error) {
    console.error("Error deleting flowchart:", error);
    throw new Error("ไม่สามารถลบแผนผังได้");
  }
}