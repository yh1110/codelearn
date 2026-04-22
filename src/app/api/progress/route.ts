import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_USER_ID = "local-user";

export async function GET() {
  const rows = await prisma.progress.findMany({
    where: { userId: LOCAL_USER_ID },
    select: { lessonId: true },
  });
  return Response.json({ lessonIds: rows.map((r) => r.lessonId) });
}
