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

    // Wire the translate button
    const translateBtn = document.getElementById('translateToEnglish');
    if (translateBtn) {
      translateBtn.addEventListener('click', () => {
        // Intento 1: usar el combo del widget si existe
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
          combo.value = 'en';
          combo.dispatchEvent(new Event('change'));
          return;
        }
        // Intento 2: establecer cookie y recargar (funciona en http/https)
        const from = 'es';
        const to = 'en';
        const host = window.location.hostname;
        document.cookie = `googtrans=/${from}/${to}; path=/`;
        if (host) {
          document.cookie = `googtrans=/${from}/${to}; domain=${host}; path=/`;
        }
        // Recargar para que el widget aplique la traducción
        window.location.reload();
      });
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

    // Scrollspy: activa enlace del navbar según sección visible
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute('href')?.slice(1);
        const el = id ? document.getElementById(id) : null;
        return el ? { id, el, link } : null;
      })
      .filter(Boolean);

    function setActive(id) {
      sections.forEach(({ id: sid, link }) => {
        const isActive = sid === id;
        link.classList.toggle('nav-link-active', isActive);
      });
    }

    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }
          });
        },
        {
          root: null,
          threshold: 0.6,
          rootMargin: '0px 0px -20% 0px',
        }
      );
      sections.forEach(({ el }) => observer.observe(el));
    } else if (sections.length) {
      // Fallback por scroll
      const getCurrent = () => {
        const y = window.scrollY + window.innerHeight * 0.4;
        let currentId = sections[0].id;
        sections.forEach(({ id, el }) => {
          const top = el.offsetTop;
          if (y >= top) currentId = id;
        });
        setActive(currentId);
      };
      window.addEventListener('scroll', getCurrent, { passive: true });
      getCurrent();
    }

    // Diseño minimal: sin animaciones de aparición

    // ========================================
    // MEJORAS DE DISEÑO 2025: CURSOR, REVEAL, NAV
    // ========================================

    // 1. Cursor Aero-Glow
    const cursorGlow = document.getElementById('cursor-glow');
    const cursorDot = document.getElementById('cursor-dot');
    
    if (cursorGlow && cursorDot) {
      document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
        
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
      });

      document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
      });
    }

    // 2. Scroll Reveal con IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Micro-interacciones de Navbar al Scroll
    const glassNav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        glassNav.style.padding = '0.5rem 2rem';
        glassNav.style.background = 'rgba(255, 255, 255, 0.08)';
        glassNav.style.backdropFilter = 'blur(30px)';
      } else {
        glassNav.style.padding = '0.75rem 2.5rem';
        glassNav.style.background = 'rgba(255, 255, 255, 0.05)';
        glassNav.style.backdropFilter = 'blur(12px)';
      }
    }, { passive: true });

    // Botón “volver arriba”
    const backBtn = document.createElement('button');
    backBtn.className = 'back-to-top';
    backBtn.setAttribute('aria-label', 'Volver arriba');
    backBtn.textContent = '↑';
    document.body.appendChild(backBtn);
    const updateBackBtn = () => {
      const show = window.scrollY > 600;
      backBtn.classList.toggle('show', show);
    };
    window.addEventListener('scroll', updateBackBtn, { passive: true });
    updateBackBtn();
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========================================
    // LÓGICA DE PROYECTOS: FILTRADO Y GLOW
    // ========================================
    const projectCards = document.querySelectorAll('.modern-2025-card');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // 1. Efecto de Brillo Interactivo (Mouse Tracking)
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
      });
    });

    // 2. Sistema de Filtrado de Proyectos
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        // Actualizar estado de botones
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'white';
        });
        
        btn.classList.add('active');
        btn.style.background = 'white';
        btn.style.color = 'black';

        // Filtrar tarjetas
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex'; // Usamos flex porque las cards son flex
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });

    // 3. Animación de Revelado (Intersection Observer)
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    projectCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(card);
    });
  }

  // Inicialización del widget de Google Translate
  window.googleTranslateElementInit = function () {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement({
        pageLanguage: 'es',
        autoDisplay: false,
        includedLanguages: 'en'
      }, 'google_translate_element');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
