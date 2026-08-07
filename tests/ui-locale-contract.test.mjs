import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const locales = ['id', 'en', 'ja', 'zh'];
const catalogs = Object.fromEntries(
    locales.map((locale) => [
        locale,
        JSON.parse(readFileSync(new URL(`../assets/data/locales/ui-${locale}.json`, import.meta.url), 'utf8')),
    ]),
);

const nodeKind = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value === 'object' ? 'object' : typeof value;
};

const visit = (value, path = '', visitor) => {
    visitor(value, path);
    if (nodeKind(value) !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
        visit(child, path ? `${path}.${key}` : key, visitor);
    }
};

const pathsAndKinds = (catalog) => {
    const result = [];
    visit(catalog, '', (value, path) => result.push([path, nodeKind(value)]));
    return result;
};

const objectKeyOrders = (catalog) => {
    const result = [];
    visit(catalog, '', (value, path) => {
        if (nodeKind(value) === 'object') result.push([path, Object.keys(value)]);
    });
    return result;
};

test('all catalogs use their canonical locale', () => {
    for (const locale of locales) assert.equal(catalogs[locale].locale, locale);
});

test('all catalogs have identical paths and node types', () => {
    const expected = pathsAndKinds(catalogs.id).map(([path, kind]) => [path === 'locale' ? '<locale>' : path, kind]);
    for (const locale of locales.slice(1)) {
        const actual = pathsAndKinds(catalogs[locale]).map(([path, kind]) => [path === 'locale' ? '<locale>' : path, kind]);
        assert.deepEqual(actual, expected, locale);
    }
});

test('all catalogs preserve Indonesian object key order', () => {
    const expected = objectKeyOrders(catalogs.id);
    for (const locale of locales.slice(1)) assert.deepEqual(objectKeyOrders(catalogs[locale]), expected, locale);
});

test('catalog strings are non-empty except approved Japanese heading leads', () => {
    const approvedEmptyPaths = new Set([
        'pages.home.about.heading.lead',
        'pages.home.history.heading.lead',
    ]);

    for (const locale of locales) {
        const failures = [];
        visit(catalogs[locale], '', (value, path) => {
            if (typeof value !== 'string') return;
            if (value.trim()) return;
            if (locale === 'ja' && approvedEmptyPaths.has(path)) return;
            failures.push(path);
        });
        assert.deepEqual(failures, [], locale);
    }
});

test('catalogs contain text only and no portfolio records or presentation fields', () => {
    const forbiddenKeys = new Set([
        'category', 'class', 'className', 'css', 'dateAdded', 'fullImageUrl', 'githubUrl',
        'imageUrl', 'isFeatured', 'liveUrl', 'style', 'styles', 'tanggalKadaluarsa',
        'tanggalTerbit', 'techStack',
    ]);

    for (const locale of locales) {
        const failures = [];
        visit(catalogs[locale], '', (value, path) => {
            if (Array.isArray(value)) failures.push(`${path}:array`);
            const key = path.split('.').at(-1);
            if (key && forbiddenKeys.has(key)) failures.push(`${path}:key`);
            if (typeof value === 'string' && (/<[^>]+>/i.test(value) || /\b(?:class|style)\s*=/i.test(value))) {
                failures.push(`${path}:markup`);
            }
        });
        assert.deepEqual(failures, [], locale);
    }
});

test('history navigation and section text exist in every locale', () => {
    for (const locale of locales) {
        const catalog = catalogs[locale];
        assert.equal(typeof catalog.shared.navigation.history, 'string');
        assert.equal(typeof catalog.pages.home.history.heading.lead, 'string');
        assert.equal(typeof catalog.pages.home.history.heading.highlight, 'string');
        assert.ok(catalog.pages.home.history.introduction.trim());
    }
});
