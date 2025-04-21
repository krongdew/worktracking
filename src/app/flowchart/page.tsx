// src/app/flowchart/page.tsx
import { Metadata } from "next";
import FlowchartManager from "@/components/flowchart/FlowchartManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserFlowcharts } from "@/server/actions/flowchart-actions";



export const metadata: Metadata = {
  title: "Flowchart - ระบบติดตามงาน",
  description: "จัดการแผนผังกระบวนการทำงาน",
};

export default async function FlowchartPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  const flowcharts = await getUserFlowcharts(session.user.id);
  
  return (

    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">แผนผังกระบวนการทำงาน</h1>
      <FlowchartManager initialFlowcharts={flowcharts} userId={session.user.id} />
    </div>

  );
}