// src/components/flowchart/FlowchartSelector.tsx
"use client";

interface FlowchartSelectorProps {
  flowcharts: { id: string; title: string }[];
  selectedFlowchartId: string;
  onFlowchartChange: (flowchartId: string) => void;
}

export default function FlowchartSelector({
  flowcharts,
  selectedFlowchartId,
  onFlowchartChange,
}: FlowchartSelectorProps) {
  return (
    <div className="w-full md:w-auto">
      <select
        value={selectedFlowchartId}
        onChange={(e) => onFlowchartChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={flowcharts.length === 0}
      >
        {flowcharts.length === 0 ? (
          <option value="">ยังไม่มีแผนผัง</option>
        ) : (
          flowcharts.map((flowchart) => (
            <option key={flowchart.id} value={flowchart.id}>
              {flowchart.title}
            </option>
          ))
        )}
      </select>
    </div>
  );
}