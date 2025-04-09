// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;
  
  // รายการ path ที่ต้องการให้ล็อกอินก่อนเข้าถึง
  const protectedPaths = [
    "/dashboard",
    "/year-plan",
    "/todo-list",
    "/task-tracking",
    "/flowchart",
  ];
  
  // รายการ path ที่ไม่ต้องการให้ผู้ใช้ที่ล็อกอินแล้วเข้าถึง (เช่น หน้าล็อกอิน)
  const authRoutes = ["/auth/login", "/auth/register"];
  
  // ตรวจสอบว่า path ปัจจุบันต้องมีการล็อกอินหรือไม่
  const isProtectedPath = protectedPaths.some((path) => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // ตรวจสอบว่าเป็น auth route หรือไม่
  const isAuthRoute = authRoutes.some((path) => 
    req.nextUrl.pathname === path
  );
  
  // ถ้าเป็น protected path และไม่ได้ล็อกอิน ให้ redirect ไปหน้า login
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // ถ้าเป็น auth route และล็อกอินแล้ว ให้ redirect ไปหน้า dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  return NextResponse.next();
}

// ระบุ path ที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/year-plan/:path*",
    "/todo-list/:path*",
    "/task-tracking/:path*",
    "/flowchart/:path*",
    "/auth/:path*",
  ],
};