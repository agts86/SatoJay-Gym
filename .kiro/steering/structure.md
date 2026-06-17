# 構造方針

## 基本構造
- 責務分離は「フィーチャーベース + 内部は薄いレイヤー分離」を採用する。
- UIはfeature単位、server側はlayer単位で分ける。
- 純粋なレイヤード構成だけにして画面修正の横断量を増やさない。
- 完全なfeature閉じ込めにしてDBアクセスやAPI境界を散らさない。

## ディレクトリ方針
- `src/app/`: Next.js App RouterのURL単位のページとレイアウトを置く。
- `src/features/landing/`: LPのUIコンポーネントを置く。
- `src/features/reservation/`: 予約フローのUIコンポーネントと画面状態を置く。
- `src/features/admin/`: 管理画面のUIコンポーネントを置く。
- `src/server/api/routers/`: tRPC routerを置く。
- `src/server/services/`: 予約ルール、予約番号生成、競合制御、管理ログイン判定などの業務ルールを置く。
- `src/server/repositories/`: Prisma経由のDB読み書きを置く。
- `src/shared/`: scrape ids、Zod schema、共通型など複数境界で使うものを置く。

## レイヤー境界
- UIは表示、画面状態、ユーザー操作に集中する。
- tRPC routerは入出力契約、認証確認、service呼び出しに集中する。
- serviceは業務ルールを持ち、UIやDB詳細に依存しない。
- repositoryはPrisma経由のDB読み書きだけを担当する。
- DBアクセスをUI、featureコンポーネント、tRPC routerへ直接書かない。
- 共通定数、スクレイピング属性、Zod schemaは再利用できる場所に集約する。

## タスク完了の扱い
- ファイル作成だけではタスク完了にしない。
- 対象画面、API、DB挙動、またはテスト結果として観測できる状態になった時だけ完了にする。
- 各実装タスクの完了時に、関連する`id`/`data-scrape`属性が要求通り付与されていることを確認する。
- 実装で仕様ズレを見つけた場合は、コードで吸収せずrequirements/design/tasksへ戻す。
