# Arcode

**Arcode** は TypeScript 学習プラットフォーム。公式 curated コース (Course / Lesson) と、ユーザー作成の問題集 (Collection / Problem) の両方を持ち、ブラウザ上のエディタで TypeScript を書き **そのままブラウザ内で transpile / 実行** して結果を期待出力と突き合わせる。

> 旧ブランド名は **codeMaker / codelearn**。GitHub リポジトリ名は引き続き `codelearn` (歴史的経緯)。

## 技術スタック

| 役割 | 採用 |
|-----|------|
| フレームワーク | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| スタイル | Tailwind CSS v4 + shadcn/ui (base-nova preset) + lucide-react |
| ダークモード | 基本ダーク固定 (`<html className="dark">` / `colorScheme: "dark"`) |
| DB / ORM | **Supabase Postgres** + Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| エディタ | Monaco Editor |
| TS 実行 | **ブラウザ内** (`esbuild-wasm` で transpile → iframe `sandbox` で実行 → `postMessage` で stdout/stderr 回収) |
| Mutation | Server Actions + `next-safe-action` |
| Client Read | SWR |
| 認証 / BaaS | Supabase Auth (GitHub / Google OAuth) + Prisma Edge proxy、`(protected)` ルートグループ |
| Linter / Formatter | biome (ESLint / Prettier は使わない) |
| CI | GitHub Actions (biome check + tsc + prisma migrate diff) |
| Code Review Bot | [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action) (`@claude` mention + PR opened 時の自動レビュー) |

### 未導入 (`.claude/rules/tech-stack.md` に方針記載)

zustand / playwright / vitest / nuqs

(`server-only`, `react-hook-form`, `@hookform/resolvers`, `lucide-react` は導入済み)

### AI エージェント向けルール

本リポジトリは AI エージェント (Claude Code / Cursor 等) 前提の設計で、ルールを `.claude/rules/` 以下に分離している:

- [`.claude/rules/architecture.md`](./.claude/rules/architecture.md) — 5 層アーキテクチャ / `src/` 11 ディレクトリ固定 / 認証方針 / DB 規約 / Import 順
- [`.claude/rules/tech-stack.md`](./.claude/rules/tech-stack.md) — 各ライブラリの使い分け / 未導入の扱い
- [`.claude/rules/react-nextjs.md`](./.claude/rules/react-nextjs.md) — Server/Client Component の切り分け / `useEffect` ポリシー / Form は RHF + Zod + Server Action / SWR パターン

`CLAUDE.md` が `@.claude/rules/*` で全部 include する構成。

## 前提条件

- Node.js **>= 20.12.0** (`process.loadEnvFile` 依存)
- npm
- Supabase アカウント (無料プランで OK)
- GitHub / Google OAuth アプリ (Supabase Dashboard → Authentication → Providers で有効化)
- Docker (ローカルでの `prisma migrate dev` 用 shadow database のみ。ランタイム DB は Supabase)

> **Docker の役割**: 以前はアプリ DB 本体を Docker Postgres で動かしていたが、本番は Supabase Postgres に統一済み。現在 `docker-compose.yml` が起動する Postgres (`codelearn-shadow-db`) は **`prisma migrate dev` の shadow database 専用**。Supabase はホスト側で shadow DB を作らせてくれないため、ローカル Docker を shadow として使う。`migrate dev` を走らせないなら不要。

## セットアップ

