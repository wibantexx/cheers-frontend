"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import ActivityFeed from "@/components/ActivityFeed";
import { OnlineDot } from "@/components/OnlineIndicator";

interface LastMessage {
  content: string;
  created_at: string;
  is_mine: boolean;
}

interface Partner {
  id: string;
  username: string;
  age: number;
  avatar_url?: string;
  city?: string;
  bio?: string;
  last_seen?: string | null;
}

interface Match {
  id: string;
  created_at: string;
  partner: Partner;
  last_message?: LastMessage;
  unread_count: number;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return date.toLocaleDateString("ru-RU", { weekday: "short" });
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/v1/matching/matches").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-line border-t-brand rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-fg mb-5">Matches</h1>

        <ActivityFeed />

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">♥</div>
            <h2 className="font-display text-xl text-fg mb-2">Пока нет матчей</h2>
            <p className="text-muted text-sm">
              Свайпайте — ваш следующий матч уже где-то рядом.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/matches/${match.id}`}
                  className="flex items-center gap-4 bg-surface border border-line rounded-2xl p-4 hover:border-brand/30 hover:shadow-sm transition-all"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-ink overflow-hidden">
                      {match.partner.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={match.partner.avatar_url} alt={match.partner.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-white text-xl opacity-40">
                            {match.partner.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {match.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {match.unread_count > 9 ? "9+" : match.unread_count}
                      </span>
                    )}
                    <OnlineDot lastSeen={match.partner.last_seen} className="absolute bottom-0 right-0" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className={`font-semibold text-sm ${match.unread_count > 0 ? "text-fg" : "text-fg"}`}>
                        {match.partner.username}
                      </span>
                      {match.last_message && (
                        <span className="text-[10px] text-subtle flex-shrink-0 ml-2">
                          {formatTime(match.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {match.last_message ? (
                      <p className={`text-xs truncate ${
                        match.unread_count > 0
                          ? "text-fg font-medium"
                          : "text-muted"
                      }`}>
                        {match.last_message.is_mine && <span className="text-subtle">Вы: </span>}
                        {match.last_message.content}
                      </p>
                    ) : (
                      <p className="text-xs text-subtle">Напишите первым 👋</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
