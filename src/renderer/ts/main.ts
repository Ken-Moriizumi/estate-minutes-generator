// メイン画面のTypeScript

// DOMContentLoadedイベントでページの初期化
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
});

async function initializePage(): Promise<void> {
    // 設定を読み込み
    let settings = null;
    if (window.electronAPI) {
        settings = await window.electronAPI.loadSettings();
    }

    // 日付ピッカーの初期化（設定を渡す）
    initializeDatePickers(settings);

    // 場所選択による参加者自動設定
    setupLocationListener();

    // Gmail日付モード切り替えリスナー
    setupGmailDateModeListener();

    // フォームのイベントリスナー設定
    setupFormListeners();

    // 設定ボタンのリスナー
    setupSettingsButton();

    // プログレスイベントリスナーの設定
    setupProgressListeners();

    // 設定を保存（後で使用するため）
    (window as any).appSettings = settings;
}

// 日付・時刻ピッカーの初期化
function initializeDatePickers(settings: any): void {
    // Flatpickr の日本語設定
    if (typeof flatpickr !== 'undefined') {
        // 開催日の日付選択フィールド（開催日変更時のイベントリスナー付き）
        flatpickr('#meetingDate', {
            locale: 'ja',
            dateFormat: 'Y-m-d',
            defaultDate: 'today',
            onChange: function(_selectedDates: Date[], dateStr: string) {
                // 開催日が設定されたら、Gmail取得期間を手動モードに切り替えて同じ日付を設定
                if (dateStr) {
                    // 手動指定モードに切り替え
                    const manualRadio = document.querySelector('input[name="gmailDateMode"][value="manual"]') as HTMLInputElement;
                    if (manualRadio) {
                        manualRadio.checked = true;
                        // 手動指定フィールドを表示
                        const gmailDateFields = document.getElementById('gmailDateFields');
                        if (gmailDateFields) {
                            gmailDateFields.style.display = 'flex';
                        }
                    }

                    // Gmail取得期間の開始日と終了日を開催日と同じ日付に設定
                    const gmailStartDateInput = document.getElementById('gmailStartDate') as HTMLInputElement;
                    const gmailEndDateInput = document.getElementById('gmailEndDate') as HTMLInputElement;

                    if (gmailStartDateInput) {
                        gmailStartDateInput.value = dateStr;
                        // flatpickrインスタンスも更新
                        const gmailStartDatePicker = (gmailStartDateInput as any)._flatpickr;
                        if (gmailStartDatePicker) {
                            gmailStartDatePicker.setDate(dateStr, false);
                        }
                    }

                    if (gmailEndDateInput) {
                        gmailEndDateInput.value = dateStr;
                        // flatpickrインスタンスも更新
                        const gmailEndDatePicker = (gmailEndDateInput as any)._flatpickr;
                        if (gmailEndDatePicker) {
                            gmailEndDatePicker.setDate(dateStr, false);
                        }
                    }
                }
            }
        });

        // Gmail取得期間の日付選択フィールド
        flatpickr('#gmailStartDate', {
            locale: 'ja',
            dateFormat: 'Y-m-d'
        });

        flatpickr('#gmailEndDate', {
            locale: 'ja',
            dateFormat: 'Y-m-d'
        });

        // 開始時刻フィールド
        const defaultStartTime = settings?.defaults?.startTime || '14:00';
        flatpickr('#startTime', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            defaultDate: defaultStartTime
        });

        // 終了時刻フィールド
        const defaultEndTime = settings?.defaults?.endTime || '15:00';
        flatpickr('#endTime', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            defaultDate: defaultEndTime
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

// Gmail日付モード切り替えリスナー
function setupGmailDateModeListener(): void {
    const modeRadios = document.querySelectorAll('input[name="gmailDateMode"]');
    const gmailDateFields = document.getElementById('gmailDateFields');

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const mode = target.value;

            if (mode === 'manual' && gmailDateFields) {
                // 手動指定：日付フィールドを表示
                gmailDateFields.style.display = 'flex';
            } else if (gmailDateFields) {
                // 自動計算：日付フィールドを非表示
                gmailDateFields.style.display = 'none';
            }
        });
    });
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
            const settings = (window as any).appSettings;
            initializeDatePickers(settings);
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

