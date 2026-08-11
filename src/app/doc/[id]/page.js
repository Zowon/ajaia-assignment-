import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocumentForUser, listSharesForDocument, NotFoundError, ForbiddenError } from "@/lib/documents";
import Editor from "@/components/Editor";

export default async function DocPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let doc;
  try {
    doc = await getDocumentForUser(id, user.id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    if (err instanceof ForbiddenError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-semibold mb-2">No access</h1>
            <p className="text-sm text-slate-500 mb-4">
              This document hasn&apos;t been shared with {user.name}.
            </p>
            <a href="/" className="text-sm text-slate-700 underline">
              Back to dashboard
            </a>
          </div>
        </div>
      );
    }
    throw err;
  }

  const shares = doc.role === "owner" ? await listSharesForDocument(id) : [];

  return <Editor user={user} doc={doc} initialShares={shares} />;
}
