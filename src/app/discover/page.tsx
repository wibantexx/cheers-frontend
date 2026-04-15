"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import toast from "react-hot-toast";

interface Candidate {
  id: string;
  username: string;
  age: number;
  bio?: string;
  avatar_url?: string;
  city?: string;
}

export default function DiscoverPage() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState(0);

  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: () => api.get("/api/v1/matching/candidates").then((r) => r.data),
  });

  const like = useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/matching/like/${id}`),
    onSuccess: (res) => {
      if (res.data.match) {
        toast.success("🥂 It's a match!", { duration: 3000 });
        qc.invalidateQueries({ queryKey: ["matches"] });
      }
      setCurrent((c) => c + 1);
    },
    onError: () => setCurrent((c) => c + 1),
  });

  const pass = useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/matching/pass/${id}`),
    onSuccess: () => setCurrent((c) => c + 1),
    onError: () => setCurrent((c) => c + 1),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-32">
          <div className="w-10 h-10 border-4 border-[#E8E0D8] border-t-[#8B1A2E] rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const card = candidates[current];

  if (!card) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
          <div className="text-5xl mb-4">🥂</div>
          <h2 className="font-display text-2xl text-[#1C1917] mb-2">
            You&apos;ve seen everyone
          </h2>
          <p className="text-[#78716C] text-sm">
            Come back later — new people join every day.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 flex flex-col items-center gap-6">
        {/* Card */}
        <div className="w-full max-w-sm">
          <div className="relative bg-[#1C1917] rounded-3xl overflow-hidden aspect-[3/4] shadow-xl">
            {card.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.avatar_url}
                alt={card.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-20 font-display text-white">
                  {card.username[0].toUpperCase()}
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-2 mb-2">
                <h2 className="font-display text-2xl text-white font-bold">
                  {card.username}
                </h2>
                <span className="text-white/70 text-lg mb-0.5">{card.age}</span>
              </div>
              {card.city && (
                <p className="text-white/60 text-xs mb-1">📍 {card.city}</p>
              )}
              {card.bio && (
                <p className="text-white/80 text-sm leading-snug line-clamp-2">
                  {card.bio}
                </p>
              )}
            </div>

            {/* Counter badge */}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white/80 text-xs px-3 py-1 rounded-full">
              {candidates.length - current} left
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => pass.mutate(card.id)}
            disabled={pass.isPending || like.isPending}
            className="w-16 h-16 rounded-full border-2 border-[#E8E0D8] bg-white flex items-center justify-center text-2xl hover:border-[#78716C] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            ✕
          </button>
          <button
            onClick={() => like.mutate(card.id)}
            disabled={like.isPending || pass.isPending}
            className="w-20 h-20 rounded-full bg-[#8B1A2E] flex items-center justify-center text-3xl hover:bg-[#5C1020] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#8B1A2E]/30"
          >
            ♥
          </button>
          <div className="w-16 h-16" />
        </div>
      </div>
    </AppShell>
  );
}
