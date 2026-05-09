const THEME_STORAGE_KEY = 'portfolio-theme';

function applyStoredTheme() {
    try {
        if (localStorage.getItem(THEME_STORAGE_KEY) === 'dark') {
            document.body.classList.add('night-mode');
        } else {
            document.body.classList.remove('night-mode');
        }
    } catch (_) {
        /* ignore private mode / blocked storage */
    }
}

applyStoredTheme();

function syncThemeToggle(btn) {
    if (!btn) return;
    const on = document.body.classList.contains('night-mode');
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Switch to light mode' : 'Switch to dark mode');
}

function bindThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    syncThemeToggle(btn);
    btn.addEventListener('click', () => {
        document.body.classList.toggle('night-mode');
        const on = document.body.classList.contains('night-mode');
        try {
            localStorage.setItem(THEME_STORAGE_KEY, on ? 'dark' : 'light');
        } catch (_) {}
        syncThemeToggle(btn);
    });
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
}

// --- Shared Header ---
const headerMount = document.querySelector('[data-site-header]');

if (headerMount) {
    const currentPage = headerMount.getAttribute('data-page') || '';
    const isActive = page => currentPage === page ? ' is-active' : '';
    const resumeUrl = 'https://drive.google.com/file/d/1e9EJH8wygKwAtqdljxzznRefkSE4_Ee4/view?usp=drive_link';

    headerMount.innerHTML = `
        <header class="navbar">
            <span class="navbar__guide navbar__guide--top" aria-hidden="true"></span>
            <span class="navbar__guide navbar__guide--bottom" aria-hidden="true"></span>
            <span class="navbar__guide navbar__guide--left" aria-hidden="true"></span>
            <span class="navbar__guide navbar__guide--right" aria-hidden="true"></span>
            <div class="navbar__pill">
                <a href="index.html" class="navbar__logo" aria-label="Go to homepage">
                    <img src="asset/Logo.svg" alt="AS Logo" class="logo-img">
                </a>

                <nav class="nav-tray">
                    <a href="index.html#work" class="nav-item${isActive('home')}">work</a>
                    <a href="play.html" class="nav-item${isActive('play')}">play</a>
                    <a href="about.html" class="nav-item${isActive('about')}">about me</a>
                    <a href="${resumeUrl}" class="nav-item${isActive('resume')}" target="_blank" rel="noopener noreferrer">resume</a>
                    <button type="button" class="theme-toggle" id="theme-toggle" role="switch" aria-checked="false" aria-label="Switch to dark mode">
                        <span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1.5a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm0 19a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zM1.5 11a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2zm21 0a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2zM4.22 4.22a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 1 1-1.41 1.42L4.22 5.64a1 1 0 0 1 0-1.42zm13.73 13.73a1 1 0 0 1 1.42 0l1.41 1.41a1 1 0 0 1-1.41 1.42l-1.42-1.41a1 1 0 0 1 0-1.42zM4.22 19.78a1 1 0 0 1 0-1.41l1.42-1.42a1 1 0 1 1 1.41 1.42l-1.41 1.41a1 1 0 0 1-1.42 0zm13.73-13.73a1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 0 1 1.42 1.41l-1.42 1.42a1 1 0 0 1-1.41 0z"/>
                            </svg>
                        </span>
                        <span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        </span>
                    </button>
                </nav>

                <div class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div class="mobile-nav-overlay" id="mobile-nav-overlay">
                <a href="index.html" class="nav-item">home</a>
                <a href="play.html" class="nav-item">play</a>
                <a href="about.html" class="nav-item">about me</a>
                <a href="${resumeUrl}" class="nav-item" target="_blank" rel="noopener noreferrer">resume</a>
                <a href="contact.html" class="nav-item">contact</a>
            </div>
        </header>
    `;
    bindThemeToggle();
}

const footerMounts = document.querySelectorAll('[data-site-footer]');

