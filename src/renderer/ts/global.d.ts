// Flatpickrの型定義
declare const flatpickr: any;

// Electron APIの型定義
interface ElectronAPI {
    openSettings: () => void;
    generateMinutes: (request: any) => Promise<any>;
    loadSettings: () => Promise<any>;
    saveSettings: (settings: any) => Promise<{ success: boolean; error?: string }>;
    authenticateGoogle: () => Promise<{ success: boolean; authUrl?: string; error?: string }>;
    processAuthCode: (code: string) => Promise<{ success: boolean; error?: string }>;
    checkAuthStatus: () => Promise<{ authenticated: boolean }>;
    clearAuthentication: () => Promise<{ success: boolean; error?: string }>;
    fetchGmailLabels: () => Promise<{ success: boolean; data?: Array<{ id: string; name: string }>; error?: string }>;
    fetchGmailData: (query: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    testGeminiApi: (query: any) => Promise<{ success: boolean; data?: string; error?: string }>;
    listDriveFolders: (parentFolderId?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    testDocsDrive: (folderId?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    onProgress: (callback: (progress: any) => void) => void;
    onComplete: (callback: (result: any) => void) => void;
    onError: (callback: (error: any) => void) => void;
}

// WindowインターフェースにElectron APIを追加
interface Window {
    electronAPI?: ElectronAPI;
}