import React, { useState, useEffect } from 'react';
import { Select, Space, Row, Col, Typography } from 'antd';
import { TodoType, TodoStatus } from "@prisma/client";
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

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
  // State for tracking screen width
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size on component mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

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

  // สำหรับหน้าจอ Desktop
  const DesktopFilter = () => (
    <Row gutter={24} align="middle">
      <Col>
        <Space>
          <FilterOutlined />
          <Text strong>กรองรายการ:</Text>
        </Space>
      </Col>
      <Col>
        <Space size="middle">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 8 }}>ประเภท:</Text>
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
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 8 }}>สถานะ:</Text>
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
      </Col>
    </Row>
  );

  // สำหรับหน้าจอ Mobile
  const MobileFilter = () => (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <FilterOutlined style={{ marginRight: 8 }} />
        <Text strong>กรองรายการ</Text>
      </div>
      
      <Row gutter={[8, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Text style={{ marginRight: 8 }}>ประเภท:</Text>
          <Select
            value={activeFilter.type}
            onChange={(value) => onFilterChange(value as TodoType | "ALL", activeFilter.status)}
            style={{ width: 'calc(100% - 70px)' }}
          >
            {todoTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>
        
        <Col span={24}>
          <Text style={{ marginRight: 8 }}>สถานะ:</Text>
          <Select
            value={activeFilter.status}
            onChange={(value) => onFilterChange(activeFilter.type, value as TodoStatus | "ALL")}
            style={{ width: 'calc(100% - 70px)' }}
          >
            {todoStatuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Space>
  );
  
  return (
    <div style={{ marginBottom: 16 }}>
      {isMobile ? <MobileFilter /> : <DesktopFilter />}
    </div>
  );
}