footerMounts.forEach(mount => {
    const variant = mount.getAttribute('data-site-footer');

    if (variant === 'minimal') {
        // Used on every page except the homepage. The pixel scenery that used
        // to live here has been removed; the slot is intentionally left empty
        // so existing markup keeps validating without rendering anything.
        return;
    }

    mount.innerHTML = `
        <footer class="site-footer">
            <div class="container">
                <section class="footer-cta-shell" aria-labelledby="footer-heading">
                    <div class="footer-sticker-stack" aria-hidden="true">
                        <!-- SVG Drop Shadow Overlay -->
                        <div class="sticker-shadow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="499" height="498" viewBox="0 0 499 498" fill="none">
                              <g filter="url(#filter0_f_1192_10582)">
                                <path d="M70 301.905L224.53 70L428.409 427.65L172.976 427.649L70 301.905Z" fill="#595959" fill-opacity="0.15"/>
                              </g>
                              <defs>
                                <filter id="filter0_f_1192_10582" x="0" y="0" width="498.409" height="497.65" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="35" result="effect1_foregroundBlur_1192_10582"/>
                                </filter>
                              </defs>
                            </svg>
                        </div>
                        <img src="asset/stticky%20note.png" alt="Sticky Note" class="sticker-image">
                    </div>

                    <h2 class="footer-cta-title" id="footer-heading">amaze amaze amaze?<br>let’s catchup soon</h2>

                    <div class="footer-cta-bar">
                        <p class="footer-cta-copy">Drop me a ‘Hi’ and I’ll get back</p>
                        <a class="footer-cta-button" href="mailto:hello@aditya.design?subject=Hi%20Aditya">Send Email</a>
                    </div>
                </section>

                <div class="footer-meta">
                    <p class="footer-meta-copy">
                        Copyright → Made with procrastination and overthinking<br>
                        over the weekends <span aria-hidden="true">🌈</span>
                    </p>

                    <div class="footer-meta-socials">
                        <a href="#" class="footer-meta-social" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M16 3H8C5.239 3 3 5.239 3 8V16C3 18.761 5.239 21 8 21H16C18.761 21 21 18.761 21 16V8C21 5.239 18.761 3 16 3Z" stroke="currentColor" stroke-width="2" />
                                <path d="M15.0002 11.3702C15.1236 12.2025 14.9811 13.0526 14.5939 13.7992C14.2067 14.5458 13.5949 15.152 12.8448 15.5323C12.0946 15.9127 11.2432 16.047 10.4122 15.916C9.58118 15.785 8.812 15.3953 8.21404 14.8018C7.61608 14.2082 7.22067 13.4419 7.08361 12.6118C6.94655 11.7818 7.07481 10.9294 7.45004 10.1765C7.82527 9.42356 8.42691 8.80733 9.17068 8.41473C9.91445 8.02213 10.7635 7.87342 11.5967 7.99024C12.446 8.1093 13.2322 8.49819 13.8382 9.10073C14.4441 9.70327 14.8374 10.4872 14.9612 11.3358" stroke="currentColor" stroke-width="2" />
                                <path d="M16.5 7.5H16.51" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </a>
                        <a href="#" class="footer-meta-social" aria-label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M6.94 8.5H3.56V20H6.94V8.5ZM5.25 3C4.17 3 3.5 3.72 3.5 4.66C3.5 5.58 4.15 6.31 5.21 6.31H5.23C6.33 6.31 7 5.58 7 4.66C6.98 3.72 6.33 3 5.25 3ZM20.5 13.01C20.5 9.47 18.61 7.82 16.1 7.82C14.08 7.82 13.17 8.93 12.67 9.72V8.5H9.29C9.33 9.31 9.29 20 9.29 20H12.67V13.58C12.67 13.24 12.7 12.91 12.79 12.67C13.06 12 13.67 11.3 14.7 11.3C16.05 11.3 16.59 12.33 16.59 13.84V20H19.96V13.01H20.5Z" />
                            </svg>
                        </a>
                        <a href="#" class="footer-meta-social" aria-label="X">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 4L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                <path d="M20 4L4 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div class="footer-wordmark-shell" aria-hidden="true">
                    <span class="footer-wordmark">
                        <img src="asset/the.end.png" alt="the end">
                    </span>
                </div>
            </div>
        </footer>
    `;
});

// Drifting dapple band — always the very last element on the page so it
// reads as soft sunlight pooling on the ground beneath everything else.
// Painted by asset/dappled-footer-shader.js, which discovers this
// container via the [data-dappled-footer] hook regardless of script load
// order.
(function ensureDappledFooter() {
    // Pages with body[data-no-dappled-footer] (e.g. the play canvas) own the
    // viewport and don't want a footer band injected. Bail out for those.
    if (document.body && document.body.hasAttribute('data-no-dappled-footer')) return;
    if (document.querySelector('[data-dappled-footer]')) return;
    const band = document.createElement('div');
    band.className = 'dappled-footer';
    band.setAttribute('data-dappled-footer', '');
    band.setAttribute('aria-hidden', 'true');
    band.innerHTML = '<canvas class="dappled-footer__canvas"></canvas>';
    document.body.appendChild(band);
})();

