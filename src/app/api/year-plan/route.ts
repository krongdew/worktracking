// src/app/api/year-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// สร้างแผนงานประจำปีใหม่
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "ต้องลงชื่อเข้าใช้ก่อน" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.title || !data.year) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อแผนงานและปี" },
        { status: 400 }
      );
    }

    const yearPlan = await db.yearPlan.create({
      data: {
        title: data.title,
        description: data.description || undefined,
        year: data.year,
        userId: session.user.id,
      }
    });

    // เพิ่มกิจกรรมถ้ามี
    if (data.activities && data.activities.length > 0) {
      await db.yearPlanActivity.createMany({
        data: data.activities.map((activity: any) => ({
          title: activity.title,
          description: activity.description,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate),
          category: activity.category,
          type: activity.type || 'OTHER',
          yearPlanId: yearPlan.id,
        }))
      });
    }

    return NextResponse.json(yearPlan, { status: 201 });
  } catch (error) {
    console.error("[YEAR_PLAN_POST]", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างแผนงาน" },
      { status: 500 }
    );
  }
}

// ดึงรายการแผนงานประจำปี
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "ต้องลงชื่อเข้าใช้ก่อน" },
        { status: 401 }
      );
    }

    // ดึงปีปัจจุบัน
    const currentYear = new Date().getFullYear();
    
    const yearPlans = await db.yearPlan.findMany({
      where: {
        userId: session.user.id,
        year: currentYear, // โดยค่าเริ่มต้นให้ดึงแผนงานปีปัจจุบัน
      },
      include: {
        activities: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(yearPlans);
  } catch (error) {
    console.error("[YEAR_PLAN_GET]", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงแผนงาน" },
      { status: 500 }
    );
  }
}

// อัปเดตแผนงานประจำปี
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "ต้องลงชื่อเข้าใช้ก่อน" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // ตรวจสอบ ID แผนงาน
    if (!data.id) {
      return NextResponse.json(
        { error: "ต้องระบุ ID แผนงาน" },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์การแก้ไข
    const existingPlan = await db.yearPlan.findUnique({
      where: { id: data.id }
    });

    if (!existingPlan || existingPlan.userId !== session.user.id) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์แก้ไขแผนงานนี้" },
        { status: 403 }
      );
    }

    // อัปเดตแผนงานหลัก
    const updatedYearPlan = await db.yearPlan.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        year: data.year,
      }
    });

    // อัปเดตกิจกรรม (เริ่มด้วยการลบกิจกรรมเดิม)
    if (data.activities) {
      // ลบกิจกรรมเก่าทั้งหมด
      await db.yearPlanActivity.deleteMany({
        where: { yearPlanId: data.id }
      });

      // เพิ่มกิจกรรมใหม่
      await db.yearPlanActivity.createMany({
        data: data.activities.map((activity: any) => ({
          title: activity.title,
          description: activity.description,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate),
          category: activity.category,
          type: activity.type || 'OTHER',
          yearPlanId: data.id,
        }))
      });
    }

    return NextResponse.json(updatedYearPlan);
  } catch (error) {
    console.error("[YEAR_PLAN_PUT]", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตแผนงาน" },
      { status: 500 }
    );
  }
}

// ลบแผนงานประจำปี
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "ต้องลงชื่อเข้าใช้ก่อน" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ต้องระบุ ID แผนงาน" },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์การลบ
    const existingPlan = await db.yearPlan.findUnique({
      where: { id }
    });

    if (!existingPlan || existingPlan.userId !== session.user.id) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ลบแผนงานนี้" },
        { status: 403 }
      );
    }

    // ลบแผนงาน (Cascade delete จะลบกิจกรรมที่เกี่ยวข้องโดยอัตโนมัติ)
    await db.yearPlan.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "ลบแผนงานสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[YEAR_PLAN_DELETE]", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบแผนงาน" },
      { status: 500 }
    );
  }
}