// プログレスイベントリスナーのセットアップ
function setupProgressListeners(): void {
    if (window.electronAPI) {
        // プログレス更新イベント
        window.electronAPI.onProgress((progress: any) => {
            updateProgress(progress.progress, progress.message);
        });

        // 完了イベント
        window.electronAPI.onComplete((result: any) => {
            hideProgress();
            showSuccessDialog(result);
        });

        // エラーイベント
        window.electronAPI.onError((error: any) => {
            hideProgress();
            showErrorDialog(error.message);
        });
    }
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
    const gmailDateMode = formData.get('gmailDateMode') as string;

    // バリデーション
    if (participants.length === 0) {
        alert('参加者を選択してください。');
        return;
    }

    if (!meetingDate || !startTime || !endTime) {
        alert('開催日時を入力してください。');
        return;
    }

    // Gmail取得期間の計算または取得
    let gmailStartDate: string;
    let gmailEndDate: string;

    if (gmailDateMode === 'auto') {
        // 自動計算モード：会議日のN日前から会議日まで
        const settings = (window as any).appSettings;
        const retrievalPeriod = settings?.defaults?.retrievalPeriod || 1;

        const meetingDateObj = new Date(meetingDate);

        // 開始日 = 会議日 - N日
        const startDateObj = new Date(meetingDateObj);
        startDateObj.setDate(startDateObj.getDate() - retrievalPeriod);
        gmailStartDate = startDateObj.toISOString().split('T')[0];

        // 終了日 = 会議日（会議日当日まで）
        gmailEndDate = meetingDate;
    } else {
        // 手動指定モード
        gmailStartDate = formData.get('gmailStartDate') as string;
        gmailEndDate = formData.get('gmailEndDate') as string;

        if (!gmailStartDate || !gmailEndDate) {
            alert('Gmail取得期間を入力してください。');
            return;
        }
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
    }
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    if (progressMessage) {
        progressMessage.textContent = '処理を開始しています...';
    }
}

// プログレス更新
function updateProgress(percent: number, message: string): void {
    const progressFill = document.getElementById('progressFill') as HTMLElement;
    const progressMessage = document.getElementById('progressMessage') as HTMLElement;

    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
    if (progressMessage) {
        progressMessage.textContent = message;
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

// 成功ダイアログ表示
function showSuccessDialog(result: any): void {
    const dialog = document.getElementById('successDialog');
    const documentUrl = document.getElementById('documentUrl') as HTMLAnchorElement;
    const openDocBtn = document.getElementById('openDocBtn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    if (dialog && documentUrl && result.documentUrl) {
        // URLを設定
        documentUrl.href = result.documentUrl;
        documentUrl.textContent = result.fileName || 'ドキュメントを開く';

        // ダイアログを表示
        dialog.style.display = 'flex';

        // ブラウザで開くボタン
        openDocBtn?.addEventListener('click', () => {
            if (window.electronAPI && result.documentUrl) {
                // Electronでブラウザを開く
                window.open(result.documentUrl, '_blank');
            }
        }, { once: true });

        // 閉じるボタン
        closeSuccessBtn?.addEventListener('click', () => {
            dialog.style.display = 'none';
        }, { once: true });
    } else {
        // フォールバック: 単純なalert
        alert('議事録の生成が完了しました！\n\nGoogle Docsで確認できます。');
    }
}

// エラーダイアログ表示
function showErrorDialog(message: string): void {
    const dialog = document.getElementById('errorDialog');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');

    if (dialog && errorMessage) {
        // エラーメッセージを設定
        errorMessage.textContent = message;

        // ダイアログを表示
        dialog.style.display = 'flex';

        // 閉じるボタン
        closeErrorBtn?.addEventListener('click', () => {
            dialog.style.display = 'none';
        }, { once: true });
    } else {
        // フォールバック: 単純なalert
        alert(`エラー: ${message}`);
    }
}

// 型定義はglobal.d.tsに移動