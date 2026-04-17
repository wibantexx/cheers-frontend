"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { api } from "@/lib/api";
import { playDing, setTitleBadge } from "@/lib/notify";

const NAV = [
  { href: "/discover", label: "Discover", icon: "✦" },
  { href: "/matches",  label: "Matches",  icon: "♥" },
  { href: "/profile",  label: "Profile",  icon: "◉" },
];

interface MatchPartner {
  id: string;
  username: string;
  avatar_url?: string;
}
interface MatchItem {
  id: string;
  partner: MatchPartner;
  unread_count: number;
  last_message?: { created_at: string };
}

interface Props {
  children: React.ReactNode;
  fullHeight?: boolean;
}

export default function AppShell({ children, fullHeight = false }: Props) {
  const { user, loading, fetchMe, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();

  const { data: matches = [] } = useQuery<MatchItem[]>({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/v1/matching/matches").then((r) => r.data),
    staleTime: 5_000,
    refetchInterval: 8_000,
    refetchIntervalInBackground: true,
    enabled: !!user,
  });
  const totalUnread = matches.reduce((s, m) => s + (m.unread_count ?? 0), 0);

  // Track per-match unread to detect new messages (ignore increases in the currently-open chat).
  const prevUnreadRef = useRef<Record<string, number>>({});
  const openMatchId = pathname.startsWith("/matches/") ? pathname.split("/")[2] : null;

  useEffect(() => {
    const prev = prevUnreadRef.current;
    const next: Record<string, number> = {};
    let firstIncrease: MatchItem | null = null;
    for (const m of matches) {
      next[m.id] = m.unread_count;
      if ((m.unread_count ?? 0) > (prev[m.id] ?? 0) && m.id !== openMatchId) {
        if (!firstIncrease) firstIncrease = m;
      }
    }
    // Skip the very first run (no baseline yet)
    if (Object.keys(prev).length > 0 && firstIncrease) {
      playDing();
      toast(`💬 ${firstIncrease.partner.username}: новое сообщение`, {
        duration: 3500,
      });
    }
    prevUnreadRef.current = next;
  }, [matches, openMatchId]);

  useEffect(() => {
    setTitleBadge(totalUnread);
    return () => setTitleBadge(0);
  }, [totalUnread]);

  const recent = [...matches]
    .sort((a, b) => {
      const ta = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
      const tb = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 5);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-line border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 border-r border-line bg-surface flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-line">
          <span className="font-display text-2xl text-brand font-bold tracking-tight">Cheers</span>
        </div>

        <nav className="py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            const badge = label === "Matches" && totalUnread > 0 ? totalUnread : null;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:text-fg hover:bg-surface-hover"
                }`}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Recent matches */}
        {recent.length > 0 && (
          <div className="px-4 pb-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle px-1 mb-2">
              Недавние
            </div>
            <div className="flex items-center gap-2">
              {recent.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  title={m.partner.username}
                  className="relative group"
                >
                  <div className="w-9 h-9 rounded-full bg-ink overflow-hidden ring-2 ring-transparent group-hover:ring-brand/50 transition">
                    {m.partner.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.partner.avatar_url} alt={m.partner.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-[11px] font-bold opacity-60">
                          {m.partner.username[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  {m.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-surface">
                      {m.unread_count > 9 ? "9" : m.unread_count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Flex spacer pushes footer to bottom */}
        <div className="flex-1" />

        {/* Settings footer */}
        <div className="px-3 py-2 border-t border-line flex items-center gap-1">
          <button
            onClick={toggle}
            title={dark ? "Светлая тема" : "Тёмная тема"}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-muted hover:text-fg hover:bg-surface-hover transition-colors text-sm"
          >
            <span className="text-base">{dark ? "☀" : "☾"}</span>
            <span className="text-xs">{dark ? "Светлая" : "Тёмная"}</span>
          </button>
          <button
            onClick={logout}
            title="Выйти"
            className="px-3 py-2 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors text-sm"
          >
            <span className="text-base">⎋</span>
          </button>
        </div>

        {/* User info */}
        <Link
          href="/profile"
          className="px-4 py-3 border-t border-line flex items-center gap-3 hover:bg-surface-hover transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-ink flex-shrink-0 overflow-hidden">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-60">
                  {user.username[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg truncate">{user.username}</p>
            <p className="text-[10px] text-subtle">{user.age} лет</p>
          </div>
        </Link>
      </aside>

      <main className={`flex-1 ${fullHeight ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
        {children}
      </main>
    </div>
  );
}