### 1. Supabase プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) で **New project** を作成する。Region は **`Northeast Asia (Tokyo)`** 推奨。DB パスワードを控える。
2. **Project Settings → API Keys** から新形式のキーを控える (Legacy JWT `anon` / `service_role` ではなく、`sb_publishable_...` / `sb_secret_...` を使う):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY` (server-only、漏らさない)
3. **Project Settings → Database → Connection string** から以下を控える:
   - **Transaction pooler** (port 6543、`pgbouncer=true`) → `DATABASE_URL` (runtime クエリ用)
   - **Direct connection** (port 5432) → `DIRECT_URL` (`prisma db push` / migrate / seed 用)

#### DB password に特殊文字が入る場合

`,` / `@` / `/` などが入っていると URL パースで壊れることがあるので [URL-encode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) する (`,` → `%2C` など)。

### 2. `.env` を作る

```bash
cp .env.example .env
```

Supabase Dashboard で控えた値を `.env` に貼る。

### 3. DB スキーマ反映 + seed

本リポジトリは **`prisma migrate` ベース**で DB スキーマを管理する (PR #36 以降)。`db:push` は本番運用では使わない。

#### 3-a. 初回セットアップ (既存 Supabase プロジェクトに baseline)

既に本番 Supabase DB にテーブルが存在する状態で migration 管理を始めるケース。`prisma/migrations/` 配下の baseline migration を「適用済み」として `_prisma_migrations` テーブルに記録する。

```bash
npm install
# baseline 名は prisma/migrations/ 配下のディレクトリ名 (例: 20260423052541_init)
npx prisma migrate resolve --applied <baseline_migration_name>
npm run db:seed
```

これで Supabase DB に対して schema は触らずに「この migration は適用済み」とマークだけされる。以降 schema 変更は `npm run db:migrate` で管理できる。

#### 3-b. クリーンな Supabase プロジェクトで初めから migrate を使う場合

```bash
npm install
npm run db:migrate:deploy   # prisma/migrations/ の全 migration を DB に apply
npm run db:seed
```

#### 3-c. schema 変更 (日常の開発フロー)

```bash
npm run db:up                              # shadow DB (Docker Postgres) を起動
# prisma/schema.prisma を編集
npm run db:migrate -- --name <description> # migration ファイル生成 + shadow → 本番 DB に apply
git add prisma/migrations/<新規ディレクトリ>
git commit -m "feat(prisma): <description>"
```

`db:migrate` (`prisma migrate dev`) は:

1. ローカル Docker の **shadow DB** に対して「現 schema までの migration を再生 → 新 schema との diff を生成」
2. 新しい migration ファイルを `prisma/migrations/<timestamp>_<name>/migration.sql` に書き出す
3. `DIRECT_URL` 先 (Supabase) にその migration を apply する

#### 3-d. 本番 deploy

CI または `vercel build` 前に必ず `npm run db:migrate:deploy` を走らせる (未適用 migration を apply する、新規 migration を生成しない安全なコマンド)。

> **`db:push` の扱い**: ローカルでの schema 実験 / `--force-reset` で shadow DB をクリーンアップする用途のみ。**本番 Supabase DB に対しては使わない** (migration 履歴と乖離する)。`db:reset` / `db:migrate:reset` も同様で、Supabase 本番 DB に流すとデータが全消えする。

> **pgbouncer hang について**: Prisma schema engine が pooler (`?pgbouncer=true`, port 6543) 経由の接続で stuck することがあるため、`prisma.config.ts` は **`DIRECT_URL` (port 5432)** を schema engine に使わせている。runtime クエリは引き続き `DATABASE_URL` (pooler) を driver adapter 経由で使う。

### 4. 認証 trigger SQL の適用 (必須 + 再適用が必要)

`auth.users` (Supabase Auth 管理) → `public.profiles` (Prisma 管理) を同期させる trigger を適用する。**この trigger は Prisma migration の管理外** (Prisma schema が表現できない `auth` スキーマ側への CREATE TRIGGER のため) なので、migration とは別に手動で流す。

**`Profile` の構造 (列追加・列削除・列リネーム) を変えたら、その都度 trigger SQL も追従させて再適用する** (冪等な書き方なので何度流しても OK)。

適用方法:

```bash
# psql がローカルにあれば
psql "$DIRECT_URL" -f prisma/sql/001_profiles_trigger.sql
```

```bash
# psql 不要、Node の pg client 経由で適用するワンライナー
node --env-file=.env -e "import('pg').then(async ({default: pg}) => {
  const c = new pg.Client({connectionString: process.env.DIRECT_URL});
  const sql = require('fs').readFileSync('prisma/sql/001_profiles_trigger.sql','utf8');
  await c.connect(); await c.query(sql); await c.end(); console.log('applied');
});"
```

または **Supabase Dashboard → SQL Editor** に `prisma/sql/001_profiles_trigger.sql` の内容を貼って Run。既存ユーザーが居ても `ON CONFLICT DO NOTHING` で安全。

> **trigger が古い形のまま** だと sign-in 時に `auth.users` への INSERT がトリガで rollback され、OAuth callback が `code` を取得できず「認証コードがありません」エラーが出る。Profile schema を変えたら **真っ先に再適用**。

Supabase Dashboard で **Authentication → URL Configuration** を以下に設定:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

### 5. RLS を有効化 (推奨)

Supabase Dashboard の SQL Editor で以下を実行 (table 名はすべて plural / snake_case):

```sql
ALTER TABLE public.courses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_problems    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handle_reservations  ENABLE ROW LEVEL SECURITY;
-- profiles は trigger SQL 内で既に有効化済
```

policy は追加しない = ブラウザから publishable key で Supabase API を叩いても空配列しか返らなくなる。Prisma (postgres ロール) は RLS bypass なので従来通り動く。Defense in depth。

### 6. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` を開く。未ログインなら `/login` にリダイレクトされる。GitHub / Google でサインインすると `/auth/callback` を経由して **UGC コミュニティトップ (`/`)** に戻る。`/learn` は公式コース一覧。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Next.js 開発サーバー |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクション起動 |
| `npm run db:up` / `db:down` | ローカル shadow DB (Docker Postgres) の起動 / 停止 (`migrate dev` 用) |
| `npm run db:migrate` | schema 変更 → 新規 migration 生成 → `DIRECT_URL` に apply (日常の開発) |
| `npm run db:migrate:deploy` | 未適用 migration のみを apply (本番 / CI 用、新規生成しない) |
| `npm run db:migrate:status` | 適用済み migration の状況を表示 |
| `npm run db:migrate:reset` | **危険**: 全 migration を wipe して再適用。shadow / ローカル以外に使わない |
| `npm run db:push` | **ローカル shadow DB 実験専用**。本番 Supabase には使わない (migration 履歴と乖離する) |
| `npm run db:seed` | サンプルコース / レッスン投入 |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | **危険**: `db:push --force-reset` 経由で DB を全消し。本番 Supabase には絶対使わない |
| `npm run check` / `check:fix` | biome (lint + format) |
| `npm run format` / `format:fix` | biome format |
| `npm run lint` | biome lint |

