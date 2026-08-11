"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
    <div className="flex-1 max-w-4xl w-full mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">DocEdit</h1>
          <p className="text-sm text-slate-500">
            Signed in as <span className="font-medium">{user.name}</span> ({user.email})
          </p>
        </div>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
          Log out
        </button>
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={createDoc}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          + New document
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
        >
          Upload file (.txt, .md, .docx)
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
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Your documents
        </h2>
        {owned.length === 0 ? (
          <p className="text-sm text-slate-400">No documents yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-lg overflow-hidden">
            {owned.map((d) => (
              <li key={d.id}>
                <a
                  href={`/doc/${d.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium">{d.title}</span>
                  <span className="text-xs text-slate-400">
                    Updated {formatDate(d.updated_at)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Shared with you
        </h2>
        {shared.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing has been shared with you yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-lg overflow-hidden">
            {shared.map((d) => (
              <li key={d.id}>
                <a
                  href={`/doc/${d.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <span className="font-medium">{d.title}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      shared by {d.owner_name} · {d.role} access
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Updated {formatDate(d.updated_at)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
