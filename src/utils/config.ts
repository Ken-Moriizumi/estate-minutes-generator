// 設定管理モジュール
// Node.js fsモジュールを使用してJSON設定を永続化

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { AppConfig } from '../types';

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

/**
 * 設定ファイルのパスを取得
 */
function getConfigPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
}

/**
 * 設定ファイルを読み込み
 */
function loadConfigFile(): AppConfig {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('設定ファイルの読み込みエラー:', error);
  }
  return DEFAULT_CONFIG;
}

/**
 * 設定ファイルを保存
 */
function saveConfigFile(config: AppConfig): void {
  try {
    const configPath = getConfigPath();
    const dirPath = path.dirname(configPath);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('設定ファイルの保存エラー:', error);
    throw error;
  }
}

/**
 * 設定管理クラス
 */
export class ConfigManager {
  /**
   * 全設定を取得
   */
  static getAll(): AppConfig {
    return loadConfigFile();
  }

  /**
   * 設定値を取得
   */
  static get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    const config = loadConfigFile();
    return config[key];
  }

  /**
   * 設定値を保存
   */
  static set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    const config = loadConfigFile();
    config[key] = value;
    saveConfigFile(config);
  }

  /**
   * 全設定を保存
   */
  static setAll(config: AppConfig): void {
    saveConfigFile(config);
  }

  /**
   * 設定をデフォルト値にリセット
   */
  static reset(): void {
    saveConfigFile(DEFAULT_CONFIG);
  }

  /**
   * 特定のキーが存在するか確認
   */
  static has(key: keyof AppConfig): boolean {
    const config = loadConfigFile();
    return key in config;
  }

  /**
   * 特定のキーを削除
   */
  static delete(key: keyof AppConfig): void {
    const config = loadConfigFile();
    delete config[key];
    saveConfigFile(config);
  }

  /**
   * 設定ファイルのパスを取得
   */
  static getPath(): string {
    return getConfigPath();
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
    const config = loadConfigFile();
    config.google.refreshToken = token;
    saveConfigFile(config);
  }

  /**
   * Google認証トークンを取得
   */
  static getGoogleRefreshToken(): string | undefined {
    const config = loadConfigFile();
    return config.google.refreshToken;
  }

  /**
   * Google認証トークンを削除
   */
  static clearGoogleRefreshToken(): void {
    const config = loadConfigFile();
    if (config.google.refreshToken) {
      delete config.google.refreshToken;
      saveConfigFile(config);
    }
  }
}

export default ConfigManager;
