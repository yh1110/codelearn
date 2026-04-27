---
alwaysApply: true
---

# Tech Stack

codelearn が採用する技術スタックと使い分けルール。MVP フェーズで主要ライブラリは導入済み。残りの未導入ライブラリ (zustand / playwright / vitest / nuqs) は必要になった時点で別 issue で導入する。新規コードは下記方針に従う。

---

## 1. 採用ライブラリ一覧

| ライブラリ | 役割 |
| :-- | :-- |
| zustand | client-side global state |
| swr | client fetch + cache |
| next-safe-actions | Server Action wrapper (mutation) |
| prisma | ORM |
| supabase | auth + BaaS (storage / realtime) |
| tailwind v4 + shadcn/ui | style + UI primitives |
| biome | formatter + lint |
| playwright | E2E テスト |
| vitest | unit / component テスト |
| nuqs | URL query parameter state |
| server-only | Server Component 保護 |
| react-hook-form + `@hookform/resolvers` | Form state 管理（Zod と統合） |
| lucide-react | アイコン |
| pino | 構造化ログ（`src/lib/logging.ts` で wrap 済み） |

> issue #9 の原リストに含まれない `react-hook-form` / `@hookform/resolvers` / `lucide-react` は、Form 実装とアイコン運用のデファクトとして本プロジェクトで採択する（`react-nextjs.md § 1` / `§ 3` を参照）。導入時期は他ライブラリと同様に別 issue で調整する。

---

## 2. 使い分けルール

### 2.1 zustand（client global state）

- **役割**: クライアント側のグローバル state 管理。
- **使う**: UI state（モーダル開閉、フィルタ、サイドバー、編集中コードの snapshot 等）で複数コンポーネントが共有する必要があるもの。
- **使わない**: サーバーから取得するデータ。それは SWR の責務。
- 格納先: `src/stores/<name>Store.ts`。

### 2.2 swr（client fetch）

- **役割**: クライアントからのデータ取得とキャッシュ。
- **使う**: Client Component 内での read。GET Route Handler を叩くのが基本。
- **使わない**: Server Component 内の fetch（Server Component は service 経由で直接取得）。
- mutation は next-safe-actions に寄せ、SWR は `mutate()` で再検証するのみ。

### 2.3 next-safe-action（mutation）

- **役割**: フォーム送信・副作用のある mutation 全般。`createSafeActionClient` で共通の認証・エラーハンドリングを束ね、zod schema で型安全に入力検証する。
- **使う**: すべての write 系操作（create / update / delete）。
- **使わない**: Client から直接 `fetch('/api/...')` で write する実装は **禁止**。
- 格納先: `src/actions/<domain>.ts`。
- **`src/lib/safe-action.ts`** で `actionClient` を定義し、middleware で `requireAuth()` を呼んで全 action に `ctx.session` (= `Session`) を注入している。各 action は `actionClient.schema(zodSchema).action(async ({ parsedInput, ctx }) => {...})` の形で書く。
- 所有権チェックは middleware には載せない。各 action 内で `ensureAuthorOwnsCollection()` 等の guard 関数を service 層から呼ぶ (詳細は `architecture.md § 3 認可の 4 層`)。

### 2.4 prisma（ORM）

- **役割**: DB アクセス。
- **必須**: Prisma Client (`PrismaClient` インスタンス) を利用してよいのは `src/repositories/**` のみ。singleton 定義元の `src/lib/prisma.ts` のみ例外。
- `app/`, `components/`, `services/`, `actions/` からは Prisma を直 import しない。Repository 層が Prisma を触る唯一の場所である。
- **Migration 方針 (migrate-first)**: schema 変更は `npm run db:migrate -- --name <desc>` で migration ファイルを生成して `prisma/migrations/` に commit する。本番 / CI は `prisma migrate deploy`。`db:push` は **ローカル shadow DB (Docker) 実験専用** で、本番 Supabase DB には使わない。`db:reset` / `db:migrate:reset` も本番 DB に対しては絶対に実行しない（データが消える）。CI (`.github/workflows/ci.yml`) で `prisma migrate diff --from-migrations --to-schema --exit-code` による drift チェックが走るため、schema だけ変えて migration を生成し忘れた PR は弾かれる。
- **Shadow DB**: `prisma migrate dev` は Supabase ではなく **ローカル Docker Postgres** (`docker-compose.yml`, `SHADOW_DATABASE_URL`) を shadow として使う。`prisma migrate dev` を走らせる前に `npm run db:up` を実行する。

### 2.5 supabase（auth + BaaS）

- **役割**: 認証 / ストレージ / realtime。
- **使う**: ログイン / signup / セッション管理 / 画像等のアップロード / realtime 通知。
- **使わない（重要）**: DB の read/write には Supabase Client を使わない。DB は **Prisma 経由で Supabase Postgres に接続** する方針。`@supabase/supabase-js` の `.from('table').select()` は書かない。
- クライアントは `src/lib/supabase/server.ts` と `src/lib/supabase/client.ts` に分離する:
  - `server.ts`: `import 'server-only';` を付ける。Server Component / Server Action / Middleware から使う。
  - `client.ts`: `'use client'` 境界以下で使う薄い wrapper。
