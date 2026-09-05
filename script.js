document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-block-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    const scoreElement = document.getElementById('score');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const downBtn = document.getElementById('down-btn');
    const restartBtnOver = document.getElementById('restart-btn-over');
    const restartBtnClear = document.getElementById('restart-btn-clear');
    const startBtn = document.getElementById('start-btn');
    const soundBtn = document.getElementById('sound-btn');
    const helpBtn = document.getElementById('help-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const langBtn = document.getElementById('lang-btn');

    const gameOverScreen = document.getElementById('game-over-screen');
    const gameClearScreen = document.getElementById('game-clear-screen');
    const startScreen = document.getElementById('start-screen');
    const tutorialScreen = document.getElementById('tutorial-screen');
    const closeTutorialBtn = document.getElementById('close-tutorial-btn');
    const tutPrevBtn = document.getElementById('tut-prev-btn');
    const tutNextBtn = document.getElementById('tut-next-btn');
    const tutorialTabs = document.querySelectorAll('.tutorial-tab');
    const tutorialPages = document.querySelectorAll('.tutorial-page');
    const tutorialDots = document.querySelectorAll('.tut-dot');

    const gameMainContainer = document.querySelector('.game-main');
    const floatingTextContainer = document.getElementById('floating-text-container');
    const finalScoreOver = document.getElementById('final-score-over');
    const finalScoreClear = document.getElementById('final-score');

    const COLS = 10;
    const ROWS = 15;
    const INITIAL_BLOCK_COUNT = 7;

    let BLOCK_SIZE;

    // Vibrant neon block palette for numbers 1 to 9
    const BLOCK_PALETTE = [
        null,
        { main: '#FF3366', top: '#FF6688', border: '#CC0033', shadow: 'rgba(255, 51, 102, 0.4)' }, // 1: Neon Red/Pink
        { main: '#FF9900', top: '#FFBB44', border: '#CC7700', shadow: 'rgba(255, 153, 0, 0.4)' }, // 2: Neon Orange
        { main: '#FFDD00', top: '#FFEE66', border: '#CCB800', shadow: 'rgba(255, 221, 0, 0.4)' }, // 3: Neon Yellow
        { main: '#00FF66', top: '#66FF99', border: '#00CC44', shadow: 'rgba(0, 255, 102, 0.4)' }, // 4: Lime Green
        { main: '#00F0FF', top: '#66F5FF', border: '#00B8CC', shadow: 'rgba(0, 240, 255, 0.4)' }, // 5: Electric Cyan
        { main: '#3366FF', top: '#7799FF', border: '#0033CC', shadow: 'rgba(51, 102, 255, 0.4)' }, // 6: Royal Blue
        { main: '#B533FF', top: '#D177FF', border: '#8800CC', shadow: 'rgba(181, 51, 255, 0.4)' }, // 7: Electric Purple
        { main: '#FF33CC', top: '#FF77DD', border: '#CC0099', shadow: 'rgba(255, 51, 204, 0.4)' }, // 8: Hot Magenta
        { main: '#00FFCC', top: '#66FFDD', border: '#00CC99', shadow: 'rgba(0, 255, 204, 0.4)' }  // 9: Aqua Mint
    ];

    let board = [];
    let currentBlock = null;
    let nextBlock = null;
    let score = 0;
    let gameOver = false;
    let isAnimating = false;
    let blinkingBlocks = new Set();
    let gameLoop = null;
    let animFrameReq = null;
    let fallSpeed = 900; // ms
    let lastFallTime = 0;
    let isProcessingMove = false;
    let soundEnabled = true;
    let isTutorialOpen = false;
    let isPaused = false;
    let currentTutorialTab = 0;
    let currentLang = 'ja';

    // --- Difficulty Configurations ---
    const DIFFICULTY_CONFIG = {
        easy: {
            fallSpeed: 1200,
            initialBlocks: 5,
            scoreMultiplier: 1.0,
            colorClass: 'easy'
        },
        normal: {
            fallSpeed: 850,
            initialBlocks: 7,
            scoreMultiplier: 1.5,
            colorClass: 'normal'
        },
        hard: {
            fallSpeed: 500,
            initialBlocks: 12,
            scoreMultiplier: 2.0,
            colorClass: 'hard'
        }
    };

    let currentDifficulty = localStorage.getItem('sumris_difficulty') || 'normal';
    if (!DIFFICULTY_CONFIG[currentDifficulty]) currentDifficulty = 'normal';

    // --- Internationalization (i18n) Dictionary ---
    const I18N = {
        ja: {
            title: "SUMRIS - 数字ブロックパズル",
            score_label: "SCORE",
            next_label: "NEXT",
            help_title: "あそびかた",
            sound_title: "サウンド切替",
            lang_btn: "EN",
            lang_title: "Switch to English",
            difficulty_label: "難易度: ",
            select_difficulty: "難易度選択",
            diff_easy: "EASY",
            diff_normal: "NORMAL",
            diff_hard: "HARD",
            diff_desc_easy: "速度: 遅い (1.2s) | 初期配置: 5個 | スコア: 1.0倍<br>初心者向け。じっくり考えて足し算を楽しめます。",
            diff_desc_normal: "速度: 標準 (0.85s) | 初期配置: 7個 | スコア: 1.5倍<br>標準モード。スピードと計算のバランスが良い設定です。",
            diff_desc_hard: "速度: 高速 (0.5s) | 初期配置: 12個 | スコア: 2.0倍<br>上級者向け！素早い判断と連鎖でハイスコアを目指そう！",
            game_over: "GAME OVER",
            game_clear: "GAME CLEAR!",
            final_score_label: "FINAL SCORE: ",
            try_again: "もう一度プレイ",
            play_again: "もう一度プレイ",
            subtitle: "縦か横に足して10の倍数（10, 20, 30...）を作ろう！",
            start_game: "ゲームスタート",
            how_to_play: "あそびかた",
            tut_title: "HOW TO PLAY",
            tab_basics: "基本",
            tab_clearing: "消し方",
            tab_bonus: "ボーナス",
            tab_controls: "操作",
            page0_h3: "🔢 基本ルール",
            page0_desc: "1から9の数字が書かれたブロックが、上からゆっくり落ちてきます。左右に動かして積み上げましょう。",
            page0_demo_label: "数字ブロックの種類 (1〜9)",
            page0_hint: "画面右上の「NEXT」に次に落ちてくるブロックが表示されます。先を読んで積み方を考えましょう！",
            page1_h3: "💥 ブロックの消し方",
            page1_desc: "縦または横に連続したブロックを足し算して<br><span class=\"highlight-cyan\">「10の倍数（10, 20, 30...）」</span>になると消去！",
            page1_ex1_title: "縦の足し算 (合計10)",
            page1_ex2_title: "横の足し算 (3個以上もOK)",
            page1_hint: "合計が 20, 30 や 90 などの大きな10の倍数でも消去できます！",
            page2_h3: "⭐ スコアとクリア",
            bonus_cross_badge: "CROSS CLEAR!",
            bonus_cross_desc: "縦と横が交差して同時に消えるとスコア<strong>3倍</strong>！",
            bonus_combo_badge: "COMBO CHAIN!",
            bonus_combo_desc: "落下による連鎖で消えるとコンボ倍率がどんどんアップ！",
            bonus_big_badge: "BIG NUMBER!",
            bonus_big_desc: "大きい合計や多くのブロックをまとめて消すほど高得点！",
            bonus_clear_badge: "GAME CLEAR!",
            bonus_clear_desc: "画面内のブロックをすべて消せば<strong>完全クリア</strong>＆ボーナス！",
            page3_h3: "🎮 操作方法",
            ctrl_mobile_header: "📱 スマートフォン",
            ctrl_mobile_body: "<p>・画面下のボタン「⇦ ⇩ ⇨」をタップ</p><p>・または盤面を直接左右にスワイプ</p>",
            ctrl_pc_header: "💻 PC (キーボード)",
            ctrl_pc_body: "<p>・左右移動: <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd></p><p>・すばやく落下: <kbd>↓</kbd> / <kbd>S</kbd></p>",
            page3_hint: "プレイ中も右上の「❓」ボタンからいつでもルールを確認できます。",
            tut_prev: "前へ",
            tut_next: "次へ",
            tut_close: "閉じる"
        },
        en: {
            title: "SUMRIS - Math Block Puzzle",
            score_label: "SCORE",
            next_label: "NEXT",
            help_title: "How to Play",
            sound_title: "Toggle Sound",
            lang_btn: "JA",
            lang_title: "日本語に切り替え",
            difficulty_label: "DIFFICULTY: ",
            select_difficulty: "DIFFICULTY",
            diff_easy: "EASY",
            diff_normal: "NORMAL",
            diff_hard: "HARD",
            diff_desc_easy: "Speed: Slow (1.2s) | Initial: 5 | Score: 1.0x<br>Relaxed pace. Take your time to calculate sums.",
            diff_desc_normal: "Speed: Normal (0.85s) | Initial: 7 | Score: 1.5x<br>Balanced mode. Great balance of speed & strategy.",
            diff_desc_hard: "Speed: Fast (0.5s) | Initial: 12 | Score: 2.0x<br>Fast & challenging! High risk and double score bonus!",
            game_over: "GAME OVER",
            game_clear: "GAME CLEAR!",
            final_score_label: "FINAL SCORE: ",
            try_again: "TRY AGAIN",
            play_again: "PLAY AGAIN",
            subtitle: "Match vertical or horizontal sums of 10, 20, 30...",
            start_game: "START GAME",
            how_to_play: "HOW TO PLAY",
            tut_title: "HOW TO PLAY",
            tab_basics: "Basics",
            tab_clearing: "Clearing",
            tab_bonus: "Bonus",
            tab_controls: "Controls",
            page0_h3: "🔢 Basic Rules",
            page0_desc: "Blocks with numbers from 1 to 9 fall slowly from above. Move them left and right to stack them up.",
            page0_demo_label: "Block Numbers (1 to 9)",
            page0_hint: "The \"NEXT\" preview at the top right shows the upcoming block. Plan your moves ahead!",
            page1_h3: "💥 How to Clear Blocks",
            page1_desc: "Add contiguous blocks vertically or horizontally.<br>When their sum is a <span class=\"highlight-cyan\">multiple of 10 (10, 20, 30...)</span>, they clear!",
            page1_ex1_title: "Vertical Sum (Total 10)",
            page1_ex2_title: "Horizontal Sum (3+ blocks work too)",
            page1_hint: "Clearing with larger sums like 20, 30, or 90 gives massive score boosts!",
            page2_h3: "⭐ Scores & Game Clear",
            bonus_cross_badge: "CROSS CLEAR!",
            bonus_cross_desc: "Clear vertical and horizontal lines simultaneously for <strong>3x score</strong>!",
            bonus_combo_badge: "COMBO CHAIN!",
            bonus_combo_desc: "Cascading clears from falling blocks multiply combo scores!",
            bonus_big_badge: "BIG NUMBER!",
            bonus_big_desc: "Higher sums (e.g. 20, 90) and more blocks award significantly more points!",
            bonus_clear_badge: "GAME CLEAR!",
            bonus_clear_desc: "Clear every block from the board to achieve <strong>PERFECT CLEAR</strong> & bonus!",
            page3_h3: "🎮 Controls",
            ctrl_mobile_header: "📱 Smartphone",
            ctrl_mobile_body: "<p>• Tap buttons (⇦ ⇩ ⇨) at the bottom</p><p>• Or swipe left / right directly on the board</p>",
            ctrl_pc_header: "💻 PC (Keyboard)",
            ctrl_pc_body: "<p>• Move Left / Right: <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd></p><p>• Soft Drop: <kbd>↓</kbd> / <kbd>S</kbd></p>",
            page3_hint: "Tap the \"❓\" button at any time during gameplay to review the rules.",
            tut_prev: "PREV",
            tut_next: "NEXT",
            tut_close: "CLOSE"
        }
    };

    function updateDifficultyUI() {
        const texts = I18N[currentLang] || I18N.en;
        const diffName = texts['diff_' + currentDifficulty] || currentDifficulty.toUpperCase();

        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            if (btn.getAttribute('data-diff') === currentDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const diffBadge = document.getElementById('diff-badge');
        if (diffBadge) {
            diffBadge.textContent = diffName;
            diffBadge.className = `diff-badge ${currentDifficulty}`;
        }

        const diffDesc = document.getElementById('diff-desc');
        if (diffDesc) {
            diffDesc.innerHTML = texts['diff_desc_' + currentDifficulty] || '';
        }

        const resultDiffOver = document.getElementById('result-diff-over');
        if (resultDiffOver) {
            resultDiffOver.textContent = diffName;
            resultDiffOver.className = `diff-name ${currentDifficulty}`;
        }

        const resultDiffClear = document.getElementById('result-diff-clear');
        if (resultDiffClear) {
            resultDiffClear.textContent = diffName;
            resultDiffClear.className = `diff-name ${currentDifficulty}`;
        }
    }

    function setDifficulty(diff, playSfx = true) {
        if (!DIFFICULTY_CONFIG[diff]) return;
        currentDifficulty = diff;
        localStorage.setItem('sumris_difficulty', diff);
        updateDifficultyUI();
        if (playSfx) playSound('move');
    }

    function detectBrowserLanguage() {
        const saved = localStorage.getItem('sumris_lang');
        if (saved === 'ja' || saved === 'en') return saved;

        const navLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
        for (const lang of navLangs) {
            if (lang && lang.toLowerCase().startsWith('ja')) {
                return 'ja';
            }
        }
        return 'en';
    }

    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        const texts = I18N[lang] || I18N.en;

        document.title = texts.title;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (texts[key]) {
                el.textContent = texts[key];
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (texts[key]) {
                el.innerHTML = texts[key];
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (texts[key]) {
                el.title = texts[key];
                el.setAttribute('aria-label', texts[key]);
            }
        });

        if (langBtn) {
            langBtn.textContent = texts.lang_btn;
            langBtn.title = texts.lang_title;
            langBtn.setAttribute('aria-label', texts.lang_title);
        }

        updateTutorialButtons();
        updateDifficultyUI();
    }

    function updateTutorialButtons() {
        const texts = I18N[currentLang] || I18N.en;
        tutPrevBtn.disabled = (currentTutorialTab === 0);
        tutPrevBtn.textContent = texts.tut_prev;
        tutNextBtn.textContent = (currentTutorialTab === tutorialTabs.length - 1) ? texts.tut_close : texts.tut_next;
    }

    // --- Web Audio Synthesizer ---
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type, param = 1) {
        if (!soundEnabled || !audioCtx) return;

        try {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'move') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === 'drop') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'clear') {
                // Bright resonant chime ascending with combo count
                const baseFreq = 523.25 * Math.pow(1.2, param - 1); // C5 upwards
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.25);

                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                osc.start(now);
                osc.stop(now + 0.3);

                // Sub-synth harmony
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(baseFreq * 2, now);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                gain2.gain.setValueAtTime(0.15, now);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc2.start(now);
                osc2.stop(now + 0.25);
            } else if (type === 'gameover') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (type === 'clearall') {
                // Celebratory chord
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + idx * 0.08);
                    g.gain.setValueAtTime(0.2, now + idx * 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.start(now + idx * 0.08);
                    o.stop(now + idx * 0.08 + 0.4);
                });
            }
        } catch (e) {
            // Audio context error fallback
        }
    }

    // --- Particle System for Exhilarating Explosion FX ---
    let particles = [];

    function spawnExplosion(xGrid, yGrid, number) {
        const palette = BLOCK_PALETTE[number] || BLOCK_PALETTE[1];
        const centerX = (xGrid + 0.5) * BLOCK_SIZE;
        const centerY = (yGrid + 0.5) * BLOCK_SIZE;
        const count = 16; // Number of particles per block

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 4 + 2) * (BLOCK_SIZE / 25);
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: Math.random() * (BLOCK_SIZE * 0.25) + 3,
                color: Math.random() > 0.3 ? palette.main : '#FFFFFF',
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.02,
                gravity: 0.15
            });
        }
    }

    function updateAndDrawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // --- Floating Score & Combo Text ---
    function spawnFloatingText(text, xGrid, yGrid, isCombo = false, isCross = false) {
        const boardRect = canvas.getBoundingClientRect();
        const mainRect = gameMainContainer.getBoundingClientRect();

        const xPx = (xGrid + 0.5) * BLOCK_SIZE + (boardRect.left - mainRect.left);
        const yPx = (yGrid + 0.5) * BLOCK_SIZE + (boardRect.top - mainRect.top);

        const el = document.createElement('div');
        el.className = `floating-text ${isCross ? 'cross' : isCombo ? 'combo' : ''}`;
        el.textContent = text;
        el.style.left = `${xPx}px`;
        el.style.top = `${yPx}px`;

        floatingTextContainer.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 900);
    }

    // Screen Shake FX
    function triggerScreenShake() {
        gameMainContainer.classList.remove('shake');
        void gameMainContainer.offsetWidth; // Force reflow
        gameMainContainer.classList.add('shake');
        setTimeout(() => {
            gameMainContainer.classList.remove('shake');
        }, 350);
    }

    function setAppHeight() {
        const doc = document.documentElement;
        doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    }

    function resizeCanvas() {
        const containerWidth = gameMainContainer.clientWidth - 16;
        const containerHeight = gameMainContainer.clientHeight - 16;

        const blockW = containerWidth / COLS;
        const blockH = containerHeight / ROWS;
        BLOCK_SIZE = Math.floor(Math.min(blockW, blockH));
        BLOCK_SIZE = Math.max(BLOCK_SIZE, 12); // Minimum bounds

        canvas.width = BLOCK_SIZE * COLS;
        canvas.height = BLOCK_SIZE * ROWS;
        
        const nextBlockCanvasEl = document.getElementById('next-block-canvas');
        const style = getComputedStyle(nextBlockCanvasEl);
        const nextBlockSize = parseInt(style.height, 10) || 32;
        nextCanvas.width = nextBlockSize;
        nextCanvas.height = nextBlockSize;
        
        draw();
    }
    
    function createEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    function generateBlock() {
        const number = Math.floor(Math.random() * 9) + 1;
        return {
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            number: number
        };
    }

    function isValidMove(block, newX, newY) {
        return (
            newX >= 0 &&
            newX < COLS &&
            newY < ROWS &&
            (board[newY] && board[newY][newX] === 0)
        );
    }
    
    function placeBlock(block) {
        if (!block) {
            isProcessingMove = false;
            return;
        }
        board[block.y][block.x] = block.number;
        playSound('drop');

        handleClears().then(() => {
            if (gameOver) return;

            currentBlock = nextBlock;
            nextBlock = generateBlock();

            if (!isValidMove(currentBlock, currentBlock.x, currentBlock.y)) {
                endGame();
            }
            
            isProcessingMove = false;
        });
    }

    function animateAndClearBlocks(blocksToClear, scoreGain, comboCount, isCross) {
        return new Promise(resolve => {
            isAnimating = true;
            let blinkCount = 0;
            const totalBlinks = 6;
            const blinkInterval = 80;

            // Trigger screen shake & sound
            triggerScreenShake();
            playSound('clear', comboCount);

            // Calculate center position of clear group for popups
            let avgX = 0, avgY = 0;
            const blockArray = Array.from(blocksToClear);
            blockArray.forEach(bStr => {
                const [y, x] = bStr.split(',').map(Number);
                avgX += x;
                avgY += y;
            });
            avgX /= blockArray.length;
            avgY /= blockArray.length;

            // Spawn floating text popups
            spawnFloatingText(`+${scoreGain}`, avgX, avgY);
            if (isCross) {
                spawnFloatingText(`CROSS CLEAR!!`, avgX, avgY - 0.8, false, true);
            } else if (comboCount > 1) {
                spawnFloatingText(`${comboCount}x COMBO!`, avgX, avgY - 0.8, true, false);
            }

            const blinker = setInterval(() => {
                blinkCount++;
                if (blinkingBlocks.size > 0) {
                    blinkingBlocks.clear();
                } else {
                    blinkingBlocks = new Set(blocksToClear);
                }

                if (blinkCount >= totalBlinks) {
                    clearInterval(blinker);
                    blinkingBlocks.clear();

                    // Spawn explosion particles for each cleared block!
                    blocksToClear.forEach(bStr => {
                        const [y, x] = bStr.split(',').map(Number);
                        const num = board[y][x];
                        spawnExplosion(x, y, num);
                        board[y][x] = 0;
                    });

                    applyGravity();
                    isAnimating = false;
                    resolve();
                }
            }, blinkInterval);
        });
    }

    async function handleClears() {
        let comboMultiplier = 1;

        while (!gameOver) {
            const { blocksToClear, scoreFromClear, isCrossClear } = findCompletes();
            if (blocksToClear.size === 0) {
                break;
            }

            let currentTurnScore = scoreFromClear;
            
            if (isCrossClear) {
                currentTurnScore *= 3;
            }
            if (comboMultiplier > 1) {
                currentTurnScore *= (comboMultiplier * 2); 
            }

            const diffConfig = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG.normal;
            currentTurnScore = Math.round(currentTurnScore * diffConfig.scoreMultiplier);
            
            updateScore(currentTurnScore);

            await animateAndClearBlocks(blocksToClear, currentTurnScore, comboMultiplier, isCrossClear);
            
            comboMultiplier++;
        }
        checkForGameClear();
    }

    function findCompletes() {
        const verticalBlocksToClear = new Set();
        const horizontalBlocksToClear = new Set();
        let verticalScore = 0;
        let horizontalScore = 0;

        // Vertical Check
        for (let x = 0; x < COLS; x++) {
            let currentSum = 0;
            let sumBlocks = [];
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] > 0) {
                    currentSum += board[y][x];
                    sumBlocks.push({ y, x });
                }

                if (board[y][x] === 0 || y === ROWS - 1) {
                    if (currentSum > 0 && currentSum % 10 === 0) {
                        verticalScore += currentSum * sumBlocks.length;
                        sumBlocks.forEach(b => verticalBlocksToClear.add(`${b.y},${b.x}`));
                    }
                    currentSum = 0;
                    sumBlocks = [];
                }
            }
        }

        // Horizontal Check
        for (let y = 0; y < ROWS; y++) {
            let currentSum = 0;
            let sumBlocks = [];
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] > 0) {
                    currentSum += board[y][x];
                    sumBlocks.push({ y, x });
                }
                if (board[y][x] === 0 || x === COLS - 1) {
                    if (currentSum > 0 && currentSum % 10 === 0) {
                       horizontalScore += currentSum * sumBlocks.length;
                       sumBlocks.forEach(b => horizontalBlocksToClear.add(`${b.y},${b.x}`));
                    }
                    currentSum = 0;
                    sumBlocks = [];
                }
            }
        }

        const intersection = new Set([...verticalBlocksToClear].filter(b => horizontalBlocksToClear.has(b)));
        const isCrossClear = intersection.size > 0;
        
        const blocksToClear = new Set([...verticalBlocksToClear, ...horizontalBlocksToClear]);
        const scoreFromClear = verticalScore + horizontalScore;
        
        return { blocksToClear, scoreFromClear, isCrossClear };
    }
    
    function applyGravity() {
        for (let x = 0; x < COLS; x++) {
            let emptyRow = ROWS - 1;
            for (let y = ROWS - 1; y >= 0; y--) {
                if (board[y][x] > 0) {
                    [board[emptyRow][x], board[y][x]] = [board[y][x], board[emptyRow][x]];
                    emptyRow--;
                }
            }
        }
    }

    function checkForGameClear() {
        const isBoardEmpty = board.every(row => row.every(cell => cell === 0));
        if (isBoardEmpty) {
            updateScore(score);
            finalScoreClear.textContent = score;
            updateDifficultyUI();
            gameClearScreen.style.display = 'flex';
            playSound('clearall');
            gameOver = true;
        }
    }

    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
    }

    // Dynamic Rounded Rect Canvas Helper
    function drawRoundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    function drawBlock(targetCtx, block, blockSize = BLOCK_SIZE, isBlinking = false) {
        if (!block || !block.number) return;
        const palette = BLOCK_PALETTE[block.number] || BLOCK_PALETTE[1];

        const px = block.x * blockSize;
        const py = block.y * blockSize;
        const radius = Math.max(3, Math.floor(blockSize * 0.15));
        const padding = 1;

        targetCtx.save();

        if (isBlinking) {
            // Bright flash for blinking blocks right before clear explosion
            targetCtx.fillStyle = '#FFFFFF';
            targetCtx.shadowColor = '#FFFFFF';
            targetCtx.shadowBlur = 15;
            drawRoundRect(targetCtx, px + padding, py + padding, blockSize - padding * 2, blockSize - padding * 2, radius);
            targetCtx.fill();

            targetCtx.fillStyle = '#000000';
            targetCtx.font = `900 ${blockSize * 0.6}px Orbitron, sans-serif`;
            targetCtx.textAlign = 'center';
            targetCtx.textBaseline = 'middle';
            targetCtx.fillText(block.number, px + blockSize / 2, py + blockSize / 2);
            targetCtx.restore();
            return;
        }

        // Outer Glow & Shadow
        targetCtx.shadowColor = palette.shadow;
        targetCtx.shadowBlur = 8;

        // Gradient Fill
        const grad = targetCtx.createLinearGradient(px, py, px, py + blockSize);
        grad.addColorStop(0, palette.top);
        grad.addColorStop(1, palette.main);

        targetCtx.fillStyle = grad;
        drawRoundRect(targetCtx, px + padding, py + padding, blockSize - padding * 2, blockSize - padding * 2, radius);
        targetCtx.fill();

        // Bevel / Border Highlight
        targetCtx.lineWidth = 1.5;
        targetCtx.strokeStyle = palette.border;
        targetCtx.stroke();

        // Inner Bevel Top Edge
        targetCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        targetCtx.beginPath();
        targetCtx.moveTo(px + padding + radius, py + padding);
        targetCtx.lineTo(px + blockSize - padding - radius, py + padding);
        targetCtx.lineTo(px + blockSize - padding - radius - 2, py + padding + 3);
        targetCtx.lineTo(px + padding + radius + 2, py + padding + 3);
        targetCtx.closePath();
        targetCtx.fill();

        // Clean White Number with Shadow
        targetCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        targetCtx.shadowBlur = 4;
        targetCtx.shadowOffsetY = 1;
        targetCtx.fillStyle = '#FFFFFF';
        targetCtx.font = `900 ${blockSize * 0.58}px Orbitron, sans-serif`;
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.fillText(block.number, px + blockSize / 2, py + blockSize / 2);

        targetCtx.restore();
    }

    function drawGridLines() {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * BLOCK_SIZE, 0);
            ctx.lineTo(x * BLOCK_SIZE, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * BLOCK_SIZE);
            ctx.lineTo(canvas.width, y * BLOCK_SIZE);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGridLines();

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] > 0) {
                    const number = board[y][x];
                    const isBlinking = blinkingBlocks.has(`${y},${x}`);
                    drawBlock(ctx, { x, y, number }, BLOCK_SIZE, isBlinking);
                }
            }
        }
    }
    
    function drawNextBlock() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (nextBlock) {
            const displayBlock = {
                ...nextBlock,
                x: 0,
                y: 0,
            };
            drawBlock(nextCtx, displayBlock, nextCanvas.width);
        }
    }

    function draw() {
        drawBoard();
        if (currentBlock) {
            drawBlock(ctx, currentBlock);
        }
        drawNextBlock();
        updateAndDrawParticles();
    }
    
    function moveCurrentBlock(dx) {
        if (gameOver || !currentBlock || isAnimating || isProcessingMove) return;
        const newX = currentBlock.x + dx;
        if (isValidMove(currentBlock, newX, currentBlock.y)) {
            currentBlock.x = newX;
            playSound('move');
            draw();
        }
    }
    
    function dropBlock() {
        if (gameOver || !currentBlock || isAnimating || isProcessingMove) return;
        const newY = currentBlock.y + 1;
        if (isValidMove(currentBlock, currentBlock.x, newY)) {
            currentBlock.y = newY;
            draw();
        } else {
            isProcessingMove = true;
            const blockToPlace = currentBlock;
            currentBlock = null;
            placeBlock(blockToPlace);
        }
    }

    // Smooth Game Loop with requestAnimationFrame
    function gameLoopStep(timestamp) {
        if (!gameOver) {
            if (!lastFallTime) lastFallTime = timestamp;
            const elapsed = timestamp - lastFallTime;

            if (!isPaused && !isTutorialOpen && elapsed > fallSpeed && !isAnimating && !isProcessingMove && currentBlock) {
                dropBlock();
                lastFallTime = timestamp;
            }

            draw();
            animFrameReq = requestAnimationFrame(gameLoopStep);
        }
    }

    // --- Tutorial Screen Management ---
    function setTutorialTab(index) {
        if (index < 0 || index >= tutorialTabs.length) return;
        currentTutorialTab = index;

        tutorialTabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        tutorialPages.forEach((page, i) => {
            page.classList.toggle('active', i === index);
        });
        tutorialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        updateTutorialButtons();
        playSound('move');
    }

    function openTutorial() {
        initAudio();
        isTutorialOpen = true;
        // Pause active gameplay if currently in progress
        const isGameActive = !gameOver && currentBlock &&
            startScreen.style.display === 'none' &&
            gameClearScreen.style.display === 'none' &&
            gameOverScreen.style.display === 'none';

        if (isGameActive) {
            isPaused = true;
        }

        setTutorialTab(0);
        tutorialScreen.style.display = 'flex';
        playSound('move');
    }

    function closeTutorial() {
        initAudio();
        isTutorialOpen = false;
        tutorialScreen.style.display = 'none';

        if (isPaused) {
            isPaused = false;
            lastFallTime = performance.now();
        }
        playSound('move');
    }

    function handleKeyPress(e) {
        initAudio();

        if (isTutorialOpen) {
            if (e.key === 'Escape') {
                closeTutorial();
            } else if (e.key === 'ArrowLeft') {
                if (currentTutorialTab > 0) setTutorialTab(currentTutorialTab - 1);
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (currentTutorialTab < tutorialTabs.length - 1) {
                    setTutorialTab(currentTutorialTab + 1);
                } else {
                    closeTutorial();
                }
            }
            return;
        }

        if (gameOver || isAnimating || isProcessingMove || isPaused) return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moveCurrentBlock(-1);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moveCurrentBlock(1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dropBlock();
                break;
        }
    }
    
    function addInitialBlocks() {
        const diffConfig = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG.normal;
        const initialCount = diffConfig.initialBlocks;
        const maxRowHeight = currentDifficulty === 'hard' ? ROWS - 7 : ROWS - 5;

        for (let attempt = 0; attempt < 10; attempt++) {
            if (attempt > 0) {
                board = createEmptyBoard();
            }

            for (let i = 0; i < initialCount; i++) {
                let placed = false;
                let placeAttempts = 0;
                while (!placed && placeAttempts < 100) {
                    const x = Math.floor(Math.random() * COLS);
                    let targetY = ROWS - 1;
                    while (targetY >= 0 && board[targetY][x] !== 0) {
                        targetY--;
                    }
                    if (targetY > maxRowHeight) {
                        board[targetY][x] = Math.floor(Math.random() * 9) + 1;
                        placed = true;
                    }
                    placeAttempts++;
                }
            }

            if (findCompletes().blocksToClear.size === 0) {
                return;
            }
        }
    }
    
    function endGame() {
        gameOver = true;
        if (animFrameReq) cancelAnimationFrame(animFrameReq);
        finalScoreOver.textContent = score;
        updateDifficultyUI();
        gameOverScreen.style.display = 'flex';
        playSound('gameover');
    }

    function startGame() {
        initAudio();
        gameOver = false;
        isProcessingMove = false;
        isAnimating = false;
        isPaused = false;
        isTutorialOpen = false;
        tutorialScreen.style.display = 'none';
        score = 0;
        particles = [];
        updateScore(0);
        
        const diffConfig = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG.normal;
        fallSpeed = diffConfig.fallSpeed;
        updateDifficultyUI();

        gameOverScreen.style.display = 'none';
        gameClearScreen.style.display = 'none';
        startScreen.style.display = 'none';
        
        board = createEmptyBoard();
        addInitialBlocks();

        currentBlock = generateBlock();
        nextBlock = generateBlock();
        
        lastFallTime = 0;
        if (animFrameReq) cancelAnimationFrame(animFrameReq);
        animFrameReq = requestAnimationFrame(gameLoopStep);
        
        draw();
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        soundBtn.style.opacity = soundEnabled ? '1.0' : '0.5';
    }

    function init() {
        window.addEventListener('resize', () => {
            setAppHeight();
            resizeCanvas();
        });
        setAppHeight();
        setTimeout(resizeCanvas, 50);

        // Touch Control handling
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let touchStartX = 0;
        let touchMoveX = 0;
        canvas.addEventListener('touchstart', (e) => {
            initAudio();
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (isTutorialOpen || isPaused || gameOver || isAnimating || e.touches.length !== 1) return;
            touchMoveX = e.touches[0].clientX;
            const diff = touchMoveX - touchStartX;
            if (Math.abs(diff) > BLOCK_SIZE * 0.8) {
                moveCurrentBlock(diff > 0 ? 1 : -1);
                touchStartX = touchMoveX;
            }
        }, { passive: true });

        // Keyboard and Buttons
        document.addEventListener('keydown', handleKeyPress);
        leftBtn.addEventListener('click', () => {
            if (isTutorialOpen || isPaused) return;
            initAudio();
            moveCurrentBlock(-1);
        });
        rightBtn.addEventListener('click', () => {
            if (isTutorialOpen || isPaused) return;
            initAudio();
            moveCurrentBlock(1);
        });
        downBtn.addEventListener('click', () => {
            if (isTutorialOpen || isPaused) return;
            initAudio();
            dropBlock();
        });
        soundBtn.addEventListener('click', toggleSound);

        // Difficulty Selection Buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                initAudio();
                const diff = e.currentTarget.getAttribute('data-diff');
                if (diff) {
                    setDifficulty(diff, true);
                }
            });
        });

        // Tutorial Event Listeners
        helpBtn.addEventListener('click', openTutorial);
        if (howToPlayBtn) howToPlayBtn.addEventListener('click', openTutorial);
        closeTutorialBtn.addEventListener('click', closeTutorial);
        tutorialScreen.addEventListener('click', (e) => {
            if (e.target === tutorialScreen) {
                closeTutorial();
            }
        });

        tutorialTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => setTutorialTab(index));
        });

        tutorialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => setTutorialTab(index));
        });

        tutPrevBtn.addEventListener('click', () => {
            if (currentTutorialTab > 0) {
                setTutorialTab(currentTutorialTab - 1);
            }
        });

        tutNextBtn.addEventListener('click', () => {
            if (currentTutorialTab < tutorialTabs.length - 1) {
                setTutorialTab(currentTutorialTab + 1);
            } else {
                closeTutorial();
            }
        });

        startBtn.addEventListener('click', startGame);
        restartBtnOver.addEventListener('click', startGame);
        restartBtnClear.addEventListener('click', startGame);

        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const nextLang = currentLang === 'ja' ? 'en' : 'ja';
                localStorage.setItem('sumris_lang', nextLang);
                applyLanguage(nextLang);
                playSound('move');
            });
        }

        applyLanguage(detectBrowserLanguage());
        updateDifficultyUI();

        draw();
    }

    init();
});

