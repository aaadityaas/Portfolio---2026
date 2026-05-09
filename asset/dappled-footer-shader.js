/* ----------------------------------------------------------------------------
 * dappled-footer-shader.js — Soft dappled-shadow band painted onto the very
 * bottom 400px of every page. Same Three.js / WebGL approach as the hero
 * dappled-light shader; the page background shows through everywhere
 * outside the shadow so it reads like sunlight pooling on the ground.
 *
 * - Mask:  asset/sunlight-shadow.png  (~800x533, soft sunlight beams)
 * - Renders a single instance of the mask stretched to fill the entire
 *   footer band (full width, full 400px height) so the diagonal beams
 *   read as gentle near-horizontal sunlight slants across the page bottom.
 * - Mounts onto the first <canvas> inside any [data-dappled-footer] element.
 * - Theme aware: light mode paints a warm grey shadow on the cream bg,
 *   dark mode flips and paints a soft warm glow on the dark bg so the
 *   pattern stays visible under both palettes.
 * - Subtle wind sway: the sample UV is gently rotated and translated over
 *   time with multi-frequency sin/cos so the dappled pattern feels like
 *   real shadow from leaves swaying in a breeze, never repeating exactly.
 * - prefers-reduced-motion: drops to a single static frame.
 * - Pauses when scrolled offscreen and when the tab is hidden so we never
 *   burn cycles on a band the user can't see.
 *
 * Waits for both the canvas (injected by script.js) and the THREE global
 * to be available, so script load order doesn't matter.
 * ------------------------------------------------------------------------- */

