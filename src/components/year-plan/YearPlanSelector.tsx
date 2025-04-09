"use client";

import { Select, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

interface YearPlanSelectorProps {
  yearPlans: { id: string; title: string; year: number }[];
  selectedYearPlanId: string;
  onYearPlanChange: (yearPlanId: string) => void;
}

export default function YearPlanSelector({
  yearPlans,
  selectedYearPlanId,
  onYearPlanChange,
}: YearPlanSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Text strong style={{ marginRight: 8 }}>
        <CalendarOutlined style={{ marginRight: 4 }} /> เลือกแผนการดำเนินงาน:
      </Text>
      <Select
        value={selectedYearPlanId}
        onChange={onYearPlanChange}
        style={{ width: '100%', maxWidth: 400 }}
        placeholder="เลือกแผนการดำเนินงาน"
        disabled={yearPlans.length === 0}
        notFoundContent="ยังไม่มีแผนการดำเนินงาน"
      >
        {yearPlans.length === 0 ? (
          <Option value="" disabled>ยังไม่มีแผนการดำเนินงาน</Option>
        ) : (
          yearPlans.map((yearPlan) => (
            <Option key={yearPlan.id} value={yearPlan.id}>
              {yearPlan.title} (ปี {yearPlan.year})
            </Option>
          ))
        )}
      </Select>
    </div>
  );
}