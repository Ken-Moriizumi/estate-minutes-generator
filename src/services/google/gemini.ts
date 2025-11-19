// Gemini API モジュール
// 議事録コンテンツの生成を実装

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { EmailData, MinutesContent, Participant, GeminiGenerateMinutesRequest } from '../../types/index.js';

// ESMでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロンプトファイルのパス（プロジェクトルート/prompts）
const PROMPTS_DIR = path.join(__dirname, '../../../prompts');
const TEMPLATE_PATH = path.join(PROMPTS_DIR, 'minutes-template.md');
const GUIDELINES_PATH = path.join(PROMPTS_DIR, 'minutes-guidelines.md');

/**
 * Gemini APIクライアントを初期化
 */
function initializeGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY が設定されていません。\n' +
      '.env ファイルに GEMINI_API_KEY を設定してください。'
    );
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * プロンプトファイルを読み込む
 */
function loadPromptFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`プロンプトファイルが見つかりません: ${filePath}`);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`プロンプトファイル読み込みエラー: ${filePath}`, error);
    throw new Error(`プロンプトファイルの読み込みに失敗しました: ${filePath}`);
  }
}

/**
 * 参加者情報を整形（名前のみ）
 */
function formatParticipants(participants: Participant[]): string {
  return participants.map(p => p.name).join('、');
}

/**
 * 開催場所を日本語に変換
 */
function formatLocation(location: 'tokyo' | 'nagano' | 'online'): string {
  const locationMap = {
    tokyo: '東京事務所',
    nagano: '長野事務所',
    online: 'オンライン'
  };
  return locationMap[location];
}

/**
 * 日付を日本語形式に変換 (YYYY年MM月DD日)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * メール情報を整形してプロンプトに含める
 */
function formatEmailsForPrompt(emails: EmailData[]): string {
  if (emails.length === 0) {
    return '（メールデータなし）';
  }

  return emails.map((email, index) => {
    return `
### メール ${index + 1}
- 件名: ${email.subject}
- 送信者: ${email.from}
- 日付: ${email.date.toLocaleDateString('ja-JP')}
- 本文:
${email.body}
---
`;
  }).join('\n');
}

/**
 * 議事録生成用プロンプトを構築
 */
function buildMinutesPrompt(
  emails: EmailData[],
  template: string,
  guidelines: string,
  request: GeminiGenerateMinutesRequest
): string {
  const { date, startTime, endTime, location, participants, companyName } = request;

  const formattedDate = formatDate(date);
  const formattedLocation = formatLocation(location);
  const formattedParticipants = formatParticipants(participants);
  const emailsContent = formatEmailsForPrompt(emails);

  const prompt = `
あなたは不動産賃貸業法人の議事録作成アシスタントです。
以下の情報を元に、物件検討会議の議事録を作成してください。

# 議事録テンプレート
${template}

# 議事録作成ガイドライン
${guidelines}

# 会議情報
- 会社名: ${companyName}
- 日時: ${formattedDate} ${startTime}～${endTime}
- 場所: ${formattedLocation}
- 参加者: ${formattedParticipants}

# 参加者詳細
${participants.map(p => `- ${p.name}: 知識レベル=${p.profile?.knowledgeLevel}, スタイル=${p.profile?.style}, 役職=${p.role}`).join('\n')}

# 物件情報メール
${emailsContent}

# 指示
上記の「議事録テンプレート」と「議事録作成ガイドライン」に従って、物件検討会議の議事録を作成してください。

## 重要な注意事項

### ⚠️ 最重要: 会話形式の絶対禁止

**絶対に守ること:**
1. **個人の発言を記載しない** - 「〇〇取締役は」「〇〇からは」などの個人名は一切使わない
2. **カギ括弧を使わない** - 「」で発言を引用しない
3. **会話形式にしない** - 発言の記録ではなく、検討結果のみを記載

**必須フォーマット:**
- 各物件の議事内容は「検討結果:」で始まる1段落で完結させる
- 会議全体の結論を統合して記載
- 客観的・分析的な文体で記載

**良い例:**
検討結果: 価格は500万円と安価だが、立地が武蔵嵐山駅徒歩39分と極めて悪く、賃貸需要が見込めない。高い空室リスクが想定されるため、見送るべきである。

**悪い例（絶対にNG）:**
検討結果: 価格は380万円と安価である。
〇〇取締役からは「駅からとても遠いので、入居者がいるのか心配です。」との意見が出た。
→ このような個人名と会話形式は絶対に使わない

### その他の注意事項
1. メールの内容から物件情報を抽出し、各物件について議題を設定する
2. メールにない情報は推測で追加しない
3. A4用紙1〜2枚程度のボリューム（800〜1,600文字）
4. 議事録は「だ・である調」で記載する
5. **参加者欄には名前のみを記載**（役職は含めない）

議事録の本文のみを出力してください（説明や前置きは不要です）。
`;

  return prompt;
}

/**
 * メールデータから議事録を生成
 */
export async function generateMinutesFromEmails(
  emails: EmailData[],
  request: GeminiGenerateMinutesRequest
): Promise<string> {
  try {
    console.log('議事録生成を開始します...');
    console.log(`メール数: ${emails.length}, 参加者数: ${request.participants.length}`);

    // Geminiクライアント初期化
    const genAI = initializeGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // プロンプトファイル読み込み
    const template = loadPromptFile(TEMPLATE_PATH);
    const guidelines = loadPromptFile(GUIDELINES_PATH);

    // プロンプト構築
    const prompt = buildMinutesPrompt(emails, template, guidelines, request);

    console.log('Gemini API にリクエストを送信中...');

    // Gemini APIで議事録生成
    const result = await model.generateContent(prompt);
    const response = result.response;
    const minutesText = response.text();

    if (!minutesText || minutesText.trim().length === 0) {
      throw new Error('議事録の生成に失敗しました（空のレスポンス）');
    }

    console.log('議事録生成が完了しました');
    console.log(`生成された議事録の文字数: ${minutesText.length}`);

    return minutesText;
  } catch (error) {
    console.error('議事録生成エラー:', error);

    if (error instanceof Error) {
      // エラーメッセージを詳細に
      if (error.message.includes('API key')) {
        throw new Error('Gemini API キーが無効です。.env ファイルを確認してください。');
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API の利用制限に達しました。しばらく待ってから再試行してください。');
      }
      throw error;
    }

    throw new Error('議事録の生成中に予期しないエラーが発生しました');
  }
}

/**
 * 議事録テキストをMinutesContent型に変換
 * （将来的にGoogle Docs APIで使用するための構造化）
 */
export function parseMinutesText(minutesText: string, request: GeminiGenerateMinutesRequest): MinutesContent {
  // 現時点ではシンプルに、テキスト全体を返す
  // Google Docs API実装時に、より詳細なパースを行う

  // 議題を抽出（簡易版）
  const agendaMatches = minutesText.match(/【議題】\n([\s\S]*?)【議事内容】/);
  const agendaText = agendaMatches ? agendaMatches[1] : '';
  const agenda = agendaText
    .split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());

  // 結論を抽出（簡易版）
  const conclusionMatches = minutesText.match(/【結論】\n([\s\S]*?)以上/);
  const conclusion = conclusionMatches ? conclusionMatches[1].trim() : '';

  const minutesContent: MinutesContent = {
    date: request.date,
    startTime: request.startTime,
    endTime: request.endTime,
    location: request.location,
    participants: request.participants,
    agenda: agenda.length > 0 ? agenda : ['物件検討'],
    content: [], // 詳細なパースは将来実装
    conclusion: conclusion || '上記の通り検討を行った。'
  };

  return minutesContent;
}
