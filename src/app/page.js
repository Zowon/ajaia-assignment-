import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents";
import Dashboard from "@/components/Dashboard";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { owned, shared } = await listDocumentsForUser(user.id);

  return <Dashboard user={user} owned={owned} shared={shared} />;
}
