"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import YearPlanManager from "@/components/year-plan/YearPlanManager";
import { Typography, Spin } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function YearPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [yearPlans, setYearPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    
    if (status === "authenticated" && session.user.id) {
      // ในสถานการณ์จริง คุณควรเรียกใช้ API หรือ action เพื่อดึงข้อมูล
      // ตัวอย่างเช่น:
      fetch(`/api/year-plans?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setYearPlans(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching year plans:", err);
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
        {/* แก้ไข Spin โดยใช้ Spin.nested หรือครอบด้วย div และใช้ indicator */}
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
          <CalendarOutlined style={{ marginRight: 8 }} />
          แผนการดำเนินงานรายปี
        </Title>
        <Typography.Paragraph>
          จัดการและติดตามแผนงานประจำปีของคุณได้ที่นี่
        </Typography.Paragraph>
      </div>
      
      {session?.user?.id && (
        <YearPlanManager 
          initialYearPlans={yearPlans} 
          userId={session.user.id} 
        />
      )}
    </div>
  );
}