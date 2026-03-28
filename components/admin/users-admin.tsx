"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Role } from "@prisma/client";

type User = {
  id: string;
  name: string;
  username: string;
  role: Role;
  active: boolean;
  createdAt: Date;
};

export function UsersAdmin({
  initialUsers,
  currentUserId,
}: {
  initialUsers: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);

  async function handleDelete(userId: string) {
    if (!confirm("Tens a certeza que queres apagar este utilizador? Esta ação é irreversível.")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  async function toggleActive(userId: string, active: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  }

  async function handleCreate(data: {
    name: string;
    username: string;
    password: string;
    role: Role;
  }) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Erro");
    }
    const user = await res.json();
    setUsers((prev) => [...prev, user]);
    setShowCreate(false);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Novo utilizador
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 ${
              !user.active ? "opacity-60" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-none">
              {user.name[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.role === "ADMIN" ? "Admin" : "Membro"}
                </span>
                {!user.active && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-600">
                    Inativo
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Criado em {format(user.createdAt, "d MMM yyyy", { locale: ptBR })}
              </p>
            </div>

            {user.id !== currentUserId && (
              <div className="flex items-center gap-2 flex-none">
                <button
                  onClick={() => toggleActive(user.id, !user.active)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    user.active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {user.active ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Apagar utilizador"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateUserModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </>
  );
}

function CreateUserModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; username: string; password: string; role: Role }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onCreate({ name, username, password, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h2 className="font-bold text-gray-900 mb-4">Novo utilizador</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilizador</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "."))}
              placeholder="ex: joao.silva"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="flex gap-2">
              {(["MEMBER", "ADMIN"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    role === r
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {r === "ADMIN" ? "Admin" : "Membro"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "A criar…" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
