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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={addShare} className="flex gap-2 mb-4">
          <input
            type="email"
            required
            placeholder="user@ajaia.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="border border-slate-300 rounded-lg px-2 text-sm"
          >
            <option value="edit">Can edit</option>
            <option value="view">Can view</option>
          </select>
          <button
            disabled={busy}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-50"
          >
            Share
          </button>
        </form>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          People with access
        </h3>
        {shares.length === 0 ? (
          <p className="text-sm text-slate-400">Not shared with anyone yet.</p>
        ) : (
          <ul className="space-y-2">
            {shares.map((s) => (
              <li key={s.user_id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-400">
                    {s.email} · {s.permission}
                  </div>
                </div>
                <button
                  onClick={() => removeShare(s.user_id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
