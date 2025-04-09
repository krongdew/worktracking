// src/components/flowchart/FlowchartManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Flowchart } from "@prisma/client";
import FlowchartSelector from "@/components/flowchart/FlowchartSelector";
import FlowchartEditor from "@/components/flowchart/FlowchartEditor";
import FlowchartForm from "@/components/flowchart/FlowchartForm";
import { useRouter } from "next/navigation";
import { createFlowchart, updateFlowchart, deleteFlowchart } from "@/server/actions/flowchart-actions";

interface FlowchartManagerProps {
  initialFlowcharts: Flowchart[];
  userId: string;
}

export default function FlowchartManager({ 
  initialFlowcharts, 
  userId 
}: FlowchartManagerProps) {
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
  
  const handleCreateFlowchart = async (data: any) => {
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
        description: data.description,
        content: JSON.stringify(initialFlowchart),
        userId,
      });
      
      setFlowcharts([...flowcharts, newFlowchart]);
      setSelectedFlowchart(newFlowchart);
      setCurrentContent(newFlowchart.content);
      setShowFlowchartForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating flowchart:", error);
    }
  };
  
  const handleUpdateFlowchartInfo = async (data: any) => {
    if (!selectedFlowchart) return;
    
    try {
      const updatedFlowchart = await updateFlowchart({
        id: selectedFlowchart.id,
        title: data.title,
        description: data.description,
        content: selectedFlowchart.content,
      });
      
      // อัปเดตค่าใน state
      setFlowcharts(
        flowcharts.map((fc) => (fc.id === updatedFlowchart.id ? updatedFlowchart : fc))
      );
      setSelectedFlowchart(updatedFlowchart);
      setShowFlowchartForm(false);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating flowchart info:", error);
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
      router.refresh();
    } catch (error) {
      console.error("Error saving flowchart content:", error);
    }
  };
  
  const handleDeleteFlowchart = async (flowchartId: string) => {
    if (confirm("คุณต้องการลบแผนผังนี้ใช่หรือไม่?")) {
      try {
        await deleteFlowchart(flowchartId);
        const updatedFlowcharts = flowcharts.filter((fc) => fc.id !== flowchartId);
        setFlowcharts(updatedFlowcharts);
        
        if (selectedFlowchart?.id === flowchartId) {
          setSelectedFlowchart(updatedFlowcharts.length > 0 ? updatedFlowcharts[0] : null);
          setCurrentContent(updatedFlowcharts.length > 0 ? updatedFlowcharts[0].content : "");
        }
        
        router.refresh();
      } catch (error) {
        console.error("Error deleting flowchart:", error);
      }
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <FlowchartSelector
          flowcharts={flowcharts}
          selectedFlowchartId={selectedFlowchart?.id || ""}
          onFlowchartChange={handleFlowchartChange}
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
              setShowFlowchartForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            สร้างแผนผังใหม่
          </button>
          
          {selectedFlowchart && (
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowFlowchartForm(true);
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                แก้ไขข้อมูล
              </button>
              
              <button
                onClick={() => handleDeleteFlowchart(selectedFlowchart.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                ลบแผนผัง
              </button>
            </>
          )}
        </div>
      </div>
      
      {selectedFlowchart ? (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{selectedFlowchart.title}</h2>
            {selectedFlowchart.description && (
              <p className="text-gray-600 mt-1">{selectedFlowchart.description}</p>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <FlowchartEditor
              initialContent={currentContent}
              onSave={handleSaveFlowchartContent}
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            ยังไม่มีแผนผัง กรุณาสร้างแผนผังใหม่
          </p>
        </div>
      )}
      
      {showFlowchartForm && (
        <FlowchartForm
          onClose={() => {
            setShowFlowchartForm(false);
            setIsEditing(false);
          }}
          onSubmit={isEditing ? handleUpdateFlowchartInfo : handleCreateFlowchart}
          initialData={isEditing ? selectedFlowchart : null}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}
