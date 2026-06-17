# Research & Design Decisions

## Summary
- **Feature**: `training-gym-lp-reservation`
- **Discovery Scope**: New Feature
- **Key Findings**:
  - リポジトリにはT3 App構成の実装が追加済みであり、今後の設計判断は既存の`src/app`、`src/features`、`src/server`、`prisma`構成へ追従する必要がある。
  - Create T3 AppのApp Router構成は、`src/app`をルーティング、`src/server`をサーバー専用コード、`prisma/schema.prisma`をDBスキーマとして分離する前提に合う。
  - 1枠1名の競合防止は、予約可能枠IDに対する予約の一意制約と、予約作成時の原子的な保存処理で扱う。
  - 本機能はスクレイピング練習用の架空LPであり、seedは関東地方の架空店舗に限定する。

## Research Log

### T3 App App Router構成
- **Context**: 新規LP、予約フロー、管理画面を同一アプリで構築するため、T3 Appの標準構成を確認した。
- **Sources Consulted**:
  - https://create.t3.gg/
  - https://create.t3.gg/en/folder-structure-app
- **Findings**:
  - Create T3 Appは型安全なNext.jsアプリの初期構築を目的としている。
  - App Router構成では`src/app`がNext.jsルート、`src/server`がサーバー専用コード、`src/server/api`がtRPCルーター、`src/server/db.ts`がPrisma Clientの入口になる。
  - `prisma`ディレクトリは`schema.prisma`、migration、seed scriptの置き場として扱える。
- **Implications**:
  - ルート画面は`src/app`配下へ配置し、サーバー処理は`src/server`配下へ閉じる。
  - 管理ログインは最小限とし、複数管理者やロール権限は扱わない。

### PrismaとPostgreSQL
- **Context**: 店舗、予約可能枠、予約データを保存し、1枠1名の競合を防ぐ必要がある。
- **Sources Consulted**:
  - https://create.t3.gg/en/usage/prisma
  - https://www.prisma.io/docs/orm/prisma-client/queries/transactions
  - https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- **Findings**:
  - T3 AppのPrisma利用では、`prisma/schema.prisma`でDBスキーマを定義し、`src/server/db.ts`から型安全なPrisma Clientを利用する。
  - PrismaはトランザクションAPIを提供し、read-modify-writeや複数writeの整合性を扱える。
  - Prismaの`@@unique`はリレーショナルDBのUNIQUE制約に対応し、複合一意制約も定義できる。
- **Implications**:
  - `Booking.slotId`を一意にし、同じ予約可能枠に複数予約が保存されないようにする。
  - 予約作成時は予約可能枠の存在確認と予約保存を同じサーバー側処理に閉じ、競合時はユーザー向けエラーへ変換する。

### Next.js App Routerとフォーム送信
- **Context**: LP、予約フロー、確認画面、Thanks、店舗別管理一覧のURLを設計する必要がある。
- **Sources Consulted**:
  - https://nextjs.org/docs/app
  - https://nextjs.org/docs/app/getting-started/updating-data
- **Findings**:
  - Next.js App Routerは`app`ディレクトリのファイル構成でURLを表現する。
  - Server Functionsはフォーム送信に利用でき、Reactの`form` actionと組み合わせられる。
  - 本設計では、画面間状態保持、カレンダー選択、確認画面遷移があるため、予約フローはクライアント状態とtRPC mutationを組み合わせる方がUI制御しやすい。
- **Implications**:
  - `src/app/reservation`配下のページでステップを分け、選択状態はクライアント側の予約ドラフトストアで保持する。
  - 直接アクセスでドラフトがない場合は`/reservation`へ戻す。

### 入力検証
- **Context**: 必須項目、メール、電話番号、スクレイピング属性を含むフォーム境界を型安全にしたい。
- **Sources Consulted**:
  - https://zod.dev/
  - https://create.t3.gg/en/usage/trpc
- **Findings**:
  - ZodはTypeScript-firstのスキーマ検証と型推論を提供する。
  - tRPCはZod inputを組み合わせた型安全なAPI手続きを定義できる。
- **Implications**:
  - UIフォーム、tRPC input、サーバー保存処理は共通Zod schemaから型を導出し、`any`を使わない。
  - 確認画面で表示する予約ドラフトも同一schemaで検証する。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| T3 App標準レイヤー | App Router UI、tRPC API、Prisma repositoryを分ける | T3標準に沿い、型安全で小さい | 画面数が増えるとUI状態管理が必要 | 採用 |
