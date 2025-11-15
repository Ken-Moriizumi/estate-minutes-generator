# Phase 1 実装計画：物件検討議事録自動生成機能

## 📋 Phase 1 概要

**実装範囲**: 物件検討議事録のみ（MVP: Minimum Viable Product）
**実装期間**: 3週間
**対象機能**: Gmail から物件情報を取得し、Gemini API で議事録を自動生成して Google Docs に保存

---

## 🎯 Phase 1 で実装する機能

### ✅ 実装対象
- [x] Electron デスクトップアプリケーション（Windows/Mac対応）
- [x] メイン画面（物件検討議事録生成用）
- [x] 設定画面（Gmail 設定、Google 連携、参加者情報）
- [x] Google OAuth 2.0 認証
- [x] Gmail API による物件情報メール取得
- [x] Gemini API による議事録内容生成
- [x] Google Docs API によるドキュメント作成
- [x] Google Drive への自動保存

### ❌ Phase 2 以降に延期
- [ ] YouTube 税務会議議事録
- [ ] 楽待不動産情報議事録
- [ ] 議事録タイプ選択UI
- [ ] YouTube Transcript API
- [ ] Puppeteer による楽待スクレイピング

---

## 🏗️ 実装スケジュール（3週間）

### **Week 1: プロジェクト基盤とUI構築**

#### Day 1-2: プロジェクト初期化
- [ ] プロジェクトフォルダ構造の作成
- [ ] `package.json` の作成と依存関係のインストール
- [ ] `tsconfig.json` の作成（TypeScript設定）
- [ ] `.env.example` と `.gitignore` の作成
- [ ] Electron メインプロセス（`src/main/index.ts`）の基本実装
  - ウィンドウ作成（メイン画面・設定画面）
  - 開発モード/本番モードの切り替え
  - IPC 通信の基本設定
  - 型定義の作成

#### Day 3-4: 設定画面 UI 実装
- [ ] `src/renderer/settings.html` の作成
  - `docs/settings-screen-design.html` をベースに実装
  - サイドバーナビゲーション（Phase 1 は基本設定、Google連携、参加者情報のみ）
- [ ] `src/renderer/css/settings.css` のスタイル実装
  - Material Design 風のデザイン
  - カード型レイアウト
- [ ] `src/renderer/ts/settings.ts` のロジック実装
  - フォーム入力と検証
  - 設定の読み込み・保存
  - IPC 通信によるメインプロセスとの連携
  - 型安全なイベントハンドリング

#### Day 5: 設定管理システム実装
- [ ] `src/utils/config.ts` の実装
  - electron-store を使用した設定の永続化
  - デフォルト値の設定
  - 設定の CRUD 操作 API
  - 設定ファイル（`config.json`）の管理
  - 型定義による設定値の安全性確保

---

### **Week 2: Google サービス統合**

#### Day 6-7: Google OAuth 2.0 認証
- [ ] `src/services/google/auth.ts` の実装
  - Google OAuth 2.0 フロー実装
  - アクセストークンの取得・更新
  - リフレッシュトークンの保存・管理
  - 認証状態の確認
  - 型定義（OAuth2Client, Credentials など）
- [ ] 設定画面への「Google アカウント連携」ボタン追加
- [ ] 認証成功時の通知とトークン保存

#### Day 8-9: Gmail API 統合
- [ ] `src/services/google/gmail.ts` の実装
  - Gmail API クライアント初期化
  - 指定期間・ラベルでのメール検索
  - メール本文の取得
  - 物件情報の抽出（築年数、立地、購入金額）
  - 型定義（PropertyInfo, EmailData など）
- [ ] Gmail からのデータ取得テスト

#### Day 10-11: Gemini API 統合
- [ ] `src/services/google/gemini.ts` の実装
  - Gemini 2.5 Pro クライアント初期化
  - プロンプト生成ロジック
  - 議事録コンテンツ生成
    - 議題の自動生成
    - 参加者ごとの意見生成（役職レベル別）
    - 結論の生成
  - 型定義（MinutesContent, ParticipantProfile など）
- [ ] 参加者プロファイル設定
  - 代表取締役社長: 高い知識レベル、専門用語使用
  - 非常勤役員: 初心者レベル、平易な言葉
- [ ] Gemini API のテストとプロンプト調整

