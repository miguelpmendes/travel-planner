"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const items = [
    { href: "/trips", icon: "🧳", label: "Viagens" },
    ...(session.user.role === "ADMIN"
      ? [{ href: "/admin/users", icon: "👥", label: "Admin" }]
      : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 safe-area-pb">
      <div className="flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors",
              pathname === item.href ? "text-blue-600" : "text-gray-500"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        <Link
          href="/profile"
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors",
            pathname === "/profile" ? "text-blue-600" : "text-gray-500"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-base">
            {session.user.avatarEmoji ?? (
              <span className="text-xs font-bold text-blue-700">
                {session.user.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
