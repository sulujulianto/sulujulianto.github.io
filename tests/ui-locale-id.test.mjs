import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const catalogUrl = new URL('../assets/data/locales/ui-id.json', import.meta.url);
const rawCatalog = readFileSync(catalogUrl, 'utf8');

const parseCatalog = () => JSON.parse(rawCatalog);

const visitCatalog = (value, path = 'catalog', visitor) => {
    visitor(value, path);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, child] of Object.entries(value)) {
            visitCatalog(child, `${path}.${key}`, visitor);
        }
    }
};

test('catalog parses as JSON', () => {
    assert.doesNotThrow(parseCatalog);
});

test('catalog locale is exactly id', () => {
    assert.equal(parseCatalog().locale, 'id');
});

test('top-level catalog contract is stable', () => {
    assert.deepEqual(Object.keys(parseCatalog()), ['locale', 'shared', 'pages']);
});

test('required shared and page fields are present', () => {
    const catalog = parseCatalog();

    assert.equal(typeof catalog.shared.brand, 'string');
    assert.equal(typeof catalog.shared.navigation.home, 'string');
    assert.equal(typeof catalog.shared.footer.owner, 'string');

    assert.equal(typeof catalog.pages.home.documentTitle, 'string');
    assert.equal(typeof catalog.pages.home.hero.tagline, 'string');
    assert.equal(typeof catalog.pages.home.about.description, 'string');
    assert.equal(typeof catalog.pages.home.skills.heading.lead, 'string');
    assert.equal(typeof catalog.pages.home.skills.heading.highlight, 'string');
    assert.equal(typeof catalog.pages.home.featuredProjects.introduction, 'string');
    assert.equal(typeof catalog.pages.home.featuredCertificates.introduction, 'string');
    assert.equal(typeof catalog.pages.home.contact.form.fields.name.ariaLabel, 'string');
    assert.equal(typeof catalog.pages.home.contact.form.success.message, 'string');
    assert.equal(typeof catalog.pages.home.contact.form.failure.message, 'string');

    assert.equal(typeof catalog.pages.projects.documentTitle, 'string');
    assert.equal(typeof catalog.pages.projects.introduction, 'string');
    assert.equal(typeof catalog.pages.certificates.documentTitle, 'string');
    assert.equal(typeof catalog.pages.certificates.introduction, 'string');
    assert.equal(typeof catalog.pages.notFound.documentTitle, 'string');
    assert.equal(typeof catalog.pages.notFound.description, 'string');
    assert.equal(typeof catalog.pages.notFound.returnHome, 'string');
});

test('selected values remain exact copies of Indonesian source text', () => {
    const catalog = parseCatalog();

    assert.equal(catalog.pages.home.documentTitle, 'Sulu Edward Julianto — Full-Stack Developer');
    assert.equal(catalog.pages.home.hero.downloadCv, 'Unduh CV');
    assert.equal(catalog.pages.home.hero.hireMe, 'Hire Me');
    assert.equal(catalog.pages.home.contact.form.submitting, 'Mengirim...');
    assert.equal(catalog.pages.home.contact.form.success.heading, 'Berhasil!');
    assert.equal(catalog.pages.home.contact.form.failure.heading, 'Gagal!');
    assert.equal(catalog.pages.projects.documentTitle, 'Portofolio Proyek — Sulu Edward Julianto');
    assert.equal(
        catalog.pages.certificates.documentTitle,
        'Sertifikasi & Penghargaan — Sulu Edward Julianto',
    );
    assert.equal(catalog.pages.notFound.heading, 'Halaman tidak ditemukan');
});

test('every catalog leaf is a non-empty string', () => {
    const failures = [];

    visitCatalog(parseCatalog(), 'catalog', (value, path) => {
        if (value && typeof value === 'object') return;
        if (typeof value !== 'string' || value.trim().length === 0) failures.push(path);
    });

    assert.deepEqual(failures, []);
});

test('catalog contains no arrays or project and certificate records', () => {
    const arrays = [];
    const forbiddenRecordKeys = new Set([
        'category',
        'dateAdded',
        'fullImageUrl',
        'githubUrl',
        'imageUrl',
        'isFeatured',
        'liveUrl',
        'tanggalKadaluarsa',
        'tanggalTerbit',
        'techStack',
    ]);
    const recordFields = [];

    visitCatalog(parseCatalog(), 'catalog', (value, path) => {
        if (Array.isArray(value)) arrays.push(path);
        if (!value || typeof value !== 'object' || Array.isArray(value)) return;

        for (const key of Object.keys(value)) {
            if (forbiddenRecordKeys.has(key)) recordFields.push(`${path}.${key}`);
        }
    });

    assert.deepEqual(arrays, []);
    assert.deepEqual(recordFields, []);
});

test('catalog contains no HTML markup, scripts, styles, or CSS class fields', () => {
    const violations = [];
    const forbiddenKeys = new Set(['class', 'className', 'css', 'style', 'styles']);

    visitCatalog(parseCatalog(), 'catalog', (value, path) => {
        const key = path.split('.').at(-1);
        if (key && forbiddenKeys.has(key)) violations.push(path);

        if (typeof value !== 'string') return;
        if (/<[^>]+>/i.test(value) || /\b(?:class|style)\s*=/i.test(value)) violations.push(path);
    });

    assert.deepEqual(violations, []);
});
