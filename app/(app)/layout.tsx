import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { SessionProvider } from "@/components/session-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider>
      <div className="h-full flex">
        <Sidebar />
        <main className="flex-1 md:ml-56 pb-20 md:pb-0 overflow-y-auto min-h-dvh">
          {children}
        </main>
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
