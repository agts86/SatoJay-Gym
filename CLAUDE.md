# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Agentic SDLC and Spec-Driven Development

Kiro-style Spec-Driven Development on an agentic SDLC

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro-spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro-steering`, `/kiro-steering-custom`
- Discovery: `/kiro-discovery "idea"` — determines action path, writes brief.md + roadmap.md for multi-spec projects
- Phase 1 (Specification):
  - Single spec: `/kiro-spec-quick {feature} [--auto]` or step by step:
    - `/kiro-spec-init "description"`
    - `/kiro-spec-requirements {feature}`
    - `/kiro-validate-gap {feature}` (optional: for existing codebase)
    - `/kiro-spec-design {feature} [-y]`
    - `/kiro-validate-design {feature}` (optional: design review)
    - `/kiro-spec-tasks {feature} [-y]`
  - Multi-spec: `/kiro-spec-batch` — creates all specs from roadmap.md in parallel by dependency wave
- Phase 2 (Implementation): `/kiro-impl {feature} [tasks]`
  - Without task numbers: autonomous mode (subagent per task + independent review + final validation)
  - With task numbers: manual mode (selected tasks in main context, still reviewer-gated before completion)
  - `/kiro-validate-impl {feature}` (standalone re-validation)
- Progress check: `/kiro-spec-status {feature}` (use anytime)

## Skills Structure
Skills are located in `.claude/skills/kiro-*/SKILL.md`
- Each skill is a directory with a `SKILL.md` file
- Skills run inline with access to conversation context
- Skills may delegate parallel research to subagents for efficiency
- Additional files (templates, examples) can be added to skill directories
- `kiro-review` — task-local adversarial review protocol used by reviewer subagents
- `kiro-debug` — root-cause-first debug protocol used by debugger subagents
- `kiro-verify-completion` — fresh-evidence gate before success or completion claims
- **If there is even a 1% chance a skill applies to the current task, invoke it.** Do not skip skills because the task seems simple.

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro-steering-custom`)

---

# コードベースガイド

## プロジェクト概要

スクレイピング練習用の架空トレーニングジムLP。T3 App構成のNext.js 16（App Router / React 19）アプリで、PostgreSQL に店舗・予約情報を保存する。tRPC 11・Prisma 6・Zod 4・Tailwind 4 を使用。パッケージマネージャは pnpm（Volta で Node/pnpm 固定）。

## コマンド

```bash
pnpm dev                     # 開発サーバ（next dev, :3000）
pnpm build                   # prisma generate + next build
pnpm lint                    # eslint .
pnpm test                    # vitest run + E2E（両方）
pnpm test:unit               # vitest のみ
pnpm test:unit:coverage      # カバレッジ付き
pnpm test:e2e                # E2E のみ（Playwright, tsx ランナー経由）
pnpm prisma:migrate          # ローカルDBへ schema 反映（db push）
pnpm prisma:seed             # 店舗 seed 投入
```

単体テスト1ファイル: `pnpm vitest run tests/unit/path/to/file.test.ts`
E2E 1ファイル: `pnpm test:e2e tests/e2e/lp.spec.ts`（引数は playwright にそのまま渡る）

### 起動前提（初回）
`.env.example` を `.env` へコピー → `pnpm install` → `docker compose -f docker-compose.dev.yml up -d db` → `pnpm prisma:migrate` → `pnpm prisma:seed` → `pnpm dev`

## アーキテクチャ

厳格なレイヤ分離。上位から下位への一方向依存:

```
app/（ページ, Server Component）
  ├─ features/（"use client" UI。reservation / admin / landing）
  ├─ server/actions.ts（Server Actions。フォーム送信・管理ログイン）
  └─ server/api/（tRPC ルータ: store / booking / admin）
        └─ server/services/（ドメインロジック）
              └─ server/repositories/（Prisma クエリ）
                    └─ server/prisma/（client, functions=withTransaction）
```

- **shared/**（`~/shared/*`）はレイヤ非依存の純粋モジュール。Zod スキーマ・型・時刻ユーティリティ・スクレイピングID。クライアント/サーバ両方から import 可。
- **サービス層は Prisma client を直接 import 禁止**（ESLint で強制）。必ず `server/prisma/functions.ts` の `withTransaction` か repository 関数を経由する。
- tRPC のサーバ内呼び出しは `src/trpc/server.ts` の `api()`（`createCaller`）を使う。ページからのデータ取得はこれ。
- 予約作成の入口は Server Action（`submitBooking`）と tRPC（`booking.create`）の2経路あるが、どちらも `services/booking-service.ts` の `createReservation` に集約される。

### 予約枠は「生成」であり永続化しない
空き枠テーブルは持たない。`services/availability-service.ts` が営業時間（毎日 10–19時、1時間枠）×30日ぶんの枠を**その場で生成**し、`Booking` の `startsAt` と突き合わせて予約済み判定する。予約の一意性は `Booking` の `@@unique([storeId, startsAt])` で担保。枠 ID は `${storeId}_${ISO文字列}` の形。

### 時刻の扱い（重要）
全ての枠時刻は UTC で保存し、表示・生成は JST（UTC+9）。`shared/tokyo-date.ts` に変換ロジックを集約。新しい日時処理は必ずここの関数（`createTokyoSlotUtc` / `formatTokyoDateKey` / `getTokyoDateRange` など）を使い、`new Date()` の暗黙ローカルタイムに依存しない。

### 認証
管理者認証は JWT ではなく **bcrypt パスワード検証 + HMAC-SHA256 署名 Cookie**（`services/admin-auth-service.ts`）。`payload.signature` 形式で `timingSafeEqual` 比較。`src/proxy.ts` が Next.js middleware として `/admin/bookings` 配下を Cookie 有無でガード（middleware 相当だがファイル名は `proxy.ts`）。tRPC の `adminProcedure` は context の `isAdmin` をチェック。

### 予約の冪等性
`booking-service.ts` は `submissionToken` 単位のリプレイキャッシュ（60秒）で二重送信を防ぐ。予約番号 `GYM-YYYYMMDD-NNNN` 生成は衝突時に最大5回リトライ。

### スクレイピング用ID
`shared/scrape-ids.ts` に全 UI 要素の識別子を集約。UI コンポーネントと E2E テストの両方がここを参照するので、UI に data 属性を足すときはこの定数を使う。

## テスト

- 単体: `tests/unit/`（vitest, node 環境, `globals: false`）。カバレッジ対象は `shared/**` と `services/**`。
- E2E: `tests/e2e/`。`tests/e2e/scripts/run.ts`（tsx）が Docker で使い捨て PostgreSQL（`postgres:16-alpine`, :55432）を起動 → `prisma db push` + seed → Playwright 実行。`E2E_DATABASE_URL` を指定すると外部DBを使い Docker 管理をスキップ。

## Prisma / DB

migration 履歴は持たず `prisma db push`（`prisma:migrate` / `prisma:deploy` とも `db push`）で schema を反映する。モデルは `Store` と `Booking` の2つ（`prisma/schema.prisma`）。

## 規約・注意点

- ESLint 追加ルール: `complexity: 10` / `max-depth: 3` / `@typescript-eslint/no-explicit-any: error`。関数はこれに収まるよう分割する。
- import エイリアス `~/*` → `src/*`。
- `.env` の bcrypt ハッシュは `$` を `\$` にエスケープする（Next.js が `.env` 内 `$` を変数展開するため）。開発用管理パスワードは `admin-password`。
- 本番 `Dockerfile` はコンテナ内で 80番を listen（Azure App Service 前提）。ローカル本番 compose は `APP_PORT=3000` で 3000→80 転送。
