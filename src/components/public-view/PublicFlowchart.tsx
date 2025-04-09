// src/components/public-view/PublicFlowchart.tsx
"use client";

import { useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge
} from "reactflow";
import "reactflow/dist/style.css";
import FlowStartNode from "@/components/flowchart/nodes/FlowStartNode";
import FlowEndNode from "@/components/flowchart/nodes/FlowEndNode";
import FlowProcessNode from "@/components/flowchart/nodes/FlowProcessNode";
import FlowDecisionNode from "@/components/flowchart/nodes/FlowDecisionNode";

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
    <div>
      {flowcharts.length > 0 ? (
        <div>
          <div className="mb-6">
            <label htmlFor="flowchart-select" className="block text-sm font-medium text-gray-700 mb-2">
              เลือกแผนผัง
            </label>
            <select
              id="flowchart-select"
              value={selectedFlowchartId}
              onChange={(e) => setSelectedFlowchartId(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {flowcharts.map((flowchart) => (
                <option key={flowchart.id} value={flowchart.id}>
                  {flowchart.title}
                </option>
              ))}
            </select>
          </div>
          
          {selectedFlowchart && (
            <div>
              <h2 className="text-xl font-semibold mb-2">{selectedFlowchart.title}</h2>
              
              {selectedFlowchart.description && (
                <p className="text-gray-600 mb-4">{selectedFlowchart.description}</p>
              )}
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4 h-[500px] border border-gray-300">
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
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>ยังไม่มีข้อมูลแผนผัง</p>
        </div>
      )}
    </div>
  );
}