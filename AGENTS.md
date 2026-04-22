<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# codelearn — AI エージェント向けガイド

## 1. このファイルについて

このドキュメントは **AI コーディングエージェント（Claude / Cursor 等）向けの行動指針** である。人間のための README ではない。断言形（〜する / 〜しない）で書かれている箇所は例外なく従うこと。

> **前提**: 本ドキュメントは **これから採用していく技術スタックの方針** を記述している。以下に挙げるライブラリ（zustand, swr, next-safe-actions, supabase, shadcn/ui, biome, playwright, vitest, nuqs, server-only 等）の多くは **まだ install されていない**。今後このスタックに沿って段階的に追加していく。現状のコードと乖離している箇所は「方針が正」であり、コードを寄せていく対象である。既存コードの即時書き換えは不要（別 issue で対応）。

---

## 2. プロジェクト概要

- **codelearn** は Progate 風の TypeScript 学習プラットフォーム。
- ブラウザ上の Monaco Editor で TS を書き、サーバー側 `tsx` で実行、期待出力と突き合わせて自動判定する。
- フェーズは **PoC / MVP**。
- 認証は未導入（Supabase 導入予定）。現状 `userId` は `"local-user"` 固定。
- 現スタック: Next.js 16.2.4 (App Router, Turbopack) / React 19 / Tailwind v4 / Prisma 6 / PostgreSQL 16 (Docker, port 5434) / Monaco Editor / zod。

---

## 3. Next.js 16 に関する注意（再掲）

Next.js 16 は破壊的変更を含む。training data の知識で書かない。必ず `node_modules/next/dist/docs/` を該当トピックごとに読んでから実装する。deprecation 警告が出たら無視せずに対応する。

---

## 4. 採用技術スタック

各ライブラリの「役割 / 使う場面 / 使わない（選ばない）場面」を明記する。

### 4.1 zustand（client global state）

- **役割**: クライアント側のグローバル state 管理。
- **使う**: UI state（モーダル開閉、フィルタ、サイドバー、編集中コードの snapshot 等）で複数コンポーネントが共有する必要があるもの。
- **使わない**: サーバーから取得するデータ。それは SWR の責務。
- 格納先: `src/stores/<name>Store.ts`。

### 4.2 swr（client fetch）

- **役割**: クライアントからのデータ取得とキャッシュ。
- **使う**: Client Component 内での read。GET-only Route Handler を叩く、または Server Action の read 用 wrapper を叩く。
- **使わない**: Server Component 内の fetch（Server Component は service 経由で直接取得）。
- mutation は next-safe-actions に寄せ、SWR は `mutate()` で再検証するのみ。

### 4.3 next-safe-actions（mutation）

- **役割**: フォーム送信・副作用のある mutation 全般。`createSafeActionClient` で共通の認証・エラーハンドリングを束ね、zod schema で型安全に入力検証する。
- **使う**: すべての write 系操作（create / update / delete）。
- **使わない**: Client から直接 `fetch('/api/...')` で write する実装は **禁止**。現状の `/api/run` `/api/progress`（POST）は PoC の暫定。Server Action への移行は別 issue で対応予定。
- 格納先: `src/actions/<domain>.ts`。
- **導入前の暫定**: next-safe-actions は未インストール。導入までの間は § 11.3 の「暫定版サンプル（plain Server Action + 手動 `z.parse` + try-catch）」パターンで実装し、ライブラリ導入と同時に action client 経由に置換する。新規 action を書く場合もこの暫定パターンで書いてよい（Server Action の 6 ステップ手順は § 5 Layer 2 を厳守）。

### 4.4 prisma（ORM）

- **役割**: DB アクセス。
- **必須**: Prisma Client は **`src/repositories/` 配下からのみ import する**。`app/`, `components/`, `services/`, `actions/` からは Prisma を直 import しない。Repository 層が Prisma を触る唯一の場所である。
- Singleton は `src/lib/prisma.ts`。

### 4.5 supabase（auth + BaaS）

