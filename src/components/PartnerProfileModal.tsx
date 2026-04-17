"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { OnlineDot, lastSeenLabel } from "@/components/OnlineIndicator";
import { formatDistance } from "@/lib/distance";

interface PromptAnswer { q: string; a: string; }

interface PublicUser {
  id: string;
  username: string;
  age: number;
  bio?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  arsenal_have?: string[];
  arsenal_want?: string[];
  mood?: string | null;
  interests?: string[];
  prompts?: PromptAnswer[];
  last_seen?: string | null;
  distance_km?: number | null;
}

interface Props {
  userId: string;
  onClose: () => void;
}

export default function PartnerProfileModal({ userId, onClose }: Props) {
  const { data: u, isLoading, isError } = useQuery<PublicUser>({
    queryKey: ["user", userId],
    queryFn: () => api.get(`/api/v1/users/${userId}`).then((r) => r.data),
    staleTime: 30_000,
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md bg-bg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-line border-t-brand rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-muted text-sm">Не удалось загрузить профиль</p>
          </div>
        )}

        {u && (
          <>
            {/* Avatar / hero */}
            <div className="relative w-full aspect-square bg-ink overflow-hidden">
              {u.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-20 font-display text-white">
                    {u.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Mood pill */}
              {u.mood && (
                <div className="absolute top-4 left-4 right-16 bg-surface/90 backdrop-blur-md text-fg text-xs font-medium px-3 py-1.5 rounded-full shadow-md truncate">
                  {u.mood}
                </div>
              )}

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end gap-2 mb-1">
                  <h2 className="font-display text-3xl text-white font-bold">{u.username}</h2>
                  <span className="text-white/70 text-xl mb-1">{u.age}</span>
                  <OnlineDot lastSeen={u.last_seen} className="mb-2" />
                </div>
                {(u.city || u.distance_km != null) && (
                  <p className="text-white/70 text-xs">
                    {u.city && <>📍 {u.city}</>}
                    {u.city && u.distance_km != null && " · "}
                    {u.distance_km != null && formatDistance(u.distance_km)}
                  </p>
                )}
                <p className="text-white/50 text-[10px] mt-1">
                  {lastSeenLabel(u.last_seen) ?? ""}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {u.bio && (
                <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{u.bio}</p>
              )}

              {/* Arsenal have */}
              {(u.arsenal_have?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                    🍸 В арсенале
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {u.arsenal_have!.map((d) => (
                      <span key={d} className="text-[11px] px-2.5 py-1 rounded-full bg-surface-2 border border-line text-fg">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Arsenal want */}
              {(u.arsenal_want?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                    ✨ Ищет
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {u.arsenal_want!.map((d) => (
                      <span key={d} className="text-[11px] px-2.5 py-1 rounded-full bg-gold/20 border border-gold/40 text-fg">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {(u.interests?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-2">
                    Интересы
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {u.interests!.map((i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-surface-2 border border-line text-muted">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              {(u.prompts?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  {u.prompts!.map((p) => (
                    <div key={p.q} className="bg-surface border border-line rounded-2xl px-4 py-3">
                      <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1">
                        {p.q}
                      </p>
                      <p className="text-sm text-fg leading-snug whitespace-pre-wrap">{p.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
