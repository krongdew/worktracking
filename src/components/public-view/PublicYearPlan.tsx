// src/components/public-view/PublicYearPlan.tsx
"use client";

import { useState } from "react";
import { ActivityType } from "@prisma/client";

interface YearPlanActivity {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category?: string;
  type: ActivityType;
}

interface YearPlan {
  id: string;
  title: string;
  description?: string;
  year: number;
  activities: YearPlanActivity[];
}

interface PublicYearPlanProps {
  yearPlans: YearPlan[];
}

export default function PublicYearPlan({ yearPlans }: PublicYearPlanProps) {
  const [selectedYearPlanId, setSelectedYearPlanId] = useState<string>(
    yearPlans.length > 0 ? yearPlans[0].id : ""
  );
  
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  
  const activityTypeColors = {
    ONGOING: "#4895ef",
    PARTIAL: "#4cc9f0",
    EVENT: "#560bad",
    TRAINING: "#f72585",
    DESIGN: "#7209b7",
    OTHER: "#3a86ff"
  };
  
  const activityTypeNames = {
    ONGOING: "งานต่อเนื่องตลอดปี",
    PARTIAL: "งานต่อเนื่องบางช่วง",
    EVENT: "กิจกรรมนักศึกษา",
    TRAINING: "การอบรม",
    DESIGN: "งานออกแบบ",
    OTHER: "งานอื่นๆ"
  };
  
  // ฟังก์ชันสำหรับคำนวณตำแหน่งและความกว้างของ task bar
  const calculateTaskPosition = (activity: YearPlanActivity) => {
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    
    // ตำแหน่งเริ่มต้นตามเดือน (0-11)
    const startMonth = startDate.getMonth();
    
    // ความกว้างตามจำนวนเดือน
    let width = 1; // อย่างน้อย 1 เดือน
    
    if (activity.type === "ONGOING") {
      // งานต่อเนื่องตลอดปี
      return {
        left: 0,
        width: 12,
        label: "ตลอดทั้งปี"
      };
    } else if (activity.type === "PARTIAL") {
      // งานต่อเนื่องบางช่วง
      const endMonth = endDate.getMonth();
      width = endMonth - startMonth + 1;
      return {
        left: startMonth,
        width: width,
        label: `${months[startMonth]} - ${months[endMonth]}`
      };
    } else {
      // งานปกติ (เช่น EVENT, TRAINING, DESIGN, OTHER)
      // ใช้วันที่จริงในการแสดงผล
      const thaiDate = startDate.getDate();
      return {
        left: startMonth,
        width: 1,
        label: `${thaiDate} ${months[startMonth]}`
      };
    }
  };
  
  const selectedYearPlan = yearPlans.find(plan => plan.id === selectedYearPlanId);
  
  return (
    <div>
      {yearPlans.length > 0 ? (
        <div>
          <div className="mb-6">
            <label htmlFor="year-plan-select" className="block text-sm font-medium text-gray-700 mb-2">
              เลือกแผนการดำเนินงาน
            </label>
            <select
              id="year-plan-select"
              value={selectedYearPlanId}
              onChange={(e) => setSelectedYearPlanId(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} (ปี {plan.year})
                </option>
              ))}
            </select>
          </div>
          
          {selectedYearPlan && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {selectedYearPlan.title} (ปี {selectedYearPlan.year})
              </h2>
              
              {selectedYearPlan.description && (
                <p className="text-gray-600 mb-4">{selectedYearPlan.description}</p>
              )}
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* ส่วนหัวของตาราง */}
                    <div className="flex border-b">
                      <div className="w-64 min-w-64 p-3 font-semibold text-right border-r">
                        กิจกรรม
                      </div>
                      <div className="flex flex-1">
                        {months.map((month, index) => (
                          <div
                            key={index}
                            className="flex-1 min-w-[80px] text-center p-3 font-semibold border-r last:border-r-0"
                          >
                            {month}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* ส่วนแสดงข้อมูลกิจกรรม */}
                    {selectedYearPlan.activities.length > 0 ? (
                      selectedYearPlan.activities.map((activity) => {
                        const position = calculateTaskPosition(activity);
                        
                        return (
                          <div key={activity.id} className="flex border-b">
                            <div className="w-64 min-w-64 p-3 flex items-center justify-end text-right border-r relative">
                              <span className="text-sm">{activity.title}</span>
                            </div>
                            <div className="flex flex-1 relative h-12">
                              {months.map((_, index) => (
                                <div
                                  key={index}
                                  className="flex-1 min-w-[80px] border-r last:border-r-0"
                                ></div>
                              ))}
                              
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 h-8 rounded text-white text-xs flex items-center justify-center px-2"
                                style={{
                                  left: `${(position.left / 12) * 100}%`,
                                  width: `${(position.width / 12) * 100}%`,
                                  backgroundColor: activityTypeColors[activity.type]
                                }}
                              >
                                {position.label}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex border-b">
                        <div className="w-full p-4 text-center text-gray-500">
                          ยังไม่มีกิจกรรมในแผนการดำเนินงานนี้
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ส่วนแสดงคำอธิบายสี */}
                <div className="flex flex-wrap justify-center gap-3 p-4 border-t">
                  {Object.entries(activityTypeNames).map(([type, name]) => (
                    <div key={type} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: activityTypeColors[type as ActivityType] }}
                      ></div>
                      <span className="text-sm">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>ยังไม่มีข้อมูลแผนการดำเนินงาน</p>
        </div>
      )}
    </div>
  );
}