#### Day 12: Google Docs/Drive API 統合
- [ ] `src/services/google/docs.ts` の実装
  - Google Docs API クライアント初期化
  - ドキュメント作成
  - 議事録フォーマットの適用
    - タイトル、日時、場所、参加者
    - 議題、議事内容、結論
  - 型定義（DocumentRequest, DocumentResponse など）
- [ ] `src/services/google/drive.ts` の実装
  - 「定例会」フォルダへの保存
  - ファイル命名規則（`YYYYMMDD_検討議事録`）
  - 型定義（DriveFile, FolderInfo など）
- [ ] ドキュメント作成のテスト

---

### **Week 3: メイン画面実装と統合テスト**

#### Day 13-14: メイン画面 UI 実装
- [ ] `src/renderer/index.html` の作成
  - `docs/main-screen-design.html` をベースに実装
  - Phase 1 バッジの表示
  - 設定ボタン（設定画面へのリンク）
- [ ] `src/renderer/css/main.css` のスタイル実装
  - グラデーション背景（紫系）
  - カード型レイアウト
  - カスタムラジオボタン・チェックボックス
- [ ] `src/renderer/ts/main.ts` のロジック実装
  - 基本情報設定フォーム
    - 開催場所選択（東京/長野/オンライン）
    - 参加者の自動選択ロジック
    - 日時選択（flatpickr 使用）
  - 物件情報取得設定
    - Gmail 取得期間の設定
  - バリデーション機能
  - 型定義（FormData, ValidationResult など）

#### Day 15-16: 議事録生成フロー統合
- [ ] `src/services/minutesGenerator.ts` の実装
  - 全体の処理フロー統合
    1. 入力値の検証
    2. Gmail からメール取得
    3. 物件情報の抽出
    4. Gemini API で議事録生成
    5. Google Docs でドキュメント作成
    6. Google Drive に保存
  - エラーハンドリング
    - API エラーの処理
    - ネットワークエラーの再試行
    - ユーザーへのエラー通知
  - 進捗表示
    - 処理状況の通知
    - プログレスバー（オプション）
  - 型定義（GenerationRequest, GenerationResult など）
- [ ] IPC 通信の実装（型安全）
  - レンダラー → メイン: `generate-minutes` イベント
  - メイン → レンダラー: `generation-progress`, `generation-complete`, `generation-error` イベント
  - IPC通信用の型定義作成
- [ ] 完了通知ポップアップ
  - Google Docs URL の表示
  - ブラウザで開くボタン

#### Day 17: ユーティリティ実装
- [ ] `src/utils/logger.ts` の実装
  - ログレベル管理（info, warn, error）
  - ファイルへのログ出力
  - 型定義（LogLevel, LogEntry など）
- [ ] `src/utils/validation.ts` の実装
  - 日時の妥当性チェック
  - 必須項目のチェック
  - Gmail ラベルの存在確認
  - 型定義（ValidationRule, ValidationError など）
- [ ] `src/utils/dateFormatter.ts` の実装
  - 日付フォーマット変換
  - ファイル名用の日付文字列生成
  - 型定義（DateFormat など）

#### Day 18-19: 統合テストとリファインメント
- [ ] エンドツーエンドテスト
  - 設定保存 → 認証 → メール取得 → 議事録生成 → 保存の全フロー
- [ ] エラーケースのテスト
  - 認証失敗時の処理
  - Gmail にメールがない場合の処理
  - API エラー時の処理
- [ ] UI/UX 改善
  - ボタンの無効化/有効化
  - ローディング表示
  - エラーメッセージの改善
- [ ] パフォーマンス最適化
  - API 呼び出しの最適化
  - 非同期処理の改善

#### Day 20-21: ドキュメント作成とリリース準備
- [ ] README.md の作成
  - プロジェクト概要
  - インストール手順
  - 使い方
  - API キーの取得方法
- [ ] `.env.example` の更新
- [ ] ビルドテスト
  - Windows ビルド（`npm run build-win`）
  - Mac ビルド（`npm run build-mac`）
- [ ] 最終動作確認

---

## 📂 プロジェクト構造（Phase 1）