/*
// --- Layout Toggle Logic ---
const btnWall = document.getElementById('btn-wall');
const btnGrid = document.getElementById('btn-grid');
const workContainer = document.getElementById('work-wall');

btnGrid.addEventListener('click', () => {
    btnGrid.classList.add('active');
    btnWall.classList.remove('active');
    workContainer.classList.add('organised-view');
});

btnWall.addEventListener('click', () => {
    btnWall.classList.add('active');
    btnGrid.classList.remove('active');
    workContainer.classList.remove('organised-view');
});
*/

// --- Project Modal Logic ---
const projectModal = document.getElementById('project-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const workCards = document.querySelectorAll('.work-card');
const homeWorkCards = document.querySelectorAll('#work-wall .work-card');

// Create dynamic custom cursor label
const cursorLabel = document.createElement('div');
cursorLabel.id = 'custom-cursor-label';
document.body.appendChild(cursorLabel);

// Orange cursor dot
const cursorDot = document.createElement('div');
cursorDot.classList.add('cursor-dot');
document.body.appendChild(cursorDot);

let dotX = 0, dotY = 0;
document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
});

document.querySelectorAll('a, button, [role="button"], input, textarea, select, .work-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('cursor-dot--hover'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('cursor-dot--hover'));
});

document.querySelectorAll('.hero-v2__tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('cursor-dot--hover', 'cursor-dot--blue');
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('cursor-dot--hover', 'cursor-dot--blue');
    });
});

let cursorTimeout;

workCards.forEach(card => {
    const link = card.getAttribute('data-link');

    const navigateToCardLink = () => {
        if (!link) return;
        cursorLabel.style.opacity = '0';
        if (typeof cursorDot !== 'undefined' && cursorDot) {
            cursorDot.style.opacity = '0';
        }
        if (typeof window.startPageFadeNavigation === 'function') {
            window.startPageFadeNavigation(link);
            return;
        }
        window.location.href = link;
    };

    card.addEventListener('click', () => {
        navigateToCardLink();
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToCardLink();
        }
    });

    // All work cards (homepage + work page) share the same hover behavior:
    // the cursor label surfaces the project title (and description if present).
    // No in-card transform — the cursor is the sole affordance.
    card.addEventListener('mouseenter', () => {
        clearTimeout(cursorTimeout);
        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-desc');
        if (!title) return;
        cursorLabel.innerHTML = desc
            ? `<strong>${title}</strong> &nbsp;—&nbsp; <span style="opacity: 0.8;">${desc}</span>`
            : `<strong>${title}</strong>`;
        cursorLabel.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
        cursorTimeout = setTimeout(() => {
            cursorLabel.style.opacity = '0';
        }, 50);
    });

    card.addEventListener('mousemove', (e) => {
        cursorLabel.style.left = `${e.clientX + 15}px`;
        cursorLabel.style.top = `${e.clientY - 15}px`;
    });
});

/* ==========================================================================
   PAGE TRANSITIONS — full-page fade
   --------------------------------------------------------------------------
   Every navigation between the homepage and a case study (and back) is a
   simple body-opacity cross-fade that bridges across the page swap by:
     1. Fading body to 0 over the current theme's bg colour (light/dark),
     2. Setting window.location.href,
     3. The destination page's <head> already added .cs-incoming to <html>
        (because it found a sessionStorage flag) so its body stays opacity 0
        through first paint,
     4. This script removes .cs-incoming and tweens body back to 1.

   Why no morphing card / overlay / sharedelement: cross-document morphs
   require either the View Transitions API (snapshot-bound, jittery) or a
   second cloned overlay on the destination (heavy, brittle on layout
   shifts). A simple themed fade is cheap, looks polished, and works the
   same on every browser.
   ========================================================================== */
