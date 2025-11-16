// Google OAuth 2.0 認証モジュール
// ESM対応

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { ConfigManager } from '../../utils/config.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { OAuth2Credentials } from '../../types/index.js';

// ESMでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OAuth2スコープの定義
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',  // アプリが作成したファイルの管理
  'https://www.googleapis.com/auth/drive'        // 全Driveへのアクセス（フォルダブラウザ用）
];

// credentials.jsonのパス（プロジェクトルート）
const CREDENTIALS_PATH = path.join(__dirname, '../../../credentials.json');

/**
 * credentials.jsonを読み込む
 */
function loadCredentials(): any {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `credentials.json が見つかりません。\n` +
      `Google Cloud Console で OAuth 2.0 クライアント ID を作成し、\n` +
      `${CREDENTIALS_PATH} に配置してください。`
    );
  }

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * OAuth2クライアントを作成
 */
export function createOAuth2Client(): OAuth2Client {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
}

/**
 * 認証URLを生成
 */
export async function generateAuthUrl(): Promise<string> {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // リフレッシュトークンを確実に取得するため
  });

  return authUrl;
}

/**
 * 認証コードからトークンを取得
 */
export async function getTokenFromCode(code: string): Promise<OAuth2Credentials> {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('アクセストークンの取得に失敗しました');
  }

  const credentials: OAuth2Credentials = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || undefined,
    scope: tokens.scope || SCOPES.join(' '),
    token_type: tokens.token_type || 'Bearer',
    expiry_date: tokens.expiry_date || Date.now() + 3600000 // デフォルト1時間
  };

  return credentials;
}

/**
 * 保存されたトークンを使用して認証済みクライアントを取得
 */
export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const oauth2Client = createOAuth2Client();

  // 保存されたリフレッシュトークンを取得
  const refreshToken = ConfigManager.getGoogleRefreshToken();

  if (!refreshToken) {
    throw new Error('認証情報が見つかりません。Google アカウント連携を実行してください。');
  }

  // リフレッシュトークンを設定
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  // トークンのリフレッシュを試行
  try {
    await oauth2Client.getAccessToken();
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);
    throw new Error('認証情報の更新に失敗しました。再度認証してください。');
  }

  return oauth2Client;
}

/**
 * トークンをリフレッシュ
 */
export async function refreshAccessToken(client: OAuth2Client): Promise<void> {
  try {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);

    // 新しいリフレッシュトークンがあれば保存
    if (credentials.refresh_token) {
      ConfigManager.setGoogleRefreshToken(credentials.refresh_token);
    }
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);
    throw new Error('アクセストークンの更新に失敗しました');
  }
}

/**
 * 認証状態を確認
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const refreshToken = ConfigManager.getGoogleRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // 認証クライアントの取得を試行
    await getAuthenticatedClient();
    return true;
  } catch (error) {
    console.error('認証状態確認エラー:', error);
    return false;
  }
}

/**
 * 認証情報をクリア
 */
export function clearAuthentication(): void {
  ConfigManager.clearGoogleRefreshToken();
}
