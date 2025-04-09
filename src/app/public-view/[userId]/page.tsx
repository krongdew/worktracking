// src/app/public-view/[userId]/page.tsx
import { Metadata } from "next";
import PublicViewComponent from "@/components/public-view/PublicViewComponent";
import { getUserPublicData } from "@/server/actions/public-view-actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ข้อมูลผู้ใช้ - ระบบติดตามงาน",
  description: "ดูข้อมูลการติดตามงานแบบสาธารณะ",
};

export default async function PublicViewPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  
  try {
    const userData = await getUserPublicData(userId);
    
    if (!userData) {
      notFound();
    }
    
    return (
      <div className="container mx-auto py-8 px-4">
        <PublicViewComponent userData={userData} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching public data:", error);
    notFound();
  }
}