(function setupPageFadeTransitions() {
    const FADE_KEY = 'cs-fade';
    const hasGsap = typeof window.gsap !== 'undefined';
    const reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function navigateWithFade(link) {
        if (!link) return;
        if (!hasGsap) {
            window.location.href = link;
            return;
        }

        try {
            sessionStorage.setItem(FADE_KEY, JSON.stringify({ ts: Date.now() }));
        } catch (_) { /* storage unavailable, fade still works */ }

        const dur = reduceMotion ? 0.001 : 0.32;
        gsap.to(document.body, {
            autoAlpha: 0,
            duration: dur,
            ease: 'power2.in',
            onComplete: () => { window.location.href = link; }
        });
    }

    // Public entry the card click handler calls.
    window.startPageFadeNavigation = navigateWithFade;

    // Wire the case-study back / close links to the same fade. The
    // anchors still have real hrefs so middle-click / right-click /
    // browser-back keep working normally.
    //
    // When the user originated from the homepage's work section, going
    // back should drop them right back there — never the homepage hero.
    // We force a #work fragment onto the URL if it isn't already there.
    document.addEventListener('click', (e) => {
        const back = e.target.closest && e.target.closest('.cs-back, .nav-close');
        if (!back) return;
        const rawHref = back.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#')) return; // pure in-page anchor
        e.preventDefault();
        const href = rawHref.includes('#')
            ? rawHref
            : rawHref.replace(/\/$/, '') + '#work';
        navigateWithFade(href);
    });

    // Wait until images have loaded AND fonts are ready before fading
    // the page in, so the user doesn't see layout shift / font swap
    // mid-fade. Safety timeout prevents stalling on slow assets.
    function whenPageReady(callback) {
        let done = false;
        const finish = () => { if (!done) { done = true; callback(); } };

        const onLoadAndFonts = () => {
            if (document.fonts && document.fonts.ready
                && typeof document.fonts.ready.then === 'function') {
                document.fonts.ready.then(finish, finish);
            } else {
                finish();
            }
        };

        if (document.readyState === 'complete') {
            onLoadAndFonts();
        } else {
            window.addEventListener('load', onLoadAndFonts, { once: true });
        }

        // Don't wait longer than 700ms even if a stray asset is slow.
        setTimeout(finish, 700);
    }

    // Incoming fade-in. The early head script in each HTML file added
    // .cs-incoming to <html> (which hides body via CSS) when it found a
    // pending fade in sessionStorage. We just reverse it.
    function runIncomingFadeIn() {
        const incoming = document.documentElement.classList.contains('cs-incoming');
        if (!incoming) return;

        if (!hasGsap) {
            document.documentElement.classList.remove('cs-incoming');
            document.documentElement.style.backgroundColor = '';
            return;
        }

        // Body is at opacity 0 because of the .cs-incoming CSS rule.
        // Switch the hide mechanism from class -> inline style so we can
        // smoothly tween it back to 1.
        gsap.set(document.body, { autoAlpha: 0 });
        document.documentElement.classList.remove('cs-incoming');

        // Wait for assets + fonts so the fade reveals a fully-settled
        // page (no font swap or image-load layout shift mid-fade).
        whenPageReady(() => {
            // Re-resolve the URL fragment after layout has settled.
            // The browser scrolls to the fragment at parse time, but
            // image and shader-canvas mounts shift the document height
            // afterwards, so the original scroll lands at the wrong
            // pixel. We snap to the target element again now that the
            // page is fully laid out, before the fade reveals it.
            const hash = window.location.hash;
            if (hash && hash.length > 1) {
                let target = null;
                try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
                catch (_) { target = document.getElementById(hash.slice(1)); }
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ block: 'start', behavior: 'instant' });
                }
            }

            gsap.to(document.body, {
                autoAlpha: 1,
                duration: reduceMotion ? 0.001 : 0.45,
                ease: 'power2.out',
                onComplete: () => {
                    document.documentElement.style.backgroundColor = '';
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runIncomingFadeIn);
    } else {
        runIncomingFadeIn();
    }

    // Safety: if something kept .cs-incoming around, remove it after a
    // timeout so the page never stays permanently invisible.
    setTimeout(() => {
        if (document.documentElement.classList.contains('cs-incoming')) {
            document.documentElement.classList.remove('cs-incoming');
            document.documentElement.style.backgroundColor = '';
            if (hasGsap) gsap.set(document.body, { autoAlpha: 1, clearProps: 'opacity,visibility' });
        }
    }, 1500);

    // bfcache restore: clear any stale fade flag and force the page back
    // to fully visible (otherwise users hitting browser back into a
    // restored page would see it stuck at opacity 0).
    window.addEventListener('pageshow', (ev) => {
        if (!ev.persisted) return;
        try { sessionStorage.removeItem(FADE_KEY); } catch (_) {}
        document.documentElement.classList.remove('cs-incoming');
        document.documentElement.style.backgroundColor = '';
        if (hasGsap) gsap.set(document.body, { autoAlpha: 1, clearProps: 'opacity,visibility' });
    });
})();

// --- Mobile Menu Interaction ---
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav-overlay');
if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');

        // Transform hamburger to X
        const spans = mobileBtn.querySelectorAll('span');
        if (mobileBtn.classList.contains('active')) {
            spans[0].style.transform = 'translateY(8px) rotate(45deg)';
            spans[1].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.transform = 'none';
        }
    });
}

