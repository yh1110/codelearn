import { requireAuth } from "@/lib/auth";
import { isKnownAppError } from "@/lib/errors";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const lessonIds = await getCompletedLessonIdsByUser(session.userId);
    return Response.json({ lessonIds });
  } catch (error) {
    if (isKnownAppError(error)) {
      return Response.json({ error: error.name }, { status: error.httpStatus });
    }
    throw error;
  }
}
