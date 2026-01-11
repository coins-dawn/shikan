# Shikan プロジェクト - Claude Code 知識ベース

## プロジェクト概要
コミュニティバスの路線計画を支援する地図ベースのWebアプリケーション。4画面構成で、各種施設への到達圏をビジュアライズし、効果的なバス路線の設計を支援する。

## 画面構成
アプリケーションは以下の4画面で構成：

### 1. 到達圏の条件設定（condition）
- **左パネル**: 対象スポット（病院等）、移動上限時間、徒歩距離上限を選択
- **右パネル**: 選択条件のサマリと到達可能人口を表示
- **地図**: 選択条件に応じた到達圏ポリゴンとスポットマーカーを表示

### 2. コミュニティバス条件設定・簡易（bus-simple）
- **左パネル**: 周回所要時間を選択、マッチング経路を一覧表示して選択
- **右パネル**: 前画面と同じサマリを表示
- **地図**: 選択経路に応じたバス停マーカーとバス経路を表示

### 3. コミュニティバス条件設定・手動（bus-manual）
- **左パネル**: バス停をドラッグ&ドロップで選択・並び替え
- **右パネル**: 前画面と同じサマリを表示
- **地図**: 選択バス停に応じたバス停マーカーとバス経路（直線）を表示

### 4. 結果（result）
- **左パネル**: バス停一覧、所要時間、経路長を表示
- **中パネル**: サンプル経路（導入前後の比較）を表示
  - 導入前経路（グレー）と導入後経路（コミバス区間=青、徒歩区間=緑）
  - 1600m間隔で進行方向矢印を表示
  - ゴール地点にフラグマーカーを表示
- **右パネル**: 導入前後の到達可能人口と増加量を表示
- **地図**: バス経路、バス停、到達圏（導入前後）、サンプル経路を表示

### 全画面共通機能
- **地図左上**: レイヤーコントロールパネル
  - 公共交通表示切替チェックボックス（東根市民バス）
  - 人口メッシュ表示切替チェックボックス（e-Stat国勢調査2020年）
  - ヘルプボタン（?）でヘルプダイアログを表示

## 技術スタック
- **フレームワーク**: Next.js 15.5.7 (App Router, Turbopack)
- **言語**: TypeScript 5
- **UI**: React 19.1.0, Tailwind CSS 4
- **地図**: Leaflet 1.9.4, react-leaflet 5.0.0
- **経路描画**: @mapbox/polyline 1.2.1, leaflet-polylinedecorator 1.6.0
- **ドラッグ&ドロップ**: @dnd-kit (core 6.3.1, sortable 10.0.0, utilities 3.2.2)
- **パッケージマネージャー**: npm

## 開発環境
- **開発サーバー**: ユーザーが常時起動済み
  - `npm run dev` は実行しない（既に起動中）
  - コード変更は自動でホットリロード
  - 型チェックは開発サーバーが自動実行（ファイル保存時に反映）
  - 型エラーのみ確認: `npx tsc --noEmit` を使用（数秒で完了）

- **プリビルド**: `npm run build` 実行時に自動でプリビルドスクリプトを実行
  - `scripts/prebuild.mjs` が `/area/search/all` APIを呼び出し
  - `public/data/reachability.json` に静的JSONファイルとして保存
  - 初期ロード時間が10-20秒から瞬時に短縮

## よく使うコマンド
```bash
npm run dev        # 開発サーバー起動（Turbopack使用）※ユーザーが常時起動済み
npx tsc --noEmit   # 型チェックのみ（数秒で完了）
npm run prebuild   # プリビルドスクリプトのみ実行（到達圏一覧生成）
npm run build      # 本番ビルド（自動でprebuild実行 → next build）
npm run start      # 本番サーバー起動
npm run lint       # ESLintチェック

# データ変換スクリプト（手動実行）
node scripts/convert-with-csv.mjs  # 人口メッシュCSV→GeoJSON変換
```

## プロジェクト構成

