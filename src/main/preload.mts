import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
    // 設定画面を開く
    openSettings: () => {
        ipcRenderer.invoke('open-settings');
    },

    // 議事録生成
    generateMinutes: (request: any) => {
        return ipcRenderer.invoke('generate-minutes', request);
    },

    // 設定の読み込み
    loadSettings: () => {
        return ipcRenderer.invoke('load-settings');
    },

    // 設定の保存
    saveSettings: (settings: any) => {
        return ipcRenderer.invoke('save-settings', settings);
    },

    // Google認証
    authenticateGoogle: () => {
        return ipcRenderer.invoke('authenticate-google');
    },

    // プログレス通知の受信
    onProgress: (callback: (progress: any) => void) => {
        ipcRenderer.on('generation-progress', (event: any, progress: any) => {
            callback(progress);
        });
    },

    // 完了通知の受信
    onComplete: (callback: (result: any) => void) => {
        ipcRenderer.on('generation-complete', (event: any, result: any) => {
            callback(result);
        });
    },

    // エラー通知の受信
    onError: (callback: (error: any) => void) => {
        ipcRenderer.on('generation-error', (event: any, error: any) => {
            callback(error);
        });
    }
});