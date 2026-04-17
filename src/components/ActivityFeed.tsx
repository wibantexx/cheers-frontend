"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FeedUser { id: string; username: string; avatar_url?: string | null; }

interface FeedEvent {
  type: "match" | "like" | "message";
  at: string;
  match_id?: string;
  user: FeedUser;
  text: string;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`;
  const days = Math.floor(diff / 86400);
  return `${days} д`;
}

function iconFor(type: FeedEvent["type"]): string {
  if (type === "match") return "🥂";
  if (type === "like") return "💌";
  return "💬";
}

export default function ActivityFeed() {
  const { data: events = [], isLoading } = useQuery<FeedEvent[]>({
    queryKey: ["activity"],
    queryFn: () => api.get("/api/v1/activity/feed").then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) return null;
  if (events.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wide">
          Активность
        </h2>
        <span className="text-[10px] text-subtle">
          за последние 2 недели
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
        {events.slice(0, 10).map((e, i) => {
          const content = (
            <div className="flex items-start gap-3 bg-surface border border-line rounded-2xl px-4 py-3 min-w-[240px] snap-start hover:border-brand/30 transition-colors">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-ink overflow-hidden">
                  {e.user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.user.avatar_url} alt={e.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-sm opacity-40 font-display">
                        {e.user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 bg-surface rounded-full w-5 h-5 flex items-center justify-center text-[11px] border border-line">
                  {iconFor(e.type)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted truncate">
                  <span className="font-semibold text-fg">{e.user.username}</span>
                </p>
                <p className="text-[11px] text-muted line-clamp-2 leading-tight">
                  {e.text}
                </p>
                <p className="text-[10px] text-subtle mt-1">{timeAgo(e.at)}</p>
              </div>
            </div>
          );
          if (e.match_id) {
            return (
              <Link key={i} href={`/matches/${e.match_id}`} className="flex-shrink-0">
                {content}
              </Link>
            );
          }
          return <div key={i} className="flex-shrink-0">{content}</div>;
        })}
      </div>
    </section>
  );
}
