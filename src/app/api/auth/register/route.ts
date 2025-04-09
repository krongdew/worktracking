// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/server/auth/register";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await registerUser(formData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}