import { beforeAll, describe, expect, it, vi } from "vitest";
import { newDb } from "pg-mem";

// Mock pg module before db.js is imported
vi.mock("pg", () => {
  const mem = newDb();
  
  mem.public.none(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL);
    CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, owner_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE shares (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, permission TEXT NOT NULL DEFAULT 'edit', created_at TEXT NOT NULL, UNIQUE(document_id, user_id));
  `);
  
  mem.public.query(`
    INSERT INTO users (id, name, email) VALUES 
    ('u_amina', 'Amina', 'amina@ajaia.test'), 
    ('u_bilal', 'Bilal', 'bilal@ajaia.test'), 
    ('u_chen', 'Chen', 'chen@ajaia.test')
  `);

  return { Pool: mem.adapters.createPg().Pool };
});

let createDocument, updateDocument, shareDocument, revokeShare, getDocumentForUser;
let ForbiddenError, NotFoundError;

beforeAll(async () => {
  const documents = await import("../documents.js");
  createDocument = documents.createDocument;
  updateDocument = documents.updateDocument;
  shareDocument = documents.shareDocument;
  revokeShare = documents.revokeShare;
  getDocumentForUser = documents.getDocumentForUser;
  ForbiddenError = documents.ForbiddenError;
  NotFoundError = documents.NotFoundError;
});

const OWNER = "u_amina";
const EDITOR = "u_bilal";
const OUTSIDER = "u_chen";

describe("document sharing and permissions", () => {
  it("lets the owner create and read their own document", async () => {
    const doc = await createDocument(OWNER, "Test Doc", "<p>hello</p>");
    expect(doc.role).toBe("owner");
    expect(doc.title).toBe("Test Doc");

    const fetched = await getDocumentForUser(doc.id, OWNER);
    expect(fetched.content).toBe("<p>hello</p>");
  });

  it("blocks access for a user the document has not been shared with", async () => {
    const doc = await createDocument(OWNER, "Private Doc", "<p>secret</p>");
    await expect(getDocumentForUser(doc.id, OUTSIDER)).rejects.toThrow(ForbiddenError);
  });

  it("grants access once the owner shares with another user", async () => {
    const doc = await createDocument(OWNER, "Shared Doc", "<p>v1</p>");
    await shareDocument(doc.id, OWNER, EDITOR, "edit");

    const asEditor = await getDocumentForUser(doc.id, EDITOR);
    expect(asEditor.role).toBe("edit");
  });

  it("lets an editor update content but a viewer cannot", async () => {
    const doc = await createDocument(OWNER, "Editable Doc", "<p>v1</p>");
    await shareDocument(doc.id, OWNER, EDITOR, "edit");
    await shareDocument(doc.id, OWNER, OUTSIDER, "view");

    const updated = await updateDocument(doc.id, EDITOR, { content: "<p>v2</p>" });
    expect(updated.content).toBe("<p>v2</p>");

    await expect(updateDocument(doc.id, OUTSIDER, { content: "<p>should fail</p>" })).rejects.toThrow(ForbiddenError);
  });

  it("only allows the owner to share or revoke access", async () => {
    const doc = await createDocument(OWNER, "Owner Only", "<p>v1</p>");
    await shareDocument(doc.id, OWNER, EDITOR, "edit");

    await expect(shareDocument(doc.id, EDITOR, OUTSIDER, "edit")).rejects.toThrow(ForbiddenError);

    const shares = await revokeShare(doc.id, OWNER, EDITOR);
    expect(shares.find((s) => s.user_id === EDITOR)).toBeUndefined();
    await expect(getDocumentForUser(doc.id, EDITOR)).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError for a document that does not exist", async () => {
    await expect(getDocumentForUser("d_does_not_exist", OWNER)).rejects.toThrow(NotFoundError);
  });
});
