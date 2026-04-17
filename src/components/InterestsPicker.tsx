"use client";

import { useState } from "react";
import { INTEREST_CATEGORIES } from "@/lib/profileExtras";

interface Props {
  current: string[];
  onSave: (interests: string[]) => void;
  saving?: boolean;
}

const MAX_INTERESTS = 12;

export default function InterestsPicker({ current, onSave, saving }: Props) {
  const [local, setLocal] = useState<string[]>(current);

  const toggle = (item: string) => {
    setLocal((prev) => {
      if (prev.includes(item)) return prev.filter((i) => i !== item);
      if (prev.length >= MAX_INTERESTS) return prev;
      return [...prev, item];
    });
  };

  const isDirty =
    JSON.stringify(local.slice().sort()) !== JSON.stringify(current.slice().sort());

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <h2 className="font-semibold text-fg text-sm">Интересы</h2>
        <span className="text-[10px] text-subtle">
          {local.length}/{MAX_INTERESTS}
        </span>
      </div>

      <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-4">
        {INTEREST_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wide mb-2">
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item) => {
                const selected = local.includes(item);
                const disabled = !selected && local.length >= MAX_INTERESTS;
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    disabled={disabled}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      selected
                        ? "bg-brand text-white border-brand"
                        : disabled
                        ? "bg-surface-2 text-subtle border-line cursor-not-allowed"
                        : "bg-surface-2 text-muted border-line hover:border-subtle hover:text-fg"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-line">
        <button
          onClick={() => onSave(local)}
          disabled={!isDirty || saving}
          className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-40"
        >
          {saving ? "Сохраняю…" : "Сохранить интересы"}
        </button>
      </div>
    </div>
  );
}
