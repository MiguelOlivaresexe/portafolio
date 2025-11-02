// Dark mode toggle logic from external script (no HTML changes)
// - Applies .dark-mode on <body>
// - Persists preference in localStorage
// - Respects system preference when no saved choice
// - Updates the toggle icon (moon/sun) from RemixIcon

(function () {
  const STORAGE_KEY = 'theme';

  function setIcon(isDark) {
    const btn = document.getElementById('darkModeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    icon.classList.toggle('ri-moon-line', !isDark);
    icon.classList.toggle('ri-sun-line', isDark);
  }

  function applyTheme(theme) {
    const body = document.body;
    const isDark = theme === 'dark';
    body.classList.toggle('dark-mode', isDark);
    setIcon(isDark);
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    setIcon(isDark);
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
  }

  function init() {
    // Apply initial theme
    applyTheme(getInitialTheme());

    // Wire the toggle button
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
      btn.setAttribute('aria-pressed', String(document.body.classList.contains('dark-mode')));
    }

    // React to system preference changes only if user hasn't chosen explicitly
    if (window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', (e) => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();