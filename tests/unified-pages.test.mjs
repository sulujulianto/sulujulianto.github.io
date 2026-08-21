import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const rootPages = {
    home: read('index.html'),
    projects: read('projects.html'),
    certificates: read('certificates.html'),
};
const notFoundPage = read('404.html');
const locales = ['id', 'en', 'ja', 'zh'];
const catalogs = Object.fromEntries(
    locales.map((locale) => [locale, JSON.parse(read(`assets/data/locales/ui-${locale}.json`))]),
);

const readCatalogPath = (catalog, path) => path.split('.').reduce((value, key) => value?.[key], catalog);

test('three root pages load the shared locale runtime in dependency order', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        assert.match(html, new RegExp(`<body data-page="${page}"`));
        const resolver = html.indexOf('assets/js/dist/language-resolver.js');
        const manager = html.indexOf('assets/js/dist/locale-manager.js');
        const app = html.indexOf('assets/js/dist/app.js');
        assert.ok(resolver > 0 && manager > resolver && app > manager, page);
    }
});

test('custom 404 page is multilingual, theme-aware, and safe for nested missing URLs', () => {
    assert.match(notFoundPage, /<body data-page="notFound"/);
    assert.match(notFoundPage, /<meta name="robots" content="noindex, follow"/);
    assert.doesNotMatch(notFoundPage, /rel="canonical"|hreflang=/);
    assert.match(notFoundPage, /src="\/assets\/js\/theme\.js"/);
    assert.match(notFoundPage, /src="\/assets\/js\/dist\/language-resolver\.js"/);
    assert.match(notFoundPage, /src="\/assets\/js\/dist\/locale-manager\.js"/);
    assert.match(notFoundPage, /href="\/assets\/css\/output\.css"/);
    assert.equal((notFoundPage.match(/data-language-selector/g) || []).length, 2);
    assert.equal((notFoundPage.match(/data-language-option=/g) || []).length, 8);
    assert.match(notFoundPage, /data-i18n="pages\.notFound\.heading"/);
    assert.match(notFoundPage, /data-i18n="pages\.notFound\.returnHome"/);

    const localeRuntime = read('assets/js/locale-manager.ts');
    assert.match(localeRuntime, /type PageKey = 'home' \| 'projects' \| 'certificates' \| 'projectDetail' \| 'notFound'/);
    assert.match(localeRuntime, /fetch\(`\/assets\/data\/locales\/ui-\$\{locale\}\.json`/);
});

test('each root page has accessible custom desktop and mobile language dropdowns', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        assert.equal((html.match(/data-language-selector/g) || []).length, 2, page);
        assert.equal((html.match(/data-language-picker/g) || []).length, 2, page);
        assert.equal((html.match(/data-language-menu/g) || []).length, 2, page);
        assert.equal((html.match(/data-language-option=/g) || []).length, 8, page);
        assert.doesNotMatch(html, /<select[^>]+data-language-selector/, page);
        for (const locale of locales) {
            assert.equal((html.match(new RegExp(`data-language-option="${locale}"`, 'g')) || []).length, 2, page);
        }
        assert.equal((html.match(/aria-haspopup="listbox"/g) || []).length, 2, page);
        assert.equal((html.match(/role="listbox"/g) || []).length, 2, page);
    }
});

test('desktop language dropdowns keep full names while mobile dropdowns use compact labels', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        const desktop = html.match(/<div class="language-picker language-picker-desktop"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
        const mobile = html.match(/<div class="language-picker language-picker-mobile"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';

        assert.match(desktop, /data-language-current>Bahasa Indonesia<\/span>/, page);
        assert.match(desktop, /data-language-option="ja"[^>]*>[\s\S]*?<span>日本語<\/span>/, page);
        assert.match(mobile, /data-language-current>ID<\/span>/, page);
        assert.match(mobile, /data-language-option="id"[^>]*>[\s\S]*?<span>ID<\/span>/, page);
        assert.match(mobile, /data-language-option="en"[^>]*>[\s\S]*?<span>EN<\/span>/, page);
        assert.match(mobile, /data-language-option="ja"[^>]*>[\s\S]*?<span>JP<\/span>/, page);
        assert.match(mobile, /data-language-option="zh"[^>]*>[\s\S]*?<span>CH<\/span>/, page);
    }
});