| Server Actions中心 | Form actionで予約作成を直接実行 | 依存が少ない | カレンダー選択、確認画面、ドラフト保持との相性が弱い | 不採用 |
| 外部予約サービス委譲 | 予約フォームや枠管理を外部化 | 実装が軽い | DB保存、スクレイピング練習、競合制御要件に合わない | 不採用 |

## Design Decisions

### Decision: T3 App標準構成を維持する
- **Context**: 既存実装はT3 App + PostgreSQLで構築済みであり、今後の拡張でもこの構成を崩さない。
- **Alternatives Considered**:
  1. 手動Next.js構成
  2. T3 App標準構成
- **Selected Approach**: リポジトリ直下のNext.js App Router、tRPC、Prisma、Tailwind CSS import + custom CSS、TypeScript構成を維持する。
- **Rationale**: 必要な型安全性、ルーティング、DB接続、API境界が揃う。
- **Trade-offs**: feature/UI、server、sharedの境界を守る必要があるが、後続実装の一貫性が高い。
- **Follow-up**: NextAuthは導入せず、現在の単一管理パスワード方式を維持する。

### Decision: 予約競合は予約データの一意制約で防ぐ
- **Context**: リアルタイム在庫管理はOutだが、1枠1名限定はIn。
- **Alternatives Considered**:
  1. カレンダー表示時に枠をロックする
  2. 予約送信時に一意制約で確定する
- **Selected Approach**: `Booking.slotId`を一意にし、予約可能枠は`○`、予約不可または予約済み枠は`×`表示で選択不可にし、送信時に既予約なら競合エラー`枠が埋まりましたので別の日時を選んでください`を返す。
- **Rationale**: 2画面操作中の競合要件に合い、予約枠ロックやリアルタイム在庫管理を導入しない。
- **Trade-offs**: カレンダー表示後に枠が取られる可能性は残るが、要件上は送信時エラーで十分。
- **Follow-up**: 競合エラーのUI文言とE2Eテストを実装時に確認する。

### Decision: 予約ドラフトはReact ContextとsessionStorageで保持する
- **Context**: `/reservation`、`/reservation/form`、`/reservation/confirm`で選択内容を引き継ぐ必要がある。
- **Alternatives Considered**:
  1. URL queryに全情報を保持
  2. DBに下書きを保存
  3. React Contextなどのクライアント状態に保持
  4. React Contextと`sessionStorage`を併用する
- **Selected Approach**: React Contextと`sessionStorage`による予約ドラフトストアで、店舗、枠、入力情報を保持する。
- **Rationale**: 下書き保存はOut of scopeであり、URLに個人情報を載せず、画面遷移や確認画面から戻る操作でも入力値を維持できる。
- **Trade-offs**: ブラウザ内の一時状態なので別端末共有はできない。直接アクセス時にドラフトがなければ`/reservation`に戻す。
- **Follow-up**: 実装時に状態消失時のredirectと、送信時のサーバー側枠再検証を統一する。

### Decision: ローカル開発と本番相当のDocker構成を分ける
- **Context**: PostgreSQLが必須であり、環境差を抑えて実装、migration、seed、E2E確認を行う必要がある。
- **Alternatives Considered**:
  1. ホストOSにPostgreSQLを直接インストール
  2. DBのみDocker、appはホストで実行
  3. appとDBをDocker Composeで起動
- **Selected Approach**: `docker-compose.dev.yml`をローカル開発用、`docker-compose.yml`を本番相当構成として分ける。DB情報は`.env`または`.env.local`で管理し、ホスト実行時は`.env.local`が`.env`より優先される。
- **Rationale**: 開発用と本番相当の責務を分けつつ、Prisma migrationとseedの再現性を保てる。
- **Trade-offs**: 環境変数の優先順位に注意が必要だが、READMEとspecで明示すれば切り分けしやすい。
- **Follow-up**: `.env.example`に`DATABASE_URL`とPostgreSQL関連変数を記載し、`.env`と`.env.local`はコミットしない。

### Decision: パッケージマネージャとテスト基盤を固定する
- **Context**: T3 App、Prisma、Playwright、Dockerを組み合わせるため、実装時のコマンドと依存解決を固定する必要がある。
- **Alternatives Considered**:
  1. npm
  2. pnpm
  3. bun
