import { notFound } from "next/navigation";
import LessonClient from "@/components/LessonClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCAL_USER_ID = "local-user";

export default async function LessonPage({
  params,
}: PageProps<"/courses/[slug]/lessons/[lessonSlug]">) {
  const { slug, lessonSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) notFound();

  const lesson = course.lessons[idx];
  const prev = idx > 0 ? course.lessons[idx - 1] : null;
  const next = idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;

  const completed = await prisma.progress.findUnique({
    where: {
      userId_lessonId: { userId: LOCAL_USER_ID, lessonId: lesson.id },
    },
    select: { id: true },
  });

  return (
    <LessonClient
      courseSlug={course.slug}
      courseTitle={course.title}
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        contentMd: lesson.contentMd,
        starterCode: lesson.starterCode,
        expectedOutput: lesson.expectedOutput,
      }}
      prevSlug={prev?.slug ?? null}
      nextSlug={next?.slug ?? null}
      initiallyCompleted={completed !== null}
    />
  );
}
