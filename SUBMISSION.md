# SUBMISSION.md

## What's included in this folder

- `src/` — full application source (Next.js App Router, API routes,
  components, data-access layer, tests)
- `.env` / `.env.example` — environment variables for connecting to the PostgreSQL database
- `README.md` — setup, run, test, and deploy instructions; seeded demo
  accounts; what's working vs. incomplete
- `ARCHITECTURE.md` — scope decisions and why, data model, what would
  change for a production version
- `AI_WORKFLOW.md` — AI tools used, where they sped up the work, what was
  changed/rejected from AI output, how correctness was verified
- `package.json` / `package-lock.json` — dependencies and scripts
  (`npm run dev`, `npm run build`, `npm start`, `npm test`)

## Not included / still needed before final review

- **Live deployment URL**: Done! The application is deployed to Vercel and connected to a production Supabase PostgreSQL instance. You can test it here: https://ajaia-assignment-drab.vercel.app
- **Walkthrough video**: not recorded from this environment. The app is
  fully runnable locally (`npm install && npm run dev`) for recording a
  walkthrough covering: login as a seeded user → create/upload a document →
  edit with rich text formatting → rename → share with a second seeded user
  → log in as that user to see it under "Shared with you" → confirm
  permission enforcement (a third, unshared user gets no access).
- **Google Drive folder**: this is local source; upload the folder contents
  (excluding `node_modules/` and `.env`) to Drive as part of final
  submission packaging.

## Status of core requirements

| Requirement | Status |
|---|---|
| Document creation/editing/rename/save/reopen | Done, verified end-to-end |
| Rich text (bold/italic/underline/headings/lists) | Done |
| File upload (.txt/.md/.docx -> new document) | Done, verified with valid and invalid file types |
| Sharing (owner, grant access, owned vs shared distinction) | Done, verified with automated tests + manual curl walkthrough |
| Persistence (PostgreSQL via Supabase) | Done |
| README with setup/run instructions | Done (this folder) |
| Architecture note | Done (`ARCHITECTURE.md`) |
| AI workflow note | Done (`AI_WORKFLOW.md`) |
| At least one automated test | Done — 6 tests in `src/lib/__tests__/documents.test.js`, all passing |
| Live deployment link | Done — https://ajaia-assignment-drab.vercel.app |
| Walkthrough video | **Outstanding** — needs to be recorded against a running instance |
