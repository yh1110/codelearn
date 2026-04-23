---
alwaysApply: true
---

# Tech Stack

codelearn が採用する技術スタックと使い分けルール。**これから段階的に導入していく方針** であり、下記ライブラリの多くは現時点で未インストール。現状コードと乖離している箇所は「方針が正」として新規コードを寄せていく。既存コードの即時書き換えは不要（別 issue で対応）。

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

### 2.3 next-safe-actions（mutation）

- **役割**: フォーム送信・副作用のある mutation 全般。`createSafeActionClient` で共通の認証・エラーハンドリングを束ね、zod schema で型安全に入力検証する。
- **使う**: すべての write 系操作（create / update / delete）。
- **使わない**: Client から直接 `fetch('/api/...')` で write する実装は **禁止**。現状の `/api/run` `/api/progress`（POST）は PoC の暫定。Server Action への移行は別 issue で対応予定。
- 格納先: `src/actions/<domain>.ts`。
- **導入前の暫定**: next-safe-actions は未インストール。導入までの間は plain Server Action + 手動 `z.parse` + try-catch パターンで実装し、ライブラリ導入と同時に action client 経由に置換する（サンプルは architecture.md § 6.3）。

### 2.4 prisma（ORM）

- **役割**: DB アクセス。
- **必須**: Prisma Client (`PrismaClient` インスタンス) を利用してよいのは `src/repositories/**` のみ。singleton 定義元の `src/lib/prisma.ts` のみ例外。
- `app/`, `components/`, `services/`, `actions/` からは Prisma を直 import しない。Repository 層が Prisma を触る唯一の場所である。

### 2.5 supabase（auth + BaaS）

- **役割**: 認証 / ストレージ / realtime。
- **使う**: ログイン / signup / セッション管理 / 画像等のアップロード / realtime 通知。
- **使わない（重要）**: DB の read/write には Supabase Client を使わない。DB は **Prisma 経由で Supabase Postgres に接続** する方針。`@supabase/supabase-js` の `.from('table').select()` は書かない。
- クライアントは `src/lib/supabase/server.ts` と `src/lib/supabase/client.ts` に分離する:
  - `server.ts`: `import 'server-only';` を付ける。Server Component / Server Action / Middleware から使う。
  - `client.ts`: `'use client'` 境界以下で使う薄い wrapper。
- **Auth は Supabase、DB は Prisma** の分担を守る。`src/lib/auth.ts` は `createSupabaseServerClient().auth.getUser()` でセッションを取り、`profileRepository.upsert()` で `public.profiles` 行を保険的に同期してから `Session { userId, email, role, profile }` を返す。
- `auth.users` → `public.profiles` の同期は本番では trigger (`prisma/sql/001_profiles_trigger.sql`) が一次責務。`requireAuth()` の upsert は trigger 未適用時 / `user_metadata` 後更新に対する defense in depth。

### 2.6 tailwind v4 + shadcn/ui（スタイル）

- **役割**: スタイリングと UI プリミティブ。
- **必須**: 新規 UI コンポーネントは shadcn/ui のコンポーネント（`Button`, `Dialog`, `Input`, `Card` 等）をベースに組む。独自に `<div className="px-4 py-2 rounded ...">` で Button 相当を組み立てない。
- shadcn は `npx shadcn@latest add <component>` で `src/components/ui/` 配下に追加する。

### 2.7 biome（formatter + linter）

- **役割**: format と lint を一本化。
- **移行フェーズ**: biome は未導入。現状は `eslint`（`npm run lint`）を維持する。
- **biome 導入後**: `npm run check`（lint）/ `npm run format`（format）を `package.json` に追加し、CI でも同じコマンドを通す。同タイミングで `eslint.config.mjs` と eslint 系依存を削除する。
- **使わない**: ESLint / Prettier と biome を **併用** しない。移行は一括で行う。

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

## 3. 現状コードとの乖離について

codelearn は **PoC / MVP フェーズ** にあり、上記スタックの多くはまだ未導入:

- 導入済み: Next.js 16.2.4 / React 19 / Tailwind v4 / Prisma 7 (driver adapter: `@prisma/adapter-pg`) / zod / Monaco Editor / biome / swr / next-safe-action / supabase (`@supabase/ssr` + `@supabase/supabase-js`) / shadcn/ui / server-only / lucide-react / pino (+ pino-pretty)
- 未導入: zustand / playwright / vitest / nuqs / react-hook-form / @hookform/resolvers

既存コード（`src/app/page.tsx` が `prisma.course.findMany` を直接呼ぶ等）はこの方針に反するが、PoC の都合で残している。**新規コードは方針に従い、既存コードは別 issue で段階的に寄せる** という方向で動く。

library が未インストールの場合、勝手に install しない。まず **どのバージョンで何を追加するか** をユーザーに確認する（特に supabase / biome / playwright は周辺設定を伴う）。
