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

### 2.10 server-only

- **必須**: Server 専用ファイル（`repositories/`, `services/`, `actions/`, `lib/prisma.ts`, `lib/supabase/server.ts`, `lib/auth.ts` 等）の先頭で `import 'server-only';` を宣言する。
- これによりクライアントバンドルへの誤混入をビルド時に検出する。

---

## 3. 現状コードとの乖離について

codelearn は **PoC / MVP フェーズ** にあり、上記スタックの多くはまだ未導入:

- 導入済み: Next.js 16.2.4 / React 19 / Tailwind v4 / Prisma 6 / zod / Monaco Editor
- 未導入: zustand / swr / next-safe-actions / supabase / shadcn/ui / biome / playwright / vitest / nuqs / server-only

既存コード（`src/app/page.tsx` が `prisma.course.findMany` を直接呼ぶ等）はこの方針に反するが、PoC の都合で残している。**新規コードは方針に従い、既存コードは別 issue で段階的に寄せる** という方向で動く。

library が未インストールの場合、勝手に install しない。まず **どのバージョンで何を追加するか** をユーザーに確認する（特に supabase / biome / playwright は周辺設定を伴う）。
