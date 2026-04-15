"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";

interface Partner {
  id: string;
  username: string;
  age: number;
  avatar_url?: string;
  city?: string;
  bio?: string;
}

interface Match {
  id: string;
  created_at: string;
  partner: Partner;
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
          <div className="w-10 h-10 border-4 border-[#E8E0D8] border-t-[#8B1A2E] rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4">
        <h1 className="font-display text-2xl text-[#1C1917] mb-5">Matches</h1>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">♥</div>
            <h2 className="font-display text-xl text-[#1C1917] mb-2">No matches yet</h2>
            <p className="text-[#78716C] text-sm">
              Keep swiping — your next match is out there.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/matches/${match.id}`}
                  className="flex items-center gap-4 bg-white border border-[#E8E0D8] rounded-2xl p-4 hover:border-[#8B1A2E]/30 hover:shadow-sm transition-all active:scale-[0.99]"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#1C1917] flex-shrink-0 overflow-hidden">
                    {match.partner.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={match.partner.avatar_url}
                        alt={match.partner.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-white text-xl opacity-40">
                          {match.partner.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-[#1C1917] text-sm">
                        {match.partner.username}
                      </span>
                      <span className="text-[#78716C] text-xs">{match.partner.age}</span>
                    </div>
                    {match.partner.city && (
                      <p className="text-[#78716C] text-xs mt-0.5">
                        📍 {match.partner.city}
                      </p>
                    )}
                    {match.partner.bio && (
                      <p className="text-[#A09790] text-xs mt-1 truncate">
                        {match.partner.bio}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <span className="text-[#C4BAB2] text-lg flex-shrink-0">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
