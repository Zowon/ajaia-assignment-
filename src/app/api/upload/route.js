import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDocument } from "@/lib/documents";
import { importFile, SUPPORTED_EXTENSIONS } from "@/lib/import";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      {
        error: `Unsupported file type ".${ext}". Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { title, html } = await importFile(file.name, buffer);
    const doc = await createDocument(user.id, title, html);
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to import file" }, { status: 400 });
  }
}
