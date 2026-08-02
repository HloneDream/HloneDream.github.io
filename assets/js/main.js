// ============================================================
// Common Functions - Theme, Reading Progress, Back to Top
// ============================================================

// ------------------------------------------------------------
// 1. THEME TOGGLE (Dark / Light)
// ------------------------------------------------------------
(function() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function getTheme() {
        return localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.documentElement.classList.remove('dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    }

    // Init theme
    setTheme(getTheme());

    // Toggle on click
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Follow system preference if no manual setting
    prefersDark.addEventListener('change', () => {
        if (!localStorage.getItem('theme')) {
            setTheme(prefersDark.matches ? 'dark' : 'light');
        }
    });
})();

// ------------------------------------------------------------
// 2. READING PROGRESS (article page only)
// ------------------------------------------------------------
function setupReadingProgress() {
    const bar = document.getElementById('readingProgressBar');
    if (!bar) return;

    // Avoid duplicate scroll listeners
    if (bar.dataset.bound === 'true') return;
    bar.dataset.bound = 'true';

    const handler = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = Math.min(progress, 100) + '%';
    };

    window.addEventListener('scroll', handler);
    handler();
}

// ------------------------------------------------------------
// 3. BACK TO TOP
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 4. SCROLL REVEAL (Intersection Observer)
// ------------------------------------------------------------
function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
    }

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

// ------------------------------------------------------------
// 5. INIT
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    setupReadingProgress();
    initBackToTop();
});