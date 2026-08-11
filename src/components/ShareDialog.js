"use client";

import { useState } from "react";

export default function ShareDialog({ docId, shares, onShares, onClose }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("edit");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addShare(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(`/api/documents/${docId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, permission }),
    });
    setBusy(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Could not share document");
      return;
    }
    onShares(body.shares);
    setEmail("");
  }

  async function removeShare(userId) {
    setBusy(true);
    const res = await fetch(`/api/documents/${docId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    setBusy(false);
    const body = await res.json().catch(() => ({}));
    if (res.ok) onShares(body.shares);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Share Document</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={addShare} className="flex gap-2 mb-2">
            <input
              type="email"
              required
              placeholder="user@ajaia.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 bg-white outline-none focus:border-indigo-500 transition-all"
            >
              <option value="edit">Can edit</option>
              <option value="view">Can view</option>
            </select>
            <button
              disabled={busy}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
              Share
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            People with access ({shares.length})
          </h3>
          {shares.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-slate-200/50 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-sm font-medium text-slate-500">This document is private</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {shares.map((s) => (
                <li key={s.user_id} className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-xs font-medium text-slate-500">
                        {s.email} · <span className="text-slate-700">{s.permission}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeShare(s.user_id)}
                    className="text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
