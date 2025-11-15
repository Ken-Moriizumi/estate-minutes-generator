// OAuth 2.0 認証情報の型定義
export interface OAuth2Credentials {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

// Gmail 検索クエリの型定義
export interface GmailSearchQuery {
  startDate: Date;
  endDate: Date;
  label?: string;
  maxResults?: number;
}

// 物件情報の型定義（拡張版）
export interface PropertyInfo {
  name: string;            // 物件名
  address: string;         // 住所
  price: string;           // 価格（文字列形式）
  yield: string;           // 利回り
  notes: string;           // 特記事項
  buildingAge?: number;    // 築年数
  location?: string;       // 立地（住所）
  priceNumber?: number;    // 購入金額（数値）
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

// 議事録生成リクエストの型定義（UI用）
export interface GenerateMinutesRequest {
  date: Date;
  startTime: string;
  endTime: string;
  location: 'tokyo' | 'nagano' | 'online';
  participants: string[];
  gmailStartDate: Date;
  gmailEndDate: Date;
}

// Gemini API 議事録生成リクエストの型定義
export interface GeminiGenerateMinutesRequest {
  date: Date;
  startTime: string;
  endTime: string;
  location: 'tokyo' | 'nagano' | 'online';
  participants: Participant[];
  propertyList: PropertyInfo[];
  companyName: string;
}

// 議事録生成結果の型定義
export interface GenerateMinutesResult {
  documentId: string;
  documentUrl: string;
  fileName: string;
  createdAt: Date;
}

// Google Docs ドキュメント作成結果の型定義
export interface CreateDocumentResult {
  documentId: string;
  documentUrl: string;
}

// Google Drive フォルダー情報の型定義
export interface FolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

// 議事録アイテムの型定義（Gemini API レスポンス用）
export interface MinutesItem {
  title: string;
  content: string;
}

// 議事録コンテンツの型定義（Gemini API レスポンス用）
export interface MinutesContentGenerated {
  title: string;
  opening: string;
  attendees: string;
  items: MinutesItem[];
  closing: string;
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