> `db:up` / `db:down` は **shadow DB 用** (Docker Postgres)。`prisma migrate dev` を走らせる前に `db:up` で起動しておく。アプリケーションのランタイム DB ではない。

## ディレクトリ構成 (`src/` 11 ディレクトリ固定)

詳細は `.claude/rules/architecture.md § 2`。要点:

```
src/
├── actions/                    # Server Actions (next-safe-action の actionClient 経由)
├── app/
│   ├── (protected)/            # 要 Supabase Auth ルートグループ
│   │   ├── page.tsx            #   /  : UGC explore (Collection 一覧)
│   │   ├── learn/[course]/[lesson]/page.tsx   # 公式 (Course / Lesson)
│   │   ├── search/, notifications/, settings/profile/
│   │   ├── dashboard/collections/             # UGC クリエイター画面
│   │   ├── [handle]/                          # /{handle} : プロフィール (自他統一、isOwner 判定)
│   │   │   ├── bookmarks/                     #   /{handle}/bookmarks
│   │   │   └── [collection]/[problem]/        #   UGC コレクション / 問題
│   │   └── _components/                       # (protected) 共有 UI (TopBar 等)
│   ├── auth/{callback,signout}/route.ts
│   ├── login/page.tsx
│   ├── api/                                   # GET 専用 (mutation は Server Action)
│   ├── error.tsx / global-error.tsx / not-found.tsx
│   └── layout.tsx / globals.css
├── components/
│   ├── ui/                                    # shadcn/ui プリミティブ
│   ├── content/{ContentCard,OfficialBadge}.tsx
│   ├── profile/HandleLink.tsx
│   └── problem-solver/{ProblemSolver,useProblemRunner}
│                                              # 公式 Lesson と UGC Problem の共通エディタ (#77)
├── config/                                    # 集約定数 (constants / heatmap / search 等、#62 で集約)
├── hooks/                                     # SWR + zustand 合成 hook (将来用)
├── lib/                                       # prisma / supabase / auth / errors / logging / routes / safe-action / fetcher / reservedNames
├── repositories/                              # BaseRepository 継承、唯一の Prisma 直触り層
├── services/                                  # 純関数 + authorGuard (ensureAuthorOwnsCollection 等)
├── stores/                                    # (zustand 未導入)
├── types/
└── utils/
src/proxy.ts                    # Next.js 16 proxy: Supabase セッション cookie refresh
prisma/
├── schema.prisma               # 後述データモデル参照
├── seed.ts
├── migrations/                 # Prisma Migrate 履歴 (git 管理)
└── sql/001_profiles_trigger.sql # auth.users → profiles 同期 trigger (migrate 管理外、手動適用)
prisma.config.ts                # Prisma 7: schema engine 用 DIRECT_URL + shadow DB 設定
.github/workflows/{ci,claude,claude-code-review}.yml
```