```
estate-minutes-generator/
├── docs/
│   ├── claude.md                  # 全体仕様書
│   ├── phase1.md                  # 本ドキュメント
│   ├── main-screen-design.html    # メイン画面デザインサンプル
│   └── settings-screen-design.html # 設定画面デザインサンプル
├── src/
│   ├── main/
│   │   └── index.ts              # Electron メインプロセス
│   ├── renderer/
│   │   ├── index.html            # メイン画面
│   │   ├── settings.html         # 設定画面
│   │   ├── css/
│   │   │   ├── main.css          # メイン画面スタイル
│   │   │   └── settings.css      # 設定画面スタイル
│   │   └── ts/
│   │       ├── main.ts           # メイン画面ロジック
│   │       └── settings.ts       # 設定画面ロジック
│   ├── services/
│   │   ├── google/
│   │   │   ├── auth.ts           # Google OAuth 2.0
│   │   │   ├── gmail.ts          # Gmail API
│   │   │   ├── gemini.ts         # Gemini API
│   │   │   ├── docs.ts           # Google Docs API
│   │   │   └── drive.ts          # Google Drive API
│   │   └── minutesGenerator.ts   # 議事録生成統合処理
│   ├── types/
│   │   └── index.d.ts            # 共通型定義（下記参照）
│   └── utils/
│       ├── config.ts             # 設定管理
│       ├── logger.ts             # ログ機能
│       ├── validation.ts         # 入力検証
│       └── dateFormatter.ts      # 日付フォーマット
├── dist/                         # TypeScriptコンパイル出力（.gitignore 対象）
├── .env                          # 環境変数（.gitignore 対象）
├── .env.example                  # 環境変数テンプレート
├── .gitignore
├── package.json
├── tsconfig.json                 # TypeScript設定
├── config.json                   # ユーザー設定（.gitignore 対象）
└── README.md
```

---

## 🔷 型定義ファイル（src/types/index.d.ts）

```typescript
// 物件情報の型定義
export interface PropertyInfo {
  buildingAge: number;      // 築年数
  location: string;         // 立地（住所）
  price: number;           // 購入金額
  type?: string;           // 物件タイプ（マンション、戸建てなど）
  area?: number;           // 面積（㎡）
  description?: string;    // その他の情報
}

// メールデータの型定義
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  propertyInfo?: PropertyInfo;
}

// 議事録コンテンツの型定義
export interface MinutesContent {
  date: Date;
  startTime: string;
  endTime: string;
  location: 'tokyo' | 'nagano' | 'online';
  participants: Participant[];
  agenda: string[];
  content: DiscussionItem[];
  conclusion: string;
}

// 参加者の型定義
export interface Participant {
  name: string;
  role: string;
  profile?: ParticipantProfile;
}

// 参加者プロファイルの型定義
export interface ParticipantProfile {
  knowledgeLevel: 'high' | 'beginner';
  style: 'professional' | 'casual' | 'senior_casual' | 'very_casual';
}

// 議論項目の型定義
export interface DiscussionItem {
  topic: string;
  propertyInfo?: PropertyInfo;
  opinions: ParticipantOpinion[];
}

// 参加者意見の型定義
export interface ParticipantOpinion {
  participantName: string;
  opinion: string;
}

// 設定の型定義
export interface AppConfig {
  company: {
    name: string;
  };
  defaults: {
    location: 'tokyo' | 'nagano' | 'online';
    startTime: string;
    endTime: string;
    retrievalPeriod: number;
  };
  google: {
    driveFolderPath: string;
    gmailLabel: string;
    refreshToken?: string;
  };
  participants: {
    president: string;
    wife: string;
    chairman: string;
    mother: string;
    sister: string;
  };
}

// IPC通信の型定義
export interface IpcRequest<T = any> {
  channel: string;
  data: T;
}

export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 議事録生成リクエストの型定義
export interface GenerateMinutesRequest {
  date: Date;
  startTime: string;
  endTime: string;
  location: 'tokyo' | 'nagano' | 'online';
  participants: string[];
  gmailStartDate: Date;
  gmailEndDate: Date;
}

// 議事録生成結果の型定義
export interface GenerateMinutesResult {
  documentId: string;
  documentUrl: string;
  fileName: string;
  createdAt: Date;
}

// バリデーション結果の型定義
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// ログエントリの型定義
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  timestamp: Date;
  message: string;
  data?: any;
}
```

---

## 📦 依存関係（package.json）

### devDependencies
```json
{
  "electron": "^31.0.0",
  "electron-builder": "^25.0.0",
  "typescript": "^5.6.0",
  "@types/node": "^22.0.0"
}
```
注: `@types/electron`は不要（Electron本体に型定義が含まれています）

