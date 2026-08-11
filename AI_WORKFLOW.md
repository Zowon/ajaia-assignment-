# AI Workflow Note

## Which AI tools I used

Claude (via an agentic coding session with file/terminal access) for the
large majority of scaffolding, boilerplate, and first-draft implementation:
Next.js project setup, the SQLite schema and data-access layer, API routes,
the TipTap editor integration, the mocked auth/session cookie logic, the
markdown/docx import parsers, and the Vitest suite.

## Where AI materially sped up the work

- **Boilerplate and wiring**: Next.js App Router route structure, API route
  scaffolding, TipTap setup with the right extensions — this is exactly the
  kind of well-documented-pattern work where AI is fast and reliable, so I
  let it move quickly here rather than hand-typing every file.
- **The markdown-to-HTML mini-parser**: rather than pulling in a full
  markdown library and dealing with mismatched output formats against the
  editor's schema, generating a small purpose-built parser matched to
  exactly the formatting the editor supports was faster to get right with
  AI assistance than writing and debugging it by hand.
- **Test scaffolding**: writing the Vitest suite structure (imports, setup,
  the `beforeAll` pattern needed to isolate the in-memory test DB from the
  dev DB) so I could focus review time on whether the test *cases*
  themselves actually covered the permission model correctly, rather than
  on test plumbing.

## What I changed or rejected from AI-generated output

- The first pass of the permission-checking logic returned generic
  `Error` objects from `src/lib/documents.js`. I had it refactored into
  typed `NotFoundError` / `ForbiddenError` classes so the API layer could
  map them to correct HTTP status codes (404 vs 403) without string-
  matching error messages, which is fragile.
- The initial upload route accepted any file extension and just tried to
  read it as UTF-8 text, which would silently corrupt a `.docx` (a zipped
  binary format). I required an explicit allow-list of supported
  extensions with real per-type handling (`mammoth` for docx) and a clear
  rejection message for anything else, matching the assignment's
  instruction to state supported file types clearly if scope is limited.
- Initial layout pulled Google Fonts at build/runtime, which is a bad
  default for an environment where a reviewer's network might not reach
  Google's font CDN. I removed that dependency so the app works fully
  offline/self-hosted.
- I removed an unused `uuid` dependency the first scaffold pulled in, since
  `crypto.randomUUID()` (already available in Node) covers the same need
  with no extra dependency.

## How I verified correctness, UX quality, and implementation reliability

- **Build correctness**: ran `npm run build` after each major change to
  catch server/client component boundary issues and route errors before
  they became debugging sessions.
- **Functional correctness**: ran the app with `npm run start` and drove
  the real HTTP API end-to-end with `curl` for every core flow — login as
  two different seeded users, create a document, confirm a non-shared user
  gets a 403, share it, confirm the same user now gets edit access and can
  actually persist a change, and upload both a `.md` file (verifying the
  markdown parser output) and a deliberately unsupported file type
  (verifying the rejection path and error message).
- **Permission logic correctness**: wrote and ran an automated Vitest suite
  exercising the sharing/permission code directly (owner access, denied
  access, granted access, edit-vs-view enforcement, owner-only share/
  revoke, not-found handling) — this is the part of the app where a bug
  would be a real security issue, so it's the one place I wanted enforced
  test coverage rather than relying on manual curl checks alone.
- **UX review**: manually walked through the login → dashboard → create/
  upload → edit → share flow to confirm it reads coherently as a product,
  not just as a set of working endpoints — this is where I made the call
  to keep the toolbar minimal (7 formatting controls) rather than
  replicate a full Google Docs ribbon, in line with the assignment's
  instruction to prioritize depth over shallow breadth.

I did not run any AI-generated code in production without first reading it
and running it myself locally — the build/curl/test verification above was
done directly, not delegated to the AI's own claims about correctness.
