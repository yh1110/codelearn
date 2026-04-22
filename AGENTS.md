<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# codelearn — AI エージェント向けガイド

このドキュメントは **AI コーディングエージェント（Claude / Cursor 等）向けの行動指針** である。人間のための README ではない。断言形（〜する / 〜しない）で書かれている箇所は例外なく従うこと。

> **重要**: 本ドキュメントは **これから採用していく技術スタックの方針** を記述している。以下に挙げるライブラリ（zustand, swr, next-safe-actions, supabase, shadcn/ui, biome, playwright, vitest, nuqs, server-only 等）の多くは **まだ install されていない**。今後このスタックに沿って段階的に追加していく。現状のコードと乖離している箇所は「方針が正」であり、コードを寄せていく対象である。

---

## 1. プロジェクト概要

- **codelearn** は Progate 風の TypeScript 学習プラットフォーム。
- ブラウザ上の Monaco Editor で TS を書き、サーバー側 `tsx` で実行、期待出力と突き合わせて自動判定する。
- フェーズは **PoC / MVP**。認証なし、`userId` は `"local-user"` 固定。
- 現スタック: Next.js 16.2 (App Router, Turbopack) / React 19 / Tailwind v4 / Prisma 6 / PostgreSQL 16 (Docker, port 5434) / Monaco Editor / zod。

---

## 2. Next.js 16 に関する注意（再掲）

Next.js 16 は破壊的変更を含む。training data の知識で書かない。必ず `node_modules/next/dist/docs/` を該当トピックごとに読んでから実装する。deprecation 警告が出たら無視せずに対応する。

---

## 3. 採用技術スタック（方針）

各ライブラリの「役割 / 使う場面 / 使わない（選ばない）場面」を明記する。

### 3.1 zustand（client global state）

- **役割**: クライアント側のグローバル state 管理。
- **使う**: UI state（モーダル開閉、サイドバー状態、編集中のコード snapshot 等）で複数コンポーネント間で共有する必要があるもの。
- **使わない**: サーバーから取ってくるデータ（lessons / progress 等）。これは swr に任せる。
- store は `src/stores/<name>Store.ts` に置く。

### 3.2 swr（client fetch）

- **役割**: クライアントからのデータ取得とキャッシュ。
- **使う**: Client Component 内で API / Server Action の結果を購読する場合。
- **使わない**: Server Component 内の fetch。Server Component では `await` + Prisma / repository 経由で取得する。
- mutation は後述の next-safe-actions に寄せ、swr は `mutate()` で再検証するのみ。

### 3.3 next-safe-actions（mutation）

- **役割**: フォーム送信・副作用のある mutation 全般。zod スキーマで型安全に。
- **使う**: すべての write 系操作。
- **使わない**: クライアントから直接 `fetch('/api/...')` を叩く実装は禁止。現状の `/api/run` `/api/progress` も将来的に Server Action に寄せる。
- action は `src/features/<domain>/actions.ts` に置く。

### 3.4 レイヤードアーキテクチャ（設計）

詳細は § 4。

### 3.5 prisma（ORM）

- **役割**: DB アクセス。
- **必須**: DB アクセスは **必ず** `src/features/<domain>/repository.ts` 経由。Server Component / Server Action / API Route から Prisma Client を直叩きしない。
- singleton は `src/lib/prisma.ts`。

### 3.6 supabase（auth + BaaS）

- **役割**: 認証・ストレージ・realtime。
- **使う**: ログイン / signup / セッション管理 / 画像等のアップロード / リアルタイム通知。
- **使わない（重要）**: DB の read/write には Supabase Client を使わない。DB は **Prisma 経由で Supabase Postgres に接続** する方針。`@supabase/supabase-js` の `.from('table').select()` は書かない。
- auth クライアントは `src/lib/supabase/{server,client}.ts` に分離（server-only / client 用）。

### 3.7 tailwind v4 + shadcn/ui（スタイル）

- **役割**: スタイリングと UI プリミティブ。
- **必須**: 新規 UI コンポーネントは shadcn/ui のコンポーネント（`Button`, `Dialog`, `Input`, `Card` 等）をベースに組む。独自に `<div className="px-4 py-2 rounded ...">` で Button 相当を組み立てない。
- shadcn は `npx shadcn@latest add <component>` で `src/components/ui/` 配下に追加する。

### 3.8 biome（formatter + linter）

- **役割**: format と lint を一本化。
- **使う**: `npm run check`（lint）/ `npm run format`（format）を経由して実行（script は今後追加）。CI でも同じコマンドを通す。
- **使わない**: ESLint / Prettier。現状の `eslint.config.mjs` は biome 移行時に削除する。

### 3.9 playwright（E2E）+ vitest（unit / component）

- **playwright**: ブラウザを経由するシナリオ（lesson ページの回答送信 → 判定表示など）。
- **vitest**: 純粋ロジック / ユーティリティ / Server Action の単体テスト / React Component の軽量テスト。
- 迷ったら粒度の細かい **vitest 優先**。E2E は golden path に絞る。

### 3.10 nuqs（URL query state）

- **役割**: URL クエリパラメータと React state の同期。
- **使う**: ページング・フィルタ・タブ切替など「URL に残したい UI state」。
- **使わない**: サーバーに送る必要のない一時 UI state（それは useState / zustand）。

