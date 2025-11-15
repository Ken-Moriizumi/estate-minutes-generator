# 不動産賃貸業法人 議事録自動生成ツール仕様書

> **📌 実装に関する重要な注意事項**
>
> Phase 1 の実装は **`docs/phase1.md`** に記載された詳細な実装計画に従って進めてください。
>
> - Phase 1 実装計画: [`docs/phase1.md`](./phase1.md)
> - 実装範囲: 物件検討議事録のみ（MVP）
> - 実装期間: 3週間（Week 1: 基盤構築、Week 2: Google統合、Week 3: UI統合とテスト）
>
> 本仕様書（claude.md）は全体の機能要件を記載していますが、実際の実装は phase1.md の段階的な計画に沿って進めることを推奨します。

## 1. プロジェクト概要

### 1.1 目的
家族経営の不動産賃貸業法人において、週2〜3回実施する勉強会・会議の議事録を自動生成し、会議費・社内交際費の適正な経費計上を支援するツールを開発する。

### 1.2 背景
- 税務調査に耐えうる実質的な業務会議の記録が必要
- 定期的な勉強会（税務・不動産市場・物件検討）の内容を効率的に文書化
- A4用紙1〜2枚程度の適切なボリュームで議事録を作成

## 2. 機能要件

### 2.1 議事録タイプ（段階的実装）

#### Phase 1（初期リリース）
**検討議事録**
- Gmailの特定ラベルから指定期間の物件情報メールを収集
- 築年数、立地、購入金額を中心に物件購入の是非を検討
- 参加者ごとの意見を自動生成

#### Phase 2（将来実装予定）
1. **税務会議**
   - YouTubeの税理士チャンネルの最新動画（1〜2本）を情報源
   - 税務に関する最新情報と実務への影響を議論

2. **不動産情報**
   - 楽待ニュースの最新記事（約10件）を情報源  
   - 市場動向と自社業務への影響を検討

### 2.2 自動生成内容

#### アジェンダ
- 収集した情報から自動的に議題を生成
- 各議事録タイプに応じた適切な議題設定

#### 議事内容
- 参加者ごとの感想・意見を自動生成
- 実質的な業務討議が行われたことが分かる内容
- 約1時間の会議を想定した記載量

#### 結論
- 各議題に対する簡潔な結論を自動生成
- 感想のサマリーと今後の方針

### 2.3 参加者設定

#### 役員構成
- 代表取締役社長（東京）
- 取締役・非常勤（妻・東京）
- 取締役会長（父・長野）
- 取締役・非常勤（母・長野）
- 取締役・非常勤（姉・東京）※年次定例のみ参加

#### 開催場所別の参加者
- **東京開催**：代表取締役社長、取締役（妻）
- **長野開催**：取締役会長、取締役（母）
- **オンライン開催**：上記の組み合わせを選択可能

## 3. 技術仕様

### 3.1 アプリケーション構成
- **プラットフォーム**：Electron（Windows/Mac両対応）
- **開発言語**：TypeScript
- **UI**：シンプルな操作画面
  - 開催場所選択（東京/長野/オンライン）
  - 議事録タイプ選択
  - 生成実行ボタン

### 3.2 データ収集

#### YouTube API + 動画内容解析
- 指定チャンネルの最新動画情報を取得
- 動画タイトル、説明文、公開日時
- **字幕データの取得**（YouTube Transcript API）
- **動画内容の要約・ポイント抽出**（Claude API）

#### 楽待スクレイピング
- ニュースページから最新記事を取得
- 記事タイトル、概要、カテゴリ

#### Gmail API
- 指定ラベルのメールを取得
- 直近1日分の物件情報を抽出

### 3.3 議事録生成

#### AI活用（Gemini API）
入力情報を基に以下を生成：
- 議題の構成
- 参加者ごとの意見・感想
- 会議の結論
- 実務への影響分析

※ Gemini 2.5 Pro を使用

### 3.4 出力仕様

#### Googleドキュメント
- Google Docs APIで直接作成
- A4用紙1〜2枚相当の分量

