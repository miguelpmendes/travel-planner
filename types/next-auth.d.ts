import type { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    avatarEmoji?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: Role;
      avatarEmoji?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    avatarEmoji?: string | null;
  }
}
