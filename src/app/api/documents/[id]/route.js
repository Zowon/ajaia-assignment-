import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getDocumentForUser,
  updateDocument,
  listSharesForDocument,
  NotFoundError,
  ForbiddenError,
} from "@/lib/documents";

function handleError(err) {
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
}

export async function GET(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { id } = await params;
    const doc = await getDocumentForUser(id, user.id);
    const shares = doc.role === "owner" ? await listSharesForDocument(id) : [];
    return NextResponse.json({ ...doc, shares });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (body.title !== undefined && typeof body.title !== "string") {
      return NextResponse.json({ error: "title must be a string" }, { status: 400 });
    }
    if (body.content !== undefined && typeof body.content !== "string") {
      return NextResponse.json({ error: "content must be a string" }, { status: 400 });
    }
    const doc = await updateDocument(id, user.id, body);
    return NextResponse.json(doc);
  } catch (err) {
    return handleError(err);
  }
}
