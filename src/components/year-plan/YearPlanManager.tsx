"use client";

import { useState } from "react";
import { YearPlan } from "@prisma/client";
import GanttChart from "@/components/year-plan/GanttChart";
import YearPlanSelector from "@/components/year-plan/YearPlanSelector";
import YearPlanForm from "@/components/year-plan/YearPlanForm";
import ActivityForm from "@/components/year-plan/ActivityForm";
import { useRouter } from "next/navigation";
import { createYearPlan, deleteYearPlan } from "@/server/actions/year-plan-actions";
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  Empty,
  Popconfirm,
  App
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  AppstoreAddOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

// ปรับปรุงประเภทข้อมูลให้ชัดเจนยิ่งขึ้น
interface YearPlanWithActivities extends Omit<YearPlan, 'description'> {
  description: string | null; // ระบุว่าอาจเป็น null
  activities: any[];
}

interface YearPlanManagerProps {
  initialYearPlans: YearPlanWithActivities[];
  userId: string;
}

export default function YearPlanManager({ initialYearPlans, userId }: YearPlanManagerProps) {
  const router = useRouter();
  const { message } = App.useApp(); // ใช้ message จาก App.useApp()
  
  const [yearPlans, setYearPlans] = useState<YearPlanWithActivities[]>(initialYearPlans);
  const [selectedYearPlan, setSelectedYearPlan] = useState<YearPlanWithActivities | null>(
    initialYearPlans.length > 0 ? initialYearPlans[0] : null
  );
  const [showYearPlanForm, setShowYearPlanForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const handleYearPlanChange = (yearPlanId: string) => {
    const yearPlan = yearPlans.find((yp) => yp.id === yearPlanId);
    if (yearPlan) {
      setSelectedYearPlan(yearPlan);
    }
  };
  
  const handleCreateYearPlan = async (data: any) => {
    try {
      const newYearPlan = await createYearPlan({
        title: data.title,
        description: data.description,
        year: data.year,
        userId,
      });
      
      setYearPlans([...yearPlans, newYearPlan]);
      setSelectedYearPlan(newYearPlan);
      setShowYearPlanForm(false);
      router.refresh();
      message.success("สร้างแผนการดำเนินงานใหม่สำเร็จ");
    } catch (error) {
      console.error("Error creating year plan:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างแผนการดำเนินงาน");
    }
  };
  
  const handleEditYearPlan = (yearPlan: YearPlanWithActivities) => {
    setEditingItem(yearPlan);
    setIsEditing(true);
    setShowYearPlanForm(true);
  };
  
  const handleUpdateYearPlan = async (data: any) => {
    // การอัปเดต Year Plan จะถูกเพิ่มในส่วนต่อไป
    setShowYearPlanForm(false);
    setIsEditing(false);
    setEditingItem(null);
    router.refresh();
    message.success("อัปเดตแผนการดำเนินงานสำเร็จ");
  };
  
  const handleDeleteYearPlan = async (yearPlanId: string) => {
    try {
      await deleteYearPlan(yearPlanId);
      const updatedYearPlans = yearPlans.filter((yp) => yp.id !== yearPlanId);
      setYearPlans(updatedYearPlans);
      
      if (selectedYearPlan?.id === yearPlanId) {
        setSelectedYearPlan(updatedYearPlans.length > 0 ? updatedYearPlans[0] : null);
      }
      
      router.refresh();
      message.success("ลบแผนการดำเนินงานสำเร็จ");
    } catch (error) {
      console.error("Error deleting year plan:", error);
      message.error("เกิดข้อผิดพลาดในการลบแผนการดำเนินงาน");
    }
  };
  
  const handleAddActivity = () => {
    setIsEditing(false);
    setEditingItem(null);
    setShowActivityForm(true);
  };
  
  const handleEditActivity = (activity: any) => {
    setEditingItem(activity);
    setIsEditing(true);
    setShowActivityForm(true);
  };
  
  return (
    <div>
      <Card>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <YearPlanSelector
              yearPlans={yearPlans}
              selectedYearPlanId={selectedYearPlan?.id || ""}
              onYearPlanChange={handleYearPlanChange}
            />
          </Col>
          
          <Col xs={24} md={8}>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditing(false);
                  setEditingItem(null);
                  setShowYearPlanForm(true);
                }}
              >
                สร้างแผนใหม่
              </Button>
              
              {selectedYearPlan && (
                <>
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => handleEditYearPlan(selectedYearPlan)}
                  >
                    แก้ไขแผน
                  </Button>
                  
                  <Popconfirm
                    title="ลบแผนการดำเนินงาน"
                    description="คุณแน่ใจหรือไม่ว่าต้องการลบแผนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                    onConfirm={() => handleDeleteYearPlan(selectedYearPlan.id)}
                    okText="ใช่"
                    cancelText="ไม่"
                  >
                    <Button 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      ลบแผน
                    </Button>
                  </Popconfirm>
                  
                  <Button 
                    type="primary"
                    ghost
                    icon={<AppstoreAddOutlined />}
                    onClick={handleAddActivity}
                  >
                    เพิ่มกิจกรรม
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
      
      {selectedYearPlan ? (
        <div style={{ marginTop: 16 }}>
          <Card>
            <Title level={3}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {selectedYearPlan.title} (ปี {selectedYearPlan.year})
            </Title>
            
            {selectedYearPlan.description && (
              <Paragraph>{selectedYearPlan.description}</Paragraph>
            )}
            
            <Divider />
            
            <GanttChart
              yearPlan={{
                ...selectedYearPlan,
                // แปลง null เป็น undefined เพื่อให้ตรงกับที่ GanttChart คาดหวัง
                description: selectedYearPlan.description || undefined
              }}
              onEditActivity={handleEditActivity}
            />
          </Card>
        </div>
      ) : (
        <Card style={{ marginTop: 16, textAlign: 'center', padding: 48 }}>
          <Empty
            description="ยังไม่มีแผนการดำเนินงาน กรุณาสร้างแผนใหม่"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditing(false);
                setEditingItem(null);
                setShowYearPlanForm(true);
              }}
            >
              สร้างแผนใหม่
            </Button>
          </Empty>
        </Card>
      )}
      
      {showYearPlanForm && (
        <YearPlanForm
          onClose={() => {
            setShowYearPlanForm(false);
            setIsEditing(false);
            setEditingItem(null);
          }}
          onSubmit={isEditing ? handleUpdateYearPlan : handleCreateYearPlan}
          initialData={isEditing ? editingItem : null}
          isEditing={isEditing}
        />
      )}
      
      {showActivityForm && selectedYearPlan && (
        <ActivityForm
          onClose={() => {
            setShowActivityForm(false);
            setIsEditing(false);
            setEditingItem(null);
          }}
          yearPlanId={selectedYearPlan.id}
          initialData={isEditing ? editingItem : null}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}