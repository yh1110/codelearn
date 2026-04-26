import { ContentCard } from "@/components/content/ContentCard";
import { OfficialBadge } from "@/components/content/OfficialBadge";
import { learnUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CourseWithLessons } from "@/repositories";
import { coverFor, glyphFor } from "./courseCover";

type Props = {
  course: CourseWithLessons;
  index: number;
  completedIds: Set<string>;
};

export function CourseCard({ course, index, completedIds }: Props) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => completedIds.has(l.id)).length;

  return (
    <ContentCard
      href={learnUrl(course)}
      title={course.title}
      description={course.description}
      cover={
        <div className={cn("cm-cover", coverFor(index))}>
          <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
            <span className="cm-diff-badge cm-diff-1">初級</span>
          </div>
          <span className="cm-cover-glyph" aria-hidden="true">
            {glyphFor(course.title)}
          </span>
        </div>
      }
      topBadge={<OfficialBadge size="sm" />}
      chips={
        <>
          <span className="cm-chip">#TypeScript</span>
          <span className="cm-chip">#基礎</span>
        </>
      }
      progress={{ done, total }}
      countLabel={{ count: total, suffix: "レッスン" }}
    />
  );
}
