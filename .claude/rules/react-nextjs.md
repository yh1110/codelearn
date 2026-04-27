---
alwaysApply: true
---

# React & Next.js Conventions

Next.js 16 + React 19 で Arcode を書くときの規約。**アーキテクチャ層の規約は `architecture.md`、ライブラリの使い分けは `tech-stack.md` に分離**。本ファイルは「React / Next.js の書き方そのもの」に関するルールに絞る。

---

## 1. UI とスタイル

- **Shadcn UI を primary コンポーネントライブラリとして使う**。新規 UI はまず `src/components/ui/` 以下に `shadcn@latest add <name>` で追加してからそれをベースに組む。独自 div で Button / Dialog / Input 相当を組み立てない。
- 複雑な対話（combobox, dropdown 等）が必要で shadcn が未対応なら **Radix UI primitives** を直接使う。
- **Tailwind CSS v4** でスタイリングする。`globals.css` の tokens を活かし、任意値（`w-[37px]` 等）は最後の手段。
- **モバイルファースト**でレスポンシブを組む（`sm:` / `md:` / `lg:` は大きい breakpoint への上書きに使う）。
- アイコンは **Lucide React** を使う（未インストール、導入時はユーザーに確認）。絵文字や自前 SVG を初手にしない。

---

## 2. Server / Client Component の使い分け

**基本原則**: App Router ではファイルはデフォルトで Server Component（`'use client'` を書かない限り）。Client Component は「本当に必要な場面」に限定する。

### Client Component (`'use client'`) が必要な場面

以下のいずれかに該当する時のみ `'use client'` を付ける:

- `onClick` / `onChange` など DOM イベントを扱う
- `useState` / `useReducer` / `useContext` を使う
- `useEffect` を使う（§ 4 の条件を満たす時のみ）
- zustand store / SWR hook を使う
- Monaco Editor など client-only ライブラリを使う

上記に該当しない純粋な描画は **Server Component のまま書く**。"use client" を付けない。

### Client Component は最小化する

- Client Component が Server Component を子に持てることを活用する（`children` として Server Component を渡す構成）。
- 「親を `'use client'` にした結果、その子ツリー全体が Client 化する」アンチパターンを避ける。インタラクティブな箇所だけを leaf に切り出す。
- Data fetching は Client 側に引きずり出さない。**Server Component で取得 → Client Component に props で渡す** を基本形にする。

### Suspense と fallback

- Data fetching を含む Client Component は **`<Suspense fallback={...}>`** で包み、明示的な skeleton / loading UI を用意する。
- SWR を `suspense: true` で使う場合、エラーバウンダリ（`<ErrorBoundary>`）と Suspense を対で置く。
- 非クリティカルなコンポーネントは **`next/dynamic`** で遅延ロードしてバンドル初期サイズを抑える。

### 画像

- 画像は常に **`next/image`** を使う。
  - `width` / `height` を指定する（CLS 防止）。
  - 形式は **WebP / AVIF** を優先。
  - 必要に応じて `placeholder="blur"`。
  - デフォルトは lazy load。**LCP に関わる画像だけ** `priority` を付ける。

---

## 3. Form Handling

- **React Hook Form** でフォーム state を管理する（`useState` でフォームを自作しない）。
- **Zod** でスキーマ定義 → `@hookform/resolvers/zod` で RHF と繋ぐ。
- スキーマは form と **同じ場所** に置く（`features/<domain>/schema.ts` または form コンポーネントに co-locate）。
- **submit は Server Action に委譲**。`handleSubmit` の中では Server Action を呼ぶだけで、fetch / API Route を直接叩かない（詳細は `architecture.md § 1 Layer 2`）。
- Server Action 側でも **同じ zod スキーマで `parse()`** する（クライアント検証を信用しない、二重検証）。

