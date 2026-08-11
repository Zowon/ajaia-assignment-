"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
      className={`px-2.5 py-1.5 rounded text-sm font-medium border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
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
      Placeholder.configure({ placeholder: "Start writing…" }),
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

  async function save(overrides = {}) {
    if (!canEdit) return;
    const content = overrides.content ?? editor?.getHTML();
    const nextTitle = overrides.title ?? title;
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, content }),
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
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-4">
          <a href="/" className="text-sm text-slate-400 hover:text-slate-700">
            ← Dashboard
          </a>
          <input
            value={title}
            onChange={onTitleChange}
            disabled={!canEdit}
            className="flex-1 text-lg font-semibold outline-none disabled:bg-transparent"
          />
          <span className="text-xs text-slate-400 w-16 text-right">
            {status === "saving" && "Saving…"}
            {status === "saved" && "Saved"}
            {status === "error" && "Error saving"}
          </span>
          {doc.role === "owner" ? (
            <button
              onClick={() => setShareOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
            >
              Share
            </button>
          ) : (
            <span className="text-xs uppercase tracking-wide text-slate-400 border border-slate-200 rounded px-2 py-1">
              {doc.role} access
            </span>
          )}
        </div>
        {canEdit && (
          <div className="max-w-4xl mx-auto px-6 pb-3 flex flex-wrap gap-1.5">
            <ToolbarButton
              label="Bold"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton
              label="Underline"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <span className="underline">U</span>
            </ToolbarButton>
            <ToolbarButton
              label="Heading 1"
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              label="Heading 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              label="Bulleted list"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              • List
            </ToolbarButton>
            <ToolbarButton
              label="Numbered list"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              1. List
            </ToolbarButton>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-6 flex-1">
        <EditorContent editor={editor} />
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
