# DocEdit — Lightweight Collaborative Document Editor

A small full-stack document editor (Next.js + SQLite) built for the Ajaia
Full Stack Product Engineer take-home. Supports document creation/editing
with rich text, file import, owner-based sharing, and persistence.

> **Note on deployment:** this repo is ready to deploy in ~2 minutes (see
> below), but I did not have the ability to stand up a live URL from the
> environment I built it in. Please deploy it with one of the two options
> below to get a testable link — both are free and require no paid service.

## Stack

- **Framework:** Next.js 16 (App Router, JS, server components + API routes)
- **Editor:** TipTap (ProseMirror-based rich text editor)
- **Database:** SQLite via `better-sqlite3` (file-based, zero external
  services, works anywhere including hosts with a persistent disk)
- **Styling:** Tailwind CSS
- **File import:** `mammoth` (docx → HTML), custom lightweight markdown/text
  parsers for `.md` / `.txt`
- **Tests:** Vitest

## Quick start (local)

Requires Node 18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. You'll land on a login screen — auth is
intentionally mocked for this exercise (see ARCHITECTURE.md), so just pick
one of the three seeded demo users to continue. No password is required.

The SQLite database file is created automatically at `data/docedit.sqlite`
on first run, seeded with 3 demo users and one example document.

### Demo / seeded accounts

| Name         | Email              |
|--------------|--------------------|
| Amina Rahman | amina@ajaia.test   |
| Bilal Khan   | bilal@ajaia.test   |
| Chen Wei     | chen@ajaia.test    |

Amina owns the seeded "Welcome to DocEdit" document. Log in as Amina, hit
**Share**, and share it with `bilal@ajaia.test` to see the sharing flow in
both directions (log in as Bilal afterward to see it under "Shared with
you").

## Running tests

```bash
npm test
```

Covers the sharing/permission logic in `src/lib/documents.js`: owner access,
access-denied for un-shared users, share-grants working, edit-vs-view
enforcement, owner-only share/revoke, and not-found handling. Runs against
an isolated in-memory SQLite database, not your dev data.

## Deploying (to get a live URL)

**Option A — Vercel (fastest, ~2 min):**

```bash
npm install -g vercel
vercel --prod
```

One catch: Vercel's serverless filesystem is ephemeral, so the SQLite file
won't persist across deploys/cold starts there specifically. For this app
as-is, a host with a persistent disk is a better fit (Option B). To use
Vercel long-term, swap `better-sqlite3` for a hosted Postgres (e.g.
Supabase/Neon) — the data-access layer is isolated in `src/lib/db.js` and
`src/lib/documents.js`, so this is a contained change, not a rewrite.

**Option B — Render / Railway / Fly.io (persistent disk):**

1. Push this repo to GitHub.
2. Create a new Web Service, connect the repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Attach a small persistent volume mounted at `./data` so the SQLite file
   survives restarts.

## File upload support

Supported: `.txt`, `.md`, `.docx` (5MB limit). Anything else is rejected
with an explicit error message in the UI. This is stated here and in the
upload button label in the UI itself.

## Project structure

```
src/
  app/
    login/             mock login page
    page.js            dashboard (owned + shared documents)
    doc/[id]/          editor page
    api/               all backend routes (auth, documents, share, upload)
  components/           Dashboard, Editor, ShareDialog (client components)
  lib/
    db.js               SQLite connection, schema, seed data
    auth.js             mocked cookie-based session
    documents.js         document CRUD + sharing + permission checks
    import.js            file -> HTML conversion (.txt/.md/.docx)
    __tests__/           Vitest suite
```

## What's working vs. incomplete

**Working end to end:**
- Create, rename, edit (rich text), and reopen documents after refresh
- File upload/import for txt, md, docx into a new editable document
- Owner-based sharing with edit/view permission levels, enforced server-side
- Persistence across refresh and server restart (SQLite file)
- Basic validation (unsupported file types, size limit, auth checks) and
  error handling on all API routes
- Automated tests for the sharing/permission logic

**Intentionally deprioritized (see ARCHITECTURE.md for reasoning):**
- Real authentication (passwords, sessions with expiry) — mocked instead
- Real-time collaborative editing (multiple cursors, live sync) — last
  write wins on save instead
- Rich `.docx` round-trip export, only import is supported
- Full CommonMark markdown support — a small, common-case subset is
  implemented instead
- Document version history / undo beyond the browser's native undo

**What I'd build next with another 2-4 hours:**
1. Swap SQLite for Postgres and deploy properly on a platform with a stable
   live URL and persistent storage
2. Add optimistic concurrency / conflict warning when two editors save the
   same doc close together (currently last-write-wins silently)
3. Real-time presence indicators (who's viewing/editing right now) via
   WebSockets or a hosted realtime service
4. Export document to PDF/Markdown
5. Proper auth (e.g. NextAuth with email magic links) to replace the mock
# ajaia-assignment-
