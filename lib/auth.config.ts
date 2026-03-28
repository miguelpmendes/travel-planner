import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.avatarEmoji = (user as { avatarEmoji?: string | null }).avatarEmoji;
        token.username = (user as unknown as { username: string }).username;
      }
      if (trigger === "update" && session?.avatarEmoji !== undefined) {
        token.avatarEmoji = session.avatarEmoji;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.avatarEmoji = token.avatarEmoji as string | null | undefined;
        session.user.username = (token.username as string) ?? "";
      }
      return session;
    },
  },
};
