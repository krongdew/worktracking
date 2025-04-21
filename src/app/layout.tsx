"use client";

import "./globals.css";
import { Inter, Sarabun } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ConfigProvider, App } from "antd";
import thTH from "antd/lib/locale/th_TH";

// ภาษาไทย
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <title>ระบบติดตามงาน</title>
        <meta name="description" content="ระบบสำหรับติดตามความคืบหน้าของงาน" />
      </head>
      <body className={`${inter.variable} ${sarabun.variable} font-sarabun`}>
        <AuthProvider>
          <ConfigProvider
            locale={thTH}
            theme={{
              token: {
                colorPrimary: "#1890ff",
                colorSuccess: "#52c41a",
                colorWarning: "#faad14",
                colorError: "#f5222d",
                colorInfo: "#1890ff",
                fontFamily: "'Sarabun', sans-serif",
              },
              components: {
                Typography: {
                  fontWeightStrong: 600,
                },
              },
            }}
          >
            <SidebarProvider>
              <App>{children}</App>
            </SidebarProvider>
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}