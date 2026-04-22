@.claude/rules/architecture.md
@.claude/rules/tech-stack.md
@.claude/rules/react-nextjs.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# codelearn — AI エージェント向け Index

このファイルは **AI コーディングエージェント（Claude / Cursor 等）向けの入口** である。人間のための README ではない。詳細なルールは `.claude/rules/` 配下に分割されている。本ファイルはプロジェクトの概要と、どのルールをどの順で読むかの案内に徹する。

---

## 1. プロジェクト概要

- **codelearn** は Progate 風の TypeScript 学習プラットフォーム。
- ブラウザ上の Monaco Editor で TS を書き、サーバー側 `tsx` で実行、期待出力と突き合わせて自動判定する。
- フェーズは **PoC / MVP**。
- 認証は未導入（Supabase 導入予定）。現状 `userId` は `"local-user"` 固定。
- 現スタック: Next.js 16.2.4 (App Router, Turbopack) / React 19 / Tailwind v4 / Prisma 7 (driver adapter: `@prisma/adapter-pg`) / PostgreSQL 16 (Docker, port 5434) / Monaco Editor / zod。

---

## 2. Next.js 16 に関する注意

Next.js 16 は破壊的変更を含む。training data の知識で書かない。必ず `node_modules/next/dist/docs/` を該当トピックごとに読んでから実装する。deprecation 警告が出たら無視せずに対応する。

---

## 3. ルール一覧（`.claude/rules/`）

冒頭の `@.claude/rules/*` で Claude Code セッションに常時 include される。

| ファイル | 内容 |
| :-- | :-- |
| [`.claude/rules/architecture.md`](./.claude/rules/architecture.md) | 5 レイヤードアーキテクチャ（Presentation / API / Service / Repository / Data）、`src/` 11 ディレクトリ固定、認証方針（middleware + `(protected)` + `requireAuth`/`requireRole`）、DB / Prisma 規約、Import 順、コード例 |
| [`.claude/rules/tech-stack.md`](./.claude/rules/tech-stack.md) | 採用ライブラリ（zustand / swr / next-safe-actions / prisma / supabase / tailwind + shadcn / biome / playwright + vitest / nuqs / server-only）と各ライブラリの使い分け、現状コードとの乖離についての注記 |
| [`.claude/rules/react-nextjs.md`](./.claude/rules/react-nextjs.md) | React / Next.js の書き方規約: Server / Client Component の使い分け、`useEffect` ポリシー（禁止パターン + 正例）、Form Handling（RHF + Zod + Server Action）、Zustand + SWR 合成フック、Accessibility、パフォーマンス最適化 |

---

## 4. AI エージェントが作業前に読む順序

1. **本ファイル（`CLAUDE.md`）** — プロジェクト概要と Next.js 16 警告を頭に入れる。
2. **`.claude/rules/tech-stack.md`** — どのライブラリを何に使うかを確認する。未導入ライブラリがあることを認識する。
3. **`.claude/rules/architecture.md`** — レイヤー構造・ディレクトリ規約・認証・DB 規約を確認する。これが実装の拘束条件になる。
4. **`.claude/rules/react-nextjs.md`** — React / Next.js の書き方（Server Component 優先、`useEffect` 制限、Form は RHF + Zod + Server Action 等）を確認する。
5. **該当コード** — 編集対象のディレクトリで `ls` / `grep` を走らせ、既存パターンを確認する。一般的な TS/Node ベストプラクティス（`utils/`, `helpers/`, `mappers/` 等）を **ルールより優先しない**。

## 5. 実装時の絶対条件（要約）

詳細は `.claude/rules/*` を参照。ここは抜粋。

- Server 専用ファイルには `import 'server-only';` を置く。
- Prisma Client を利用してよいのは `src/repositories/**` のみ（singleton 定義元 `src/lib/prisma.ts` だけ例外）。
- Service から prisma を直接 import しない。`@/repositories` 経由で repository を使う。
- Action は `try-catch` → `requireAuth`/`requireRole` → `zod.parse` → service 委譲 → `revalidatePath` → 型付き response の順を守る。
- Client から直接 `fetch('/api/...')` で write しない。write は Server Action。
- `src/` 直下ディレクトリは 11 種類（`actions, app, components, config, hooks, lib, repositories, services, stores, types, utils`）以外を作らない。
- 既存コードが Prisma を直叩きしていても **踏襲しない**。新規コードは必ず Repository → Service → (Action or Server Component) を経由する。

## 6. 未導入ライブラリの扱い

該当ライブラリが未 install の場合、勝手に install しない。まず **どのバージョンで何を追加するか** をユーザーに確認する（特に supabase / biome / playwright は周辺設定を伴う）。スタックの方針と既存コードが矛盾する場合、**方針を正とし、段階的に寄せる変更** を提案する。一度に全面書き換えをしない。
