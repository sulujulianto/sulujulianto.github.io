import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { validateProjectCategoryCatalogs } from '../scripts/project-category-contract.mjs';

const rootUrl = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, rootUrl), 'utf8');
const readJson = (path) => JSON.parse(read(path));
const locales = ['id', 'en', 'ja', 'zh'];
const requiredCategoryIds = [
    '*',
    'frontend-web',
    'fullstack-web',
    'backend-api',
    'mobile-app',
    'desktop-app',
    'ai-machine-learning',
    'data-database',
    'cloud-infrastructure',
    'devops-automation',
    'cybersecurity',
    'systems-networking',
    'cli-developer-tools',
    'game-interactive',
];

const published = [
    { slug: 'jejak-petualang', locale: 'id' },
    { slug: 'nusantara-trans', locale: 'id' },
    { slug: 'japan-travel', locale: 'id' },
    { slug: 'sistem-informasi-wilayah-indonesia', locale: 'id' },
    { slug: 'pixel-heist-co-op', locale: 'id' },
    { slug: 'lokerlens-ai', locale: 'id' },
    { slug: 'atlas-country-api', locale: 'en' },
];

const inDevelopment = ['kospintar', 'lokerkita', 'antrianku'];
const projectRecords = [
    ...readJson('assets/data/projects/projects-id.json'),
    ...readJson('assets/data/projects/projects-en.json'),
].filter((record) => record.title);

const allStrings = (value, output = []) => {
    if (typeof value === 'string') output.push(value);
    else if (Array.isArray(value)) value.forEach((item) => allStrings(item, output));
    else if (value && typeof value === 'object') Object.values(value).forEach((item) => allStrings(item, output));
    return output;
};

test('published and in-development status is explicit for every displayable project', () => {
    assert.equal(projectRecords.length, 10);
    assert.deepEqual(
        projectRecords.filter((record) => record.status === 'published').map((record) => record.slug).sort(),
        published.map((item) => item.slug).sort(),
    );
    assert.deepEqual(
        projectRecords.filter((record) => record.status === 'in-development').map((record) => record.slug).sort(),
        [...inDevelopment].sort(),
    );
    for (const record of projectRecords) {
        assert.match(record.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, record.title);
        assert.ok(['published', 'in-development'].includes(record.status), record.title);
        assert.equal('modalDescription' in record, false, record.title);
    }
});

test('only completed projects have real detail page shells and article JSON', () => {
    for (const { slug, locale } of published) {
        assert.equal(existsSync(new URL(`projects/${slug}/index.html`, rootUrl)), true, slug);
        assert.equal(existsSync(new URL(`assets/data/project-details/${locale}/${slug}.json`, rootUrl)), true, slug);
    }
    for (const slug of inDevelopment) {
        assert.equal(existsSync(new URL(`projects/${slug}/index.html`, rootUrl)), false, slug);
        assert.equal(existsSync(new URL(`assets/data/project-details/id/${slug}.json`, rootUrl)), false, slug);
    }
});

