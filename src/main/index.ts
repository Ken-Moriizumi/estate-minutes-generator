import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { ConfigManager } from '../utils/config.js';
import {
  generateAuthUrl,
  getTokenFromCode,
  checkAuthStatus,
  clearAuthentication
} from '../services/google/auth.js';
import { searchEmails, getLabelsList } from '../services/google/gmail.js';
import type { GmailSearchQuery } from '../types/index.js';

// ESMでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の読み込み（最初に実行）
dotenv.config();

// 開発モードの判定
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

// ウィンドウのグローバル参照を保持
let mainWindow: any = null;
let settingsWindow: any = null;

// メインウィンドウの作成
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.mjs')
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    title: '不動産賃貸業 議事録自動生成ツール'
  });

  // メイン画面のHTML読み込み
  mainWindow.loadFile(path.join(__dirname, '../../src/renderer/index.html'));

  // 開発モードの場合はDevToolsを開く
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 設定ウィンドウの作成
function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    parent: mainWindow || undefined,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.mjs')
    },
    title: '設定'
  });

  // 設定画面のHTML読み込み
  settingsWindow.loadFile(path.join(__dirname, '../../src/renderer/settings.html'));

  // 開発モードの場合はDevToolsを開く
  if (isDev) {
    settingsWindow.webContents.openDevTools();
  }

  // ウィンドウが閉じられたときの処理
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// メニューバーの設定
function createMenu(): void {
  const template: any[] = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '設定',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            createSettingsWindow();
          }
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'やり直し', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: 'リロード', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '強制リロード', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: '拡大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'リセット', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        {
          label: '開発者ツール',
          accelerator: 'F12',
          click: (item: any, focusedWindow: any) => {
            if (focusedWindow && 'webContents' in focusedWindow) {
              (focusedWindow as any).webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'バージョン情報',
          click: () => {
            // バージョン情報ダイアログを表示（後で実装）
            console.log('議事録自動生成ツール v1.0.0');
          }
        }
      ]
    }
  ];

  // macOSの場合、アプリケーションメニューを追加
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: `${app.getName()}について`, role: 'about' },
        { type: 'separator' },
        { label: '設定...', accelerator: 'Cmd+,', click: () => createSettingsWindow() },
        { type: 'separator' },
        { label: 'サービス', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: `${app.getName()}を隠す`, accelerator: 'Cmd+H', role: 'hide' },
        { label: 'ほかを隠す', accelerator: 'Cmd+Shift+H', role: 'hideOthers' },
        { label: 'すべて表示', role: 'unhide' },
        { type: 'separator' },
        { label: '終了', accelerator: 'Cmd+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC通信のハンドラー設定
function setupIpcHandlers(): void {
  // 設定ウィンドウを開く
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });

  // 設定の読み込み
  ipcMain.handle('load-settings', async () => {
    try {
      const settings = ConfigManager.getAll();
      console.log('設定を読み込みました:', settings);
      return settings;
    } catch (error) {
      console.error('設定の読み込みエラー:', error);
      // エラー時はデフォルト値を返す
      return ConfigManager.getDefaults();
    }
  });

  // 設定の保存
  ipcMain.handle('save-settings', async (_event: any, settings: any) => {
    try {
      // 既存のrefreshTokenを保持
      const currentGoogle = ConfigManager.get('google');
      const refreshToken = currentGoogle.refreshToken;

      // 設定を保存
      ConfigManager.setAll(settings);

      // refreshTokenを復元（存在する場合）
      if (refreshToken) {
        ConfigManager.setGoogleRefreshToken(refreshToken);
        console.log('Google認証情報を保持しました');
      }

      console.log('設定を保存しました:', settings);
      return { success: true };
    } catch (error) {
      console.error('設定の保存エラー:', error);
      return { success: false, error: String(error) };
    }
  });

  // Google認証URLを生成してブラウザで開く
  ipcMain.handle('authenticate-google', async () => {
    try {
      console.log('Google認証を開始');
      const authUrl = await generateAuthUrl();

      // デフォルトブラウザで認証URLを開く
      await shell.openExternal(authUrl);

      console.log('認証URL:', authUrl);
      return { success: true, authUrl };
    } catch (error) {
      console.error('認証エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });

  // 認証コードを処理してトークンを保存
  ipcMain.handle('process-auth-code', async (_event: any, code: string) => {
    try {
      console.log('認証コードを処理中...');
      const credentials = await getTokenFromCode(code);

      // リフレッシュトークンを保存
      if (credentials.refresh_token) {
        ConfigManager.setGoogleRefreshToken(credentials.refresh_token);
        console.log('認証成功: リフレッシュトークンを保存しました');
        return { success: true };
      } else {
        console.warn('リフレッシュトークンが取得できませんでした');
        return { success: false, error: 'リフレッシュトークンが取得できませんでした' };
      }
    } catch (error) {
      console.error('トークン取得エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });

  // 認証状態を確認
  ipcMain.handle('check-auth-status', async () => {
    try {
      const authenticated = await checkAuthStatus();
      console.log('認証状態:', authenticated ? '認証済み' : '未認証');
      return { authenticated };
    } catch (error) {
      console.error('認証状態確認エラー:', error);
      return { authenticated: false };
    }
  });

  // 認証情報をクリア
  ipcMain.handle('clear-authentication', async () => {
    try {
      clearAuthentication();
      console.log('認証情報をクリアしました');
      return { success: true };
    } catch (error) {
      console.error('認証クリアエラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });

  // Gmail ラベル一覧取得
  ipcMain.handle('fetch-gmail-labels', async () => {
    try {
      console.log('Gmail ラベル一覧取得開始');
      const labels = await getLabelsList();
      console.log(`${labels.length} 件のラベルを取得しました`);
      return { success: true, data: labels };
    } catch (error) {
      console.error('Gmail ラベル取得エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });

  // Gmail データ取得
  ipcMain.handle('fetch-gmail-data', async (_event: any, query: GmailSearchQuery) => {
    try {
      console.log('Gmail データ取得開始:', query);
      const emails = await searchEmails(query);
      console.log(`${emails.length} 件のメールを取得しました`);
      return { success: true, data: emails };
    } catch (error) {
      console.error('Gmail データ取得エラー:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  });

  // 議事録生成（Week 3で本実装予定）
  ipcMain.handle('generate-minutes', async (_event: any, request: any) => {
    console.log('議事録生成リクエスト:', request);
    // TODO: Week 3で実際の議事録生成処理を実装
    return { success: true, message: '議事録生成機能はWeek 3で実装予定です' };
  });
}

// Electronの初期化が完了したとき
app.whenReady().then(() => {
  createMainWindow();
  createMenu();
  setupIpcHandlers();

  app.on('activate', () => {
    // macOSで全ウィンドウが閉じられてもアプリを終了せず、
    // Dockアイコンがクリックされたら新しいウィンドウを作成
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// すべてのウィンドウが閉じられたときの処理
app.on('window-all-closed', () => {
  // macOS以外では、全ウィンドウが閉じられたらアプリを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// セキュリティのためのHTTPヘッダー設定
app.on('web-contents-created', (event: any, contents: any) => {
  contents.on('will-navigate', (event: any, navigationUrl: any) => {
    const parsedUrl = new URL(navigationUrl);
    // ローカルファイルへのナビゲーションのみ許可
    if (parsedUrl.protocol !== 'file:') {
      event.preventDefault();
    }
  });
});