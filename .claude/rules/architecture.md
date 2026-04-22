---
alwaysApply: true
---

# Architecture

codelearn のアーキテクチャ方針。**新規コードは必ずこの構造に従う**。既存コード（`src/app/page.tsx` 等が Prisma を直叩きしている箇所）は別 issue で段階的に寄せる。踏襲しない。

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

- PostgreSQL + Prisma ORM（将来的に Supabase Postgres に接続）。
- スキーマ変更は **Prisma migration 経由**（PoC 期は `db push` も可、本番移行時に migration 化）。
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

### 2.2 現状（2026-04 時点）

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

現状は Pages / Components が Prisma を直叩きしている暫定状態。新規コードは踏襲せず、必ず Repository → Service → (Action or Server Component) の経路を通す。

---

## 3. 認証方針

- **認証チェックは `middleware.ts`（Next.js Middleware）で行う**。
- 保護したいルートは **`src/app/(protected)/` ルートグループ** に配置する（URL には `(protected)` が出ない）。
- 認証 BaaS は **Supabase**。Supabase session を middleware で検証し、未認証なら `/login` 等にリダイレクト。
- **Server Action / Route Handler 内でも二重チェック** する:
  - `requireAuth()` — ログイン必須のアクション
  - `requireRole('ADMIN' | 'USER' | ...)` — ロール必須のアクション
  - いずれも `src/lib/auth.ts`（`import 'server-only';`）に実装する。
- middleware 認証だけに頼らない理由: Route Handler が middleware の matcher から漏れる設計ミスが起きやすく、Server Action も `Next-Action` header 付き POST で発火しうるため。Defense in depth。

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
- スキーマ変更時は migration 方針（`prisma migrate dev` か `db push` か）をユーザーに確認してから実行する。

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
