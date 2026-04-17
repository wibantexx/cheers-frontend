export function formatDistance(km: number | null | undefined): string | null {
  if (km == null) return null;
  if (km < 1) return "рядом";
  if (km < 10) return `${km.toFixed(1)} км`;
  if (km < 100) return `${Math.round(km)} км`;
  if (km < 1000) return `${Math.round(km / 5) * 5} км`;
  return `${Math.round(km / 100) * 100}+ км`;
}