## データモデル

公式とユーザー作成 (UGC) を **テーブルレベルで分離** (`#71`):

| ドメイン | 公式 (table) | UGC (table) |
|---|---|---|
| 学習トラック | `courses` | `collections` |
| 問題・レッスン | `lessons` | `problems` |
| ブックマーク | `bookmark_courses` / `bookmark_lessons` | `bookmark_collections` / `bookmark_problems` |
| 進捗 | `progress` (LessonProgress) | `problem_progress` |

UGC 限定で持つ列: `authorId` (= `Profile.id` cuid)、`@@unique([authorId, slug])`。公式は `slug @unique` (global unique)、author 不要。

### Profile (`profiles`)

| 列 | 型 | 役割 |
|---|---|---|
| `id` | cuid (TEXT) | アプリ層の primary key、全 FK の参照先 |
| `authUserId` | UUID @unique | `auth.users.id` への参照 (auth と DB の連携) |
| `handle` | TEXT @unique | URL 用ハンドル (mutable、変更時は `handle_reservations` で 90 日 reservation) |
| `name`, `avatarUrl`, `bio` | nullable | 表示用 |

`email` は持たない (auth.users に集約、アプリ層に流通させない)。auth UUID と Profile.id を分離した狙いは: (a) auth provider 差し替え耐性、(b) auth UUID が API レスポンスに漏出しない設計。

### URL 名前空間 (`.claude/rules/architecture.md § 3.2`)

```
app 全体共有  /, /learn, /learn/{course}, /learn/{course}/{lesson}, /search
ユーザー所有  /{handle}, /{handle}/bookmarks, /{handle}/{collection}, /{handle}/{collection}/{problem}
session 私有  /settings/profile, /notifications, /dashboard
```

`/{handle}` は自分・他人共通 URL。Server Component で `isOwner = session.profile.id === viewedProfile.id` を計算して UI を分岐 (編集ボタン overlay 等)。**サーバ側認可は UI overlay と独立** に各 Server Action / Service で `ensureAuthorOwns*` guard を呼ぶ (`architecture.md § 3.3 認可の 4 層`)。

## レッスン判定

レッスン (公式) / 問題 (UGC) クリア条件 (すべて満たす):

1. `stderr` が空
2. タイムアウトしていない (`5000ms`)
3. `exitCode === 0`
4. `stdout.trim() === expectedOutput.trim()`

成功時 Server Action (`completeLessonAction` for 公式 / `submitProblemAction` for UGC) を呼び、それぞれ `progress` / `problem_progress` テーブルに upsert。`ProblemSolver` (`src/components/problem-solver/`) は公式 / UGC 両方で共有しているコードエディタ。`onSubmit` callback でドメインごとの action にディスパッチする。

## TS コード実行方式 (ブラウザ内)