- **役割**: 認証 / ストレージ / realtime。
- **使う**: ログイン / signup / セッション管理 / 画像等のアップロード / realtime 通知。
- **使わない（重要）**: DB の read/write には Supabase Client を使わない。DB は **Prisma 経由で Supabase Postgres に接続** する方針。`@supabase/supabase-js` の `.from('table').select()` は書かない。
- クライアントは `src/lib/supabase/server.ts` と `src/lib/supabase/client.ts` に分離する:
  - `server.ts`: `import 'server-only';` を付ける。Server Component / Server Action / Middleware から使う。
  - `client.ts`: `'use client'` 境界以下で使う薄い wrapper。

### 4.6 tailwind v4 + shadcn/ui（スタイル）

- **役割**: スタイリングと UI プリミティブ。
- **必須**: 新規 UI コンポーネントは shadcn/ui のコンポーネント（`Button`, `Dialog`, `Input`, `Card` 等）をベースに組む。独自に `<div className="px-4 py-2 rounded ...">` で Button 相当を組み立てない。
- shadcn は `npx shadcn@latest add <component>` で `src/components/ui/` 配下に追加する。

### 4.7 biome（formatter + linter）

- **役割**: format と lint を一本化。
- **移行フェーズ**: biome は未導入。現状は `eslint`（`npm run lint`）を維持する。
- **biome 導入後**: `npm run check`（lint）/ `npm run format`（format）を `package.json` に追加し、CI でも同じコマンドを通す。同タイミングで `eslint.config.mjs` と eslint 系依存を削除する。
- **使わない**: ESLint / Prettier と biome を **併用** しない。移行は一括で行う。

### 4.8 playwright（E2E）+ vitest（unit / component）

- **playwright**: ブラウザを経由するシナリオ（lesson ページの回答送信 → 判定表示など）。
- **vitest**: 純粋ロジック / ユーティリティ / Service / Server Action の単体テスト / React Component の軽量テスト。
- 迷ったら粒度の細かい **vitest 優先**。E2E は golden path に絞る。

### 4.9 nuqs（URL query state）

- **役割**: URL クエリパラメータと React state の同期。
- **使う**: ページング・フィルタ・タブ切替など「URL に残したい UI state」。
- **使わない**: URL に残す必要のない一時 UI state（それは `useState` / zustand）。

### 4.10 server-only

- **必須**: Server 専用ファイル（`repositories/`, `services/`, `actions/`, `lib/prisma.ts`, `lib/supabase/server.ts`, `lib/auth.ts` 等）の先頭で `import 'server-only';` を宣言する。
- これによりクライアントバンドルへの誤混入をビルド時に検出する。

---

## 5. アーキテクチャレイヤー

codelearn は **5 レイヤーのレイヤードアーキテクチャ** を採用する。**現状コードはまだこの形になっていない**（`src/app/page.tsx` 等が `prisma.course.findMany` を直接呼んでいる）が、**新規コードは必ずこの構造に従う**。既存コードは別 issue で段階的に寄せる。

### Layer 1: Presentation — `src/app/`, `src/components/`

- **デフォルトは Server Component**。Client Component (`'use client'`) は form / 対話性 / zustand / SWR が必要な場面に限定する。
- **DB に直接アクセスしない**。Prisma / Supabase Client を import しない。
- データ取得:
  - Server Component → **Service 経由**で取得（repository を直叩きしない）。
  - Client Component → **SWR カスタムフック経由**（`src/hooks/`）。
- Mutation は **Server Action 経由**（`<form action={...}>` または `useTransition` で呼ぶ）。

### Layer 2: API — `src/actions/`, `src/app/api/`

- **Server Action を優先**。Route Handler は webhook / 外部連携 / ファイルアップロード / realtime 等の例外のみ。
- Route Handler は **GET-only**（SWR からの read 用）。create / update / delete は Server Action に寄せる。
- Server Action は次の順序を **必ず** 守る:
  1. `try { ... } catch (error) { ... }` で全体を包む
  2. 冒頭で `requireAuth()` または `requireRole(...)` を呼んで認証・認可チェック
  3. **Zod schema で入力 validation**。`parse()` した後のデータだけを以降に渡す。unvalidated data を service に流さない
  4. Service 層に委譲（repository や prisma を action から直接触らない）
  5. `revalidatePath` / `revalidateTag` でキャッシュ更新
  6. 型付きの `{ success: true, ... } | { success: false, error: string }` を返す

