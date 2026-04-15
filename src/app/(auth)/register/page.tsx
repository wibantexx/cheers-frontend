"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "", age: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", { ...form, age: Number(form.age) });
      toast.success("Check your email to verify your account!");
      router.push("/login");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      if (Array.isArray((data as { detail?: unknown })?.detail)) {
        toast.error(
          ((data as { detail: { msg: string }[] }).detail[0]?.msg ?? "Error").replace("Value error, ", "")
        );
      } else {
        toast.error(
          (data as { detail?: string })?.detail ?? "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-[#8B1A2E] font-bold block text-center mb-10">
          Cheers
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E0D8] p-8">
          <h1 className="font-display text-2xl text-[#1C1917] mb-1">Join Cheers</h1>
          <p className="text-[#78716C] text-sm mb-8">Create your free account</p>

          <form onSubmit={submit} className="space-y-4">
            {[
              { key: "email" as const, label: "Email", type: "email", placeholder: "you@example.com" },
              { key: "username" as const, label: "Username", type: "text", placeholder: "your_name" },
              { key: "password" as const, label: "Password", type: "password", placeholder: "Min 8 chars, 1 uppercase, 1 number" },
              { key: "age" as const, label: "Age", type: "number", placeholder: "18+" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wide block mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={field(key)}
                  min={key === "age" ? 18 : undefined}
                  className="w-full border border-[#E8E0D8] rounded-xl px-4 py-3 text-sm text-[#1C1917] bg-[#FAF5EF] focus:outline-none focus:border-[#8B1A2E] transition-colors placeholder:text-[#C4BAB2]"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A2E] text-[#FAF5EF] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#5C1020] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716C] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#8B1A2E] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
