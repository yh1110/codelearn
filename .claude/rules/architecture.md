---
alwaysApply: true
---

# Architecture

codelearn のアーキテクチャ方針。**新規コードは必ずこの構造に従う**。MVP までに過去の Prisma 直叩き等は概ね修正済み。新規ディレクトリ / モデルを増やすときは下記の規約 (5 層 / 11 ディレクトリ / URL 名前空間 3 区分 / 認可 4 層) に必ず従う。

---

## 1. アーキテクチャレイヤー（5 層）

### Layer 1: Presentation — `src/app/`, `src/components/`

- **デフォルトは Server Component**。Client Component (`'use client'`) は form / 対話性 / zustand / SWR が必要な場面に限定する。
- **DB に直接アクセスしない**。Prisma / Supabase Client を import しない。
- データ取得:
  - Server Component → **Service 経由**（repository を直叩きしない）。
  - Client Component → **SWR カスタムフック経由**（`src/hooks/`）。
- Mutation は **Server Action 経由**（`<form action={...}>` または `useTransition` で呼ぶ）。

### Layer 2: API — `src/actions/`, `src/app/api/`

- **Server Action を優先**。Route Handler は webhook / 外部連携 / ファイルアップロード / realtime 等の例外のみ。
- Route Handler は **GET-only**（SWR からの read 用）。create / update / delete は Server Action に寄せる。
- Server Action は次の順序を **必ず** 守る:
  1. `try { ... } catch (error) { ... }` で全体を包む
  2. 冒頭で `requireAuth()` または `requireRole(...)` を呼んで認証・認可チェック
  3. **Zod schema で入力 validation**。`parse()` した後のデータだけを以降に渡す（unvalidated data を service に流さない）
  4. Service 層に委譲（repository や prisma を action から直接触らない）
  5. `revalidatePath` / `revalidateTag` でキャッシュ更新
  6. 型付きの `{ success: true, ... } | { success: false, error: string }` を返す

### Layer 3: Service — `src/services/` — 純粋関数パターン

- **クラスではなく named export の関数** を使う。`class XxxService` は書かない。
- Prisma を **絶対に直接 import しない**。必ず `@/repositories` から repository 経由でアクセスする。
- **例外**: 複数 repository を跨ぐアトミックな操作のみ service 層で `prisma.$transaction()` を使ってよい。単一 repository で完結する transaction は repository 内に閉じる。
- カスタム error（`ValidationError`, `NotFoundError` 等、`src/lib/errors.ts`）を throw。unknown error は `handleUnknownError(error)` で wrap して再 throw。
- HTTP request / response を直接触らない。`Request` / `NextResponse` を引数・戻り値に使わない。
- **テスト容易性のため repository をデフォルト引数で DI 可能に** する。

### Layer 4: Repository — `src/repositories/`

- すべての repository は `BaseRepository` を extend する。
- **Prisma Client を利用する唯一のレイヤー**（singleton 定義元 `src/lib/prisma.ts` のみ例外）。
- ビジネスロジックを書かない（純粋な data access のみ）。
- `src/repositories/index.ts` で **singleton export** する。
- transaction は `withTransaction()` helper でサポート。

### Layer 5: Data

- PostgreSQL + Prisma ORM（本番は Supabase Postgres）。
- スキーマ変更は **Prisma migration 経由** (`npm run db:migrate -- --name <desc>`)。`prisma/migrations/` を git 管理し、本番 / CI は `prisma migrate deploy` で apply する。`db:push` は **ローカル shadow DB での実験専用** で、本番 Supabase DB には使わない（migration 履歴との乖離、データロスリスク）。
- Prisma 生成型（`@prisma/client` の `User`, `Lesson` 等）をアプリ全体で使う。独自にモデル型を手書きしない。

---

## 2. フォルダ構成

### 2.1 確定版 `src/` 構成（将来像）

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

**新規ディレクトリを上記以外に作らない**。分類に迷ったらユーザーに確認する。

ただし App Router の **private folder 規約** (`_` プレフィックス) に基づく以下のコロケーションのみ許可する:

- `src/app/<route>/_components/` — **そのページ固有** のコンポーネント
- `src/app/<route>/_hooks/` — **そのページ固有** のカスタムフック

