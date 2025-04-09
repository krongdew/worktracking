import React from 'react';
import { Select, Space } from 'antd';
import { TodoType, TodoStatus } from "@prisma/client";

const { Option } = Select;

interface TodoListFilterProps {
  activeFilter: {
    type: TodoType | "ALL";
    status: TodoStatus | "ALL";
  };
  onFilterChange: (type: TodoType | "ALL", status: TodoStatus | "ALL") => void;
}

export default function TodoListFilter({
  activeFilter,
  onFilterChange,
}: TodoListFilterProps) {
  const todoTypes = [
    { value: "ALL", label: "ทั้งหมด" },
    { value: "DAILY", label: "รายวัน" },
    { value: "WEEKLY", label: "รายสัปดาห์" },
    { value: "MONTHLY", label: "รายเดือน" },
  ];
  
  const todoStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];
  
  return (
    <Space size="middle" className="w-full">
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">ประเภท:</span>
        <Select
          value={activeFilter.type}
          onChange={(value) => onFilterChange(value as TodoType | "ALL", activeFilter.status)}
          style={{ width: 150 }}
        >
          {todoTypes.map((type) => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
      </div>
      
      <div className="flex items-center">
        <span className="text-sm text-gray-700 mr-2">สถานะ:</span>
        <Select
          value={activeFilter.status}
          onChange={(value) => onFilterChange(activeFilter.type, value as TodoStatus | "ALL")}
          style={{ width: 150 }}
        >
          {todoStatuses.map((status) => (
            <Option key={status.value} value={status.value}>
              {status.label}
            </Option>
          ))}
        </Select>
      </div>
    </Space>
  );
}