- **Selected Approach**: パッケージマネージャは`pnpm`、ユニット/統合テストはVitest、E2EテストはPlaywrightに固定する。
- **Rationale**: T3 App、Prisma、Playwright周辺の安定性と情報量を優先し、bun固有の切り分けを避ける。
- **Trade-offs**: bunの高速性は採用しないが、実装と検証の再現性を優先する。
- **Follow-up**: `pnpm lint`、`pnpm build`、`pnpm test`を完了前検証コマンドとして整える。

### Decision: DB保存時刻と業務日付の基準を分ける
- **Context**: PostgreSQL保存時刻、予約枠表示、30日範囲判定、予約番号の日付部分でタイムゾーンの扱いを揃える必要がある。
- **Alternatives Considered**:
  1. 全てUTC基準で扱う
  2. 全てAsia/Tokyo基準で保存する
  3. DB保存はUTC基準、業務日付と表示はAsia/Tokyo基準にする
- **Selected Approach**: DB時刻は`timestamptz`相当でUTC基準保存とし、予約枠表示、30日範囲判定、予約番号の`YYYYMMDD`は`Asia/Tokyo`基準にする。
- **Rationale**: DB保存の一貫性を保ちつつ、日本向け予約画面で日付ズレを避けられる。
- **Trade-offs**: サーバー処理で`Asia/Tokyo`変換が必要になるが、予約番号とカレンダー表示の意味が明確になる。
- **Follow-up**: `AvailabilityService`と`BookingService`のテストで`Asia/Tokyo`基準の日付判定を検証する。

### Decision: 予約番号の末尾4桁はコード側で生成する
- **Context**: 予約番号は`GYM-YYYYMMDD-0001`形式を維持したいが、DB件数やDBシーケンスに依存した採番は避けたい。
- **Alternatives Considered**:
  1. DBシーケンスで採番する
  2. 当日件数をDB集計して連番にする
  3. コード側で4桁数字を生成し、重複時に再試行する
- **Selected Approach**: `YYYYMMDD`は`Asia/Tokyo`基準の日付、末尾4桁はアプリケーションコード側で生成し、予約番号重複時は再生成で再試行する。
- **Rationale**: 予約番号の生成責務をアプリケーションコード側に置けるため、DB件数依存を避けつつ人間可読性を維持できる。
- **Trade-offs**: 厳密な連番ではなくなるが、ユースケース上は一意で読めれば十分。
- **Follow-up**: `BookingService`で重複再試行回数を制限し、最終的な一意性はDB unique制約で守る。

### Decision: 本番想定はAzure App Service単一コンテナと外部PostgreSQLにする
- **Context**: 開発はDocker Composeで行うが、本番はAzure App Serviceの単一コンテナにし、DBはNeonなど別サービスで立てる想定がある。
- **Alternatives Considered**:
  1. 本番もappとDBを同一Composeで運用
  2. Azure App Service単一コンテナ + 外部PostgreSQL
  3. 本番戦略を未定にする
- **Selected Approach**: `Dockerfile`はAzure App Service単一コンテナ向けに使い、本番DBは`DATABASE_URL`で外部PostgreSQLへ接続する。GitHub ActionsでGHCRへSHAタグのイメージをpushし、Azure Web App `sato-jay-gym`へデプロイする。
- **Rationale**: appとDBの責務を本番で分離でき、NeonなどのマネージドPostgreSQLに接続しやすい。
- **Trade-offs**: CI/CD上のmigration自動実行は別途設計が必要。
- **Follow-up**: migration/seedは手動実行またはSQL投入で扱い、workflow triggerはmain push + アプリ関連pathへ絞る。

### Decision: seedは関東の架空店舗に限定する
- **Context**: スクレイピング練習用の架空LPであり、実在店舗や実運用と混同されないサンプルデータが必要。
- **Alternatives Considered**:
  1. 全国47都道府県に店舗を用意する
  2. 関東地方の架空店舗に限定する
  3. 1店舗だけにする