複数ページで共有するようになった時点で、`src/components/` / `src/hooks/` へ昇格させる。グローバル hooks / UI プリミティブを `_hooks` / `_components` に置かない。

### 2.2 現状（MVP 時点）

```
src/
├── app/
│   ├── (protected)/                              # 要 Supabase Auth ルートグループ
│   │   ├── page.tsx                              # / : UGC explore (Collection 一覧)
│   │   ├── learn/                                # 公式 (Course / Lesson)
│   │   │   ├── page.tsx                          #   /learn 公式コース一覧
│   │   │   └── [course]/[lesson]/page.tsx        #   /learn/{course}/{lesson}
│   │   ├── search/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── settings/profile/page.tsx             # プロフィール編集 (旧 /me/edit を移行)
│   │   ├── dashboard/                            # UGC クリエイターダッシュボード
│   │   │   ├── page.tsx                          #   自分の Collection 一覧 (author 認可)
│   │   │   └── collections/{new,[collectionId]}/ #   Collection / Problem 作成・編集
│   │   ├── [handle]/                             # ★ /{handle} : プロフィール (自他統一、isOwner で UI 分岐)
│   │   │   ├── page.tsx
│   │   │   ├── bookmarks/page.tsx                #   /{handle}/bookmarks (旧 /bookmarks を移行)
│   │   │   └── [collection]/[problem]/page.tsx   #   /{handle}/{collection}/{problem} (UGC)
│   │   └── _components/                          # (protected) 共有 UI (TopBar 等)
│   ├── auth/{callback,signout}/route.ts
│   ├── login/page.tsx
│   ├── api/                                      # GET 専用 (mutation は Server Action)
│   ├── layout.tsx
│   ├── error.tsx / global-error.tsx / not-found.tsx
│   └── globals.css
├── actions/                                      # Server Actions (next-safe-action)
├── components/
│   ├── ui/                                       # shadcn/ui プリミティブ
│   ├── content/{ContentCard,OfficialBadge}.tsx   # 公式 / UGC 両方の card 土台
│   ├── profile/HandleLink.tsx                    # @handle 表示なしのプロフィールリンク
│   └── problem-solver/{ProblemSolver,useProblemRunner}.tsx
│                                                 # 公式 Lesson と UGC Problem の共通エディタ
├── config/                                       # 集約定数 (constants / heatmap / search 等)
├── hooks/                                        # SWR + zustand 合成 hook (将来用)
├── lib/                                          # prisma / supabase / auth / errors / logging / routes / safe-action / fetcher / reservedNames
├── repositories/                                 # BaseRepository 継承、唯一の Prisma 直触り層
├── services/                                     # 純関数 + authorGuard (ensureAuthorOwns*)
├── stores/                                       # (zustand 未導入)
├── types/
└── utils/
prisma/
├── schema.prisma                                 # Profile / Course / Lesson / Collection / Problem / Bookmark{Course,Lesson,Collection,Problem} / Progress / ProblemProgress / Notification / HandleReservation
├── migrations/                                   # prisma migrate dev で生成、commit 対象
├── seed.ts
└── sql/001_profiles_trigger.sql                  # auth.users → profiles trigger (migrate 管理外、手動 apply)
prisma.config.ts
docker-compose.yml                                # shadow DB のみ
```

ルーティングの考え方は **§ 3.2 URL 名前空間** を参照。

---

## 3. 認証 / 認可方針

### 3.1 認証 (Authentication)

- **保護したいルートは `src/app/(protected)/` ルートグループ** に配置する（URL には `(protected)` が出ない）。
- 認証 BaaS は **Supabase**。Next.js 16 の `proxy` (旧 middleware、`src/proxy.ts`) で Supabase session の cookie refresh を行う。
- **Server Component / Server Action / Route Handler の各レベルで `requireAuth()` を呼んで再検証** する。proxy だけに頼らない (Defense in depth)。
- `src/lib/auth.ts` に `requireAuth()` / `requireRole(role)` を実装。`requireAuth()` は `Session { userId, role, profile }` を返す (※ `email` は持たない、auth.users 側にしか置かない)。
- `Profile.id` は **cuid** で auth UUID とは別 (auth UUID は `Profile.authUserId` 列で保持)。アプリ層の FK / API レスポンス / Session.userId は全て cuid を使う。
- `Session.userId === Session.profile.id` (cuid)。

