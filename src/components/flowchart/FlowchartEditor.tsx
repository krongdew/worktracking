// src/components/flowchart/FlowchartEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange
} from "reactflow";
import "reactflow/dist/style.css";
import FlowStartNode from "@/components/flowchart/nodes/FlowStartNode";
import FlowEndNode from "@/components/flowchart/nodes/FlowEndNode";
import FlowProcessNode from "@/components/flowchart/nodes/FlowProcessNode";
import FlowDecisionNode from "@/components/flowchart/nodes/FlowDecisionNode";

// ตั้งค่า node types ที่จะใช้ใน ReactFlow
const nodeTypes = {
  start: FlowStartNode,
  end: FlowEndNode,
  process: FlowProcessNode,
  decision: FlowDecisionNode,
};

interface FlowchartEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}

export default function FlowchartEditor({
  initialContent,
  onSave,
}: FlowchartEditorProps) {
  // แปลงข้อมูล JSON เป็น nodes และ edges
  const parseInitialContent = () => {
    try {
      if (initialContent) {
        const content = JSON.parse(initialContent);
        return {
          nodes: content.nodes || [],
          edges: content.edges || [],
        };
      }
    } catch (error) {
      console.error("Error parsing flowchart content:", error);
    }
    
    // ค่าเริ่มต้นถ้าไม่มีข้อมูลหรือข้อมูลไม่ถูกต้อง
    return {
      nodes: [
        { id: '1', type: 'start', data: { label: 'เริ่มต้น' }, position: { x: 100, y: 100 } },
        { id: '2', type: 'process', data: { label: 'กระบวนการ' }, position: { x: 100, y: 200 } },
        { id: '3', type: 'end', data: { label: 'สิ้นสุด' }, position: { x: 100, y: 300 } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: false },
        { id: 'e2-3', source: '2', target: '3', animated: false }
      ],
    };
  };
  
  const { nodes: initialNodes, edges: initialEdges } = parseInitialContent();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeName, setNodeName] = useState<string>("");
  const [selectedNodeType, setSelectedNodeType] = useState<string>("process");
  
  // ฟังก์ชันสำหรับการเพิ่ม edge ใหม่
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: false }, eds));
    },
    [setEdges]
  );
  
  // เมื่อมีการเลือก node
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeName(node.data.label);
  };
  
  // เมื่อคลิกที่พื้นหลัง (ยกเลิกการเลือก node)
  const onPaneClick = () => {
    setSelectedNode(null);
    setNodeName("");
  };
  
  // เปลี่ยนชื่อของ node ที่เลือก
  const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value);
  };
  
  // อัปเดตชื่อของ node ที่เลือก
  const updateNodeName = () => {
    if (selectedNode && nodeName) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: nodeName,
              },
            };
          }
          return node;
        })
      );
      setSelectedNode(null);
      setNodeName("");
    }
  };
  
  // เพิ่ม node ใหม่
  const addNode = () => {
    const newId = `${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type: selectedNodeType,
      data: { label: `${selectedNodeType === 'start' ? 'เริ่มต้น' : selectedNodeType === 'end' ? 'สิ้นสุด' : selectedNodeType === 'process' ? 'กระบวนการ' : 'เงื่อนไข'}` },
      position: { x: 100, y: 100 + nodes.length * 100 },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };
  
  // ลบ node ที่เลือก
  const deleteSelectedNode = () => {
    if (selectedNode) {
      // ลบ edges ที่เชื่อมต่อกับ node ที่จะลบ
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      // ลบ node
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
      setNodeName("");
    }
  };
  
  // บันทึกแผนผัง
  const saveFlowchart = () => {
    const flowchartData = {
      nodes,
      edges,
    };
    onSave(JSON.stringify(flowchartData));
  };
  
  // อัปเดต nodes และ edges เมื่อ initialContent เปลี่ยน
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = parseInitialContent();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialContent, setNodes, setEdges]);
  
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedNodeType}
            onChange={(e) => setSelectedNodeType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="process">กระบวนการ</option>
            <option value="decision">เงื่อนไข</option>
            <option value="start">จุดเริ่มต้น</option>
            <option value="end">จุดสิ้นสุด</option>
          </select>
          
          <button
            onClick={addNode}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            เพิ่ม Node
          </button>
          
          {selectedNode && (
            <>
              <input
                type="text"
                value={nodeName}
                onChange={handleNodeNameChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ชื่อ Node"
              />
              
              <button
                onClick={updateNodeName}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                เปลี่ยนชื่อ Node
              </button>
              
              <button
                onClick={deleteSelectedNode}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                ลบ Node
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={saveFlowchart}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          บันทึกแผนผัง
        </button>
      </div>
      
      <div className="flex-grow border border-gray-300 rounded-md overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