test('custom language dropdown supports selection, dismissal, and keyboard navigation', () => {
    const localeRuntime = read('assets/js/locale-manager.ts');
    const stylesheet = read('assets/css/main.css');

    assert.match(localeRuntime, /applyLocaleChoice\(locale\)/);
    assert.match(localeRuntime, /aria-expanded/);
    assert.match(localeRuntime, /event\.key === 'ArrowDown'/);
    assert.match(localeRuntime, /event\.key === 'Escape'/);
    assert.match(localeRuntime, /document\.addEventListener\('pointerdown'/);
    assert.match(stylesheet, /\.language-menu \{/);
    assert.match(stylesheet, /\.language-option\[aria-selected="true"\]/);
    assert.match(stylesheet, /html\.dark \.language-menu/);
});

test('dark language picker text stays bright instead of inheriting muted page text', () => {
    const stylesheet = read('assets/css/main.css');

    assert.match(stylesheet, /html\.dark \.language-trigger \{[\s\S]*?color: #eff6ff;/);
    assert.match(
        stylesheet,
        /html\.dark \.language-current,[\s\S]*?html\.dark \.language-option span \{[\s\S]*?color: inherit;/,
    );
});

test('CV button text is constrained to one line with enough shared button width', () => {
    assert.match(rootPages.home, /\.cv-download-btn,[\s\S]*?white-space: nowrap;/);
    assert.match(rootPages.home, /\.hero-btn \{[\s\S]*?width: 220px;/);
});

test('portfolio brand uses two compact lines on mobile and one line from tablet widths', () => {
    const stylesheet = read('assets/css/main.css');
    for (const [page, html] of Object.entries(rootPages)) {
        assert.match(
            html,
            /class="portfolio-brand" aria-label="Sulu Edward Julianto"><span>Sulu Edward<\/span><span>Julianto<\/span>/,
            page,
        );
    }
    assert.match(stylesheet, /\.portfolio-brand \{[\s\S]*?flex-direction: column;[\s\S]*?font-size: 0\.72rem;/);
    assert.match(
        stylesheet,
        /@media \(min-width: 768px\) \{[\s\S]*?\.portfolio-brand \{[\s\S]*?flex-direction: row;[\s\S]*?font-size: 1\.25rem;/,
    );
});

test('each root page publishes canonical and hreflang metadata before JavaScript runs', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        assert.match(html, /<link rel="canonical" href="https:\/\/sulujulianto\.github\.io\//, page);
        for (const locale of [...locales, 'x-default']) {
            assert.match(html, new RegExp(`rel="alternate" hreflang="${locale}"`), page);
        }
        assert.match(html, /<meta property="og:title"/);
        assert.match(html, /<meta property="og:description"/);
        assert.match(html, /<meta property="og:locale"/);
    }
});

test('root pages publish complete large-image social metadata and a 1200 by 630 preview', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        assert.match(html, /<meta property="og:type" content="website"/, page);
        assert.match(html, /<meta property="og:url" content="https:\/\/sulujulianto\.github\.io\//, page);
        assert.match(html, /<meta property="og:image" content="https:\/\/sulujulianto\.github\.io\/assets\/img\/social\/portfolio-preview\.png"/, page);
        assert.match(html, /<meta property="og:image:width" content="1200"/, page);
        assert.match(html, /<meta property="og:image:height" content="630"/, page);
        assert.match(html, /<meta property="og:image:alt"/, page);
        assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, page);
        assert.match(html, /<meta name="twitter:title"/, page);
        assert.match(html, /<meta name="twitter:description"/, page);
        assert.match(html, /<meta name="twitter:image"/, page);
    }

    const preview = readFileSync(new URL('../assets/img/social/portfolio-preview.png', import.meta.url));
    assert.equal(preview.subarray(1, 4).toString('ascii'), 'PNG');
    assert.equal(preview.readUInt32BE(16), 1200);
    assert.equal(preview.readUInt32BE(20), 630);
});

test('every declarative UI binding resolves in every catalog', () => {
    const bindings = new Set();
    for (const html of [...Object.values(rootPages), notFoundPage]) {
        for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) bindings.add(match[1]);
        for (const match of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
            for (const binding of match[1].split(',')) bindings.add(binding.slice(binding.indexOf(':') + 1));
        }
    }

    for (const locale of locales) {
        const missing = [...bindings].filter((path) => typeof readCatalogPath(catalogs[locale], path) !== 'string');
        assert.deepEqual(missing, [], locale);
    }
});

test('primary positioning is professional in every locale without changing official credential names', () => {
    assert.doesNotMatch(catalogs.id.pages.home.hero.tagline, /Junior/i);
    assert.doesNotMatch(catalogs.en.pages.home.hero.tagline, /Junior/i);
    assert.doesNotMatch(catalogs.ja.pages.home.hero.tagline, /ジュニア/);
    assert.doesNotMatch(catalogs.zh.pages.home.hero.tagline, /初级/);
    assert.match(catalogs.id.pages.home.hero.tagline, /Full-Stack Developer/);
    assert.match(catalogs.en.pages.home.about.description, /software engineering and system design/i);
    assert.match(catalogs.ja.pages.home.about.description, /ソフトウェアエンジニアリング/);
    assert.match(catalogs.zh.pages.home.about.description, /软件工程与系统设计/);

    const IndonesianCertificates = JSON.parse(read('assets/data/certificates/certificates-id.json'));
    assert.ok(IndonesianCertificates.some((certificate) => certificate.title === 'Junior Web Developer (BNSP)'));
});

test('root pages use root-relative assets and React data bases', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        assert.doesNotMatch(html, /(?:src|href)="\.\.\/assets\//, page);
        assert.doesNotMatch(html, /data-base-path="\.\.\/"/, page);
    }
});

test('smooth scrolling understands locale-aware navigation URLs', () => {
    const themeRuntime = read('assets/js/theme.js');
    assert.match(themeRuntime, /a\[data-route\]/);
    assert.match(themeRuntime, /targetUrl\.pathname === window\.location\.pathname/);
    assert.match(themeRuntime, /document\.querySelector\(targetUrl\.hash\)/);
    assert.doesNotMatch(themeRuntime, /querySelector\(targetId\)/);
});

test('home page exposes all four locale-aware React roots and localized contact form', () => {
    for (const id of ['about-gallery-root', 'history-react-root', 'portfolio-react-root', 'certificates-react-root']) {
        assert.match(rootPages.home, new RegExp(`id="${id}"[^>]+data-locale="id"[^>]+data-base-path="\\./"`));
    }
    assert.match(rootPages.home, /id="contactForm"/);
    assert.doesNotMatch(rootPages.home, /document\.getElementById\('contactForm'\)\.addEventListener/);
});

test('root pages do not contain duplicate element ids', () => {
    for (const [page, html] of Object.entries(rootPages)) {
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, page);
    }
});

test('all twelve legacy pages redirect to the matching root page and canonical locale', () => {
    const mappings = { id: 'id', en: 'en', jp: 'ja', cn: 'zh' };
    const targets = { 'index.html': '../', 'projects.html': '../projects.html', 'certificates.html': '../certificates.html' };
    for (const [folder, locale] of Object.entries(mappings)) {
        for (const [file, target] of Object.entries(targets)) {
            const html = read(`${folder}/${file}`);
            assert.match(html, new RegExp(`parameters\\.set\\('lang', '${locale}'\\)`));
            assert.ok(html.includes(`window.location.replace('${target}'`));
            assert.ok(html.includes('window.location.hash'));
        }
    }
});

test('project category catalogs keep the same extensible ids in every locale', () => {
    const requiredIds = [
        '*',
        'frontend-web',
        'fullstack-web',
        'backend-api',
        'mobile-app',
        'ai-machine-learning',
        'cybersecurity',
        'systems-networking',
        'game-interactive',
    ];
    const referenceIds = JSON.parse(read('assets/data/categories/projects/project-categories-id.json')).map(
        (category) => category.id,
    );
    for (const locale of locales) {
        const categories = JSON.parse(read(`assets/data/categories/projects/project-categories-${locale}.json`));
        assert.deepEqual(categories.map((category) => category.id), referenceIds, locale);
        assert.ok(requiredIds.every((id) => referenceIds.includes(id)), locale);
        assert.ok(categories.every((category) => category.label.trim()), locale);
    }
});

test('sitemap publishes root pages, the blog, and all completed project details', () => {
    const sitemap = read('sitemap.xml');
    for (const page of ['/', '/projects.html', '/certificates.html', '/blog/']) {
        assert.ok(sitemap.includes(`https://sulujulianto.github.io${page}`));
    }
    for (const slug of [
        'jejak-petualang',
        'nusantara-trans',
        'japan-travel',
        'sistem-informasi-wilayah-indonesia',
        'pixel-heist-co-op',
        'atlas-country-api',
        'lokerlens-ai',
    ]) {
        assert.ok(sitemap.includes(`https://sulujulianto.github.io/projects/${slug}/`), slug);
    }
    assert.doesNotMatch(sitemap, /<loc>https:\/\/sulujulianto\.github\.io\/(?:id|en|jp|cn)\//);
    assert.doesNotMatch(sitemap, /<loc>https:\/\/sulujulianto\.github\.io\/404\.html/);
    for (const locale of [...locales, 'x-default']) assert.ok(sitemap.includes(`hreflang="${locale}"`));
    const alternateLinks = sitemap.match(/<xhtml:link\b[^>]*>/g) || [];
    assert.ok(alternateLinks.length > 0);
    for (const link of alternateLinks) assert.match(link, /\/>$/);
});
