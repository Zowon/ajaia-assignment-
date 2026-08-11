# DocEdit — Lightweight Collaborative Document Editor

A small full-stack document editor (Next.js + PostgreSQL) built for the Ajaia
Full Stack Product Engineer take-home. Supports document creation/editing
with rich text, file import, owner-based sharing, and persistence.

> **Note on deployment:** The application is deployed to Vercel and connected to a production Supabase PostgreSQL database. You can test the live URL at https://ajaia-assignment-drab.vercel.app.

## Stack

- **Framework:** Next.js 16 (App Router, JS, server components + API routes)
- **Editor:** TipTap (ProseMirror-based rich text editor)
- **Database:** PostgreSQL (via `pg`), hosted on Supabase (Serverless-friendly, scalable persistence)
- **Styling:** Tailwind CSS
- **File import:** `mammoth` (docx → HTML), custom lightweight markdown/text
  parsers for `.md` / `.txt`
- **Tests:** Vitest

## Quick start (local)

Requires Node 18+.

1. Create a PostgreSQL database (e.g. on Supabase).
2. Create a `.env` file from `.env.example` and fill in `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run the following commands:

```bash
npm install
npm run migrate
npm run dev
```

Open http://localhost:3000. You'll land on a login screen — auth is
intentionally mocked for this exercise (see ARCHITECTURE.md), so just pick
one of the three seeded demo users to continue. No password is required.

The PostgreSQL database is initialized and seeded with 3 demo users and one example document by running `npm run migrate`.

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
an isolated in-memory PostgreSQL emulator (`pg-mem`), not your dev data.

## Deploying (to get a live URL)

The application is natively stateless and ready to be deployed to Vercel or any other modern hosting provider.

1. Connect the repository to Vercel.
2. Add your `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel environment variables.
3. Deploy!

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
    db.js               PostgreSQL connection (pg pool)
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
- Persistence across refresh and server restart (PostgreSQL database)
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
1. Add optimistic concurrency / conflict warning when two editors save the
   same doc close together (currently last-write-wins silently)
3. Real-time presence indicators (who's viewing/editing right now) via
   WebSockets or a hosted realtime service
4. Export document to PDF/Markdown
5. Proper auth (e.g. NextAuth with email magic links) to replace the mock
# ajaia-assignment-
