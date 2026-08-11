import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import {
  shareDocument,
  revokeShare,
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
  return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 400 });
}

export async function POST(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (!body.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const target = await getUserByEmail(body.email);
    if (!target) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
    }
    const permission = body.permission === "view" ? "view" : "edit";
    const shares = await shareDocument(id, user.id, target.id, permission);
    return NextResponse.json({ shares });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const shares = await revokeShare(id, user.id, userId);
    return NextResponse.json({ shares });
  } catch (err) {
    return handleError(err);
  }
}