test('project article JSON uses safe blog-style blocks and valid local images', () => {
    const allowedBlocks = new Set(['paragraph', 'heading', 'list', 'image', 'code', 'callout']);
    for (const { slug, locale } of published) {
        const article = readJson(`assets/data/project-details/${locale}/${slug}.json`);
        assert.equal(article.version, 1, slug);
        assert.equal(article.slug, slug);
        assert.equal(article.contentLanguage, locale);
        assert.ok(article.title.trim(), slug);
        assert.ok(article.summary.length >= 80, slug);
        assert.ok(Array.isArray(article.techStack) && article.techStack.length >= 5, slug);
        assert.ok(Array.isArray(article.content) && article.content.length >= 7, slug);
        assert.ok(article.content.every((block) => allowedBlocks.has(block.type)), slug);
        assert.match(article.links.github, /^https:\/\/github\.com\/sulujulianto\//, slug);
        assert.equal(article.links.liveDemo, null, slug);

        const imagePaths = [article.hero.src, ...article.content.filter((block) => block.type === 'image').map((block) => block.src)];
        for (const imagePath of imagePaths) {
            assert.match(imagePath, /^\/assets\/img\//, `${slug}: ${imagePath}`);
            assert.equal(existsSync(new URL(imagePath.slice(1), rootUrl)), true, `${slug}: ${imagePath}`);
        }

        for (const value of allStrings(article)) {
            assert.doesNotMatch(value, /<\/?(?:script|style|iframe|object|embed|html)\b/i, slug);
        }
    }
});

test('each detail shell is nested-path safe and exposes accurate metadata', () => {
    for (const { slug, locale } of published) {
        const html = read(`projects/${slug}/index.html`);
        assert.match(html, /<body data-page="projectDetail"/);
        assert.match(html, new RegExp(`data-project-slug="${slug}"`));
        assert.match(html, new RegExp(`data-content-locale="${locale}"`));
        assert.match(html, new RegExp(`rel="canonical" href="https://sulujulianto.github.io/projects/${slug}/"`));
        assert.match(html, new RegExp(`property="og:url" content="https://sulujulianto.github.io/projects/${slug}/"`));
        assert.match(html, /property="og:image:secure_url"/);
        assert.match(html, /property="og:image:type" content="image\/webp"/);
        assert.match(html, /property="og:image:width" content="\d+"/);
        assert.match(html, /property="og:image:height" content="\d+"/);
        assert.match(html, /property="og:image:alt"/);
        assert.match(html, /name="twitter:card" content="summary_large_image"/);
        assert.match(html, /name="twitter:title"/);
        assert.match(html, /name="twitter:description"/);
        assert.match(html, /name="twitter:image"/);
        assert.match(html, /src="\/assets\/js\/dist\/language-resolver\.js"/);
        assert.match(html, /src="\/assets\/js\/dist\/locale-manager\.js"/);
        assert.match(html, /src="\/assets\/js\/dist\/project-detail\.js"/);
        assert.match(html, /href="\/assets\/css\/output\.css"/);
        assert.equal((html.match(/data-language-selector/g) || []).length, 2, slug);
        assert.equal((html.match(/data-language-option=/g) || []).length, 8, slug);
        assert.equal((html.match(/class="theme-switch-wrapper"/g) || []).length, 2, slug);
        assert.equal((html.match(/class="slider"/g) || []).length, 2, slug);
        assert.equal((html.match(/icon-inside icon-sun-on-slider/g) || []).length, 2, slug);
        assert.equal((html.match(/icon-inside icon-moon-on-slider hidden/g) || []).length, 2, slug);
        assert.doesNotMatch(html, /project-theme-switch/, slug);
        assert.doesNotMatch(html, /modal\.css|ProjectModal|modalDescription/, slug);
    }
});

test('project detail visual shell matches the portfolio without standalone chrome', () => {
    const css = read('assets/css/main.css');

    assert.match(css, /\.project-detail-page \.language-picker\s*\{\s*display: none;/);
    assert.match(css, /\.project-detail-page \.theme-switch-wrapper\s*\{[^}]*width: 60px;[^}]*height: 34px;/s);
    assert.match(css, /\.project-detail-page \.slider::before\s*\{[^}]*height: 26px;[^}]*width: 26px;/s);
    assert.match(css, /\.project-detail-page \.slider \.icon-sun-on-slider\s*\{[^}]*opacity: 1;/s);
    assert.match(css, /\.project-detail-page \.slider \.icon-moon-on-slider\s*\{[^}]*opacity: 0;/s);
    assert.match(css, /\.project-detail-page input:checked \+ \.slider \.icon-moon-on-slider\s*\{[^}]*opacity: 1;/s);
    assert.match(css, /\.project-detail-header\s*\{[^}]*border: 0;[^}]*background: rgba\(165, 243, 252, 0\.9\);/s);
    assert.match(css, /html\.dark \.project-detail-header\s*\{[^}]*background: rgba\(15, 23, 42, 0\.92\);/s);
    assert.match(css, /\.project-detail-footer\s*\{[^}]*border: 0;[^}]*background: transparent;/s);
    assert.match(css, /\.project-article__hero figcaption,[\s\S]*?color: #1e293b;/);
    assert.match(css, /html\.dark \.project-article__hero figcaption,[\s\S]*?color: #cbd5e1;/);
    assert.match(css, /\.project-article\s*\{[^}]*border: 0;[^}]*background: transparent;[^}]*box-shadow: none;/s);
    assert.match(css, /\.project-article__breadcrumb\s*\{[^}]*border: 0;/s);
    assert.match(css, /\.project-article__hero\s*\{[^}]*border: 0;/s);
    assert.match(css, /\.project-article__actions\s*\{[^}]*border: 0;[^}]*background: transparent;/s);
});

