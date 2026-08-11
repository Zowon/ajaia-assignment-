"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import ShareDialog from "./ShareDialog";

const SAVE_DEBOUNCE_MS = 800;

function ToolbarButton({ onClick, active, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-indigo-100 text-indigo-700 shadow-sm"
          : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function Editor({ user, doc, initialShares }) {
  const router = useRouter();
  const [title, setTitle] = useState(doc.title);
  const [status, setStatus] = useState("saved"); // saved | saving | error
  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState(initialShares);
  const saveTimer = useRef(null);
  const canEdit = doc.role === "owner" || doc.role === "edit";

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing or type something amazing..." }),
    ],
    content: doc.content || "<p></p>",
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: () => scheduleSave(),
  });

  const scheduleSave = useCallback(() => {
    if (!canEdit) return;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DEBOUNCE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit]);

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  async function save(overrides = {}) {
    if (!canEdit) return;
    const content = overrides.content ?? editor?.getHTML();
    const nextTitle = overrides.title ?? title;
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, content }),
        keepalive: true,
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function onTitleChange(e) {
    setTitle(e.target.value);
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save({ title: e.target.value }), SAVE_DEBOUNCE_MS);
  }

  // Flush pending save on unmount / navigation away.
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveRef.current();
      }
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link href="/" className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <input
              value={title}
              onChange={onTitleChange}
              disabled={!canEdit}
              placeholder="Document Title"
              className="flex-1 text-2xl font-bold text-slate-900 bg-transparent outline-none disabled:opacity-80 placeholder:text-slate-300 focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-inner">
              <span className="relative flex h-2 w-2">
                {status === "saving" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === "saved" ? "bg-emerald-500" :
                  status === "saving" ? "bg-amber-500" : "bg-red-500"
                }`}></span>
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {status === "saving" && "Saving"}
                {status === "saved" && "Saved"}
                {status === "error" && "Error"}
              </span>
            </div>
            {doc.role === "owner" ? (
              <button
                onClick={() => setShareOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Share
              </button>
            ) : (
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200 bg-white rounded-lg px-3 py-2 shadow-sm">
                {doc.role} access
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="max-w-5xl mx-auto px-6 pb-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200/50 w-fit">
              <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
                <span className="font-bold">B</span>
              </ToolbarButton>
              <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <span className="italic font-serif">I</span>
              </ToolbarButton>
              <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <span className="underline">U</span>
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <ToolbarButton label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                H1
              </ToolbarButton>
              <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                H2
              </ToolbarButton>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <ToolbarButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </ToolbarButton>
              <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h12M7 12h12M7 17h12M4 7v.01M4 12v.01M4 17v.01" /></svg>
              </ToolbarButton>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-12 flex-1">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 min-h-full">
          <EditorContent editor={editor} className="prose prose-slate prose-lg max-w-none focus:outline-none" />
        </div>
      </main>

      {shareOpen && (
        <ShareDialog
          docId={doc.id}
          shares={shares}
          onShares={setShares}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
