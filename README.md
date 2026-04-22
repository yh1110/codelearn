# codelearn

Progate 風の TypeScript 学習プラットフォーム。ブラウザ上のエディタで TypeScript を書き、サーバー側で実行して結果を確認できる。

## 技術スタック

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Prisma 7** (driver adapter: `@prisma/adapter-pg`) + **PostgreSQL 16** (Docker)
- **Monaco Editor** でコード編集
- **tsx** でサーバー側 TypeScript 実行
- **SWR** で Client Component からの read fetch を統一

Prisma 7 では datasource URL を `schema.prisma` から外し、`prisma.config.ts` で指定する仕様に変わっています。接続は `@prisma/adapter-pg` 経由で `pg` が担います。

## 前提条件

- Node.js (Next.js 16 が要求するバージョン)
- Docker (Postgres を起動するため)

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. Postgres 起動 (Docker)
npm run db:up

# 3. スキーマ反映 & 初期データ投入
npm run db:push
npm run db:seed

# 4. 開発サーバー起動
npm run dev
```

`http://localhost:3000` を開く。

## Supabase セットアップ (認証 / BaaS)

認証 (Supabase Auth) と BaaS (Storage / Realtime) に Supabase を利用する。**DB アクセスは Prisma 経由** で Supabase Postgres に接続する方針のため、`@supabase/supabase-js` の `.from().select()` のような直接クエリは書かない (`.claude/rules/tech-stack.md § 2.5`)。

本リポジトリのコードには Supabase クライアントの雛形と `proxy.ts` (セッション更新) が含まれるが、**プロジェクト作成と env 設定はユーザーが手動で行う必要がある**。

### 手順

1. [Supabase Dashboard](https://supabase.com/dashboard) で新規プロジェクトを作成する。
2. **Project Settings → API Keys** から以下を控える (新形式 `sb_publishable_...` / `sb_secret_...` を使う。Legacy JWT は使わない):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY` (server-only。漏らさない)
3. **Project Settings → Database → Connection string** から以下を控える:
   - **Transaction pooler** (port 6543) → `DATABASE_URL` (Prisma runtime 用)
   - **Session pooler / Direct connection** (port 5432) → `DIRECT_URL` (`prisma migrate` / `db push` 用)
4. `cp .env.example .env.local` で雛形をコピーし、上記値を埋める。
5. `npm run db:push` を実行し、Prisma schema が Supabase Postgres に反映されることを確認する。

### 方針メモ

- DB read/write は Prisma 経由。`@supabase/supabase-js` のクエリ API は使わない。
- RLS ポリシーには依存しない。認可は `src/proxy.ts` (Next.js 16 proxy = 旧 middleware) + `src/lib/auth.ts` の `requireAuth` / `requireRole` で行う (defense in depth)。
- ログイン UI / `(protected)` ルートグループ / `requireAuth` の本実装は **issue #5** で対応する。本 issue はクライアント分離・env 雛形・セッション更新スケルトンまで。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Next.js 開発サーバー |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクション起動 |
| `npm run db:up` / `db:down` | Postgres コンテナ起動 / 停止 |
| `npm run db:push` | Prisma schema を DB に反映 |
| `npm run db:seed` | サンプルレッスンを投入 |
| `npm run db:studio` | Prisma Studio を起動 |
| `npm run db:reset` | DB を消して seed からやり直す |

## ディレクトリ構成

```
src/
  app/
    page.tsx                                         # コース一覧
    courses/[slug]/page.tsx                          # レッスン一覧
    courses/[slug]/lessons/[lessonSlug]/page.tsx     # レッスン画面
    api/run/route.ts                                 # TS コード実行 API
    api/progress/route.ts                            # 進捗保存 API
  components/
    LessonClient.tsx                                 # Monaco + 実行結果 UI
  lib/
    prisma.ts                                        # Prisma シングルトン
    auth.ts                                          # requireAuth / requireRole (stub、#5 で実装)
    supabase/
      server.ts                                      # Server Component / Action / proxy 用 client
      client.ts                                      # Browser 用 client
  proxy.ts                                           # Next.js 16 proxy: Supabase セッション更新
prisma/
  schema.prisma                                      # Course / Lesson / Progress
  seed.ts                                            # 初期データ
prisma.config.ts                                     # Prisma 7: datasource URL / seed コマンド定義
docker-compose.yml                                   # Postgres 16 Alpine
```

## データモデル

- **Course**: コース (slug, title, description, order)
- **Lesson**: レッスン (contentMd: Markdown, starterCode: TS, expectedOutput)
- **Progress**: クリア記録 (userId は MVP では `"local-user"` 固定)

## レッスン判定

レッスンクリアは以下をすべて満たした場合:

1. `stderr` が空
2. タイムアウトしていない (`TIMEOUT_MS = 5000`)
3. プロセスの `exitCode` が 0
4. `stdout.trim() === expectedOutput.trim()`

## セキュリティ注意

`/api/run` はユーザー提供の TypeScript コードをサーバー側の `tsx` でそのまま実行する。**ローカル開発・学習用途のみを想定**。本番運用する場合は:

- コンテナ隔離 (Firecracker / gVisor / Docker-in-Docker)
- CPU / メモリ / ネットワーク制限
- 静的解析で危険な API 呼び出しを弾く

など別途対策が必要。

## データ取得 (SWR)

Client Component からの read は [SWR](https://swr.vercel.app/) を経由する。

- `src/lib/fetcher.ts` — `fetch` ラッパ。HTTP エラー時に `Error` を throw する
- `src/components/providers/SwrProvider.tsx` — `SWRConfig` で `fetcher` と共通オプションを供給。`src/app/layout.tsx` で root に配線済み
- `src/hooks/use<Domain>.ts` — ドメインごとに `useSWR` をラップするカスタムフック（例: `useProgress`）

使い分け:

- **Server Component** からの取得は SWR を使わず、直接 service 層を呼ぶ（`.claude/rules/tech-stack.md § 2.2`）。ブラウザに fetch のオーバーヘッドを持ち込まないため
- **mutation** は SWR ではなく Server Action に寄せる。SWR は `mutate()` で再検証するだけ
- `fetcher` の挙動（認証ヘッダ・base URL 等）をカスタマイズしたい場合は `src/lib/fetcher.ts` を編集する

## レッスンの追加

`prisma/seed.ts` の `courses` 配列にエントリを追加して `npm run db:reset` を実行する。

将来的には管理画面 or MDX ファイルシステムベースに置き換える想定。
