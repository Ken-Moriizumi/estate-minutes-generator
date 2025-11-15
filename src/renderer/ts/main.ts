// メイン画面のTypeScript

// DOMContentLoadedイベントでページの初期化
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage(): void {
    // 日付ピッカーの初期化
    initializeDatePickers();

    // 場所選択による参加者自動設定
    setupLocationListener();

    // フォームのイベントリスナー設定
    setupFormListeners();

    // 設定ボタンのリスナー
    setupSettingsButton();
}

// 日付・時刻ピッカーの初期化
function initializeDatePickers(): void {
    // Flatpickr の日本語設定
    if (typeof flatpickr !== 'undefined') {
        // 日付選択フィールド
        flatpickr('.datepicker', {
            locale: 'ja',
            dateFormat: 'Y-m-d',
            defaultDate: 'today'
        });

        // 時刻選択フィールド
        flatpickr('.timepicker', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            defaultDate: '14:00'
        });
    }
}

// 場所選択による参加者自動設定
function setupLocationListener(): void {
    const locationRadios = document.querySelectorAll('input[name="location"]');
    const participantCheckboxes = document.querySelectorAll('input[name="participants"]') as NodeListOf<HTMLInputElement>;

    locationRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const location = target.value;

            // 全参加者のチェックを外す
            participantCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            // 場所に応じて参加者を自動選択
            switch (location) {
                case 'tokyo':
                    // 東京：社長と妻
                    setParticipant('president', true);
                    setParticipant('wife', true);
                    break;
                case 'nagano':
                    // 長野：会長と母
                    setParticipant('chairman', true);
                    setParticipant('mother', true);
                    break;
                case 'online':
                    // オンライン：全員選択可能（デフォルトは社長と妻）
                    setParticipant('president', true);
                    setParticipant('wife', true);
                    break;
            }
        });
    });
}

// 特定の参加者のチェック状態を設定
function setParticipant(value: string, checked: boolean): void {
    const checkbox = document.querySelector(`input[name="participants"][value="${value}"]`) as HTMLInputElement;
    if (checkbox) {
        checkbox.checked = checked;
    }
}

// フォームのイベントリスナー設定
function setupFormListeners(): void {
    const form = document.getElementById('minutesForm') as HTMLFormElement;
    const resetBtn = document.getElementById('resetBtn');
    const generateBtn = document.getElementById('generateBtn');

    // フォーム送信（議事録生成）
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await generateMinutes();
    });

    // リセットボタン
    resetBtn?.addEventListener('click', () => {
        if (confirm('入力内容をリセットしますか？')) {
            form?.reset();
            initializeDatePickers();
        }
    });
}

// 設定ボタンのセットアップ
function setupSettingsButton(): void {
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn?.addEventListener('click', () => {
        // Electronのメインプロセスに設定画面を開くよう要求
        if (window.electronAPI) {
            window.electronAPI.openSettings();
        } else {
            console.log('設定画面を開く（開発中）');
        }
    });
}

// 議事録生成処理
async function generateMinutes(): Promise<void> {
    const form = document.getElementById('minutesForm') as HTMLFormElement;
    const formData = new FormData(form);

    // フォームデータの収集
    const location = formData.get('location') as string;
    const participants = Array.from(formData.getAll('participants')) as string[];
    const meetingDate = formData.get('meetingDate') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const gmailStartDate = formData.get('gmailStartDate') as string;
    const gmailEndDate = formData.get('gmailEndDate') as string;

    // バリデーション
    if (participants.length === 0) {
        alert('参加者を選択してください。');
        return;
    }

    if (!meetingDate || !startTime || !endTime) {
        alert('開催日時を入力してください。');
        return;
    }

    if (!gmailStartDate || !gmailEndDate) {
        alert('Gmail取得期間を入力してください。');
        return;
    }

    // プログレス表示
    showProgress();

    try {
        // 議事録生成リクエスト
        const request = {
            date: new Date(meetingDate),
            startTime,
            endTime,
            location,
            participants,
            gmailStartDate: new Date(gmailStartDate),
            gmailEndDate: new Date(gmailEndDate)
        };

        // Electronのメインプロセスに議事録生成を要求
        if (window.electronAPI) {
            const result = await window.electronAPI.generateMinutes(request);

            if (result.success) {
                hideProgress();
                alert('議事録の生成が完了しました！\n\nGoogle Docsで確認できます。');
            } else {
                hideProgress();
                alert(`エラー: ${result.error || '議事録の生成に失敗しました。'}`);
            }
        } else {
            // 開発環境用のダミー処理
            setTimeout(() => {
                hideProgress();
                alert('議事録生成機能は開発中です。');
            }, 2000);
        }
    } catch (error) {
        hideProgress();
        console.error('議事録生成エラー:', error);
        alert('議事録の生成中にエラーが発生しました。');
    }
}

// プログレス表示
function showProgress(): void {
    const overlay = document.getElementById('progressOverlay');
    const progressFill = document.getElementById('progressFill') as HTMLElement;
    const progressMessage = document.getElementById('progressMessage') as HTMLElement;

    if (overlay) {
        overlay.style.display = 'flex';

        // プログレスバーアニメーション
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }

            // プログレスメッセージの更新
            if (progress === 30 && progressMessage) {
                progressMessage.textContent = 'Gmail から物件情報を取得しています...';
            } else if (progress === 60 && progressMessage) {
                progressMessage.textContent = '議事録の内容を生成しています...';
            } else if (progress === 90 && progressMessage) {
                progressMessage.textContent = 'Google Docs に保存しています...';
            }

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 500);
    }
}

// プログレス非表示
function hideProgress(): void {
    const overlay = document.getElementById('progressOverlay');
    const progressFill = document.getElementById('progressFill') as HTMLElement;

    if (overlay) {
        overlay.style.display = 'none';
    }
    if (progressFill) {
        progressFill.style.width = '0%';
    }
}

// 型定義はglobal.d.tsに移動