### ディレクトリ構造
```
src/
├── app/
│   ├── about/
│   │   └── page.tsx            # アバウトページ
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # メインページ（UnifiedMapViewを表示）
│   └── globals.css             # グローバルスタイル
├── components/
│   ├── layout/
│   │   └── Header.tsx          # ヘッダー（ロゴ + パンくずナビ）
│   ├── condition/              # 到達圏条件設定画面
│   │   ├── ConditionPanel.tsx
│   │   └── SummaryPanel.tsx
│   ├── bus-simple/             # バス条件設定・簡易
│   │   └── BusConditionPanel.tsx
│   ├── bus-manual/             # バス条件設定・手動
│   │   └── BusManualPanel.tsx  # ドラッグ&ドロップバス停選択
│   ├── result/                 # 結果画面
│   │   ├── BusStopDetailPanel.tsx
│   │   ├── ResultSummaryPanel.tsx
│   │   └── SampleRoutePanel.tsx
│   ├── map/
│   │   ├── Map.tsx                    # Leaflet地図ベース
│   │   ├── UnifiedMapView.tsx         # 統合地図ビュー（全画面共有）
│   │   └── LayerControlPanel.tsx      # レイヤー表示切替パネル
│   ├── bus/
│   │   ├── BusStopMarker.tsx
│   │   └── BusRoutePolyline.tsx
│   ├── layer/
│   │   ├── ReachabilityLayer.tsx      # 到達圏ポリゴン表示
│   │   ├── SpotMarker.tsx             # スポットマーカー
│   │   ├── PopulationMeshLayer.tsx    # 人口メッシュレイヤー
│   │   ├── PublicTransitLayer.tsx     # 公共交通レイヤー
│   │   └── SampleRoutePolyline.tsx    # サンプル経路（導入前後比較）
│   └── ui/
│       ├── Panel.tsx                  # 開閉パネル（320px固定幅）
│       ├── Loading.tsx
│       └── HelpDialog.tsx             # ヘルプダイアログ
├── hooks/
│   └── useAppState.ts      # アプリケーション状態管理（4画面対応）
├── lib/
│   ├── api/
│   │   ├── reachabilityList.ts        # 到達圏一覧取得（静的JSON）
│   │   ├── spots.ts                   # スポット一覧取得
│   │   ├── stopSequences.ts           # バス停列一覧取得
│   │   ├── busStops.ts                # 停留所データ取得
│   │   ├── areaSearch.ts              # 到達圏検索（POST）
│   │   ├── targetRegion.ts            # 地図中心座標取得
│   │   ├── population.ts              # 人口分布データ取得
│   │   └── publicTransit.ts           # 公共交通データ取得
│   └── utils/
│       ├── facilityColors.ts          # 施設種別の色定義
│       ├── spotIcons.ts               # スポットアイコン定義
│       └── spotLabels.ts              # スポットラベル定義
├── types/
│   └── index.ts            # 型定義
└── scripts/
    ├── prebuild.mjs        # プリビルドスクリプト（到達圏一覧）
    └── convert-with-csv.mjs # 人口メッシュCSV→GeoJSON変換
```

### 主要コンポーネントの役割

#### [page.tsx](src/app/page.tsx)
- Client Component
- UnifiedMapViewを常に表示（画面切り替え時も再マウントされない）
- useAppStateから状態と関数を取得し、UnifiedMapViewに渡す

#### [UnifiedMapView.tsx](src/components/map/UnifiedMapView.tsx)
- **重要**: 全画面で共有される統合地図ビューコンポーネント
- **永続的マウント**: Mapコンポーネントを全画面で単一インスタンスとして共有
- **状態保持**: 画面遷移時もズーム率・中心座標が完全に保持される
- **条件分岐レンダリング**: currentScreenに応じてパネル・レイヤーを動的に切り替え
  - `condition`: ReachabilityLayer, SpotMarker, ConditionPanel, SummaryPanel
  - `bus-simple`: 上記 + BusStopMarker, BusRoutePolyline, BusConditionPanel
  - `bus-manual`: 上記 + BusManualPanel（BusConditionPanelの代わり）
  - `result`: 導入前後のReachabilityLayer, SpotMarker, BusStopMarker, BusRoutePolyline, SampleRoutePolyline, BusStopDetailPanel, ResultSummaryPanel, SampleRoutePanel
- **共通レイヤー**: 全画面で表示されるレイヤー
  - `PublicTransitLayer`: 公共交通レイヤー（表示/非表示切替可）
  - `PopulationMeshLayer`: 人口メッシュレイヤー（表示/非表示切替可）
  - `LayerControlPanel`: レイヤー表示切替UI（地図左上固定）
- **パフォーマンス**: タイル再読み込みなし、スムーズな画面遷移

#### [useAppState.ts](src/hooks/useAppState.ts)
アプリケーション全体の状態管理フック。

**管理する状態**:
- `currentScreen`: 現在の画面（condition / bus-simple / bus-manual / result）
- `condition`: 到達圏設定（selectedSpotId, maxMinute, walkingDistance, departureTime）
- `busCondition`: バス条件（selectedRouteIndex）
- `manualBusStops`: 手動選択バス停ID配列（bus-manual画面用）
- `reachabilityList`: 到達圏一覧（静的JSON）
- `spotsData`: スポット一覧
- `stopSequences`: バス停列一覧
- `busStopsData`: 停留所データ
- `searchResult`: 到達圏検索結果
- `publicTransitData`: 公共交通データ（静的JSON）
- `populationMeshData`: 人口メッシュデータ（静的JSON）
- `showPublicTransit`: 公共交通レイヤー表示フラグ（初期値: true）
- `showPopulationMesh`: 人口メッシュレイヤー表示フラグ（初期値: false）
- `isLoading`, `loadingMessage`: ローディング状態

