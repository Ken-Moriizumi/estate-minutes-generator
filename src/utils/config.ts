// 設定管理モジュール
// electron-storeを使用してJSON設定を永続化

import Store from 'electron-store';
import type { AppConfig } from '../types/index.js';

// デフォルト設定値
const DEFAULT_CONFIG: AppConfig = {
  company: {
    name: '株式会社〇〇〇〇'
  },
  defaults: {
    location: 'tokyo',
    startTime: '14:00',
    endTime: '15:00',
    retrievalPeriod: 1
  },
  google: {
    driveFolderPath: '定例会',
    gmailLabel: '物件情報'
  },
  participants: {
    president: '山田太郎',
    wife: '山田花子',
    chairman: '山田一郎',
    mother: '山田春子',
    sister: '山田美咲'
  }
};

// electron-storeのインスタンス作成
const store = new Store<AppConfig>({
  defaults: DEFAULT_CONFIG
});

/**
 * 設定管理クラス
 */
export class ConfigManager {
  /**
   * 全設定を取得
   */
  static getAll(): AppConfig {
    return store.store;
  }

  /**
   * 設定値を取得
   */
  static get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return store.get(key);
  }

  /**
   * 設定値を保存
   */
  static set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    store.set(key, value);
  }

  /**
   * 全設定を保存
   */
  static setAll(config: AppConfig): void {
    store.store = config;
  }

  /**
   * 設定をデフォルト値にリセット
   */
  static reset(): void {
    store.clear();
  }

  /**
   * 特定のキーが存在するか確認
   */
  static has(key: keyof AppConfig): boolean {
    return store.has(key);
  }

  /**
   * 特定のキーを削除
   */
  static delete(key: keyof AppConfig): void {
    store.delete(key);
  }

  /**
   * 設定ファイルのパスを取得
   */
  static getPath(): string {
    return store.path;
  }

  /**
   * デフォルト設定値を取得
   */
  static getDefaults(): AppConfig {
    return DEFAULT_CONFIG;
  }

  /**
   * Google認証トークンを保存
   */
  static setGoogleRefreshToken(token: string): void {
    const google = store.get('google');
    store.set('google', { ...google, refreshToken: token });
  }

  /**
   * Google認証トークンを取得
   */
  static getGoogleRefreshToken(): string | undefined {
    return store.get('google').refreshToken;
  }

  /**
   * Google認証トークンを削除
   */
  static clearGoogleRefreshToken(): void {
    const google = store.get('google');
    const { refreshToken, ...rest } = google;
    store.set('google', rest);
  }
}

export default ConfigManager;
