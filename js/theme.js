// ============================================================
// Theme Toggle (Dark / Light)
// ============================================================
(function() {
    const themeToggle = document.getElementById('themeToggle');
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