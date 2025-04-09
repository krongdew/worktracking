// src/app/task-tracking/page.tsx
import { Metadata } from "next";
import TaskTrackingManager from "@/components/task-tracking/TaskTrackingManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserTasks } from "@/server/actions/task-tracking-actions";
import { getUserYearPlanActivities } from "@/server/actions/year-plan-actions";

export const metadata: Metadata = {
  title: "Task Tracking - ระบบติดตามงาน",
  description: "ติดตามความคืบหน้าของงาน",
};

export default async function TaskTrackingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  const tasks = await getUserTasks(session.user.id);
  const yearPlanActivities = await getUserYearPlanActivities(session.user.id);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">ติดตามความคืบหน้าของงาน</h1>
      <TaskTrackingManager 
        initialTasks={tasks} 
        yearPlanActivities={yearPlanActivities}
        userId={session.user.id} 
      />
    </div>
  );
}
