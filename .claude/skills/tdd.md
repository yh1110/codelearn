---
name: tdd
description: TDD (特に E2E first) で機能を固めるための作業手順。新機能追加・バグ修正時に参照する。
---

# TDD Skill — E2E first で仕様を固める

## 1. 目的

codelearn では **E2E テストを仕様の正として最初に書き、その失敗を埋めるように実装する** 流れを採用する。このスキルは「テストから書く」を AI エージェントと人間の双方で徹底するためのもの。

実装から書き始めると、以下の問題が起きやすい:

- 「動いた」の定義がユーザー操作ベースではなく開発者の頭の中だけで閉じる
- 回帰検知が手薄になる（同じバグが何度も再発する）
- Server Action / Repository / Service が繋がった状態での挙動検証が省略される

E2E を先に書くことで、**ブラウザ側から見た合否 = 仕様** が明文化され、実装途中で設計が迷子になっても戻る場所が残る。

## 2. いつこのスキルを発動するか

以下の文脈を検知したら、実装着手前に本スキルの手順を踏む:

- 「新機能を追加する」「画面を作る」「Server Action を追加する」系の依頼
- 「バグを直す」依頼で、再現手順が特定できている場合（**回帰テストを先に書く**）
- レッスン判定ロジックや進捗管理のようにユーザーが触る中核機能を変更する場合

読み物や CSS 調整のような「挙動に関わらない変更」では発動しない。

## 3. 適用範囲（codelearn の前提）

`.claude/rules/tech-stack.md § 2.8` を参照。

- **E2E**: Playwright — golden path のユーザー操作（lesson 表示・回答送信・進捗反映など）
- **Unit / Component**: Vitest — Service / Server Action / Repository / 純粋ユーティリティ / 軽量 Component
- 迷ったら粒度の細かい **Vitest 優先**。E2E は golden path に絞る。

**注意: Playwright / Vitest は現時点で未インストール**。`tech-stack.md § 3` に記載の通り、PoC / MVP フェーズのため未導入。本スキル適用時に実際のテストコードを足す場合は、**導入 issue を先に起票するか、ユーザーに導入可否を確認する**。本スキル自体は方針ドキュメントであり、テスト基盤の導入は別 issue の責務。

## 4. TDD フロー（Red → Green → Refactor）

### ① Red — 失敗するテストを書く

- 仕様を **ユーザー操作** または **関数の入出力** で表現する
- 実装が無い / 壊れている状態で **必ず失敗する** ことをローカルで確認する（偽陽性の最大の原因は「最初から通っているテスト」）
- 1 テスト = 1 仕様。1 つの `test()` / `it()` で複数のシナリオを束ねない

### ② Green — 最小実装で通す

- テストを通すのに必要な最小限だけを書く
- この段階では綺麗さを追わない。重複・ハードコードを一旦許容する
- 既存テストが壊れていないかを毎回確認する

### ③ Refactor — 設計を整える

- テストが通っている状態を崩さずに、実装の責務分割・命名・型を整える
- 5 層（Presentation / API / Service / Repository / Data）の境界に沿う（`.claude/rules/architecture.md` 参照）
- Refactor 後にもテストが全て通ることを必ず確認する

## 5. codelearn 向け典型パターン

### 5.1 新しいレッスンページを追加する

**E2E (`e2e/lesson-display.spec.ts`)** を最初に書く:

```typescript
import { test, expect } from '@playwright/test';

test('公開されたレッスンが /courses/[slug]/lessons/[lessonSlug] で表示される', async ({ page }) => {
  await page.goto('/courses/typescript-basics/lessons/variables');
  await expect(page.getByRole('heading', { name: '変数' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'answer code' })).toBeVisible();
});
```

- 先にこの E2E が失敗することを確認
- その後 Server Component / Repository / Service をレイヤー順に実装して通す

### 5.2 Server Action を追加する

**Unit (`src/actions/lesson.test.ts`)** を最初に書く:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { submitAnswerAction } from './lesson';

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'test-user', email: 't@example.com', role: 'USER' }),
}));