- **Selected Approach**: 関東地方の架空店舗を`SatoJay Gym 錦糸町店`のような命名でseedし、東京都10店舗、神奈川県・千葉県・埼玉県各4店舗、栃木県・群馬県・茨城県各1店舗を用意し、各店舗に`Asia/Tokyo`基準で当日を含む30日分の10:00-20:00予約枠を生成する。
- **Rationale**: 店舗選択と都道府県絞り込みの練習に十分で、seedの複雑さを抑えられる。
- **Trade-offs**: 全国検索の練習にはならないが、現要件とE2Eの再現性では関東固定が適切。
- **Follow-up**: 住所、トレーナー名、トレーナー人数、スタッフ別枠は扱わず、各予約枠1名限定のみを守る。

### Decision: 電話番号はハイフン許容の緩い検証にする
- **Context**: 体験予約フォームの入力負荷を下げつつ、明らかな不正値だけを弾きたい。
- **Alternatives Considered**:
  1. 厳密な国内電話番号形式にする
  2. ハイフン許容の緩い形式検証にする
  3. 電話番号を未検証にする
- **Selected Approach**: ハイフンを許容しつつ、極端に短い/長い値や数字らしくない値を弾く緩い形式検証にする。
- **Rationale**: UXを損なわず、入力時の手戻りを減らせる。
- **Trade-offs**: 厳密な正規化は行わないため、保存値の表記揺れは残る。
- **Follow-up**: Zod schemaとフォームUIで同じ検証ルールを使う。

### Decision: 確認画面送信は二度押し不可にする
- **Context**: 同一予約の重複送信と誤操作を避けたい。
- **Alternatives Considered**:
  1. 二度押し可能のままサーバーだけで吸収する
  2. 送信中はボタンを無効化する
  3. 送信確認モーダルを追加する
- **Selected Approach**: `/reservation/confirm`の送信ボタンは送信中に無効化し、二度押し不可にする。
- **Rationale**: 実装コストが低く、誤送信防止の効果が高い。
- **Trade-offs**: UI状態管理が少し増えるが、確認画面の責務内で完結する。
- **Follow-up**: E2Eで二度押し不可と競合時エラー文言を確認する。

### Decision: 管理画面は単一パスワードの最小ログインにする
- **Context**: 管理画面はおまけでよく、運営者はログイン後に店舗一覧から店舗別予約情報を見るだけでよい。
- **Alternatives Considered**:
  1. NextAuthによる本格認証
  2. 単一管理パスワードとHTTP-only cookie
  3. 認証なしで管理画面を公開
- **Selected Approach**: `.env`の管理者パスワードハッシュを検証し、HTTP-only cookieで最小セッションを持つ。
- **Rationale**: 管理画面への入口を最低限保護しつつ、複数ユーザーやロール権限の複雑さを避ける。
- **Trade-offs**: 本番運用に十分なユーザー管理や監査ログは提供しない。
- **Follow-up**: `.env.example`に`ADMIN_PASSWORD_HASH`と`ADMIN_SESSION_SECRET`を追加する。

## Risks & Mitigations
- 予約番号の具体形式 — 設計では人間可読の`GYM-YYYYMMDD-0001`形式を採用し、`YYYYMMDD`は`Asia/Tokyo`基準、末尾4桁はコード生成と重複再試行で扱う。
- 管理ログインが簡易的である — 架空LPの練習用途に限定し、本格的なユーザー管理はOut of Boundaryに残す。
- 当日から30日先までの枠生成が曖昧 — seedで店舗別に30日分を生成し、表示はDBの初期データのみを使う。
- `.env`の秘匿情報漏えい — `.env.example`のみをコミットし、`.env`は`.gitignore`対象にする。
- 架空LPが実在店舗に見えるリスク — 店舗名と本文は架空であることが分かる表現にし、READMEにも練習用であることを明記する。

## References
- [Create T3 App](https://create.t3.gg/) — T3 Appの目的と構成要素
- [Create T3 App Folder Structure App](https://create.t3.gg/en/folder-structure-app) — App Router構成の標準ファイル配置
- [Create T3 App Prisma](https://create.t3.gg/en/usage/prisma) — Prisma schema、client、seedの扱い
- [Next.js App Router Docs](https://nextjs.org/docs/app) — App Routerとファイルベースルーティング
- [Next.js Updating Data](https://nextjs.org/docs/app/getting-started/updating-data) — Server Functionsとフォーム更新
- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) — トランザクションとread-modify-write
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference) — `@unique`、`@@unique`制約
- [Zod](https://zod.dev/) — TypeScript-first validation
