"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DocIcon({ shared }) {
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${shared ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {shared ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        )}
      </svg>
    </div>
  );
}

export default function Dashboard({ user, owned, shared }) {
  const router = useRouter();
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createDoc() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled document", content: "" }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not create document");
      return;
    }
    const doc = await res.json();
    router.push(`/doc/${doc.id}`);
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Upload failed");
      e.target.value = "";
      return;
    }
    const doc = await res.json();
    router.push(`/doc/${doc.id}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 relative z-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">DocEdit</h1>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-6">
            Welcome back, {user.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 mt-1">Manage your documents and collaborate with your team.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-600 font-medium">{user.email}</span>
          </div>
          <button onClick={logout} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 mb-12">
        <button
          onClick={createDoc}
          disabled={busy}
          className="group relative px-6 py-3 flex items-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative z-10">New Document</span>
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import File
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".txt,.md,.docx"
          onChange={onUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 text-sm text-red-600 font-medium border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Documents</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{owned.length}</span>
          </div>
          
          {owned.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-slate-500 font-medium">You haven't created any documents yet.</p>
              <button onClick={createDoc} className="mt-3 text-indigo-600 font-semibold hover:text-indigo-700">Create one now &rarr;</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owned.map((d) => (
                <Link
                  key={d.id}
                  href={`/doc/${d.id}`}
                  className="group block p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <DocIcon shared={false} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{d.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Updated {formatDate(d.updated_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Shared With You</h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{shared.length}</span>
          </div>
          
          {shared.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
              <p className="text-slate-500 font-medium">No documents have been shared with you yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shared.map((d) => (
                <Link
                  key={d.id}
                  href={`/doc/${d.id}`}
                  className="group block p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {d.role}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <DocIcon shared={true} />
                    <div className="flex-1 min-w-0 pr-12">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">{d.title}</h3>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs text-slate-500 font-medium truncate">By {d.owner_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Updated {formatDate(d.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