```typescript
// src/components/forms/SubmitAnswerForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitAnswerAction } from '@/actions/lesson';

const SubmitAnswerSchema = z.object({
  lessonId: z.string().cuid(),
  code: z.string().min(1),
});
type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

export function SubmitAnswerForm({ lessonId }: { lessonId: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SubmitAnswerInput>({
      resolver: zodResolver(SubmitAnswerSchema),
      defaultValues: { lessonId, code: '' },
    });

  const onSubmit = handleSubmit(async (values) => {
    const result = await submitAnswerAction(values);
    if (!result.success) {
      // toast.error(result.error) 等
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <textarea {...register('code')} aria-label="answer code" />
      {errors.code && <p role="alert">{errors.code.message}</p>}
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

---

## 4. `useEffect` ポリシー

`useEffect` は **外部世界との同期専用**。それ以外では使わない。許容される同期先の例:

- API 呼び出し（ただし第一選択は Server Component / SWR / Server Action）
- WebSocket / EventSource 接続
- ブラウザ API（`window`, `document`, `IntersectionObserver`, `matchMedia` 等）
- 外部 store の subscribe（zustand 等、ライブラリが既に隠蔽している場合は不要）
- タイマー（`setTimeout` / `setInterval`）

### アンチパターン（禁止）

- ❌ props や派生値をローカル state にコピーする
- ❌ フラグの変化に反応してロジックを動かす
- ❌ ユーザー操作を event handler ではなく effect で処理する
- ❌ 派生データやバリデーション state を effect で更新する
- ❌ 空依存配列 `[]` で 1 回きりの初期化をする（`useMemo` か render 中計算で足りる）

### 原則

1. **props / state から導ける値は render 中に計算**する
2. **ユーザー操作は event handler** で扱う（effect に逃がさない）
3. **effect は「外部システムに触る副作用」のみ** に使う
4. 書いた `useEffect` には **同期先を示すコメント** を 1 行添える。外部同期先が無い effect は禁止

### Bad / Good 例

**BAD — props を state にコピー**

```typescript
// ❌ Anti-pattern
function Component({ userId }: { userId: string }) {
  const [id, setId] = useState(userId);
  useEffect(() => { setId(userId); }, [userId]);
  return <div>{id}</div>;
}
```

**GOOD — props を直接使う**

```typescript
// ✅ Correct
function Component({ userId }: { userId: string }) {
  return <div>{userId}</div>;
}
```

**BAD — 派生値を effect で計算**

```typescript
// ❌ Anti-pattern
function Component({ items }: { items: Item[] }) {
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(items.length); }, [items]);
  return <div>{count}</div>;
}
```

**GOOD — render 中に計算**

```typescript
// ✅ Correct
function Component({ items }: { items: Item[] }) {
  const count = items.length;
  return <div>{count}</div>;
}
```

**BAD — ユーザー操作を effect 経由で発火**

```typescript
// ❌ Anti-pattern
function Component() {
  const [shouldSubmit, setShouldSubmit] = useState(false);
  useEffect(() => {
    if (shouldSubmit) { submitForm(); setShouldSubmit(false); }
  }, [shouldSubmit]);
  return <button onClick={() => setShouldSubmit(true)}>Submit</button>;
}
```

**GOOD — event handler で直接呼ぶ**

```typescript
// ✅ Correct
function Component() {
  const handleSubmit = () => { submitForm(); };
  return <button onClick={handleSubmit}>Submit</button>;
}
```

**BAD — 空依存で 1 回きりの初期化**

```typescript
// ❌ Anti-pattern
function Component() {
  const [data, setData] = useState(null);
  useEffect(() => { setData(expensiveComputation()); }, []);
  return <div>{data}</div>;
}
```

**GOOD — `useMemo` か render 中計算**

```typescript
// ✅ Correct
function Component() {
  const data = useMemo(() => expensiveComputation(), []);
  return <div>{data}</div>;
}
```

**GOOD — 正当な `useEffect`（WebSocket 同期）**

```typescript
// ✅ Synchronizing with external WebSocket
function Component({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const ws = new WebSocket(`wss://example.com/room/${roomId}`);
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    return () => ws.close();
  }, [roomId]);
  return <MessageList messages={messages} />;
}
```

---

## 5. State Management（Zustand + SWR の合成）

詳細は `tech-stack.md § 2.1 zustand` / `§ 2.2 swr` 参照。本節では React 側の具体パターンのみ:

### 5.1 Zustand store の書き方

- 置き場所: `src/stores/<name>Store.ts`。ファイル名は `Store` サフィックス（例: `lessonsStore.ts`, `editorStore.ts`）。
- エクスポートするフックは **`use<Domain>Store`** 形式（例: `useLessonsStore`）。
- 1 store = 1 ドメイン。複数ドメインを 1 store に詰め込まない。
- state interface を必ず TypeScript で定義する（`any` 禁止）。
- **`useState` でグローバル state を作らない**。複数コンポーネントが共有する state は zustand。

```typescript
// src/stores/lessonsStore.ts
import { create } from 'zustand';
// LessonFilters 型と defaultFilters は src/types/lesson.ts に定義される想定
import type { LessonFilters } from '@/types/lesson';
import { defaultFilters } from '@/types/lesson';