// --- 3D Museum Stage Gallery (Beyond the Pixels) ---
const topContainer = document.getElementById("content-top");
const centerContainer = document.getElementById("content-center");
const bottomContainer = document.getElementById("content-bottom");

if (topContainer && centerContainer && bottomContainer) {
    const containers = [topContainer, centerContainer, bottomContainer];

    // Populate images (Double set for seamless infinite loop as per snippet)
    const images = [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800"
    ];

    containers.forEach(container => {
        container.innerHTML = '';
        [...images, ...images, ...images].forEach(src => {
            const div = document.createElement('div');
            div.className = 'ticker-image-wrapper';
            div.innerHTML = `<img src="${src}" alt="">`;
            container.appendChild(div);
        });
    });

    const foldsContent = [topContainer, centerContainer, bottomContainer];

    let yPos = 0;
    const scrollSpeed = 0.8;

    const tick = () => {
        yPos -= scrollSpeed;
        const resetThreshold = foldsContent[1].scrollHeight / 3;

        if (Math.abs(yPos) >= resetThreshold) {
            yPos = 0;
        }

        foldsContent.forEach((content) => {
            content.style.transform = `translateY(${yPos}px)`;
        });

        requestAnimationFrame(tick);
    };

    // Delay start to let images load for accurate scrollHeight
    setTimeout(tick, 500);

}

// --- Camera Interaction ---
const heroCamera = document.getElementById('hero-camera');
if (heroCamera) {
    const toggleFlash = () => heroCamera.classList.toggle('flash-active');
    heroCamera.addEventListener('click', toggleFlash);
    heroCamera.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlash();
        }
    });
}

/**
 * About page — “More of me”: when a <video> has a <source> (or src), play on hover.
 * Add: <source src="asset/your-clip.mp4" type="video/mp4" /> inside .about-more__video
 */
(function initAboutMoreHoverVideo() {
    const root = document.querySelector('.about-more');
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.querySelectorAll('.about-more__card--hover-video .about-more__media--hover-video .about-more__video').forEach((video) => {
        const hasSource =
            (video.currentSrc && video.currentSrc.length > 0) ||
            (video.getAttribute('src') && video.getAttribute('src').trim().length > 0) ||
            (video.querySelector('source') && video.querySelector('source').getAttribute('src') && video.querySelector('source').getAttribute('src').trim().length > 0);

        if (!hasSource) return;

        const card = video.closest('.about-more__card--hover-video');
        if (!card) return;
        card.classList.add('has-hover-video');

        const play = () => {
            video.play().catch(() => {});
        };
        const stop = () => {
            video.pause();
            try {
                video.currentTime = 0;
            } catch (_) {
                /* nothing */
            }
        };

        card.addEventListener('mouseenter', play);
        card.addEventListener('mouseleave', stop);
    });
})();

/**
 * Home hero: mask-reveal-up (per-line), aligned with animate-text spec
 * assets/specs/mask-reveal-up.json + site_reference runtime scaling
 */
(function initHeroHeadlineMaskReveal() {
    if (typeof gsap === 'undefined') return;
    const lines = document.querySelectorAll('.hero-v2__headline-line');
    if (!lines.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const yTravel = 30 * 0.58; /* y_travel_multiplier */
    const duration = (760 * 0.72) / 1000; /* enter.duration_ms * speed_multiplier */
    const stagger = (90 * 0.72) / 1000; /* enter.stagger_ms * speed_multiplier */
    const delay = 0.14; /* page paint / nav */
    const ease = 'expo.out'; /* close to cubic-bezier(0.22, 1, 0.36, 1) */

    gsap.set(lines, { opacity: 0, y: yTravel, filter: 'blur(6px)' });
    gsap.to(lines, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        stagger,
        ease,
        clearProps: 'filter',
    });
})();

/**
 * Home hero: hover-to-pop on .hero-v2__pixel squares.
 * Emits a small burst of colored mini-pixels from the hovered square
 * and nudges the square itself. Driven by GSAP.
 */
