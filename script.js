/*
// =============================================
// Sunlit Light System (sunlit.place style)
// Generates window-blind shadow bars via JS
// =============================================

const shuttersEl = document.getElementById('shutters');
const sunlitContainer = document.getElementById('sunlit-container');
const nightOverlay = document.getElementById('night-overlay');

let isNight = false;
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let shutterElements = []; // Store references to shutter divs

// Calculate shutter count
function getShutterCount() {
    return Math.ceil(screenHeight / 36);
}

// Create the initial shutter DOM elements
function createShutters() {
    if (!shuttersEl) return;
    shuttersEl.innerHTML = '';
    shutterElements = [];

    const count = getShutterCount();
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'shutter';
        shuttersEl.appendChild(div);
        shutterElements.push(div);
    }

    // Apply initial positions (no transition on first paint)
    updateShutterPositions(false);
}

// Update positions/sizes of existing shutter elements
// If `animate` is true, CSS transitions will handle the animation
function updateShutterPositions(animate = true) {
    const shutterHeight = screenWidth < 600 ? 42 : 56;
    const shutterGap = screenWidth < 600 ? 16 : 8;
    const totalHeight = shutterHeight + shutterGap;
    const stagger = 0.01 * screenWidth;

    const multiplier = isNight ? 1.15 : 1;
    const height = isNight ? 20 : shutterHeight;
    const count = shutterElements.length;

    // Stagger delay per bar (cascading blind roll effect)
    const delayPerBar = 0.015; // 15ms between each bar

    shutterElements.forEach((div, i) => {
        const top = i * totalHeight * multiplier - 300;
        const left = stagger * i;

        if (animate) {
            // Apply staggered delay — bars cascade from top to bottom
            div.style.transitionDelay = `${i * delayPerBar}s`;
        } else {
            // Instant reposition on resize — no transitions
            div.style.transition = 'none';
            div.style.transitionDelay = '0s';
        }

        div.style.top = `${top}px`;
        div.style.left = `-${left}px`;
        div.style.height = `${height}px`;
    });

    // Re-enable transitions after instant reposition
    if (!animate) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                shutterElements.forEach(div => {
                    div.style.transition = '';
                    div.style.transitionDelay = '0s';
                });
            });
        });
    }
}

// Initialize shutters on load
createShutters();
*/

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
                    <a href="resume.html" class="nav-item${isActive('resume')}">resume</a>
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
                <a href="resume.html" class="nav-item">resume</a>
                <a href="contact.html" class="nav-item">contact</a>
            </div>
        </header>
    `;
    bindThemeToggle();
}

const footerMounts = document.querySelectorAll('[data-site-footer]');

// Shared scenery (clouds + grassland) that appears on every page that mounts a
// footer. Lives outside the `.container` so it can overflow the page width.
const footerSceneryHtml = `
    <img class="footer-cloud footer-cloud--left" src="asset/cloud%20left.png" alt="" aria-hidden="true">
    <img class="footer-cloud footer-cloud--right" src="asset/cloud%20+%20sun.png" alt="" aria-hidden="true">

    <div class="footer-grassland" aria-hidden="true">
        <img src="asset/grassland%20footer.png" alt="">
    </div>
`;

footerMounts.forEach(mount => {
    const variant = mount.getAttribute('data-site-footer');

    if (variant === 'minimal') {
        // Used on every page except the homepage — only the clouds + grassland
        // scenery, no CTA / sticky note / copyright row.
        mount.innerHTML = `
            <footer class="site-footer site-footer--minimal">
                ${footerSceneryHtml}
            </footer>
        `;
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

            ${footerSceneryHtml}
        </footer>
    `;
});

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

    // Mouse Interaction (Removed per request)
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
 * Hero hover motion — ported from `mwg_000` (Made With GSAP tutorial 000).
 * Uses bundled `asset/InertiaPlugin.min.js` + same delta / inertia / rotate timeline pattern.
 * @see https://madewithgsap.com/effects/tutorial000
 */
