// src/components/task-tracking/TaskFilter.tsx
"use client";

import { TaskStatus } from "@prisma/client";
import { Select, DatePicker, Button, Space } from "antd";
import dayjs from 'dayjs';
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskFilterProps {
  activeFilter: {
    status: TaskStatus | "ALL";
    dateRange: [Date | null, Date | null];
  };
  onFilterChange: (
    status: TaskStatus | "ALL",
    dateRange: [Date | null, Date | null]
  ) => void;
}

export default function TaskFilter({ activeFilter, onFilterChange }: TaskFilterProps) {
  const taskStatuses = [
    { value: "ALL", label: "ทุกสถานะ" },
    { value: "PENDING", label: "รอดำเนินการ" },
    { value: "IN_PROGRESS", label: "กำลังดำเนินการ" },
    { value: "COMPLETED", label: "เสร็จสิ้น" },
    { value: "DELAYED", label: "ล่าช้า" },
    { value: "CANCELLED", label: "ยกเลิก" },
  ];

  return (
    <Space wrap>
      <Space>
        <span>สถานะ:</span>
        <Select
          value={activeFilter.status}
          onChange={(value: TaskStatus | "ALL") => 
            onFilterChange(value, activeFilter.dateRange)
          }
        >
          {taskStatuses.map((status) => (
            <Option key={status.value} value={status.value}>
              {status.label}
            </Option>
          ))}
        </Select>
      </Space>

      <Space>
        <span>ช่วงวันที่:</span>
        <RangePicker
          value={[
            activeFilter.dateRange[0] ? dayjs(activeFilter.dateRange[0]) : null,
            activeFilter.dateRange[1] ? dayjs(activeFilter.dateRange[1]) : null
          ]}
          onChange={(dates) => {
            onFilterChange(
              activeFilter.status,
              [
                dates && dates[0] ? dates[0].toDate() : null,
                dates && dates[1] ? dates[1].toDate() : null,
              ]
            );
          }}
        />
      </Space>

      <Button 
        type="link"
        onClick={() => onFilterChange("ALL", [null, null])}
      >
        รีเซ็ตฟิลเตอร์
      </Button>
    </Space>
  );
}