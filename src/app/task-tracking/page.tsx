"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TaskTrackingManager from "@/components/task-tracking/TaskTrackingManager";
import { Typography, Spin } from "antd";
import { LineChartOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function TaskTrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [yearPlanActivities, setYearPlanActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    
    if (status === "authenticated" && session.user.id) {
      // ในสถานการณ์จริง คุณควรเรียกใช้ API หรือ action เพื่อดึงข้อมูล
      // ตัวอย่างเช่น:
      Promise.all([
        fetch(`/api/tasks?userId=${session.user.id}`).then(res => res.json()),
        fetch(`/api/year-plan-activities?userId=${session.user.id}`).then(res => res.json())
      ])
        .then(([tasksData, activitiesData]) => {
          setTasks(tasksData);
          setYearPlanActivities(activitiesData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching data:", err);
          setLoading(false);
        });
      
      // สำหรับตอนนี้ เราจะแค่ตั้งค่า loading เป็น false หลังจาก 1 วินาที
      // เพื่อจำลองการโหลดข้อมูล
      setTimeout(() => setLoading(false), 1000);
    }
  }, [status, session, router]);
  
  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <LineChartOutlined style={{ marginRight: 8 }} />
          ติดตามความคืบหน้าของงาน
        </Title>
        <Typography.Paragraph>
          จัดการและติดตามความคืบหน้าของงานต่างๆ ได้ที่นี่
        </Typography.Paragraph>
      </div>
      
      {session?.user?.id && (
        <TaskTrackingManager 
          initialTasks={tasks} 
          yearPlanActivities={yearPlanActivities}
          userId={session.user.id} 
        />
      )}
    </div>
  );
}