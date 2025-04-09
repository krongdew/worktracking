// src/lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter"; 
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

// เพิ่มการขยายไทป์ของ session
import { DefaultSession } from "next-auth";

// ประกาศขยายไทป์ของ Session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    role: string;
  }
  
  interface JWT {
    id: string;
    role: string;
  }
}

// สร้าง Adapter ด้วย PrismaAdapter แต่ไม่ต้องกำหนดเป็น adapter property โดยตรง
const prismaAdapter = PrismaAdapter(db);

export const authOptions: NextAuthOptions = {
  // กำหนด adapter โดยใช้แค่ที่จำเป็น ไม่ให้ TypeScript ตรวจสอบแบบเข้มงวด
  adapter: {
    createUser: prismaAdapter.createUser,
    getUser: prismaAdapter.getUser,
    getUserByEmail: prismaAdapter.getUserByEmail,
    getUserByAccount: prismaAdapter.getUserByAccount,
    updateUser: prismaAdapter.updateUser,
    deleteUser: prismaAdapter.deleteUser,
    linkAccount: prismaAdapter.linkAccount,
    unlinkAccount: prismaAdapter.unlinkAccount,
    createSession: prismaAdapter.createSession,
    getSessionAndUser: prismaAdapter.getSessionAndUser,
    updateSession: prismaAdapter.updateSession,
    deleteSession: prismaAdapter.deleteSession,
  } as any, // ใช้ as any เพื่อหลีกเลี่ยงปัญหาการตรวจสอบไทป์
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email as string,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };
    },
  },
};