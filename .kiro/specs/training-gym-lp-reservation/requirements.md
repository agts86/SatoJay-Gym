# Requirements Document

## Introduction
本機能は、体験トレーニングを検討している見込み客が、トレーニングジムの価値を理解し、都道府県から店舗を選び、店舗ごとの予約可能枠をカレンダーで確認して、予約者情報を入力し、確認画面で内容を確認してから体験予約を送信できる予約導線を提供する。運営者は送信された予約を一覧で確認でき、店舗名と希望日時を含む予約状況を把握できる。

## Boundary Context
- **In scope**: LP、都道府県選択、店舗一覧、店舗選択、店舗情報表示、店舗ごとの予約可能枠表示、初期データとして定義された全店舗共通10:00-20:00の1時間単位かつ30日先までの体験予約枠、空き枠選択、予約者情報入力、予約内容確認画面、送信完了画面、予約番号表示、1枠1名の予約保存、最小限の管理ログイン、管理用店舗一覧、店舗別予約一覧表示、スクレイピング練習用の安定したHTML属性
- **Out of scope**: 予約枠のリアルタイム在庫管理、スタッフ別スケジュール管理、複数管理者アカウント管理、ロール権限管理、オンライン決済、メール送信、SMS通知、外部カレンダー同期、CRM連携、予約ステータス管理
- **Adjacent expectations**: 店舗と予約可能枠は初期データとして事前に定義された情報として表示され、予約送信によってスタッフ別予定は更新しない。全店舗の営業時間は24時間営業として表示し、予約枠は全店舗共通で10:00から20:00までの1時間単位、当日を含む30日先まで、かつ1枠1名限定とする。予約済み枠は`予約済み`として表示するが選択不可とし、2画面操作中に別ユーザーが同じ枠を先に予約した場合は送信時にエラーとして扱う

## Requirements

### Requirement 1: LPから予約導線への誘導
**Objective:** As a 見込み客, I want ジムの魅力と体験予約への入口を確認したい, so that 迷わず予約フローを開始できる

#### Acceptance Criteria
1. The 予約システム shall `/` でトレーニングジムの価値提案、主なプログラム、料金または体験訴求、アクセスに関する情報を表示する
2. The 予約システム shall `/` で体験予約を開始するための導線を表示する
3. When ユーザーがLPの予約導線を選択する, the 予約システム shall `/reservation` に遷移する

### Requirement 2: 都道府県と店舗の選択
**Objective:** As a 見込み客, I want 都道府県から利用したい店舗を選びたい, so that 自分が通える店舗で体験予約を進められる

#### Acceptance Criteria
1. The 予約システム shall `/reservation` で都道府県選択、店舗一覧、店舗選択、空きカレンダー、空き枠選択を同一画面に表示できる構成にする
2. When ユーザーが都道府県を選択する, the 予約システム shall 選択都道府県に紐づく店舗一覧を表示する
3. The 予約システム shall `/reservation` で都道府県一覧として関東地方の都県のみを表示する
4. If 選択都道府県に紐づく店舗が存在しない, then the 予約システム shall 該当店舗がないことをユーザーに表示する
5. The 予約システム shall 初期データとして東京都に10店舗、神奈川県・千葉県・埼玉県に各4店舗、栃木県・群馬県・茨城県に各1店舗を持つ
6. When ユーザーが店舗を選択する, the 予約システム shall 選択店舗が分かる状態を表示する
7. While 店舗が未選択である, the 予約システム shall 空き枠選択を完了できない状態にする

### Requirement 3: 店舗情報の表示
**Objective:** As a 見込み客, I want 店舗の詳細情報を確認したい, so that 予約前に自分に合う店舗か判断できる

#### Acceptance Criteria
1. The 予約システム shall 店舗ごとに店舗名、都道府県、アクセス、営業時間、設備、対応プログラム、料金を表示できる
2. The 予約システム shall 全店舗の営業時間を24時間営業として表示する
3. When ユーザーが店舗一覧を閲覧する, the 予約システム shall 店舗選択に必要な主要情報を表示する
4. When ユーザーが店舗を選択する, the 予約システム shall 選択店舗の詳細情報を確認できる状態にする
5. If 店舗情報の一部が未登録である, then the 予約システム shall 未登録項目によって予約フロー全体が停止しないように表示する

### Requirement 4: 予約可能枠カレンダー
**Objective:** As a 見込み客, I want 選択店舗の予約可能日時をカレンダーで選びたい, so that 希望する体験日時を指定できる

