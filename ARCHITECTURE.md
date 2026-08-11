# Architecture Note

## Scope decisions

The brief explicitly rewards deliberate scope cuts over shallow full
coverage, so here's what I prioritized and why.

**Prioritized (core rubric items, done properly):**
- Document CRUD + rich text editing (TipTap) — this is the product's
  central value, so it got the most polish (toolbar, autosave, empty
  states).
- Server-side permission enforcement for sharing — every document read/
  write goes through `getDocumentForUser` / `updateDocument` in
  `src/lib/documents.js`, which checks ownership or share record before
  returning or mutating anything. This is tested directly (see
  `src/lib/__tests__/documents.test.js`), not just enforced by UI hiding.
- File import as a real product feature (creates an editable document),
  not just a raw upload placeholder.

**Deliberately cut or simplified:**
- **Auth is mocked.** Building real auth (password hashing, session
  expiry, CSRF, password reset) would have consumed a large share of the
  timebox for something orthogonal to what's being evaluated here (product
  judgment, editing UX, sharing logic, full-stack execution). Instead,
  "login" picks a seeded user and sets an httpOnly cookie. The sharing and
  permission code itself is fully real — it doesn't know or care that auth
  is mocked, so swapping in real auth later is a drop-in change to
  `src/lib/auth.js` only.
- **No real-time collaboration.** The brief lists this as an optional
  stretch, not core. Implementing operational transforms or CRDTs properly
  is a multi-day project on its own; doing a shallow version (e.g. naive
  polling) would have added complexity without adding real value. Editing
  uses debounced autosave with last-write-wins, which is simple, correct
  for the single-editor-at-a-time case the demo accounts exercise, and
  clearly labeled as a limitation.
- **Markdown import is a small custom parser, not a full CommonMark
  implementation.** It handles headings, bold/italic, and both list types —
  everything the editor itself supports — rather than pulling in a full
  markdown AST parser to handle edge cases (footnotes, tables, nested
  blockquotes) the editor can't even render. Matching parser scope to
  editor scope avoided doing throwaway work.
- **SQLite over Postgres/Supabase.** For a single-file take-home reviewed
  by cloning a repo and running it locally, a zero-config file database
  removes an entire category of "did the reviewer's environment variables
  work" failure modes. The data-access layer (`src/lib/db.js`,
  `src/lib/documents.js`) is isolated behind plain functions with no SQL
  leaking into routes or components, so swapping to Postgres later is a
  contained change, not a rewrite — noted explicitly in the README's
  deployment section since it does matter for a real multi-writer
  production deployment (SQLite's single-writer model is fine for a demo,
  not for real concurrent traffic).

## Data model

Three tables: `users`, `documents`, `shares`. `shares` is a join table
(document_id, user_id, permission) with a unique constraint on
(document_id, user_id) so re-sharing with the same user updates their
permission rather than creating duplicates. Permission is either `edit` or
`view`; the owner is implicit via `documents.owner_id` rather than a share
row, so there's always exactly one unambiguous owner per document.

## Request flow / validation

All document mutation goes through `src/lib/documents.js`, which throws
typed errors (`NotFoundError`, `ForbiddenError`) that the API routes map to
404/403 consistently. This keeps permission logic in one place instead of
duplicated across route handlers, and is what made it straightforward to
unit-test the permission model directly without spinning up HTTP or a
browser.

## What would change for a production version

1. Postgres instead of SQLite, for real concurrent-write support.
2. Real auth.
3. Optimistic concurrency control on document saves (currently silent
   last-write-wins) — likely a `version` column with a conditional update
   and a conflict UI.
4. Rate limiting / abuse protection on the upload endpoint beyond the
   current file-size and extension checks.
