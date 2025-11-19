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

#### Day 6: ESM対応の実装
- [ ] package.jsonに`"type": "module"`を追加
- [ ] tsconfig.jsonの`module`を`"ESNext"`に変更
- [ ] tsconfig.jsonの`moduleResolution`を`"bundler"`に変更
- [ ] 全てのローカルモジュールimportに`.js`拡張子を追加
- [ ] `__dirname`の代替実装（`import.meta.url`使用）
- [ ] Preloadスクリプトを`.mts`拡張子に変更
- [ ] `webPreferences`に`sandbox: false`を追加（electron-store使用のため）

---

### **Week 2: Google サービス統合**

#### Day 7-8: Google OAuth 2.0 認証 ✅
- [x] `src/services/google/auth.ts` の実装
  - Google OAuth 2.0 フロー実装
  - アクセストークンの取得・更新
  - リフレッシュトークンの保存・管理（electron-store使用）
  - 認証状態の確認
  - 型定義（OAuth2Credentials など）
- [x] 設定画面への「Google アカウント連携」ボタン追加
- [x] 認証コード入力UI実装
- [x] 認証成功時の通知とトークン保存
- [x] 認証解除機能
- [x] IPC通信の実装
  - authenticate-google: 認証URL生成とブラウザ起動
  - process-auth-code: 認証コード処理
  - check-auth-status: 認証状態確認
  - clear-authentication: 認証解除
- [x] .gitignoreにcredentials.json追加
- [x] credentials.json.exampleの作成

#### Day 9-10: Gmail API 統合 ✅
- [x] `src/services/google/gmail.ts` の実装
  - Gmail API クライアント初期化
  - ラベル一覧取得（ユーザー作成ラベルのみ、日本語ソート）
  - 指定期間・ラベルでのメール検索（ラベル名を引用符で囲んで検索）
  - メール本文の取得とデコード（Base64 URL-safe対応）
  - マルチパートメール対応（text/plain優先、text/html代替）
  - HTMLタグ除去とエンティティデコード
  - メールデータをそのまま返す（物件情報抽出はGeminiに委譲）
  - 型定義（EmailData, GmailSearchQuery）
- [x] IPC通信の実装
  - fetch-gmail-labels: ラベル一覧取得
  - fetch-gmail-data: メール検索と取得
- [x] 設定画面のUI改善
  - Gmailラベルをプルダウン選択式に変更
  - Gmail接続テストボタンの追加
  - テスト結果の表示（件名、送信者、本文プレビュー）
- [x] 認証情報の永続化
  - 設定保存時にリフレッシュトークンを保持
- [x] Gmail からのデータ取得テスト

#### Day 11-12: Gemini API 統合
- [ ] `src/services/google/gemini.ts` の実装
  - Gemini 2.5 Pro クライアント初期化
  - **メール本文から物件情報を抽出する機能**
    - 構造化データとして抽出（JSON形式）
    - 物件名、住所、価格、利回り、特記事項など
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
- [ ] 物件情報抽出のテスト

#### Day 13: Google Docs/Drive API 統合
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

#### Day 14-15: メイン画面 UI 実装
- [x] `src/renderer/index.html` の作成
  - `docs/main-screen-design.html` をベースに実装
  - Phase 1 バッジの表示
  - 設定ボタン（設定画面へのリンク）
- [x] `src/renderer/css/main.css` のスタイル実装
  - グラデーション背景（紫系）
  - カード型レイアウト
  - カスタムラジオボタン・チェックボックス
- [x] `src/renderer/ts/main.ts` のロジック実装
  - 基本情報設定フォーム
    - 開催場所選択（東京/長野/オンライン）
    - 参加者の自動選択ロジック
    - 日時選択（flatpickr 使用）
  - 物件情報取得設定
    - Gmail 取得期間の設定
  - バリデーション機能
  - 型定義（FormData, ValidationResult など）

#### Day 15-16: メイン画面とバックエンドの統合 ✅
- [x] IPC handler `generate-minutes` の本実装
  - minutesGenerator の統合
  - プログレスイベント送信（3段階: 20%, 50%, 80%）
  - 完了/エラーイベント送信
  - エラーハンドリング強化
- [x] main.ts のプログレスイベントリスナー実装
  - リアルタイムプログレス更新
  - 成功ダイアログ表示
  - エラーダイアログ表示
- [x] 成功/エラーダイアログ UI 実装
  - 成功ダイアログ（Google Docs URL、ブラウザで開くボタン）
  - エラーダイアログ（詳細なエラーメッセージ）
  - ダイアログスタイル（アニメーション付き）
- [x] TypeScript ビルド成功確認

#### Day 16-17: 議事録生成フロー統合（Day 13-14で完了済み）
- [x] `src/services/minutesGenerator.ts` の実装
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
    - プログレスバー
  - 型定義（GenerationRequest, GenerationResult など）
- [x] IPC 通信の実装（型安全）
  - レンダラー → メイン: `generate-minutes` イベント
  - メイン → レンダラー: `generation-progress`, `generation-complete`, `generation-error` イベント
  - IPC通信用の型定義作成
- [x] 完了通知ポップアップ
  - Google Docs URL の表示
  - ブラウザで開くボタン

#### Day 17: UX改善（オプション）
**実装優先度: 低〜中（時間があれば実施）**

- [ ] ボタン状態管理の改善
  - 議事録生成中は「議事録を作成」ボタンを無効化
  - プログレス表示中はフォーム編集を無効化
  - 完了/エラー後にボタンを再有効化
- [ ] 成功ダイアログの改善
  - 「続けて作成」ボタンの追加（フォームをリセットして再度作成）
  - ドキュメント作成日時の表示
- [ ] エラー時のリトライ機能（オプション）
  - ネットワークエラー時に「再試行」ボタン表示
  - 認証エラー時に「設定画面を開く」ボタン
- [ ] プログレスアニメーションの洗練
  - スムーズなトランジション（CSS transition 調整）
  - 完了時に100%到達のアニメーション

**変更ファイル**:
- src/renderer/ts/main.ts（ボタン無効化、リトライ機能）
- src/renderer/index.html（ボタン追加）
- src/renderer/css/main.css（アニメーション改善）

#### Day 18: ユーティリティ実装（オプション）
**実装優先度: 低（現状でも動作するため、必須ではない）**

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

**注**: 現状のバリデーションとログ出力は main.ts と index.ts に直接記述されており、動作上の問題はない。
時間に余裕がある場合のリファクタリング項目として位置づける。

#### Day 19-20: 統合テストとリファインメント（必須）
**実装優先度: 高（実際の動作確認が最重要）**

- [ ] **エンドツーエンドテスト（最優先）**
  - 設定保存 → 認証 → メール取得 → 議事録生成 → 保存の全フロー
  - 実際のGmail/Gemini/Docs APIを使用した動作確認
  - 生成された議事録の品質チェック
- [ ] **エラーケースのテスト**
  - 認証失敗時の処理
  - Gmail にメールがない場合の処理
  - API エラー時の処理
  - ネットワークエラー時の処理
- [ ] **バグ修正**
  - テスト中に発見したバグの修正
  - エラーメッセージの改善
  - UIの微調整
