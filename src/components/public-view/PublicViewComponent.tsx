// src/components/public-view/PublicViewComponent.tsx
"use client";

import { useState } from "react";
import PublicYearPlan from "@/components/public-view/PublicYearPlan";
import PublicTodoList from "@/components/public-view/PublicTodoList";
import PublicTaskTracking from "@/components/public-view/PublicTaskTracking";
import PublicFlowchart from "@/components/public-view/PublicFlowchart";

interface PublicViewComponentProps {
  userData: {
    user: {
      id: string;
      name: string | null; // เพิ่ม null เป็นไทป์ที่ยอมรับได้
    };
    yearPlans: any[];
    todoLists: any[];
    tasks: any[];
    flowcharts: any[];
  };
}

export default function PublicViewComponent({ userData }: PublicViewComponentProps) {
  const [activeTab, setActiveTab] = useState<string>("year-plan");
  
  const tabs = [
    { id: "year-plan", label: "แผนงานประจำปี" },
    { id: "todo-list", label: "รายการสิ่งที่ต้องทำ" },
    { id: "task-tracking", label: "ติดตามงาน" },
    { id: "flowchart", label: "แผนผังกระบวนการ" },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">
          ข้อมูลการทำงานของ {userData.user.name}
        </h1>
      </div>
      
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === "year-plan" && <PublicYearPlan yearPlans={userData.yearPlans} />}
        {activeTab === "todo-list" && <PublicTodoList todoLists={userData.todoLists} />}
        {activeTab === "task-tracking" && <PublicTaskTracking tasks={userData.tasks} />}
        {activeTab === "flowchart" && <PublicFlowchart flowcharts={userData.flowcharts} />}
      </div>
    </div>
  );
}