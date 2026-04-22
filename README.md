# codelearn

Progate 風の TypeScript 学習プラットフォーム。ブラウザ上のエディタで TypeScript を書き、**そのままブラウザ内で transpile / 実行**して結果を期待出力と突き合わせる。

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
| CI | GitHub Actions (biome check + tsc) |
| Code Review Bot | [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action) (`@claude` mention + PR opened 時の自動レビュー) |

### 未導入 (`.claude/rules/tech-stack.md` に方針記載)

zustand / playwright / vitest / nuqs / server-only / react-hook-form + `@hookform/resolvers`

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

> **Docker は不要になりました**。以前はローカル開発で Postgres コンテナを使っていましたが、DB は Supabase Postgres に統一しています。`docker-compose.yml` と `npm run db:up/db:down` スクリプトは過渡期の残骸なので将来削除予定。

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

```bash
npm install
npm run db:push   # 内部で DIRECT_URL (port 5432) を使う
npm run db:seed   # サンプルコース / レッスンを投入
```

> **pgbouncer hang について**: Prisma schema engine が pooler (`?pgbouncer=true`, port 6543) 経由の接続で stuck することがあるため、`prisma.config.ts` は **`DIRECT_URL` (port 5432)** を schema engine に使わせている。runtime クエリは引き続き `DATABASE_URL` (pooler) を driver adapter 経由で使う。

### 4. 認証 trigger SQL の適用 (必須)

`auth.users` (Supabase Auth 管理) → `public.profiles` (Prisma 管理) を同期させる trigger を一度だけ適用する:

```bash
# psql がローカルにあれば
psql "$DIRECT_URL" -f prisma/sql/001_profiles_trigger.sql
```

psql が無ければ **Supabase Dashboard → SQL Editor** に `prisma/sql/001_profiles_trigger.sql` の内容を貼って Run。既存ユーザーが居ても `ON CONFLICT DO NOTHING` で安全。

Supabase Dashboard で **Authentication → URL Configuration** を以下に設定:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

### 5. RLS を有効化 (推奨)

Supabase Dashboard の SQL Editor で以下を実行:

```sql
ALTER TABLE "Course"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Progress" ENABLE ROW LEVEL SECURITY;
```

policy は追加しない = ブラウザから publishable key で Supabase API を叩いても空配列しか返らなくなる。Prisma (postgres ロール) は RLS bypass なので従来通り動く。Defense in depth。

### 6. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` を開く。未ログインなら `/login` にリダイレクトされる。GitHub / Google でサインインすると `/auth/callback` を経由してコース一覧 (`/`) に戻る。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Next.js 開発サーバー |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクション起動 |
| `npm run db:push` | Prisma schema を DB に反映 (`DIRECT_URL` 使用) |
| `npm run db:seed` | サンプルコース / レッスン投入 |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | DB をリセット → seed |
| `npm run check` / `check:fix` | biome (lint + format) |
| `npm run format` / `format:fix` | biome format |
| `npm run lint` | biome lint |

> `db:up` / `db:down` は Docker Postgres 用の旧スクリプト。Supabase 移行後は使わない (そのうち削除)。

## ディレクトリ構成 (`src/` 11 ディレクトリ固定)