#### ファイル管理
- **保存先**：Google Drive「定例会」フォルダ
- **命名規則**：
  - `YYYYMMDD_税務会議`
  - `YYYYMMDD_不動産情報`
  - `YYYYMMDD_検討議事録`

## 4. 議事録フォーマット

```
株式会社〇〇〇〇
議事録

日時：20XX年XX月XX日 XX:00～XX:00
場所：[東京事務所/長野事務所/オンライン]
参加者：[役職名と名前のリスト]

【議題】
1. [自動生成された議題1]
2. [自動生成された議題2]
3. [自動生成された議題3]

【議事内容】
1. [議題1について]
   ＜動画/記事の要点＞
   [AIが解析した具体的な内容のサマリー]
   
   参加者A：[動画内容を踏まえた具体的な意見・感想]
   参加者B：[動画内容を踏まえた具体的な意見・感想]
   
2. [議題2について]
   ＜動画/記事の要点＞
   [AIが解析した具体的な内容のサマリー]
   
   参加者A：[内容を踏まえた具体的な意見・感想]
   参加者B：[内容を踏まえた具体的な意見・感想]

3. [議題3について]
   ＜物件情報等の要点＞
   [物件の具体的なスペックや条件]
   
   参加者A：[具体的な検討意見]
   参加者B：[具体的な検討意見]

【結論】
[各議題の要点と今後の方針をまとめた内容]
[当社の不動産賃貸業への具体的な適用方法]

以上
```

## 5. 開発要件

### 5.1 必要なAPI/認証
- Google OAuth 2.0（Drive, Docs, Gmail）
- YouTube Data API v3
- Gemini API（Google AI Studio）

### 5.2 環境設定
```env
# .env ファイル（認証情報のみ）
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GEMINI_API_KEY=xxx
```

```json
// config.json (ユーザー設定)
// electron-storeで管理される設定
```

### 5.3 主要な依存関係

#### 開発環境
- **TypeScript**（型安全な開発）
- **@types/node**（Node.js型定義）
- **@types/electron**（Electron型定義）
- **ts-node**（TypeScript実行環境）

#### フレームワーク・ライブラリ
- **Electron**（デスクトップアプリケーション）
- **Google APIs Client Library**（googleapis）
- **@google/generative-ai**（Gemini API SDK）
- **electron-store**（設定の永続化）
  - **注意**: electron-store v10はESM-onlyパッケージです。
  - 使用するには以下が必須:
    - package.jsonに`"type": "module"`
    - tsconfig.jsonで`module: "ESNext"`と`moduleResolution: "bundler"`
    - webPreferencesで`sandbox: false`
- **flatpickr**（日付範囲選択UI）
- **dotenv**（環境変数管理）

#### Phase 2 で追加予定
- **Puppeteer**（楽待スクレイピング用）
- **youtube-transcript**（字幕取得用）
- **ytdl-core**（動画情報取得用）

---

### 5.4 ESM (ECMAScript Modules) 対応

Phase 1では、最新のJavaScript標準であるESMを採用しています。
これにより、electron-store v10などのESM-onlyパッケージを使用できます。

#### 必須設定

**package.json**
```json
{
  "type": "module"
}
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

#### ESM特有の実装パターン

**1. import文での.js拡張子（必須）**

TypeScriptファイルでも、コンパイル後の`.js`ファイルを参照:

```typescript
// ✓ 正しい
import { ConfigManager } from '../utils/config.js';

// ✗ エラー
import { ConfigManager } from '../utils/config';
```

**2. __dirnameの代替実装**

```typescript
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

**3. Preloadスクリプトの拡張子**

- ソースファイル: `.mts`
- コンパイル後: `.mjs`
- TypeScriptが自動的に変換

**4. sandbox設定**

electron-store使用のため、`sandbox: false`が必要:

```typescript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: false,  // electron-storeのため
  preload: path.join(__dirname, 'preload.mjs')
}
```