**主要メソッド**:
- `navigateTo(screen)`: 画面遷移
- `updateCondition()` / `updateBusCondition()`: 条件更新
- `executeSearch()`: 到達圏検索API実行（結果画面遷移時）
- `getCurrentReachability()`: 現在の条件に合致する到達圏取得
- `getCurrentSpots()`: 現在の条件に合致するスポット取得
- `getSelectedBusStops()`: 現在の条件に合致するバス停取得
- `getAllMatchingRoutes()`: マッチング経路一覧取得
- `toggleManualBusStop(stopId)`: 手動バス停の選択/解除トグル
- `updateManualBusStops(stops)`: 手動バス停の並び順更新（ドラッグ&ドロップ対応）
- `togglePublicTransit()`: 公共交通レイヤーの表示/非表示切替
- `togglePopulationMesh()`: 人口メッシュレイヤーの表示/非表示切替

#### [Header.tsx](src/components/layout/Header.tsx)
- ロゴ（テキスト「コミュニティバスを作ろう！」）を表示
- パンくずナビゲーション（3ステップ）
  1. 到達圏の条件設定（condition）
  2. コミュニティバスの条件設定（bus-simple / bus-manual）
  3. 結果（result）
- **注**: bus-manual画面ではbus-simpleステップがアクティブ表示される
- 過去の画面にクリックで戻れる

#### [Panel.tsx](src/components/ui/Panel.tsx)
- 左右配置対応のオーバーレイパネル
- 320px固定幅
- 開閉アニメーション付き

#### [BusRoutePolyline.tsx](src/components/bus/BusRoutePolyline.tsx)
- バス経路の描画コンポーネント
- API経路データがある場合: 実際の道路に沿った経路を描画
  - Polylineエンコード文字列をデコード
  - leaflet-polylinedecoratorで方向矢印を配置
- API経路データがない場合: 選択停留所間を直線で描画

#### [BusManualPanel.tsx](src/components/bus-manual/BusManualPanel.tsx)
- bus-manual画面の左パネル
- @dnd-kitを使用したドラッグ&ドロップ機能
- バス停の選択・解除・並び替えが可能

#### [PopulationMeshLayer.tsx](src/components/layer/PopulationMeshLayer.tsx)
- **役割**: e-Stat国勢調査2020年データから生成した人口メッシュを地図上に表示
- **データ形式**: GeoJSON FeatureCollection（各featureにmeshCode、population、colorプロパティ）
- **表示制御**: `isVisible` propsで表示/非表示を切り替え
- **スタイリング**: 人口密度に応じた色分け（暖色=多、寒色=少）
- **データソース**: `/data/population-mesh.json`（静的JSON）

#### [PublicTransitLayer.tsx](src/components/layer/PublicTransitLayer.tsx)
- **役割**: GTFSデータリポジトリの東根市営バスデータを地図上に表示
- **機能**:
  - 複数路線を12色パレットで色分け表示
  - 停留所マーカー（複数路線が通る停留所は扇形分割表示）
  - 停留所クリックで各路線の停車時刻をポップアップ表示
- **データ形式**: Polylineエンコード文字列をデコードして経路描画
- **データソース**: `/data/ptrans.json`（静的JSON、GTFSデータから生成）

#### [SampleRoutePolyline.tsx](src/components/layer/SampleRoutePolyline.tsx)
- **役割**: 結果画面でコミュニティバス導入前後の経路を比較表示
- **機能**:
  - 導入前経路: グレー・細線（5mオフセット）
  - 導入後経路: セクション別（コミバス区間=青・太線、徒歩区間=緑・通常線）
  - 1600m間隔で進行方向矢印を配置
  - ゴール地点にフラグマーカー表示
- **技術**: Haversine公式による距離計算、経路オフセット処理

#### [LayerControlPanel.tsx](src/components/map/LayerControlPanel.tsx)
- **役割**: 地図レイヤー（公共交通・人口メッシュ）の表示切替UI
- **配置**: 地図左上にオーバーレイ表示（z-index: 50）
- **機能**:
  - チェックボックスで表示/非表示を切り替え
  - ヘルプボタン（?）をクリックでHelpDialogを表示

