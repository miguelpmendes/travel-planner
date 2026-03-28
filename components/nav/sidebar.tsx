"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const adminItems = [{ href: "/admin/users", icon: "👥", label: "Utilizadores" }];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 h-full fixed left-0 top-0 z-10">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="font-bold text-gray-900 text-sm">Travel Planner</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <Link
          href="/trips"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
            pathname === "/trips" || pathname === "/"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <span>🧳</span>
          Viagens
        </Link>

        {session.user.role === "ADMIN" && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl mb-1 transition-colors",
            pathname === "/profile" ? "bg-blue-50" : "hover:bg-gray-50"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-none">
            {session.user.avatarEmoji ?? (
              <span className="font-bold text-blue-700 text-xs">
                {session.user.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">@{session.user.username}</p>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
