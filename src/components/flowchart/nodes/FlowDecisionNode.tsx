// src/components/flowchart/nodes/FlowDecisionNode.tsx
"use client";

import { Handle, Position, NodeProps } from "reactflow";

export default function FlowDecisionNode({ data }: NodeProps) {
  return (
    <div className="relative flex items-center justify-center w-[140px] h-[140px]">
      {/* วิธีแสดงสี่เหลี่ยมข้าวหลามตัดพร้อมเส้นกรอบที่ชัดเจน */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          border: '2px solid black',
          transform: 'rotate(45deg)',
          boxSizing: 'border-box',
        }} 
      ></div>
      
      {/* ข้อความ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="z-10 text-center">{data.label}</div>
      </div>
      
      {/* จุดเชื่อมต่อที่มุมด้านบน */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ 
          position: 'absolute',
          top: '0', 
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* จุดเชื่อมต่อที่มุมด้านขวา */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          position: 'absolute',
          top: '50%', 
          right: '0',
          transform: 'translate(50%, -50%)'
        }}
      />
      
      {/* จุดเชื่อมต่อที่มุมด้านล่าง */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ 
          position: 'absolute',
          bottom: '0', 
          left: '50%',
          transform: 'translate(-50%, 50%)'
        }}
      />
      
      {/* จุดเชื่อมต่อที่มุมด้านซ้าย */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ 
          position: 'absolute',
          top: '50%', 
          left: '0',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
}