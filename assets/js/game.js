// ============================================================
// Macaron Game Engine - Lazy-loaded by router.js
// Exposes: window.initBlogGame(container, gameId)
// Modes: 1) Fixed pattern  2) Custom pattern
// ============================================================

(function() {
    // --------------------------------------------------------
    // Constants
    // --------------------------------------------------------
    const FIXED_TARGET = [0, 0, 1, 0, 0, 0, 1, 0, 1]; // Right-top, left-bottom, right-bottom pink

    // --------------------------------------------------------
    // Game state
    // --------------------------------------------------------
    const gameState = {
        mode: null,                 // 'fixed' | 'custom'
        target: FIXED_TARGET,       // current target pattern
        grid: Array(9).fill(0),
        moves: 0,
        startTime: null,
        timer: null,
        seconds: 0,
        isPlaying: true
    };

    // --------------------------------------------------------
    // Render helpers
    // --------------------------------------------------------
    function renderGame(container) {
        container.className = 'game-wrapper';
        renderModeSelect(container);
    }

    function renderModeSelect(container) {
        container.innerHTML = `
            <div class="game-mode-select">
                <h3 class="game-mode-title">🎮 选择游戏模式</h3>
                <p class="game-mode-desc">九宫格变色挑战，两种玩法任你选</p>
                <div class="game-mode-buttons">
                    <button class="game-mode-btn" onclick="window.__startFixedMode()">
                        <i class="fa-solid fa-bullseye"></i>
                        <span>固定图案</span>
                        <small>挑战指定目标图案</small>
                    </button>
                    <button class="game-mode-btn" onclick="window.__openCustomEditor()">
                        <i class="fa-solid fa-palette"></i>
                        <span>自定义图案</span>
                        <small>设计自己的目标图案</small>
                    </button>
                </div>
            </div>
        `;
    }

    function renderCustomEditor(container) {
        gameState.customPattern = Array(9).fill(0);

        container.innerHTML = `
            <div class="game-custom-editor">
                <h3 class="game-mode-title">🎨 自定义目标图案</h3>
                <p class="game-mode-desc">点击格子切换 蓝色 / 粉色，设计你的目标</p>

                <div class="game-goal-section">
                    <div class="game-goal-title">
                        <i class="fa-solid fa-paintbrush"></i> 我的设计
                    </div>
                    <div class="game-editor-grid" id="gameEditorGrid">
                        ${Array(9).fill('').map((_, i) => `
                            <div class="game-cell blue game-editor-cell" data-index="${i}"></div>
                        `).join('')}
                    </div>
                </div>

                <div class="game-controls">
                    <button class="game-btn-reset" onclick="window.__backToModeSelect()">
                        <i class="fa-solid fa-arrow-left"></i> 返回
                    </button>
                    <button class="game-btn-play-again" onclick="window.__startCustomGame()">
                        <i class="fa-solid fa-play"></i> 开始挑战
                    </button>
                </div>
            </div>
        `;

        // Bind editor cell clicks
        const editorGrid = document.getElementById('gameEditorGrid');
        editorGrid.querySelectorAll('.game-editor-cell').forEach(cell => {
            const handler = () => {
                const idx = parseInt(cell.dataset.index, 10);
                gameState.customPattern[idx] = gameState.customPattern[idx] === 0 ? 1 : 0;
                cell.className = `game-cell game-editor-cell ${gameState.customPattern[idx] === 0 ? 'blue' : 'pink'}`;
            };
            cell.addEventListener('click', handler);
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handler();
            }, { passive: false });
        });
    }

    function renderPlayArea(container) {
        const modeLabel = gameState.mode === 'fixed' ? '固定图案' : '自定义图案';
        const modeIcon = gameState.mode === 'fixed' ? 'fa-bullseye' : 'fa-palette';

        container.innerHTML = `
            <div class="game-container active">
                <div class="game-inner">
                    <div class="game-mode-badge">
                        <i class="fa-solid ${modeIcon}"></i> ${modeLabel}
                    </div>

                    <div class="game-status-bar">
                        <div class="game-status-item">
                            <div class="game-status-value" id="gameTimeCount">0</div>
                            <div class="game-status-label">时间(秒)</div>
                        </div>
                        <div class="game-status-item">
                            <div class="game-status-value" id="gameMoveCount">0</div>
                            <div class="game-status-label">点击次数</div>
                        </div>
                    </div>

                    <div class="game-goal-section">
                        <div class="game-goal-title">
                            <i class="fa-solid fa-bullseye"></i> 目标图案
                        </div>
                        <div class="game-goal-pattern" id="gameGoalPattern">
                            ${gameState.target.map(v => `<div class="game-goal-cell ${v === 0 ? 'blue' : 'pink'}"></div>`).join('')}
                        </div>
                    </div>

                    <div class="game-grid" id="gameGrid"></div>

                    <div class="game-controls">
                        <button class="game-btn-reset" onclick="window.__backToModeSelect()">
                            <i class="fa-solid fa-arrow-left"></i> 选择模式
                        </button>
                        <button class="game-btn-reset" onclick="window.__restartGame()">
                            <i class="fa-solid fa-rotate-right"></i> 重新开始
                        </button>
                    </div>
                </div>
            </div>

            <div class="game-win-message" id="gameWinMessage">
                <div class="game-win-content">
                    <h2>🎉 恭喜通关!</h2>
                    <p>你成功将九宫格变成了目标图案!</p>
                    <div class="game-win-stats">
                        <div>
                            <div class="game-win-stat-value" id="gameFinalMoves">0</div>
                            <div class="game-win-stat-label">点击次数</div>
                        </div>
                        <div>
                            <div class="game-win-stat-value" id="gameFinalTime">0</div>
                            <div class="game-win-stat-label">用时(秒)</div>
                        </div>
                    </div>
                    <div class="game-win-buttons">
                        <button class="game-btn-play-again" onclick="window.__restartGame()">
                            <i class="fa-solid fa-play-circle"></i> 再玩一次
                        </button>
                        <button class="game-btn-reset" onclick="window.__backToModeSelect()">
                            <i class="fa-solid fa-arrow-left"></i> 选择模式
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // --------------------------------------------------------
    // Mode actions
    // --------------------------------------------------------
    function startFixedMode() {
        gameState.mode = 'fixed';
        gameState.target = FIXED_TARGET.slice();
        startGame();
    }

    function openCustomEditor() {
        renderCustomEditor(document.querySelector('.game-wrapper'));
    }

    function startCustomGame() {
        gameState.mode = 'custom';
        gameState.target = gameState.customPattern.slice();
        startGame();
    }

    function backToModeSelect() {
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.isPlaying = false;
        document.querySelector('.game-win-message')?.classList.remove('active');
        renderModeSelect(document.querySelector('.game-wrapper'));
    }

    function startGame() {
        const wrapper = document.querySelector('.game-wrapper');
        renderPlayArea(wrapper);
        initGame();
    }

    // --------------------------------------------------------
    // Game engine
    // --------------------------------------------------------
    function initGame() {
        const gridElement = document.getElementById('gameGrid');
        if (!gridElement) return;
        gridElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell blue';
            cell.dataset.index = i;
            cell.addEventListener('click', () => handleCellClick(i));
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCellClick(i);
            }, { passive: false });
            gridElement.appendChild(cell);
        }

        gameState.grid = Array(9).fill(0);
        gameState.moves = 0;
        gameState.seconds = 0;
        gameState.isPlaying = true;

        document.getElementById('gameMoveCount').textContent = '0';
        document.getElementById('gameTimeCount').textContent = '0';
        document.getElementById('gameWinMessage').classList.remove('active');

        startTimer();
        updateGameUI();
    }

    function restartGame() {
        initGame();
    }

    function handleCellClick(index) {
        if (!gameState.isPlaying) return;

        const affected = getAffectedIndices(index);
        affected.forEach(i => {
            gameState.grid[i] = gameState.grid[i] === 0 ? 1 : 0;
            const cell = document.querySelector(`.game-cell[data-index="${i}"]`);
            if (cell) {
                cell.classList.add('highlight');
                setTimeout(() => cell.classList.remove('highlight'), 500);
            }
        });

        gameState.moves++;
        document.getElementById('gameMoveCount').textContent = gameState.moves;
        updateGameUI();
        checkGameWin();
    }

    function getAffectedIndices(index) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const indices = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < 3 && c >= 0 && c < 3) {
                    indices.push(r * 3 + c);
                }
            }
        }
        return indices;
    }

    function updateGameUI() {
        for (let i = 0; i < 9; i++) {
            const cell = document.querySelector(`.game-grid .game-cell[data-index="${i}"]`);
            if (cell) {
                cell.className = `game-cell ${gameState.grid[i] === 0 ? 'blue' : 'pink'}`;
            }
        }
    }

    function startTimer() {
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.startTime = Date.now();
        gameState.seconds = 0;
        gameState.timer = setInterval(() => {
            if (gameState.isPlaying) {
                gameState.seconds = Math.floor((Date.now() - gameState.startTime) / 1000);
                document.getElementById('gameTimeCount').textContent = gameState.seconds;
            }
        }, 1000);
    }

    function checkGameWin() {
        const isWin = gameState.grid.every((color, index) => color === gameState.target[index]);
        if (isWin) {
            gameState.isPlaying = false;
            clearInterval(gameState.timer);
            document.getElementById('gameFinalMoves').textContent = gameState.moves;
            document.getElementById('gameFinalTime').textContent = gameState.seconds;
            document.getElementById('gameWinMessage').classList.add('active');
            createConfetti();
        }
    }

    function createConfetti() {
        const colors = ['#ffb6c1', '#a8d8ea', '#ff9eb5', '#8bc6e0', '#ffd1dc'];
        const winMsg = document.getElementById('gameWinMessage');
        const existing = winMsg.querySelectorAll('.confetti-piece');
        existing.forEach(el => el.remove());

        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.cssText = [
                'position: absolute',
                'width: ' + (Math.random() * 8 + 4) + 'px',
                'height: ' + (Math.random() * 8 + 4) + 'px',
                'left: ' + (Math.random() * 100) + '%',
                'top: -10px',
                'background: ' + colors[Math.floor(Math.random() * colors.length)],
                'border-radius: ' + (Math.random() > 0.5 ? '50%' : '2px'),
                'pointer-events: none',
                'z-index: 2001'
            ].join(';');
            winMsg.appendChild(piece);

            const anim = piece.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: 'translateY(' + window.innerHeight + 'px) rotate(' + (Math.random() * 360) + 'deg)', opacity: 0 }
            ], {
                duration: Math.random() * 1500 + 1000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            anim.onfinish = () => piece.remove();
        }
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    window.initBlogGame = function(container) {
        renderGame(container);
        window.__startFixedMode = startFixedMode;
        window.__openCustomEditor = openCustomEditor;
        window.__startCustomGame = startCustomGame;
        window.__backToModeSelect = backToModeSelect;
        window.__restartGame = restartGame;
    };

    // Prevent touch scroll on game cells
    document.addEventListener('touchmove', function(e) {
        if (e.target.classList && e.target.classList.contains('game-cell')) {
            e.preventDefault();
        }
    }, { passive: false });
})();