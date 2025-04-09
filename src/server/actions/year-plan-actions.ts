// src/server/actions/year-plan-actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";

// ดึงแผนการดำเนินงานทั้งหมดของผู้ใช้
export async function getUserYearPlans(userId: string) {
  try {
    const yearPlans = await db.yearPlan.findMany({
      where: { userId },
      include: { activities: true },
      orderBy: { year: "desc" },
    });
    
    return yearPlans;
  } catch (error) {
    console.error("Error fetching year plans:", error);
    throw new Error("ไม่สามารถดึงข้อมูลแผนการดำเนินงานได้");
  }
}

// สร้างแผนการดำเนินงานใหม่
export async function createYearPlan(data: {
  title: string;
  description?: string;
  year: number;
  userId: string;
}) {
  try {
    const yearPlan = await db.yearPlan.create({
      data: {
        title: data.title,
        description: data.description,
        year: data.year,
        userId: data.userId,
      },
      include: { activities: true },
    });
    
    revalidatePath("/year-plan");
    return yearPlan;
  } catch (error) {
    console.error("Error creating year plan:", error);
    throw new Error("ไม่สามารถสร้างแผนการดำเนินงานได้");
  }
}

// อัปเดตแผนการดำเนินงาน
export async function updateYearPlan(data: {
  id: string;
  title: string;
  description?: string;
  year: number;
}) {
  try {
    const yearPlan = await db.yearPlan.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        year: data.year,
      },
      include: { activities: true },
    });
    
    revalidatePath("/year-plan");
    return yearPlan;
  } catch (error) {
    console.error("Error updating year plan:", error);
    throw new Error("ไม่สามารถอัปเดตแผนการดำเนินงานได้");
  }
}

// ลบแผนการดำเนินงาน
export async function deleteYearPlan(yearPlanId: string) {
  try {
    await db.yearPlan.delete({
      where: { id: yearPlanId },
    });
    
    revalidatePath("/year-plan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting year plan:", error);
    throw new Error("ไม่สามารถลบแผนการดำเนินงานได้");
  }
}

// สร้างกิจกรรมใหม่
export async function createActivity(data: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category?: string;
  type: ActivityType;
  yearPlanId: string;
}) {
  try {
    // ถ้าเป็นงานต่อเนื่องตลอดปี ให้กำหนดวันที่ให้ครอบคลุมทั้งปี
    let startDate = new Date(data.startDate);
    let endDate = new Date(data.endDate);
    
    if (data.type === ActivityType.ONGOING) {
      const yearPlan = await db.yearPlan.findUnique({
        where: { id: data.yearPlanId },
        select: { year: true },
      });
      
      if (yearPlan) {
        startDate = new Date(yearPlan.year, 0, 1); // 1 มกราคม
        endDate = new Date(yearPlan.year, 11, 31); // 31 ธันวาคม
      }
    }
    
    const activity = await db.yearPlanActivity.create({
      data: {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        category: data.category,
        type: data.type,
        yearPlanId: data.yearPlanId,
      },
    });
    
    revalidatePath("/year-plan");
    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("ไม่สามารถสร้างกิจกรรมได้");
  }
}

// อัปเดตกิจกรรม
export async function updateActivity(data: {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category?: string;
  type: ActivityType;
}) {
  try {
    // หา yearPlanId ของกิจกรรมที่จะอัปเดต
    const currentActivity = await db.yearPlanActivity.findUnique({
      where: { id: data.id },
      select: { yearPlanId: true },
    });
    
    if (!currentActivity) {
      throw new Error("ไม่พบกิจกรรมที่ต้องการอัปเดต");
    }
    
    // ถ้าเป็นงานต่อเนื่องตลอดปี ให้กำหนดวันที่ให้ครอบคลุมทั้งปี
    let startDate = new Date(data.startDate);
    let endDate = new Date(data.endDate);
    
    if (data.type === ActivityType.ONGOING) {
      const yearPlan = await db.yearPlan.findUnique({
        where: { id: currentActivity.yearPlanId },
        select: { year: true },
      });
      
      if (yearPlan) {
        startDate = new Date(yearPlan.year, 0, 1); // 1 มกราคม
        endDate = new Date(yearPlan.year, 11, 31); // 31 ธันวาคม
      }
    }
    
    const activity = await db.yearPlanActivity.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        category: data.category,
        type: data.type,
      },
    });
    
    revalidatePath("/year-plan");
    return activity;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("ไม่สามารถอัปเดตกิจกรรมได้");
  }
}

// ลบกิจกรรม
export async function deleteActivity(activityId: string) {
  try {
    await db.yearPlanActivity.delete({
      where: { id: activityId },
    });
    
    revalidatePath("/year-plan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("ไม่สามารถลบกิจกรรมได้");
  }
}

export async function getUserYearPlanActivities(userId: string) {
  try {
    const yearPlans = await db.yearPlan.findMany({
      where: { userId },
      select: { id: true },
    });
    
    const yearPlanIds = yearPlans.map(plan => plan.id);
    
    const activities = await db.yearPlanActivity.findMany({
      where: {
        yearPlanId: { in: yearPlanIds },
      },
      orderBy: { title: "asc" },
    });
    
    return activities;
  } catch (error) {
    console.error("Error fetching year plan activities:", error);
    throw new Error("ไม่สามารถดึงข้อมูลกิจกรรมจาก Year Plan ได้");
  }
}