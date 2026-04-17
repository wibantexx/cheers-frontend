"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

function ResetContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [form, setForm] = useState({ new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", { token, new_password: form.new_password });
      toast.success("Password updated! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-brand font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-line p-8">
          <h1 className="font-display text-2xl text-fg mb-1">New password</h1>
          <p className="text-muted text-sm mb-8">Choose a strong password.</p>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "new_password" as const, label: "New password", placeholder: "Min 8 chars, 1 uppercase, 1 number" },
              { key: "confirm" as const, label: "Confirm password", placeholder: "Repeat password" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                  {label}
                </label>
                <input
                  type="password"
                  required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-line rounded-xl px-4 py-3 text-sm text-fg bg-bg focus:outline-none focus:border-brand transition-colors"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  );
}