### Layer 3: Service — `src/services/` — 純粋関数パターン

- **クラスではなく named export の関数** を使う。`class XxxService` は書かない。
- Prisma を **絶対に直接 import しない**。必ず `@/repositories` から repository 経由でアクセスする。
- **例外**: 複数 repository を跨ぐアトミックな操作のみ、service 層で `prisma.$transaction()` を使ってよい。単一 repository で完結する transaction は repository 内に閉じる。
- カスタム error（`ValidationError`, `NotFoundError` 等、`src/lib/errors.ts`）を throw。unknown error は `handleUnknownError(error)` で wrap して再 throw。
- HTTP request / response を直接触らない。`Request` / `NextResponse` を引数や戻り値に使わない。
- **テスト容易性のため repository をデフォルト引数で DI 可能に**:

```typescript
// src/services/userService.ts
import 'server-only';
import { userRepository } from '@/repositories';
import { handleUnknownError } from '@/lib/errors';
import type { User } from '@prisma/client';

export async function getUsers(
  repository = userRepository,
): Promise<User[]> {
  try {
    return await repository.findMany();
  } catch (error) {
    throw handleUnknownError(error);
  }
}
```

### Layer 4: Repository — `src/repositories/`

- すべての repository は `BaseRepository` を extend する。
- **Prisma Client を import する唯一のレイヤー**。
- ビジネスロジックを書かない（純粋な data access のみ）。
- `src/repositories/index.ts` で **singleton export** する:

```typescript
// src/repositories/index.ts
import { UserRepository } from './user.repository';
import { LessonRepository } from './lesson.repository';

export const userRepository = new UserRepository();
export const lessonRepository = new LessonRepository();
```

- transaction は `withTransaction()` helper でサポート。

### Layer 5: Data

- PostgreSQL + Prisma ORM（将来的に Supabase Postgres に接続）。
- スキーマ変更は **Prisma migration 経由**（PoC 期は `db push` も可、本番移行時に migration 化）。
- Prisma 生成型（`@prisma/client` の `User`, `Lesson` 等）をアプリ全体で使う。独自にモデル型を手書きしない。

---

## 6. フォルダ構成

### 6.1 確定版 `src/` 構成（将来像）

`src/` 直下は以下の **11 ディレクトリで固定** する:

```
src/
├── actions/          # Server Actions (feature 単位で分割)
├── app/              # Next.js App Router
├── components/       # React components (UI は shadcn ベース)
├── config/           # 設定値・定数
├── hooks/            # Zustand + SWR を組み合わせたカスタムフック
├── lib/              # 横断ユーティリティ・Prisma クライアント・auth 等
├── repositories/     # データアクセス層 (BaseRepository 継承)
├── services/         # ビジネスロジック (純粋関数)
├── stores/           # Zustand stores
├── types/            # TypeScript 型定義
└── utils/            # 純粋ユーティリティ関数
```

**新規ディレクトリを上記以外に作らない**。迷ったらこの 11 種類のいずれかに分類する。

### 6.2 現状（2026-04 時点）

```
src/
├── app/
│   ├── page.tsx                                  # 現状は prisma を直接呼んでいる
│   ├── layout.tsx
│   ├── globals.css
│   ├── courses/[slug]/page.tsx
│   ├── courses/[slug]/lessons/[lessonSlug]/page.tsx
│   └── api/
│       ├── run/route.ts                          # POST、Server Action 移行予定
│       └── progress/route.ts                     # POST、Server Action 移行予定
├── components/
│   └── LessonClient.tsx                          # 将来は機能別に分割
└── lib/
    └── prisma.ts
prisma/
├── schema.prisma
└── seed.ts
docker-compose.yml
```

現状は **Pages/Components が Prisma を直叩きしている**。これはアーキテクチャとしては暫定で、§ 5 の構造へ段階的に移行する。新規コードはこの状態を踏襲せず、必ず Repository → Service → (Action or Server Component) の経路を通す。

