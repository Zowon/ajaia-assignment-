import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentsForUser, createDocument } from "@/lib/documents";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const docs = await listDocumentsForUser(user.id);
  return NextResponse.json(docs);
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const doc = await createDocument(user.id, body.title, body.content);
  return NextResponse.json(doc, { status: 201 });
}
