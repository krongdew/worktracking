// src/components/flowchart/FlowchartManager.tsx
"use client";
import { useState, useEffect } from "react";
import { Flowchart } from "@prisma/client";
import { 
  Select, 
  Button, 
  // ลบ Modal ที่ไม่ได้ใช้งาน
  message, 
  Space, 
  Typography, 
  Card, 
  Row, 
  Col,
  App
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import FlowchartEditor from "@/components/flowchart/FlowchartEditor";
import FlowchartForm from "@/components/flowchart/FlowchartForm";
import { useRouter } from "next/navigation";
import { createFlowchart, updateFlowchart, deleteFlowchart } from "@/server/actions/flowchart-actions";
import { FlowchartFormData } from "@/types/flowchart";

const { Title, Text } = Typography;
const { Option } = Select;


interface FlowchartManagerProps {
  initialFlowcharts: Flowchart[];
  userId: string;
}

export default function FlowchartManager({ 
  initialFlowcharts, 
  userId 
}: FlowchartManagerProps) {
  const { modal } = App.useApp();
  const router = useRouter();
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>(initialFlowcharts);
  const [selectedFlowchart, setSelectedFlowchart] = useState<Flowchart | null>(
    initialFlowcharts.length > 0 ? initialFlowcharts[0] : null
  );
  const [showFlowchartForm, setShowFlowchartForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>(
    initialFlowcharts.length > 0 ? initialFlowcharts[0].content : ""
  );
  
  // เมื่อเลือก flowchart ใหม่ ให้อัพเดทเนื้อหา
  useEffect(() => {
    if (selectedFlowchart) {
      setCurrentContent(selectedFlowchart.content);
    }
  }, [selectedFlowchart]);
  
  const handleFlowchartChange = (flowchartId: string) => {
    const flowchart = flowcharts.find((fc) => fc.id === flowchartId);
    if (flowchart) {
      setSelectedFlowchart(flowchart);
    }
  };
  
  const handleCreateFlowchart = async (data: FlowchartFormData) => {
    try {
      // ใช้ค่าเริ่มต้นสำหรับ flowchart ใหม่
      const initialFlowchart = {
        nodes: [
          { id: '1', type: 'start', text: 'เริ่มต้น', position: { x: 100, y: 100 } },
          { id: '2', type: 'process', text: 'กระบวนการ', position: { x: 100, y: 200 } },
          { id: '3', type: 'end', text: 'สิ้นสุด', position: { x: 100, y: 300 } }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' }
        ]
      };
      
      const newFlowchart = await createFlowchart({
        title: data.title,
        description: data.description ?? undefined, // แปลง null เป็น undefined
        content: JSON.stringify(initialFlowchart),
        userId,
      });
      
      setFlowcharts([...flowcharts, newFlowchart]);
      setSelectedFlowchart(newFlowchart);
      setCurrentContent(newFlowchart.content);
      setShowFlowchartForm(false);
      message.success('สร้างแผนผังสำเร็จ');
      router.refresh();
    } catch (error) {
      console.error("Error creating flowchart:", error);
      message.error('ไม่สามารถสร้างแผนผังได้');
    }
  };
  
  const handleUpdateFlowchartInfo = async (data: FlowchartFormData) => {
    if (!selectedFlowchart) return;
    
    try {
      const updatedFlowchart = await updateFlowchart({
        id: selectedFlowchart.id,
        title: data.title,
        description: data.description ?? undefined, // แปลง null เป็น undefined
        content: selectedFlowchart.content,
      });
      
      // อัปเดตค่าใน state
      setFlowcharts(
        flowcharts.map((fc) => (fc.id === updatedFlowchart.id ? updatedFlowchart : fc))
      );
      setSelectedFlowchart(updatedFlowchart);
      setShowFlowchartForm(false);
      setIsEditing(false);
      message.success('อัปเดตข้อมูลแผนผังสำเร็จ');
      router.refresh();
    } catch (error) {
      console.error("Error updating flowchart info:", error);
      message.error('ไม่สามารถอัปเดตข้อมูลแผนผังได้');
    }
  };
  
  const handleSaveFlowchartContent = async (content: string) => {
    if (!selectedFlowchart) return;
    
    try {
      const updatedFlowchart = await updateFlowchart({
        id: selectedFlowchart.id,
        content,
      });
      
      // อัปเดตค่าใน state
      setFlowcharts(
        flowcharts.map((fc) => (fc.id === updatedFlowchart.id ? updatedFlowchart : fc))
      );
      setSelectedFlowchart(updatedFlowchart);
      setCurrentContent(content);
      message.success('บันทึกแผนผังสำเร็จ');
      router.refresh();
    } catch (error) {
      console.error("Error saving flowchart content:", error);
      message.error('ไม่สามารถบันทึกแผนผังได้');
    }
  };
  
  const handleDeleteFlowchart = async (flowchartId: string) => {
    modal.confirm({
      title: 'ยืนยันการลบ',
      content: 'คุณต้องการลบแผนผังนี้ใช่หรือไม่?',
      okText: 'ใช่, ลบเลย',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteFlowchart(flowchartId);
          const updatedFlowcharts = flowcharts.filter((fc) => fc.id !== flowchartId);
          setFlowcharts(updatedFlowcharts);
          
          if (selectedFlowchart?.id === flowchartId) {
            const nextFlowchart = updatedFlowcharts.length > 0 ? updatedFlowcharts[0] : null;
            setSelectedFlowchart(nextFlowchart);
            setCurrentContent(nextFlowchart ? nextFlowchart.content : "");
          }
          
          message.success('ลบแผนผังสำเร็จ');
          router.refresh();
        } catch (error) {
          console.error("Error deleting flowchart:", error);
          message.error('ไม่สามารถลบแผนผังได้');
        }
      }
    });
  };
  
  return (
    <div>
      <Row gutter={[16, 16]} align="middle" justify="space-between" className="mb-6">
        <Col>
          <Select
            style={{ width: 200 }}
            value={selectedFlowchart?.id || undefined}
            onChange={handleFlowchartChange}
            placeholder="เลือกแผนผัง"
          >
            {flowcharts.map((fc) => (
              <Option key={fc.id} value={fc.id}>
                {fc.title}
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setIsEditing(false);
                setShowFlowchartForm(true);
              }}
            >
              สร้างแผนผังใหม่
            </Button>
            
            {selectedFlowchart && (
              <>
                <Button 
                  type="default" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEditing(true);
                    setShowFlowchartForm(true);
                  }}
                >
                  แก้ไขข้อมูล
                </Button>
                
                <Button 
                  type="default" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteFlowchart(selectedFlowchart.id)}
                >
                  ลบแผนผัง
                </Button>
              </>
            )}
          </Space>
        </Col>
      </Row>
      
      {selectedFlowchart ? (
        <Card>
          <div className="mb-4">
            <Title level={4}>{selectedFlowchart.title}</Title>
            {selectedFlowchart.description && (
              <Text type="secondary">{selectedFlowchart.description}</Text>
            )}
          </div>
          
          <FlowchartEditor
            initialContent={currentContent}
            onSave={handleSaveFlowchartContent}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center">
            <Text type="secondary">
              ยังไม่มีแผนผัง กรุณาสร้างแผนผังใหม่
            </Text>
          </div>
        </Card>
      )}
      
      {showFlowchartForm && (
        <FlowchartForm
          onClose={() => {
            setShowFlowchartForm(false);
            setIsEditing(false);
          }}
          onSubmit={isEditing ? handleUpdateFlowchartInfo : handleCreateFlowchart}
          initialData={isEditing && selectedFlowchart ? {
            id: selectedFlowchart.id,
            title: selectedFlowchart.title,
            description: selectedFlowchart.description,
            content: selectedFlowchart.content
          } : undefined}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}