"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Result, Button, Card } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
  let errorDescription = "โปรดลองอีกครั้ง หรือติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่";

  if (error === "CredentialsSignin") {
    errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    errorDescription = "โปรดตรวจสอบข้อมูลการเข้าสู่ระบบของคุณ และลองอีกครั้ง";
  } else if (error === "AccessDenied") {
    errorMessage = "คุณไม่มีสิทธิ์เข้าถึงหน้านี้";
    errorDescription = "กรุณาเข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์เข้าถึง";
  } else if (error === "SessionRequired") {
    errorMessage = "กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน";
    errorDescription = "คุณจำเป็นต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card style={{ width: 500, maxWidth: "100%" }} bordered={false}>
        <Result
          status="error"
          title={errorMessage}
          subTitle={errorDescription}
          icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
          extra={
            <Link href="/auth/login">
              <Button type="primary" size="large">
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}