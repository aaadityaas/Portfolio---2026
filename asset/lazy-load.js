/* ----------------------------------------------------------------------------
 * lazy-load.js — Preload all page images, GIFs, and videos before display.
 *
 * - [data-lazy-bg] / img[data-src] → fetched then applied
 * - img[src], video, source, poster → preloaded into browser cache
 * - Exposes PortfolioMediaPreload.ready for the portfolio loader
 * ------------------------------------------------------------------------- */

(function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    const PRELOAD_CONCURRENCY = 8;
    const VIDEO_PRELOAD_TIMEOUT_MS = 14000;

    const preloadedUrls = new Set();
    let readyResolve;
    let readyDone = false;

    const ready = new Promise((resolve) => {
        readyResolve = resolve;
    });

    function markReady() {
        if (readyDone) return;
        readyDone = true;
        readyResolve();
    }

    function resolveUrl(raw) {
        if (!raw || typeof raw !== 'string') return '';
        const trimmed = raw.trim();
        if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
        try {
            return new URL(trimmed, window.location.href).href;
        } catch (_) {
            return trimmed;
        }
    }

    function escapeCssUrl(url) {
        return String(url).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function isVideoUrl(url) {
        return /\.(mp4|m4v|mov|webm|ogv|avi|mkv)(\?|#|$)/i.test(url);
    }

    function applyLazyBg(el) {
        const url = el.getAttribute('data-lazy-bg');
        if (!url || el.dataset.lazyLoaded === 'true') return;
        el.style.backgroundImage = `url('${escapeCssUrl(url)}')`;
        el.dataset.lazyLoaded = 'true';
        el.dispatchEvent(new CustomEvent('lazy-bg-loaded', {
            bubbles: true,
            detail: { url }
        }));
    }

    function applyLazyImg(el) {
        const src = el.getAttribute('data-src');
        if (!src || el.dataset.lazyLoaded === 'true') return;
        el.src = src;
        el.removeAttribute('data-src');
        el.dataset.lazyLoaded = 'true';
    }

    function applyAllDeferred(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('[data-lazy-bg]:not([data-lazy-loaded])').forEach(applyLazyBg);
        scope.querySelectorAll('img[data-src]:not([data-lazy-loaded])').forEach(applyLazyImg);
    }

    function collectMediaUrls(root) {
        const urls = new Set();
        const scope = root && root.querySelectorAll ? root : document;

        scope.querySelectorAll('[data-lazy-bg]').forEach((el) => {
            const url = el.getAttribute('data-lazy-bg');
            if (url) urls.add(url);
        });

        scope.querySelectorAll('img[data-src]').forEach((el) => {
            const url = el.getAttribute('data-src');
            if (url) urls.add(url);
        });

        scope.querySelectorAll('img[src]').forEach((el) => {
            const url = el.getAttribute('src');
            if (url && !url.startsWith('data:') && !url.startsWith('blob:')) urls.add(url);
        });

        scope.querySelectorAll('video[src]').forEach((el) => {
            const url = el.getAttribute('src');
            if (url) urls.add(url);
        });

        scope.querySelectorAll('video source[src]').forEach((el) => {
            const url = el.getAttribute('src');
            if (url) urls.add(url);
        });

        scope.querySelectorAll('video[poster]').forEach((el) => {
            const url = el.getAttribute('poster');
            if (url) urls.add(url);
        });

        scope.querySelectorAll('[style*="background-image"]').forEach((el) => {
            const match = el.style.backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
            if (match && match[2]) urls.add(match[2]);
        });

        return urls;
    }

    function preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            img.src = url;
        });
    }

    function preloadVideo(url) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
            let finished = false;
            const done = () => {
                if (finished) return;
                finished = true;
                video.removeAttribute('src');
                video.load();
                resolve();
            };
            video.addEventListener('loadeddata', done, { once: true });
            video.addEventListener('canplaythrough', done, { once: true });
            video.addEventListener('error', done, { once: true });
            window.setTimeout(done, VIDEO_PRELOAD_TIMEOUT_MS);
            video.src = url;
            video.load();
        });
    }

    function preloadUrl(rawUrl) {
        const url = resolveUrl(rawUrl);
        if (!url || preloadedUrls.has(url)) return Promise.resolve();
        preloadedUrls.add(url);
        if (isVideoUrl(url)) return preloadVideo(url);
        return preloadImage(url);
    }

    async function runPreloadPool(urls) {
        const list = [...urls];
        let index = 0;

        async function worker() {
            while (index < list.length) {
                const url = list[index++];
                try {
                    await preloadUrl(url);
                } catch (_) { /* continue */ }
            }
        }

        const workers = Array.from(
            { length: Math.min(PRELOAD_CONCURRENCY, list.length || 1) },
            () => worker()
        );
        await Promise.all(workers);
    }

    async function preloadAll(root = document) {
        applyAllDeferred(root);
        const urls = collectMediaUrls(root);
        applyAllDeferred(root);
        collectMediaUrls(root).forEach((url) => urls.add(url));
        await runPreloadPool(urls);
        applyAllDeferred(root);
    }

    let threePromise = null;

    function loadThreeJs() {
        if (typeof THREE !== 'undefined') return Promise.resolve();
        if (threePromise) return threePromise;
        threePromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = THREE_URL;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                threePromise = null;
                reject(new Error('THREE failed to load'));
            };
            document.head.appendChild(script);
        });
        return threePromise;
    }

    const loadedScripts = new Set();

    function loadScript(src) {
        if (!src || loadedScripts.has(src)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = () => reject(new Error(`Script failed: ${src}`));
            document.body.appendChild(script);
        });
    }

    let heroBootStarted = false;

    function bootHeroEffects() {
        if (heroBootStarted || !document.getElementById('hero-dappled-canvas')) return Promise.resolve();
        heroBootStarted = true;
        return loadThreeJs()
            .then(() => Promise.all([
                loadScript('asset/dappled-light-shader.js?v=preload-media-1'),
                loadScript('asset/leaf-fall.js')
            ]))
            .catch(() => { /* decorative */ });
    }

    let preloadChain = Promise.resolve();

    function queuePreload(root) {
        preloadChain = preloadChain
            .then(() => preloadAll(root))
            .catch(() => {});
        return preloadChain;
    }

    function startPagePreload() {
        bootHeroEffects();
        queuePreload(document).then(() => {
            if (!document.documentElement.dataset.caseStudyId) {
                markReady();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPagePreload, { once: true });
    } else {
        startPagePreload();
    }

    if (typeof MutationObserver === 'function') {
        const mo = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    queuePreload(node);
                });
            });
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }

    const api = {
        ready,
        markReady,
        preloadAll,
        preloadUrl,
        applyLazyBg,
        applyLazyImg,
        scan: (root) => queuePreload(root || document),
        observe: (el) => {
            applyLazyBg(el);
            applyLazyImg(el);
            return queuePreload(el);
        },
        loadThreeJs,
        bootHeroEffects
    };

    window.PortfolioMediaPreload = api;
    window.PortfolioLazyLoad = api;
})();
