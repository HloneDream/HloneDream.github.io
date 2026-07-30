// ============================================================
// Blog Application - Router, Render, Game Engine
// ============================================================

// ============================================================
// 1. ROUTER
// ============================================================
function navigateTo(page, postId) {
    // Hide all views
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('articleView').classList.remove('active');
    document.getElementById('aboutView').classList.remove('active');

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    if (page === 'home') {
        document.getElementById('homeView').style.display = 'block';
        document.querySelector('.nav-link[data-page="home"]').classList.add('active');
        document.getElementById('readingProgress').style.display = 'none';
        document.getElementById('backToTop').classList.remove('visible');
    } else if (page === 'article' && postId) {
        document.getElementById('articleView').classList.add('active');
        document.getElementById('readingProgress').style.display = 'block';
        renderArticle(postId);
    } else if (page === 'about') {
        document.getElementById('aboutView').classList.add('active');
        document.querySelector('.nav-link[data-page="about"]').classList.add('active');
        document.getElementById('readingProgress').style.display = 'none';
        document.getElementById('backToTop').classList.remove('visible');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 2. RENDER HOME POSTS
// ============================================================
function renderPosts() {
    const grid = document.getElementById('postsGrid');
    grid.innerHTML = postsData.map(post => `
        <div class="post-card reveal" onclick="navigateTo('article','${post.id}')">
            <div class="post-card-header">
                <h3 class="post-card-title">
                    <i class="fa-solid ${post.icon}" style="color:var(--pink);margin-right:6px;"></i>
                    ${post.title}
                </h3>
                <span class="post-card-date">
                    <i class="fa-regular fa-calendar"></i> ${post.date}
                </span>
            </div>
            <p class="post-card-excerpt">${post.excerpt}</p>
            <div class="post-card-tags">
                ${post.tags.map(tag => `<span class="tag"><i class="fa-solid fa-hashtag"></i>${tag}</span>`).join('')}
            </div>
            <div class="post-card-footer">
                <span class="read-more">
                    阅读全文 <i class="fa-solid fa-arrow-right"></i>
                </span>
            </div>
        </div>
    `).join('');

    // Trigger scroll reveal after render
    setTimeout(initScrollReveal, 100);
}

// ============================================================
// 3. SEARCH
// ============================================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.post-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('.post-card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.post-card-excerpt').textContent.toLowerCase();
            const tags = card.querySelector('.post-card-tags').textContent.toLowerCase();

            if (title.includes(query) || excerpt.includes(query) || tags.includes(query)) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide no-results message
        const noResults = document.getElementById('searchNoResults');
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    });
}

// ============================================================
// 4. RENDER ARTICLE
// ============================================================
function renderArticle(postId) {
    const post = postsData.find(p => p.id === postId);
    if (!post) return;

    const container = document.getElementById('articleContent');

    if (postId === 'macaron-game') {
        renderGameArticle(container, post);
    } else {
        container.innerHTML = `
            <div class="article-header">
                <h1 class="article-title">${post.title}</h1>
                <div class="article-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                    <span><i class="fa-solid fa-tags"></i> ${post.tags.join(' · ')}</span>
                </div>
            </div>
            <div class="article-content">
                <p>内容正在准备中...</p>
            </div>
        `;
    }

    // Setup reading progress
    setupReadingProgress();
}

function renderGameArticle(container, post) {
    container.innerHTML = `
        <div class="article-header">
            <h1 class="article-title"><i class="fa-solid fa-palette" style="color:var(--pink);"></i> ${post.title}</h1>
            <div class="article-meta">
                <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                <span><i class="fa-solid fa-tags"></i> ${post.tags.join(' · ')}</span>
            </div>
        </div>
        <div class="article-content">
            <p>一款可爱又烧脑的九宫格变色小游戏！有挑战性哦！</p>
            <h2>游戏规则</h2>
            <p>点击任意格子，该格子自身及其<strong>相邻格子</strong>（包括上下左右和对角线方向）都会在粉色和淡蓝色之间切换颜色。你的目标是将九宫格变成上方指定的目标图案。</p>
            <p>试试看你能用最少的步数完成挑战吧！</p>

            <div class="game-wrapper" id="gameWrapper">
                <div class="game-placeholder" id="gamePlaceholder">
                    <i class="fa-solid fa-gamepad"></i>
                    <h3>准备好挑战了吗？</h3>
                    <p>点击下方按钮开始游戏</p>
                    <button class="btn-start-game" onclick="startGame()">
                        <i class="fa-solid fa-play"></i> 开始游戏
                    </button>
                </div>

                <div class="game-container" id="gameContainer">
                    <div class="game-inner">
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
                            <div class="game-goal-pattern">
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell pink"></div>
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell pink"></div>
                                <div class="game-goal-cell blue"></div>
                                <div class="game-goal-cell pink"></div>
                            </div>
                        </div>

                        <div class="game-grid" id="gameGrid"></div>

                        <div class="game-controls">
                            <button class="game-btn-reset" onclick="initGame()">
                                <i class="fa-solid fa-rotate-right"></i> 重新开始
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p style="margin-top:24px;color:var(--text-muted);font-size:0.9rem;">
                <i class="fa-solid fa-lightbulb"></i> 提示：目标图案中有3个粉色格子，分别位于右上角、左下角和右下角。开心游戏！
            </p>
        </div>
    `;
}

// ============================================================
// 5. GAME ENGINE
// ============================================================
const gameState = {
    grid: Array(9).fill(0),
    moves: 0,
    startTime: null,
    timer: null,
    seconds: 0,
    isPlaying: true
};

const targetState = [0, 0, 1, 0, 0, 0, 1, 0, 1];

function startGame() {
    document.getElementById('gamePlaceholder').style.display = 'none';
    document.getElementById('gameContainer').classList.add('active');
    initGame();
}

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
        const cell = document.querySelector(`.game-cell[data-index="${i}"]`);
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
    const isWin = gameState.grid.every((color, index) => color === targetState[index]);
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

// ============================================================
// 6. READING PROGRESS
// ============================================================
function setupReadingProgress() {
    const bar = document.getElementById('readingProgressBar');
    const handler = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = Math.min(progress, 100) + '%';
    };
    window.addEventListener('scroll', handler);
    handler();
}

// ============================================================
// 7. SCROLL REVEAL (Intersection Observer)
// ============================================================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================================
// 8. BACK TO TOP
// ============================================================
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

// ============================================================
// 9. INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    renderPosts();
    navigateTo('home');
    initSearch();
    initBackToTop();

    // Touch move prevention for game cells
    document.addEventListener('touchmove', function(e) {
        if (e.target.classList.contains('game-cell')) {
            e.preventDefault();
        }
    }, { passive: false });
});