#### Acceptance Criteria
1. When ユーザーが店舗を選択する, the 予約システム shall 選択店舗に定義された予約可能枠をカレンダー形式で表示する
2. The 予約システム shall 予約可能枠を初期データとして定義された枠から表示する
3. The 予約システム shall 予約可能枠を全店舗共通で10:00から20:00までの時間帯として扱う
4. The 予約システム shall 予約可能枠を当日を含む30日先までの範囲で表示する
5. The 予約システム shall 予約可能枠を1時間単位の日付と時刻が分かる形式で表示する
6. The 予約システム shall 予約可能枠を1枠1名限定として扱う
7. The 予約システム shall 予約済み枠をカレンダー上に`予約済み`として表示するが選択不可として扱う
8. When ユーザーが予約可能枠を選択する, the 予約システム shall 選択された空き枠を識別できる状態で表示する
9. While 空き枠が未選択である, the 予約システム shall `/reservation/form` へ進む操作を完了できない状態にする
10. If 選択店舗に予約可能枠が存在しない, then the 予約システム shall 選択可能な枠がないことをユーザーに表示する
11. The 予約システム shall 予約送信時にスタッフ別予定の更新を行わない

### Requirement 5: 予約者情報入力
**Objective:** As a 見込み客, I want 選択内容を確認して予約者情報を入力したい, so that 正しい内容で体験予約を送信できる

#### Acceptance Criteria
1. When ユーザーが `/reservation` で空き枠を選択して次へ進む, the 予約システム shall `/reservation/form` に遷移する
2. The 予約システム shall `/reservation/form` で選択済みの店舗名、都道府県、予約日時を表示する
3. The 予約システム shall `/reservation/form` で氏名、メールアドレス、電話番号、トレーニング目的、備考を入力できるフォームを表示する
4. The 予約システム shall 氏名、メールアドレス、電話番号、トレーニング目的を必須入力項目として扱い、備考を任意入力項目として扱う
5. When ユーザーが有効な予約者情報の入力を完了する, the 予約システム shall `/reservation/confirm` に遷移する
6. If 必須入力項目が未入力で入力完了操作が行われる, then the 予約システム shall 確認画面へ進まず、修正が必要な項目をユーザーに表示する
7. If メールアドレスまたは電話番号が連絡先として不正な形式で入力される, then the 予約システム shall 確認画面へ進まず、該当項目の修正をユーザーに表示する
8. The 予約システム shall 電話番号入力でハイフンを許容する緩めの形式検証を行う
9. If 選択済みの店舗または空き枠が確認できない状態で `/reservation/form` が表示される, then the 予約システム shall `/reservation` に戻す
10. When ユーザーが `/reservation/confirm` から `/reservation/form` に戻る, the 予約システム shall 入力済みの予約者情報、選択店舗、選択枠を保持する

### Requirement 6: 予約確認、送信と完了表示
**Objective:** As a 見込み客, I want 入力内容を確認してから予約を送信し、完了と予約番号を確認したい, so that 体験予約を申し込めたことを把握できる

#### Acceptance Criteria
1. The 予約システム shall `/reservation/confirm` で選択店舗、都道府県、予約日時、氏名、メールアドレス、電話番号、トレーニング目的、備考を表示する
2. When ユーザーが確認画面の送信ボタンを押下する, the 予約システム shall 店舗、空き枠、氏名、メールアドレス、電話番号、目的、備考を含む予約データを保存する
3. When 予約データの保存が完了する, the 予約システム shall 予約番号を発行して `/reservation/thanks` に遷移する
4. The 予約システム shall 予約番号を`GYM-YYYYMMDD-0001`形式の人間が読める形式で発行する
5. The 予約システム shall 予約番号の末尾4桁をアプリケーションコード側で生成する
6. The 予約システム shall `/reservation/thanks` で送信完了が分かるメッセージと予約番号を表示する
7. If 予約データの保存に失敗する, then the 予約システム shall 送信が完了していないことをユーザーに表示する
8. If ユーザーが選択した空き枠を別ユーザーが先に予約済みである, then the 予約システム shall 予約を保存せず、`枠が埋まりましたので別の日時を選んでください`と表示する
9. The 予約システム shall `/reservation/confirm` の送信ボタンを二度押し不可として扱う
10. If 選択済みの予約内容または予約者情報が確認できない状態で `/reservation/confirm` が表示される, then the 予約システム shall `/reservation` に戻す
11. The 予約システム shall 予約送信後に決済、メール送信、SMS送信、外部カレンダー同期を必須処理として要求しない

### Requirement 7: 管理者向け最小導線
**Objective:** As a 運営者, I want ログイン後に店舗を選んで予約一覧を確認したい, so that 店舗ごとの体験予約希望を最低限把握できる

