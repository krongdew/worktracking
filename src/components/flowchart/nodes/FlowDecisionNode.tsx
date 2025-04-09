// src/components/flowchart/nodes/FlowDecisionNode.tsx
"use client";

import { Handle, Position, NodeProps } from "reactflow";

export default function FlowDecisionNode({ data }: NodeProps) {
  return (
    <div className="w-[150px] h-[100px] flex items-center justify-center rotate-45 bg-yellow-100 border-2 border-yellow-500">
      <div className="-rotate-45">{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        style={{ transform: "rotate(-45deg) translateX(0) translateY(10px)" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ transform: "rotate(-45deg) translateX(0) translateY(-10px)" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        style={{ transform: "rotate(-45deg) translateX(-10px) translateY(0)" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="l"
        style={{ transform: "rotate(-45deg) translateX(10px) translateY(0)" }}
      />
    </div>
  );
}