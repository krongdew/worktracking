// src/components/flowchart/nodes/FlowProcessNode.tsx
"use client";

import { Handle, Position, NodeProps } from "reactflow";

export default function FlowProcessNode({ data }: NodeProps) {
  return (
    <div className="px-4 py-2 rounded-md bg-blue-100 border-2 border-blue-500 min-w-[150px] text-center">
      <Handle type="target" position={Position.Top} id="t" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  );
}