(function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const reducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    function whenCanvas(cb) {
        const find = () => document.querySelector('[data-dappled-footer] canvas');
        const existing = find();
        if (existing) { cb(existing); return; }
        const mo = new MutationObserver(() => {
            const el = find();
            if (el) { mo.disconnect(); cb(el); }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }

    function whenThree(cb) {
        if (typeof THREE !== 'undefined') { cb(); return; }
        let tries = 0;
        const id = setInterval(() => {
            if (typeof THREE !== 'undefined') {
                clearInterval(id);
                cb();
            } else if (++tries > 200) {
                clearInterval(id);
                console.warn('[dappled-footer] THREE never became available');
            }
        }, 50);
    }

    ready(() => whenCanvas((canvas) => whenThree(() => mount(canvas))));

    /* ------------------------------------------------------------------ */

    function mount(canvas) {
        // Light mode: warm grey shadow on cream ground.
        // Dark  mode: soft warm halo on dark ground (dapple becomes moonlight).
        const TINT_SHADOW = new THREE.Vector3(0.205, 0.190, 0.165); // #34302A
        const TINT_GLOW   = new THREE.Vector3(0.520, 0.470, 0.380); // #857861

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: false,
                alpha: true,
                premultipliedAlpha: true
            });
        } catch (err) {
            console.warn('[dappled-footer] WebGL unavailable; leaving canvas blank', err);
            return;
        }
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0); // transparent — page bg shows through

        const scene  = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const vertexShader = /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = /* glsl */ `
            varying vec2 vUv;

            uniform sampler2D uMask;
            uniform float uTime;
            uniform vec3  uShadowTint;
            uniform vec3  uGlowTint;
            uniform float uIsDark;
            uniform float uIntensity;

            mat2 rot2(float a) {
                float c = cos(a);
                float s = sin(a);
                return mat2(c, -s, s, c);
            }

            void main() {
                // Stretch-to-fit: the entire mask spans the entire canvas.
                vec2 baseUv = vUv;

                // Wind sway. Multi-frequency sin/cos so the motion never
                // exactly repeats — feels like an organic breeze, not a
                // machine. Amplitudes stay small so the field doesn't drift
                // far enough to reveal any clamped edges of the mask.
                float t = uTime * 0.55;
                float twist = sin(t * 0.65) * 0.022
                            + sin(t * 1.83) * 0.008;
                vec2 sway = vec2(
                    sin(t)            * 0.018
                  + sin(t * 0.43)     * 0.010,
                    cos(t * 0.71)     * 0.005
                  + sin(t * 1.27)     * 0.003
                );

                // Rotate the sampling UV around the centre of the canvas so
                // the whole field gently rocks left/right (like a branch
                // swinging) on top of the linear sway.
                vec2 anchor = vec2(0.5, 0.5);
                vec2 local  = baseUv - anchor;
                local       = rot2(twist) * local;
                vec2 sampleUv = local + anchor + sway;

                vec4 src = texture2D(uMask, sampleUv);

                // Greyscale of the mask. Dark pixels = shadow, light = openings.
                float lum = dot(src.rgb, vec3(0.299, 0.587, 0.114));

                // Light mode reads the dark areas as shadow density;
                // dark mode flips and reads the light areas as glow density.
                float densityLight = smoothstep(0.10, 0.92, (1.0 - lum) * src.a);
                float densityDark  = smoothstep(0.30, 0.95, lum * src.a);
                float density = mix(densityLight, densityDark, uIsDark);

                // Soft top/bottom feather so the strip never hard-cuts at
                // the canvas edges — looks like the shadow naturally fades
                // into the page above and into nothing below.
                float fade =
                      smoothstep(0.0, 0.18, vUv.y)
                    * smoothstep(1.0, 0.82, vUv.y);
                density *= fade * uIntensity;

                // Tiny breath on density so even still pixels shimmer.
                density *= 0.94 + 0.06 * sin(uTime * 0.9 + vUv.x * 4.0);

                vec3 tint = mix(uShadowTint, uGlowTint, uIsDark);

                // Premultiplied alpha — paired with CustomBlending below.
                gl_FragColor = vec4(tint * density, density);
            }
        `;

        const uniforms = {
            uMask:        { value: null },
            uTime:        { value: 0 },
            uShadowTint:  { value: TINT_SHADOW.clone() },
            uGlowTint:    { value: TINT_GLOW.clone() },
            uIsDark:      { value: 0 },
            uIntensity:   { value: 0.62 }
        };

        function applyTheme() {
            const dark = document.body && document.body.classList.contains('night-mode');
            uniforms.uIsDark.value = dark ? 1.0 : 0.0;
            // Glows on dark bg need a touch more lift than shadows on light bg
            // to read as "the same effect" — bump intensity in dark mode.
            uniforms.uIntensity.value = dark ? 0.78 : 0.62;
        }
        applyTheme();
        if (typeof MutationObserver !== 'undefined' && document.body) {
            const themeMo = new MutationObserver(applyTheme);
            themeMo.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            blendEquationAlpha: THREE.AddEquation,
            blendSrcAlpha: THREE.OneFactor,
            blendDstAlpha: THREE.OneMinusSrcAlphaFactor
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);

        function sizeFromCanvas() {
            const w = Math.max(1, canvas.clientWidth | 0);
            const h = Math.max(1, canvas.clientHeight | 0);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
        }
        sizeFromCanvas();

        const loader = new THREE.TextureLoader();
        loader.load(
            'asset/sunlight-shadow.png',
            (tex) => {
                // Single instance, no tiling — clamp on both axes so any
                // sample at the very edge stays inside the source image.
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy
                    ? renderer.capabilities.getMaxAnisotropy()
                    : 1;
                uniforms.uMask.value = tex;
            },
            undefined,
            (err) => console.warn('[dappled-footer] failed to load mask png', err)
        );

        window.addEventListener('resize', sizeFromCanvas);
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(sizeFromCanvas).observe(canvas);
        }

        // ----------------------------------------------------------- visibility

        let documentVisible = !document.hidden;
        document.addEventListener('visibilitychange', () => {
            documentVisible = !document.hidden;
            if (documentVisible && rafId === null) {
                clock.start();
                rafId = requestAnimationFrame(tick);
            }
        });

        let inView = true;
        if (typeof IntersectionObserver !== 'undefined') {
            new IntersectionObserver((entries) => {
                inView = entries[0].isIntersecting;
                if (inView && rafId === null && documentVisible) {
                    clock.start();
                    rafId = requestAnimationFrame(tick);
                }
            }, { rootMargin: '200px 0px' }).observe(canvas);
        }

        // -------------------------------------------------------------- loop

        const clock = new THREE.Clock();
        let rafId = null;

        function tick() {
            if (!documentVisible || !inView) {
                rafId = null;
                return;
            }
            // prefers-reduced-motion: render one calm frame and stop the
            // loop until the canvas comes back into view.
            if (reducedMotion.matches) {
                uniforms.uTime.value = 0.0;
                renderer.render(scene, camera);
                rafId = null;
                return;
            }
            uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);

        if (typeof reducedMotion.addEventListener === 'function') {
            reducedMotion.addEventListener('change', () => {
                if (rafId === null && documentVisible && inView) {
                    clock.start();
                    rafId = requestAnimationFrame(tick);
                }
            });
        }
    }
})();
