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
 * 議事録ドキュメントを作成してテキストを挿入（フォーマット付き）
 */
export async function createMinutesDocument(request: DocsCreateRequest): Promise<DocsCreateResponse> {
  try {
    console.log('議事録ドキュメント作成開始:', request.title);

    // 1. ドキュメントを作成
    const { documentId, documentUrl } = await createDocument(request.title);

    // 2. 議事録テキストを挿入とフォーマット適用
    await insertFormattedMinutesText(documentId, request.minutesText);

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
 * 議事録テキストを挿入してフォーマットを適用
 */
async function insertFormattedMinutesText(documentId: string, minutesText: string): Promise<void> {
  try {
    const auth = await getAuthenticatedClient();

    // テキストを行ごとに分割
    const lines = minutesText.split('\n');
    const requests: any[] = [];
    let currentIndex = 1;  // Google Docs のインデックスは1から始まる

    // 各行を処理
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const lineText = line + '\n';
      const lineLength = lineText.length;

      // テキスト挿入リクエスト
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: lineText
        }
      });

      // フォーマット適用パターンの判定
      if (i === 0 && trimmedLine.startsWith('株式会社')) {
        // 1行目: 会社名 → 見出し1 + 太字 + 中央揃え
        requests.push({
          updateParagraphStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            paragraphStyle: {
              namedStyleType: 'HEADING_1',
              alignment: 'CENTER'
            },
            fields: 'namedStyleType,alignment'
          }
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        });
      } else if (i === 1 && trimmedLine === '議事録') {
        // 2行目: 「議事録」→ 見出し2 + 太字 + 中央揃え
        requests.push({
          updateParagraphStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            paragraphStyle: {
              namedStyleType: 'HEADING_2',
              alignment: 'CENTER'
            },
            fields: 'namedStyleType,alignment'
          }
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        });
      } else if (trimmedLine.startsWith('【議題】') || trimmedLine.startsWith('【議事内容】') || trimmedLine.startsWith('【結論】')) {
        // 見出し行 → 見出し3 + 太字
        requests.push({
          updateParagraphStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            paragraphStyle: { namedStyleType: 'HEADING_3' },
            fields: 'namedStyleType'
          }
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        });
      } else if (trimmedLine.startsWith('日時：') || trimmedLine.startsWith('場所：') || trimmedLine.startsWith('参加者：')) {
        // メタ情報 → 太字
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        });
      } else if (trimmedLine.match(/^[0-9０-９]+\./)) {
        // 番号付きリスト（議題など）→ 太字
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex, endIndex: currentIndex + lineLength - 1 },
            textStyle: { bold: true },
            fields: 'bold'
          }
        });
      }

      currentIndex += lineLength;
    }

    // 全てのリクエストを一括送信
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        auth,
        documentId,
        requestBody: { requests }
      });
    }

    console.log(`フォーマット付きテキストを挿入しました (${lines.length}行、${requests.length}リクエスト)`);
  } catch (error) {
    console.error('フォーマット付きテキスト挿入エラー:', error);
    throw new Error('Google Docsへのフォーマット適用に失敗しました。');
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
