"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

const NAV = [
  { href: "/discover", label: "Discover", icon: "✦" },
  { href: "/matches",  label: "Matches",  icon: "♥" },
  { href: "/profile",  label: "Profile",  icon: "◉" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8E0D8] border-t-[#8B1A2E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex flex-col max-w-lg mx-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[#E8E0D8] bg-[#FAF5EF]">
        <span className="font-display text-xl text-[#8B1A2E] font-bold">Cheers</span>
        <span className="text-xs text-[#78716C]">Hi, {user.username} 👋</span>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="border-t border-[#E8E0D8] bg-white flex">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                active ? "text-[#8B1A2E]" : "text-[#C4BAB2] hover:text-[#78716C]"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
