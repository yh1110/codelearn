import { z } from "zod";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_USER_ID = "local-user";

const Body = z.object({
  lessonId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  await prisma.progress.upsert({
    where: {
      userId_lessonId: { userId: LOCAL_USER_ID, lessonId: parsed.data.lessonId },
    },
    update: {},
    create: { userId: LOCAL_USER_ID, lessonId: parsed.data.lessonId },
  });

  return Response.json({ ok: true });
}

export async function GET() {
  const rows = await prisma.progress.findMany({
    where: { userId: LOCAL_USER_ID },
    select: { lessonId: true },
  });
  return Response.json({ lessonIds: rows.map((r) => r.lessonId) });
}