(function initHeroPixelPop() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const frame = document.querySelector('.hero-v2__frame');
    const squares = Array.from(document.querySelectorAll('.hero-v2__pixel'));
    if (!frame || !squares.length) return;

    const colors = ['#FF6B00', '#f97a4f', '#f9a5f6', '#96dc91', '#72C5F9'];
    const rand = gsap.utils.random;

    // Cooldown per square so a quick sweep still produces a burst but doesn't spam
    const cooldownMs = 260;

    function popSquare(sq) {
        const now = performance.now();
        const last = parseFloat(sq.dataset.lastPop || '0');
        if (now - last < cooldownMs) return;
        sq.dataset.lastPop = String(now);

        gsap.fromTo(
            sq,
            { scale: 1, y: 0 },
            {
                scale: 1.22,
                y: -4,
                duration: 0.18,
                ease: 'power3.out',
                yoyo: true,
                repeat: 1,
                transformOrigin: '50% 50%',
                overwrite: 'auto',
            }
        );

        const rect = sq.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const scaleX = rect.width ? rect.width / sq.offsetWidth : 1;
        const scaleY = rect.height ? rect.height / sq.offsetHeight : 1;
        const cx = (rect.left - frameRect.left) / scaleX + sq.offsetWidth / 2;
        const cy = (rect.top - frameRect.top) / scaleY + sq.offsetHeight / 2;

        const count = Math.round(rand(4, 7));
        for (let i = 0; i < count; i++) {
            const px = document.createElement('span');
            px.className = 'hero-v2__pixel-burst';
            const size = rand(6, 10);
            px.style.width = size + 'px';
            px.style.height = size + 'px';
            px.style.left = cx - size / 2 + 'px';
            px.style.top = cy - size / 2 + 'px';
            px.style.backgroundColor = colors[Math.floor(rand(0, colors.length - 0.0001))];
            frame.appendChild(px);

            const angle = rand(0, Math.PI * 2);
            const dist = rand(28, 58);
            gsap.fromTo(
                px,
                { scale: 0, opacity: 1, rotate: 0 },
                {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    rotate: rand(-40, 40),
                    scale: rand(0.9, 1.1),
                    opacity: 0,
                    duration: rand(0.55, 0.85),
                    ease: 'power3.out',
                    onComplete: () => px.remove(),
                }
            );
        }
    }

    squares.forEach((sq) => {
        sq.addEventListener('mouseenter', () => popSquare(sq));
        sq.addEventListener('pointerenter', () => popSquare(sq));
    });

    // Proximity fallback: if pointer glides close to a pixel inside the frame,
    // still trigger its pop. Useful when tiny scaled squares are easy to skim past.
    const proximityPx = 14;
    frame.addEventListener('pointermove', (e) => {
        const fr = frame.getBoundingClientRect();
        const scale = fr.width / frame.offsetWidth || 1;
        const x = (e.clientX - fr.left) / scale;
        const y = (e.clientY - fr.top) / scale;

        for (let i = 0; i < squares.length; i++) {
            const sq = squares[i];
            const left = sq.offsetLeft;
            const top = sq.offsetTop;
            const right = left + sq.offsetWidth;
            const bottom = top + sq.offsetHeight;
            const dx = x < left ? left - x : x > right ? x - right : 0;
            const dy = y < top ? top - y : y > bottom ? y - bottom : 0;
            if (dx * dx + dy * dy <= proximityPx * proximityPx) {
                popSquare(sq);
            }
        }
    });
})();


/* ----------------------------------------------------------------------------
 * Play page — Infinite Scroll Canvas + Stickers
 *
 * Mounts on /play.html. Wires up:
 *   • Canvas scroll: wheel / trackpad / touch scroll updates a virtual pan.
 *     .play-world translates with that pan while .play-grid shifts its
 *     background-position from the same pan values, so the grid stays aligned
 *     to world coordinates. The pan is clamped to the outermost card bounds
 *     plus generous edge padding, so the canvas has intentional endpoints.
 *   • Card layout: each .play-card reads data-x/y/w/h/rot in world coords
 *     and gets left/top/width/height/--rot applied at mount.
 *   • Sticker drag: each [data-play-sticker] handles its own pointerdown so
 *     it moves independently of the canvas pan. Positions persist via
 *     localStorage (key: play-sticker-positions, JSON map of
 *     data-sticker-id → {x, y}) so reload preserves the user arrangement.
 *   • Initial pan centres the world's content cluster (~1500, 1000) in the
 *     viewport, then clamps into the finite canvas bounds.
 *
 * No-ops on every other page (the [data-play-canvas] hook isn't there).
 * ------------------------------------------------------------------------- */
