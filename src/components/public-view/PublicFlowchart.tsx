"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { 
  Card, 
  Select, 
  Typography, 
  Empty, 
  Space 
} from "antd";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import FlowStartNode from "@/components/flowchart/nodes/FlowStartNode";
import FlowEndNode from "@/components/flowchart/nodes/FlowEndNode";
import FlowProcessNode from "@/components/flowchart/nodes/FlowProcessNode";
import FlowDecisionNode from "@/components/flowchart/nodes/FlowDecisionNode";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface Flowchart {
  id: string;
  title: string;
  description?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PublicFlowchartProps {
  flowcharts: Flowchart[];
}

// ตั้งค่า node types ที่จะใช้ใน ReactFlow
const nodeTypes = {
  start: FlowStartNode,
  end: FlowEndNode,
  process: FlowProcessNode,
  decision: FlowDecisionNode,
};

export default function PublicFlowchart({ flowcharts }: PublicFlowchartProps) {
  const [selectedFlowchartId, setSelectedFlowchartId] = useState<string>(
    flowcharts.length > 0 ? flowcharts[0].id : ""
  );
  
  const selectedFlowchart = flowcharts.find(chart => chart.id === selectedFlowchartId);
  
  // แปลงข้อมูล JSON เป็น nodes และ edges
  const parseFlowchartContent = (content: string) => {
    try {
      if (content) {
        const parsedContent = JSON.parse(content);
        return {
          nodes: parsedContent.nodes || [],
          edges: parsedContent.edges || [],
        };
      }
    } catch (error) {
      console.error("Error parsing flowchart content:", error);
    }
    
    return { nodes: [], edges: [] };
  };
  
  const { nodes, edges } = selectedFlowchart 
    ? parseFlowchartContent(selectedFlowchart.content) 
    : { nodes: [], edges: [] };
  
  return (
    <Card>
      {flowcharts.length > 0 ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>เลือกแผนผัง</Text>
            <Select
              style={{ width: '100%' }}
              value={selectedFlowchartId}
              onChange={(value) => setSelectedFlowchartId(value)}
              placeholder="เลือกแผนผัง"
            >
              {flowcharts.map((flowchart) => (
                <Option key={flowchart.id} value={flowchart.id}>
                  {flowchart.title}
                </Option>
              ))}
            </Select>
          </div>
          
          {selectedFlowchart && (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={4} style={{ marginBottom: 0 }}>
                {selectedFlowchart.title}
              </Title>
              
              {selectedFlowchart.description && (
                <Paragraph type="secondary">
                  {selectedFlowchart.description}
                </Paragraph>
              )}
              
              <div 
                style={{ 
                  width: '100%', 
                  height: '500px', 
                  border: '1px solid #d9d9d9', 
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  nodesConnectable={false}
                  nodesDraggable={false}
                  elementsSelectable={false}
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                </ReactFlow>
              </div>
            </Space>
          )}
        </Space>
      ) : (
        <Empty 
          description="ยังไม่มีข้อมูลแผนผัง" 
          style={{ margin: '20px 0' }} 
        />
      )}
    </Card>
  );
}