```
src/
├── actions/                    # Server Actions (mutation)
│   └── progress.ts             #   completeLessonAction
├── app/                        # Next.js App Router
│   ├── layout.tsx              #   ダーク固定 + SwrProvider
│   ├── page.tsx                #   コース一覧
│   ├── globals.css             #   tailwind + shadcn tokens
│   ├── courses/[slug]/page.tsx
│   ├── courses/[slug]/lessons/[lessonSlug]/page.tsx
│   └── api/
│       └── progress/route.ts   #   GET のみ (SWR 用)。POST は Server Action に移行済み
├── components/
│   ├── LessonClient.tsx        # Monaco + iframe 実行 + 進捗送信
│   ├── providers/SwrProvider.tsx
│   └── ui/                     # shadcn/ui 生成物 (Button / Card / Badge / Skeleton)
├── config/                     # (今のところ空枠、将来の定数用)
├── hooks/
│   └── useProgress.ts          # SWR + fetcher 合成サンプル
├── lib/
│   ├── prisma.ts               # Prisma singleton (adapter 経由)
│   ├── run-code.ts             # esbuild-wasm + iframe sandbox 実行
│   ├── fetcher.ts              # SWR 用 fetch ラッパ
│   ├── safe-action.ts          # next-safe-action client
│   ├── auth.ts                 # requireAuth / requireRole (stub、#5 で実装)
│   ├── errors.ts               # Custom Error + handleUnknownError
│   ├── utils.ts                # shadcn cn() ヘルパ
│   └── supabase/
│       ├── server.ts           # Server Component / Action / proxy 用
│       └── client.ts           # Browser 用
├── repositories/               # Data Access 層 (BaseRepository 継承)
│   ├── index.ts                # singleton export
│   ├── base.repository.ts
│   └── progress.repository.ts
├── services/                   # Business Logic (純関数)
│   └── progressService.ts
├── stores/                     # (Zustand 未導入)
├── types/                      # (各 feature の型は将来ここへ)
├── utils/                      # 純粋ユーティリティ (将来用)
└── proxy.ts                    # Next.js 16 proxy (旧 middleware): Supabase セッション refresh
prisma/
├── schema.prisma               # Course / Lesson / Progress
└── seed.ts
prisma.config.ts                # Prisma 7: schema engine 用 DIRECT_URL fallback 含む
.github/workflows/
├── ci.yml                      # biome check + tsc
├── claude.yml                  # @claude mention → Claude が作業
└── claude-code-review.yml      # PR opened で自動レビュー (日本語固定)
```

## データモデル

- **Course**: `slug`, `title`, `description`, `order`
- **Lesson**: `slug`, `title`, `contentMd` (Markdown), `starterCode` (TS), `expectedOutput`, `order`, `courseId`
- **Progress**: `userId` (`Profile.id` への UUID FK、`onDelete: Cascade`), `lessonId`, `completedAt`
- **Profile**: `id` (Supabase `auth.users.id` と同じ UUID), `email`, `name`, `avatarUrl`。`auth.users` への INSERT/UPDATE を trigger で sync (`prisma/sql/001_profiles_trigger.sql`)。保険として `requireAuth()` 内でも `upsert` する

## レッスン判定

レッスンクリア条件 (すべて満たす):

1. `stderr` が空
2. タイムアウトしていない (`5000ms`)
3. `exitCode === 0`
4. `stdout.trim() === expectedOutput.trim()`

成功時 `completeLessonAction` (Server Action) を呼び、`Progress` テーブルに upsert。

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
- Node 24 + `npm ci` + `npx prisma generate` + `npm run check` (biome) + `npx tsc --noEmit`

### Claude Code GitHub Action

- `.github/workflows/claude.yml`: issue / PR で **`@claude` メンション** すると Claude が作業 or 返答する
- `.github/workflows/claude-code-review.yml`: **PR opened 時に 1 回だけ** `/code-review:code-review` 自動レビュー
- 両ワークフローで `--append-system-prompt` で **日本語応答固定**
- 認証は `secrets.CLAUDE_CODE_OAUTH_TOKEN` (Max プラン OAuth) or `secrets.ANTHROPIC_API_KEY`

## アーキテクチャの原則 (抜粋)

詳細は `.claude/rules/architecture.md`。

- **Presentation → API (Action) → Service (純関数) → Repository (`BaseRepository` 継承) → Data (Prisma)** の 5 層
- Prisma Client に触れてよいのは `src/repositories/**` と `src/lib/prisma.ts` のみ。`app/` / `components/` / `services/` / `actions/` から Prisma を import しない
- Server Action は try-catch → `requireAuth` / `requireRole` → `zod.parse` → service → `revalidatePath` → 型付きレスポンスの順で書く
- Client から `fetch('/api/...')` で write しない。mutation は Server Action、read は SWR 経由

## レッスンの追加

`prisma/seed.ts` の `courses` 配列にエントリを追加して:

```bash
npm run db:reset
```

将来的には管理画面 or MDX ファイルシステムベースに置き換える予定 (未定)。

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