### 3.2 URL 名前空間 (3 区分)

URL は意味的に 3 つの名前空間に分かれる:

| 名前空間 | 例 | 性質 |
|---|---|---|
| **app 全体共有** | `/`, `/learn`, `/learn/{course}`, `/learn/{course}/{lesson}`, `/search` | 誰でも見えるコンテンツ。Authentication は必要 (`(protected)` 内)、ただし権限は public |
| **ユーザー所有** | `/{handle}`, `/{handle}/bookmarks`, `/{handle}/{collection}`, `/{handle}/{collection}/{problem}` | そのユーザーに紐づく resource。Server Component で `isOwner = session.profile.id === viewedProfile.id` を計算し、UI を分岐 |
| **session 私有** | `/settings`, `/settings/profile`, `/notifications`, `/dashboard` | sign-in 中のユーザー固有、handle 不問。常に `requireAuth()` の session を直接使う |

`/{handle}` は最低優先の動的ルートなので、静的ルート (`/me`, `/learn`, `/settings`, `/dashboard`, etc.) より後にマッチする。Profile.handle 取得時の **予約語 blocklist** を `src/lib/reservedNames.ts` に集中させ、Profile.handle と Collection.slug 両方のバリデーションで参照する。

### 3.3 認可の 4 層 (★ 重要)

UI 上の `isOwner` 切替は **見た目だけ**。実際のリソース変更は Server Action / Service / Route Handler 各レベルで **独立に** 認可チェックする。クライアントを一切信用しない:

#### Layer A: Page Server Component
- `requireAuth()` で session 取得
- viewedProfile / target resource 取得後、`isOwner` 計算
- UI に `isOwner` 渡して overlay
- **データ閲覧の認可** が必要なら `if (!isOwner) notFound()` (or 公開・非公開判定)

#### Layer B: Server Action (`actionClient` middleware)
全 mutation は `src/lib/safe-action.ts` の `actionClient` を経由する。middleware で:

1. `requireAuth()` を呼んで `ctx.session` を提供 (UnauthorizedError は `error.tsx` に伝播)
2. `inputSchema` (zod) で input を `parse` (ValidationError)
3. action 関数で `(parsedInput, ctx)` を受ける

action 関数本体で:

4. **所有権チェック**: target resource の owner と `ctx.session.profile.id` を比較
   - Profile 編集系 → `ctx.session.profile.id` だけで動かし、target id を入力に含めない (経路自体を遮断)
   - Collection / Problem 編集 → `ensureAuthorOwnsCollection()` / `ensureAuthorOwnsProblem()` (`src/services/authorGuard.ts`)
   - Bookmark 削除 → `bookmark.userId === ctx.session.profile.id`

5. service に委譲

#### Layer C: Service
- action から渡された `userId` (= `ctx.session.profile.id`) を必ずクエリの WHERE 条件に含める
  - 例: `bookmarkRepository.delete({ id, userId })` のように **id だけで削除しない**
- `ensureAuthorOwns*` 系 guard 関数で `ForbiddenError` を集中的に throw

#### Layer D: GET Route Handler (`src/app/api/`)
- `try` 内で `requireAuth()` → `isKnownAppError` で 401/403 にレスポンス変換
- write は Route Handler では受けない (Server Action に集中)

UI 経路を bypass されてもサーバ側で 403 になることを **mutation 実装時に必ず確認** (curl / fetch で他人の resource を狙った request → 403 を期待)。

### 3.4 UGC 所有権ガード

`src/services/authorGuard.ts` の guard 関数で **必ず** チェックする。Service 内で直接 `authorId` 比較しない:

```typescript
// 違ったら ForbiddenError / NotFoundError を throw
ensureAuthorOwnsCollection(collectionId: string, authorId: string): Promise<Collection>;
ensureAuthorOwnsProblem(problemId: string, authorId: string): Promise<Problem>;
```

`ensureAuthorOwnsProblem` は経由する Collection の authorId も検証する。Service / Action 側は `ctx.session.profile.id` を渡すだけ。