(function initPlayCanvas() {
    const canvas = document.querySelector('[data-play-canvas]');
    const world = document.querySelector('[data-play-world]');
    // Grid is a sibling of .play-world that paints the dots + mesh background.
    // It pans in lockstep with the world so the grid stays anchored to world
    // coordinates. Optional — page still works if the element is absent.
    const grid = document.querySelector('[data-play-grid]');
    if (!canvas || !world) return;

    const STORAGE_KEY = 'play-sticker-positions';
    const INITIAL_WORLD_CENTER_X = 1500;
    const INITIAL_WORLD_CENTER_Y = 1000;
    const MIN_EDGE_PADDING = 260;
    const MAX_EDGE_PADDING = 520;
    const EDGE_PADDING_RATIO = 0.45;

    /* Set left / top / width / height / --rot / z-index from data-* attrs.
       Used for both cards and stickers so the HTML stays declarative.
       data-z is optional — when set it overrides the default DOM-order
       stacking, letting overlapping cards layer intentionally. */
    function applyWorldPlacement(el) {
        const x = parseFloat(el.dataset.x || '0');
        const y = parseFloat(el.dataset.y || '0');
        const w = parseFloat(el.dataset.w || '0');
        const h = parseFloat(el.dataset.h || '0');
        const rot = parseFloat(el.dataset.rot || '0');
        const z = parseFloat(el.dataset.z || '');
        if (!Number.isNaN(x)) el.style.left = x + 'px';
        if (!Number.isNaN(y)) el.style.top = y + 'px';
        if (w) el.style.width = w + 'px';
        if (h) el.style.height = h + 'px';
        if (rot) el.style.setProperty('--rot', rot + 'deg');
        if (!Number.isNaN(z)) el.style.zIndex = String(z);
    }

    /* localStorage helpers for sticker persistence */
    function readSavedStickerPositions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }
    function saveStickerPosition(id, x, y) {
        try {
            const all = readSavedStickerPositions();
            all[id] = { x, y };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch (e) {}
    }

    // ── Card placements ──────────────────────────────────────────────
    const cards = Array.from(canvas.querySelectorAll('.play-card'));
    cards.forEach(applyWorldPlacement);

    // ── Sticker placements (initial defaults, then layered saves) ────
    const savedStickers = readSavedStickerPositions();
    canvas.querySelectorAll('[data-play-sticker]').forEach((el) => {
        applyWorldPlacement(el);
        const id = el.dataset.stickerId;
        if (id && savedStickers[id]) {
            el.style.left = savedStickers[id].x + 'px';
            el.style.top = savedStickers[id].y + 'px';
        }
    });

    // ── Canvas scroll pan ─────────────────────────────────────────────
    let panX = 0;
    let panY = 0;
    let contentBounds = getContentBounds();

    function positiveModulo(value, size) {
        return ((value % size) + size) % size;
    }

    function normalizeWheelDelta(e) {
        let dx = e.deltaX;
        let dy = e.deltaY;
        if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            dx *= 16;
            dy *= 16;
        } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            dx *= canvas.clientWidth;
            dy *= canvas.clientHeight;
        }
        if (e.shiftKey && Math.abs(dx) < 1) {
            dx = dy;
            dy = 0;
        }
        return { dx, dy };
    }

    function readGridMetrics() {
        if (!grid) return { dotStep: 30, lineStep: 90 };
        const styles = window.getComputedStyle(grid);
        const firstSize = styles.backgroundSize.split(',')[0] || '';
        const dotStep = parseFloat(firstSize) || 30;
        return {
            dotStep,
            lineStep: dotStep * 3
        };
    }

    function getEdgePadding() {
        const shorterSide = Math.min(canvas.clientWidth, canvas.clientHeight);
        return Math.max(
            MIN_EDGE_PADDING,
            Math.min(MAX_EDGE_PADDING, shorterSide * EDGE_PADDING_RATIO)
        );
    }

    function getContentBounds() {
        if (!cards.length) {
            return {
                minX: INITIAL_WORLD_CENTER_X,
                minY: INITIAL_WORLD_CENTER_Y,
                maxX: INITIAL_WORLD_CENTER_X,
                maxY: INITIAL_WORLD_CENTER_Y
            };
        }
        return cards.reduce((bounds, card) => {
            const x = parseFloat(card.style.left) || 0;
            const y = parseFloat(card.style.top) || 0;
            const w = parseFloat(card.style.width) || card.offsetWidth || 0;
            const h = parseFloat(card.style.height) || card.offsetHeight || 0;
            return {
                minX: Math.min(bounds.minX, x),
                minY: Math.min(bounds.minY, y),
                maxX: Math.max(bounds.maxX, x + w),
                maxY: Math.max(bounds.maxY, y + h)
            };
        }, {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        });
    }

    function clampAxis(value, viewportSize, minContent, maxContent) {
        const edgePadding = getEdgePadding();
        const minPan = viewportSize - maxContent - edgePadding;
        const maxPan = edgePadding - minContent;
        if (minPan > maxPan) return (minPan + maxPan) / 2;
        return Math.max(minPan, Math.min(maxPan, value));
    }

    function clampPan() {
        panX = clampAxis(panX, canvas.clientWidth, contentBounds.minX, contentBounds.maxX);
        panY = clampAxis(panY, canvas.clientHeight, contentBounds.minY, contentBounds.maxY);
    }

    function applyPan() {
        clampPan();
        // Round to integer device-independent pixels so the GPU translates the
        // world by whole pixels. The grid also uses these rounded values to
        // shift background-position, keeping 1px mesh lines crisp.
        const tx = Math.round(panX);
        const ty = Math.round(panY);
        const tf = `translate3d(${tx}px, ${ty}px, 0)`;
        world.style.transform = tf;
        if (grid) {
            const { dotStep, lineStep } = readGridMetrics();
            const dotX = positiveModulo(tx, dotStep);
            const dotY = positiveModulo(ty, dotStep);
            const lineOffset = dotStep / 2;
            const lineX = positiveModulo(tx + lineOffset, lineStep);
            const lineY = positiveModulo(ty + lineOffset, lineStep);
            grid.style.backgroundPosition = `${dotX}px ${dotY}px, ${lineX}px ${lineY}px`;
        }
    }

    function centerInitialPan() {
        const vw = canvas.clientWidth;
        const vh = canvas.clientHeight;
        // Content cluster centre (rough centroid of card positions in HTML).
        panX = vw / 2 - INITIAL_WORLD_CENTER_X;
        panY = vh / 2 - INITIAL_WORLD_CENTER_Y;
        applyPan();
    }

    centerInitialPan();
    window.addEventListener('resize', () => {
        contentBounds = getContentBounds();
        applyPan();
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const { dx, dy } = normalizeWheelDelta(e);
        // Natural scroll: scrolling down/right moves the world up/left,
        // revealing content further down/right in world coordinates.
        panX -= dx;
        panY -= dy;
        applyPan();
    }, { passive: false });

    let touchScrollActive = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartPanX = 0;
    let touchStartPanY = 0;

    canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        if (e.target.closest('[data-play-sticker]')) return;
        touchScrollActive = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        touchStartPanX = panX;
        touchStartPanY = panY;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!touchScrollActive || e.pointerType !== 'touch') return;
        e.preventDefault();
        panX = touchStartPanX + (e.clientX - touchStartX);
        panY = touchStartPanY + (e.clientY - touchStartY);
        applyPan();
    });

    function endTouchScroll(e) {
        if (!touchScrollActive || e.pointerType !== 'touch') return;
        touchScrollActive = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    canvas.addEventListener('pointerup', endTouchScroll);
    canvas.addEventListener('pointercancel', endTouchScroll);

    // ── Stickers (each manages its own drag) ─────────────────────────
    canvas.querySelectorAll('[data-play-sticker]').forEach((sticker) => {
        let dragActive = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartLeft = 0;
        let dragStartTop = 0;

        sticker.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); // sticker touch should drag the sticker, not scroll the canvas
            dragActive = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartLeft = parseFloat(sticker.style.left) || 0;
            dragStartTop = parseFloat(sticker.style.top) || 0;
            sticker.classList.add('is-dragging');
            try { sticker.setPointerCapture(e.pointerId); } catch (_) {}
        });

        sticker.addEventListener('pointermove', (e) => {
            if (!dragActive) return;
            // World scale is 1:1 (only translation), so pointer delta in
            // screen px maps directly to world-coord delta on the sticker.
            sticker.style.left = (dragStartLeft + e.clientX - dragStartX) + 'px';
            sticker.style.top  = (dragStartTop  + e.clientY - dragStartY) + 'px';
        });

        const endDrag = (e) => {
            if (!dragActive) return;
            dragActive = false;
            sticker.classList.remove('is-dragging');
            try { sticker.releasePointerCapture(e.pointerId); } catch (_) {}
            const id = sticker.dataset.stickerId;
            if (id) {
                saveStickerPosition(
                    id,
                    parseFloat(sticker.style.left) || 0,
                    parseFloat(sticker.style.top) || 0
                );
            }
        };
        sticker.addEventListener('pointerup', endDrag);
        sticker.addEventListener('pointercancel', endDrag);
    });
})();

