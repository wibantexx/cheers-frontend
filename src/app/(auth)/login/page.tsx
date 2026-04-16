"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    router.push("/discover");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setDemoLoading(true);
    try {
      await login("demo@cheers.app", "Demo12345");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Demo login failed";
      toast.error(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-[#8B1A2E] font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E0D8] p-8">
          <h1 className="font-display text-2xl text-[#1C1917] mb-1">Welcome back</h1>
          <p className="text-[#78716C] text-sm mb-8">Sign in to continue</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2]"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-[#8B1A2E] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A2E] text-[#FAF5EF] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#5C1020] transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E8E0D8]" />
            <span className="text-xs text-[#C4BAB2] uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-[#E8E0D8]" />
          </div>

          <button
            type="button"
            onClick={demoLogin}
            disabled={demoLoading}
            className="w-full border border-[#8B1A2E] text-[#8B1A2E] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8B1A2E] hover:text-[#FAF5EF] transition-colors disabled:opacity-60"
          >
            {demoLoading ? "Loading demo…" : "Try demo (no signup)"}
          </button>
        </div>

        <p className="text-center text-sm text-[#78716C] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#8B1A2E] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
