# Shikan プロジェクト - Claude Code 知識ベース

## プロジェクト概要
コミュニティバスの路線計画を支援する地図ベースのWebアプリケーション。3画面構成（到達圏の条件設定 → コミュニティバスの条件設定 → 結果）で、各種施設への到達圏をビジュアライズし、効果的なバス路線の設計を支援します。

## 画面構成
アプリケーションは以下の3画面で構成されています：

### 1. 到達圏の条件設定画面
- **左パネル**: 対象スポット（病院等）、移動上限時間（30〜120分）を選択
- **右パネル**: 選択条件のサマリと到達可能人口を表示
- **地図**: 選択条件に応じた到達圏とスポットを表示

### 2. コミュニティバスの条件設定画面（簡易）
- **左パネル**: 周回所要時間（60〜120分）を選択
- **右パネル**: 前画面と同じサマリを表示
- **地図**: 選択条件に応じたバス停と経路を表示

### 3. 結果画面
- **左パネル**: バス停一覧、所要時間、経路長、サンプル経路
- **右パネル**: 導入前後の到達可能人口と増加量を表示
- **地図**: バス経路、バス停、到達圏（導入前後）を表示

## 技術スタック
- **フレームワーク**: Next.js 15.5.4 (App Router, Turbopack)
- **言語**: TypeScript 5
- **UI**: React 19.1.0, Tailwind CSS 4
- **地図**: Leaflet 1.9.4, react-leaflet 5.0.0
- **経路デコード**: @mapbox/polyline 1.2.1
- **ドラッグ&ドロップ**: @dnd-kit (core, sortable, utilities)
- **パッケージマネージャー**: npm

## 開発環境
- **開発サーバー**: 常にユーザーが起動済み
  - `npm run dev` は実行しない（既に起動している）
  - コード変更は自動でホットリロードされる
  - **型チェック**: `npm run build` は不要。開発サーバーが自動で型チェックするため、ファイル保存時に自動反映される
  - 型エラーのみ確認したい場合: `npx tsc --noEmit` を使用（数秒で完了）

## よく使うコマンド
```bash
npm run dev        # 開発サーバー起動（Turbopack使用）※ユーザーが常時起動済み
npx tsc --noEmit   # 型チェックのみ（ビルド不要、数秒で完了）
npm run build      # 本番ビルド（通常は不要、本番確認時のみ）
npm run start      # 本番サーバー起動
npm run lint       # ESLintチェック
```

## プロジェクト構成

### ディレクトリ構造
```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # メインページ（UnifiedMapViewを常に表示）
├── components/
│   ├── layout/             # レイアウト系コンポーネント
│   │   └── Header.tsx      # ヘッダー（ロゴ + パンくずナビ）
│   ├── condition/          # 到達圏の条件設定画面
│   │   ├── ConditionPanel.tsx    # 条件設定パネル（左）
│   │   └── SummaryPanel.tsx      # サマリパネル（右）
│   ├── bus-simple/         # コミュニティバス条件設定画面（簡易）
│   │   └── BusConditionPanel.tsx # バス生成条件パネル（左）
│   ├── result/             # 結果画面
│   │   ├── BusStopDetailPanel.tsx # バス停詳細パネル（左）
│   │   ├── ResultSummaryPanel.tsx # 結果サマリパネル（右）
│   │   └── SampleRoutePanel.tsx  # サンプル経路パネル（開発中）
│   ├── map/                # 地図関連コンポーネント
│   │   ├── Map.tsx         # Leaflet地図ベースコンポーネント
│   │   └── UnifiedMapView.tsx # 統合地図ビュー（全画面で共有）
│   ├── bus/                # バス関連コンポーネント
│   │   ├── BusStopMarker.tsx   # 停留所マーカー
│   │   └── BusRoutePolyline.tsx # バスルート線（矢印付き）
│   ├── layer/              # レイヤー系コンポーネント
│   │   ├── ReachabilityLayer.tsx # 到達圏ポリゴン表示
│   │   └── SpotMarker.tsx        # スポットマーカー
│   └── ui/                 # 汎用UIコンポーネント
│       ├── Panel.tsx           # 開閉パネル（320px固定幅）
│       └── Loading.tsx         # ローディングオーバーレイ
├── hooks/
│   └── useAppState.ts      # アプリケーション状態管理（3画面対応）
├── lib/
│   ├── api/                # API関連
│   │   ├── busStops.ts         # 停留所データ取得
│   │   ├── spots.ts            # スポットデータ取得
│   │   ├── reachabilityList.ts # 到達圏探索一覧取得
│   │   ├── stopSequences.ts    # バス停列一覧取得
│   │   └── areaSearch.ts       # 到達圏検索
│   └── utils/              # ユーティリティ関数
│       ├── facilityColors.ts   # 施設種別の色定義
│       ├── spotIcons.ts        # スポットアイコン定義
│       └── spotLabels.ts       # スポットラベル定義
└── types/
    └── index.ts            # 型定義（BusStop, AppState, ScreenType等）
```

