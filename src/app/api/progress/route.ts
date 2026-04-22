import { requireAuth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const lessonIds = await getCompletedLessonIdsByUser(session.userId);
    return Response.json({ lessonIds });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