test('cards navigate to real slug URLs and modal code is fully removed', () => {
    const app = read('assets/js/app.tsx');
    assert.match(app, /new URL\(`\/projects\/\$\{encodeURIComponent\(item\.slug\)\}\/`/);
    assert.match(app, /item\.status === 'in-development'/);
    assert.match(app, /onError=\{\(\) => setImageFailed\(true\)\}/);
    assert.match(app, /project-card__image-placeholder/);
    assert.match(app, /<ProjectCard[\s\S]*?href=/);
    assert.doesNotMatch(app, /ProjectModal|selectedProject|modalDescription/);
    assert.equal(existsSync(new URL('assets/css/modal.css', rootUrl)), false);
    assert.doesNotMatch(read('index.html'), /modal\.css/);
    assert.doesNotMatch(read('projects.html'), /modal\.css/);
    assert.doesNotMatch(read('certificates.html'), /modal\.css/);
    assert.equal(existsSync(new URL('dashboard.html', rootUrl)), false);
});

test('detail renderer supports article blocks and hides absent Live Demo links', () => {
    const runtime = read('assets/js/project-detail.tsx');
    for (const block of ['paragraph', 'heading', 'list', 'image', 'code', 'callout']) {
        assert.match(runtime, new RegExp(`block\\.type === '${block}'`), block);
    }
    assert.match(runtime, /article\.links\.github &&/);
    assert.match(runtime, /article\.links\.liveDemo &&/);
    assert.match(runtime, /<article className="project-article" lang=\{article\.contentLanguage\}>/);
    assert.doesNotMatch(runtime, /dangerouslySetInnerHTML|innerHTML\s*=/);
});

test('project category catalogs are extensible, translated, and valid in every locale', () => {
    const catalogs = Object.fromEntries(
        locales.map((locale) => [locale, readJson(`assets/data/categories/projects/project-categories-${locale}.json`)]),
    );
    const projectsByLocale = Object.fromEntries(
        locales.map((locale) => [locale, readJson(`assets/data/projects/projects-${locale}.json`)]),
    );

    assert.deepEqual(validateProjectCategoryCatalogs({ locales, catalogs, projectsByLocale }), []);
    for (const locale of locales) {
        const ids = catalogs[locale].map((category) => category.id);
        assert.deepEqual(ids, catalogs.id.map((category) => category.id), locale);
        assert.ok(requiredCategoryIds.every((id) => ids.includes(id)), locale);
        assert.ok(catalogs[locale].every((category) => category.label.trim()), locale);
    }
});

test('unused project categories stay hidden and appear automatically when assigned', () => {
    const sandbox = { console: { error() {} } };
    runInNewContext(read('assets/js/dist/app.js'), sandbox);
    const categoryApi = sandbox.PortfolioProjectCategories;
    assert.ok(categoryApi);

    const definitions = readJson('assets/data/categories/projects/project-categories-id.json');
    const currentlyUsed = projectRecords.map((record) => record.category);
    const visibleBefore = Array.from(
        categoryApi.selectAvailableCategories(definitions, currentlyUsed, 'Semua'),
        (category) => category.id,
    );
    assert.deepEqual(visibleBefore, ['*', 'fullstack-web', 'backend-api', 'game-interactive']);
    assert.equal(visibleBefore.includes('frontend-web'), false);

    const visibleAfter = Array.from(
        categoryApi.selectAvailableCategories(definitions, [...currentlyUsed, 'frontend-web'], 'Semua'),
        (category) => category.id,
    );
    assert.equal(visibleAfter.includes('frontend-web'), true);
});

test('project category contract detects mistyped ids and locale drift', () => {
    const catalogs = Object.fromEntries(
        locales.map((locale) => [locale, readJson(`assets/data/categories/projects/project-categories-${locale}.json`)]),
    );
    const projectsByLocale = Object.fromEntries(
        locales.map((locale) => [locale, readJson(`assets/data/projects/projects-${locale}.json`)]),
    );
    projectsByLocale.id = projectsByLocale.id.map((project, index) =>
        index === 0 ? { ...project, category: 'frontned-web' } : project,
    );
    catalogs.zh = catalogs.zh.slice(0, -1);

    const errors = validateProjectCategoryCatalogs({ locales, catalogs, projectsByLocale });
    assert.ok(errors.some((error) => error.includes('undefined category "frontned-web"')));
    assert.ok(errors.some((error) => error.includes('zh: project category ids and order must match id')));
});

test('copywriting preserves documented limitations instead of overstating readiness', () => {
    const japan = read('assets/data/project-details/id/japan-travel.json');
    const atlas = read('assets/data/project-details/en/atlas-country-api.json');
    const pixel = read('assets/data/project-details/id/pixel-heist-co-op.json');
    const wilayah = read('assets/data/project-details/id/sistem-informasi-wilayah-indonesia.json');
    const lokerlens = read('assets/data/project-details/id/lokerlens-ai.json');

    assert.match(japan, /129 pengujian dan 509 assertion/);
    assert.match(japan, /tidak mengklaim persentase coverage/);
    assert.match(atlas, /85% threshold/);
    assert.match(atlas, /basic in-memory rate limiter/);
    assert.match(pixel, /belum menyediakan URL demo publik/);
    assert.match(wilayah, /bukan jaminan bahwa data selalu sama/);
    assert.match(lokerlens, /bukan prediksi peluang diterima kerja/);
    assert.match(lokerlens, /belum memiliki penerapan publik/);
    assert.match(lokerlens, /Integrasi OpenAI langsung/);
});