(function initHeroMwg000Inertia() {
    const HERO_GSAP_INERTIA_ENABLED = false;
    if (!HERO_GSAP_INERTIA_ENABLED) return;
    if (typeof gsap === 'undefined' || typeof InertiaPlugin === 'undefined') return;

    const root = document.querySelector('.hero-figma__canvas');
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    if (reducedMotion.matches) return;

    gsap.registerPlugin(InertiaPlugin);

    let oldX = 0;
    let oldY = 0;
    let deltaX = 0;
    let deltaY = 0;

    root.addEventListener('mouseenter', (e) => {
        oldX = e.clientX;
        oldY = e.clientY;
        deltaX = 0;
        deltaY = 0;
    });

    root.addEventListener('mousemove', (e) => {
        deltaX = e.clientX - oldX;
        deltaY = e.clientY - oldY;
        oldX = e.clientX;
        oldY = e.clientY;
    });

    function playMwgTimeline(target) {
        gsap.killTweensOf(target);

        const tl = gsap.timeline({
            onComplete: () => {
                tl.kill();
            },
        });
        tl.timeScale(1.2);

        tl.to(target, {
            inertia: {
                x: {
                    velocity: deltaX * 30,
                    end: 0,
                },
                y: {
                    velocity: deltaY * 30,
                    end: 0,
                },
            },
        });
        tl.fromTo(
            target,
            { rotation: 0 },
            {
                duration: 0.4,
                rotation: (Math.random() - 0.5) * 30,
                yoyo: true,
                repeat: 1,
                ease: 'power1.inOut',
            },
            '<'
        );
    }

    root.querySelectorAll('.hero-figma__media').forEach((mediaEl) => {
        mediaEl.addEventListener('mouseenter', () => {
            if (reducedMotion.matches || coarsePointer.matches) return;
            playMwgTimeline(mediaEl);
        });
    });
})();

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
 * Play page — Bento Card Popout (FLIP container transform)
 *
 * Mounts on /play.html. Each [data-play-card] in #play-wall behaves like:
 *   • Hover  → CSS-only "container transform" (hovered card scales up,
 *              siblings squeeze + dim — see .play-bento-grid styles).
 *   • Click  → clone the card, FLIP-animate it from its grid rect into the
 *              centered .play-popout__stage, fade in the caption (data-title +
 *              data-detail). Backdrop / × / Esc reverses the animation back
 *              into the source card's rect, then removes the clone.
 *
 * The original card stays in the DOM (visibility: hidden via .is-popout-source)
 * so the grid layout doesn't shift while the popout is open.
 *
 * No-ops on every other page because #play-popout / #play-wall aren't there.
 * ------------------------------------------------------------------------- */