**セキュリティ**: `contextIsolation`と`nodeIntegration: false`を維持することで、
sandboxを無効化してもセキュリティは確保されます。

#### よくあるエラーと解決方法

**"Cannot find module"**
- **原因**: import文に`.js`拡張子が不足
- **解決**: 全てのローカルimportに`.js`を追加

**"__dirname is not defined"**
- **原因**: ESMでは`__dirname`が使用不可
- **解決**: `fileURLToPath(import.meta.url)`を使用

**"store.get is not a function"**
- **原因**: sandboxモードでelectron-storeが動作しない
- **解決**: `sandbox: false`を設定

詳細なトラブルシューティングはphase1.mdを参照してください。

---

## 6. 実装フロー

### 6.1 ツール使用の流れ（Phase 1）

#### Step 1: ツール起動
Electronアプリを起動し、メイン画面を表示

#### Step 2: 議事録設定画面
以下の項目を順次設定：

**1. 参加者・参加場所の選択**
```
開催場所：[◉東京事務所 ○長野事務所 ○オンライン]
         ↓
参加者が自動設定される
- 東京：代表取締役社長、取締役（妻）
- 長野：取締役会長、取締役（母）  
- オンライン：カスタム選択可能
```

**2. 議事録の日時設定**
```
開催日：[カレンダー選択] デフォルト：本日
開始時刻：[時刻選択] デフォルト：14:00
終了時刻：[時刻選択] デフォルト：15:00
```

**3. Gmail物件情報の取得期間設定**
```
物件情報取得期間：
開始日：[2024/11/25 📅] ～ 終了日：[2024/11/25 📅] ※デフォルト：本日
```

#### Step 3: 議事録作成
「議事録作成」ボタンをクリックで自動生成開始

※ Phase 2では議事録タイプ選択が追加される予定

### 6.2 処理フロー
1. **設定値の検証**
   - 必須項目の入力チェック
   - 日時の妥当性確認

2. **データ収集**
   - 指定期間のコンテンツを取得
   - YouTube：指定期間内の最新動画から選択
   - 楽待：指定期間内の記事を取得
   - Gmail：指定期間内のメールを取得

3. **コンテンツ解析**
   - YouTube動画の字幕取得・内容解析
   - 楽待記事の要点抽出
   - 物件情報の整理

4. **議事録生成（Gemini API）**
   - 設定された参加者での意見生成
   - 指定日時での議事録フォーマット作成

5. **Google Drive保存**
   - 指定フォルダに自動保存
   - ファイル名：`YYYYMMDD_議事録タイプ名`

6. **完了通知**
   - 生成完了のポップアップ表示
   - GoogleドキュメントのURLを表示
   - 「開く」ボタンでブラウザで確認可能

### 6.2 エラーハンドリング
- API接続エラー時の再試行機能
- データ取得失敗時の代替処理
- 生成失敗時のログ記録

## 7. セキュリティ要件

- APIキーの安全な管理（環境変数使用）
- Googleアカウントの認証トークン管理
- 個人情報を含むメールデータの適切な処理

**sandbox: false について**:
electron-store使用のため`sandbox: false`を設定していますが、
以下の対策によりセキュリティは維持されます:
- `contextIsolation: true`: レンダラープロセスを分離
- `nodeIntegration: false`: Node.js APIへの直接アクセスを防止
- preloadスクリプトでのAPI制限: 必要最小限のAPIのみ公開

## 8. 今後の拡張可能性

- 会議録の検索機能
- 月次・年次レポート生成
- freee APIとの直接連携
- 音声入力による議事録補完
- 複数の税理士チャンネル対応

## 9. 運用上の注意点

### 9.1 税務上の留意点
- 実質的な業務会議であることが分かる内容
- 開催日時、場所、参加者を明記
- 議題と結論を明確に記載
- 7年間の保存義務（法人税法上の帳簿書類）

### 9.2 システム運用
- 定期的なAPIキーの更新
- YouTubeチャンネル変更時の設定更新
- Gmailラベルの適切な管理
- Google Driveの容量管理