以前はサーバー側で `child_process.spawn("npx tsx")` していたが、`Vercel Serverless Functions で動かない` / `サンドボックス無しで Node API が自由に叩ける` / `ネットワーク往復のレイテンシ` などの理由で **ブラウザ完結に移行** (#13)。

```
[Monaco] → code
   ↓
esbuild-wasm.transform({ loader: "ts" })    ← 型注釈を落として JS へ
   ↓
iframe (sandbox="allow-scripts")            ← 親から隔離された別 origin
   ↓ new Function(js) を async IIFE でラップ実行
console.log / console.error を override
   ↓ postMessage
親 (LessonClient) が { stdout, stderr, timedOut, exitCode } を受け取る
```

**副作用**:

- Node API (`fs`, `child_process`, `process`) は使えない (学習用途としてはむしろ適切)
- iframe sandbox なので親の `localStorage` / `cookie` に触れない
- 無限ループは 5 秒タイムアウトで `iframe.remove()` → 親は停止しない
- top-level `await` は async IIFE で wrap 済みのため動く

将来 `npm install` や `npm run dev` を必要とするフルスタックレッスン (Next.js / Express) を提供する予定がある場合は [#14](https://github.com/yh1110/codelearn/issues/14) で **WebContainer** 導入を検討中。

## CI / Code Review 自動化

### CI (`.github/workflows/ci.yml`)

- push to main / pull_request に対して実行
- Node 24 + `npm ci` + `npx prisma generate` + `npx next typegen` + `npm run check` (biome) + `npx tsc --noEmit`
- **Prisma 移行 drift チェック**: Postgres 16 を service container として起動し (`SHADOW_DATABASE_URL` を指す)、`prisma migrate diff --from-migrations ... --to-schema ... --exit-code` で **commit 済み migration と `schema.prisma` が乖離していないか** を検証する。`schema.prisma` を編集したのに migration 追加を忘れている PR は CI で落ちる。

### Claude Code GitHub Action

- `.github/workflows/claude.yml`: issue / PR で **`@claude` メンション** すると Claude が作業 or 返答する
- `.github/workflows/claude-code-review.yml`: **PR opened 時に 1 回だけ** `/code-review:code-review` 自動レビュー
- 両ワークフローで `--append-system-prompt` で **日本語応答固定**
- 認証は `secrets.CLAUDE_CODE_OAUTH_TOKEN` (Max プラン OAuth) or `secrets.ANTHROPIC_API_KEY`

## アーキテクチャの原則 (抜粋)

詳細は `.claude/rules/architecture.md`。

- **Presentation → API (Action) → Service (純関数) → Repository (`BaseRepository` 継承) → Data (Prisma)** の 5 層
- Prisma Client に触れてよいのは `src/repositories/**` と `src/lib/prisma.ts` のみ。`app/` / `components/` / `services/` / `actions/` から Prisma を import しない
- Server Action は `actionClient.schema(zod).action(async ({parsedInput, ctx}) => {...})` パターン (`src/lib/safe-action.ts` の middleware が `requireAuth` 注入済)
- Client から `fetch('/api/...')` で write しない。mutation は Server Action、read は SWR 経由
- 認可は **4 層独立検証** (Page / Action / Service / Route Handler) で UI overlay と無関係にチェックする (`architecture.md § 3.3`)

## コンテンツの追加

### 公式コース / レッスン (`Course` / `Lesson`)
`prisma/seed.ts` の `courses` 配列に追加 → ローカル shadow で動作確認後、本番 DB は seed の冪等な部分のみ適用するか migration で投入する (`db:reset` は本番では絶対使わない)。

### UGC コレクション / 問題 (`Collection` / `Problem`)
サインイン後 `/dashboard/collections/new` から作成。author 認可は `ensureAuthorOwnsCollection()` で全 mutation に貼られている。

## セキュリティ上の注意

- `sb_publishable_*` (旧 anon key) は **ブラウザに露出する**。そのままだと publishable key を持つ誰でも Supabase REST API 経由で DB を叩けるので、**RLS を必ず有効化** すること (上記セットアップ 4)
- `SUPABASE_SECRET_KEY` (旧 service_role) は **サーバー側でしか使わない**。Public ビルドには含めない
- ブラウザ内 TS 実行は iframe sandbox で隔離済みだが、ユーザーコードに巨大な計算や無限ループを書かれた時の **5 秒タイムアウト** 以外の保護はしていない
- 本番運用 (公開 URL) する際は COOP / COEP ヘッダー、および Vercel / Supabase の access logs を確認すること

## 関連リンク

- リポジトリ: https://github.com/yh1110/codelearn
- Next.js 16 docs: `node_modules/next/dist/docs/` を参照 (training data の古い知識で書かない)
- Prisma 7 docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
