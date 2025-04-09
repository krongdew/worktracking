"use client";

import { useState } from "react";
import { Select, Typography, Card, Tag } from 'antd';

// Local type definitions
type ActivityType = 'ONGOING' | 'PARTIAL' | 'EVENT' | 'TRAINING' | 'DESIGN' | 'OTHER';

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
    <Card>
      {yearPlans.length > 0 ? (
        <div>
          <div className="mb-6">
            <Typography.Text strong>เลือกแผนการดำเนินงาน</Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={selectedYearPlanId}
              onChange={(value) => setSelectedYearPlanId(value)}
            >
              {yearPlans.map((plan) => (
                <Select.Option key={plan.id} value={plan.id}>
                  {plan.title} (ปี {plan.year})
                </Select.Option>
              ))}
            </Select>
          </div>
          
          {selectedYearPlan && (
            <div>
              <Typography.Title level={4}>
                {selectedYearPlan.title} (ปี {selectedYearPlan.year})
              </Typography.Title>
              
              {selectedYearPlan.description && (
                <Typography.Paragraph type="secondary">
                  {selectedYearPlan.description}
                </Typography.Paragraph>
              )}
              
              <div style={{ 
                overflowX: 'auto', 
                border: '1px solid #d9d9d9', 
                borderRadius: '8px', 
                marginTop: 16 
              }}>
                <div style={{ minWidth: '900px' }}>
                  {/* ส่วนหัวของตาราง */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #d9d9d9' }}>
                    <div style={{ 
                      width: 256, 
                      padding: 12, 
                      fontWeight: 'bold', 
                      textAlign: 'right', 
                      borderRight: '1px solid #d9d9d9' 
                    }}>
                      กิจกรรม
                    </div>
                    <div style={{ display: 'flex', flex: 1 }}>
                      {months.map((month, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            flex: 1, 
                            minWidth: 80, 
                            textAlign: 'center', 
                            padding: 12,
                            fontWeight: 'bold',
                            borderRight: '1px solid #d9d9d9' 
                          }}
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
                        <div 
                          key={activity.id} 
                          style={{ 
                            display: 'flex', 
                            borderBottom: '1px solid #d9d9d9' 
                          }}
                        >
                          <div style={{ 
                            width: 256, 
                            padding: 12, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end', 
                            textAlign: 'right',
                            borderRight: '1px solid #d9d9d9' 
                          }}>
                            <span style={{ fontSize: '0.875rem' }}>{activity.title}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flex: 1, 
                            position: 'relative', 
                            height: 48 
                          }}>
                            {months.map((_, index) => (
                              <div 
                                key={index} 
                                style={{ 
                                  flex: 1, 
                                  minWidth: 80, 
                                  borderRight: '1px solid #d9d9d9' 
                                }}
                              ></div>
                            ))}
                            
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: 32,
                                borderRadius: 4,
                                backgroundColor: activityTypeColors[activity.type],
                                color: 'white',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 8px',
                                left: `${(position.left / 12) * 100}%`,
                                width: `${(position.width / 12) * 100}%`,
                              }}
                            >
                              {position.label}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 16, 
                      color: '#8c8c8c' 
                    }}>
                      ยังไม่มีกิจกรรมในแผนการดำเนินงานนี้
                    </div>
                  )}
                </div>
              </div>
              
              {/* ส่วนแสดงคำอธิบายสี */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: 12, 
                padding: 16, 
                borderTop: '1px solid #d9d9d9' 
              }}>
                {Object.entries(activityTypeNames).map(([type, name]) => (
                  <div 
                    key={type} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        marginRight: 8,
                        backgroundColor: activityTypeColors[type as ActivityType]
                      }}
                    ></div>
                    <span style={{ fontSize: '0.875rem' }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Typography.Text type="secondary">ยังไม่มีข้อมูลแผนการดำเนินงาน</Typography.Text>
      )}
    </Card>
  );
}