(function initPlayBentoPopout() {
    const grid = document.getElementById('play-wall');
    const popout = document.getElementById('play-popout');
    if (!grid || !popout) return;

    const stage = popout.querySelector('[data-popout-stage]');
    const titleEl = popout.querySelector('.play-popout__title');
    const detailEl = popout.querySelector('.play-popout__detail');
    if (!stage || !titleEl || !detailEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const TWEEN_MS = 520;     // matches the CSS transition timing
    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

    let activeCard = null;    // the source .work-card
    let clone = null;         // the lifted clone
    let isOpen = false;
    let isAnimating = false;

    /* Build a clone of the source card, set position: fixed at the source's
       on-screen rect, and append it to the popout. The clone keeps its own
       <video>/<img> alive so playback continues seamlessly. */
    function buildClone(card) {
        const c = card.cloneNode(true);
        c.classList.add('play-popout__clone');
        c.removeAttribute('data-play-card');
        c.removeAttribute('id');
        // cloneNode preserves attributes but not the muted IDL state on <video>.
        // Re-apply so the clone autoplays in browsers that block sound.
        c.querySelectorAll('video').forEach((v) => {
            v.muted = true;
            v.setAttribute('muted', '');
            v.setAttribute('playsinline', '');
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
        });
        return c;
    }

    /* Read the source card's centre + unrotated size + transform.
       Using offsetWidth/Height (not getBoundingClientRect's rotated bbox)
       lets the clone start at exactly the visual position of the source
       even when the source has a rotation applied. */
    function readCardGeometry(card) {
        const bbox = card.getBoundingClientRect();
        return {
            centerX: bbox.left + bbox.width / 2,
            centerY: bbox.top + bbox.height / 2,
            width: card.offsetWidth || bbox.width,
            height: card.offsetHeight || bbox.height,
            transform: getComputedStyle(card).transform || 'none',
        };
    }

    /* Compute a stage rect that respects the source's aspect ratio,
       fitting inside a max bounding box centred in the viewport. This
       way a square source morphs to a square popout, a 4:5 to a 4:5,
       etc., instead of always stretching to a fixed-aspect stage. */
    function computeStageRect(card) {
        const aspect = (card.offsetWidth || 1) / (card.offsetHeight || 1);
        const maxW = Math.min(window.innerWidth * 0.6, 600);
        const maxH = Math.min(window.innerHeight * 0.78, 760);
        let w, h;
        if (aspect >= maxW / maxH) {
            w = maxW;
            h = maxW / aspect;
        } else {
            h = maxH;
            w = maxH * aspect;
        }
        return {
            width: w,
            height: h,
            left: (window.innerWidth - w) / 2,
            top: (window.innerHeight - h) / 2,
        };
    }

    function open(card) {
        if (isOpen || isAnimating) return;
        isAnimating = true;
        activeCard = card;

        // Fill the caption + announce.
        titleEl.textContent = card.dataset.title || '';
        detailEl.textContent = card.dataset.detail || '';

        const from = readCardGeometry(card);
        const target = computeStageRect(card);

        // Resize the stage element to the target rect so screen-readers
        // and any future hit-testing reflect the actual popout area.
        stage.style.width = target.width + 'px';
        stage.style.height = target.height + 'px';

        clone = buildClone(card);
        clone.style.position = 'fixed';
        clone.style.top = (from.centerY - from.height / 2) + 'px';
        clone.style.left = (from.centerX - from.width / 2) + 'px';
        clone.style.width = from.width + 'px';
        clone.style.height = from.height + 'px';
        clone.style.transform = from.transform;
        clone.style.transformOrigin = 'center center';
        popout.appendChild(clone);

        // Force layout so the browser sees the start state before we transition.
        // eslint-disable-next-line no-unused-expressions
        clone.getBoundingClientRect();

        card.classList.add('is-popout-source');
        grid.classList.add('is-popout-open');
        popout.classList.add('is-open');
        popout.setAttribute('aria-hidden', 'false');

        const duration = reducedMotion.matches ? 0 : TWEEN_MS;
        clone.style.transition = `top ${duration}ms ${EASE}, left ${duration}ms ${EASE}, width ${duration}ms ${EASE}, height ${duration}ms ${EASE}, transform ${duration}ms ${EASE}, box-shadow ${duration}ms ${EASE}`;

        // Kick the morph on the next frame so the transition fires.
        // Animate to the centred stage rect AND unwind the rotation.
        requestAnimationFrame(() => {
            clone.style.top = target.top + 'px';
            clone.style.left = target.left + 'px';
            clone.style.width = target.width + 'px';
            clone.style.height = target.height + 'px';
            clone.style.transform = 'none';
        });

        const finish = () => {
            isAnimating = false;
            isOpen = true;
        };
        if (duration === 0) finish();
        else setTimeout(finish, duration);
    }

    function close() {
        if (!isOpen || isAnimating || !clone || !activeCard) return;
        isAnimating = true;
        // Re-measure the source — viewport may have scrolled.
        const back = readCardGeometry(activeCard);

        const duration = reducedMotion.matches ? 0 : TWEEN_MS;
        clone.style.transition = `top ${duration}ms ${EASE}, left ${duration}ms ${EASE}, width ${duration}ms ${EASE}, height ${duration}ms ${EASE}, transform ${duration}ms ${EASE}, box-shadow ${duration}ms ${EASE}, opacity ${duration}ms ${EASE}`;

        popout.classList.remove('is-open');
        popout.setAttribute('aria-hidden', 'true');

        requestAnimationFrame(() => {
            clone.style.top = (back.centerY - back.height / 2) + 'px';
            clone.style.left = (back.centerX - back.width / 2) + 'px';
            clone.style.width = back.width + 'px';
            clone.style.height = back.height + 'px';
            clone.style.transform = back.transform;
            // The clone's box-shadow softens back to the card's resting shadow.
            clone.style.boxShadow = '0 14px 32px rgba(40, 28, 16, 0.14)';
        });

        const finish = () => {
            if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
            clone = null;
            if (activeCard) activeCard.classList.remove('is-popout-source');
            grid.classList.remove('is-popout-open');
            activeCard = null;
            isOpen = false;
            isAnimating = false;
        };
        if (duration === 0) finish();
        else setTimeout(finish, duration);
    }

    // Card click → open
    grid.querySelectorAll('[data-play-card]').forEach((card) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            open(card);
        });
        // Enable keyboard activation.
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(card);
            }
        });
    });

    // Backdrop / close button
    popout.querySelectorAll('[data-popout-close]').forEach((el) => {
        el.addEventListener('click', close);
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) close();
    });

    // Re-measure & resnap if the viewport resizes while open. We don't want a
    // stale rect to leave the clone offset, so just reflow it onto the stage.
    window.addEventListener('resize', () => {
        if (!isOpen || !clone) return;
        const stageRect = stage.getBoundingClientRect();
        clone.style.transition = 'none';
        setRect(clone, stageRect);
        // Force reflow then restore transition for a future close anim.
        // eslint-disable-next-line no-unused-expressions
        clone.getBoundingClientRect();
        clone.style.transition = '';
    });
})();
