# SatoJay-Gym

スクレイピング練習用の架空トレーニングジムLPです。T3 App構成のNext.jsアプリで、PostgreSQLに店舗、予約可能枠、予約情報を保存します。

## セットアップ

### ローカル

1. `.env.example`を`.env`へコピーする
2. `pnpm install`
3. `docker compose -f docker-compose.dev.yml up -d db`
4. `pnpm prisma:migrate`
5. `pnpm prisma:seed`
6. `pnpm dev`

### Dev Container

1. `.env.example`を`.env`へコピーする
2. VS Codeで「Dev Containers: Reopen in Container」を実行する
3. 初回起動後に `pnpm prisma:migrate` を実行する
4. `pnpm prisma:seed` を実行する

Dev Containerは `docker-compose.dev.yml` を使い、`app` と `db` の2サービスを起動します。`app` は `/app` をworkspaceとして使い、`3000` と `5432` をforwardします。

`app` の開発用イメージは `Dockerfile.dev` で定義し、Docker Hubの `node:*` ではなくMCRのPlaywrightイメージを使います。これによりDev Container内でもPlaywright実行に必要なブラウザを同梱できます。

Dev Container内ではCodex CLIも使えます。ホストの `~/.codex` を `/home/ubuntu/.codex` にマウントするため、ホスト側でログイン済みならその認証を共有できます。未ログインの場合は、コンテナ内ターミナルで `codex` を実行してサインインしてください。

### Production Compose

本番相当のDocker Composeは `docker-compose.yml` です。`app` と `db` の2サービス構成で、将来k8sへ移す前提でAppとDBの境界、環境変数、DB永続volumeを分けています。

1. `.env.production.example`を`.env.production`へコピーする
2. `ADMIN_PASSWORD_HASH`と`ADMIN_SESSION_SECRET`を本番値に変更する
3. `docker compose --env-file .env.production build`
4. `docker compose --env-file .env.production run --rm app pnpm prisma:deploy`
5. `docker compose --env-file .env.production run --rm app pnpm prisma:seed`
6. `docker compose --env-file .env.production up -d`

本番用 `Dockerfile` はAzure App Serviceのcustom container既定に合わせて、コンテナ内では80番でlistenします。ローカルでは `APP_PORT=3000` によりホストの3000番からコンテナの80番へ転送します。別ポートで動かす場合はAzure側に `WEBSITES_PORT` を設定してください。

### Volta

Node.jsとpnpmは `package.json` のVolta設定で固定しています。

- Node.js: `24.11.1`
- pnpm: `10.26.0`

## URL

- `/`: LP
- `/reservation`: 都道府県選択、店舗選択、空きカレンダー
- `/reservation/form`: 予約者情報入力
- `/reservation/confirm`: 確認画面
- `/reservation/thanks`: 完了画面
- `/admin/login`: 管理ログイン
- `/admin/bookings`: 管理用店舗一覧
- `/admin/bookings/{storeId}`: 店舗別予約一覧

## 開発用管理ログイン

- パスワード: `admin-password`
- `.env` の bcrypt ハッシュは `$` を `\$` としてエスケープする。Next.js が `.env` 内の `$` を変数展開するため。

## 検証

- `pnpm lint`
- `pnpm build`
- `pnpm test`

## Prisma

このプロジェクトはPrisma migration履歴を保持せず、`prisma db push`でschemaをDBへ反映します。

- `pnpm prisma:migrate`: ローカルDBへschemaを反映
- `pnpm prisma:deploy`: 本番相当DBへschemaを反映
- `pnpm prisma:seed`: 店舗seedを投入
