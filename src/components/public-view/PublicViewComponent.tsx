// src/components/public-view/PublicViewComponent.tsx
"use client";

import { useState } from "react";
import { Typography, Card, Tabs } from "antd";
import { 
  CalendarOutlined, 
  CheckSquareOutlined, 
  LineChartOutlined, 
  NodeIndexOutlined,
  BarChartOutlined // Add this for statistics icon
} from "@ant-design/icons";
import PublicYearPlan from "@/components/public-view/PublicYearPlan";
import PublicTodoList from "@/components/public-view/PublicTodoList";
import PublicTaskTracking from "@/components/public-view/PublicTaskTracking";
import PublicFlowchart from "@/components/public-view/PublicFlowchart";

const { Title } = Typography;

interface PublicViewComponentProps {
  userData: {
    user: {
      id: string;
      name: string | null;
    };
    yearPlans: any[];
    todoLists: any[];
    tasks: any[];
    flowcharts: any[];
  };
}

export default function PublicViewComponent({ userData }: PublicViewComponentProps) {
  const [activeTab, setActiveTab] = useState("year-plan");
  
  const tabItems = [
    { 
      key: "year-plan", 
      label: "แผนงานประจำปี", 
      icon: <CalendarOutlined />,
      children: <PublicYearPlan yearPlans={userData.yearPlans} />
    },
    { 
      key: "todo-list", 
      label: "รายการสิ่งที่ต้องทำ", 
      icon: <CheckSquareOutlined />,
      children: <PublicTodoList todoLists={userData.todoLists} />
    },
    { 
      key: "task-tracking", 
      label: "ติดตามงาน", 
      icon: <LineChartOutlined />,
      children: <PublicTaskTracking tasks={userData.tasks} />
    },
    { 
      key: "flowchart", 
      label: "แผนผังกระบวนการ", 
      icon: <NodeIndexOutlined />,
      children: <PublicFlowchart flowcharts={userData.flowcharts} />
    },
    { 
      key: "statistics", 
      label: "รายงานสถิติการใช้งาน mu life pass", 
      icon: <BarChartOutlined />,
      children: (
        <div className="w-full">
          <iframe 
            width="100%" 
            height="800" 
            src="https://lookerstudio.google.com/embed/reporting/ca459a2d-5deb-4308-b644-51f1dd16d251/page/kIV1C" 
            frameBorder="0" 
            style={{ border: 0 }} 
            allowFullScreen 
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        </div>
      )
    }
  ];
  
  return (
    <Card 
      title={
        <Title level={4} style={{ margin: 0 }}>
          ข้อมูลการทำงานของ {userData.user.name}
        </Title>
      }
      style={{ width: '100%' }}
    >
      <Tabs 
        defaultActiveKey="year-plan"
        items={tabItems}
        onChange={(key) => setActiveTab(key)}
        tabPosition="top"
        size="large"
        animated
      />
    </Card>
  );
}