## 14. 開発スケジュール（改訂版）

### Phase 1：物件検討議事録（MVP）- 3週間
1. **Week 1**：基本機能実装
   - Electronアプリの基本構造
   - 設定画面の実装（Gmail関連のみ）
   - 設定の永続化機能

2. **Week 2**：Gmail連携とAI生成
   - Google OAuth2.0認証
   - Gmail API実装（物件情報取得）
   - Gemini APIで議事録生成

3. **Week 3**：ドキュメント生成とテスト
   - Google Docs API実装
   - 統合テスト
   - UIの調整

### Phase 2：YouTube/楽待対応（エンハンス）- 2週間
1. **Week 4**：YouTube機能
   - YouTube API統合
   - 字幕取得機能
   - 税務会議議事録の実装

2. **Week 5**：楽待機能
   - 楽待スクレイピング
   - 不動産情報議事録の実装
   - 議事録タイプ選択UI追加

### Phase 3：最適化と改善 - 1週間
- プロンプトの最適化
- エラーハンドリングの強化
- パフォーマンス改善

## 15. 開発環境セットアップガイド

### 15.1 プロジェクト構造

```
estate-minutes-generator/
├── docs/
│   └── claude.md          # 本仕様書
├── src/
│   ├── main/              # Electronメインプロセス
│   │   └── index.ts       # エントリーポイント
│   ├── renderer/          # レンダラープロセス（UI）
│   │   ├── index.html     # メイン画面
│   │   ├── settings.html  # 設定画面
│   │   ├── css/          # スタイルシート
│   │   └── ts/           # フロントエンドTypeScript
│   ├── services/          # API連携サービス
│   │   ├── google/       # Google APIs
│   │   ├── claude/       # Claude API
│   │   ├── youtube/      # YouTube処理
│   │   └── scraper/      # 楽待スクレイピング
│   ├── types/            # 型定義
│   │   └── index.d.ts    # 共通型定義（詳細は15.8参照）
│   └── utils/            # ユーティリティ
│       ├── config.ts     # 設定管理
│       └── logger.ts     # ログ出力
├── .env                  # 環境変数（.gitignore対象）
├── .env.example          # 環境変数テンプレート
├── .gitignore
├── package.json          # 依存関係
├── tsconfig.json         # TypeScript設定
├── config.json          # ユーザー設定（.gitignore対象）
└── README.md            # プロジェクト説明
```

### 15.2 必要な環境変数（.env.example）

```env
# Google API
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Gemini API (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube API (Google Cloud Consoleで取得)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 15.3 .gitignore設定

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env

# Build outputs
dist/
build/
out/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# User config
config.json
```

### 15.4 package.json（Phase 1初期構成）

```json
{
  "name": "estate-minutes-generator",
  "type": "module",
  "main": "dist/main/index.js",
  "version": "1.0.0",
  "description": "不動産賃貸業法人向け議事録自動生成ツール",
  "scripts": {
    "start": "npm run build && electron .",
    "dev": "npm run build && electron . --dev",
    "build": "tsc",
    "watch": "tsc --watch",
    "clean": "rm -rf dist",
    "build-win": "npm run build && electron-builder --win",
    "build-mac": "npm run build && electron-builder --mac",
    "package": "npm run build && electron-builder --win --mac"
  },
  "keywords": ["electron", "minutes", "real-estate", "typescript"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^25.0.0",
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",  // 注: 最新は0.31.0だが、0.21.0で動作確認済み
    "@google-cloud/local-auth": "^3.0.0",
    "googleapis": "^144.0.0",
    "flatpickr": "^4.6.13",
    "electron-store": "^10.0.0",
    "dotenv": "^16.4.0"
  },
  "build": {
    "appId": "com.example.estate-minutes",
    "productName": "議事録自動生成ツール",
    "files": [
      "dist/**/*",
      "src/renderer/**/*",
      "package.json"
    ],
    "directories": {
      "output": "build"
    },
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    }
  }
}
```