describe('submitAnswerAction', () => {
  it('空コードの送信は VALIDATION エラーを返す', async () => {
    const result = await submitAnswerAction({ lessonId: 'cuid-xxx', code: '' });
    expect(result).toEqual({ success: false, code: 'VALIDATION', error: expect.any(String) });
  });
});
```

- `requireAuth` / `requireRole` は `vi.mock` で差し替える
- Service 層も DI できるので、action の純粋な責務（zod parse → service 委譲 → revalidate）に絞って検証する
- Zod 検証エラーの分岐・内部エラーの分岐をそれぞれ 1 ケースずつ押さえる

### 5.3 Repository を追加する

**Unit (`src/repositories/lesson.repository.test.ts`)** を書く。Prisma を触るので DB 実体が必要:

- **第一選択**: テスト用 PostgreSQL（Docker compose で既に `port 5434` に立っている）を利用し、`beforeEach` で truncate する
- **避ける**: Prisma を全面 mock する方式（ORM のクエリビルド挙動が検証できず偽陽性を生みやすい）
- SQLite in-memory はスキーマが PostgreSQL 前提（`cuid()` / enum / `@@map`）なので原則使わない

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { LessonRepository } from './lesson.repository';

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE lessons RESTART IDENTITY CASCADE`;
});

describe('LessonRepository', () => {
  it('slug でレッスンを 1 件取得できる', async () => {
    await prisma.lesson.create({ data: { slug: 'variables', title: '変数', /* ... */ } });
    const repo = new LessonRepository();
    const lesson = await repo.findBySlug('variables');
    expect(lesson?.title).toBe('変数');
  });
});
```

## 6. 置き場所

- **E2E**: `e2e/<feature>.spec.ts`（ディレクトリごと新設する。現時点で未作成）
- **Unit / Component**: 対象ファイルと **co-located** で `<file>.test.ts`
  - 例: `src/services/lessonService.ts` ↔ `src/services/lessonService.test.ts`
  - 例: `src/actions/lesson.ts` ↔ `src/actions/lesson.test.ts`
- **fixture / テスト用 helper**: `src/test-utils/` に集約（現時点で未作成、必要に応じて追加）

`src/` 直下ディレクトリは 11 種類固定（`.claude/rules/architecture.md § 2.1`）。`test-utils/` はその 11 種類に含まれないため、導入時はユーザーに確認してから追加する。

## 7. AI エージェントが守ること

1. **既存テストが無い機能を変更するときは、まず現状仕様を再現する失敗 E2E を書く**。実装変更から始めない。
2. **ユーザーコードを書き換える前にテストを 1 本書いてレビューに出す**。「テスト → 実装」の PR 分割は必須ではないが、diff 上で「テストを先に書いた」ことが伝わる順番でコミットする。
3. **テスト不在のまま「動いた」と報告しない**。手動確認で終わった場合はその旨を明示し、回帰テストを TODO として残す。
4. **Playwright / Vitest が未導入の状態で勝手に install しない**。`tech-stack.md § 3` に従い、まずユーザーに導入可否を確認する。
5. **壊れたテストを「都合が悪いので消す / skip する」は禁止**。赤いテストは仕様違反のシグナルなので、実装を直すか、仕様変更の根拠を添えてテスト側を更新する。
6. **カバレッジを水増しする目的のテストを書かない**。意味のない getter/setter テストや、実装を写経しただけの snapshot は不要。

## 8. チェックリスト

実装着手前:

- [ ] 追加/修正する挙動を 1〜2 行の日本語で書き出した
- [ ] その挙動を E2E または Unit で表現したテストを書いた
- [ ] テストがローカルで **失敗** することを確認した

実装中:

- [ ] 最小実装でテストを通した
- [ ] 他のテストが壊れていないことを確認した

実装後:

- [ ] 設計を Refactor した（レイヤー境界・命名・型）
- [ ] Refactor 後も全テストが通ることを確認した
- [ ] PR 本文に「どのテストがこの変更の仕様を定義しているか」を書いた
