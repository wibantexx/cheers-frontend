"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

interface Props {
  hasLocation: boolean;
}

export default function LocationButton({ hasLocation }: Props) {
  const setUser = useAuthStore((s) => s.setUser);
  const [detecting, setDetecting] = useState(false);

  const save = useMutation({
    mutationFn: (coords: { latitude: number; longitude: number }) =>
      api.patch("/api/v1/users/me", coords).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Местоположение сохранено");
    },
    onError: () => toast.error("Не удалось сохранить"),
  });

  const clear = useMutation({
    mutationFn: () =>
      api.patch("/api/v1/users/me", { latitude: null, longitude: null }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Местоположение убрано");
    },
    onError: () => toast.error("Не удалось убрать"),
  });

  const detect = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Геолокация недоступна в этом браузере");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        save.mutate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        setDetecting(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Доступ к геолокации запрещён"
            : "Не удалось определить местоположение";
        toast.error(msg);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  };

  const busy = detecting || save.isPending || clear.isPending;

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-semibold text-fg">Местоположение</p>
          <p className="text-[11px] text-muted mt-0.5">
            {hasLocation
              ? "Другие видят расстояние до вас (с точностью ~1 км)"
              : "Разрешите, чтобы видеть расстояние до других"}
          </p>
        </div>
        <span className="text-xl leading-none">📍</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={detect}
          disabled={busy}
          className="flex-1 bg-brand text-white py-2 rounded-xl font-semibold text-xs hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {busy ? "…" : hasLocation ? "Обновить" : "Использовать моё местоположение"}
        </button>
        {hasLocation && (
          <button
            onClick={() => clear.mutate()}
            disabled={busy}
            className="border border-line text-muted px-4 py-2 rounded-xl font-semibold text-xs hover:border-subtle transition-colors disabled:opacity-60"
          >
            Убрать
          </button>
        )}
      </div>
    </div>
  );
}
