import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const idCatalogUrl = new URL('../assets/data/locales/ui-id.json', import.meta.url);
const enCatalogUrl = new URL('../assets/data/locales/ui-en.json', import.meta.url);
const jaCatalogUrl = new URL('../assets/data/locales/ui-ja.json', import.meta.url);
const zhCatalogUrl = new URL('../assets/data/locales/ui-zh.json', import.meta.url);
const zhIndexUrl = new URL('../cn/index.html', import.meta.url);
const zhProjectsUrl = new URL('../cn/projects.html', import.meta.url);
const zhCertificatesUrl = new URL('../cn/certificates.html', import.meta.url);

const idCatalog = JSON.parse(readFileSync(idCatalogUrl, 'utf8'));
const enCatalog = JSON.parse(readFileSync(enCatalogUrl, 'utf8'));
const jaCatalog = JSON.parse(readFileSync(jaCatalogUrl, 'utf8'));
const zhCatalog = JSON.parse(readFileSync(zhCatalogUrl, 'utf8'));
const rawZhIndex = readFileSync(zhIndexUrl, 'utf8');
const rawMandarinHtml = [
    rawZhIndex,
    readFileSync(zhProjectsUrl, 'utf8'),
    readFileSync(zhCertificatesUrl, 'utf8'),
].join('\n');

const japaneseEmptyLeadPath = 'pages.home.about.heading.lead';
const scriptExceptions = new Map([
    ['pages.home.contact.form.submitting', '发送中...'],
    ['pages.home.contact.form.subject', '来自作品集网站的新消息'],
]);

const stripInactiveHtml = (html) => {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
};

const activeMandarinHtml = stripInactiveHtml(rawMandarinHtml);
const inlineScripts = [...rawZhIndex.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1],
);

const nodeKind = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value === 'object' ? 'object' : typeof value;
};

const visitNodes = (value, path = '', visitor) => {
    visitor(value, path);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, child] of Object.entries(value)) {
            visitNodes(child, path ? `${path}.${key}` : key, visitor);
        }
    }
};

const collectKeyPaths = (catalog) => {
    const paths = [];
    visitNodes(catalog, '', (_value, path) => {
        if (path) paths.push(path);
    });
    return paths;
};

const collectNodeKinds = (catalog) => {
    const kinds = new Map();
    visitNodes(catalog, '', (value, path) => kinds.set(path, nodeKind(value)));
    return kinds;
};

const collectLeafEntries = (catalog) => {
    const leaves = [];
    visitNodes(catalog, '', (value, path) => {
        if (typeof value === 'string') leaves.push([path, value]);
    });
    return leaves;
};

const collectOrderMismatches = (reference, candidate, path = '') => {
    if (nodeKind(reference) !== 'object' || nodeKind(candidate) !== 'object') return [];

    const expectedKeys = Object.keys(reference);
    const actualKeys = Object.keys(candidate);
    const mismatches = [];

    if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
        mismatches.push(path || '<root>');
    }

    for (const key of expectedKeys) {
        if (Object.hasOwn(candidate, key)) {
            mismatches.push(...collectOrderMismatches(reference[key], candidate[key], path ? `${path}.${key}` : key));
        }
    }

    return mismatches;
};

const contractViolations = (reference, candidate, path = '') => {
    const expectedKind = nodeKind(reference);
    const actualKind = nodeKind(candidate);
    const violations = [];

    if (expectedKind !== actualKind) {
        return [`${path || '<root>'}: expected ${expectedKind}, received ${actualKind}`];
    }

    if (expectedKind === 'string') {
        if (candidate.length === 0) violations.push(`${path}: empty string`);
        return violations;
    }

    if (expectedKind !== 'object') return violations;

    const expectedKeys = Object.keys(reference);
    const actualKeys = Object.keys(candidate);
    if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
        violations.push(`${path || '<root>'}: keys differ`);
    }

    for (const key of expectedKeys) {
        if (Object.hasOwn(candidate, key)) {
            violations.push(...contractViolations(reference[key], candidate[key], path ? `${path}.${key}` : key));
        }
    }

    return violations;
};

const cloneCatalog = (catalog) => JSON.parse(JSON.stringify(catalog));

test('all four catalogs parse with canonical locales', () => {
    assert.equal(idCatalog.locale, 'id');
    assert.equal(enCatalog.locale, 'en');
    assert.equal(jaCatalog.locale, 'ja');
    assert.equal(zhCatalog.locale, 'zh');
});

test('all key paths are identical across the four catalogs', () => {
    const expectedPaths = collectKeyPaths(idCatalog);
    assert.deepEqual(collectKeyPaths(enCatalog), expectedPaths);
    assert.deepEqual(collectKeyPaths(jaCatalog), expectedPaths);
    assert.deepEqual(collectKeyPaths(zhCatalog), expectedPaths);
});