---

## 4. DB / Prisma 規約

- モデル名は **単数形**: `User`, `Lesson`, `Course`（複数形にしない）。
- テーブル名は `@@map("users")` のように **plural** を指定する。
- 主キーは `cuid()` をデフォルト（integer auto-increment は使わない）。
- 監査タイムスタンプ:
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- **enum は Prisma schema に定義する**。TypeScript 側で独自に union / enum を書かない。生成された `@prisma/client` の型を使う。
- 参照整合性が必要な relation には `onDelete: Cascade`（または `Restrict` / `SetNull`）を意図的に指定する。
- 頻繁に query する field には `@@index([...])` を張る。
- スキーマ変更時は原則 `npm run db:migrate -- --name <desc>` で migration ファイルを生成し、commit する。`migrate dev` は事前に `npm run db:up` でローカル shadow DB (Docker) を起動しておく必要がある。`db:push` / `db:reset` / `db:migrate:reset` は **本番 Supabase DB に対して絶対に実行しない**（データ全消失 / migration 履歴乖離）。破壊的コマンドを走らせる前には必ずユーザー確認を取る。

---

## 5. Import 順ルール

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

## 6. コード例

### 6.1 Repository

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

### 6.2 Service

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

### 6.3 Server Action（暫定版 — next-safe-actions 未導入期）

next-safe-actions 導入までの暫定パターン。導入後は `actionClient.schema(...).action(...)` 形式に置換する。

**ポイント**:

- **認証チェック (`requireRole` / `requireAuth`) は `try` の外に出す**。`UnauthorizedError` は通常のエラー画面（Next.js の `error.tsx`）に伝播させ、クライアントの mutation 成功/失敗ハンドリングと混ぜない。
- レスポンスは `code` フィールドで **検証エラー / 内部エラー** を区別する。クライアント側はこれで UI 分岐する。

```typescript
// src/actions/users.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { inviteUser } from '@/services/userService';
import { requireRole } from '@/lib/auth';
import { ValidationError } from '@/lib/errors';

const InviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'USER']),
});

type InviteUserResult =
  | { success: true; user: { id: string; email: string } }
  | { success: false; code: 'VALIDATION' | 'INTERNAL'; error: string };

export async function inviteUserAction(input: unknown): Promise<InviteUserResult> {
  // 認証は try の外。UnauthorizedError は error.tsx で扱う
  await requireRole('ADMIN');

  try {
    const parsed = InviteUserSchema.parse(input);
    const user = await inviteUser(parsed);
    revalidatePath('/accounts');
    return { success: true, user };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof ValidationError) {
      return { success: false, code: 'VALIDATION', error: (error as Error).message };
    }
    return { success: false, code: 'INTERNAL', error: (error as Error).message };
  }
}
```

### 6.4 BaseRepository（想定シグネチャ）

`src/repositories/base.repository.ts` に配置される想定（未作成）。各 repository はこれを extend し、transaction が必要な操作は `withTransaction()` 経由で実装する。

```typescript
// src/repositories/base.repository.ts (想定)
import 'server-only';
import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export abstract class BaseRepository {
  constructor(protected readonly client: PrismaClient | Prisma.TransactionClient = prisma) {}

  /**
   * 複数 repository / 複数クエリを跨いだアトミック処理。
   * fn 内で受け取る `tx` を子 repository に渡して使う。
   */
  async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    // prisma / tx どちらを client に持っていても $transaction は呼べる
    return (this.client as PrismaClient).$transaction(fn);
  }
}
```

- `this.client` は通常は singleton の `prisma`。transaction 中は `Prisma.TransactionClient` が入る。
- 単一 repository で完結する transaction は、内部で `withTransaction()` を呼んで閉じる。
- 複数 repository を跨ぐ transaction は **Service 層** で `prisma.$transaction(...)` を直接使う（`tech-stack.md § 2.4` の例外規定）。

### 6.5 補助ユーティリティの期待シグネチャ

Service / Server Action から参照する以下のユーティリティは **契約を固定** する。AI エージェントは独自シグネチャで再実装しない。実装自体は未作成なので、新規に作るときはこの契約を守る。