---

## 7. 認証方針

- **認証チェックは `middleware.ts`（Next.js Middleware）で行う**。
- 保護したいルートは **`src/app/(protected)/` ルートグループ** に配置する（URL には `(protected)` が出ない）。
- 認証 BaaS は **Supabase**。Supabase session を middleware で検証し、未認証なら `/login` 等にリダイレクト。
- **Server Action / Route Handler 内でも二重チェック** する:
  - `requireAuth()` — ログイン必須のアクション
  - `requireRole('ADMIN' | 'USER' | ...)` — ロール必須のアクション
  - いずれも `src/lib/auth.ts`（`import 'server-only';`）に実装する。
- middleware の認証だけに頼らない理由: Route Handler は middleware の matcher から漏れる設計ミスが起きやすく、Server Action も Next.js の内部 endpoint で呼ばれるため。Defense in depth。

---

## 8. データ取得パターン

### 8.1 Client-side (SWR + Zustand)

UI state（filter / page 等）は zustand、server data は SWR で取得し、`src/hooks/` のカスタムフックで合成する:

```typescript
// src/hooks/useLessons.ts
'use client';
import useSWR from 'swr';
import { useLessonsStore } from '@/stores/lessonsStore';

export function useLessons() {
  const { filters, currentPage } = useLessonsStore();
  const url = `/api/lessons?filters=${encodeURIComponent(JSON.stringify(filters))}&page=${currentPage}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return { data, error, isLoading, mutate, filters, currentPage };
}
```

- Component 側は `useLessons()` だけを見れば良く、zustand / SWR の結線は hook に閉じる。

### 8.2 Server-side

Server Component は **repository を直接呼ばず、service 経由** で取得する（RSC 内でも業務ロジックは service に集約）。

```typescript
// src/app/courses/[slug]/page.tsx (Server Component)
import { getCourseBySlug } from '@/services/courseService';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  // ...
}
```

### 8.3 API Route（GET-only）

- SWR から叩く read endpoint のみ `src/app/api/<resource>/route.ts` に置く。
- POST / PUT / DELETE は **Server Action** に寄せる。既存の `/api/run`, `/api/progress`（POST）は PoC の暫定で、Server Action への移行は別 issue で対応する。

---

## 9. DB / Prisma 規約

- モデル名は **単数形**: `User`, `Lesson`, `Course`（複数形にしない）。
- テーブル名は `@@map("users")` のように **plural** を指定する。
- 主キーは `cuid()` をデフォルト（integer auto-increment は使わない）。
- 監査タイムスタンプ:
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- **enum は Prisma schema に定義する**。TypeScript 側で独自に union / enum を書かない。生成された `@prisma/client` の型を使う。
- 参照整合性が必要な relation には `onDelete: Cascade`（または `Restrict` / `SetNull`）を意図的に指定する。
- 頻繁に query する field には `@@index([...])` を張る。
- スキーマ変更時は migration 方針（`prisma migrate dev` か `db push` か）をユーザーに確認してから実行する。

---

## 10. Import 順ルール

通常ファイル:

```typescript
// 1. External
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

// 2. Internal - Config & Types
import { UI_CONFIG } from '@/config/constants';
import type { LessonWithProgress } from '@/types/lesson';

// 3. Internal - Lib & Services
import { showToast } from '@/lib/toast';
import { getLessons } from '@/services/lessonService';

// 4. Internal - Components
import { Button } from '@/components/ui/button';

// 5. Relative
import { formatDate } from './utils';
```

Service 層:

```typescript
import 'server-only';
import { lessonRepository, progressRepository } from '@/repositories';
import { handleUnknownError, ValidationError } from '@/lib/errors';
import type { Lesson } from '@prisma/client';
```

---

## 11. コード例

### 11.1 Repository

```typescript
// src/repositories/lesson.repository.ts
import 'server-only';
import { prisma } from '@/lib/prisma';
import { BaseRepository } from './base.repository';
import type { Lesson } from '@prisma/client';

