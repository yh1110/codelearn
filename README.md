# codelearn

Progate 風の TypeScript 学習プラットフォーム。ブラウザ上のエディタで TypeScript を書き、サーバー側で実行して結果を確認できる。

## 技術スタック

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Prisma 7** (driver adapter: `@prisma/adapter-pg`) + **PostgreSQL 16** (Docker)
- **Monaco Editor** でコード編集
- **tsx** でサーバー側 TypeScript 実行

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

## レッスンの追加

`prisma/seed.ts` の `courses` 配列にエントリを追加して `npm run db:reset` を実行する。

将来的には管理画面 or MDX ファイルシステムベースに置き換える想定。
