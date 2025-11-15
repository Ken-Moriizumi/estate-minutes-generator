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