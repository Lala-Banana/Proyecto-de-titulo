// src/types/next-auth.d.ts
import NextAuth from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    refresh_token?: string;
    user: {
      nombre?: string;
      foto_url?: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    nombre?: string;
    foto_url?: string;
    email: string;
    access_token?: string;
    refresh_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    nombre?: string;
    foto_url?: string;
    email: string;
    access_token?: string;
    refresh_token?: string;
  }
}
