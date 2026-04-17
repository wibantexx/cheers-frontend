"use client";

interface Props {
  user: {
    avatar_url?: string;
    bio?: string;
    city?: string;
    arsenal_have: string[];
    arsenal_want: string[];
    interests: string[];
    prompts: { q: string; a: string }[];
    mood?: string | null;
  };
}

interface Check {
  label: string;
  done: boolean;
}

function computeChecks(u: Props["user"]): Check[] {
  return [
    { label: "Аватар", done: !!u.avatar_url },
    { label: "Био (от 20 символов)", done: !!u.bio && u.bio.trim().length >= 20 },
    { label: "Город", done: !!u.city?.trim() },
    { label: "Настроение", done: !!u.mood?.trim() },
    { label: "Напитки в арсенале", done: u.arsenal_have.length >= 1 },
    { label: "Что хочет попробовать", done: u.arsenal_want.length >= 1 },
    { label: "Интересы (от 3)", done: u.interests.length >= 3 },
    { label: "Ответ на вопрос", done: u.prompts.length >= 1 },
  ];
}

export default function ProfileCompleteness({ user }: Props) {
  const checks = computeChecks(user);
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);

  if (pct === 100) return null;

  const missing = checks.filter((c) => !c.done);

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-fg">Профиль заполнен</p>
        <span className="text-xs font-bold text-brand">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {missing.length > 0 && (
        <>
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1.5">
            Что добавить
          </p>
          <ul className="space-y-1">
            {missing.slice(0, 4).map((c) => (
              <li key={c.label} className="text-[12px] text-muted flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-brand/60" />
                {c.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
