"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const { data } = await api.post("/api/v1/auth/demo-login");
      localStorage.setItem("access_token", data.access_token);
      router.push("/discover");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Demo login failed";
      toast.error(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      demoLogin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-brand font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-line p-8">
          <h1 className="font-display text-2xl text-fg mb-1">Welcome back</h1>
          <p className="text-muted text-sm mb-8">Sign in to continue</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-line rounded-xl px-4 py-3 text-sm text-fg bg-bg focus:outline-none focus:border-brand transition-colors placeholder:text-subtle"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-line rounded-xl px-4 py-3 text-sm text-fg bg-bg focus:outline-none focus:border-brand transition-colors placeholder:text-subtle"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-brand hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-subtle uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button
            type="button"
            onClick={demoLogin}
            disabled={demoLoading}
            className="w-full border border-brand text-brand py-3.5 rounded-xl font-semibold text-sm hover:bg-brand hover:text-white transition-colors disabled:opacity-60"
          >
            {demoLoading ? "Loading demo…" : "Try demo (no signup)"}
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
