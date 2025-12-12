import { notFound } from "next/navigation";
import { db, retrospectiveSessions } from "@/lib/db";
import { eq } from "drizzle-orm";
import { RetrospectiveClient } from "./retrospective-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RetrospectivePage({ params }: Props) {
  const { id } = await params;

  // Fetch session from database
  const [session] = await db
    .select()
    .from(retrospectiveSessions)
    .where(eq(retrospectiveSessions.id, id));

  if (!session) {
    notFound();
  }

  return <RetrospectiveClient session={session} />;
}
