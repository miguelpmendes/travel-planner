import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UsersAdmin } from "@/components/admin/users-admin";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const users = await db.user.findMany({
    select: { id: true, name: true, username: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Utilizadores</h1>
        <p className="text-gray-500 mt-1">Gere os membros da família</p>
      </div>
      <UsersAdmin initialUsers={users} currentUserId={session!.user.id} />
    </div>
  );
}
