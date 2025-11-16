// Google Docs API モジュール
// ドキュメントの作成、フォーマット適用を実装

import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth.js';
import type { DocsCreateRequest, DocsCreateResponse } from '../../types/index.js';

const docs = google.docs('v1');

/**
 * 新しいGoogle Docsドキュメントを作成
 */
export async function createDocument(title: string): Promise<{ documentId: string; documentUrl: string }> {
  try {
    const auth = await getAuthenticatedClient();

    const response = await docs.documents.create({
      auth,
      requestBody: {
        title
      }
    });

    const documentId = response.data.documentId!;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    console.log(`ドキュメントを作成しました: ${title} (ID: ${documentId})`);

    return { documentId, documentUrl };
  } catch (error) {
    console.error('ドキュメント作成エラー:', error);
    throw new Error('Google Docsのドキュメント作成に失敗しました。');
  }
}

/**
 * ドキュメントにテキストを挿入
 */
export async function insertText(documentId: string, text: string, index: number = 1): Promise<void> {
  try {
    const auth = await getAuthenticatedClient();

    await docs.documents.batchUpdate({
      auth,
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index },
              text
            }
          }
        ]
      }
    });

    console.log(`テキストを挿入しました (${text.length}文字)`);
  } catch (error) {
    console.error('テキスト挿入エラー:', error);
    throw new Error('Google Docsへのテキスト挿入に失敗しました。');
  }
}

/**
 * 議事録ドキュメントを作成してテキストを挿入
 */
export async function createMinutesDocument(request: DocsCreateRequest): Promise<DocsCreateResponse> {
  try {
    console.log('議事録ドキュメント作成開始:', request.title);

    // 1. ドキュメントを作成
    const { documentId, documentUrl } = await createDocument(request.title);

    // 2. 議事録テキストを挿入
    await insertText(documentId, request.minutesText);

    console.log('議事録ドキュメント作成完了');

    return {
      documentId,
      documentUrl,
      fileName: request.title
    };
  } catch (error) {
    console.error('議事録ドキュメント作成エラー:', error);
    throw new Error('議事録ドキュメントの作成に失敗しました。');
  }
}

/**
 * ドキュメントの内容を取得
 */
export async function getDocumentContent(documentId: string): Promise<string> {
  try {
    const auth = await getAuthenticatedClient();

    const response = await docs.documents.get({
      auth,
      documentId
    });

    // ドキュメントの本文を取得
    const content = response.data.body?.content || [];
    let text = '';

    for (const element of content) {
      if (element.paragraph) {
        const paragraphElements = element.paragraph.elements || [];
        for (const elem of paragraphElements) {
          if (elem.textRun?.content) {
            text += elem.textRun.content;
          }
        }
      }
    }

    return text;
  } catch (error) {
    console.error('ドキュメント取得エラー:', error);
    throw new Error('Google Docsドキュメントの取得に失敗しました。');
  }
}

/**
 * テキストにフォーマットを適用（見出しスタイルなど）
 * 注: 将来的に議事録のフォーマットをより詳細に制御する場合に使用
 */
export async function formatDocument(
  documentId: string,
  formatRequests: any[]
): Promise<void> {
  try {
    const auth = await getAuthenticatedClient();

    await docs.documents.batchUpdate({
      auth,
      documentId,
      requestBody: {
        requests: formatRequests
      }
    });

    console.log('ドキュメントのフォーマットを適用しました');
  } catch (error) {
    console.error('フォーマット適用エラー:', error);
    throw new Error('Google Docsのフォーマット適用に失敗しました。');
  }
}

/**
 * 議事録用のフォーマットリクエストを生成
 * 注: 将来的に使用。現在はシンプルなテキスト挿入のみ
 */
export function buildMinutesFormatRequests(minutesText: string): any[] {
  // TODO: Week 3で詳細なフォーマット指定を実装
  // 例: タイトルを太字、見出しを大きく、など
  return [];
}
