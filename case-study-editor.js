/* =============================================================================
   Case Study Editor — Notion/Framer-style in-place editor for project-1.html
   -----------------------------------------------------------------------------
   - View mode: page renders exactly like a published case study.
   - Edit mode: every text node is contenteditable, every media slot accepts
     drag-and-drop, every block has a hover toolbar (drag handle, change
     layout/style, delete), and there's a "+" inserter between blocks and
     between sections to add new content.
   - Storage: localStorage draft (auto-saved on every change).
   - Publish: downloads a JSON snapshot you can commit to the repo, and also
     copies the same JSON into the "published" slot (rendered when ?mode=view
     or when the Publish button is the last action).
   - Import: load a JSON file to replace the current draft.

   The data model intentionally matches what the previous sync script used so
   any existing default content keeps rendering. Adding new block types is a
   matter of (a) adding a renderer, (b) declaring it in BLOCK_REGISTRY, and
   (c) optionally adding inline controls in the block toolbar.
   ============================================================================= */

(() => {
    'use strict';

    const CASE_ID = document.documentElement.dataset.caseStudyId;
    if (!CASE_ID) return;

    // Bumped Zapp to v3 so the new Figma-authored case-study content
    // is not masked by an older browser draft in localStorage.
    const CONTENT_VERSION = CASE_ID === 'zapp-account' ? 'v3' : 'v2';
    const STORAGE_KEY = `cs-editor-draft:${CONTENT_VERSION}:${CASE_ID}`;
    const PUBLISHED_KEY = `cs-editor-published:${CONTENT_VERSION}:${CASE_ID}`;
    const SECTION_ID_MAP = {
        overview: 'cs-overview',
        problem: 'cs-problem',
        process: 'cs-process',
        design: 'cs-design',
        deferred: 'cs-deferred',
        impact: 'cs-impact',
        reflection: 'cs-reflection'
    };

    /* ---------------------------------------------------------------------------
       DEFAULT CONTENT
       --------------------------------------------------------------------------- */
    /* Meta row schema: ordered cells displayed under the title.
       Each cell = { key, label, value } — fully editable in edit mode. */
    function defaultMeta() {
        return [
            { key: 'role',     label: 'Role',     value: 'Product Designer' },
            { key: 'timeline', label: 'Timeline', value: '' },
            { key: 'team',     label: 'Team',     value: '' },
            { key: 'platform', label: 'Platform', value: '' }
        ];
    }

    function blankDoc(id, title) {
        return {
            id,
            title,
            subtitle: '',
            meta: defaultMeta(),
            hero: { type: 'image', src: '', alt: '' },
            sections: [
                { id: 'impact',  label: 'Impact',  blocks: [
                    { type: 'impact', headline: 'Headline outcome', body: 'Short supporting line that grounds the outcome.' }
                ] },
                { id: 'context', label: 'Project context', blocks: [
                    { type: 'text', body: 'Write the project context here.' }
                ] }
            ]
        };
    }

    const DEFAULT_DOCS = {
        'zapp-account': {
            id: 'zapp-account',
            title: 'Zapp Account: Building it right from the start',
            subtitle: 'Rebranding & rebuilding the a product from scratch. New name, new design system, new codebase, and a fundamentally different way for users to get access to it.',
            meta: [
                { key: 'timeline', label: 'Timeline', value: '2023–24' },
                { key: 'platform', label: 'Platform', value: 'iOS, Android' },
                { key: 'role',     label: 'Role',     value: 'UX Designer II' },
                { key: 'team',     label: 'Team',     value: '2 UX Designer, 2 Product Manager, 4 Developer' }
            ],
            hero: { type: 'image', src: '', alt: 'Zapp Account hero' },
            sections: [
                { id: 'overview', label: 'Overview', blocks: [
                    { type: 'meta' },
                    { type: 'section-label', label: 'Overview' },
                    { type: 'text', body: 'We were given a rare brief — take a product that millions of people use, throw out everything, and start over.\nNew name, new code, new design. No legacy constraints.' },
                    { type: 'text', body: 'Zapp Account is HDFC Bank\'s reimagined digital wallet — rebuilt from scratch in partnership with Zeta.\nNew name, new identity, new codebase in Flutter, and a fundamentally different model for how users could get access to it. What made this different from a rebrand: the product had a structural limitation that no amount of visual redesign could fix. We had to solve that first.' },
                    { type: 'metrics', items: [
                        { stat: 'X%', label: 'Growth in User adoption post launch', note: '' },
                        { stat: 'X Million+', label: 'Monthly active users reached within 6 months', note: '' },
                        { stat: 'X%', label: 'Growth in User adoption post launch', note: '' }
                    ] }
                ] },
                { id: 'problem', label: 'Problem', blocks: [
                    { type: 'section-label', label: 'Problem' },
                    { type: 'text', body: 'PayZapp has had a digital wallet for quite some time, but it hasn\'t effectively attracted new users. Despite having UPI functionality, many users remain unaware of it and aren\'t engaging with the product as we hoped. To address this, we need to clarify our user acquisition strategy and boost both active usage and new sign-ups. It\'s essential to define the value proposition we want to communicate to potential users.' },
                    { type: 'text', body: 'To address this challenge, we should broaden our approach by refining our user acquisition strategy and boosting both active engagement and new registrations. Since this is an HDFC Bank product, it\'s important to highlight the core value they offer, as they are sponsoring this significant transformation to attract a wider audience.' }
                ] },
                { id: 'process', label: 'Process', blocks: [
                    { type: 'section-label', label: 'Process' },
                    { type: 'eyebrow-heading', eyebrow: '', headline: 'The Old Scenario' },
                    { type: 'text', body: 'PayZapp has had a digital wallet for quite some time, but it hasn\'t effectively attracted new users. Despite having UPI functionality, many users remain unaware of it and aren\'t engaging with the product as we hoped. To address this, we need to clarify our user acquisition strategy and boost both active usage and new sign-ups. It\'s essential to define the value proposition we want to communicate to potential users.' },
                    { type: 'text', body: 'PayZapp Wallet had already introduced UPI — about four to five months before the rebrand initiative began. The feature was live, it was working, and it had moved some metrics. But there was a problem: almost nobody knew about it.\nNo meaningful UI change had been made to reflect this addition. No communication had gone out to nudge existing users. The product had quietly gained a significant capability and then said nothing about it. As a result, active usage stayed low — not because the feature didn\'t work, but because the product didn\'t tell its own story.' },
                    { type: 'horizontal', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'horizontal', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'text', body: 'This set the starting point for the rebrand. Before designing anything new, I needed to understand what the data was actually saying — who was using the product, where they were dropping off, and what they were ignoring.' },
                    { type: 'metrics', items: [
                        { stat: 'X%', label: 'Growth in User adoption post launch', note: '' },
                        { stat: 'X Million+', label: 'Monthly active users reached within 6 months', note: '' },
                        { stat: 'X%', label: 'Growth in User adoption post launch', note: '' }
                    ] },
                    { type: 'text', body: 'The goal wasn\'t just to ship a new visual language. It was to design a product that could speak to both the users already in the ecosystem and the new ones we needed to acquire — and make sure neither group felt like the product wasn\'t built for them.\nThat meant the first question wasn\'t a design question. It was: who is this product actually for?' },
                    { type: 'eyebrow-heading', eyebrow: '', headline: 'The Proposed Direction' },
                    { type: 'text', body: 'The brief from the bank was clear: relaunch with a new identity, new name, and a stronger reason for users to come back. But the real challenge wasn\'t the rebrand — it was adoption. How do you re-introduce a product to people who\'ve already dismissed it, without making them feel like they\'re being sold something new?' },
                    { type: 'image', layout: 'wide', src: '', alt: 'Zapp Account hero screens' },
                    { type: 'text', body: 'Multiple rounds of conversations with the HDFC team helped shape this. The goal wasn\'t to hide the history of PayZapp — it was to build on it. Existing users needed continuity. New users needed a reason to care.' },
                    { type: 'text', body: 'Two things had to be true from the start:\n• Give users real value, immediately. Not a promise of features later — actual utility from day one.\n• Don\'t make it feel like a migration. The transition from PayZapp Wallet to Zapp Account had to feel like an upgrade, not a replacement.\nThis shaped every design decision that followed.' }
                ] },
                { id: 'design', label: 'Design', blocks: [
                    { type: 'section-label', label: 'Design' },
                    { type: 'eyebrow-heading', eyebrow: '', headline: 'Rounds of iteration' },
                    { type: 'text', body: 'Nothing came easy. The product went through multiple rounds of direction changes — across product managers, bank leadership, and internal teams. Information architecture was rethought more than once. What looked right one week got challenged the next.' },
                    { type: 'image', layout: 'wide', src: '', alt: 'Zapp Account hero screens' },
                    { type: 'text', body: 'Every round made the product sharper. Here\'s what we landed on.' },
                    { type: 'horizontal', headline: 'Let’s Onboard you', text: 'Getting a new user in — someone with no HDFC history — required a flow that felt fast and guided. We refined the onboarding to reduce friction at every step, with Video KYC as the centrepiece. The handoff to and from the SDK had to feel seamless.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'horizontal', headline: 'Homepage', text: 'The home screen is the product\'s first argument. Balance visible immediately, actions within reach, nothing buried. One screen that tells the user exactly what they have and what they can do.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'horizontal', headline: 'Balance & Delight', text: 'The balance display wasn\'t just a number — it was an interaction moment. A small but deliberate detail that made the product feel alive rather than static. Useful information delivered with a bit of character.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'horizontal', headline: 'Nudges', text: 'Each action on the home screen carried a nudge — a short contextual cue that told users what it did and why it mattered. Especially important for users coming in fresh, with no prior PayZapp context.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } },
                    { type: 'horizontal', headline: 'GTM & Revamp', text: 'Late in the process, a visual refresh tightened the product\'s language further. Alongside this, the GTM thinking shaped how the product introduced itself to both returning PayZapp users and new ones — making sure neither felt like they were being sold something unfamiliar.', media: { type: 'image', src: '', alt: 'Zapp Account hero screens', device: 'wide' } }
                ] },
                { id: 'impact', label: 'Impact', blocks: [
                    { type: 'section-label', label: 'Impact' },
                    { type: 'text', body: 'Nothing came easy. The product went through multiple rounds of direction changes — across product managers, bank leadership, and internal teams. Information architecture was rethought more than once. What looked right one week got challenged the next.' },
                    { type: 'text', body: 'Every round made the product sharper. Here\'s what we landed on.' },
                    { type: 'image', layout: '3-col', src: '', alt: 'Zapp Account hero screens' }
                ] },
                { id: 'next-phase', label: 'Next Phase', blocks: [
                    { type: 'section-label', label: 'Next phase' },
                    { type: 'eyebrow-heading', eyebrow: '', headline: 'What we planned further' },
                    { type: 'text', body: 'Nothing came easy. The product went through multiple rounds of direction changes — across product managers, bank leadership, and internal teams. Information architecture was rethought more than once. What looked right one week got challenged the next.' },
                    { type: 'text', body: 'Every round made the product sharper. Here\'s what we landed on.' }
                ] },
                { id: 'reflection', label: 'Reflection', indexLabel: 'Reflections', blocks: [
                    { type: 'section-label', label: 'Reflection' },
                    { type: 'text', body: 'My role shifted across this project. I started in the thinking phase — direction, system, flow architecture. I ended up sitting with developersdaily, going screen by screen, making sure what shipped matched whatwas designed.' },
                    { type: 'text', body: 'The pixel-perfect phase isn\'t vanity. When you\'re rebuilding trust in a product people have written off, every rough edge is a reason to leave again.' },
                    { type: 'text', body: 'The hardest call wasn\'t a design decision. It was arguing for a focused launch — pushing back on the feature list, convincing stakeholders that a wallet which earns one user\'s trust completely is worth more than one that half-impresses everyone. That\'s the one I\'m most proud of.' }
                ] }
            ]
        },
        'growth-experiments': blankDoc('growth-experiments', 'Growth Experiments — Zeta Pay'),
        'project-3':         blankDoc('project-3', 'Case study'),
        'now-and-me':        blankDoc('now-and-me', 'Now&Me')
    };

    /* ---------------------------------------------------------------------------
       STATE
       --------------------------------------------------------------------------- */

    let doc = loadDoc();
    // Published-only renderer: keep the case-study content generation, but
    // remove the in-place editor UI and prevent persisted edit mode from showing.
    let mode = 'view';
    let saveTimer = null;
    let savedFlashTimer = null;
    let indexRaf = 0;
    let activeIndexTarget = '';

    function uid() {
        return 'b' + Math.random().toString(36).slice(2, 10);
    }

    function ensureIds(node) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node.sections)) {
            node.sections.forEach((s) => {
                if (!s.uid) s.uid = uid();
                ensureBlockIds(s.blocks);
            });
        }
    }

    function ensureBlockIds(blocks) {
        (blocks || []).forEach((b) => {
            if (!b.uid) b.uid = uid();
            if (b.type === 'columns') {
                (b.columns || []).forEach((col) => {
                    if (!col.uid) col.uid = uid();
                    ensureBlockIds(col.blocks);
                });
            }
            if (Array.isArray(b.items)) b.items.forEach((it) => { if (!it.uid) it.uid = uid(); });
            if (b.media && !b.media.uid) b.media.uid = uid();
        });
    }

    function loadDoc() {
        const fallback = clone(DEFAULT_DOCS[CASE_ID] || { id: CASE_ID, title: '', subtitle: '', sections: [] });
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.sections)) {
                    ensureIds(parsed);
                    return parsed;
                }
            }
        } catch (e) { /* ignore */ }
        ensureIds(fallback);
        return fallback;
    }

    function clone(v) { return JSON.parse(JSON.stringify(v)); }

    function persist() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)); } catch (e) { /* quota */ }
    }

    function schedulePersist() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            persist();
            flashSaved();
        }, 250);
    }

    function flashSaved() {
        const el = document.querySelector('.cs-editor-toolbar__status');
        if (!el) return;
        el.textContent = 'Saved';
        el.dataset.state = 'saved';
        if (savedFlashTimer) clearTimeout(savedFlashTimer);
        savedFlashTimer = setTimeout(() => { el.textContent = ''; el.dataset.state = 'idle'; }, 1400);
    }

    /* ---------------------------------------------------------------------------
       DOM HELPERS
       --------------------------------------------------------------------------- */

    function el(tag, opts = {}, ...children) {
        const node = document.createElement(tag);
        if (opts.class) node.className = opts.class;
        if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => { if (v != null && v !== false) node.setAttribute(k, v === true ? '' : v); });
        if (opts.dataset) Object.entries(opts.dataset).forEach(([k, v]) => { if (v != null) node.dataset[k] = v; });
        if (opts.text != null) node.textContent = opts.text;
        if (opts.html != null) node.innerHTML = opts.html;
        if (opts.on) Object.entries(opts.on).forEach(([ev, fn]) => node.addEventListener(ev, fn));
        children.forEach((c) => { if (c == null) return; node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
        return node;
    }

    function splitBody(value) {
        return String(value || '').split(/\n\s*\n/g).map(s => s.trim()).filter(Boolean);
    }

    function sectionIdFor(section) {
        return SECTION_ID_MAP[section.id] || `cs-editor-${section.id || section.uid}`;
    }

    /* ---------------------------------------------------------------------------
       MEDIA STORAGE — base64 inline. Keeps everything in localStorage so it
       works offline without a server. (Be mindful of size; small images only.)
       --------------------------------------------------------------------------- */

    function pickFile(accept) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.style.display = 'none';
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                resolve(file || null);
                input.remove();
            }, { once: true });
            document.body.appendChild(input);
            input.click();
        });
    }

    function readAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /* ---------------------------------------------------------------------------
       RENDERERS — every block returns an element decorated with the block's
       UID, so the editor can re-target updates without re-rendering everything.
       --------------------------------------------------------------------------- */

    function captionEl(value, block, field = 'caption') {
        const cap = el('figcaption', { class: 'cs-section__caption' });
        applyEditable(cap, block, field, value || '');
        cap.dataset.placeholder = 'Add a caption';
        return cap;
    }

    function mediaSlot(block, field = 'src', altField = 'alt') {
        const slot = el('div', {
            class: 'cs-editor-media-slot',
            dataset: { field, altField, blockUid: block.uid }
        });
        const src = block[field];
        const isVideo = (block.type === 'video') || (block.media && block.media.type === 'video') || (field === 'src' && block.type === 'video');

        if (src && typeof src === 'string' && src.length > 0 && !src.startsWith('REPLACE_WITH_')) {
            if (isVideo && src.startsWith('data:video')) {
                slot.appendChild(el('video', { attrs: { src, autoplay: true, loop: true, muted: true, playsinline: true } }));
            } else if (isVideo) {
                slot.appendChild(el('video', { attrs: { src, controls: true } }));
            } else {
                slot.appendChild(el('img', { attrs: { src, alt: block[altField] || '' } }));
            }
        } else {
            const ph = el('div', {
                class: `placeholder-graphic${isVideo ? ' placeholder-graphic--video' : ''}`,
                dataset: { src: '' },
                attrs: { role: 'img', 'aria-label': block[altField] || 'Drop image' }
            });
            slot.appendChild(ph);

            const hint = el('div', { class: 'cs-editor-media-slot__hint', text: isVideo ? 'Drop a video, or click to pick' : 'Drop an image, or click to pick' });
            slot.appendChild(hint);
        }

        wireMediaSlot(slot, block, field, isVideo);
        return slot;
    }

    function wireMediaSlot(slot, block, field, isVideo) {
        const accept = isVideo ? 'video/*' : 'image/*';

        const apply = async (file) => {
            if (!file) return;
            try {
                const dataUrl = await readAsDataURL(file);
                block[field] = dataUrl;
                if (!block.alt && file.name) block.alt = file.name.replace(/\.[^.]+$/, '');
                schedulePersist();
                // Re-render just this block's parent section for a clean update.
                renderAll();
            } catch (e) { /* ignore */ }
        };

        slot.addEventListener('click', async (ev) => {
            if (mode !== 'edit') return;
            // Don't hijack clicks on editable text
            if (ev.target.closest('[contenteditable]')) return;
            ev.preventDefault();
            const file = await pickFile(accept);
            if (file) apply(file);
        });

        slot.addEventListener('dragover', (ev) => {
            if (mode !== 'edit') return;
            ev.preventDefault();
            slot.classList.add('is-drop-target');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('is-drop-target'));
        slot.addEventListener('drop', (ev) => {
            if (mode !== 'edit') return;
            ev.preventDefault();
            slot.classList.remove('is-drop-target');
            const file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
            if (file) apply(file);
        });
    }

    /* ---------- Inline-editable text wiring ---------- */

    function applyEditable(node, target, field, value) {
        node.textContent = value || '';
        if (mode === 'edit') {
            node.setAttribute('contenteditable', 'plaintext-only');
            node.dataset.field = field;
            node.addEventListener('input', () => {
                target[field] = node.textContent;
                schedulePersist();
            });
            node.addEventListener('blur', () => {
                target[field] = node.textContent;
                schedulePersist();
            });
        }
    }

    /* ---------- Block renderers ---------- */

    function renderTextBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--text', dataset: { blockUid: block.uid } });
        const p = el('p', { class: 'cs-section__body' });
        p.dataset.placeholder = 'Write something…';
        applyEditable(p, block, 'body', block.body);
        wrap.appendChild(p);
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderSectionLabelBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--section-label', dataset: { blockUid: block.uid } });
        const label = el('p', { class: 'cs-section__label' });
        label.dataset.placeholder = 'Section label';
        applyEditable(label, block, 'label', block.label || '');
        wrap.appendChild(label);
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderMetaBlock(block) {
        const wrap = el('dl', { class: 'cs-block cs-block--meta cs-page-header__meta cs-meta-inline', dataset: { blockUid: block.uid } });
        if (!Array.isArray(doc.meta)) doc.meta = defaultMeta();
        doc.meta.forEach((cell, i) => {
            const item = el('div', { class: 'cs-meta-cell', dataset: { metaIdx: i } });
            const dt = el('dt', { class: 'cs-meta-cell__label' });
            applyEditable(dt, cell, 'label', cell.label || '');
            const dd = el('dd', { class: 'cs-meta-cell__value' });
            applyEditable(dd, cell, 'value', cell.value || '');
            item.appendChild(dt);
            item.appendChild(dd);
            wrap.appendChild(item);
        });
        decorateBlock(wrap, block);
        return wrap;
    }

    function columnsFromLayout(layout, fallback) {
        const s = String(layout || '');
        if (s.includes('5')) return 5;
        if (s.includes('4')) return 4;
        if (s.includes('3')) return 3;
        if (s.includes('2')) return 2;
        return fallback || 1;
    }

    function renderImageBlock(block) {
        const layout = block.layout || '1-col';
        const wrap = el('figure', { class: 'cs-block cs-block--image', dataset: { blockUid: block.uid } });

        if (layout === 'fullbleed') {
            wrap.classList.add('cs-media-full', 'cs-editor-media', 'cs-editor-media--full');
            wrap.appendChild(mediaSlot(block));
            wrap.appendChild(captionEl(block.caption, block));
        } else if (layout === 'wide') {
            wrap.classList.add('cs-editor-media', 'cs-editor-media--full');
            wrap.appendChild(mediaSlot(block));
            wrap.appendChild(captionEl(block.caption, block));
        } else {
            const cols = columnsFromLayout(layout, 3);
            wrap.classList.add('cs-media-grid', `cs-media-grid--cols-${cols}`, 'cs-editor-media', 'cs-editor-media--grid');

            // image grid supports per-item sources via block.items (optional)
            if (!Array.isArray(block.items) || block.items.length !== cols) {
                block.items = Array.from({ length: cols }, (_, i) => block.items?.[i] || { src: '', alt: '' });
            }

            block.items.forEach((item, i) => {
                if (!item.uid) item.uid = uid();
                const cell = el('div', { class: 'cs-editor-media__item', dataset: { itemUid: item.uid } });
                cell.appendChild(mediaSlot(item, 'src', 'alt'));

                const calloutText = Array.isArray(block.callouts) ? block.callouts[i] : null;
                const labelText = Array.isArray(block.labels) ? block.labels[i] : null;
                const subtitle = item.caption || calloutText || labelText || '';
                const cap = el('figcaption', { class: 'cs-section__caption' });
                cap.dataset.placeholder = 'Add a label';
                applyEditable(cap, item, 'caption', subtitle);
                cell.appendChild(cap);
                wrap.appendChild(cell);
            });

            wrap.appendChild(captionEl(block.caption, block));
        }

        decorateBlock(wrap, block);
        return wrap;
    }

    function renderVideoBlock(block) {
        const wrap = el('figure', { class: 'cs-block cs-block--video cs-media-full cs-editor-media cs-editor-media--video', dataset: { blockUid: block.uid } });
        wrap.appendChild(mediaSlot(block, 'src', 'alt'));
        wrap.appendChild(captionEl(block.caption, block));
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderHorizontalBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--horizontal cs-horizontal cs-editor-media cs-editor-media--horizontal', dataset: { blockUid: block.uid } });

        const textCol = el('div', { class: 'cs-horizontal__text' });
        if (block.headline) {
            const head = el('h3', { class: 'cs-h3' });
            head.dataset.placeholder = 'Heading';
            applyEditable(head, block, 'headline', block.headline);
            textCol.appendChild(head);
        }
        const p = el('p', { class: 'cs-section__body' });
        p.dataset.placeholder = 'Write something…';
        applyEditable(p, block, 'text', block.text);
        textCol.appendChild(p);

        const mediaCol = el('div', { class: 'cs-horizontal__media' });
        const media = block.media || (block.media = { type: 'video', src: '', alt: '', device: 'phone' });
        if (!media.uid) media.uid = uid();
        const frame = el('div', {
            class: `cs-horizontal__frame${media.device === 'phone' ? ' cs-horizontal__frame--phone' : ''}`
        });
        const slot = mediaSlot(media, 'src', 'alt');
        frame.appendChild(slot);
        mediaCol.appendChild(frame);

        wrap.appendChild(textCol);
        wrap.appendChild(mediaCol);
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderComparisonBlock(block) {
        const wrap = el('figure', { class: 'cs-block cs-block--comparison cs-media-comparison cs-editor-media cs-editor-media--comparison', dataset: { blockUid: block.uid } });
        if (!block.labels) block.labels = { before: 'Before', after: 'After' };
        if (!block.beforeSrc) block.beforeSrc = '';
        if (!block.afterSrc) block.afterSrc = '';

        ['before', 'after'].forEach((side) => {
            const item = el('div', { class: `cs-media-comparison__item cs-media-comparison__item--${side}` });
            const tag = el('span', { class: 'cs-media-comparison__label' });
            applyEditable(tag, block.labels, side, block.labels[side]);
            item.appendChild(tag);
            const slot = mediaSlot(block, `${side}Src`, 'alt');
            item.appendChild(slot);
            wrap.appendChild(item);
        });

        wrap.appendChild(captionEl(block.caption, block));
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderMetricsBlock(block) {
        const wrap = el('div', { class: `cs-block cs-block--metrics cs-metrics cs-metrics--${block.style || 'standard'}`, dataset: { blockUid: block.uid } });
        const cap = el('p', { class: 'cs-metrics__caption' });
        cap.dataset.placeholder = 'Optional caption';
        applyEditable(cap, block, 'caption', block.caption || '');
        wrap.appendChild(cap);

        const grid = el('div', { class: 'cs-stats' });
        (block.items || []).forEach((item, i) => {
            if (!item.uid) item.uid = uid();
            const cell = el('div', { class: 'cs-stat', dataset: { itemUid: item.uid, idx: i } });
            const value = el('div', { class: 'cs-stat__value' });
            value.dataset.placeholder = '0%';
            applyEditable(value, item, 'stat', item.stat || '');
            cell.appendChild(value);

            const label = el('div', { class: 'cs-stat__label' });
            label.dataset.placeholder = 'Label';
            applyEditable(label, item, 'label', item.label || '');
            cell.appendChild(label);

            const note = el('div', { class: 'cs-stat__note' });
            note.dataset.placeholder = 'Note';
            applyEditable(note, item, 'note', item.note || '');
            cell.appendChild(note);

            if (mode === 'edit') {
                const rm = el('button', { class: 'cs-block-toolbar__btn cs-metrics__remove', attrs: { type: 'button', title: 'Remove metric' }, text: '×' });
                rm.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    block.items.splice(i, 1);
                    schedulePersist();
                    renderAll();
                });
                cell.appendChild(rm);
            }
            grid.appendChild(cell);
        });

        if (mode === 'edit') {
            const add = el('button', { class: 'cs-stat cs-stat--add', attrs: { type: 'button' }, text: '+ Add metric' });
            add.addEventListener('click', () => {
                block.items = block.items || [];
                block.items.push({ stat: '', label: '', note: '', uid: uid() });
                schedulePersist();
                renderAll();
            });
            grid.appendChild(add);
        }

        wrap.appendChild(grid);
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderDividerBlock(block) {
        // A section heading. Renders as `## Section title` (big serif/grotesque h2),
        // breaks the rhythm of body text and anchors the section.
        const wrap = el('div', { class: 'cs-block cs-block--divider cs-heading-block', dataset: { blockUid: block.uid } });
        if (!block.label) block.label = 'Section';
        if (!block.id) block.id = (block.label || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
        const h = el('h2', { class: 'cs-h2', attrs: { id: block.id } });
        h.dataset.placeholder = 'Section title';
        applyEditable(h, block, 'label', block.label);
        h.addEventListener('blur', () => {
            block.id = (block.label || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
            renderAll();
        });
        wrap.appendChild(h);
        decorateBlock(wrap, block);
        return wrap;
    }

    /* Eyebrow + heading — Kasturi-style `Access / Share flow / AI behavior` group:
       small uppercase eyebrow above an h3. Sub-section within a section. */
    function renderEyebrowHeadingBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--eyebrow-heading cs-eyebrow-heading', dataset: { blockUid: block.uid } });
        const eyebrow = el('p', { class: 'cs-eyebrow' });
        eyebrow.dataset.placeholder = 'Eyebrow';
        applyEditable(eyebrow, block, 'eyebrow', block.eyebrow || '');
        const heading = el('h3', { class: 'cs-h3' });
        heading.dataset.placeholder = 'Sub-section heading';
        applyEditable(heading, block, 'headline', block.headline || '');
        wrap.appendChild(eyebrow);
        wrap.appendChild(heading);
        decorateBlock(wrap, block);
        return wrap;
    }

    /* Impact item — Kasturi's "### Mobile-first sharing made access ..." style:
       bold lead + supporting line, stacked vertically (one per block).  */
    function renderImpactBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--impact cs-impact', dataset: { blockUid: block.uid } });
        const head = el('h3', { class: 'cs-impact__headline' });
        head.dataset.placeholder = 'Headline outcome';
        applyEditable(head, block, 'headline', block.headline || '');
        const body = el('p', { class: 'cs-impact__body' });
        body.dataset.placeholder = 'Supporting line';
        applyEditable(body, block, 'body', block.body || '');
        wrap.appendChild(head);
        wrap.appendChild(body);
        decorateBlock(wrap, block);
        return wrap;
    }

    /* Numbered item — `01 / 02 / 03` index + h3 + supporting body.
       Used inside "The core challenge" style sections. */
    function renderNumberedBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--numbered cs-numbered', dataset: { blockUid: block.uid } });
        const num = el('span', { class: 'cs-numbered__index' });
        num.dataset.placeholder = '01';
        applyEditable(num, block, 'index', block.index || '');
        const head = el('h3', { class: 'cs-numbered__headline' });
        head.dataset.placeholder = 'Title';
        applyEditable(head, block, 'headline', block.headline || '');
        const body = el('p', { class: 'cs-numbered__body' });
        body.dataset.placeholder = 'Supporting paragraph';
        applyEditable(body, block, 'body', block.body || '');
        wrap.appendChild(num);
        wrap.appendChild(head);
        wrap.appendChild(body);
        decorateBlock(wrap, block);
        return wrap;
    }

    /* Pull-quote — large standalone display text (the HMW moment). */
    function renderPullquoteBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--pullquote cs-pullquote', dataset: { blockUid: block.uid } });
        const body = el('p', { class: 'cs-pullquote__body' });
        body.dataset.placeholder = 'A standalone, display-style line.';
        applyEditable(body, block, 'body', block.body || '');
        wrap.appendChild(body);
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderSpacerBlock(block) {
        const size = block.size || 'md';
        const wrap = el('div', {
            class: `cs-block cs-block--spacer cs-spacer cs-spacer--${size}`,
            dataset: { blockUid: block.uid }
        });
        if (mode === 'edit') {
            const hint = el('span', { class: 'cs-spacer__hint', text: `Spacer · ${size.toUpperCase()}` });
            wrap.appendChild(hint);
        }
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderRuleBlock(block) {
        const wrap = el('div', { class: 'cs-block cs-block--rule', dataset: { blockUid: block.uid } });
        wrap.appendChild(el('hr', { class: 'cs-rule' }));
        decorateBlock(wrap, block);
        return wrap;
    }

    function renderColumnsBlock(block) {
        const cols = block.cols || 2;
        const wrap = el('div', {
            class: `cs-block cs-block--columns cs-columns cs-columns--${cols}`,
            dataset: { blockUid: block.uid }
        });

        if (!Array.isArray(block.columns) || block.columns.length !== cols) {
            const existing = block.columns || [];
            block.columns = Array.from({ length: cols }, (_, i) => existing[i] || { uid: uid(), blocks: [] });
        }

        block.columns.forEach((col) => {
            if (!col.uid) col.uid = uid();
            const colNode = el('div', { class: 'cs-column', dataset: { columnUid: col.uid } });
            (col.blocks || []).forEach((child) => {
                const node = renderBlock(child, { uid: col.uid });
                if (!node) return;
                colNode.appendChild(node);
                const ins = renderInserter(child.uid, col.uid);
                if (ins) colNode.appendChild(ins);
            });
            if (mode === 'edit' && (!col.blocks || col.blocks.length === 0)) {
                const ins = renderInserter(null, col.uid);
                if (ins) colNode.appendChild(ins);
                colNode.classList.add('cs-column--empty');
            }
            wrap.appendChild(colNode);
        });

        decorateBlock(wrap, block);
        return wrap;
    }

    /* ---------- Block dispatcher ---------- */

    const BLOCK_REGISTRY = {
        'text':             { label: 'Text',             group: 'basic',     render: renderTextBlock,           layouts: null },
        'section-label':    { label: 'Section label',    group: 'basic',     render: renderSectionLabelBlock,   layouts: null },
        'meta':             { label: 'Meta row',         group: 'basic',     render: renderMetaBlock,           layouts: null },
        'eyebrow-heading':  { label: 'Eyebrow + heading', group: 'basic',    render: renderEyebrowHeadingBlock, layouts: null },
        'impact':           { label: 'Impact item',      group: 'basic',     render: renderImpactBlock,         layouts: null },
        'numbered':         { label: 'Numbered item',    group: 'basic',     render: renderNumberedBlock,       layouts: null },
        'pullquote':        { label: 'Pull-quote',       group: 'basic',     render: renderPullquoteBlock,      layouts: null },
        'metrics':          { label: 'Metrics',          group: 'basic',     render: renderMetricsBlock,        layouts: null, styles: ['standard', 'highlight', 'muted', 'large'] },
        'image':            { label: 'Image',            group: 'media',     render: renderImageBlock,          layouts: ['wide', 'fullbleed', '2-col', '3-col', '4-col', '5-col'] },
        'video':            { label: 'Video',            group: 'media',     render: renderVideoBlock,          layouts: null },
        'horizontal':       { label: 'Text + Media',     group: 'media',     render: renderHorizontalBlock,     layouts: null },
        'comparison':       { label: 'Before / After',   group: 'media',     render: renderComparisonBlock,     layouts: null },
        'divider':          { label: 'Section heading',  group: 'structure', render: renderDividerBlock,        layouts: null },
        'rule':             { label: 'Divider line',     group: 'structure', render: renderRuleBlock,           layouts: null },
        'spacer':           { label: 'Spacer',           group: 'structure', render: renderSpacerBlock,         layouts: null, sizes: ['sm', 'md', 'lg', 'xl'] },
        'columns':          { label: 'Columns',          group: 'structure', render: renderColumnsBlock,        layouts: null, cols: [2, 3] }
    };

    const GROUP_ORDER = [
        { id: 'basic',     label: 'Basic' },
        { id: 'media',     label: 'Media' },
        { id: 'structure', label: 'Structure' }
    ];

    function renderBlock(block, container) {
        const def = BLOCK_REGISTRY[block.type];
        if (!def) return null;
        const node = def.render(block);
        if (node && container) node.dataset.containerUid = container.uid;
        return node;
    }

    /* ---------------------------------------------------------------------------
       BLOCK DECORATION — drag handle, controls, drop targets (edit mode only)
       --------------------------------------------------------------------------- */

    function decorateBlock(node, block) {
        // Apply per-block spacing in any mode (view + edit).
        const spacing = block.spacing || 'default';
        node.classList.add(`cs-block--gap-${spacing}`);

        if (mode !== 'edit') return;
        const def = BLOCK_REGISTRY[block.type];

        const toolbar = el('div', { class: 'cs-block-toolbar', attrs: { contenteditable: 'false' } });

        const drag = el('button', { class: 'cs-block-toolbar__btn cs-block-toolbar__drag', attrs: { type: 'button', title: 'Drag to reorder', draggable: 'true' }, html: '⋮⋮' });
        toolbar.appendChild(drag);

        // Layout (image grid columns)
        if (def && def.layouts) {
            const sel = el('select', { class: 'cs-block-toolbar__select', attrs: { title: 'Layout' } });
            def.layouts.forEach((l) => {
                const opt = el('option', { attrs: { value: l }, text: l });
                if ((block.layout || def.layouts[0]) === l) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', () => {
                block.layout = sel.value;
                if (block.type === 'image') block.items = null;
                schedulePersist();
                renderAll();
            });
            toolbar.appendChild(sel);
        }

        // Style (metrics variant)
        if (def && def.styles) {
            const sel = el('select', { class: 'cs-block-toolbar__select', attrs: { title: 'Style' } });
            def.styles.forEach((s) => {
                const opt = el('option', { attrs: { value: s }, text: s });
                if ((block.style || def.styles[0]) === s) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', () => {
                block.style = sel.value;
                schedulePersist();
                renderAll();
            });
            toolbar.appendChild(sel);
        }

        // Spacer size
        if (def && def.sizes) {
            const sel = el('select', { class: 'cs-block-toolbar__select', attrs: { title: 'Size' } });
            def.sizes.forEach((s) => {
                const opt = el('option', { attrs: { value: s }, text: s.toUpperCase() });
                if ((block.size || def.sizes[1] || def.sizes[0]) === s) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', () => {
                block.size = sel.value;
                schedulePersist();
                renderAll();
            });
            toolbar.appendChild(sel);
        }

        // Columns count
        if (def && def.cols) {
            const sel = el('select', { class: 'cs-block-toolbar__select', attrs: { title: 'Columns' } });
            def.cols.forEach((c) => {
                const opt = el('option', { attrs: { value: String(c) }, text: `${c} cols` });
                if ((block.cols || def.cols[0]) === c) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', () => {
                const newCols = parseInt(sel.value, 10);
                block.cols = newCols;
                // Preserve existing columns; truncate or extend.
                const existing = block.columns || [];
                if (existing.length > newCols) {
                    // Move overflow column blocks into the last kept column.
                    const overflow = existing.slice(newCols).flatMap(c => c.blocks || []);
                    block.columns = existing.slice(0, newCols);
                    block.columns[newCols - 1].blocks = (block.columns[newCols - 1].blocks || []).concat(overflow);
                } else {
                    block.columns = existing.concat(
                        Array.from({ length: newCols - existing.length }, () => ({ uid: uid(), blocks: [] }))
                    );
                }
                schedulePersist();
                renderAll();
            });
            toolbar.appendChild(sel);
        }

        // Swap sides for horizontal blocks
        if (block.type === 'horizontal') {
            const swap = el('button', { class: 'cs-block-toolbar__btn', attrs: { type: 'button', title: 'Swap sides' }, text: '⇄' });
            swap.addEventListener('click', () => {
                block.reverse = !block.reverse;
                schedulePersist();
                renderAll();
            });
            toolbar.appendChild(swap);
            if (block.reverse) node.classList.add('cs-horizontal--reverse');
        }

        // Universal: per-block spacing (margin below). Notion equivalent of
        // pressing Enter a few extra times to add breathing room.
        const gapSel = el('select', { class: 'cs-block-toolbar__select', attrs: { title: 'Spacing after this block' } });
        [
            { v: 'tight',   t: '↕ Tight' },
            { v: 'default', t: '↕ Default' },
            { v: 'loose',   t: '↕ Loose' },
            { v: 'xl',      t: '↕ XL' }
        ].forEach(({ v, t }) => {
            const opt = el('option', { attrs: { value: v }, text: t });
            if ((block.spacing || 'default') === v) opt.selected = true;
            gapSel.appendChild(opt);
        });
        gapSel.addEventListener('change', () => {
            block.spacing = gapSel.value;
            schedulePersist();
            renderAll();
        });
        toolbar.appendChild(gapSel);

        const del = el('button', { class: 'cs-block-toolbar__btn cs-block-toolbar__delete', attrs: { type: 'button', title: 'Delete block' }, text: '×' });
        del.addEventListener('click', () => {
            removeBlock(block.uid);
        });
        toolbar.appendChild(del);

        node.appendChild(toolbar);
        node.classList.add('cs-block--editable');
        node.dataset.dropZone = 'block';

        // Drag and drop reordering
        drag.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.effectAllowed = 'move';
            ev.dataTransfer.setData('text/cs-block-uid', block.uid);
            node.classList.add('is-dragging');
        });
        drag.addEventListener('dragend', () => node.classList.remove('is-dragging'));

        node.addEventListener('dragover', (ev) => {
            const types = ev.dataTransfer && ev.dataTransfer.types;
            if (!types || !Array.from(types).includes('text/cs-block-uid')) return;
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'move';
            const rect = node.getBoundingClientRect();
            const before = (ev.clientY - rect.top) < rect.height / 2;
            node.classList.toggle('is-drop-before', before);
            node.classList.toggle('is-drop-after', !before);
        });
        node.addEventListener('dragleave', () => {
            node.classList.remove('is-drop-before', 'is-drop-after');
        });
        node.addEventListener('drop', (ev) => {
            const id = ev.dataTransfer.getData('text/cs-block-uid');
            if (!id || id === block.uid) {
                node.classList.remove('is-drop-before', 'is-drop-after');
                return;
            }
            ev.preventDefault();
            const before = node.classList.contains('is-drop-before');
            node.classList.remove('is-drop-before', 'is-drop-after');
            moveBlock(id, block.uid, before ? 'before' : 'after');
        });
    }

    /* ---------------------------------------------------------------------------
       BLOCK MUTATIONS
       --------------------------------------------------------------------------- */

    /* Recursive helpers that treat both sections and column-blocks as
       block containers. A container is anything with a .blocks[] array;
       a columns block also exposes .columns[], each with its own .blocks[]. */

    function eachContainer(callback) {
        // Visits every container exactly once. Returns first truthy value.
        for (const s of doc.sections) {
            const r = callback(s);
            if (r) return r;
            const inner = walkColumnsIn(s, callback);
            if (inner) return inner;
        }
        return null;
    }

    function walkColumnsIn(container, callback) {
        for (const b of (container.blocks || [])) {
            if (b.type === 'columns') {
                for (const col of (b.columns || [])) {
                    const r = callback(col);
                    if (r) return r;
                    const deeper = walkColumnsIn(col, callback);
                    if (deeper) return deeper;
                }
            }
        }
        return null;
    }

    function findContainer(containerUid) {
        return eachContainer((c) => c.uid === containerUid ? c : null);
    }

    function findBlock(blockUid) {
        return eachContainer((c) => {
            const i = (c.blocks || []).findIndex(b => b.uid === blockUid);
            if (i !== -1) return { container: c, idx: i, block: c.blocks[i] };
            return null;
        });
    }

    function removeBlock(blockUid) {
        const hit = findBlock(blockUid);
        if (!hit) return;
        hit.container.blocks.splice(hit.idx, 1);
        schedulePersist();
        renderAll();
    }

    function moveBlock(sourceUid, targetUid, where) {
        const src = findBlock(sourceUid);
        const tgt = findBlock(targetUid);
        if (!src || !tgt) return;
        // Don't allow dropping a columns block into one of its own descendants.
        if (src.block.type === 'columns' && isDescendantContainer(src.block, tgt.container.uid)) return;
        const [removed] = src.container.blocks.splice(src.idx, 1);
        const tgt2 = findBlock(targetUid);
        if (!tgt2) {
            // target was inside the moved subtree; bail.
            src.container.blocks.splice(src.idx, 0, removed);
            return;
        }
        const insertAt = where === 'before' ? tgt2.idx : tgt2.idx + 1;
        tgt2.container.blocks.splice(insertAt, 0, removed);
        schedulePersist();
        renderAll();
    }

    function isDescendantContainer(columnsBlock, containerUid) {
        for (const col of (columnsBlock.columns || [])) {
            if (col.uid === containerUid) return true;
            for (const child of (col.blocks || [])) {
                if (child.type === 'columns' && isDescendantContainer(child, containerUid)) return true;
            }
        }
        return false;
    }

    function insertBlock(type, afterUid /* or null = append */, containerUid) {
        const base = makeDefaultBlock(type);
        if (afterUid) {
            const hit = findBlock(afterUid);
            if (hit) {
                hit.container.blocks.splice(hit.idx + 1, 0, base);
                schedulePersist();
                renderAll();
                return;
            }
        }
        const container = (containerUid && findContainer(containerUid)) || doc.sections[doc.sections.length - 1];
        if (!container) {
            doc.sections.push({ uid: uid(), id: 'section', label: 'Section', blocks: [base] });
        } else {
            container.blocks = container.blocks || [];
            container.blocks.push(base);
        }
        schedulePersist();
        renderAll();
    }

    function makeDefaultBlock(type) {
        const base = { uid: uid(), type };
        switch (type) {
            case 'text': base.body = ''; break;
            case 'section-label': base.label = ''; break;
            case 'meta': break;
            case 'eyebrow-heading': base.eyebrow = ''; base.headline = ''; break;
            case 'impact': base.headline = ''; base.body = ''; break;
            case 'numbered': base.index = '01'; base.headline = ''; base.body = ''; break;
            case 'pullquote': base.body = ''; break;
            case 'image': base.layout = 'fullbleed'; base.src = ''; base.alt = ''; break;
            case 'video': base.src = ''; base.alt = ''; break;
            case 'horizontal': base.text = ''; base.media = { type: 'video', src: '', alt: '', device: 'phone', uid: uid() }; break;
            case 'comparison': base.beforeSrc = ''; base.afterSrc = ''; base.labels = { before: 'Before', after: 'After' }; break;
            case 'metrics': base.style = 'standard'; base.items = [{ uid: uid(), stat: '', label: '', note: '' }]; break;
            case 'divider': base.label = 'New section'; base.id = 'new-section'; break;
            case 'rule': break;
            case 'spacer': base.size = 'md'; break;
            case 'columns': base.cols = 2; base.columns = [
                { uid: uid(), blocks: [] },
                { uid: uid(), blocks: [] }
            ]; break;
        }
        return base;
    }

    /* ---------------------------------------------------------------------------
       INSERTER ROW (+) between blocks
       --------------------------------------------------------------------------- */

    function renderInserter(afterUid, containerUid) {
        if (mode !== 'edit') return null;
        const row = el('div', { class: 'cs-inserter', attrs: { contenteditable: 'false' } });

        const trigger = el('button', { class: 'cs-inserter__trigger', attrs: { type: 'button', title: 'Insert block' }, text: '+' });
        const menu = el('div', { class: 'cs-inserter__menu', attrs: { hidden: true } });

        GROUP_ORDER.forEach(({ id: groupId, label: groupLabel }) => {
            const items = Object.entries(BLOCK_REGISTRY).filter(([, def]) => def.group === groupId);
            if (!items.length) return;
            const group = el('div', { class: 'cs-inserter__group' });
            group.appendChild(el('div', { class: 'cs-inserter__group-label', text: groupLabel }));
            const grid = el('div', { class: 'cs-inserter__group-items' });
            items.forEach(([type, def]) => {
                const item = el('button', { class: 'cs-inserter__item', attrs: { type: 'button' }, text: def.label });
                item.addEventListener('click', () => {
                    insertBlock(type, afterUid, containerUid);
                });
                grid.appendChild(item);
            });
            group.appendChild(grid);
            menu.appendChild(group);
        });

        trigger.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (menu.hasAttribute('hidden')) menu.removeAttribute('hidden');
            else menu.setAttribute('hidden', '');
        });

        document.addEventListener('click', (ev) => {
            if (!row.contains(ev.target)) menu.setAttribute('hidden', '');
        });

        row.appendChild(trigger);
        row.appendChild(menu);
        return row;
    }

    /* ---------------------------------------------------------------------------
       SECTION + DOCUMENT RENDERING
       --------------------------------------------------------------------------- */

    function renderSection(section) {
        // Sections no longer render their own visible label — use a Section
        // heading (divider) block at the top of a section when you want one
        // visible. The section element is still useful as a grouping
        // container so blocks know which list they belong to.
        const node = el('section', { class: 'cs-section', attrs: { id: sectionIdFor(section) } });
        node.dataset.sectionUid = section.uid;

        (section.blocks || []).forEach((block) => {
            const blockEl = renderBlock(block, { uid: section.uid });
            if (!blockEl) return;
            node.appendChild(blockEl);
            const ins = renderInserter(block.uid, section.uid);
            if (ins) node.appendChild(ins);
        });

        if (mode === 'edit' && (!section.blocks || section.blocks.length === 0)) {
            const ins = renderInserter(null, section.uid);
            if (ins) node.appendChild(ins);
        }

        return node;
    }

    function renderIndex(sections) {
        const nav = el('nav', { class: 'cs-index', attrs: { 'aria-label': 'Case study sections' } });
        sections.forEach((section) => {
            const a = el('a', {
                class: 'cs-index__link',
                attrs: { href: `#${sectionIdFor(section)}`, 'data-target': sectionIdFor(section) },
                text: section.indexLabel || section.label || section.id || ''
            });
            nav.appendChild(a);
        });
        return nav;
    }

    function updateIndexActive() {
        indexRaf = 0;
        if (CASE_ID !== 'zapp-account') return;
        const sections = [...document.querySelectorAll('.cs-body-layout--zapp .cs-section')];
        const links = [...document.querySelectorAll('.cs-body-layout--zapp .cs-index__link')];
        if (!sections.length || !links.length) return;

        const probeY = Math.min(window.innerHeight * 0.42, 320);
        let active = sections[0];
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= probeY) active = section;
        });

        if (active.id === activeIndexTarget) return;
        activeIndexTarget = active.id;

        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canAnimate = typeof gsap !== 'undefined' && !reduceMotion;

        links.forEach((link) => {
            const isActive = link.dataset.target === active.id;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');

            if (canAnimate) {
                gsap.to(link, {
                    x: isActive ? 18 : 0,
                    duration: isActive ? 0.62 : 0.42,
                    ease: isActive ? 'elastic.out(1, 0.55)' : 'power3.out',
                    overwrite: 'auto'
                });
            } else {
                link.style.transform = isActive ? 'translateX(18px)' : '';
            }
        });
    }

    function requestIndexActiveUpdate() {
        if (indexRaf) return;
        indexRaf = requestAnimationFrame(updateIndexActive);
    }

    function renderHero() {
        const wrap = document.querySelector('.cs-page-hero, .pajelly-cs-hero-img');
        if (!wrap) return;
        wrap.innerHTML = '';
        if (!doc.hero) doc.hero = { type: 'image', src: '', alt: '' };
        if (!doc.hero.uid) doc.hero.uid = uid();
        const slot = mediaSlot(doc.hero, 'src', 'alt');
        slot.classList.add('cs-editor-media-slot--hero');
        wrap.appendChild(slot);
    }

    /* Header: editable title + subtitle + 4-col meta row (Role / Timeline / Team / Platform). */
    function renderHeader() {
        const titleEl = document.querySelector('.cs-page-header__title, .pajelly-title');
        const subEl = document.querySelector('.cs-page-header__subtitle, .pajelly-subtitle');
        if (titleEl) {
            titleEl.textContent = '';
            titleEl.dataset.placeholder = 'Case study title';
            applyEditable(titleEl, doc, 'title', doc.title || '');
        }
        if (subEl) {
            subEl.textContent = '';
            subEl.dataset.placeholder = 'One-line summary';
            applyEditable(subEl, doc, 'subtitle', doc.subtitle || '');
        }
        const t = document.querySelector('title');
        if (t) t.textContent = `Case Study | ${doc.title || ''}`;
        renderMetaRow();
    }

    function renderMetaRow() {
        const wrap = document.querySelector('[data-meta-row]');
        if (!wrap) return;
        wrap.innerHTML = '';
        if (CASE_ID === 'zapp-account') return;
        if (!Array.isArray(doc.meta)) doc.meta = defaultMeta();

        doc.meta.forEach((cell, i) => {
            const item = el('div', { class: 'cs-meta-cell', dataset: { metaIdx: i } });

            const dt = el('dt', { class: 'cs-meta-cell__label' });
            dt.dataset.placeholder = 'Label';
            applyEditable(dt, cell, 'label', cell.label || '');

            const dd = el('dd', { class: 'cs-meta-cell__value' });
            dd.dataset.placeholder = 'Value';
            applyEditable(dd, cell, 'value', cell.value || '');

            item.appendChild(dt);
            item.appendChild(dd);

            if (mode === 'edit') {
                const rm = el('button', { class: 'cs-meta-cell__remove', attrs: { type: 'button', title: 'Remove meta cell' }, text: '×' });
                rm.addEventListener('click', () => {
                    doc.meta.splice(i, 1);
                    schedulePersist();
                    renderAll();
                });
                item.appendChild(rm);
            }
            wrap.appendChild(item);
        });

        if (mode === 'edit') {
            const add = el('button', { class: 'cs-meta-cell cs-meta-cell--add', attrs: { type: 'button' }, text: '+ Add meta' });
            add.addEventListener('click', () => {
                doc.meta.push({ key: 'custom-' + doc.meta.length, label: 'Label', value: '' });
                schedulePersist();
                renderAll();
            });
            wrap.appendChild(add);
        }
    }

    function renderContent() {
        const content = document.querySelector('.cs-content');
        if (!content) return;

        // Wipe existing managed nodes (keep CTA row only)
        [...content.querySelectorAll(':scope > .cs-body-layout, :scope > .cs-section, :scope > .cs-credits, :scope > .cs-callout, :scope > .cs-stats, :scope > .pajelly-cs-grid, :scope > .cs-inserter')].forEach(n => n.remove());

        const cta = content.querySelector('.cs-cta-row');
        if (CASE_ID === 'zapp-account') {
            const layout = el('div', { class: 'cs-body-layout cs-body-layout--zapp' });
            const sectionWrap = el('div', { class: 'cs-body-layout__content' });
            layout.appendChild(renderIndex(doc.sections));
            doc.sections.forEach((section) => {
                sectionWrap.appendChild(renderSection(section));
            });
            layout.appendChild(sectionWrap);
            if (cta) content.insertBefore(layout, cta);
            else content.appendChild(layout);
            return;
        }

        doc.sections.forEach((section) => {
            const node = renderSection(section);
            if (cta) content.insertBefore(node, cta);
            else content.appendChild(node);
        });

        if (mode === 'edit') {
            const addSection = el('button', { class: 'cs-inserter cs-inserter--section', attrs: { type: 'button' }, text: '+ Add section' });
            addSection.addEventListener('click', () => {
                doc.sections.push({ uid: uid(), id: 'section-' + (doc.sections.length + 1), label: '', blocks: [] });
                schedulePersist();
                renderAll();
            });
            if (cta) content.insertBefore(addSection, cta);
            else content.appendChild(addSection);
        }
    }

    function renderAll() {
        document.documentElement.dataset.csMode = mode;
        renderHeader();
        renderHero();
        renderContent();
        requestIndexActiveUpdate();
    }

    /* ---------------------------------------------------------------------------
       TOOLBAR
       --------------------------------------------------------------------------- */

    function buildToolbar() {
        if (document.querySelector('.cs-editor-toolbar')) return;
        const bar = el('div', { class: 'cs-editor-toolbar', attrs: { role: 'toolbar', 'aria-label': 'Case study editor' } });

        const modeBtn = el('button', { class: 'cs-editor-toolbar__btn cs-editor-toolbar__mode', attrs: { type: 'button' } });
        modeBtn.addEventListener('click', () => {
            mode = mode === 'edit' ? 'view' : 'edit';
            sessionStorage.setItem(`cs-editor-mode:${CASE_ID}`, mode);
            renderAll();
        });

        const publish = el('button', { class: 'cs-editor-toolbar__btn', attrs: { type: 'button', title: 'Download a JSON snapshot to commit' }, text: 'Publish' });
        publish.addEventListener('click', () => {
            persist();
            try { localStorage.setItem(PUBLISHED_KEY, JSON.stringify(doc)); } catch (e) {}
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `case-study-${CASE_ID}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });

        const importBtn = el('button', { class: 'cs-editor-toolbar__btn', attrs: { type: 'button', title: 'Load a JSON snapshot' }, text: 'Import' });
        importBtn.addEventListener('click', async () => {
            const file = await pickFile('application/json');
            if (!file) return;
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
                    doc = parsed;
                    ensureIds(doc);
                    persist();
                    renderAll();
                }
            } catch (e) { /* ignore */ }
        });

        const reset = el('button', { class: 'cs-editor-toolbar__btn cs-editor-toolbar__btn--danger', attrs: { type: 'button', title: 'Discard local edits and revert to the default content' }, text: 'Reset' });
        reset.addEventListener('click', () => {
            if (!confirm('Discard all local edits for this case study?')) return;
            localStorage.removeItem(STORAGE_KEY);
            doc = loadDoc();
            renderAll();
        });

        const status = el('span', { class: 'cs-editor-toolbar__status', dataset: { state: 'idle' } });

        bar.appendChild(modeBtn);
        bar.appendChild(publish);
        bar.appendChild(importBtn);
        bar.appendChild(reset);
        bar.appendChild(status);
        document.body.appendChild(bar);
    }

    function updateToolbar() {
        const modeBtn = document.querySelector('.cs-editor-toolbar__mode');
        if (modeBtn) modeBtn.textContent = mode === 'edit' ? 'Done editing' : 'Edit page';
        const bar = document.querySelector('.cs-editor-toolbar');
        if (bar) bar.dataset.mode = mode;
    }

    /* ---------------------------------------------------------------------------
       BOOT
       --------------------------------------------------------------------------- */

    function boot() {
        renderAll();
        if (CASE_ID === 'zapp-account') {
            window.addEventListener('scroll', requestIndexActiveUpdate, { passive: true });
            window.addEventListener('resize', requestIndexActiveUpdate, { passive: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
