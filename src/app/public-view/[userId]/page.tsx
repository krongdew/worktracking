import { notFound } from "next/navigation";
import { getUserPublicData } from "@/server/actions/public-view-actions";
import PublicViewComponent from "@/components/public-view/PublicViewComponent";


export const dynamic = "force-dynamic";

export default async function PublicViewPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const userData = await getUserPublicData(userId);
  if (!userData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-4">
      <PublicViewComponent userData={userData} />
    </div>
  );
}