### dependencies
```json
{
  "@google/generative-ai": "^0.31.0",
  "@google-cloud/local-auth": "^3.0.0",
  "googleapis": "^144.0.0",
  "flatpickr": "^4.6.13",
  "electron-store": "^10.0.0",
  "dotenv": "^16.4.0"
}
```

### scripts
```json
{
  "start": "npm run build && electron .",
  "dev": "npm run build && electron . --dev",
  "build": "tsc",
  "watch": "tsc --watch",
  "clean": "rm -rf dist",
  "postinstall": "npm run build",
  "build-win": "npm run build && electron-builder --win",
  "build-mac": "npm run build && electron-builder --mac",
  "package": "npm run build && electron-builder --win --mac"
}
```

---

## 🔐 環境変数設定（.env.example）

```env
# Google API 認証情報（Google Cloud Console で取得）
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Gemini API キー（Google AI Studio で取得）
GEMINI_API_KEY=your_gemini_api_key_here

# 注意: .env ファイルは .gitignore に含めること
```

---

## ⚙️ 設定ファイル（config.json）

electron-store で管理される設定項目:

```json
{
  "company": {
    "name": "株式会社〇〇〇〇"
  },
  "defaults": {
    "location": "tokyo",
    "startTime": "14:00",
    "endTime": "15:00",
    "retrievalPeriod": 1
  },
  "google": {
    "driveFolderPath": "定例会",
    "gmailLabel": "物件情報"
  },
  "participants": {
    "president": "山田太郎",
    "wife": "山田花子",
    "chairman": "山田一郎",
    "mother": "山田春子",
    "sister": "山田美咲"
  }
}
```

---

## 🎨 UI デザイン仕様

### メイン画面
- **ヘッダー**: 紫グラデーション背景（#667eea → #764ba2）
- **タイトル**: "不動産賃貸業 議事録自動生成ツール"
- **Phase バッジ**: "Phase 1: 物件検討議事録"
- **セクション構成**:
  1. 基本情報設定（場所・参加者・日時）
  2. 物件情報取得設定（Gmail 期間）
- **ボタン**: リセット（グレー）、議事録を作成（紫グラデーション）

### 設定画面
- **サイドバー**: 280px幅、ナビゲーションメニュー
  - 基本設定 ✓
  - Google連携 ✓
  - 参加者情報 ✓
  - YouTube設定（Phase 2、グレーアウト）
  - 楽待設定（Phase 2、グレーアウト）
- **メインエリア**: カード型レイアウト、白背景
- **Phase 2 表示**: オレンジバッジで「Phase 2」表示

---

## 🔄 議事録生成フロー

```
1. ユーザー入力
   ├─ 開催場所（東京/長野/オンライン）
   ├─ 参加者（自動選択 or 手動調整）
   ├─ 日時（日付・開始時刻・終了時刻）
   └─ Gmail 取得期間（開始日〜終了日）

2. バリデーション
   ├─ 必須項目チェック
   ├─ 日時の妥当性確認
   └─ Gmail ラベル存在確認

3. Gmail からメール取得
   ├─ 指定期間・ラベルで検索
   ├─ メール本文取得
   └─ 物件情報抽出（築年数、立地、金額）

4. Gemini API で議事録生成
   ├─ 議題生成
   ├─ 参加者別意見生成
   │   ├─ 社長: 専門的・ビジネス視点
   │   └─ その他: 平易・初心者視点
   └─ 結論生成

5. Google Docs 作成
   ├─ ドキュメント作成
   ├─ フォーマット適用
   └─ Drive に保存（定例会フォルダ）

6. 完了通知
   ├─ ポップアップ表示
   ├─ Google Docs URL 表示
   └─ ブラウザで開くボタン
```

---

## 🧪 テスト項目

### 機能テスト
- [ ] 設定の保存・読み込み
- [ ] Google アカウント認証
- [ ] Gmail からのメール取得
- [ ] 物件情報の抽出
- [ ] Gemini API による議事録生成
- [ ] Google Docs 作成
- [ ] Google Drive への保存
- [ ] 場所選択による参加者自動設定
- [ ] 日時のデフォルト値設定

### エラーハンドリングテスト
- [ ] 認証失敗時の処理
- [ ] Gmail にメールがない場合
- [ ] Gemini API エラー時の処理
- [ ] ネットワークエラー時の再試行
- [ ] 不正な入力値の処理