### 主要コンポーネントの役割

#### [page.tsx](src/app/page.tsx)
- Client Component
- UnifiedMapViewを常に表示（画面切り替え時も再マウントされない）
- useAppStateから状態と関数を取得し、UnifiedMapViewに渡す

#### [UnifiedMapView.tsx](src/components/map/UnifiedMapView.tsx)
- **重要**: 全画面で共有される統合地図ビューコンポーネント
- Mapコンポーネントを永続的にマウント（画面遷移でアンマウントされない）
- currentScreenの値に応じて表示内容を条件分岐で切り替え
  - condition画面: 到達圏ポリゴン、スポットマーカー、ConditionPanel、SummaryPanel
  - bus-simple画面: 到達圏ポリゴン、スポットマーカー、バス停マーカー、バス経路、BusConditionPanel、SummaryPanel
  - result画面: 導入前後の到達圏ポリゴン、スポットマーカー、バス停マーカー、バス経路、BusStopDetailPanel、ResultSummaryPanel、SampleRoutePanel
- 地図のズーム率と中心位置が画面間で完全に維持される

#### [useAppState.ts](src/hooks/useAppState.ts)
- アプリケーション全体の状態管理フック
- 画面状態（currentScreen）、条件設定、API データを一元管理
- 初期表示時に4つのAPIを並列で取得（到達圏一覧、スポット、バス停列、バス停）
- `getCurrentReachability()`: 現在の条件に合致する到達圏を取得
- `getCurrentSpots()`: 現在の条件に合致するスポットを取得
- `getSelectedBusStops()`: 現在の条件に合致するバス停を取得
- `executeSearch()`: 結果画面遷移時に到達圏検索APIを実行

#### [Header.tsx](src/components/layout/Header.tsx)
- ロゴ（テキスト「コミュニティバスを作ろう！」）を表示
- パンくずナビゲーション（3ステップ）
- 過去の画面にクリックで戻れる

#### [Panel.tsx](src/components/ui/Panel.tsx)
- 左右配置対応のオーバーレイパネル
- 320px固定幅
- 開閉アニメーション付き

#### [BusRoutePolyline.tsx](src/components/bus/BusRoutePolyline.tsx)
- バス経路の描画コンポーネント
- API経路データがある場合: 実際の道路に沿った経路を描画
  - Polylineエンコード文字列をデコード
  - 停留所間ごとに方向矢印を配置
- API経路データがない場合: 選択停留所間を直線で描画

## データフロー

### API連携
アプリケーションは以下のAPIを使用します：

#### 初期表示時に取得するAPI
1. **到達圏探索一覧取得** `GET /area/search/all`
   - すべてのスポットタイプ・上限時間の到達圏を一括取得
   - レスポンス時間: 10〜20秒程度

2. **スポット一覧取得** `GET /area/spots`
   - スポット情報とスポットタイプ一覧を取得

3. **バス停列一覧取得** `GET /combus/stop-sequences`
   - スポットタイプと周回時間ごとの最適化されたバス停列を取得