export class LessonRepository extends BaseRepository {
  async findMany(): Promise<Lesson[]> {
    return prisma.lesson.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findBySlug(slug: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({ where: { slug } });
  }
}
```

### 11.2 Service

```typescript
// src/services/lessonService.ts
import 'server-only';
import { lessonRepository } from '@/repositories';
import { handleUnknownError, NotFoundError } from '@/lib/errors';
import type { Lesson } from '@prisma/client';

export async function getLessonBySlug(
  slug: string,
  repository = lessonRepository,
): Promise<Lesson> {
  try {
    const lesson = await repository.findBySlug(slug);
    if (!lesson) throw new NotFoundError(`Lesson not found: ${slug}`);
    return lesson;
  } catch (error) {
    throw handleUnknownError(error);
  }
}
```

### 11.3 Server Action（暫定版 — next-safe-actions 未導入期）

next-safe-actions を導入するまでの暫定パターン。導入後は `actionClient.schema(...).action(...)` 形式に置換する。

```typescript
// src/actions/users.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { inviteUser } from '@/services/userService';
import { requireRole } from '@/lib/auth';

const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'USER']),
});

export async function inviteUserAction(input: unknown) {
  try {
    await requireRole('ADMIN');
    const parsed = InviteUserSchema.parse(input);
    const user = await inviteUser(parsed);
    revalidatePath('/accounts');
    return { success: true as const, user };
  } catch (error) {
    return { success: false as const, error: (error as Error).message };
  }
}
```

---

## 12. AI エージェントへの指示

### 12.1 新規ファイル / ディレクトリを作る前に

1. **ルートの `CLAUDE.md` / `AGENTS.md`（本ファイル）を読む**。
2. § 6.1 の 11 ディレクトリ以外に `src/` 直下ディレクトリを作らない。分類に迷ったらユーザーに確認する。
3. 編集対象ディレクトリで `ls` を実行し、既存の命名・粒度・フラット度を確認する。
4. 同じ責務の既存関数・ファイルがないか `grep` で探す。あれば同じパターンに寄せる。
5. 一般的な TS/Node ベストプラクティス（`utils/`, `helpers/`, `mappers/` 等）を **本ドキュメントの規約より優先しない**。

### 12.2 破壊的変更の禁止

- 既存の public シグネチャ（page の props、API Route の入出力、Prisma schema）を無断で変更しない。必要なら先に理由を説明する。
- Prisma schema を変える場合は migration 方針（`prisma migrate dev` か `db push` か）をユーザーに確認。
- `node_modules/next/dist/docs/` を読まずに Next.js 固有 API（`next/navigation`, `next/headers`, `cache`, `unstable_*` 等）を書かない。

### 12.3 実装時に必ず満たすこと

- Server 専用ファイルには `import 'server-only';` を置く。
- Prisma Client (`PrismaClient` インスタンス) を利用してよいのは `src/repositories/**` のみ。例外は singleton 定義元の `src/lib/prisma.ts` のみ。
- Service から prisma を直接 import しない。`@/repositories` 経由で repository を使う。
- Action は `try-catch` → `requireAuth`/`requireRole` → `zod.parse` → service 委譲 → `revalidatePath` → 型付き response の順を守る。
- Client から直接 `fetch('/api/...')` で write しない。write は Server Action。
- Client Component（`'use client'`）で Prisma / `server-only` モジュールを import しない。
- 新規 UI は shadcn/ui のコンポーネントから組む。必要なものが未追加ならユーザーに「`npx shadcn@latest add <name>` を走らせてよいか」確認。
- Prisma モデルは単数形、テーブル名は `@@map` で plural。enum は schema 側で定義。

### 12.4 判断に迷ったら

- 該当ライブラリが未 install の場合、勝手に install しない。まず **どのバージョンで何を追加するか** をユーザーに確認する（特に supabase / biome / playwright は周辺設定を伴う）。
- スタックの方針と既存コードが矛盾する場合、**方針を正とし、段階的に寄せる変更** を提案する。一度に全面書き換えをしない。
- 既存の `src/app/page.tsx` 等が prisma を直叩きしているのを見ても、それを踏襲しない。新規コードは必ず Repository → Service → (Action or Server Component) を経由する。
