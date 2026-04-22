import { requireAuth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const rows = await prisma.progress.findMany({
      where: { userId: session.userId },
      select: { lessonId: true },
    });
    return Response.json({ lessonIds: rows.map((r) => r.lessonId) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
