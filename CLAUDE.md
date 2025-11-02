# Shikan プロジェクト - Claude Code 知識ベース

## プロジェクト概要
コミュニティバスの路線計画を支援する地図ベースのWebアプリケーション。停留所の配置をインタラクティブに選択し、各種施設への到達圏をビジュアライズすることで、効果的なバス路線の設計を支援します。

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
│   └── page.tsx            # メインページ（Server Component）
├── components/
│   ├── map/                # 地図関連コンポーネント
│   │   ├── Map.tsx         # Leaflet地図ベースコンポーネント
│   │   ├── MapView.tsx     # 地図ビュー（Client Component）
│   │   └── LayerControlPanel.tsx  # レイヤー表示制御
│   ├── bus/                # バス関連コンポーネント
│   │   ├── BusStopMarker.tsx   # 停留所マーカー
│   │   ├── BusRoutePolyline.tsx # バスルート線
│   │   └── BusStopSidebar.tsx  # 停留所選択サイドバー（ドラッグ&ドロップ対応）
│   ├── layer/              # レイヤー系コンポーネント
│   │   ├── ReachabilityLayer.tsx # 到達圏ポリゴン表示
│   │   ├── PopulationLayer.tsx   # 人口分布表示
│   │   └── SpotMarker.tsx        # スポットマーカー
│   └── ui/                 # 汎用UIコンポーネント
│       ├── SearchPanel.tsx     # 検索条件パネル（施設種別・時間）
│       └── Loading.tsx         # ローディングオーバーレイ
├── hooks/
│   └── useMapState.ts      # 地図状態管理カスタムフック
├── lib/
│   ├── api/                # API関連
│   │   ├── busStops.ts     # 停留所データ取得
│   │   └── spots.ts        # スポットデータ取得
│   └── utils/              # ユーティリティ関数
│       ├── facilityColors.ts   # 施設種別の色定義
│       ├── spotIcons.ts        # スポットアイコン定義
│       └── spotLabels.ts       # スポットラベル定義
└── types/
    └── index.ts            # 型定義（BusStop, APIRequest/Response等）
```

### 主要コンポーネントの役割

#### [page.tsx](src/app/page.tsx)
- Server Component（async関数）
- ビルド時にバックエンドAPIから停留所データを取得
- MapViewにデータを渡して表示

#### [MapView.tsx](src/components/map/MapView.tsx)
- Client Component
- 全UIコンポーネントを統合
- Leaflet使用コンポーネントは動的インポート（SSR無効化）
- 停留所の選択状態と地図表示を管理

#### [busStops.ts](src/lib/api/busStops.ts)
- 停留所データ取得関数
- `https://prometheus-h24i.onrender.com/combus/stops` からAPI取得
- エラー時はフォールバック（ダミーデータ）

#### [useMapState.ts](src/hooks/useMapState.ts)
- アプリケーション全体の状態管理
- 停留所選択、レイヤー表示、検索条件、API通信を管理
- 「進む」ボタン押下後は編集ロック、「戻る」ボタンで再編集可能
- API実行中のローディング状態を管理
- API経路データ（combusData）を取得・管理

#### [BusStopSidebar.tsx](src/components/bus/BusStopSidebar.tsx)
- 選択した停留所のリストを表示
- @dnd-kitによるドラッグ&ドロップで順序変更可能
- 進むボタン（API実行）と戻るボタン（リセット）を提供
- 進むボタン押下後は編集不可（isEditable）

#### [BusRoutePolyline.tsx](src/components/bus/BusRoutePolyline.tsx)
- バス経路の描画コンポーネント
- API経路データがある場合: 実際の道路に沿った経路を描画
  - Polylineエンコード文字列をデコード
  - 停留所間ごとに方向矢印を配置（広域的な方向計算）
  - 停留所付近（0.002度以内）には矢印を配置しない
- API経路データがない場合: 選択停留所間を直線で描画（後方互換性）

## データフロー

### API連携
- **エンドポイント**: `POST https://prometheus-h24i.onrender.com/area/search`
- **リクエスト形式**:
  ```typescript
  {
    "target-spots": ["hospital", "shopping"],
    "max-minute": 60,
    "combus-stops": ["comstop8", "comstop12", ...]
  }
  ```
- **レスポンス形式**:
  ```typescript
  {
    result: {
      area: {
        hospital?: {
          reachable: { original, with-combus },
          spots: [...]
        },
        shopping?: { ... }
      },
      combus: {
        "section-list": [
          {
            "distance-km": 10.51,
            "duration-m": 26,
            "geometry": "Polylineエンコード文字列"
          },
          ...
        ],
        "stop-list": [
          { coord: { lat, lon }, id, name },
          ...
        ]
      }
    },
    status: "OK"
  }
  ```

### 状態管理の流れ
1. ユーザーが地図上の停留所をクリック → `onSelect`
2. サイドバーで停留所をドラッグ&ドロップ → `onReorder`
3. 「進む」ボタン押下 → `onProceed` → API呼び出し → `isEditable = false`
4. 「戻る」ボタン押下 → `onReset` → 停留所クリア → `isEditable = true`

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
3. **プルリク作成時**: 必ず対応するIssueと紐付ける
   - PR本文に `Closes #<issue番号>` を記載
   - PRタイトルは過去のPRに倣う（例: `feat: ○○機能を追加`）
   - **重要**: プルリクエストの作成は必ずユーザーに確認を取ってから実行する（勝手に作成しない）

### セッション管理
- 基本的に **1 Issue = 1 Session** で運用
- Issue完了・PR作成・マージ後は新しいセッションを開始
- コンテキスト節約のため、セッション間でバックグラウンドプロセスは停止する

## その他
- API URL等の環境変数は `.env.local` で管理（未作成の場合は追加推奨）
- デプロイ: Vercel想定（`.vercel/` ディレクトリ存在）
