// src/app/year-plan/page.tsx
import { Metadata } from "next";
import YearPlanManager from "@/components/year-plan/YearPlanManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserYearPlans } from "@/server/actions/year-plan-actions";

export const metadata: Metadata = {
  title: "Year Plan - ระบบติดตามงาน",
  description: "จัดการแผนการดำเนินงานรายปี",
};

export default async function YearPlanPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  const yearPlans = await getUserYearPlans(session.user.id);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">แผนการดำเนินงานรายปี</h1>
      <YearPlanManager initialYearPlans={yearPlans} userId={session.user.id} />
    </div>
  );
}
