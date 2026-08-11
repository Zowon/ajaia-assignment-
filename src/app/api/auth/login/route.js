import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { setCurrentUser } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { email } = body;
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Unknown demo user" }, { status: 404 });
  }
  await setCurrentUser(user.id);
  return NextResponse.json({ user });
}
