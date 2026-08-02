// ============================================================
// Blog Router - Load posts.json, render list & article pages
// ============================================================

const POSTS_URL = 'data/posts.json';
const POSTS_DIR = 'posts/';

// ------------------------------------------------------------
// 1. HOME PAGE: View switching (home / about)
// ------------------------------------------------------------
function showPage(page) {
    const homeView = document.getElementById('homeView');
    const aboutView = document.getElementById('aboutView');
    if (!homeView || !aboutView) return;

    const navLinks = document.querySelectorAll('.nav-link[data-page]');

    if (page === 'about') {
        homeView.classList.add('hidden');
        aboutView.classList.add('active');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === 'about');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        homeView.classList.remove('hidden');
        aboutView.classList.remove('active');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === 'home');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page');
}

// ------------------------------------------------------------
// 2. HOME PAGE: Render Post List from posts.json
// ------------------------------------------------------------
async function renderPostList() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;

    try {
        const response = await fetch(POSTS_URL);
        if (!response.ok) throw new Error('Failed to load posts.json');
        const posts = await response.json();

        if (posts.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px 0;">还没有文章，敬请期待！</p>';
            return;
        }

        grid.innerHTML = posts.map(post => `
            <a class="post-card reveal" href="post.html?id=${encodeURIComponent(post.id)}">
                <div class="post-card-header">
                    <h3 class="post-card-title">
                        <i class="fa-solid ${post.icon || 'fa-file-lines'}" style="color:var(--pink);margin-right:6px;"></i>
                        ${post.title}
                    </h3>
                    <span class="post-card-date">
                        <i class="fa-regular fa-calendar"></i> ${post.date}
                    </span>
                </div>
                <p class="post-card-excerpt">${post.excerpt}</p>
                <div class="post-card-tags">
                    ${(post.tags || []).map(tag => `<span class="tag"><i class="fa-solid fa-hashtag"></i>${tag}</span>`).join('')}
                </div>
                <div class="post-card-footer">
                    <span class="read-more">
                        阅读全文 <i class="fa-solid fa-arrow-right"></i>
                    </span>
                </div>
            </a>
        `).join('');

        // Trigger scroll reveal after render
        setTimeout(initScrollReveal, 100);
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:40px 0;">
            <i class="fa-solid fa-triangle-exclamation"></i> 文章加载失败，请通过本地服务器访问（如 python -m http.server）。
        </p>`;
    }
}

// ------------------------------------------------------------
// 2. SEARCH (Home page)
// ------------------------------------------------------------
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
            const tags = card.querySelector('.post-card-tags') ? card.querySelector('.post-card-tags').textContent.toLowerCase() : '';

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

// ------------------------------------------------------------
// 3. ARTICLE PAGE: Parse URL param, fetch & render markdown
// ------------------------------------------------------------
async function renderArticle() {
    const container = document.getElementById('articleContent');
    if (!container) return;

    // Get id from URL: post.html?id=xxx
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        container.innerHTML = renderArticleError('缺少文章 ID 参数。');
        return;
    }

    try {
        // Fetch post metadata
        const metaResponse = await fetch(POSTS_URL);
        if (!metaResponse.ok) throw new Error('Failed to load posts.json');
        const posts = await metaResponse.json();
        const post = posts.find(p => p.id === postId);

        if (!post) {
            container.innerHTML = renderArticleError('未找到该文章。');
            return;
        }

        // Fetch markdown content
        const mdResponse = await fetch(POSTS_DIR + post.file);
        if (!mdResponse.ok) throw new Error('Failed to load markdown file: ' + post.file);
        const markdown = await mdResponse.text();

        // Render article
        const postBody = document.createElement('div');
        postBody.className = 'article-header';
        postBody.innerHTML = `
            <h1 class="article-title">
                <i class="fa-solid ${post.icon || 'fa-file-lines'}" style="color:var(--pink);"></i>
                ${post.title}
            </h1>
            <div class="article-meta">
                <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                <span><i class="fa-solid fa-tags"></i> ${(post.tags || []).join(' · ')}</span>
            </div>
        `;

        const postContent = document.createElement('div');
        postContent.className = 'article-content';
        postContent.innerHTML = marked.parse(markdown);

        container.innerHTML = '';
        container.appendChild(postBody);
        container.appendChild(postContent);

        // Detect game placeholder: <!-- GAME: macaron-game -->
        const hasGame = /<!--\s*GAME\s*:\s*([\w-]+)\s*-->/.exec(markdown);
        if (hasGame) {
            loadGameScript(container, hasGame[1]);
        }

        document.title = post.title + ' - HloneDream 的个人博客';

        // Setup reading progress
        setupReadingProgress();
    } catch (error) {
        console.error(error);
        container.innerHTML = renderArticleError('文章加载失败，请通过本地服务器访问（如 python -m http.server）。');
    }
}

function renderArticleError(message) {
    return `
        <div class="article-header">
            <h1 class="article-title" style="color:var(--text-muted);">
                <i class="fa-solid fa-circle-exclamation"></i> 加载失败
            </h1>
        </div>
        <div class="article-content">
            <p style="text-align:center;padding:16px 0;">${message}</p>
            <p style="text-align:center;">
                <a href="index.html" style="color:var(--accent);"><i class="fa-solid fa-arrow-left"></i> 返回首页</a>
            </p>
        </div>
    `;
}

// ------------------------------------------------------------
// 4. GAME SCRIPT LOADER (lazy-load)
// ------------------------------------------------------------
function loadGameScript(container, gameId) {
    // Insert game mount point after the game comment
    const gameMount = document.createElement('div');
    gameMount.id = gameId + '-root';
    container.appendChild(gameMount);

    // Lazy load the game engine
    const script = document.createElement('script');
    script.src = 'assets/js/game.js';
    script.onload = () => {
        if (typeof window.initBlogGame === 'function') {
            window.initBlogGame(gameMount, gameId);
        }
    };
    script.onerror = () => {
        gameMount.innerHTML = '<p style="color:var(--text-muted);text-align:center;">游戏加载失败。</p>';
    };
    document.body.appendChild(script);
}

// ------------------------------------------------------------
// 5. INIT
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Home page
    if (document.getElementById('postsGrid')) {
        renderPostList();
        initSearch();

        // Support ?page=about direct link
        const page = getPageFromUrl();
        if (page === 'about') {
            showPage('about');
        }
    }
    // Article page
    if (document.getElementById('articleContent')) {
        renderArticle();
    }
});