### UI/UX テスト
- [ ] レスポンシブデザイン
- [ ] ローディング表示
- [ ] エラーメッセージ表示
- [ ] ボタンの無効化/有効化
- [ ] フォーム入力の検証

---

## 🔒 セキュリティ要件

### API キー管理
- `.env` ファイルで管理（絶対にコミットしない）
- `.env.example` でテンプレート提供
- ソースコードに直接記載しない

### Google OAuth トークン
- electron-store でローカル保存
- 暗号化された形で保存
- リフレッシュトークンの安全な管理

### .gitignore 設定
```gitignore
# 環境変数
.env

# ユーザー設定
config.json

# TypeScriptコンパイル出力
dist/

# ビルド出力
build/
out/

# 依存関係
node_modules/

# ログ
*.log

# OS
.DS_Store
Thumbs.db
```

### tsconfig.json（TypeScript設定）
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.html",
    "**/*.css"
  ]
}
```

注: レンダラープロセスのTypeScriptファイルも含めるよう修正しました。

---

## 📝 議事録出力フォーマット

```
株式会社〇〇〇〇
議事録

日時：2024年11月25日 14:00～15:00
場所：東京事務所
参加者：代表取締役社長 山田太郎、取締役 山田花子

【議題】
1. 渋谷区物件の投資検討
2. 世田谷区マンションの収益性分析
3. 港区物件の修繕費見積もり

【議事内容】
1. 渋谷区物件の投資検討
   ＜物件情報＞
   築10年、東京都渋谷区、購入金額2,500万円

   代表取締役社長：「立地条件が優れており、利回りも8%程度で
   投資価値があります。ただし築10年での修繕費用を見積もる
   必要があります。」

   取締役（妻）：「渋谷という場所は人気エリアだということは
   分かります。でも修繕費がどのくらいかかるのかよく分かり
   ませんでした。」

2. 世田谷区マンションの収益性分析
   ＜物件情報＞
   築5年、東京都世田谷区、購入金額3,200万円

   ...

【結論】
渋谷区物件については、修繕費の詳細見積もりを取得した上で
再度検討することとした。世田谷区マンションは...

以上
```

---

## 🚀 Phase 2 への移行準備

Phase 1 完了後、以下の機能を Phase 2 で実装予定:

### 追加機能
- [ ] YouTube 税務会議議事録
- [ ] 楽待不動産情報議事録
- [ ] 議事録タイプ選択 UI
- [ ] YouTube Transcript API 統合
- [ ] Puppeteer による楽待スクレイピング

### 追加依存関係
```json
{
  "puppeteer": "^21.0.0",
  "youtube-transcript": "^1.0.6",
  "ytdl-core": "^4.11.0"
}
```

### UI 変更
- メイン画面に「議事録タイプ選択」ラジオボタン追加
- 設定画面の YouTube 設定・楽待設定を有効化

---

## 🔧 ビルドプロセスと初期セットアップ

### 初回セットアップ手順
```bash
# 1. プロジェクトのクローン/作成
git clone [repository-url] estate-minutes-generator
cd estate-minutes-generator

# 2. 依存関係のインストール（postinstallでビルドも自動実行）
npm install

# 3. 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 4. 開発モードで起動
npm run dev
```

### ビルドコマンド
```bash
# TypeScriptのコンパイル
npm run build

# 開発用（ファイル監視モード）
npm run watch

# distディレクトリのクリーンアップ
npm run clean

# プラットフォーム別ビルド
npm run build-win   # Windows用
npm run build-mac   # Mac用
npm run package     # 両プラットフォーム
```

### メインプロセスでの環境変数読み込み（src/main/index.ts）
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 環境変数の読み込み（最初に実行）
dotenv.config();

// 開発モードの判定
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

// ... 以降のコード
```

## 🚨 エラーハンドリングの実装

### API呼び出しのエラー処理パターン
```typescript
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // リトライ不可能なエラーの場合は即座に投げる
      if (error instanceof ApiError && error.statusCode === 401) {
        throw error;
      }

      // 最後の試行でなければ待機
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// 使用例（Gmail API）
export async function fetchEmails(label: string, dateRange: DateRange): Promise<EmailData[]> {
  try {
    return await retryWithBackoff(async () => {
      const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: [label],
        q: `after:${dateRange.start} before:${dateRange.end}`
      });

      if (!response.data.messages) {
        return [];
      }

      // メール詳細の取得...
      return emails;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      // ユーザー向けエラーメッセージ
      if (error.statusCode === 401) {
        throw new Error('Google認証が必要です。設定画面から再認証してください。');
      }
      throw new Error(`メールの取得に失敗しました: ${error.message}`);
    }
    throw error;
  }
}
```