#### [HelpDialog.tsx](src/components/ui/HelpDialog.tsx)
- **役割**: レイヤー機能の説明をダイアログで表示
- **配置**: LayerControlPanelの隣（左または右、320px + 2.5rem）
- **機能**: title、content（string配列）を受け取って表示、閉じるボタン付き

## データフロー

### API連携
アプリケーションは以下のAPIを使用：

| エンドポイント | メソッド | 用途 | キャッシュ | 備考 |
|---|---|---|---|---|
| `/data/reachability.json` | GET | 到達圏一覧取得 | 静的JSON | プリビルドで生成 |
| `/area/spots` | GET | スポット一覧取得 | force-cache | 初期表示時 |
| `/combus/stop-sequences` | GET | バス停列一覧取得 | なし | 初期表示時 |
| `/combus/stops` | GET | 停留所データ取得 | force-cache | 初期表示時 |
| `/target/region` | GET | 地図中心座標取得 | force-cache | 初期表示時 |
| `/data/population-mesh.json` | GET | 人口分布取得 | 静的JSON | 初期表示時（e-Stat国勢調査2020年） |
| `/data/ptrans.json` | GET | 公共交通データ取得 | 静的JSON | 初期表示時（GTFSデータから生成） |
| `/area/search` | POST | 到達圏検索 | なし | 結果画面遷移時 |

**プリビルドプロセス**:
```
npm run build
  ↓
npm run prebuild（自動実行）
  ↓
scripts/prebuild.mjs が /area/search/all を呼び出し
  ↓
public/data/reachability.json に保存
  ↓
next build --turbopack
```

**効果**: 初期ロード時間が10-20秒から瞬時に短縮

### 状態管理の流れ
1. **初期表示**: `useAppState`が7つのAPI/JSONを並列で取得（到達圏一覧、スポット、バス停列、バス停、地図中心、公共交通データ、人口メッシュデータ）
2. **条件設定画面**: 条件変更時に`getCurrentReachability()`で該当データを取得
3. **バス条件設定・簡易**: `getAllMatchingRoutes()`でマッチング経路一覧を取得、選択時に`getSelectedBusStops()`で該当バス停を取得
4. **バス条件設定・手動**: `toggleManualBusStop()`でバス停選択、`updateManualBusStops()`で並び替え
5. **結果画面遷移**: `executeSearch()`で到達圏検索APIを実行
6. **画面戻り**: パンくずクリックで`navigateTo()`、条件は保持される
7. **レイヤー表示切替**: `togglePublicTransit()` / `togglePopulationMesh()`で表示/非表示を切り替え

### 地図状態の維持
- UnifiedMapViewコンポーネントが全画面で共有されるため、地図のズーム率と中心位置が画面遷移時も完全に維持される
- 画面切り替え時にMapコンポーネントが再マウントされないため、タイルの再読み込みも発生しない
- ユーザーが地図を操作した状態（ズーム・パン）は、どの画面に遷移しても保持される

## スクリプト

### [prebuild.mjs](scripts/prebuild.mjs)
- **用途**: 到達圏一覧データをプリビルド時に生成
- **実行**: `npm run build` 時に自動実行
- **処理**: `/area/search/all` APIを呼び出し、`public/data/reachability.json` に保存
- **効果**: 初期ロード時間が10-20秒から瞬時に短縮

### [convert-with-csv.mjs](scripts/convert-with-csv.mjs)
- **用途**: e-Stat国勢調査データ（CSV + Shapefile）から人口メッシュGeoJSONを生成
- **実行**: 手動実行（`node scripts/convert-with-csv.mjs`）
- **入力**:
  - `temp_shapefile/tblT001102Q*.txt` - 人口CSVデータ（メッシュコード別人口）
  - `temp_shapefile/QDDSWQ*/MESH0*.shp` - メッシュShapefile（ジオメトリ）
- **出力**: `public/data/population-mesh.json`
- **処理**:
  - CSVから人口データを読み込み（人口総数T001102001）
  - Shapefileからメッシュジオメトリを読み込み
  - メッシュコードで結合し、人口密度で色分け（暖色=多、寒色=少）
  - GeoJSON FeatureCollectionとして出力
- **注意**: ビルド時には実行されない（データ更新時のみ手動実行）

## コーディング規約

### スタイル
- **Client Components**: `'use client'` ディレクティブを明示
- **動的インポート**: Leaflet使用コンポーネントは `dynamic(() => import(...), { ssr: false })` でSSR無効化
- **Tailwind CSS**: ユーティリティファーストで記述
- **型安全性**: 明示的な型定義を使用（`types/index.ts`）

### 命名規則
- コンポーネント: PascalCase（例: `BusStopMarker`）
- フック: `use` + PascalCase（例: `useAppState`）
- 型: PascalCase（例: `BusStop`, `ScreenType`）
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