```typescript
// src/lib/errors.ts
import 'server-only';

export class ValidationError extends Error {
  readonly name = 'ValidationError';
  readonly httpStatus = 400;
}
export class UnauthorizedError extends Error {
  readonly name = 'UnauthorizedError';
  readonly httpStatus = 401;
}
export class ForbiddenError extends Error {
  readonly name = 'ForbiddenError';
  readonly httpStatus = 403;
}
export class NotFoundError extends Error {
  readonly name = 'NotFoundError';
  readonly httpStatus = 404;
}

export type AppError =
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError;

/** Route Handler / API で known error を HTTP status に写像するための型ガード。 */
export function isKnownAppError(error: unknown): error is AppError;

/**
 * 想定外の error を既知の Error サブクラスに正規化して返す。
 * 既知のカスタム error はそのまま通す。Service / Server Action の catch で使う:
 *
 *   } catch (error) {
 *     throw handleUnknownError(error);
 *   }
 */
export function handleUnknownError(error: unknown): Error;
```

- 各 `AppError` は `httpStatus` を readonly で持つ。Route Handler 側は `isKnownAppError(e)` で分岐し `e.httpStatus` でレスポンスを返す。
- Server Action / Service 層では従来どおり throw に徹する。HTTP レスポンスへの変換は API 境界の責務。
- **Route Handler は Server Action と違って `try` 内で `requireAuth()` を呼んで `UnauthorizedError` をキャッチし 401 を返してよい**。Server Action は `error.tsx` 画面に伝播させるために `requireAuth()` を `try` の外に置くが、Route Handler (`src/app/api/**`) は fetch クライアントが `res.status` を見て分岐する設計のため、`isKnownAppError(e)` で捕捉して `Response.json({ error: e.name }, { status: e.httpStatus })` を返すのが正しい。

#### エラーページの責務（`src/app/`）

Next.js App Router の error boundary / 404 ページは以下の役割分担で配置する。AI エージェントは新規作成・編集時にこの分担を崩さない。

| ファイル | 役割 | Component 種別 |
| :-- | :-- | :-- |
| `src/app/error.tsx` | route 単位の実行時エラーの受け皿。`reset()` で再試行、ホーム導線を提示する。 | `'use client'` 必須 |
| `src/app/global-error.tsx` | root layout 自体が壊れた時の最後の砦。自前で `<html>` / `<body>` を描画する。 | `'use client'` 必須 |
| `src/app/not-found.tsx` | `notFound()` / 未ヒット URL のページ。 | Server Component |
| `src/app/(protected)/error.tsx`（任意） | 認証領域専用のエラー UI が必要な場合のみ追加。 | `'use client'` 必須 |

- `error.tsx` は production では `error.message` を生出ししない。dev のみ `process.env.NODE_ENV !== 'production'` でデバッグ情報を出す。
- shadcn `Card` / `Button` + lucide アイコンを使い、ユーザーに次のアクション（再試行 / ホームへ戻る）を明示する。

```typescript
// src/lib/auth.ts
import 'server-only';
import type { Profile } from '@prisma/client';

export type Session = {
  userId: string;
  email: string | null;
  role: 'ADMIN' | 'USER';
  profile: Profile;
};

/** 未認証時は UnauthorizedError を throw。認証済みなら Session を返す。 */
export async function requireAuth(): Promise<Session>;

/** 権限不足時は ForbiddenError、未認証時は UnauthorizedError を throw。 */
export async function requireRole(role: Session['role']): Promise<Session>;
```

- いずれも **throw する side-effectful API**。戻り値をチェックして分岐しない（`try-catch` も通常は不要で、Next.js の `error.tsx` に伝播させる）。
- Middleware 側の認証（`architecture.md § 3`）と **二重チェック** する前提。
- 実装は Supabase Auth (`createSupabaseServerClient().auth.getUser()`) + `profileRepository.upsert()` で `Session.profile` を保険同期する。`auth.users` → `public.profiles` の一次同期は `prisma/sql/001_profiles_trigger.sql` の trigger で行う。
- `role` は現状全ユーザー `"USER"` 相当として扱う（`requireRole` は `requireAuth` に委譲）。専用ロール列が入ったら見直す。