interface LessonsState {
  filters: LessonFilters;
  currentPage: number;
  setFilters: (filters: LessonFilters) => void;
  setCurrentPage: (page: number) => void;
}

export const useLessonsStore = create<LessonsState>((set) => ({
  filters: defaultFilters,
  currentPage: 1,
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}));
```

### 5.2 Zustand + SWR を束ねるカスタムフック

UI state（zustand）と server state（SWR）を `src/hooks/use<Domain>.ts` で合成し、Component には 1 つのフックだけを見せる。

```typescript
// src/hooks/useLessons.ts
'use client';
import useSWR from 'swr';
import { useLessonsStore } from '@/stores/lessonsStore';
import { fetcher } from '@/lib/fetcher';

export function useLessons() {
  const { filters, currentPage, setFilters, setCurrentPage } = useLessonsStore();
  const url = `/api/lessons?${new URLSearchParams({
    filters: JSON.stringify(filters),
    page: String(currentPage),
  })}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  return {
    data: data?.items ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    mutate,
  };
}
```

- Component 側は `const { data, isLoading, ... } = useLessons();` だけ。zustand / SWR の結線は hook に閉じる。
- URL クエリに state を乗せたい場合は nuqs と併用する（`tech-stack.md § 2.9`）。

### 5.3 fetcher の基本実装

SWR に渡す `fetcher` は `src/lib/fetcher.ts` に共通で置く。すべての Client fetch はこれを経由する。

```typescript
// src/lib/fetcher.ts
export const fetcher = <T = unknown>(url: string): Promise<T> =>
  fetch(url, { credentials: 'same-origin' }).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`);
    }
    return res.json() as Promise<T>;
  });
```

- HTTP エラーは Error を throw する（SWR 側で `error` として観測される）。
- 認証は Cookie ベース前提なので `credentials: 'same-origin'`。cross-origin に投げる場合は別 fetcher を作る。
- POST / PUT / DELETE 用の fetcher は作らない。mutation は Server Action に寄せる（`architecture.md § 1 Layer 2`）。

---

## 6. Accessibility (a11y)

- **semantic HTML を使う**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`。`<div onClick={...}>` で button / link の代替を作らない。
- 複雑なインタラクション（menu, dialog, tabs 等）は **shadcn / Radix** を使う。自作 ARIA パターンを書かない（Radix が WAI-ARIA 準拠の実装を提供している）。
- すべての form input に **`<label>` または `aria-label`** を付ける。
- interactive 要素は **キーボード操作可能** かつ **focus state が視認可能** にする（`focus-visible:` クラスで outline を出す）。
- 画像に適切な `alt` を付ける。装飾画像は `alt=""` で明示的に空にする。
- **カラーコントラスト** は WCAG AA（通常テキストで 4.5:1）を満たす。Tailwind のデフォルトグレースケールは薄すぎることがあるので `text-gray-500` などは背景と要確認。
- エラーメッセージは `role="alert"` もしくは `aria-live="polite"` でスクリーンリーダに伝える。

---

## 7. パフォーマンス最適化

- **`useMemo` / `useCallback` / `React.memo` は過剰使用しない**。計測して効果が出る場所だけに使う。props の参照同一性が重要な子コンポーネント境界や、重い計算（フィルタ・ソート対象が大きい等）に限定。
- list のレンダリングでは `key` に **安定した ID**（`cuid` / `id`）を使う。`index` をキーにしない（order 変更で state が壊れる）。
- イベントリスナー / タイマー / subscribe は必ず `useEffect` の cleanup で解除する（メモリリーク防止）。
- Bundle size: 大きな client-only ライブラリ（Monaco Editor 等）は `next/dynamic` の `{ ssr: false }` で分離する。

---

## 8. 迷ったら

- Client Component を新規で書きたくなったら、まず **Server Component で解けないか** を自問する。
- `useEffect` を書きたくなったら、**外部システムとの同期か？** を自問する。違うなら § 4 を再読する。
- フォームを作るなら **RHF + Zod + Server Action** 以外の選択肢は取らない。
- store を作るなら **`src/stores/` に `Store` サフィックス**、hook は **`src/hooks/` に `use<Domain>`** で合成。