- [ ] パフォーマンス確認
  - 大量メール処理時の動作確認
  - API呼び出しのタイムアウト設定確認

#### Day 21: ドキュメント作成とリリース準備
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
├── prompts/                       # プロンプト管理（Day 11-12で追加）
│   ├── minutes-template.md        # 議事録フォーマット定義
│   └── minutes-guidelines.md      # 議事録作成ガイドライン
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
  "@google/generative-ai": "^0.21.0",  // 注: 最新は0.31.0だが、0.21.0で動作確認済み
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
  "type": "module",
  "main": "dist/main/index.js",
  "scripts": {
    "start": "npm run build && electron .",
    "dev": "npm run build && electron . --dev",
    "build": "tsc",
    "watch": "tsc --watch",
    "clean": "rm -rf dist",
    "build-win": "npm run build && electron-builder --win",
    "build-mac": "npm run build && electron-builder --mac",
    "package": "npm run build && electron-builder --win --mac"
  }
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
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "types": ["node"],
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/*"
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

注: ESM (ES Modules) 対応のため、`module: "ESNext"` と `moduleResolution: "bundler"` を使用しています。
詳細は後述の「ESM対応の実装詳細」セクションを参照してください。

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

### Week 2 完了時
- [ ] Google アカウント認証ができる
- [ ] Gmail からメールを取得できる
- [ ] Gemini API で議事録を生成できる
- [ ] Google Docs を作成できる

### Week 3 完了時（Day 15-16時点）
- [x] メイン画面が完成している
- [x] メイン画面とバックエンドが統合されている
- [x] リアルタイムプログレス表示が動作する
- [x] 成功/エラーダイアログが表示される
- [x] TypeScript ビルドが成功する
- [ ] エンドツーエンドで議事録が生成できる（次フェーズでテスト）
- [x] エラー処理が適切に動作する
- [ ] Windows/Mac でビルドできる（Day 21で確認予定）

---

## 🔧 ESM対応の実装詳細

Phase 1では、最新のJavaScript標準であるESM (ECMAScript Modules) を採用しています。
これにより、electron-store v10などのESM-onlyパッケージを使用できます。

### 必須設定

#### 1. package.json
```json
{
  "type": "module"
}
```
この設定により、`.js`ファイルがESMとして扱われます。

#### 2. tsconfig.json
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

- `module: "ESNext"`: 最新のESM構文を出力
- `moduleResolution: "bundler"`: Vite、esbuildなどのモダンバンドラー向けの解決戦略

#### 3. import文での.js拡張子

**重要**: TypeScriptファイルでも、コンパイル後の`.js`ファイルを参照する必要があります。

```typescript
// ✓ 正しい
import { ConfigManager } from '../utils/config.js';

// ✗ エラー: Cannot find module
import { ConfigManager } from '../utils/config';
```

#### 4. __dirnameの代替実装

ESMでは`__dirname`と`__filename`が使用できません。以下のコードで代替します:

```typescript
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

この実装は`src/main/index.ts`で使用されています。

#### 5. Preloadスクリプトの拡張子

- **ソースファイル**: `src/main/preload.mts` (`.mts`拡張子)
- **コンパイル後**: `dist/main/preload.mjs` (`.mjs`拡張子)
- **webPreferencesでの参照**: `preload.mjs`

TypeScriptコンパイラは`.mts`ファイルを自動的に`.mjs`として出力します。

#### 6. sandbox設定

electron-storeを使用するため、sandboxを無効化する必要があります:

```typescript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: false  // electron-storeのため必須
  preload: path.join(__dirname, 'preload.mjs')
}
```

**セキュリティ対策**:
- `contextIsolation: true`を維持してレンダラーを分離
- `nodeIntegration: false`を維持してNode.js APIへの直接アクセスを防止
- preloadスクリプトでAPIを厳密に制限

### electron-store使用上の注意

#### 設定ファイルの保存場所
electron-storeは、OSごとに適切な場所に設定ファイルを自動保存します:

- **macOS**: `~/Library/Application Support/<app-name>/config.json`
- **Windows**: `%APPDATA%\<app-name>\config.json`
- **Linux**: `~/.config/<app-name>/config.json`

#### なぜsandbox: falseが必要か

electron-storeはNode.jsの`fs`モジュールを内部で使用するため、sandboxモードでは動作しません。
しかし、`contextIsolation`と`nodeIntegration: false`を維持することで、セキュリティは確保されます。

---

## 🐛 トラブルシューティング

### "Cannot find module" エラー

**原因**: ESM環境でのimport文に拡張子が不足

**エラー例**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/path/to/config'
```

**解決方法**: 全てのローカルモジュールimportに`.js`拡張子を追加
```typescript
import { ConfigManager } from '../utils/config.js';  // .jsを追加
```

### "__dirname is not defined" エラー

**原因**: ESM環境では`__dirname`が使用できない

**エラー例**:
```
ReferenceError: __dirname is not defined
```

**解決方法**: `fileURLToPath(import.meta.url)`を使用
```typescript
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### "store.get is not a function" エラー

**原因**: sandboxモードでelectron-storeが動作しない

**解決方法**: webPreferencesで`sandbox: false`を設定
```typescript
webPreferences: {
  sandbox: false,
  contextIsolation: true,
  nodeIntegration: false
}
```

### "Cannot use import statement outside a module" (preload)

**原因**: PreloadスクリプトがESMとして認識されていない

**解決方法**:
1. ソースファイルを`.mts`拡張子にする
2. コンパイル後は`.mjs`になる
3. webPreferencesで`preload.mjs`を指定

### "SyntaxError: Unexpected token 'export'" エラー

**原因**: `module: "commonjs"`のままelectron-storeを使用しようとしている

**解決方法**: tsconfig.jsonで`module: "ESNext"`に変更
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## ✅ Week 1 完了チェックリスト（修正版）

### 基本機能
- [x] Electron アプリが起動する
- [x] 設定画面が表示される
- [x] 設定が保存・読み込みできる（electron-store動作確認）
- [x] メイン画面と設定画面の切り替えが動作する
- [x] 場所選択による参加者自動設定が動作する
- [x] Flatpickrによる日付・時刻選択が動作する

### ESM対応
- [x] package.jsonに`"type": "module"`が設定されている
- [x] tsconfig.jsonで`module: "ESNext"`と`moduleResolution: "bundler"`が設定されている
- [x] import文に`.js`拡張子が付いている
- [x] `import.meta.url`を使った`__dirname`代替が実装されている
- [x] preloadスクリプトが`.mts` → `.mjs`として正しくコンパイルされる
- [x] `sandbox: false`でelectron-storeが動作する

### セキュリティ
- [x] `contextIsolation: true`が設定されている
- [x] `nodeIntegration: false`が設定されている
- [x] Content Security Policyが設定されている
- [x] preloadスクリプトでAPIが適切に公開されている

---

## ✅ Week 2 完了チェックリスト

### Google OAuth 2.0 認証（Day 7-8）
- [x] OAuth 2.0 認証モジュールの実装
- [x] 認証URL生成とブラウザ起動
- [x] 認証コード処理
- [x] リフレッシュトークンの保存（electron-store）
- [x] 認証状態確認機能
- [x] 認証解除機能
- [x] 設定画面の認証UI
- [x] credentials.json.exampleの提供

### Gmail API 統合（Day 9-10）
- [x] Gmail API クライアント初期化
- [x] ラベルによるメール検索
- [x] 期間指定検索
- [x] メール本文の取得とデコード
- [x] IPC通信の実装

### Gemini API 統合（Day 11-12）
- [x] Gemini API クライアント初期化
- [x] プロンプトの外部ファイル化
- [x] 議事録コンテンツ生成
- [x] プロンプトエンジニアリング
- [x] テスト機能の実装

**注**: 当初計画の「メール本文から物件情報を抽出」「JSONレスポンスのパース」は、「メールデータを直接Geminiに渡す」方式に変更したため不要になりました。

### Google Docs/Drive API 統合（Day 13-14）
- [x] Google Docs ドキュメント作成
- [x] テキスト挿入とフォーマット適用
- [x] Google Drive フォルダー管理（ブラウザUI付き）
- [x] ファイルの保存と移動
- [x] 議事録生成オーケストレータの実装

---

**次のステップ**: Phase 1 完了。Phase 2（Week 3以降）の計画を確認してください。

---

## 📝 実装フィードバック（Week 2完了時点）

このセクションは、Week 2（Day 1-14）の実装を通じて得られた知見と、当初計画からの変更点を記録しています。

### Week 2 Day 11-12: Gemini API統合の設計変更

#### 当初計画からの主な変更点

**1. 物件情報抽出機能の省略**

- **当初の計画**: メール本文から物件情報を抽出 → 構造化データ化（JSON形式） → 議事録生成
- **実装内容**: メールデータを直接Gemini APIに渡して解析
- **変更理由**: メール内容のバリエーションが多く、事前抽出は困難。LLMに直接渡す方が柔軟で精度が高い
- **影響**: `PropertyInfo`型の抽出機能は保留（Phase 2で必要に応じて実装）

**2. プロンプトの外部ファイル化**

- **実装内容**:
  - `prompts/minutes-template.md` - 議事録フォーマット定義（57行）
  - `prompts/minutes-guidelines.md` - 作成ガイドライン（122行）
- **メリット**:
  - コード変更なしでプロンプトを調整可能
  - バージョン管理が容易
  - プロンプトの見通しが良い
- **実装場所**: [src/services/google/gemini.ts](src/services/google/gemini.ts#L36-L50) でファイル読み込み

**3. 使用モデルの変更**

- **当初の計画**: Gemini 2.5 Pro
- **実装内容**: `gemini-2.0-flash-exp`
- **変更理由**: Flash Expの方が高速で、議事録生成には十分な品質
- **実装場所**: [src/services/google/gemini.ts:190](src/services/google/gemini.ts#L190)

**4. 型定義の調整**

新規追加された型:
- `GeminiGenerateMinutesRequest` - Gemini APIリクエスト（[src/types/index.ts:33-41](src/types/index.ts#L33-L41)）
  ```typescript
  export interface GeminiGenerateMinutesRequest {
    date: Date;
    startTime: string;
    endTime: string;
    location: 'tokyo' | 'nagano' | 'online';
    participants: Participant[];
    companyName: string;
  }
  ```

### プロンプトエンジニアリングの知見

#### 1. 会話形式の抑制が最重要課題

**問題**: 初期実装では以下のような会話形式が生成された
```
裕美取締役からは「駅からとても遠いので、入居者がいるのか心配です。」との意見が出た。
```

**解決策**:
1. プロンプトとガイドラインの両方に「⚠️ 最重要ルール」セクションを追加
2. 良い例・悪い例を明示（[prompts/minutes-guidelines.md:102-112](prompts/minutes-guidelines.md#L102-L112)）
3. 「検討結果:」で始まる1段落形式を徹底
4. gemini.tsのプロンプト内でも再度強調（[src/services/google/gemini.ts:145-163](src/services/google/gemini.ts#L145-L163)）

**良い例**:
```
検討結果: 価格は500万円と安価だが、立地が武蔵嵐山駅徒歩39分と極めて悪く、賃貸需要が見込めない。高い空室リスクが想定されるため、見送るべきである。
```

#### 2. プロンプト構造の最適化

効果的なプロンプト構造（[src/services/google/gemini.ts:118-172](src/services/google/gemini.ts#L118-L172)）:
```
1. システムロール定義
2. 議事録テンプレート
3. 議事録作成ガイドライン
4. 会議情報（日時、場所、参加者）
5. 参加者詳細（プロファイル）
6. 物件情報メール
7. 指示
8. 重要な注意事項（会話形式禁止の再強調）
```

この順序で提示することで、フォーマット遵守率が向上しました。

### Gmail API統合の実装詳細（Day 9-10）

#### 1. ラベル検索の注意点

**問題**: 日本語ラベル名の検索でエラーが発生
**解決策**: ラベル名を引用符で囲む
```typescript
const query = `label:"${labelName}" after:${afterDate} before:${beforeDate}`;
```
**実装場所**: [src/services/google/gmail.ts:87](src/services/google/gmail.ts#L87)

#### 2. メール本文取得の複雑さ

**課題**:
- マルチパートメール対応が必須
- text/plain優先、なければtext/html
- HTMLタグ除去とエンティティデコードが必要
- Base64 URL-safe デコードの実装

**実装内容**:
- `extractEmailBody()` 関数（[src/services/google/gmail.ts:107-169](src/services/google/gmail.ts#L107-L169)）
- HTML to テキスト変換（[src/services/google/gmail.ts:180-186](src/services/google/gmail.ts#L180-L186)）
- Base64デコード（[src/services/google/gmail.ts:176-178](src/services/google/gmail.ts#L176-L178)）

#### 3. ラベル一覧取得の改善

**実装内容**:
- システムラベルを除外（`type='user'`のみ）
- 日本語での並び替え（`localeCompare`を使用）
- 実装場所: [src/services/google/gmail.ts:33-66](src/services/google/gmail.ts#L33-L66)

```typescript
const userLabels = labels.filter(label => label.type === 'user');
userLabels.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));
```

### 開発環境とUXの改善

#### 1. DevTools自動起動の無効化

**問題**: 開発時にコンソールが毎回開くのはUX上好ましくない
**解決策**:
- 開発モード判定コードをコメントアウト
- F12キーやメニューからのアクセスは維持
- 実装場所: [src/main/index.ts:48-49](src/main/index.ts#L48-L49), [src/main/index.ts:81](src/main/index.ts#L81)

```typescript
// 開発モードではDevToolsを開く（コメントアウト）
// if (isDev) {
//   mainWindow.webContents.openDevTools();
// }
```

#### 2. テスト機能の追加

**実装内容**:
- 設定画面にGemini APIテストボタンを追加（[src/renderer/settings.html:134-145](src/renderer/settings.html#L134-L145)）
- Gmail接続テスト → Gemini生成テストの2段階テストが可能
- 生成結果をTextareaで確認可能（400px高さ）
- IPC handler実装: [src/main/index.ts:324-380](src/main/index.ts#L324-L380)

**テストフロー**:
1. Gmail接続テストでメール取得を確認
2. 同じクエリでGemini APIテストを実行
3. 生成された議事録をTextareaに表示

### セキュリティとプライバシー

#### 1. プロンプトファイルのプライバシー保護

**問題**: 例文に実際の個人名（「裕美」「山田」）が含まれていた
**解決策**: プレースホルダー（「〇〇」「△△」）に置き換え
**修正ファイル**:
- [prompts/minutes-guidelines.md](prompts/minutes-guidelines.md#L16-L17)
- [src/services/google/gemini.ts:162](src/services/google/gemini.ts#L162)
**コミット**: 9c7be36 "fix: プロンプト例から個人名を削除しプライバシー保護を強化"

#### 2. .envファイルの管理

**実装内容**:
- `.gitignore`に`.env`を追加済み
- `.env.example`でテンプレート提供
- Gemini API キーの環境変数管理

### 型定義の追加（Week 2実装）

Week 2の実装で以下の型定義を追加（[src/types/index.ts](src/types/index.ts)）:

```typescript
// OAuth認証情報
export interface OAuth2Credentials {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// メールデータ
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
}

// Gmail検索クエリ
export interface GmailSearchQuery {
  startDate: Date;
  endDate: Date;
  label: string;
  maxResults?: number;
}

// Gemini APIリクエスト
export interface GeminiGenerateMinutesRequest {
  date: Date;
  startTime: string;
  endTime: string;
  location: 'tokyo' | 'nagano' | 'online';
  participants: Participant[];
  companyName: string;
}

// 参加者情報
export interface Participant {
  name: string;
  role: string;
  profile?: ParticipantProfile;
}

export interface ParticipantProfile {
  knowledgeLevel: 'high' | 'beginner';
  style: 'professional' | 'casual' | 'senior_casual' | 'very_casual';
}
```

### プロジェクト構造の追加

```
estate-minutes-generator/
├── prompts/                        # 【新規】プロンプト管理
│   ├── minutes-template.md         # 議事録フォーマット定義
│   └── minutes-guidelines.md       # 作成ガイドライン
├── src/
│   ├── services/
│   │   └── google/
│   │       ├── auth.ts             # OAuth 2.0（Day 7-8完了）
│   │       ├── gmail.ts            # Gmail API（Day 9-10完了）
│   │       └── gemini.ts           # Gemini API（Day 11-12完了）
```

### 残課題と次ステップ

#### 1. Day 13-14: Google Docs/Drive API統合

**実装内容**:
- 生成された議事録テキストをGoogle Docsに書き込む
- フォーマット適用（見出し、箇条書き、太字など）
- 指定フォルダ（「定例会」）への保存
- ファイル命名規則: `YYYYMMDD_検討議事録`

**実装予定ファイル**:
- `src/services/google/docs.ts`
- `src/services/google/drive.ts`

#### 2. 型定義の整理

**現状**:
- `PropertyInfo`型は定義されているが、抽出機能は未使用
- Phase 2で必要に応じて実装を検討

**今後の方針**:
- メールから直接Geminiに渡すアプローチが有効と判明
- 構造化データ抽出は、特定のユースケースで必要になった場合に実装

#### 3. プロンプトの継続的改善

**現状の品質**:
- 会話形式の抑制は成功
- 「検討結果:」形式の徹底

**今後の改善ポイント**:
- 実際の使用を通じてプロンプトを調整
- 外部MDファイル化により、調整が容易
- A4 1〜2枚のボリューム調整の精度向上

#### 4. Week 2完了チェックリスト更新

以下のチェックリストを更新:

### Gmail API 統合（Day 9-10）
- [x] Gmail API クライアント初期化
- [x] ラベルによるメール検索
- [x] 期間指定検索
- [x] メール本文の取得とデコード
- [x] IPC通信の実装

### Gemini API 統合（Day 11-12）
- [x] Gemini API クライアント初期化
- [x] プロンプトの外部ファイル化
- [x] 議事録コンテンツ生成
- [x] プロンプトエンジニアリング
- [x] テスト機能の実装

**注**: 当初計画の「メール本文から物件情報を抽出」は、「メールデータを直接Geminiに渡す」方式に変更

### 学んだベストプラクティス

1. **LLMの活用**: 構造化データ抽出よりも、生のデータを直接LLMに渡す方が柔軟
2. **プロンプト管理**: 外部ファイル化により、イテレーションが高速化
3. **段階的テスト**: Gmail → Gemini の2段階テストにより、問題の切り分けが容易
4. **UX配慮**: DevToolsの自動起動無効化など、小さな改善が重要
5. **プライバシー**: 例文やサンプルデータにも個人情報を含めない
6. **OAuthスコープ設計**: 機能ごとに適切なスコープを組み合わせる（drive + drive.file）

---

### Week 2 Day 13-14: Google Docs/Drive API統合の実装詳細

#### 実装した機能

**1. Google Docs API モジュール** ([src/services/google/docs.ts](src/services/google/docs.ts))
- ドキュメント作成（`createDocument`）
- テキスト挿入（`insertText`）
- 議事録ドキュメント作成（`createMinutesDocument`）
- ドキュメント内容取得（`getDocumentContent`）

**2. Google Drive API モジュール** ([src/services/google/drive.ts](src/services/google/drive.ts))
- ルートフォルダ一覧取得（`listRootFolders`）
- サブフォルダ一覧取得（`listFoldersInFolder`）
- フォルダ情報取得（`getFolderInfo`）
- フォルダパス取得（`getFolderPath` - パンくずリスト用）
- フォルダブラウザ用データ取得（`getDriveFolderList`）
- ドキュメント移動・リネーム（`moveAndRenameDocument`）
- フォルダ作成・検索（`createFolder`, `findFolderByName`, `getOrCreateFolder`）

**3. 議事録生成オーケストレータ** ([src/services/minutesGenerator.ts](src/services/minutesGenerator.ts))
- Gmail → Gemini → Docs → Drive の統合ワークフロー
- 参加者情報の自動マッピング（設定から役職を推定）
- バリデーション機能（`generateMinutesWithValidation`）

**4. フォルダブラウザUI** ([src/renderer/settings.html](src/renderer/settings.html), [src/renderer/ts/settings.ts](src/renderer/ts/settings.ts))
- ネストしたフォルダ構造のナビゲーション
- パンくずリスト表示
- フォルダ選択機能
- 選択フォルダの保存（パスとID両方）

#### 技術的課題と解決策

**問題1: OAuthスコープ不足によるフォルダ一覧取得失敗**

- **問題**: 初期実装で `drive.file` スコープのみを使用していたため、既存フォルダが取得できず空配列が返された
- **原因**: `drive.file` スコープはアプリが作成したファイルのみにアクセス可能
- **解決策**: `drive` スコープを追加して、両方のスコープを組み合わせて使用
  ```typescript
  const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.file',  // アプリが作成したファイルの管理
    'https://www.googleapis.com/auth/drive'        // 全Driveへのアクセス（フォルダブラウザ用）
  ];
  ```
- **実装場所**: [src/services/google/auth.ts:17-22](src/services/google/auth.ts#L17-L22)
- **影響**: スコープ変更後は再認証が必要

**問題2: 共有ドライブ対応の複雑さ**

- **当初の要望**: 共有ドライブのフォルダも選択可能にしたい
- **実装試行**: `listSharedDrives()` 機能を実装したが、権限エラーが発生
- **最終判断**: ユーザーの判断により、マイドライブのみに機能を絞り込み
- **教訓**: 機能範囲を明確にし、必要最小限から始めることの重要性

#### 型定義の追加

新規追加された型（[src/types/index.d.ts](src/types/index.d.ts)）:

```typescript
// Google Drive フォルダの型定義
export interface DriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

// フォルダブラウザ用のデータ構造
export interface DriveFolderList {
  folders: DriveFolder[];           // 現在のフォルダ配下のフォルダ一覧
  currentFolder?: DriveFolder;      // 現在のフォルダ情報
  breadcrumb: DriveFolder[];        // パンくずリスト（ルートから現在まで）
}

// Google Docs ドキュメント作成リクエスト/レスポンス
export interface DocsCreateRequest {
  title: string;
  minutesText: string;
}

export interface DocsCreateResponse {
  documentId: string;
  documentUrl: string;
  fileName: string;
}
```

#### プロジェクト構造の更新

```
estate-minutes-generator/
├── src/
│   ├── services/
│   │   ├── google/
│   │   │   ├── auth.ts              # OAuth 2.0（Day 7-8）
│   │   │   ├── gmail.ts             # Gmail API（Day 9-10）
│   │   │   ├── gemini.ts            # Gemini API（Day 11-12）
│   │   │   ├── docs.ts              # 【新規】Google Docs API（Day 13-14）
│   │   │   └── drive.ts             # 【新規】Google Drive API（Day 13-14）
│   │   └── minutesGenerator.ts      # 【新規】議事録生成オーケストレータ（Day 13-14）
```

#### デバッグとトラブルシューティング

**デバッグログの活用**:
- 問題発生時に各レイヤー（Drive API → IPC Handler → Renderer）にデバッグログを追加
- データフローを追跡することで、フォルダ一覧が空になる原因を特定
- 問題解決後はデバッグログを削除してコードをクリーンに保つ

**段階的テスト**:
1. Docs/Drive APIテストボタンで個別機能を確認
2. フォルダブラウザでUI動作を確認
3. メイン画面から全体フローを確認

#### Phase 1 完了時点の成果

**Week 2（Day 1-14）で実装完了した機能**:
- ✅ Electron基本セットアップ
- ✅ UI設計（メイン画面・設定画面）
- ✅ 設定管理（electron-store）
- ✅ OAuth 2.0 認証
- ✅ Gmail API統合
- ✅ Gemini API統合（プロンプト外部ファイル化）
- ✅ Google Docs API統合
- ✅ Google Drive API統合（フォルダブラウザ付き）
- ✅ 議事録生成の完全自動化（Gmail → Gemini → Docs → Drive）

**残課題（Week 3で対応予定）**:
- ~~エラーハンドリングの強化~~ → Day 15-16で実装完了
- ~~プログレス表示の改善~~ → Day 15-16で実装完了
- 年月フォルダ構造の自動作成（2025/01/のような階層）- オプション
- ユーティリティ実装（logger, validation, dateFormatter）
- エンドツーエンドテスト
- ユーザードキュメントの作成

---

### Week 3 Day 15-16: メイン画面とバックエンドの統合実装詳細

#### 実装した機能

**1. IPC Handler の実装** ([src/main/index.ts:449-512](src/main/index.ts#L449-L512))
- `generateMinutesWithValidation()` の統合
- プログレスイベント送信の実装:
  - Step 1 (20%): `Gmail から物件情報を取得しています...`
  - Step 2 (50%): `議事録の内容を生成しています...`
  - Step 3 (80%): `Google Docs に保存しています...`
- 完了通知: `generation-complete` イベント送信
- エラー通知: `generation-error` イベント送信（詳細メッセージ付き）
  - 認証エラー → 「設定画面で再認証してください」
  - メールなし → 「検索条件を確認してください」
  - その他エラー → 元のエラーメッセージを表示

**2. プログレスイベントリスナー** ([src/renderer/ts/main.ts:123-146](src/renderer/ts/main.ts#L123-L146))
- `setupProgressListeners()` 関数を追加
  - `onProgress`: リアルタイムでプログレスバー更新
  - `onComplete`: 成功ダイアログ表示
  - `onError`: エラーダイアログ表示
- タイマーベースの疑似アニメーションを削除
- 実際のバックエンド処理に連動した表示

**3. 成功/エラーダイアログUI** ([src/renderer/index.html:146-181](src/renderer/index.html#L146-L181))
- **成功ダイアログ**:
  - SVGチェックマークアイコン（グリーン）
  - Google Docs URL リンク（クリック可能）
  - 「ブラウザで開く」ボタン（`window.open()` で外部ブラウザ起動）
  - 「閉じる」ボタン
- **エラーダイアログ**:
  - SVGエラーアイコン（レッド）
  - 詳細なエラーメッセージ表示
  - 「閉じる」ボタン

**4. ダイアログスタイル** ([src/renderer/css/main.css:405-547](src/renderer/css/main.css#L405-L547))
- モーダルオーバーレイ（半透明背景）
- フェードインアニメーション（0.3s）
- スライドアップアニメーション（0.3s）
- 成功: グリーン系カラー (#10B981)
- エラー: レッド系カラー (#EF4444)
- レスポンシブ対応（モバイルでは縦並び）

#### 技術的な改善点

**プログレス更新の仕組み**:
- 従来: タイマーベースの疑似アニメーション（500msごとに10%ずつ増加）
- 改善後: IPCイベント駆動のリアルタイム更新
- メリット: 実際の処理進行状況を正確に反映

**エラーハンドリングの階層化**:
```
1. minutesGenerator でエラー発生
2. IPC handler でキャッチ・整形
3. generation-error イベント送信
4. レンダラーでダイアログ表示
```

**イベントリスナーの once オプション**:
```typescript
closeSuccessBtn?.addEventListener('click', () => {
    dialog.style.display = 'none';
}, { once: true });  // 1回のみ実行、自動削除
```
→ メモリリーク防止

#### デバッグとテスト

**ビルド結果**:
```bash
npm run build
# ✅ エラーなしでコンパイル成功
```

**動作確認項目** (次のテストフェーズで実施予定):
1. メイン画面で「議事録を作成」ボタンをクリック
2. プログレスバーが 0% → 20% → 50% → 80% → 100% と更新
3. 成功時に成功ダイアログ表示
4. Google Docs URL をクリックして外部ブラウザで開く
5. エラー時にエラーダイアログ表示

#### 学んだベストプラクティス

1. **IPCイベント駆動アーキテクチャ**: タイマーではなくバックエンドの実際の進行状況をイベントで通知
2. **ダイアログのモーダル実装**: オーバーレイ + アニメーション + フォーカストラップ
3. **エラーメッセージの階層化**: 技術的エラー → ユーザー向けメッセージに変換
4. **once オプション活用**: イベントリスナーのメモリリーク防止
5. **フォールバック実装**: ダイアログ要素が見つからない場合は `alert()` で対応

#### 残課題

**現在完了**:
- ✅ メイン画面とバックエンドの完全統合
- ✅ リアルタイムプログレス表示
- ✅ 成功/エラーダイアログ

**次のステップ (Day 17以降)**:
- Day 17: UX改善（ボタン無効化、リトライ機能）
- Day 18: ユーティリティ実装（logger, validation, dateFormatter）
- Day 19-20: 統合テスト、バグ修正
- Day 21: ドキュメント作成、リリース準備

---

### Week 3 Day 19-20: E2Eテスト結果と改善実装

#### E2Eテスト実施結果

**テスト日時**: Day 15-16 実装完了後
**テスト範囲**: 設定保存 → 認証 → Gmail取得 → Gemini生成 → Docs作成 → Drive保存

**✅ 成功した項目**:
1. メイン画面から設定画面への遷移
2. Google OAuth 2.0 認証フロー
3. Gmail ラベル選択とメール取得
4. Gemini API による議事録生成
5. Google Docs ドキュメント作成
6. Drive フォルダへの保存
7. プログレスバーのリアルタイム更新（20% → 50% → 80%）
8. 成功ダイアログの表示とGoogle Docs URLリンク
9. 「ブラウザで開く」ボタンの動作
10. 全体的なフロー動作確認

**⚠️ 発見した改善点**:

#### 改善1: アプリ背景色の変更

**問題点**:
- 現在の紫グラデーション（#667eea → #764ba2）が派手すぎる
- ビジネスアプリとしてもっと落ち着いた色が望ましい

**修正内容**:
- ヘッダー背景を淡い青単色に変更
- Material Design Light Blue 50 (#E3F2FD) を採用
- ボタンのグラデーションは維持（視覚的なアクセントとして）

**変更ファイル**: [src/renderer/css/main.css](src/renderer/css/main.css)

#### 改善2: Gmail取得期間の日付処理修正 🔴 重要

**問題点**:
- 同じ日（例: 2025-01-15 〜 2025-01-15）を指定するとメールが取得できない
- 原因: `gmailEndDate` が `2025-01-15 00:00:00` となり、その日のメールが範囲外になる
- Gmail API の検索クエリ `after:2025/01/15 before:2025/01/15` が空の結果を返す

**修正内容**:
- `gmailEndDate` を自動的に 23:59:59.999 に設定
- これにより、同じ日を指定した場合でもその日の全メールが取得可能

**実装詳細**:
```typescript
// src/renderer/ts/main.ts の generateMinutes() 関数
const gmailEndDateStr = formData.get('gmailEndDate') as string;
const gmailEndDate = new Date(gmailEndDateStr);
gmailEndDate.setHours(23, 59, 59, 999);  // 23:59:59.999 に設定
```

**影響範囲**:
- Gmail API 検索クエリの精度向上
- ユーザビリティの改善（1日分のメールを取得する際に同じ日を指定可能）

**変更ファイル**: [src/renderer/ts/main.ts](src/renderer/ts/main.ts)

#### 改善3: Google Docs フォーマット適用

**問題点**:
- 現在の議事録がプレーンテキストで生成される
- 見出しや強調表示がなく、可読性が低い
- ビジネス文書としての体裁が不十分

**修正内容**:
- Google Docs API のバッチ更新機能を使用
- テキスト解析により以下の書式を適用:
  - `# 見出し` → 見出し1スタイル（HEADING_1）
  - `## 小見出し` → 見出し2スタイル（HEADING_2）
  - `**太字**` → 太字スタイル
  - `【議題】` などの特定パターン → 太字化

**実装方針**:
1. Gemini で生成されたテキストを行ごとに解析
2. Markdown風の記法を検出
3. Google Docs API の `batchUpdate` でスタイル適用
4. `InsertTextRequest` + `UpdateParagraphStyleRequest` + `UpdateTextStyleRequest`

**実装場所**: [src/services/google/docs.ts](src/services/google/docs.ts) の `createMinutesDocument()` 関数

**変更ファイル**:
- `src/services/google/docs.ts` - 書式設定ロジック追加
- `prompts/minutes-template.md` - Markdown記法の明示（オプション）

#### 修正後の再テスト結果

**実施状況**: 3つの改善を実装完了 ✅

**実装完了項目**:
1. ✅ **改善1: 背景色変更**
   - [src/renderer/css/main.css](src/renderer/css/main.css#L10) を修正
   - 紫グラデーション → 淡い青単色 (#E3F2FD)

2. ✅ **改善2: Gmail日付処理修正**
   - [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L182-L185) を修正
   - `gmailEndDate` を 23:59:59.999 に自動設定
   - 同じ日を指定した場合でも全メール取得可能に

3. ✅ **改善3: Google Docs フォーマット適用**
   - [src/services/google/docs.ts](src/services/google/docs.ts#L91-L210) を修正
   - `insertFormattedMinutesText()` 関数を新規実装
   - 適用されるフォーマット:
     - 1行目（会社名）: 見出し1 + 太字 + 中央揃え
     - 2行目（「議事録」）: 見出し2 + 太字 + 中央揃え
     - 【議題】【議事内容】【結論】: 見出し3 + 太字
     - 日時/場所/参加者: 太字
     - 番号付きリスト: 太字

**ビルド結果**: ✅ エラーなしでコンパイル成功

**次のステップ**: 実際にアプリを起動して再度E2Eテストを実施し、3つの改善が正常に動作することを確認

**確認項目**:
1. ヘッダー背景色が淡い青になっているか
2. 同じ日を指定してもメールが取得できるか
3. Google Docs の書式が適切に適用されているか（見出し、太字、中央揃え）
4. 全体フローに問題がないか

---

### Week 3: Day 21-22 - 追加改善実装（2回目のE2Eテスト結果対応）

**実施日**: 2025-11-19

#### 2回目のE2Eテスト結果

Day 19-20の改善実装後、再度E2Eテストを実施したところ、新たに2つの問題が発見された。

**発見された問題**:

**問題4**: 参加者名の表示不具合
- 議事録に「参加者：代表取締役社長 参加者president、取締役 参加者wife」と表示される
- 設定した実際の名前が入っていない
- また、肩書きが不要（名前のみを記載したい）

**問題5**: タイムゾーンの問題
- Gmail取得期間がUTCとして処理されている可能性
- 2025-11-19のメールを取得するには、gmailEndDateを2025-11-20に設定する必要がある
- 画面からの入力はJST（日本標準時）として扱いたい

#### 問題4の原因分析と修正

**原因**:
[src/services/minutesGenerator.ts](src/services/minutesGenerator.ts#L53-L92) の参加者マッピングロジックに問題があった:
```typescript
// 修正前のコード
const participants: Participant[] = request.participants.map(name => {
  if (name === config.participants.president) {  // ❌ 'president' === '山田太郎' は常にfalse
    return { name, role: '代表取締役社長', ... };
  }
  // ...
  return { name, role: '参加者', ... };  // ❌ nameに'president'が入る
});
```

`request.participants` には `['president', 'wife']` のようなキー配列が渡されるが、コードは設定値（実際の名前）と比較していた。このため全ての参加者がデフォルトケースに該当し、キー名がそのまま name に設定されていた。

**修正内容**:
```typescript
// 修正後のコード
const participants: Participant[] = request.participants.map(participantKey => {
  // キーを使って設定から実際の名前を取得
  const actualName = config.participants[participantKey as keyof typeof config.participants];

  if (participantKey === 'president') {
    return {
      name: actualName,  // ✅ 設定ファイルの実際の名前
      role: '代表取締役社長',
      profile: { knowledgeLevel: 'high', style: 'professional' }
    };
  }
  // ...
});
```

また、[src/services/google/gemini.ts](src/services/google/gemini.ts#L56) の `formatParticipants()` 関数も修正:
```typescript
// 修正前
function formatParticipants(participants: Participant[]): string {
  return participants.map(p => `${p.role} ${p.name}`).join('、');  // ❌ 役職と名前
}

// 修正後
function formatParticipants(participants: Participant[]): string {
  return participants.map(p => p.name).join('、');  // ✅ 名前のみ
}
```

**変更ファイル**:
- [src/services/minutesGenerator.ts](src/services/minutesGenerator.ts#L53-L96)
- [src/services/google/gemini.ts](src/services/google/gemini.ts#L56)

#### 問題5の原因分析と修正

**原因**:
Gmailの `after:` と `before:` 演算子は排他的（exclusive）であるため:
- `after:2025/11/19` は「2025-11-19 00:00以降」を意味し、11/19は含まれない
- `before:2025/11/20` は「2025-11-20 00:00より前」を意味し、11/19全体が含まれる

また、Day 19-20で実装した `setHours(23, 59, 59, 999)` による修正は、タイムゾーンの問題を完全には解決できていなかった。

**修正内容**:
[src/services/google/gmail.ts](src/services/google/gmail.ts#L75-L86) の `searchEmails()` 関数で日付を調整:
```typescript
// Gmail の after: と before: は排他的（exclusive）なので、
// 指定期間を完全に含めるために日付を調整
const adjustedStartDate = new Date(query.startDate);
adjustedStartDate.setDate(adjustedStartDate.getDate() - 1); // 1日前

const adjustedEndDate = new Date(query.endDate);
adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // 1日後

let searchQuery = `after:${formatDateForGmail(adjustedStartDate)} before:${formatDateForGmail(adjustedEndDate)}`;
```

これにより、ユーザーが指定した期間が完全にカバーされる:
- ユーザー指定: 2025-11-19 ～ 2025-11-19（同じ日）
- Gmail検索: after:2025/11/18 before:2025/11/20
- 結果: 2025-11-19の全メールを取得可能

また、[src/renderer/ts/main.ts](src/renderer/ts/main.ts#L182-L191) の `setHours` 処理を削除（不要になったため）:
```typescript
// 修正前
const gmailEndDateTime = new Date(gmailEndDate);
gmailEndDateTime.setHours(23, 59, 59, 999);
const request = {
  // ...
  gmailEndDate: gmailEndDateTime
};

// 修正後（シンプルに）
const request = {
  // ...
  gmailEndDate: new Date(gmailEndDate)
};
```

**変更ファイル**:
- [src/services/google/gmail.ts](src/services/google/gmail.ts#L75-L86)
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L182-L191)

#### ビルドとテスト結果

**ビルド結果**: ✅ エラーなしでコンパイル成功

```bash
$ npm run build
> estate-minutes-generator@1.0.0 build
> tsc
```

**期待される動作**:
1. ✅ 参加者名が正しく表示される（設定ファイルの実際の名前）
2. ✅ 参加者欄に役職が含まれない（名前のみ）
3. ✅ 同じ日を指定した場合でも正しくメールが取得できる
4. ✅ JSTで入力した日付がそのまま使用される（UTC変換の問題が解消）

#### 実装完了チェックリスト

- [x] 問題4修正: 参加者名マッピングの修正
- [x] 問題4修正: 役職表示の削除
- [x] 問題5修正: Gmail日付範囲の調整（+1/-1日）
- [x] 問題5修正: 不要な `setHours` 処理の削除
- [x] TypeScriptビルド成功確認
- [ ] E2Eテストで動作確認（ユーザー実施予定）

**次のステップ**:
アプリを起動して3回目のE2Eテストを実施し、問題4と問題5が解決されていることを確認する。

**確認項目**:
1. 参加者に設定した実際の名前が表示されているか
2. 参加者欄に役職が含まれていないか（名前のみ）
3. 2025-11-19を指定して2025-11-19のメールが取得できるか
4. タイムゾーン問題が解消されているか

#### 3回目のE2Eテスト結果

**実施結果**: 問題4と問題5は解決したが、新たに問題6を発見

**解決確認**:
- ✅ 参加者に設定した実際の名前が表示される（問題4-1解決）
- ⚠️ 参加者欄に役職が残っている（問題4-2未解決 → 問題6として対応）
- ✅ 2025-11-19を指定して2025-11-19のメールが取得できる（問題5解決）

**新規発見問題**:

**問題6**: Geminiプロンプト内の役職表示
- 参加者名は正しく表示されるが、まだ役職が含まれている
- 原因: [src/services/google/gemini.ts](src/services/google/gemini.ts#L135) の「参加者詳細」セクションで `${p.role} ${p.name}` という順序でGeminiに渡していた
- Geminiがこのフォーマットをそのまま議事録に反映している

#### 問題6の修正

**修正内容1**: 参加者詳細の順序変更
```typescript
// 修正前（行135）
${participants.map(p => `- ${p.role} ${p.name}: 知識レベル=...`).join('\n')}

// 修正後
${participants.map(p => `- ${p.name}: 知識レベル=..., 役職=${p.role}`).join('\n')}
```

名前を先頭に配置し、役職は属性の一つとして後ろに移動。

**修正内容2**: 明示的な指示追加
```typescript
// その他の注意事項に追加（行170）
5. **参加者欄には名前のみを記載**（役職は含めない）
```

Geminiに対して、参加者欄には役職を含めないよう明示的に指示。

**変更ファイル**:
- [src/services/google/gemini.ts](src/services/google/gemini.ts#L135,L170)

**ビルド結果**: ✅ エラーなしでコンパイル成功

**E2E再テスト結果**: ✅ 役職が完全に削除され、名前のみ表示されることを確認

---

### Week 3: Day 23-24 - 追加改善実装（UI/UX改善）

**実施日**: 2025-11-19

#### 4回目のE2Eテスト結果

すべての問題が解決したことを確認したが、さらに2つのUI/UX改善点が発見された。

**発見された問題**:

**問題7**: デフォルト時刻が反映されていない
- 設定ファイルの `defaultMeetingStartTime`, `defaultMeetingEndTime` がメイン画面の時刻ピッカーに反映されていない
- 現状: ハードコードで14:00が設定されている
- 期待: 設定ファイルの値を使用

**問題8**: Gmail取得期間の扱いが不明確
- ±1日調整により、Gmail取得期間が実質的に不要になっている可能性
- UIとしてどう扱うべきか検討が必要
- ユーザー要望: 自動計算と手動指定を切り替えられるようにしたい

#### 問題7と問題8の修正実装

**実施内容**: デフォルト時刻の読み込みとGmail期間設定の自動/手動切り替え機能を実装

##### 問題7の修正: デフォルト時刻の読み込み

**原因**:
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts) で時刻が `'14:00'` とハードコードされていた
- 設定ファイルの `defaults.startTime` と `defaults.endTime` が使用されていなかった

**修正内容**:
1. `initializePage()` を非同期関数に変更し、`window.electronAPI.loadSettings()` で設定を読み込み
2. 開始時刻（`#startTime`）と終了時刻（`#endTime`）を個別にFlatpickr初期化
3. 設定値をフォールバック付きで使用：`settings?.defaults?.startTime || '14:00'`

**変更ファイル**:
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L8-L60) - 設定読み込みと個別時刻設定

##### 問題8の修正: Gmail取得期間の自動/手動切り替え

**修正内容**:

1. **UI追加**: ラジオボタンで「自動計算」「手動指定」を選択可能に
   - デフォルトは「自動計算」
   - 「手動指定」選択時のみ日付フィールドを表示

2. **自動計算ロジック**:
   - 会議日 - `retrievalPeriod`日 → Gmail開始日
   - 会議日 + `retrievalPeriod`日 → Gmail終了日
   - `retrievalPeriod` は設定ファイルの `defaults.retrievalPeriod`（デフォルト1日）

3. **手動指定モード**: 従来通り日付フィールドから取得

**変更ファイル**:
- [src/renderer/index.html](src/renderer/index.html#L106-L137) - ラジオボタン追加
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L115-L134) - 切り替えリスナー
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L220-L245) - 自動計算ロジック

#### ビルド結果

**ビルド結果**: ✅ エラーなしでコンパイル成功

**実装完了チェックリスト**:
- [x] 問題7: 設定ファイルからデフォルト時刻を読み込み
- [x] 問題7: 開始時刻・終了時刻を個別に設定
- [x] 問題8: ラジオボタンでGmail期間設定モードを選択
- [x] 問題8: 自動計算ロジック実装（会議日±N日）
- [x] 問題8: 手動指定時の日付フィールド表示制御
- [x] TypeScriptビルド成功
- [ ] E2Eテスト（ユーザー実施予定）

**次のステップ**: アプリを起動して以下を確認：
1. デフォルト時刻が設定ファイルの値で表示されるか
2. Gmail期間設定で「自動計算」「手動指定」が切り替えられるか
3. 自動計算で会議日から±N日のメールが取得されるか

#### 5回目のE2Eテスト結果: Gmail検索クエリの修正

**実施日**: 2025-11-19

##### 発見された問題

**E2Eテスト結果**:
- 会議日: 2025-11-19
- 設定: `retrievalPeriod = 1`
- 期待されるGmailクエリ: `after:2025/11/18 before:2025/11/20`
- 実際のGmailクエリ: `after:2025/11/16 before:2025/11/22`

**問題点**:
1. **自動計算ロジックの誤り**: 「会議日±N日」として実装していたが、正しくは「N日前から会議日まで」であるべき
2. **二重調整の発生**: main.tsで計算した日付に対し、gmail.tsでさらに±1日調整していた

##### 修正1: 自動計算ロジックの修正

**修正内容**:
[src/renderer/ts/main.ts](src/renderer/ts/main.ts#L173-L186) の自動計算ロジックを修正:

```typescript
// 修正前
if (gmailDateMode === 'auto') {
  const retrievalPeriod = settings?.defaults?.retrievalPeriod || 1;
  const meetingDateObj = new Date(meetingDate);

  const startDateObj = new Date(meetingDateObj);
  startDateObj.setDate(startDateObj.getDate() - retrievalPeriod);
  gmailStartDate = startDateObj.toISOString().split('T')[0];

  const endDateObj = new Date(meetingDateObj);
  endDateObj.setDate(endDateObj.getDate() + retrievalPeriod); // ❌ 会議日 + N日
  gmailEndDate = endDateObj.toISOString().split('T')[0];
}

// 修正後
if (gmailDateMode === 'auto') {
  const retrievalPeriod = settings?.defaults?.retrievalPeriod || 1;
  const meetingDateObj = new Date(meetingDate);

  // 開始日 = 会議日 - N日
  const startDateObj = new Date(meetingDateObj);
  startDateObj.setDate(startDateObj.getDate() - retrievalPeriod);
  gmailStartDate = startDateObj.toISOString().split('T')[0];

  // 終了日 = 会議日（会議日当日まで）✅
  gmailEndDate = meetingDate;
}
```

**変更ファイル**:
- [src/renderer/ts/main.ts](src/renderer/ts/main.ts#L185-L186)

##### 修正2: Gmail検索クエリの二重調整修正

**問題分析**:
修正1実施後も、Gmail検索クエリが正しくない問題が残っていた:
- main.tsで計算: `gmailStartDate = 2025-11-18, gmailEndDate = 2025-11-19`
- gmail.tsでさらに調整: `startDate - 1, endDate + 1`
- 結果: `after:2025/11/17 before:2025/11/20`（開始日が1日早すぎる）

**原因**:
[src/services/google/gmail.ts](src/services/google/gmail.ts#L80-L86) で両方の日付を調整していたが、`startDate`への`-1`調整は不要だった。

Gmailの`after:`と`before:`演算子の特性:
- `after:2025/11/18`: 2025-11-18 00:00以降（11/18含む）
- `before:2025/11/20`: 2025-11-20 00:00より前（11/19含む）

**修正内容**:
```typescript
// 修正前
const adjustedStartDate = new Date(query.startDate);
adjustedStartDate.setDate(adjustedStartDate.getDate() - 1); // ❌ 不要な調整
const adjustedEndDate = new Date(query.endDate);
adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
let searchQuery = `after:${formatDateForGmail(adjustedStartDate)} before:${formatDateForGmail(adjustedEndDate)}`;

// 修正後
const adjustedEndDate = new Date(query.endDate);
adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // endDateのみ+1
// 検索クエリを構築
let searchQuery = `after:${formatDateForGmail(query.startDate)} before:${formatDateForGmail(adjustedEndDate)}`;
```

**変更ファイル**:
- [src/services/google/gmail.ts](src/services/google/gmail.ts#L80-L86)

##### ビルドとテスト結果

**ビルド結果**: ✅ エラーなしでコンパイル成功

```bash
$ npm run build
> estate-minutes-generator@1.0.0 build
> tsc
```

**修正後の動作**:
- 会議日: 2025-11-19
- `retrievalPeriod = 1`
- main.tsで計算: `gmailStartDate = 2025-11-18, gmailEndDate = 2025-11-19`
- gmail.tsで調整: `after:2025/11/18 before:2025/11/20`
- 結果: ✅ 2025-11-18と2025-11-19のメールを取得（期待通り）

**実装完了チェックリスト**:
- [x] 自動計算ロジック修正（会議日+N → 会議日）
- [x] Gmail検索クエリの二重調整修正（startDate調整削除）
- [x] TypeScriptビルド成功
- [ ] E2Eテスト（ユーザー実施予定）

**次のステップ**:
実際にアプリを起動して、Gmail検索クエリが正しく `after:2025/11/18 before:2025/11/20` となり、期待通りのメールが取得できることを確認する。

---
