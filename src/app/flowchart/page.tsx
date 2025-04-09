"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FlowchartManager from "@/components/flowchart/FlowchartManager";
import { Typography, Spin } from "antd";
import { NodeIndexOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function FlowchartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flowcharts, setFlowcharts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    
    if (status === "authenticated" && session.user.id) {
      // ในสถานการณ์จริง คุณควรเรียกใช้ API หรือ action เพื่อดึงข้อมูล
      // ตัวอย่างเช่น:
      fetch(`/api/flowcharts?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setFlowcharts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching flowcharts:", err);
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
          <NodeIndexOutlined style={{ marginRight: 8 }} />
          แผนผังกระบวนการทำงาน
        </Title>
        <Typography.Paragraph>
          สร้างและจัดการแผนผังกระบวนการทำงานของคุณได้ที่นี่
        </Typography.Paragraph>
      </div>
      
      {session?.user?.id && (
        <FlowchartManager 
          initialFlowcharts={flowcharts} 
          userId={session.user.id} 
        />
      )}
    </div>
  );
}