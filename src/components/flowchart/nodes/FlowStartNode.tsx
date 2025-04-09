// src/components/flowchart/nodes/FlowStartNode.tsx
"use client";

import { Handle, Position, NodeProps } from "reactflow";

export default function FlowStartNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-full bg-green-500 text-white min-w-[100px] text-center">
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  );
}
