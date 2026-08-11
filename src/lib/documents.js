import { db, newId } from "./db";

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

export async function listDocumentsForUser(userId) {
  const ownedRes = await db.query(
      `SELECT d.*, 'owner' as role FROM documents d
       WHERE d.owner_id = $1
       ORDER BY d.updated_at DESC`, [userId]
  );

  const sharedRes = await db.query(
      `SELECT d.*, s.permission as role, u.name as owner_name FROM documents d
       JOIN shares s ON s.document_id = d.id
       JOIN users u ON u.id = d.owner_id
       WHERE s.user_id = $1
       ORDER BY d.updated_at DESC`, [userId]
  );

  return { owned: ownedRes.rows, shared: sharedRes.rows };
}

export async function getDocumentForUser(docId, userId) {
  const docRes = await db.query("SELECT * FROM documents WHERE id = $1", [docId]);
  const doc = docRes.rows[0];
  if (!doc) throw new NotFoundError("Document not found");

  if (doc.owner_id === userId) {
    return { ...doc, role: "owner" };
  }

  const shareRes = await db.query(
      "SELECT * FROM shares WHERE document_id = $1 AND user_id = $2",
      [docId, userId]
  );
  const share = shareRes.rows[0];

  if (!share) throw new ForbiddenError("You do not have access to this document");

  return { ...doc, role: share.permission };
}

export async function createDocument(userId, title = "Untitled document", content = "") {
  const id = newId("d");
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
     [id, title.trim() || "Untitled document", content, userId, now, now]
  );
  return getDocumentForUser(id, userId);
}

export async function updateDocument(docId, userId, { title, content }) {
  const doc = await getDocumentForUser(docId, userId);
  if (doc.role !== "owner" && doc.role !== "edit") {
    throw new ForbiddenError("You do not have edit access to this document");
  }
  const now = new Date().toISOString();
  const nextTitle = title !== undefined ? title.trim() || "Untitled document" : doc.title;
  const nextContent = content !== undefined ? content : doc.content;
  await db.query(
    "UPDATE documents SET title = $1, content = $2, updated_at = $3 WHERE id = $4",
    [nextTitle, nextContent, now, docId]
  );
  return getDocumentForUser(docId, userId);
}

export async function shareDocument(docId, ownerId, targetUserId, permission = "edit") {
  const docRes = await db.query("SELECT * FROM documents WHERE id = $1", [docId]);
  const doc = docRes.rows[0];
  if (!doc) throw new NotFoundError("Document not found");
  if (doc.owner_id !== ownerId) {
    throw new ForbiddenError("Only the document owner can share it");
  }
  if (targetUserId === ownerId) {
    throw new Error("Cannot share a document with its owner");
  }
  const id = newId("s");
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO shares (id, document_id, user_id, permission, created_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(document_id, user_id) DO UPDATE SET permission = EXCLUDED.permission`,
     [id, docId, targetUserId, permission, now]
  );
  return listSharesForDocument(docId);
}

export async function revokeShare(docId, ownerId, targetUserId) {
  const docRes = await db.query("SELECT * FROM documents WHERE id = $1", [docId]);
  const doc = docRes.rows[0];
  if (!doc) throw new NotFoundError("Document not found");
  if (doc.owner_id !== ownerId) {
    throw new ForbiddenError("Only the document owner can modify sharing");
  }
  await db.query("DELETE FROM shares WHERE document_id = $1 AND user_id = $2", [
    docId,
    targetUserId
  ]);
  return listSharesForDocument(docId);
}

export async function listSharesForDocument(docId) {
  const res = await db.query(
      `SELECT s.*, u.name, u.email FROM shares s
       JOIN users u ON u.id = s.user_id
       WHERE s.document_id = $1
       ORDER BY u.name`, [docId]
  );
  return res.rows;
}
