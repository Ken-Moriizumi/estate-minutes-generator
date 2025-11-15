// 設定画面のTypeScript

// 設定データの型定義
interface Settings {
    company: {
        name: string;
    };
    defaults: {
        location: 'tokyo' | 'nagano' | 'online';
        startTime: string;
        endTime: string;
        retrievalPeriod: number;
    };
    google: {
        driveFolderPath: string;
        gmailLabel: string;
    };
    participants: {
        president: string;
        wife: string;
        chairman: string;
        mother: string;
        sister: string;
    };
}

// DOMContentLoadedイベントでページの初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
});

function initializeSettings(): void {
    // ナビゲーションの設定
    setupNavigation();

    // 設定の読み込み
    loadSettings();

    // イベントリスナーの設定
    setupEventListeners();
}

// ナビゲーションの設定
function setupNavigation(): void {
    const navItems = document.querySelectorAll('.nav-item:not(.disabled)');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const target = item.getAttribute('data-section');
            if (!target) return;

            // ナビゲーションアイテムのアクティブ状態を更新
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // セクションの表示を切り替え
            sections.forEach(section => {
                if (section.id === target) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// 設定の読み込み
async function loadSettings(): Promise<void> {
    try {
        // Electronから設定を読み込む
        if (window.electronAPI?.loadSettings) {
            const settings = await window.electronAPI.loadSettings();
            applySettings(settings);
        } else {
            // 開発環境用のデフォルト値
            applyDefaultSettings();
        }
    } catch (error) {
        console.error('設定の読み込みエラー:', error);
        applyDefaultSettings();
    }
}

// 設定値をフォームに適用
function applySettings(settings: Settings): void {
    // 基本設定
    setInputValue('companyName', settings.company.name);
    setInputValue('defaultLocation', settings.defaults.location);
    setInputValue('defaultStartTime', settings.defaults.startTime);
    setInputValue('defaultEndTime', settings.defaults.endTime);
    setInputValue('retrievalPeriod', String(settings.defaults.retrievalPeriod));

    // Google連携
    setInputValue('gmailLabel', settings.google.gmailLabel);
    setInputValue('driveFolderPath', settings.google.driveFolderPath);

    // 参加者情報
    setInputValue('presidentName', settings.participants.president);
    setInputValue('wifeName', settings.participants.wife);
    setInputValue('chairmanName', settings.participants.chairman);
    setInputValue('motherName', settings.participants.mother);
    setInputValue('sisterName', settings.participants.sister);
}

// デフォルト設定の適用
function applyDefaultSettings(): void {
    const defaults: Settings = {
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

    applySettings(defaults);
}

// イベントリスナーの設定
function setupEventListeners(): void {
    // Google認証ボタン
    const authBtn = document.getElementById('authBtn');
    authBtn?.addEventListener('click', handleGoogleAuth);

    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    saveBtn?.addEventListener('click', handleSaveSettings);

    // キャンセルボタン
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn?.addEventListener('click', handleCancel);
}

// Google認証処理
async function handleGoogleAuth(): Promise<void> {
    try {
        const authBtn = document.getElementById('authBtn') as HTMLButtonElement;
        authBtn.disabled = true;
        authBtn.textContent = '認証中...';

        if (window.electronAPI?.authenticateGoogle) {
            const result = await window.electronAPI.authenticateGoogle();

            if (result.success) {
                updateAuthStatus(true);
                alert('Googleアカウントとの連携が完了しました。');
            } else {
                alert('認証に失敗しました。\n' + (result.error || ''));
            }
        } else {
            // 開発環境用
            setTimeout(() => {
                alert('Google認証機能は開発中です。');
            }, 1000);
        }
    } catch (error) {
        console.error('認証エラー:', error);
        alert('認証中にエラーが発生しました。');
    } finally {
        const authBtn = document.getElementById('authBtn') as HTMLButtonElement;
        authBtn.disabled = false;
        authBtn.textContent = 'Googleアカウントと連携';
    }
}

// 認証ステータスの更新
function updateAuthStatus(connected: boolean): void {
    const authStatus = document.getElementById('authStatus');
    if (!authStatus) return;

    const statusIcon = authStatus.querySelector('.status-icon');
    const statusLabel = authStatus.querySelector('.status-label');
    const statusDescription = authStatus.querySelector('.status-description');

    if (connected) {
        statusIcon?.classList.remove('disconnected');
        statusIcon?.classList.add('connected');
        if (statusLabel) statusLabel.textContent = '接続済み';
        if (statusDescription) statusDescription.textContent = 'Googleアカウントと連携しています';
    } else {
        statusIcon?.classList.remove('connected');
        statusIcon?.classList.add('disconnected');
        if (statusLabel) statusLabel.textContent = '未接続';
        if (statusDescription) statusDescription.textContent = 'Googleアカウントと連携していません';
    }
}

// 設定の保存
async function handleSaveSettings(): Promise<void> {
    try {
        const settings = collectSettings();

        // バリデーション
        if (!validateSettings(settings)) {
            return;
        }

        // 設定を保存
        if (window.electronAPI?.saveSettings) {
            const result = await window.electronAPI.saveSettings(settings);

            if (result.success) {
                alert('設定を保存しました。');
                window.close();
            } else {
                alert('設定の保存に失敗しました。\n' + (result.error || ''));
            }
        } else {
            // 開発環境用
            console.log('保存する設定:', settings);
            alert('設定保存機能は開発中です。');
        }
    } catch (error) {
        console.error('保存エラー:', error);
        alert('設定の保存中にエラーが発生しました。');
    }
}

// 設定値の収集
function collectSettings(): Settings {
    return {
        company: {
            name: getInputValue('companyName')
        },
        defaults: {
            location: getInputValue('defaultLocation') as 'tokyo' | 'nagano' | 'online',
            startTime: getInputValue('defaultStartTime'),
            endTime: getInputValue('defaultEndTime'),
            retrievalPeriod: parseInt(getInputValue('retrievalPeriod')) || 1
        },
        google: {
            driveFolderPath: getInputValue('driveFolderPath'),
            gmailLabel: getInputValue('gmailLabel')
        },
        participants: {
            president: getInputValue('presidentName'),
            wife: getInputValue('wifeName'),
            chairman: getInputValue('chairmanName'),
            mother: getInputValue('motherName'),
            sister: getInputValue('sisterName')
        }
    };
}

// 設定のバリデーション
function validateSettings(settings: Settings): boolean {
    // 会社名の確認
    if (!settings.company.name) {
        alert('会社名を入力してください。');
        return false;
    }

    // Gmail設定の確認
    if (!settings.google.gmailLabel) {
        alert('Gmailラベルを入力してください。');
        return false;
    }

    if (!settings.google.driveFolderPath) {
        alert('Google Driveのフォルダ名を入力してください。');
        return false;
    }

    // 時刻の妥当性確認
    if (settings.defaults.startTime >= settings.defaults.endTime) {
        alert('終了時刻は開始時刻より後に設定してください。');
        return false;
    }

    return true;
}

// キャンセル処理
function handleCancel(): void {
    if (confirm('変更を破棄して閉じますか？')) {
        window.close();
    }
}

// ユーティリティ関数
function getInputValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    return element?.value || '';
}

function setInputValue(id: string, value: string): void {
    const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (element) {
        element.value = value;
    }
}

// 型定義はglobal.d.tsに移動