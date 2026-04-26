import { MIN_QUERY_LENGTH } from "@/config/search";
import { requireAuth } from "@/lib/auth";
import { search } from "@/services/searchService";
import { EmptyState } from "./_components/EmptyState";
import { SearchSectionCommunity } from "./_components/SearchSectionCommunity";
import { SearchSectionOfficial } from "./_components/SearchSectionOfficial";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  await requireAuth();
  const sp = await searchParams;
  const rawQuery = firstParam(sp?.q);
  const { query, tooShort, courses, lessons, collections, problems } = await search(rawQuery);
  const hasQuery = query.length > 0;
  const totalHits = courses.length + lessons.length + collections.length + problems.length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <Header query={query} hasQuery={hasQuery && !tooShort} totalHits={totalHits} />

      {!hasQuery ? (
        <EmptyState
          title="検索キーワードを入力してください"
          description="上部の検索バーにコース名やレッスン名、本文のキーワードを入力して Enter。"
        />
      ) : tooShort ? (
        <EmptyState
          title={`${MIN_QUERY_LENGTH} 文字以上で検索してください`}
          description="短すぎるキーワードは検索対象外です。"
        />
      ) : totalHits === 0 ? (
        <EmptyState
          title={`「${query}」に一致する結果はありません`}
          description="別のキーワードで検索してみてください。"
        />
      ) : (
        <div className="flex flex-col gap-12">
          <SearchSectionOfficial courses={courses} lessons={lessons} />
          <SearchSectionCommunity collections={collections} problems={problems} />
        </div>
      )}
    </div>
  );
}

function Header({
  query,
  hasQuery,
  totalHits,
}: {
  query: string;
  hasQuery: boolean;
  totalHits: number;
}) {
  return (
    <header className="mb-7">
      <h1 className="m-0 font-bold text-[26px] tracking-tight">検索結果</h1>
      {hasQuery ? (
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          <span className="cm-mono" style={{ color: "var(--text-1)" }}>
            {query}
          </span>{" "}
          の結果 <b style={{ color: "var(--text-1)" }}>{totalHits}</b> 件
        </p>
      ) : null}
    </header>
  );
}
