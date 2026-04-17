"use client";

import { useState } from "react";
import { ALL_DRINKS } from "@/lib/drinks";

export interface Filters {
  age_min?: number;
  age_max?: number;
  city?: string;
  arsenal_have: string[];
  arsenal_want: string[];
  max_distance_km?: number;
}

export const EMPTY_FILTERS: Filters = { arsenal_have: [], arsenal_want: [] };

export function filtersToParams(f: Filters): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.age_min !== undefined) p.age_min = String(f.age_min);
  if (f.age_max !== undefined) p.age_max = String(f.age_max);
  if (f.city?.trim()) p.city = f.city.trim();
  if (f.arsenal_have.length) p.arsenal_have = f.arsenal_have.join(",");
  if (f.arsenal_want.length) p.arsenal_want = f.arsenal_want.join(",");
  if (f.max_distance_km !== undefined) p.max_distance_km = String(f.max_distance_km);
  return p;
}

function countActive(f: Filters): number {
  return (
    (f.age_min !== undefined ? 1 : 0) +
    (f.age_max !== undefined ? 1 : 0) +
    (f.city?.trim() ? 1 : 0) +
    (f.arsenal_have.length > 0 ? 1 : 0) +
    (f.arsenal_want.length > 0 ? 1 : 0) +
    (f.max_distance_km !== undefined ? 1 : 0)
  );
}

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
}

export default function DiscoverFilters({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const active = countActive(value);

  const toggleDrink = (list: "arsenal_have" | "arsenal_want", drink: string) => {
    const cur = value[list];
    const next = cur.includes(drink) ? cur.filter((d) => d !== drink) : [...cur, drink];
    onChange({ ...value, [list]: next });
  };

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-fg hover:border-brand/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>⚙</span>
          <span>Фильтры</span>
          {active > 0 && (
            <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {active}
            </span>
          )}
        </span>
        <span className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="mt-2 bg-surface border border-line rounded-xl p-4 space-y-4">
          {/* Age range */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Возраст
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={18} max={99}
                value={value.age_min ?? ""}
                placeholder="от 18"
                onChange={(e) => onChange({
                  ...value,
                  age_min: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="flex-1 border border-line rounded-lg px-3 py-1.5 text-sm bg-surface-2 text-fg focus:outline-none focus:border-brand placeholder:text-subtle"
              />
              <span className="text-muted text-sm">—</span>
              <input
                type="number"
                min={18} max={99}
                value={value.age_max ?? ""}
                placeholder="до 99"
                onChange={(e) => onChange({
                  ...value,
                  age_max: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="flex-1 border border-line rounded-lg px-3 py-1.5 text-sm bg-surface-2 text-fg focus:outline-none focus:border-brand placeholder:text-subtle"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
              Город
            </label>
            <input
              type="text"
              value={value.city ?? ""}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="Любой"
              className="w-full border border-line rounded-lg px-3 py-1.5 text-sm bg-surface-2 text-fg focus:outline-none focus:border-brand placeholder:text-subtle"
            />
          </div>

          {/* Max distance */}
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-wide flex items-center justify-between mb-1.5">
              <span>Максимум расстояние</span>
              <span className="text-muted normal-case">
                {value.max_distance_km !== undefined ? `${value.max_distance_km} км` : "не важно"}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={value.max_distance_km ?? 500}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({ ...value, max_distance_km: v >= 500 ? undefined : v });
              }}
              className="w-full accent-brand"
            />
          </div>

          {/* Drinks they have */}
          <DrinkChips
            label="Имеет в арсенале"
            selected={value.arsenal_have}
            onToggle={(d) => toggleDrink("arsenal_have", d)}
          />

          {/* Drinks they want */}
          <DrinkChips
            label="Ищет"
            selected={value.arsenal_want}
            onToggle={(d) => toggleDrink("arsenal_want", d)}
          />

          {active > 0 && (
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              className="w-full text-xs text-muted hover:text-brand transition-colors py-1"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DrinkChips({
  label, selected, onToggle,
}: { label: string; selected: string[]; onToggle: (d: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted uppercase tracking-wide block mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {ALL_DRINKS.slice(0, 12).map((d) => {
          const on = selected.includes(d);
          return (
            <button
              key={d}
              onClick={() => onToggle(d)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                on
                  ? "bg-brand text-white border-brand"
                  : "bg-surface-2 text-muted border-line hover:border-subtle"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
