"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.post("/api/v1/auth/verify-email", { token })
      .then(() => { setStatus("success"); setTimeout(() => router.push("/login"), 2500); })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="font-display text-2xl text-[#8B1A2E] font-bold mb-10">Cheers</div>
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-[#E8E0D8] border-t-[#8B1A2E] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#78716C]">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🥂</div>
            <h1 className="font-display text-2xl text-[#1C1917] mb-2">Email verified!</h1>
            <p className="text-[#78716C] text-sm">Redirecting you to sign in…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">😕</div>
            <h1 className="font-display text-2xl text-[#1C1917] mb-2">Link invalid</h1>
            <p className="text-[#78716C] text-sm mb-6">The link may have expired or already been used.</p>
            <Link href="/login" className="text-[#8B1A2E] font-medium hover:underline text-sm">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
