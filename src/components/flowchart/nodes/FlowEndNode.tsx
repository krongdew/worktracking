// src/components/flowchart/nodes/FlowEndNode.tsx
"use client";

import { Handle, Position, NodeProps } from "reactflow";

export default function FlowEndNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-full bg-red-500 text-white min-w-[100px] text-center">
      <Handle type="target" position={Position.Top} id="t" />
      <div>{data.label}</div>
    </div>
  );
}