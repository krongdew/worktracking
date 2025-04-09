import { Metadata } from "next";
import TodoListManager from "@/components/todo-list/TodoListManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserTodoLists } from "@/server/actions/todo-list-actions";

export const metadata: Metadata = {
  title: "To-do List - ระบบติดตามงาน",
  description: "จัดการรายการสิ่งที่ต้องทำ",
};

export default async function TodoListPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login");
  }
  
  const todoLists = await getUserTodoLists(session.user.id);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">รายการสิ่งที่ต้องทำ</h1>
      <TodoListManager initialTodoLists={todoLists} userId={session.user.id} />
    </div>
  );
}
