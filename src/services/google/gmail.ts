// Gmail API モジュール
// メール検索と本文取得を実装
// 物件情報の抽出はGemini APIに委譲

import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';
import { getAuthenticatedClient } from './auth.js';
import type { EmailData, GmailSearchQuery } from '../../types/index.js';

/**
 * ラベル一覧を取得（ユーザー作成ラベルのみ）
 */
export async function getLabelsList(): Promise<Array<{ id: string; name: string }>> {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.labels.list({
      userId: 'me'
    });

    const labels = response.data.labels || [];

    // システムラベルを除外（ユーザー作成ラベルのみ）
    const userLabels = labels
      .filter(label => label.type === 'user' && label.name && label.id)
      .map(label => ({
        id: label.id!,
        name: label.name!
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return userLabels;
  } catch (error) {
    console.error('ラベル一覧取得エラー:', error);
    throw new Error('ラベル一覧の取得に失敗しました');
  }
}

/**
 * ラベルIDを取得
 */
export async function getLabelId(labelName: string): Promise<string | null> {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.labels.list({
      userId: 'me'
    });

    const labels = response.data.labels || [];
    const targetLabel = labels.find(label => label.name === labelName);

    return targetLabel?.id || null;
  } catch (error) {
    console.error('ラベルID取得エラー:', error);
    throw new Error(`ラベル "${labelName}" の取得に失敗しました`);
  }
}

/**
 * 日付をGmail検索用フォーマットに変換 (YYYY/MM/DD)
 */
function formatDateForGmail(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * メールを検索
 */
export async function searchEmails(query: GmailSearchQuery): Promise<EmailData[]> {
  try {
    const auth = await getAuthenticatedClient();
    const gmail = google.gmail({ version: 'v1', auth });

    // 検索クエリを構築
    let searchQuery = `after:${formatDateForGmail(query.startDate)} before:${formatDateForGmail(query.endDate)}`;

    // ラベルが指定されている場合
    if (query.label) {
      // ラベル名をエスケープして引用符で囲む（特殊文字やスペース、スラッシュに対応）
      const escapedLabel = query.label.replace(/"/g, '\\"');
      searchQuery += ` label:"${escapedLabel}"`;
    }

    console.log('Gmail 検索クエリ:', searchQuery);

    // メール一覧を取得
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: query.maxResults || 100
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      console.log('検索条件に一致するメールが見つかりませんでした');
      return [];
    }

    console.log(`${messages.length} 件のメールが見つかりました`);

    // 各メールの詳細を取得
    const emailDataList: EmailData[] = [];

    for (const message of messages) {
      if (!message.id) continue;

      try {
        const emailData = await getEmailDetails(gmail, message.id);
        emailDataList.push(emailData);
      } catch (error) {
        console.error(`メール ${message.id} の取得に失敗:`, error);
        // エラーがあっても続行
      }
    }

    return emailDataList;
  } catch (error) {
    console.error('Gmail 検索エラー:', error);
    throw new Error('メールの検索に失敗しました');
  }
}

/**
 * メールの詳細を取得
 */
async function getEmailDetails(
  gmail: gmail_v1.Gmail,
  messageId: string
): Promise<EmailData> {
  const messageResponse = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  });

  const message = messageResponse.data;
  const headers = message.payload?.headers || [];

  // ヘッダーから情報を抽出
  const subject = headers.find(h => h.name === 'Subject')?.value || '(件名なし)';
  const from = headers.find(h => h.name === 'From')?.value || '(送信者不明)';
  const dateStr = headers.find(h => h.name === 'Date')?.value;
  const date = dateStr ? new Date(dateStr) : new Date();

  // メール本文を取得
  const body = await extractEmailBody(message);

  const emailData: EmailData = {
    id: messageId,
    subject,
    from,
    date,
    body
  };

  return emailData;
}

/**
 * メール本文を抽出（Base64デコード対応）
 */
async function extractEmailBody(message: gmail_v1.Schema$Message): Promise<string> {
  const payload = message.payload;
  if (!payload) return '';

  let body = '';

  // シンプルなメッセージの場合
  if (payload.body?.data) {
    body = decodeBase64(payload.body.data);
  }
  // マルチパートメッセージの場合
  else if (payload.parts) {
    body = extractBodyFromParts(payload.parts);
  }

  // HTMLタグを除去（簡易版）
  body = removeHtmlTags(body);

  return body.trim();
}

/**
 * パーツから本文を抽出（再帰的）
 */
function extractBodyFromParts(parts: gmail_v1.Schema$MessagePart[]): string {
  for (const part of parts) {
    // text/plain を優先
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return decodeBase64(part.body.data);
    }

    // text/html の場合
    if (part.mimeType === 'text/html' && part.body?.data) {
      return decodeBase64(part.body.data);
    }

    // ネストされたパーツを再帰的に探索
    if (part.parts) {
      const nestedBody = extractBodyFromParts(part.parts);
      if (nestedBody) return nestedBody;
    }
  }

  return '';
}

/**
 * Base64デコード（URL-safeに対応）
 */
function decodeBase64(data: string): string {
  try {
    // URL-safe Base64をノーマルBase64に変換
    const normalBase64 = data.replace(/-/g, '+').replace(/_/g, '/');
    // Bufferでデコード
    const decoded = Buffer.from(normalBase64, 'base64').toString('utf-8');
    return decoded;
  } catch (error) {
    console.error('Base64デコードエラー:', error);
    return '';
  }
}

/**
 * HTMLタグを除去（簡易版）
 */
function removeHtmlTags(html: string): string {
  // スクリプトとスタイルを削除
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // すべてのHTMLタグを削除
  text = text.replace(/<[^>]+>/g, '');

  // HTMLエンティティをデコード
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // 連続する改行・空白を整理
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.replace(/  +/g, ' ');

  return text;
}