注: `@types/electron`は不要（Electron本体に型定義が含まれています）

※ Phase 2で追加予定の依存関係：
- puppeteer（楽待スクレイピング用）
- youtube-transcript（字幕取得用）
- ytdl-core（動画情報取得用）

### 15.5 tsconfig.json（TypeScript設定）

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

**重要**: Phase 1ではESM (ECMAScript Modules) を採用しています。
- `module: "ESNext"`: 最新のESM構文を出力
- `moduleResolution: "bundler"`: Vite、esbuildなどのモダンバンドラー向けの解決戦略
- 詳細はphase1.mdの「ESM対応の実装詳細」セクションを参照

### 15.6 Claude Codeを使用した開発手順

#### 初期セットアップ
```bash
# 1. プロジェクトフォルダ作成
mkdir estate-minutes-generator
cd estate-minutes-generator

# 2. VSCodeで開く
code .

# 3. 上記のフォルダ構造を作成

# 4. Claude Codeを起動
claude
```

#### Claude Codeへの指示例

**Phase 1 - 初期実装の指示（物件検討議事録のみ）:**
```
/docs/claude.mdの仕様書を読み込んで、Phase 1の物件検討議事録機能のみを実装してください：

1. Electronの基本構造（src/main/index.js）
2. メイン画面のHTML/CSS（物件検討議事録専用）
3. 設定画面（Gmail設定のみ）
4. Gmail APIでの物件情報取得
5. Gemini APIでの議事録生成
6. Google Docs APIでのドキュメント作成

YouTube機能と楽待機能は実装しないでください（Phase 2で実装予定）。
```

**段階的な機能追加の指示:**

```
Phase 1-1: 基本構造
「設定画面を実装してください。仕様書13.1のPhase 1版を参照」

Phase 1-2: Google認証
「Google OAuth2.0認証フローを実装してください。Gmail APIへのアクセス権限のみ」

Phase 1-3: Gmail連携
「Gmail APIで物件情報を取得する機能を実装してください」

Phase 1-4: AI生成
「Gemini APIで物件検討議事録を生成する機能を実装してください」

Phase 2（将来）: 拡張機能
「YouTube APIとの連携機能を追加してください」
「楽待スクレイピング機能を追加してください」
```

### 15.6 API認証情報の取得

#### Google Cloud Console
1. https://console.cloud.google.com/ にアクセス
2. 新規プロジェクト作成
3. 以下のAPIを有効化：
   - YouTube Data API v3
   - Google Drive API
   - Google Docs API
   - Gmail API
4. OAuth 2.0 クライアントIDを作成
5. リダイレクトURIに `http://localhost` を追加

#### Gemini API (Google AI Studio)
1. https://aistudio.google.com/apikey にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択してAPIキーを生成
4. Gemini 2.5 Proモデルへのアクセスを確認

### 15.7 初期セットアップと環境変数

#### 初回セットアップ手順
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

#### メインプロセスでの環境変数読み込み
```typescript
// src/main/index.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 環境変数の読み込み（最初に実行）
dotenv.config();

// 開発モードの判定
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
```

### 15.8 型定義ファイル（src/types/index.d.ts）

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

### 15.9 開発時の注意事項

1. **エラーハンドリング**
   - API制限エラーの適切な処理（リトライ機構の実装）
   - ネットワークエラーの再試行機能
   - ユーザーへの分かりやすいエラー表示

2. **セキュリティ**
   - APIキーをソースコードに直接記載しない
   - 設定ファイルの適切な権限管理
   - Google認証トークンの安全な保存

3. **パフォーマンス**
   - 大量データ取得時の分割処理
   - 非同期処理の適切な実装
   - プログレス表示による体感速度の向上

4. **テスト**
   - 各種エラーケースのテスト
   - 異なる参加者パターンでのテスト
   - 日付範囲の境界値テスト

### 11.1 動画内容の取得方法
1. **字幕データの取得**
   - YouTube Transcript APIを使用
   - 日本語字幕を優先取得
   - 自動生成字幕も利用可能

