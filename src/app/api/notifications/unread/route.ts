import { requireAuth } from "@/lib/auth";
import { isKnownAppError } from "@/lib/errors";
import { getUnreadCount } from "@/services/notificationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const count = await getUnreadCount(session.userId);
    return Response.json({ count });
  } catch (error) {
    if (isKnownAppError(error)) {
      return Response.json({ error: error.name }, { status: error.httpStatus });
    }
    throw error;
  }
}