### IPC通信でのエラーハンドリング
```typescript
// src/main/ipcHandlers.ts
ipcMain.handle('generate-minutes', async (event, request: GenerateMinutesRequest) => {
  try {
    // プログレス通知
    event.sender.send('generation-progress', { step: 'fetching_emails', progress: 0 });

    const emails = await fetchEmails(config.google.gmailLabel, {
      start: request.gmailStartDate,
      end: request.gmailEndDate
    });

    event.sender.send('generation-progress', { step: 'generating_content', progress: 50 });

    const minutesContent = await generateMinutesContent(emails, request);

    event.sender.send('generation-progress', { step: 'creating_document', progress: 75 });

    const result = await createGoogleDoc(minutesContent);

    event.sender.send('generation-complete', result);

    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';

    event.sender.send('generation-error', {
      message: errorMessage,
      code: (error as any).code || 'UNKNOWN_ERROR'
    });

    return { success: false, error: errorMessage };
  }
});
```

## 💡 実装時の注意事項

### 開発のベストプラクティス
1. **段階的な実装**: 1機能ずつ実装してテスト
2. **エラーハンドリング**: すべての API 呼び出しに try-catch とリトライ機構
3. **ユーザーフィードバック**: 処理中は必ずローディング表示とプログレス通知
4. **ログ出力**: デバッグ用のログを適切に記録（本番環境では適切なレベル設定）
5. **コードの可読性**: コメントを適切に記載、関数は単一責任の原則に従う
6. **型安全性**: TypeScriptの型システムを活用し、コンパイルエラーを早期発見

### TypeScript開発のポイント
- **strictモード有効**: `tsconfig.json`で`strict: true`を設定し、厳格な型チェックを実施
- **型定義の作成**: APIレスポンス、設定値、IPC通信など、すべてのデータに型定義を付与
- **any型の回避**: できる限り具体的な型を使用し、`any`型は最小限に
- **null安全性**: `strictNullChecks`により、null/undefinedの扱いを明示的に
- **インターフェース活用**: 共通のデータ構造は`src/types/index.d.ts`に定義

### パフォーマンス最適化
- 非同期処理の適切な使用（async/await）
- API 呼び出しの最小化
- キャッシュの活用（設定情報など）

### テスト戦略
- 各サービス（Gmail, Gemini, Docs）を個別にテスト
- モックデータを使用した単体テスト
- 実際の API を使用した結合テスト
- 型エラーのコンパイル時チェック

---

## 📚 参考リソース

### Google API
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API ドキュメント](https://developers.google.com/gmail/api)
- [Google Docs API ドキュメント](https://developers.google.com/docs/api)
- [Google Drive API ドキュメント](https://developers.google.com/drive/api)

### Gemini API
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API ドキュメント](https://ai.google.dev/docs)

### Electron
- [Electron 公式ドキュメント](https://www.electronjs.org/docs)
- [electron-store](https://github.com/sindresorhus/electron-store)

---

## ✅ チェックリスト

### 開発開始前
- [ ] Google Cloud Console でプロジェクト作成
- [ ] 必要な API を有効化（Gmail, Docs, Drive）
- [ ] OAuth 2.0 クライアント ID 作成
- [ ] Gemini API キー取得
- [ ] `.env` ファイル作成

### Week 1 完了時
- [ ] Electron アプリが起動する
- [ ] 設定画面が表示される
- [ ] 設定が保存・読み込みできる

### Week 2 完了時
- [ ] Google アカウント認証ができる
- [ ] Gmail からメールを取得できる
- [ ] Gemini API で議事録を生成できる
- [ ] Google Docs を作成できる

### Week 3 完了時
- [ ] メイン画面が完成している
- [ ] エンドツーエンドで議事録が生成できる
- [ ] エラー処理が適切に動作する
- [ ] Windows/Mac でビルドできる

---

**次のステップ**: このドキュメントに基づいて Week 1 の実装を開始してください。
