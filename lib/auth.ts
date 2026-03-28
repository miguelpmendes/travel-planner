import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Utilizador", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email ?? "",
          role: user.role,
          avatarEmoji: user.avatarEmoji,
        };
      },
    }),
  ],
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
});
