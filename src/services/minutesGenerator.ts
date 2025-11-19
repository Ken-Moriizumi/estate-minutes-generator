// 議事録生成オーケストレータ
// Gmail、Gemini、Docs、Drive APIを統合して議事録生成の全プロセスを管理

import { searchEmails } from './google/gmail.js';
import { generateMinutesFromEmails } from './google/gemini.js';
import { createMinutesDocument } from './google/docs.js';
import { moveAndRenameDocument, getOrCreateFolder } from './google/drive.js';
import { ConfigManager } from '../utils/config.js';
import type {
  GenerateMinutesRequest,
  GenerateMinutesResult,
  GmailSearchQuery,
  GeminiGenerateMinutesRequest,
  Participant,
  DocsCreateRequest
} from '../types/index.js';

/**
 * 議事録生成の全プロセスを実行
 *
 * ワークフロー:
 * 1. Gmail から指定期間のメールを取得
 * 2. Gemini API で議事録テキストを生成
 * 3. Google Docs でドキュメントを作成
 * 4. 指定フォルダに移動（フォルダがなければ作成）
 * 5. 結果を返す
 */
export async function generateMinutes(request: GenerateMinutesRequest): Promise<GenerateMinutesResult> {
  try {
    console.log('議事録生成プロセス開始:', request);

    // 設定を読み込み
    const config = ConfigManager.getAll();

    // ステップ1: Gmail からメールを取得
    console.log('ステップ1: Gmailからメールを取得');
    const gmailQuery: GmailSearchQuery = {
      startDate: request.gmailStartDate,
      endDate: request.gmailEndDate,
      label: config.google.gmailLabel,
      maxResults: 50
    };

    const emails = await searchEmails(gmailQuery);
    console.log(`${emails.length} 件のメールを取得しました`);

    if (emails.length === 0) {
      throw new Error('指定された期間・ラベルでメールが見つかりませんでした。');
    }

    // ステップ2: 参加者情報を準備
    console.log('ステップ2: 参加者情報を準備');
    const participants: Participant[] = request.participants.map(participantKey => {
      // participantKeyは 'president', 'wife', 'chairman' などのキー
      // 設定から実際の名前を取得
      const actualName = config.participants[participantKey as keyof typeof config.participants];

      // キーに応じてロールとプロフィールを設定
      if (participantKey === 'president') {
        return {
          name: actualName,
          role: '代表取締役社長',
          profile: { knowledgeLevel: 'high', style: 'professional' }
        };
      } else if (participantKey === 'wife') {
        return {
          name: actualName,
          role: '取締役',
          profile: { knowledgeLevel: 'beginner', style: 'casual' }
        };
      } else if (participantKey === 'chairman') {
        return {
          name: actualName,
          role: '取締役会長',
          profile: { knowledgeLevel: 'high', style: 'senior_casual' }
        };
      } else if (participantKey === 'mother') {
        return {
          name: actualName,
          role: '監査役',
          profile: { knowledgeLevel: 'beginner', style: 'very_casual' }
        };
      } else if (participantKey === 'sister') {
        return {
          name: actualName,
          role: '取締役',
          profile: { knowledgeLevel: 'beginner', style: 'casual' }
        };
      } else {
        return {
          name: actualName || participantKey,
          role: '参加者',
          profile: { knowledgeLevel: 'beginner', style: 'casual' }
        };
      }
    });

    // ステップ3: Gemini API で議事録テキストを生成
    console.log('ステップ3: Gemini APIで議事録テキストを生成');
    const geminiRequest: GeminiGenerateMinutesRequest = {
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.location,
      participants,
      propertyList: [], // メールから直接抽出するため空配列
      companyName: config.company.name
    };

    const minutesText = await generateMinutesFromEmails(emails, geminiRequest);
    console.log(`議事録テキストを生成しました (${minutesText.length}文字)`);

    // ステップ4: Google Docs でドキュメントを作成
    console.log('ステップ4: Google Docsでドキュメントを作成');
    const documentTitle = `物件検討会議_議事録_${request.date.toLocaleDateString('ja-JP').replace(/\//g, '-')}`;

    const docsRequest: DocsCreateRequest = {
      title: documentTitle,
      minutesText
    };

    const docResult = await createMinutesDocument(docsRequest);
    console.log(`ドキュメントを作成しました: ${docResult.documentId}`);

    // ステップ5: 指定フォルダに移動（フォルダIDが設定されている場合）
    let finalFileName = documentTitle;
    if (config.google.driveFolderId) {
      console.log('ステップ5: ドキュメントを指定フォルダに移動');
      await moveAndRenameDocument(
        docResult.documentId,
        config.google.driveFolderId,
        documentTitle
      );
      console.log('ドキュメントを移動しました');
    } else {
      console.log('ステップ5: スキップ（フォルダ未設定のため、マイドライブに保存）');
    }

    // 結果を返す
    const result: GenerateMinutesResult = {
      documentId: docResult.documentId,
      documentUrl: docResult.documentUrl,
      fileName: finalFileName,
      createdAt: new Date()
    };

    console.log('議事録生成プロセス完了:', result);
    return result;

  } catch (error) {
    console.error('議事録生成エラー:', error);
    throw error;
  }
}

/**
 * 議事録生成プロセスをバリデーション付きで実行
 */
export async function generateMinutesWithValidation(
  request: GenerateMinutesRequest
): Promise<GenerateMinutesResult> {
  // バリデーション
  validateGenerateMinutesRequest(request);

  // 実行
  return await generateMinutes(request);
}

/**
 * リクエストのバリデーション
 */
function validateGenerateMinutesRequest(request: GenerateMinutesRequest): void {
  if (!request.date) {
    throw new Error('会議日時が指定されていません。');
  }

  if (!request.startTime || !request.endTime) {
    throw new Error('開始時刻・終了時刻が指定されていません。');
  }

  if (!request.location) {
    throw new Error('開催場所が指定されていません。');
  }

  if (!request.participants || request.participants.length === 0) {
    throw new Error('参加者が指定されていません。');
  }

  if (!request.gmailStartDate || !request.gmailEndDate) {
    throw new Error('メール取得期間が指定されていません。');
  }

  if (request.gmailStartDate > request.gmailEndDate) {
    throw new Error('メール取得期間の開始日が終了日より後になっています。');
  }

  // 設定のバリデーション
  const config = ConfigManager.getAll();
  if (!config.google.gmailLabel) {
    throw new Error('Gmailラベルが設定されていません。設定画面で設定してください。');
  }

  if (!config.company.name) {
    throw new Error('会社名が設定されていません。設定画面で設定してください。');
  }
}

/**
 * 年月フォルダ構造を作成してドキュメントを整理
 * 例: マイドライブ/議事録/2025/01/ドキュメント.docx
 *
 * Note: Week 3以降で実装予定
 */
export async function organizeIntoYearMonthFolders(
  documentId: string,
  date: Date,
  baseFolderId?: string
): Promise<void> {
  // TODO: Week 3で実装
  // 1. 年フォルダを取得または作成
  // 2. 月フォルダを取得または作成
  // 3. ドキュメントを移動
  console.log('年月フォルダ整理機能は今後実装予定です');
}
