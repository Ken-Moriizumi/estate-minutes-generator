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
        // Gmailラベル一覧を読み込む
        await loadGmailLabels();

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

    // 認証コード送信ボタン
    const submitAuthCodeBtn = document.getElementById('submitAuthCodeBtn');
    submitAuthCodeBtn?.addEventListener('click', handleSubmitAuthCode);

    // 認証解除ボタン
    const clearAuthBtn = document.getElementById('clearAuthBtn');
    clearAuthBtn?.addEventListener('click', handleClearAuth);

    // Gmail接続テストボタン
    const testGmailBtn = document.getElementById('testGmailBtn');
    testGmailBtn?.addEventListener('click', handleTestGmail);

    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    saveBtn?.addEventListener('click', handleSaveSettings);

    // キャンセルボタン
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn?.addEventListener('click', handleCancel);

    // 初期認証状態をチェック
    checkInitialAuthStatus();
}

// Gmailラベル一覧を読み込む
async function loadGmailLabels(): Promise<void> {
    if (!window.electronAPI?.fetchGmailLabels) return;

    try {
        // 認証状態を確認
        const authStatus = await window.electronAPI.checkAuthStatus();
        if (!authStatus.authenticated) {
            console.log('未認証のため、Gmailラベルを読み込めません');
            return;
        }

        const result = await window.electronAPI.fetchGmailLabels();

        if (result.success && result.data) {
            const selectElement = document.getElementById('gmailLabel') as HTMLSelectElement;
            if (!selectElement) return;

            // 既存のオプションをクリア（最初の「選択してください」は残す）
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }

            // ラベルをオプションとして追加
            result.data.forEach(label => {
                const option = document.createElement('option');
                option.value = label.name;
                option.textContent = label.name;
                selectElement.appendChild(option);
            });

            console.log(`${result.data.length} 件のラベルを読み込みました`);
        } else {
            console.error('Gmailラベル取得エラー:', result.error);
        }
    } catch (error) {
        console.error('Gmailラベル読み込みエラー:', error);
    }
}

// 初期認証状態をチェック
async function checkInitialAuthStatus(): Promise<void> {
    if (!window.electronAPI?.checkAuthStatus) return;

    try {
        const result = await window.electronAPI.checkAuthStatus();
        updateAuthStatus(result.authenticated);
    } catch (error) {
        console.error('認証状態確認エラー:', error);
    }
}

