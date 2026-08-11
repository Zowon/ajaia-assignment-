"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DEMO_USERS = [
  { name: "Amina Rahman", email: "amina@ajaia.test", role: "Product Manager" },
  { name: "Bilal Khan", email: "bilal@ajaia.test", role: "Software Engineer" },
  { name: "Chen Wei", email: "chen@ajaia.test", role: "Designer" },
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
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">DocEdit</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8 font-medium">
          Choose a demo profile to enter the workspace.
        </p>
        <div className="space-y-3">
          {DEMO_USERS.map((u) => (
            <button
              key={u.email}
              onClick={() => loginAs(u.email)}
              disabled={loading !== null}
              className="w-full group text-left px-5 py-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{u.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  {loading === u.email ? (
                    <div className="text-xs font-semibold text-indigo-600 animate-pulse">Connecting</div>
                  ) : (
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-6 p-3 rounded-xl bg-red-50 text-sm text-red-600 font-medium border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