#### Acceptance Criteria
1. The 予約システム shall `/admin/login` で管理者向けログイン画面を表示する
2. When 運営者が有効な管理者パスワードでログインする, the 予約システム shall `/admin/bookings` に遷移する
3. If 管理者パスワードが不正である, then the 予約システム shall ログインを完了せず、認証に失敗したことを表示する
4. The 予約システム shall `/admin/bookings` で予約確認対象の店舗一覧を表示する
5. When 運営者が店舗一覧から店舗を選択する, the 予約システム shall `/admin/bookings/{storeId}` に遷移する
6. The 予約システム shall `/admin/bookings/{storeId}` で指定店舗の保存済み予約一覧を表示する
7. The 予約システム shall 店舗別予約一覧を予約日時の昇順で表示する
8. The 予約システム shall 予約一覧に店舗名と希望日時を表示する
9. The 予約システム shall 予約一覧に氏名、メールアドレス、電話番号、目的、備考を表示する
10. If 指定店舗の保存済み予約が存在しない, then the 予約システム shall 予約がないことを運営者に表示する
11. If 未ログインの利用者が `/admin/bookings/{storeId}` に直接アクセスする, then the 予約システム shall `/admin/login` に戻す
12. The 予約システム shall `/admin/bookings/{storeId}` で予約ステータス更新、決済処理、メール送信、外部カレンダー同期を提供しない

### Requirement 8: URL構成と画面遷移
**Objective:** As a 見込み客または運営者, I want 役割ごとに明確なURLで画面へアクセスしたい, so that 目的の操作に迷わず到達できる

#### Acceptance Criteria
1. The 予約システム shall `/` をLPとして提供する
2. The 予約システム shall `/reservation` を都道府県選択、店舗選択、空きカレンダー、空き枠選択の画面として提供する
3. The 予約システム shall `/reservation/form` を予約者情報入力画面として提供する
4. The 予約システム shall `/reservation/confirm` を予約内容確認画面として提供する
5. The 予約システム shall `/reservation/thanks` を完了画面として提供する
6. The 予約システム shall `/admin/login` を管理者ログイン画面として提供する
7. The 予約システム shall `/admin/bookings` を管理用店舗一覧画面として提供する
8. The 予約システム shall `/admin/bookings/{storeId}` を店舗別予約一覧画面として提供する

### Requirement 9: スクレイピング練習用の安定属性
**Objective:** As a スクレイピング練習者, I want 表示文言やCSSクラス名に依存しない安定したHTML属性を使いたい, so that 画面デザインや文言変更後もスクレイピングコードを壊れにくくできる

#### Acceptance Criteria
1. The 予約システム shall スクレイピング練習で参照する主要なセクション、フォーム、店舗一覧、カレンダー、空き枠、管理画面の予約一覧に安定した`id`属性または`data-scrape`属性を付与する
2. The 予約システム shall ページ内で一意の要素に`id`属性を使用し、店舗カード、空き枠、予約行などの繰り返し要素に`data-scrape`属性を使用する
3. The 予約システム shall 表示文言やCSSクラス名が変更されてもスクレイピング対象を識別できるように、機能的な意味に基づく安定した属性名を使用する
4. The 予約システム shall LP主要セクションに`hero`、`programs`、`pricing`、`trainers`、`access`、`faq`、`reservation-cta`を識別できる`id`属性を付与する
5. The 予約システム shall `/reservation` の一意要素に`prefecture-select`、`store-list`、`availability-calendar`、`selected-slot`、`reservation-next-button`を識別できる`id`属性を付与する
6. The 予約システム shall `/reservation` の繰り返し要素に`store-card`、`available-slot`を識別できる`data-scrape`属性を付与する
7. The 予約システム shall `/reservation/form` の一意要素に`reservation-form`、`customer-name`、`customer-email`、`customer-phone`、`training-goal`、`customer-note`、`reservation-submit-button`を識別できる`id`属性を付与する
8. The 予約システム shall `/reservation/confirm` の一意要素に`reservation-confirm`、`reservation-confirm-submit-button`を識別できる`id`属性を付与する
9. The 予約システム shall `/reservation/thanks` の一意要素に`reservation-thanks`、`reservation-summary`、`reservation-number`を識別できる`id`属性を付与する
10. The 予約システム shall `/admin/login` の一意要素に`admin-login-form`、`admin-password`、`admin-login-button`を識別できる`id`属性を付与する
11. The 予約システム shall `/admin/bookings` の一意要素に`admin-store-list`を識別できる`id`属性を付与する
12. The 予約システム shall `/admin/bookings` の繰り返し要素に`admin-store-card`を識別できる`data-scrape`属性を付与する
13. The 予約システム shall `/admin/bookings/{storeId}` の一意要素に`admin-bookings-table`を識別できる`id`属性を付与する
14. The 予約システム shall `/admin/bookings/{storeId}` の繰り返し要素に`booking-row`を識別できる`data-scrape`属性を付与する
15. The 予約システム shall `/admin/bookings/{storeId}` の予約行内の項目に`booking-store`、`booking-datetime`、`booking-customer-name`、`booking-customer-email`、`booking-customer-phone`を識別できる`data-scrape`属性を付与する
