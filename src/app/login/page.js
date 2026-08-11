"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEMO_USERS = [
  { name: "Amina Rahman", email: "amina@ajaia.test" },
  { name: "Bilal Khan", email: "bilal@ajaia.test" },
  { name: "Chen Wei", email: "chen@ajaia.test" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  async function loginAs(email) {
    setLoading(email);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Login failed");
      setLoading(null);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold mb-1">DocEdit</h1>
        <p className="text-sm text-slate-500 mb-6">
          This demo uses mocked auth — pick a seeded user to continue. No password required.
        </p>
        <div className="space-y-2">
          {DEMO_USERS.map((u) => (
            <button
              key={u.email}
              onClick={() => loginAs(u.email)}
              disabled={loading !== null}
              className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
              {loading === u.email && (
                <div className="text-xs text-slate-400 mt-1">Logging in…</div>
              )}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