// Google認証処理（ブラウザで認証URLを開く）
async function handleGoogleAuth(): Promise<void> {
    try {
        const authBtn = document.getElementById('authBtn') as HTMLButtonElement;
        authBtn.disabled = true;
        authBtn.textContent = '認証中...';

        if (window.electronAPI?.authenticateGoogle) {
            const result = await window.electronAPI.authenticateGoogle();

            if (result.success) {
                // 認証コード入力セクションを表示
                const authCodeSection = document.getElementById('authCodeSection');
                if (authCodeSection) {
                    authCodeSection.style.display = 'block';
                }
                alert('ブラウザで認証を完了してください。\n認証完了後、表示される認証コードをコピーして、下記のフィールドに貼り付けてください。');
            } else {
                alert('認証URLの生成に失敗しました。\n' + (result.error || ''));
            }
        } else {
            alert('Google認証機能が利用できません。');
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

// 認証コードを送信
async function handleSubmitAuthCode(): Promise<void> {
    const authCodeInput = document.getElementById('authCode') as HTMLInputElement;
    const code = authCodeInput?.value.trim();

    if (!code) {
        alert('認証コードを入力してください。');
        return;
    }

    try {
        const submitBtn = document.getElementById('submitAuthCodeBtn') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = '処理中...';

        if (window.electronAPI?.processAuthCode) {
            const result = await window.electronAPI.processAuthCode(code);

            if (result.success) {
                // 認証成功
                updateAuthStatus(true);

                // 認証コード入力セクションを隠す
                const authCodeSection = document.getElementById('authCodeSection');
                if (authCodeSection) {
                    authCodeSection.style.display = 'none';
                }

                // 入力欄をクリア
                authCodeInput.value = '';

                // Gmailラベル一覧を読み込む
                await loadGmailLabels();

                alert('Googleアカウントとの連携が完了しました。');
            } else {
                alert('認証コードの処理に失敗しました。\n' + (result.error || ''));
            }
        }
    } catch (error) {
        console.error('認証コード処理エラー:', error);
        alert('認証コードの処理中にエラーが発生しました。');
    } finally {
        const submitBtn = document.getElementById('submitAuthCodeBtn') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = '認証コードを送信';
    }
}

// 認証を解除
async function handleClearAuth(): Promise<void> {
    if (!confirm('Googleアカウントとの連携を解除しますか？')) {
        return;
    }

    try {
        if (window.electronAPI?.clearAuthentication) {
            const result = await window.electronAPI.clearAuthentication();

            if (result.success) {
                updateAuthStatus(false);
                alert('認証を解除しました。');
            } else {
                alert('認証の解除に失敗しました。\n' + (result.error || ''));
            }
        }
    } catch (error) {
        console.error('認証解除エラー:', error);
        alert('認証解除中にエラーが発生しました。');
    }
}

// 認証ステータスの更新
function updateAuthStatus(connected: boolean): void {
    const authStatus = document.getElementById('authStatus');
    if (!authStatus) return;

    const statusIcon = authStatus.querySelector('.status-icon');
    const statusLabel = authStatus.querySelector('.status-label');
    const statusDescription = authStatus.querySelector('.status-description');

    // ボタンの表示切り替え
    const authBtn = document.getElementById('authBtn') as HTMLButtonElement;
    const clearAuthBtn = document.getElementById('clearAuthBtn') as HTMLButtonElement;

    if (connected) {
        statusIcon?.classList.remove('disconnected');
        statusIcon?.classList.add('connected');
        if (statusLabel) statusLabel.textContent = '接続済み';
        if (statusDescription) statusDescription.textContent = 'Googleアカウントと連携しています';

        // ボタン表示
        if (authBtn) authBtn.style.display = 'none';
        if (clearAuthBtn) clearAuthBtn.style.display = 'inline-block';
    } else {
        statusIcon?.classList.remove('connected');
        statusIcon?.classList.add('disconnected');
        if (statusLabel) statusLabel.textContent = '未接続';
        if (statusDescription) statusDescription.textContent = 'Googleアカウントと連携していません';

        // ボタン表示
        if (authBtn) authBtn.style.display = 'inline-block';
        if (clearAuthBtn) clearAuthBtn.style.display = 'none';
    }
}

// Gmail接続テスト
async function handleTestGmail(): Promise<void> {
    const testBtn = document.getElementById('testGmailBtn') as HTMLButtonElement;
    const resultsDiv = document.getElementById('gmailTestResults');
    const contentDiv = document.getElementById('gmailTestContent');

    if (!window.electronAPI?.fetchGmailData) {
        alert('Gmail API機能が利用できません。');
        return;
    }

    // 認証状態を確認
    try {
        const authStatus = await window.electronAPI.checkAuthStatus();
        if (!authStatus.authenticated) {
            alert('Googleアカウントと連携していません。\n先に認証を完了してください。');
            return;
        }
    } catch (error) {
        alert('認証状態の確認に失敗しました。');
        return;
    }

    try {
        testBtn.disabled = true;
        testBtn.textContent = 'テスト中...';

        // 結果エリアを表示
        if (resultsDiv) resultsDiv.style.display = 'block';
        if (contentDiv) contentDiv.innerHTML = '<p>メールを取得中...</p>';

        // 現在の設定値を取得
        const gmailLabel = getInputValue('gmailLabel');

        // テスト用クエリ（過去1日間）
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const query = {
            startDate: yesterday,
            endDate: today,
            label: gmailLabel,
            maxResults: 10
        };

        console.log('Gmail テストクエリ:', query);

        const result = await window.electronAPI.fetchGmailData(query);

        if (result.success && result.data) {
            const emails = result.data;

            if (emails.length === 0) {
                if (contentDiv) {
                    contentDiv.innerHTML = `
                        <p style="color: #666;">✓ 接続成功</p>
                        <p style="color: #666;">過去1日間にラベル「${gmailLabel}」のメールは見つかりませんでした。</p>
                    `;
                }
            } else {
                let html = `<p style="color: #28a745; font-weight: 600;">✓ 接続成功</p>`;
                html += `<p>${emails.length} 件のメールを取得しました</p>`;
                html += '<div style="margin-top: 12px;">';

                emails.slice(0, 5).forEach((email: any, index: number) => {
                    const subject = email.subject || '(件名なし)';
                    const from = email.from || '(送信者不明)';
                    const bodyPreview = email.body ? email.body.substring(0, 100) + '...' : '';

                    html += `
                        <div style="margin-bottom: 12px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid #007bff;">
                            <div style="font-weight: 600; margin-bottom: 4px;">${index + 1}. ${escapeHtml(subject)}</div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">From: ${escapeHtml(from)}</div>
                            <div style="font-size: 12px; color: #888;">${escapeHtml(bodyPreview)}</div>
                        </div>
                    `;
                });

                if (emails.length > 5) {
                    html += `<p style="font-size: 12px; color: #666;">...他 ${emails.length - 5} 件</p>`;
                }

                html += '</div>';

                if (contentDiv) contentDiv.innerHTML = html;
            }
        } else {
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <p style="color: #dc3545; font-weight: 600;">✗ エラー</p>
                    <p>${result.error || '不明なエラーが発生しました'}</p>
                `;
            }
        }
    } catch (error) {
        console.error('Gmail テストエラー:', error);
        if (contentDiv) {
            contentDiv.innerHTML = `
                <p style="color: #dc3545; font-weight: 600;">✗ エラー</p>
                <p>メール取得中にエラーが発生しました</p>
            `;
        }
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = 'Gmail接続をテスト';
    }
}

// HTMLエスケープ
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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