test('node types are identical at every path', () => {
    const expectedKinds = [...collectNodeKinds(idCatalog)];
    assert.deepEqual([...collectNodeKinds(enCatalog)], expectedKinds);
    assert.deepEqual([...collectNodeKinds(jaCatalog)], expectedKinds);
    assert.deepEqual([...collectNodeKinds(zhCatalog)], expectedKinds);
});

test('Mandarin object key order follows the Indonesian catalog at every level', () => {
    assert.deepEqual(collectOrderMismatches(idCatalog, zhCatalog), []);
});

test('all four catalogs contain the same number of string leaves', () => {
    assert.equal(collectLeafEntries(idCatalog).length, 133);
    assert.equal(collectLeafEntries(enCatalog).length, 133);
    assert.equal(collectLeafEntries(jaCatalog).length, 133);
    assert.equal(collectLeafEntries(zhCatalog).length, 133);
});

test('every Mandarin leaf is a non-empty string', () => {
    const emptyLeaves = collectLeafEntries(zhCatalog).filter(([_path, value]) => value.length === 0);
    assert.deepEqual(emptyLeaves, []);
    assert.deepEqual(contractViolations(idCatalog, zhCatalog), []);
});

test('the Japanese empty-lead exception is not inherited by Mandarin', () => {
    const japaneseEmptyLeaves = collectLeafEntries(jaCatalog).filter(([_path, value]) => value.length === 0);
    assert.deepEqual(japaneseEmptyLeaves, [[japaneseEmptyLeadPath, '']]);
    assert.equal(zhCatalog.pages.home.about.heading.lead, '关于');
    assert.notEqual(zhCatalog.pages.home.about.heading.lead, '');
});

test('Mandarin catalog contains no arrays or project and certificate records', () => {
    const arrays = [];
    const recordFields = [];
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

    visitNodes(zhCatalog, '', (value, path) => {
        if (Array.isArray(value)) arrays.push(path);
        if (nodeKind(value) !== 'object') return;

        for (const key of Object.keys(value)) {
            if (forbiddenRecordKeys.has(key)) recordFields.push(path ? `${path}.${key}` : key);
        }
    });

    assert.deepEqual(arrays, []);
    assert.deepEqual(recordFields, []);
});

test('Mandarin catalog contains no markup, scripts, styles, or CSS class fields', () => {
    const violations = [];
    const forbiddenKeys = new Set(['class', 'className', 'css', 'style', 'styles']);

    visitNodes(zhCatalog, '', (value, path) => {
        const key = path.split('.').at(-1);
        if (key && forbiddenKeys.has(key)) violations.push(path);
        if (typeof value === 'string' && (/<[^>]+>/i.test(value) || /\b(?:class|style)\s*=/i.test(value))) {
            violations.push(path);
        }
    });

    assert.deepEqual(violations, []);
});

test('every regular Mandarin value comes from active Mandarin HTML', () => {
    const missingValues = collectLeafEntries(zhCatalog)
        .filter(([path]) => path !== 'locale' && !scriptExceptions.has(path))
        .filter(([_path, value]) => !activeMandarinHtml.includes(value));

    assert.deepEqual(missingValues, []);
});

test('the Mandarin about heading has literal active lead and highlight text', () => {
    assert.equal(zhCatalog.pages.home.about.heading.lead, '关于');
    assert.equal(zhCatalog.pages.home.about.heading.highlight, '我');
    assert.equal(activeMandarinHtml.includes(zhCatalog.pages.home.about.heading.lead), true);
    assert.equal(activeMandarinHtml.includes(zhCatalog.pages.home.about.heading.highlight), true);
});

test('the two approved script exceptions occur literally inside cn/index.html inline scripts', () => {
    for (const [path, expectedValue] of scriptExceptions) {
        const actualValue = path.split('.').reduce((value, key) => value[key], zhCatalog);
        assert.equal(actualValue, expectedValue);
        assert.equal(rawZhIndex.includes(actualValue), true);
        assert.equal(inlineScripts.some((script) => script.includes(actualValue)), true);
        assert.equal(activeMandarinHtml.includes(actualValue), false);
    }
});

test('only the two script values bypass active-source checks', () => {
    const bypassedPaths = collectLeafEntries(zhCatalog)
        .filter(([path]) => scriptExceptions.has(path))
        .map(([path]) => path);

    assert.deepEqual(bypassedPaths, [...scriptExceptions.keys()]);
});

test('contract validation detects removed, added, array, and empty mutations', () => {
    const removed = cloneCatalog(zhCatalog);
    delete removed.shared.brand;

    const added = cloneCatalog(zhCatalog);
    added.shared.unexpected = 'Unexpected';

    const arrayValue = cloneCatalog(zhCatalog);
    arrayValue.pages.home.hero.name = [];

    const emptyValue = cloneCatalog(zhCatalog);
    emptyValue.pages.home.hero.name = '';

    for (const mutant of [removed, added, arrayValue, emptyValue]) {
        assert.notDeepEqual(contractViolations(idCatalog, mutant), []);
    }
});