4. **停留所データ取得** `GET /combus/stops`
   - 全停留所の座標と名称を取得

#### 結果画面遷移時に呼び出すAPI
- **到達圏検索** `POST /area/search`
  ```typescript
  // リクエスト
  {
    "target-spots": ["hospital"],
    "max-minute": 60,
    "combus-stops": ["comstop8", "comstop12", ...]
  }
  // レスポンス
  {
    result: {
      area: {
        hospital: {
          reachable: {
            original: MultiPolygon,
            "with-combus": MultiPolygon,
            "original-score": 12345,
            "with-combus-score": 5678,  // ※増加分
            "with-combus-score-rate": 46
          },
          spots: [...]
        }
      },
      combus: {
        "section-list": [...],
        "stop-list": [...]
      }
    },
    status: "OK"
  }
  ```

### 状態管理の流れ
1. **初期表示**: `useAppState`が4つのAPIを並列で取得
2. **条件設定画面**: 条件変更時に`getCurrentReachability()`で該当データを取得
3. **バス条件設定画面**: `getSelectedBusStops()`で該当バス停を取得
4. **結果画面遷移**: `executeSearch()`で到達圏検索APIを実行
5. **画面戻り**: パンくずクリックで`navigateTo()`、条件は保持される

### 地図状態の維持
- **重要**: UnifiedMapViewコンポーネントが全画面で共有されるため、地図のズーム率と中心位置が画面遷移時も完全に維持される
- 画面切り替え時にMapコンポーネントが再マウントされないため、タイルの再読み込みも発生しない
- ユーザーが地図を操作した状態（ズーム・パン）は、どの画面に遷移しても保持される

## コーディング規約

### スタイル
- **Client Components**: `'use client'` ディレクティブを明示
- **動的インポート**: Leaflet使用コンポーネントは `dynamic(() => import(...), { ssr: false })` でSSR無効化
- **Tailwind CSS**: ユーティリティファーストで記述
- **型安全性**: 明示的な型定義を使用（`types/index.ts`）

### 命名規則
- コンポーネント: PascalCase（例: `BusStopMarker`）
- フック: `use` + PascalCase（例: `useMapState`）
- 型: PascalCase（例: `BusStop`, `FacilityType`）
- 変数: camelCase

### 注意点
- Leafletは必ずクライアントサイドでのみ実行（SSR回避）
- GeoJSON MultiPolygon を FeatureCollection に変換してから表示
- API実行中は `isLoading` を true にしてローディング表示

## Git運用
- **メインブランチ**: `main`
- **ブランチ命名**: `feature/xxx` 形式
- **コミットメッセージ**: 日本語でOK（例: `feat: ○○機能を追加`）

### プロジェクトルール
**重要**: 以下のルールは必ず守ること
1. **ブランチ作成**: 作業開始時は必ずfeatureブランチを作成してから作業する（mainブランチへの直接コミットは禁止）
   - ブランチ命名: `feature/xxx` 形式
   - Issue番号がある場合は `feature/issue-番号-説明` も可
2. **タスク追加時**: ユーザーがタスクを追加したら、必ずGitHub Issueを作成する
   - `gh issue create` コマンドを使用
   - タイトルと説明を明確に記載
3. **コミット・プッシュ・プルリク作成時**:
   - **重要**: コミット、プッシュ、プルリクエストの作成は必ずユーザーの明示的な指示を受けてから実行する
   - 指示があるまではファイルの編集までで止める
   - PR本文に `Closes #<issue番号>` を記載
   - PRタイトルは過去のPRに倣う（例: `feat: ○○機能を追加`）

### セッション管理
- 基本的に **1 Issue = 1 Session** で運用
- Issue完了・PR作成・マージ後は新しいセッションを開始
- コンテキスト節約のため、セッション間でバックグラウンドプロセスは停止する

## その他
- API URL等の環境変数は `.env.local` で管理（未作成の場合は追加推奨）
- デプロイ: Vercel想定（`.vercel/` ディレクトリ存在）
