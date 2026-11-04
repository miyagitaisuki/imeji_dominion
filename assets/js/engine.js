// Shared lesson engine for Minna no Nihongo pages.
// Started by loader.js after the lesson JSON (LESSON_CONFIG, GAME1_DATA..GAME4_DATA) is loaded.
// Do not put lesson data in this file.
        // Fisher-Yates Shuffle Algorithm
        function shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        // =====================================================================

        // ===== ENGINE (KHÓA — KHÔNG SỬA TỪ ĐÂY TRỞ XUỐNG) =====
        // Trang chủ của lớp (nút quay về ở menu bài học)
        const SITE_HOME_URL = 'https://imejiquynhon.com/';
        const KEY_HIGH = LESSON_CONFIG.storagePrefix + '_highscore';
        const KEY_MISTAKES = LESSON_CONFIG.storagePrefix + '_mistakes';
        const _memStore = {};
        function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return (k in _memStore) ? _memStore[k] : null; } }
        function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { _memStore[k] = v; } }

        // {漢字|かんじ} -> <ruby>漢字<rt>かんじ</rt></ruby>
        function furi(s) {
            return String(s == null ? '' : s).replace(/\{([^|{}]+)\|([^{}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
        }

        (function normalizeData() {
            GAME1_DATA.forEach(q => {
                q.kanji = furi(q.kanji || q.answer);
                q.distractorsKanji = q.distractors.map((d, i) => furi((q.distractorsKanji || [])[i] || d));
            });
            GAME2_DATA.forEach(q => {
                q.sentence = furi(q.sentence);
                q.options.forEach(o => { o.kanji = furi(o.kanji || o.text); });
            });
            GAME3_DATA.forEach(q => q.blocks.forEach(b => { b.kanji = furi(b.kanji || b.text); }));
            GAME4_DATA.forEach(q => {
                q.question = furi(q.question);
                q.options.forEach(o => { o.kanji = furi(o.kanji || o.text); });
            });
        })();

        // Shuffle đáp án mỗi lượt chơi (Game 1 xáo lại; Game 2 & 4 xáo và tính lại correctIndex)
        function prepareQuestion(q) {
            if (q.context) {
                q.shuffledOptions = null;
            } else if (q.sentence || q.question) {
                if (!q._baseOptions) { q._baseOptions = q.options; q._baseCorrect = q.correctIndex; }
                const correct = q._baseOptions[q._baseCorrect];
                q.options = shuffleArray(q._baseOptions);
                q.correctIndex = q.options.indexOf(correct);
            }
            return q;
        }

        // Cảnh báo lỗi dữ liệu trong Console (F12) để dễ kiểm tra
        function validateData() {
            const warn = (m) => console.warn('[DATA]', m);
            const ids = new Set();
            [...GAME1_DATA, ...GAME2_DATA, ...GAME3_DATA, ...GAME4_DATA].forEach(q => {
                if (!q.id) warn('Thiếu id');
                else if (ids.has(q.id)) warn('Trùng id: ' + q.id);
                ids.add(q.id);
                if (!['easy', 'medium', 'hard'].includes(q.level)) warn('level sai: ' + q.id);
                const e = q.explanation || {};
                if (!e.correct || !e.pitfalls || !e.tip) warn('Thiếu explanation.correct/pitfalls/tip: ' + q.id);
            });
            GAME1_DATA.forEach(q => { if (!q.distractors || q.distractors.length !== 3) warn('Game1 cần đúng 3 distractors: ' + q.id); });
            GAME2_DATA.forEach(q => {
                if (!/＿/.test(q.sentence)) warn('Game2 thiếu chỗ trống ＿: ' + q.id);
                if (!q.options[q.correctIndex]) warn('Game2 correctIndex sai: ' + q.id);
            });
            GAME3_DATA.forEach(q => {
                const texts = q.blocks.map(b => b.text);
                q.acceptableOrders.forEach(o => o.forEach(t => { if (!texts.includes(t)) warn('Game3 acceptableOrders có khối không tồn tại "' + t + '": ' + q.id); }));
            });
            GAME4_DATA.forEach(q => { if (!q.options[q.correctIndex]) warn('Game4 correctIndex sai: ' + q.id); });
        }

        // State object
        let gameState = {
            currentGame: 0,
            sessionKind: 'game', // 'game' | 'practice'
            questionCount: 5,
            difficultyFilter: 'all', // 'all', 'easy', 'medium', 'hard' (Feature 8)
            questions: [],
            currentIndex: 0,
            score: 0,
            correctCount: 0,
            streak: 0,
            maxStreak: 0,
            hearts: 5,
            wrongAnswers: [], // Stores wrong items in current session
            soundEnabled: true,
            selectedOptionIndex: null,
            dragSelectedBlocks: [],
            dragPoolBlocks: [],
            isAnswerChecked: false
        };

        // Web Audio Synthesizer
        let audioCtx = null;
        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playSound(type) {
            if (!gameState.soundEnabled) return;
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'correct') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'wrong') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.25);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(450, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            }
        }

        function toggleSound() {
            gameState.soundEnabled = !gameState.soundEnabled;
            document.getElementById('btn-sound').innerText = gameState.soundEnabled ? '🔊' : '🔇';
        }

        function speakJapanese(rawText) {
            if ('speechSynthesis' in window && rawText) {
                window.speechSynthesis.cancel();
                const cleanText = rawText.replace(/<[^>]*>/g, '').replace(/^[0-9]\.\s*/, '').trim();
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            }
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').innerText = message;
            toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
            toast.classList.add('opacity-100', 'translate-y-0', 'anim-shake');

            setTimeout(() => {
                toast.classList.remove('opacity-100', 'translate-y-0', 'anim-shake');
                toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
            }, 2000);
        }

        // Feature 9: Track mistakes in localStorage
        function recordMistake(question) {
            try {
                const mistakes = JSON.parse(safeGet(KEY_MISTAKES) || '{}');
                const key = question.id || question.answer || question.sentence;
                mistakes[key] = (mistakes[key] || 0) + 1;
                safeSet(KEY_MISTAKES, JSON.stringify(mistakes));
            } catch (e) { console.error("Error saving mistakes", e); }
        }

        function getMistakesCount() {
            try {
                const mistakes = JSON.parse(safeGet(KEY_MISTAKES) || '{}');
                return Object.keys(mistakes).length;
            } catch (e) { return 0; }
        }

        function startLesson() {
            document.title = `${LESSON_CONFIG.title} | Luyện tập IMEJI日本語教室`;
            const jl = document.getElementById('modal-jlpt');
            if (jl) jl.innerText = LESSON_CONFIG.jlpt;
            validateData();
            showMainMenu();
        }
        // loader.js injects this file after the window load event may already have fired
        if (document.readyState === 'complete') startLesson();
        else window.addEventListener('load', startLesson);

        // 11. Menu Card phân màu rõ ràng & Hệ thống lọc độ khó (Feature 8 & 11)
        function showMainMenu() {
            document.getElementById('top-bar').classList.add('hidden');
            document.getElementById('bottom-bar').classList.add('hidden');
            document.getElementById('hearts-modal').classList.add('hidden');

            const container = document.getElementById('game-container');
            const highScore = safeGet(KEY_HIGH) || 0;
            const mistakesCount = getMistakesCount();

            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-4xl py-4 px-2">
                    <!-- Điều hướng ra ngoài bài học -->
                    <nav class="w-full flex flex-wrap items-center justify-between gap-2 mb-4 select-none" aria-label="Điều hướng">
                        <a href="../index.html" class="btn-3d btn-gray inline-flex items-center gap-1.5 text-xs md:text-sm font-black px-3.5 py-2 rounded-xl">← Danh sách bài</a>
                        <a href="${SITE_HOME_URL}" class="btn-3d btn-blue inline-flex items-center gap-1.5 text-xs md:text-sm font-black px-3.5 py-2 rounded-xl">🏠 Trang chủ IMEJI日本語教室</a>
                    </nav>
                    <!-- Title Header -->
                    <div class="text-center mb-6">
                        <span class="inline-block bg-primary-100 text-primary-800 font-extrabold px-4 py-1 rounded-full text-xs md:text-sm mb-2 border border-primary-300 select-none">
                            IMEJI日本語教室 ・ Lớp học tiếng Nhật thầy Quang
                        </span>
                        <h1 class="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
                            ${LESSON_CONFIG.title}
                        </h1>
                        <p class="text-sm md:text-base font-bold text-slate-500">ThS. Nguyễn Thanh Quang ・ Giảng viên Trường Đại học Quy Nhơn (QNU) ・ JLPT N1 Holder</p>
                    </div>

                    <!-- 8. Control Bar: Số câu & Bộ lọc độ khó thực sự -->
                    <div class="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 w-full select-none">
                        <!-- Số câu -->
                        <div class="flex items-center gap-2">
                            <span class="text-xs md:text-sm font-extrabold text-slate-600">Số câu:</span>
                            <button onclick="setQuestionCount(5)" class="btn-3d text-xs md:text-sm font-black px-3.5 py-1.5 rounded-xl ${gameState.questionCount === 5 ? 'btn-green' : 'btn-gray'}">
                                5 Câu
                            </button>
                            <button onclick="setQuestionCount(10)" class="btn-3d text-xs md:text-sm font-black px-3.5 py-1.5 rounded-xl ${gameState.questionCount === 10 ? 'btn-green' : 'btn-gray'}">
                                10 Câu
                            </button>
                        </div>

                        <!-- Lọc độ khó (Feature 8) -->
                        <div class="flex items-center gap-1.5">
                            <span class="text-xs md:text-sm font-extrabold text-slate-600">Độ khó:</span>
                            <button onclick="setDifficulty('all')" class="btn-3d text-xs font-black px-2.5 py-1.5 rounded-xl ${gameState.difficultyFilter === 'all' ? 'btn-blue' : 'btn-gray'}">Tất cả</button>
                            <button onclick="setDifficulty('easy')" class="btn-3d text-xs font-black px-2.5 py-1.5 rounded-xl ${gameState.difficultyFilter === 'easy' ? 'btn-green' : 'btn-gray'}">🟢 Dễ</button>
                            <button onclick="setDifficulty('medium')" class="btn-3d text-xs font-black px-2.5 py-1.5 rounded-xl ${gameState.difficultyFilter === 'medium' ? 'btn-amber' : 'btn-gray'}">🟡 Vừa</button>
                            <button onclick="setDifficulty('hard')" class="btn-3d text-xs font-black px-2.5 py-1.5 rounded-xl ${gameState.difficultyFilter === 'hard' ? 'btn-purple' : 'btn-gray'}">🔴 Khó</button>
                        </div>

                        <div class="text-xs md:text-sm font-black text-warning-600 flex items-center gap-1">
                            🏆 Cao nhất: <span>${highScore}</span>
                        </div>
                    </div>

                    <!-- 11. Menu Cards với màu chủ đề riêng biệt -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <!-- Game 1: Từ Vựng (Xanh lá) -->
                        <div onclick="startGame(1)" class="btn-3d bg-success-50 hover:bg-success-100 border-2 border-success-300 border-b-4 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left transition-colors">
                            <div class="text-3xl md:text-4xl bg-success-200 text-success-800 p-3 rounded-2xl select-none">🏷️</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black text-success-950">Từ Vựng</h3>
                                    <span class="text-xs bg-success-200 text-success-800 px-2 py-0.5 rounded font-black">G1</span>
                                </div>
                                <p class="text-xs md:text-sm text-success-800 font-semibold mt-0.5">Chọn từ đúng theo ngữ cảnh tiếng Việt</p>
                            </div>
                        </div>

                        <!-- Game 2: Ngữ Pháp (Xanh dương) -->
                        <div onclick="startGame(2)" class="btn-3d bg-primary-50 hover:bg-primary-100 border-2 border-primary-300 border-b-4 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left transition-colors">
                            <div class="text-3xl md:text-4xl bg-primary-200 text-primary-800 p-3 rounded-2xl select-none">✏️</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black text-primary-950">Ngữ Pháp</h3>
                                    <span class="text-xs bg-primary-200 text-primary-800 px-2 py-0.5 rounded font-black">G2</span>
                                </div>
                                <p class="text-xs md:text-sm text-primary-800 font-semibold mt-0.5">Điền trợ từ / động từ vào chỗ trống</p>
                            </div>
                        </div>

                        <!-- Game 3: Xếp Câu (Tím) -->
                        <div onclick="startGame(3)" class="btn-3d bg-accent-50 hover:bg-accent-100 border-2 border-accent-300 border-b-4 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left transition-colors">
                            <div class="text-3xl md:text-4xl bg-accent-200 text-accent-800 p-3 rounded-2xl select-none">🧩</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black text-accent-950">Xếp Câu</h3>
                                    <span class="text-xs bg-accent-200 text-accent-800 px-2 py-0.5 rounded font-black">G3</span>
                                </div>
                                <p class="text-xs md:text-sm text-accent-800 font-semibold mt-0.5">Sắp xếp các khối từ thành câu chuẩn</p>
                            </div>
                        </div>

                        <!-- Game 4: Hội Thoại (Cam) -->
                        <div onclick="startGame(4)" class="btn-3d bg-warning-50 hover:bg-warning-100 border-2 border-warning-300 border-b-4 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left transition-colors">
                            <div class="text-3xl md:text-4xl bg-warning-200 text-warning-800 p-3 rounded-2xl select-none">🗣️</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black text-warning-950">Hội Thoại</h3>
                                    <span class="text-xs bg-warning-200 text-warning-800 px-2 py-0.5 rounded font-black">G4</span>
                                </div>
                                <p class="text-xs md:text-sm text-warning-800 font-semibold mt-0.5">Chọn câu phản hồi tự nhiên nhất</p>
                            </div>
                        </div>

                        <!-- Feature 9: Ôn Từ Hay Sai (Đỏ Hồng) -->
                        <div onclick="startWeakPointsPractice()" class="btn-3d bg-danger-50 hover:bg-danger-100 border-2 border-danger-300 border-b-4 p-4 md:p-5 rounded-2xl flex items-center gap-4 text-left sm:col-span-2 transition-colors">
                            <div class="text-3xl md:text-4xl bg-danger-200 text-danger-800 p-3 rounded-2xl select-none">📚</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-black text-danger-950">📚 Ôn Từ Hay Sai</h3>
                                    <span class="text-xs bg-danger-200 text-danger-900 px-2.5 py-0.5 rounded-full font-black">${mistakesCount} mục cần chú ý</span>
                                </div>
                                <p class="text-xs md:text-sm text-danger-800 font-semibold mt-0.5">Tự động tổng hợp những câu bạn từng làm sai nhiều lần</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function setQuestionCount(count) {
            playSound('click');
            gameState.questionCount = count;
            showMainMenu();
        }

        function setDifficulty(diff) {
            playSound('click');
            gameState.difficultyFilter = diff;
            showMainMenu();
        }

        function retryCurrentGame() {
            document.getElementById('hearts-modal').classList.add('hidden');
            startGame(gameState.currentGame);
        }

        function practiceCurrentWrongList() {
            document.getElementById('hearts-modal').classList.add('hidden');
            if (gameState.wrongAnswers.length > 0) {
                startCustomSession(gameState.wrongAnswers);
            } else {
                showMainMenu();
            }
        }

        // Start weak points practice from localStorage (Feature 9)
        function startWeakPointsPractice() {
            try {
                const mistakes = JSON.parse(safeGet(KEY_MISTAKES) || '{}');
                const wrongKeys = Object.keys(mistakes);

                if (wrongKeys.length === 0) {
                    showToast("Bạn chưa có từ hay sai nào! Hãy làm bài luyện tập nhé.");
                    return;
                }

                // Gather all questions matching wrong keys
                const allQuestions = [...GAME1_DATA, ...GAME2_DATA, ...GAME3_DATA, ...GAME4_DATA];
                const matchedQuestions = allQuestions.filter(q => wrongKeys.includes(q.id || q.answer || q.sentence));

                if (matchedQuestions.length === 0) {
                    showToast("Chưa có đủ dữ liệu từ hay sai.");
                    return;
                }

                startCustomSession(matchedQuestions);
            } catch (e) {
                showToast("Chưa thể tải danh sách câu sai.");
            }
        }

        function startCustomSession(customList) {
            playSound('click');
            gameState.currentGame = 1; // Default layout
            gameState.sessionKind = 'practice'; // ôn lại câu sai / điểm yếu
            gameState.currentIndex = 0;
            gameState.score = 0;
            gameState.correctCount = 0;
            gameState.streak = 0;
            gameState.maxStreak = 0;
            gameState.hearts = 5;
            gameState.wrongAnswers = [];

            gameState.questions = shuffleArray(customList).slice(0, gameState.questionCount).map(prepareQuestion);

            document.getElementById('top-bar').classList.remove('hidden');
            document.getElementById('bottom-bar').classList.remove('hidden');

            updateHeaderStats();
            renderQuestion();
        }

        function startGame(gameId) {
            playSound('click');
            gameState.currentGame = gameId;
            gameState.sessionKind = 'game';
            gameState.currentIndex = 0;
            gameState.score = 0;
            gameState.correctCount = 0;
            gameState.streak = 0;
            gameState.maxStreak = 0;
            gameState.hearts = 5;
            gameState.wrongAnswers = [];

            let rawData = [];
            if (gameId === 1) rawData = GAME1_DATA;
            else if (gameId === 2) rawData = GAME2_DATA;
            else if (gameId === 3) rawData = GAME3_DATA;
            else if (gameId === 4) rawData = GAME4_DATA;

            // Apply difficulty filter (Feature 8)
            let filtered = rawData;
            if (gameState.difficultyFilter !== 'all') {
                filtered = rawData.filter(q => q.level === gameState.difficultyFilter);
                if (filtered.length === 0) filtered = rawData; // Fallback if empty
            }

            const shuffled = shuffleArray(filtered);
            gameState.questions = shuffled.slice(0, Math.min(gameState.questionCount, shuffled.length)).map(prepareQuestion);

            document.getElementById('top-bar').classList.remove('hidden');
            document.getElementById('bottom-bar').classList.remove('hidden');

            updateHeaderStats();
            renderQuestion();
        }

        // Feature 1: Near completion effect (> 80% progress) & Header Updates
        function updateHeaderStats() {
            const currentNum = gameState.currentIndex + 1;
            const totalNum = gameState.questions.length;
            const progress = (gameState.currentIndex / totalNum) * 100;

            const progressInner = document.getElementById('progress-inner');
            const progressText = document.getElementById('progress-text');

            progressInner.style.width = `${progress}%`;

            // Feature 1: Progress > 80% effect
            if (progress >= 80) {
                progressInner.className = "h-full rounded-full transition-all duration-300 progress-near-finish";
                progressText.innerHTML = `Câu ${currentNum} / ${totalNum} <span class="text-warning-500 font-black animate-pulse">🔥 Sắp hoàn thành!</span>`;
            } else {
                progressInner.className = "bg-success-500 h-full rounded-full transition-all duration-300";
                progressText.innerText = `Câu ${currentNum} / ${totalNum}`;
            }

            document.getElementById('stat-streak').innerText = gameState.streak;
            document.getElementById('stat-hearts').innerText = gameState.hearts;
            document.getElementById('stat-score').innerText = gameState.score;
        }

        function setCheckButtonState(enabled) {
            const btn = document.getElementById('btn-action');
            btn.disabled = !enabled;
        }

        function resetBottomBar() {
            const bar = document.getElementById('bottom-bar');
            bar.className = "border-t-2 border-slate-200 px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors duration-300 bg-white shrink-0";
            
            document.getElementById('feedback-icon').classList.add('hidden');
            document.getElementById('feedback-title').innerText = '';
            document.getElementById('feedback-diff').innerText = '';
            document.getElementById('explanation-wrapper').classList.add('hidden');
            document.getElementById('feedback-explanation').classList.add('hidden');
            document.getElementById('exp-arrow').innerText = "▼";
            
            const btnAction = document.getElementById('btn-action');
            btnAction.innerText = "KIỂM TRA";
            btnAction.className = "btn-3d btn-green text-lg md:text-xl px-8 py-3.5 rounded-2xl uppercase tracking-wider font-extrabold shadow-md w-full md:w-auto ml-auto";
            btnAction.onclick = handleActionButton;
            
            gameState.isAnswerChecked = false;
            setCheckButtonState(false);
        }

        // 5. Toggle expandable explanation
        function toggleExplanationDetails() {
            const exp = document.getElementById('feedback-explanation');
            const arrow = document.getElementById('exp-arrow');
            if (exp.classList.contains('hidden')) {
                exp.classList.remove('hidden');
                arrow.innerText = "▲";
            } else {
                exp.classList.add('hidden');
                arrow.innerText = "▼";
            }
        }

        function renderQuestion() {
            resetBottomBar();
            gameState.selectedOptionIndex = null;
            gameState.dragSelectedBlocks = [];
            gameState.dragPoolBlocks = [];

            const q = gameState.questions[gameState.currentIndex];
            const container = document.getElementById('game-container');

            // Level badge
            const levelBadge = document.getElementById('level-badge');
            const levelText = (q.level || "easy").toUpperCase();
            levelBadge.innerText = levelText;
            levelBadge.className = q.level === 'hard' ? "bg-accent-100 text-accent-700 px-2 py-0.5 rounded-md text-xs uppercase font-black" :
                                   q.level === 'medium' ? "bg-warning-100 text-warning-700 px-2 py-0.5 rounded-md text-xs uppercase font-black" :
                                   "bg-success-100 text-success-700 px-2 py-0.5 rounded-md text-xs uppercase font-black";

            if (q.context) renderGame1(q, container);
            else if (q.sentence) renderGame2(q, container);
            else if (q.acceptableOrders) {
                gameState.dragPoolBlocks = shuffleArray(q.blocks);
                gameState.dragSelectedBlocks = [];
                renderGame3(q, container);
            }
            else if (q.question) renderGame4(q, container);
        }

        // Game 1: Context -> Vocabulary
        function renderGame1(q, container) {
            if (!q.shuffledOptions || q.shuffledOptions.length === 0) {
                const options = [
                    { kana: q.answer, kanji: q.kanji, isCorrect: true },
                    ...q.distractors.map((d, idx) => ({ kana: d, kanji: q.distractorsKanji[idx], isCorrect: false }))
                ];
                q.shuffledOptions = shuffleArray(options);
            }

            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-2xl">
                    <h2 class="text-xs md:text-sm font-extrabold text-slate-400 mb-2 uppercase tracking-wider">Chọn đáp án đúng</h2>
                    
                    <div class="bg-success-50 border-2 border-success-200 p-5 md:p-6 rounded-2xl mb-5 w-full text-center shadow-inner">
                        <p class="text-lg md:text-2xl font-extrabold text-success-950">"${q.context}"</p>
                    </div>

                    <!-- 2x2 Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                        ${q.shuffledOptions.map((opt, idx) => `
                            <button id="opt-${idx}" onclick="selectGame1Option(${idx})" class="btn-3d btn-gray p-4 md:p-5 rounded-2xl flex flex-col items-center justify-center text-center border-2 min-h-[90px]">
                                <div class="jp-text-lg">${opt.kanji}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function selectGame1Option(idx) {
            if (gameState.isAnswerChecked) return;
            playSound('click');
            gameState.selectedOptionIndex = idx;
            const q = gameState.questions[gameState.currentIndex];
            
            q.shuffledOptions.forEach((_, i) => {
                const btn = document.getElementById(`opt-${i}`);
                if (i === idx) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });

            setCheckButtonState(true);
            speakJapanese(q.shuffledOptions[idx].kana);
        }

        // 4. Game 2: Grid cols 1 on mobile, 2 on sm screen (giúp từ dài không bị bí chữ)
        function renderGame2(q, container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-2xl">
                    <h2 class="text-xs md:text-sm font-extrabold text-slate-400 mb-3 uppercase tracking-wider">Điền từ vào chỗ trống</h2>

                    <div class="bg-slate-50 border-2 border-slate-200 p-5 md:p-6 rounded-2xl mb-5 w-full text-center shadow-sm">
                        <div id="sentence-display" class="jp-text-xl text-slate-800 leading-relaxed mb-3">
                            ${q.sentence.replace(/＿+/, '<span id="blank-slot" class="inline-block border-b-4 border-success-500 min-w-[90px] px-2 text-success-600 font-extrabold">＿＿＿</span>')}
                        </div>

                        <div>
                            <button onclick="toggleTranslation()" class="text-xs md:text-sm text-slate-500 underline font-bold hover:text-slate-700 select-none">
                                👁️ <span id="trans-toggle-text">Hiện bản dịch</span>
                            </button>
                            <p id="sentence-translation" class="text-base text-slate-600 font-bold mt-2 hidden italic">"${q.translation}"</p>
                        </div>
                    </div>

                    <!-- 4. grid-cols-1 sm:grid-cols-2 chống tràn chữ trên 360px -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        ${q.options.map((opt, idx) => `
                            <button id="opt-${idx}" onclick="selectGame2Option(${idx})" class="btn-3d btn-gray p-3.5 rounded-2xl flex items-center justify-between border-2 min-h-[64px]">
                                <span class="bg-slate-100 text-slate-500 rounded-lg px-2 py-1 font-black text-xs">${idx + 1}</span>
                                <span class="jp-text-lg font-bold text-center flex-1">${opt.kanji}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function toggleTranslation() {
            const transEl = document.getElementById('sentence-translation');
            const toggleText = document.getElementById('trans-toggle-text');
            if (transEl.classList.contains('hidden')) {
                transEl.classList.remove('hidden');
                toggleText.innerText = "Ẩn bản dịch";
            } else {
                transEl.classList.add('hidden');
                toggleText.innerText = "Hiện bản dịch";
            }
        }

        function selectGame2Option(idx) {
            if (gameState.isAnswerChecked) return;
            playSound('click');
            gameState.selectedOptionIndex = idx;
            const q = gameState.questions[gameState.currentIndex];
            
            q.options.forEach((_, i) => {
                const btn = document.getElementById(`opt-${i}`);
                if (i === idx) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });

            const blankSlot = document.getElementById('blank-slot');
            blankSlot.innerHTML = q.options[idx].kanji;
            setCheckButtonState(true);
            speakJapanese(q.options[idx].text);
        }

        // Game 3: Sentence Reordering
        function renderGame3(q, container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-2xl">
                    <h2 class="text-xs md:text-sm font-extrabold text-slate-400 mb-2 uppercase tracking-wider">Sắp xếp các khối từ</h2>

                    <div class="bg-accent-50 border-2 border-accent-200 p-4 rounded-2xl mb-5 w-full text-center">
                        <p class="text-base md:text-xl font-extrabold text-accent-950">"${q.vietnamese}"</p>
                    </div>

                    <!-- Drop zone -->
                    <div class="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 min-h-[90px] mb-5 flex flex-wrap items-center gap-2.5 justify-center shadow-inner">
                        ${gameState.dragSelectedBlocks.length === 0 ? '<span class="text-xs md:text-sm font-bold text-slate-400 select-none">Chạm các khối từ ở dưới để chọn...</span>' : ''}
                        ${gameState.dragSelectedBlocks.map((blk, idx) => `
                            <button onclick="removeBlockFromAnswer(${idx})" class="btn-3d btn-gray bg-white px-3.5 py-2 rounded-xl border-2 border-slate-300 flex items-center anim-pop">
                                <span class="jp-text-lg font-bold">${blk.kanji}</span>
                            </button>
                        `).join('')}
                    </div>

                    <!-- Pool -->
                    <div class="w-full bg-slate-100 p-4 rounded-2xl flex flex-wrap items-center gap-2.5 justify-center border border-slate-200">
                        ${gameState.dragPoolBlocks.map((blk, idx) => `
                            <button onclick="addBlockToAnswer(${idx})" class="btn-3d btn-gray bg-white px-4 py-2.5 rounded-xl border-2 border-slate-300 shadow-sm">
                                <span class="jp-text-lg font-bold">${blk.kanji}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function addBlockToAnswer(poolIdx) {
            if (gameState.isAnswerChecked) return;
            playSound('click');
            const blk = gameState.dragPoolBlocks.splice(poolIdx, 1)[0];
            gameState.dragSelectedBlocks.push(blk);
            speakJapanese(blk.text);
            
            setCheckButtonState(gameState.dragSelectedBlocks.length > 0);
            renderGame3(gameState.questions[gameState.currentIndex], document.getElementById('game-container'));
        }

        function removeBlockFromAnswer(selectedIdx) {
            if (gameState.isAnswerChecked) return;
            playSound('click');
            const blk = gameState.dragSelectedBlocks.splice(selectedIdx, 1)[0];
            gameState.dragPoolBlocks.push(blk);
            
            setCheckButtonState(gameState.dragSelectedBlocks.length > 0);
            renderGame3(gameState.questions[gameState.currentIndex], document.getElementById('game-container'));
        }

        // Game 4: Conversation Response (Touch target 48px - Feature 6)
        function renderGame4(q, container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-2xl">
                    <h2 class="text-xs md:text-sm font-extrabold text-slate-400 mb-3 uppercase tracking-wider">Chọn câu phản hồi đúng</h2>

                    <div class="flex items-center gap-3 mb-5 w-full">
                        <div class="text-3xl bg-warning-100 p-3 rounded-2xl border border-warning-300 select-none shrink-0">${q.speaker.split(' ')[0]}</div>
                        <div class="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl rounded-tl-none flex-1 flex items-center justify-between shadow-sm">
                            <div class="jp-text-lg text-slate-800 font-black">${q.question}</div>
                            <!-- 6. Nút nghe touch target min-w 44px -->
                            <button onclick="speakJapanese('${q.questionAudioText}')" aria-label="Phát âm thanh" class="btn-3d btn-amber min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-lg ml-2 flex items-center justify-center shrink-0 select-none">
                                🔊
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3 w-full">
                        ${q.options.map((opt, idx) => `
                            <button id="opt-${idx}" onclick="selectGame4Option(${idx})" class="btn-3d btn-gray p-3.5 rounded-2xl flex items-center text-left border-2 min-h-[60px]">
                                <span class="jp-text-lg font-bold text-slate-800">${idx + 1}. ${opt.kanji}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            setTimeout(() => speakJapanese(q.questionAudioText), 200);
        }

        function selectGame4Option(idx) {
            if (gameState.isAnswerChecked) return;
            playSound('click');
            gameState.selectedOptionIndex = idx;
            const q = gameState.questions[gameState.currentIndex];
            
            q.options.forEach((_, i) => {
                const btn = document.getElementById(`opt-${i}`);
                if (i === idx) btn.classList.add('selected');
                else btn.classList.remove('selected');
            });

            setCheckButtonState(true);
            speakJapanese(q.options[idx].text);
        }

        // Action button handler
        function handleActionButton() {
            const q = gameState.questions[gameState.currentIndex];

            if (!gameState.isAnswerChecked) {
                // Check answer logic
                let isCorrect = false;

                if (q.context) {
                    if (gameState.selectedOptionIndex === null) { showToast("Vui lòng chọn một đáp án!"); return; }
                    isCorrect = q.shuffledOptions[gameState.selectedOptionIndex].isCorrect;
                } else if (q.sentence) {
                    if (gameState.selectedOptionIndex === null) { showToast("Vui lòng chọn một đáp án!"); return; }
                    isCorrect = (gameState.selectedOptionIndex === q.correctIndex);
                } else if (q.acceptableOrders) {
                    if (gameState.dragSelectedBlocks.length === 0) { showToast("Vui lòng chọn các khối từ!"); return; }
                    const userOrder = gameState.dragSelectedBlocks.map(b => b.text);
                    isCorrect = q.acceptableOrders.some(acc => JSON.stringify(acc) === JSON.stringify(userOrder));
                } else if (q.question) {
                    if (gameState.selectedOptionIndex === null) { showToast("Vui lòng chọn phản hồi!"); return; }
                    isCorrect = (gameState.selectedOptionIndex === q.correctIndex);
                }

                gameState.isAnswerChecked = true;

                // Show Footer Feedback
                const bar = document.getElementById('bottom-bar');
                const icon = document.getElementById('feedback-icon');
                const title = document.getElementById('feedback-title');
                const diff = document.getElementById('feedback-diff');
                const expWrapper = document.getElementById('explanation-wrapper');
                const exp = document.getElementById('feedback-explanation');
                const btnAction = document.getElementById('btn-action');

                icon.classList.remove('hidden');
                expWrapper.classList.remove('hidden');

                if (isCorrect) {
                    playSound('correct');
                    gameState.score += 20;
                    gameState.correctCount += 1;
                    gameState.streak += 1;
                    gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);

                    bar.className = "border-t-2 border-success-300 bg-success-100 px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0";
                    icon.innerText = "✅";
                    title.innerText = "Chính xác!";
                    title.className = "text-lg md:text-xl font-black text-success-800";
                    diff.innerText = "";

                    exp.innerHTML = `
                        <p class="text-success-900 font-bold mb-1">💡 ${q.explanation.correct}</p>
                        <p class="text-success-800">📌 ${q.explanation.tip}</p>
                    `;

                    btnAction.innerText = "TIẾP TỤC";
                    btnAction.className = "btn-3d btn-green text-lg md:text-xl px-8 py-3.5 rounded-2xl uppercase tracking-wider font-extrabold shadow-md w-full md:w-auto ml-auto";
                } else {
                    playSound('wrong');
                    gameState.streak = 0;
                    gameState.hearts -= 1;
                    
                    // Track mistake (Feature 9)
                    recordMistake(q);
                    if (!gameState.wrongAnswers.includes(q)) {
                        gameState.wrongAnswers.push(q);
                    }

                    bar.className = "border-t-2 border-danger-300 bg-danger-100 px-4 md:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0";
                    icon.innerText = "❌";
                    title.innerText = "Chưa chính xác";
                    title.className = "text-lg md:text-xl font-black text-danger-800";

                    let correctAnswerText = "";
                    if (q.context) correctAnswerText = q.kanji;
                    else if (q.sentence) correctAnswerText = q.options[q.correctIndex].kanji;
                    else if (q.acceptableOrders) correctAnswerText = q.acceptableOrders[0].join(" ");
                    else if (q.question) correctAnswerText = q.options[q.correctIndex].kanji;

                    diff.innerHTML = `<span class="text-danger-900">Đáp án đúng:</span> <span class="font-extrabold text-success-800">${correctAnswerText}</span>`;

                    // 7. Flashcard sau câu sai
                    exp.innerHTML = `
                        <div class="mb-2 p-2 bg-white rounded-lg border border-danger-200">
                            <p class="text-xs font-black text-danger-600 uppercase mb-0.5">📌 Từ/Cấu trúc cần nhớ hôm nay:</p>
                            <div class="jp-text-lg font-bold text-slate-800">${q.kanji || q.sentence || correctAnswerText}</div>
                        </div>
                        <p class="text-danger-900 font-bold mb-1">💡 ${q.explanation.correct}</p>
                        <p class="text-danger-800">⚠️ ${q.explanation.pitfalls}</p>
                    `;

                    btnAction.innerText = "ĐÃ HỌC ĐƯỢC";
                    btnAction.className = "btn-3d btn-amber text-lg md:text-xl px-8 py-3.5 rounded-2xl uppercase tracking-wider font-extrabold shadow-md w-full md:w-auto ml-auto";
                }

                updateHeaderStats();

                // Check heart game over
                if (gameState.hearts <= 0) {
                    setTimeout(() => {
                        const reviewBtn = document.getElementById('btn-modal-review');
                        if (gameState.wrongAnswers.length > 0) reviewBtn.classList.remove('hidden');
                        else reviewBtn.classList.add('hidden');

                        document.getElementById('hearts-modal').classList.remove('hidden');
                    }, 800);
                }

            } else {
                // Next question
                gameState.currentIndex += 1;
                if (gameState.currentIndex < gameState.questions.length) {
                    renderQuestion();
                    updateHeaderStats();
                } else {
                    renderSummaryScreen();
                }
            }
        }

        // 3. Màn hình Kết Quả có "Tỷ lệ chính xác"
        // Báo kết quả một lượt chơi ra bên ngoài để có thể ghi điểm (VD eduscan nhúng bài học bằng iframe).
        // - CustomEvent 'mnn:lesson-complete' trên window (trang tự lắng nghe)
        // - window.parent.postMessage khi được nhúng trong iframe
        // Chỉ gồm số liệu bài làm, không có thông tin cá nhân. Bên nhận phải kiểm tra event.origin.
        function reportLessonResult({ total, accuracy }) {
            const detail = {
                type: 'mnn:lesson-complete',
                lessonNo: LESSON_CONFIG.lessonNo,
                jlpt: LESSON_CONFIG.jlpt,
                storagePrefix: LESSON_CONFIG.storagePrefix,
                game: gameState.currentGame,
                practice: gameState.sessionKind === 'practice',
                difficulty: gameState.difficultyFilter,
                total,
                correct: gameState.correctCount,
                accuracy,
                score: gameState.score,
                maxStreak: gameState.maxStreak,
                finishedAt: new Date().toISOString()
            };
            try {
                window.dispatchEvent(new CustomEvent('mnn:lesson-complete', { detail }));
                if (window.parent && window.parent !== window) window.parent.postMessage(detail, '*');
            } catch (e) {
                console.warn('[result] Không gửi được kết quả:', e);
            }
        }

        function renderSummaryScreen() {
            document.getElementById('top-bar').classList.add('hidden');
            document.getElementById('bottom-bar').classList.add('hidden');

            const container = document.getElementById('game-container');
            const total = gameState.questions.length;
            const accuracy = total > 0 ? Math.round((gameState.correctCount / total) * 100) : 0;

            // Update Highscore
            const currentHigh = parseInt(safeGet(KEY_HIGH) || '0');
            if (gameState.score > currentHigh) {
                safeSet(KEY_HIGH, gameState.score.toString());
            }

            reportLessonResult({ total, accuracy });

            container.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full max-w-xl py-6 px-4 text-center anim-pop">
                    <div class="text-6xl md:text-7xl mb-3">🎉</div>
                    <h1 class="text-3xl md:text-4xl font-black text-slate-800 mb-1">Hoàn Thành Bài Tập!</h1>
                    <p class="text-base md:text-lg font-bold text-slate-500 mb-6">Bạn đã thể hiện rất tuyệt vời hôm nay!</p>

                    <!-- Stats Grid 4 Ô (Feature 3) -->
                    <div class="grid grid-cols-2 gap-3.5 w-full mb-6">
                        <!-- Score -->
                        <div class="bg-warning-50 border-2 border-warning-200 p-4 rounded-2xl flex flex-col items-center">
                            <span class="text-xs font-black text-warning-600 uppercase mb-1">Điểm Số</span>
                            <span class="text-3xl md:text-4xl font-black text-warning-600">⭐ ${gameState.score}</span>
                        </div>

                        <!-- Correct -->
                        <div class="bg-success-50 border-2 border-success-200 p-4 rounded-2xl flex flex-col items-center">
                            <span class="text-xs font-black text-success-600 uppercase mb-1">Đúng</span>
                            <span class="text-3xl md:text-4xl font-black text-success-600">✅ ${gameState.correctCount}/${total}</span>
                        </div>

                        <!-- Feature 3: Độ Chính Xác -->
                        <div class="bg-primary-50 border-2 border-primary-200 p-4 rounded-2xl flex flex-col items-center">
                            <span class="text-xs font-black text-primary-600 uppercase mb-1">Độ Chính Xác</span>
                            <span class="text-3xl md:text-4xl font-black text-primary-600">🎯 ${accuracy}%</span>
                        </div>

                        <!-- Streak -->
                        <div class="bg-warning-50 border-2 border-warning-200 p-4 rounded-2xl flex flex-col items-center">
                            <span class="text-xs font-black text-warning-600 uppercase mb-1">Chuỗi Cao Nhất</span>
                            <span class="text-3xl md:text-4xl font-black text-warning-600">🔥 ${gameState.maxStreak}</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col gap-3 w-full">
                        ${gameState.wrongAnswers.length > 0 ? `
                            <button onclick="practiceCurrentWrongList()" class="btn-3d btn-purple py-3.5 rounded-2xl font-black text-lg uppercase tracking-wider">
                                📌 Ôn lại câu làm sai (${gameState.wrongAnswers.length})
                            </button>
                        ` : ''}
                        <button onclick="startGame(gameState.currentGame)" class="btn-3d btn-green py-3.5 rounded-2xl font-black text-lg uppercase tracking-wider">
                            🔄 Luyện Lại Lượt Mới
                        </button>
                        <button onclick="showMainMenu()" class="btn-3d btn-gray py-3.5 rounded-2xl font-black text-lg text-slate-700">
                            🏠 Về Menu Chính
                        </button>
                    </div>
                </div>
            `;
        }
