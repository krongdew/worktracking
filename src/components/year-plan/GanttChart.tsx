"use client";

import { ActivityType } from "@prisma/client";
import { Card, Typography, Table, Space, Badge } from "antd";


const { Title, Text } = Typography;

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

interface GanttChartProps {
  yearPlan: YearPlan;
  onEditActivity: (activity: YearPlanActivity) => void;
}

export default function GanttChart({ yearPlan, onEditActivity }: GanttChartProps) {
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
  
  // สร้างคอลัมน์สำหรับตาราง
  const columns = [
    {
      title: 'กิจกรรม',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string, record: YearPlanActivity) => (
        <div 
          style={{ cursor: 'pointer' }} 
          onClick={() => onEditActivity(record)}
        >
          <Text strong>{text}</Text>
          {record.description && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description}
            </Text>
          )}
        </div>
      ),
    },
    ...months.map((month, index) => ({
      title: month,
      dataIndex: month,
      key: month,
      align: 'center' as const,
      render: (_: any, record: YearPlanActivity) => {
        const position = calculateTaskPosition(record);
        
        if (index >= position.left && index < position.left + position.width) {
          return (
            <div style={{ 
              backgroundColor: activityTypeColors[record.type], 
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '12px'
            }}
            onClick={() => onEditActivity(record)}
            >
              {position.width === 1 && position.left === index ? position.label : ' '}
            </div>
          );
        }
        
        return null;
      }
    }))
  ];
  
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ overflowX: 'auto' }}>
        <Table 
          dataSource={yearPlan.activities} 
          columns={columns}
          pagination={false}
          bordered
          rowKey="id"
          size="middle"
          locale={{ 
            emptyText: 'ยังไม่มีกิจกรรมในแผนการดำเนินงานนี้' 
          }}
        />
      </div>
      
      <div style={{ marginTop: 16 }}>
        <Space wrap>
          {Object.entries(activityTypeNames).map(([type, name]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', margin: '8px 12px 8px 0' }}>
              <Badge 
                color={activityTypeColors[type as ActivityType]} 
                style={{ marginRight: 8 }} 
              />
              <Text>{name}</Text>
            </div>
          ))}
        </Space>
      </div>
    </Card>
  );
}