### 3.11 server-only

- **必須**: Server 専用ファイル（repository, Prisma を触る util, supabase server client 等）の先頭で `import 'server-only';` を宣言する。
- これによりクライアントバンドルへの誤混入をビルド時に検出する。

---

## 4. レイヤードアーキテクチャ方針

Next.js App Router の上にレイヤードアーキテクチャを重ねる。**方針であり、現時点のコードとは乖離がある**。新規コードから順次この構造に寄せる。

```
src/
  app/                       # Presentation（ルーティング + 画面）
    page.tsx
    courses/[slug]/page.tsx
  features/
    <domain>/
      actions.ts             # Application: next-safe-actions で公開する mutation
      repository.ts          # Infrastructure: prisma への唯一のアクセス経路
      schema.ts              # Domain: zod schema / 型 / バリデーション
      <Domain>Client.tsx     # この domain 専用の Client Component（必要なら）
  components/
    ui/                      # shadcn/ui が吐くプリミティブ
    <shared>/                # アプリ横断の共有コンポーネント
  stores/                    # zustand store
  lib/                       # 横断 util（prisma singleton, supabase client, etc.）
```

### 依存方向のルール

- `app/` は `features/*` と `components/*` に依存してよい。
- `features/<domain>/` は自ドメイン内と `lib/` に依存してよい。**他ドメインの internal（repository 等）を直接 import しない**。他ドメインを使う場合は相手の `actions.ts` / 公開エクスポート経由。
- `components/` は業務ロジック（`features/*`, `lib/prisma` 等）に依存しない。props で受け取る。
- `lib/` は最下層。どこからも依存されるが、逆方向に依存しない。

### レイヤー別の責務

- **presentation (`app/`)**: ルーティング、layout、page、Client Component の結線。業務ロジックを書かない。
- **application (`actions.ts`)**: zod で入力検証 → repository を呼ぶ → 結果を整形。認可チェックはここ。
- **domain (`schema.ts`)**: 型と不変条件。DB 形も UI 形もここから派生させる。
- **infrastructure (`repository.ts`)**: Prisma を触る唯一の層。Server 専用（`import 'server-only';` 必須）。

---

## 5. ディレクトリ規約

### 5.1 現状（2026-04 時点）

```
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    courses/[slug]/page.tsx
    courses/[slug]/lessons/[lessonSlug]/page.tsx
    api/run/route.ts
    api/progress/route.ts
  components/LessonClient.tsx
  lib/prisma.ts
prisma/
  schema.prisma
  seed.ts
docker-compose.yml
```

### 5.2 今後（スタック導入後の姿）

§ 4 のツリーに加えて、以下が追加される想定:

```
src/
  features/
    lessons/{actions,repository,schema}.ts
    progress/{actions,repository,schema}.ts
  stores/editorStore.ts
  components/ui/{button,dialog,input,...}.tsx
  lib/
    prisma.ts
    supabase/{server,client}.ts
biome.json
playwright.config.ts
vitest.config.ts
tests/{e2e,unit}/...
```

`/api/run`, `/api/progress` は Server Action への移行候補。新規の write 経路を `/api/*` に追加しない。

---

## 6. AI エージェントへの指示

### 6.1 新規ファイル / ディレクトリを作る前に

1. **ルートの `CLAUDE.md` / `AGENTS.md`（本ファイル）を読む**。
2. 編集対象ディレクトリで `ls` を実行し、既存の命名・粒度・フラット度を確認する。
3. 同じ責務の既存関数・ファイルがないか `grep` で探す。あれば同じパターンに寄せる。一般的な TS/Node ベストプラクティス（`utils/`, `helpers/`, `mappers/` 等）を **このプロジェクトの規約より優先しない**。

### 6.2 破壊的変更の禁止

- 既存の public シグネチャ（page の props、API Route の入出力、Prisma schema）を無断で変更しない。必要なら先に理由を説明する。
- Prisma schema を変える場合は migration 方針（`prisma migrate dev` か `db push` か）をユーザーに確認。
- `node_modules/next/dist/docs/` を読まずに Next.js 固有 API（`next/navigation`, `next/headers`, `cache`, `unstable_*` 等）を書かない。

### 6.3 実装時に必ず満たすこと

- Server 専用ファイルには `import 'server-only';` を置く。
- DB アクセスは `features/<domain>/repository.ts` を経由。
- write 系は Server Action（next-safe-actions）を経由。Client から直接 `fetch('/api/...')` を書かない。
- Client Component（`'use client'`）で Prisma / `server-only` モジュールを import しない。
- 新規 UI は shadcn/ui のコンポーネントから組む。必要なものが未追加ならユーザーに「`npx shadcn@latest add <name>` を走らせてよいか」確認。

### 6.4 判断に迷ったら

- 該当ライブラリが未 install なら、勝手に install せず、まず **どのバージョンで何を追加するか** をユーザーに確認する（特に supabase / biome / playwright は周辺設定を伴うため）。
- スタックの方針と既存コードが矛盾する場合、**方針を正とし、段階的に寄せる変更** を提案する。一度に全面書き換えをしない。
