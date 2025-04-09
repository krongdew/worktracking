// src/server/auth/register.ts
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

// สร้าง schema validation ด้วย zod
const registerSchema = z.object({
  email: z.string().email({ message: "อีเมลไม่ถูกต้อง" }),
  password: z.string().min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }),
  name: z.string().min(2, { message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" }),
});

export async function registerUser(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password, name } = validatedFields.data;

  // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: { email: ["อีเมลนี้ถูกใช้งานแล้ว"] } };
  }

  // Hash รหัสผ่าน
  const hashedPassword = await hash(password, 12);

  // สร้างผู้ใช้ใหม่
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { success: true, user };
}