2. **代替手段**（字幕が利用できない場合）
   - 動画タイトルと説明文から推測
   - 一般的な税務トピックとして処理
   - ユーザーに通知して続行

### 11.2 動画解析のフロー
```
1. YouTube動画URL取得
   ↓
2. 字幕データ取得
   ↓
3. Gemini APIで内容解析
   - 主要なポイントの抽出
   - 税務上の重要事項の特定
   - 不動産賃貸業への適用可能性の分析
   ↓
4. 参加者別の感想生成
   - 役職・立場に応じた視点
   - 具体的な内容への言及
   - 実務への応用提案
```

### 11.3 感想生成の具体例

**税理士のYouTube動画「インボイス制度の落とし穴」を視聴した場合**

```
＜動画の要点＞
- インボイス制度における免税事業者との取引注意点
- 経過措置の適用期限と控除率の変更
- 不動産賃貸業における駐車場収入の取り扱い

代表取締役社長：「動画で解説されていた駐車場収入のインボイス対応について、
当社の月極駐車場も該当する可能性があります。特に居住用賃貸に付随する
駐車場の非課税判定は慎重に行う必要がありそうです。」

取締役（妻）：「インボイスという制度がこんなに複雑だとは思いませんでした。
免税事業者という言葉が何度も出てきましたが、うちが依頼している業者さんが
それに当たるのかよく分からないので、確認が必要かもしれません。」

取締役会長：「控除率が段階的に変わるという話は初めて聞きました。
パーセンテージの計算が複雑で完全には理解できませんでしたが、
税金が増える可能性があるということは分かりました。」

取締役（母）：「駐車場の話が出ていましたが、アパートの駐車場と
月極駐車場で扱いが違うんですね。正直、まだよく理解できていない
部分もありますが、専門家に相談した方が良さそうです。」
```

### 11.4 参加者別の感想生成パターン

**代表取締役社長**
- 専門用語を適切に使用
- 具体的な実務への適用を検討
- リスクや機会を的確に把握

**その他の役員（非常勤含む）**
- 平易な言葉で感想を述べる
- 「よく分からなかった」「難しかった」という率直な感想も含める
- 理解できた部分だけを素朴に言及
- 専門用語は避けるか、理解が曖昧な形で使用
- 「～かもしれない」「～のようだ」など不確実な表現を使用

### 11.5 技術的実装の補足
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

// 型定義
interface VideoAnalysis {
  analysis: string;
  opinions: ParticipantOpinion[];
}

interface ParticipantOpinion {
  name: string;
  role: string;
  opinion: string;
}

interface ParticipantProfile {
  knowledgeLevel: 'high' | 'beginner';
  style: 'professional' | 'casual' | 'senior_casual' | 'very_casual';
}

// 動画解析の実装例
async function analyzeYouTubeVideo(videoUrl: string): Promise<VideoAnalysis> {
  // 1. 字幕取得
  const transcript = await getTranscript(videoUrl);

  // 2. Gemini APIで解析
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
    以下の税理士の解説動画の内容を分析し、
    不動産賃貸業の観点から重要なポイントを抽出してください。

    動画の文字起こし：
    ${transcript}

    抽出項目：
    1. 主要な税務上のポイント
    2. 不動産賃貸業への具体的な影響
    3. 実務上の注意点
  `;

  const result = await model.generateContent(prompt);
  const analysis = result.response.text();

  // 3. 参加者別の感想生成
  const opinions = await generateOpinions(analysis, participants);

  return { analysis, opinions };
}

// 参加者の理解レベル設定
const participantProfiles: Record<string, ParticipantProfile> = {
  "代表取締役社長": {
    knowledgeLevel: "high",
    style: "professional"
  },
  "取締役（妻）": {
    knowledgeLevel: "beginner",
    style: "casual"
  },
  "取締役会長": {
    knowledgeLevel: "beginner",
    style: "senior_casual"
  },
  "取締役（母）": {
    knowledgeLevel: "beginner",
    style: "very_casual"
  }
};
```