- **Auth は Supabase、DB は Prisma** の分担を守る。`src/lib/auth.ts` は `createSupabaseServerClient().auth.getUser()` でセッションを取り、`profileRepository.findByAuthUserId()` で profile を引いて `Session { userId, role, profile }` を返す。`Session.email` は **持たない** (auth.users 側にしか置かず、アプリ層に流通させない方針)。
- `auth.users` → `public.profiles` の同期は本番では trigger (`prisma/sql/001_profiles_trigger.sql`) が一次責務。trigger は INSERT 時に `auth_user_id` (UUID) と `handle` (デフォルト `user_xxxxxxxxxxxx`) を埋める。`requireAuth()` 内の upsert は trigger 未適用時の defense in depth。
- trigger SQL を変更したら **手動再適用** が必要 (Prisma migration 管理外、Supabase ダッシュボードの SQL Editor or `pg` client 経由で apply)。

### 2.6 tailwind v4 + shadcn/ui（スタイル）

- **役割**: スタイリングと UI プリミティブ。
- **必須**: 新規 UI コンポーネントは shadcn/ui のコンポーネント（`Button`, `Dialog`, `Input`, `Card` 等）をベースに組む。独自に `<div className="px-4 py-2 rounded ...">` で Button 相当を組み立てない。
- shadcn は `npx shadcn@latest add <component>` で `src/components/ui/` 配下に追加する。

### 2.7 biome（formatter + linter）

- **役割**: format と lint を一本化。
- 導入済み。`npm run check` (lint) / `npm run format` (format) / `npm run check:fix` で fix 可能なものを自動修正。CI でも `npm run check` が走る。
- ESLint / Prettier は併用しない。Prettier 系の設定 (`.prettierrc` 等) は配置しない。

### 2.8 playwright（E2E）+ vitest（unit / component）

- **playwright**: ブラウザを経由するシナリオ（lesson ページの回答送信 → 判定表示など）。
- **vitest**: 純粋ロジック / ユーティリティ / Service / Server Action の単体テスト / React Component の軽量テスト。
- 迷ったら粒度の細かい **vitest 優先**。E2E は golden path に絞る。

### 2.9 nuqs（URL query state）

- **役割**: URL クエリパラメータと React state の同期。
- **使う**: ページング・フィルタ・タブ切替など「URL に残したい UI state」。
- **使わない**: URL に残す必要のない一時 UI state（それは `useState` / zustand）。

### 2.10 react-hook-form + `@hookform/resolvers`

- **役割**: Form state と検証。`useForm` + `zodResolver(schema)` で zod とシームレスに統合する。
- **使う**: すべての Form。`useState` で input を自作しない。
- **使わない**: 1 input で form state を伴わない単発のモーダル等で、RHF が over-engineering になる場面。
- 書き方の詳細・サンプルは `react-nextjs.md § 3 Form Handling`。

### 2.11 lucide-react

- **役割**: アイコン。
- **使う**: すべてのアイコン表示。
- **使わない**: 絵文字や自前 SVG を初手に使わない（一貫性 + 型安全 + tree-shaking 効率のため lucide に寄せる）。

### 2.12 server-only

- **必須**: Server 専用ファイル（`repositories/`, `services/`, `actions/`, `lib/prisma.ts`, `lib/supabase/server.ts`, `lib/auth.ts` 等）の先頭で `import 'server-only';` を宣言する。
- これによりクライアントバンドルへの誤混入をビルド時に検出する。

### 2.13 pino（構造化ログ）

- **役割**: サーバー側の構造化ログ。`src/lib/logging.ts` で pino を wrap し、Google Cloud Logging の `LogSeverity` に合わせた `severity` フィールドを出力する。
- **使う**: Service 層（処理開始 / 成功 / エラー）を中心に `logInfo` / `logWarn` / `logError` を呼ぶ。Server Action / Route Handler / Middleware から使っても良い。
- **使わない**: `console.log` を直接呼ばない（構造化できず severity も付かないため）。Client Component からは import しない（server-only）。
- **event 名**: `<fileName>.<functionName>.<start|success|error>` のドット区切り文字列で統一する（ログ検索の grep 容易性）。
- **機密情報禁止**: password / token / Supabase の各種 key / 個人情報を payload に含めない。
- 開発時は `pino-pretty` 経由で読みやすい出力、production (`NODE_ENV=production`) では JSON 1 行の構造化ログになる。

---

## 3. 導入状況

codelearn は **MVP フェーズ**:

- **導入済み**: Next.js 16 / React 19 / Tailwind v4 / shadcn/ui / Prisma 7 (driver adapter: `@prisma/adapter-pg`) / zod / Monaco Editor / esbuild-wasm / biome / SWR / next-safe-action / supabase (`@supabase/ssr` + `@supabase/supabase-js`) / server-only / lucide-react / pino (+ pino-pretty) / react-hook-form (+ `@hookform/resolvers`)
- **未導入**: zustand / playwright / vitest / nuqs

未導入ライブラリは必要になった時点で別 issue を立てて導入する。**勝手に install しない**。まず使い道とバージョンをユーザーに確認する。
