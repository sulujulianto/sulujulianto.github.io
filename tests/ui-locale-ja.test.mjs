import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const idCatalogUrl = new URL('../assets/data/locales/ui-id.json', import.meta.url);
const enCatalogUrl = new URL('../assets/data/locales/ui-en.json', import.meta.url);
const jaCatalogUrl = new URL('../assets/data/locales/ui-ja.json', import.meta.url);
const jaIndexUrl = new URL('../jp/index.html', import.meta.url);
const jaProjectsUrl = new URL('../jp/projects.html', import.meta.url);
const jaCertificatesUrl = new URL('../jp/certificates.html', import.meta.url);

const idCatalog = JSON.parse(readFileSync(idCatalogUrl, 'utf8'));
const enCatalog = JSON.parse(readFileSync(enCatalogUrl, 'utf8'));
const jaCatalog = JSON.parse(readFileSync(jaCatalogUrl, 'utf8'));
const rawJaIndex = readFileSync(jaIndexUrl, 'utf8');
const rawJapaneseHtml = [
    rawJaIndex,
    readFileSync(jaProjectsUrl, 'utf8'),
    readFileSync(jaCertificatesUrl, 'utf8'),
].join('\n');

const emptyLeadPath = 'pages.home.about.heading.lead';
const scriptExceptions = new Map([
    ['pages.home.contact.form.submitting', '送信中...'],
    ['pages.home.contact.form.subject', 'ポートフォリオサイトからの新しいメッセージ'],
]);

const stripInactiveHtml = (html) => {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
};

const activeJapaneseHtml = stripInactiveHtml(rawJapaneseHtml);
const inlineScripts = [...rawJaIndex.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
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
        if (candidate.length === 0 && path !== emptyLeadPath) violations.push(`${path}: empty string`);
        if (path === emptyLeadPath && candidate !== '') violations.push(`${path}: expected approved empty string`);
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

test('Indonesian, English, and Japanese catalogs parse with canonical locales', () => {
    assert.equal(idCatalog.locale, 'id');
    assert.equal(enCatalog.locale, 'en');
    assert.equal(jaCatalog.locale, 'ja');
});

test('all key paths are identical across the three catalogs', () => {
    assert.deepEqual(collectKeyPaths(enCatalog), collectKeyPaths(idCatalog));
    assert.deepEqual(collectKeyPaths(jaCatalog), collectKeyPaths(idCatalog));
});

test('node types are identical at every path', () => {
    const expectedKinds = [...collectNodeKinds(idCatalog)];
    assert.deepEqual([...collectNodeKinds(enCatalog)], expectedKinds);
    assert.deepEqual([...collectNodeKinds(jaCatalog)], expectedKinds);
});

test('Japanese object key order follows the Indonesian catalog at every level', () => {
    assert.deepEqual(collectOrderMismatches(idCatalog, jaCatalog), []);
});

test('all three catalogs contain the same number of string leaves', () => {
    assert.equal(collectLeafEntries(idCatalog).length, 133);
    assert.equal(collectLeafEntries(enCatalog).length, 133);
    assert.equal(collectLeafEntries(jaCatalog).length, 133);
});

test('every Japanese leaf is a string and only the approved about lead is empty', () => {
    const leaves = collectLeafEntries(jaCatalog);
    const emptyLeaves = leaves.filter(([_path, value]) => value.length === 0);
    assert.deepEqual(emptyLeaves, [[emptyLeadPath, '']]);
    assert.deepEqual(contractViolations(idCatalog, jaCatalog), []);
    assert.equal(jaCatalog.pages.home.about.heading.lead, '');
    assert.equal(jaCatalog.pages.home.about.heading.highlight, 'プロフィール');
});

test('Japanese catalog contains no arrays or project and certificate records', () => {
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

    visitNodes(jaCatalog, '', (value, path) => {
        if (Array.isArray(value)) arrays.push(path);
        if (nodeKind(value) !== 'object') return;

        for (const key of Object.keys(value)) {
            if (forbiddenRecordKeys.has(key)) recordFields.push(path ? `${path}.${key}` : key);
        }
    });

    assert.deepEqual(arrays, []);
    assert.deepEqual(recordFields, []);
});

test('Japanese catalog contains no markup, scripts, styles, or CSS class fields', () => {
    const violations = [];
    const forbiddenKeys = new Set(['class', 'className', 'css', 'style', 'styles']);

    visitNodes(jaCatalog, '', (value, path) => {
        const key = path.split('.').at(-1);
        if (key && forbiddenKeys.has(key)) violations.push(path);
        if (typeof value === 'string' && (/<[^>]+>/i.test(value) || /\b(?:class|style)\s*=/i.test(value))) {
            violations.push(path);
        }
    });

    assert.deepEqual(violations, []);
});

test('every regular Japanese value comes from active Japanese HTML', () => {
    const missingValues = collectLeafEntries(jaCatalog)
        .filter(([path]) => path !== 'locale' && path !== emptyLeadPath && !scriptExceptions.has(path))
        .filter(([_path, value]) => !activeJapaneseHtml.includes(value));

    assert.deepEqual(missingValues, []);
    assert.equal(activeJapaneseHtml.includes(jaCatalog.pages.home.about.heading.highlight), true);
});

test('the two approved script exceptions occur literally inside jp/index.html inline scripts', () => {
    for (const [path, expectedValue] of scriptExceptions) {
        const actualValue = path.split('.').reduce((value, key) => value[key], jaCatalog);
        assert.equal(actualValue, expectedValue);
        assert.equal(rawJaIndex.includes(actualValue), true);
        assert.equal(inlineScripts.some((script) => script.includes(actualValue)), true);
        assert.equal(activeJapaneseHtml.includes(actualValue), false);
    }
});

test('only the empty about lead and two script values bypass active-source checks', () => {
    const bypassedPaths = collectLeafEntries(jaCatalog)
        .filter(([path]) => path === emptyLeadPath || scriptExceptions.has(path))
        .map(([path]) => path);

    assert.deepEqual(bypassedPaths, [emptyLeadPath, ...scriptExceptions.keys()]);
});

test('contract validation detects removed, added, array, and non-exempt empty mutations', () => {
    const removed = cloneCatalog(jaCatalog);
    delete removed.pages.home.about.heading.lead;

    const added = cloneCatalog(jaCatalog);
    added.shared.unexpected = 'Unexpected';

    const arrayValue = cloneCatalog(jaCatalog);
    arrayValue.pages.home.hero.name = [];

    const emptyValue = cloneCatalog(jaCatalog);
    emptyValue.pages.home.hero.name = '';

    for (const mutant of [removed, added, arrayValue, emptyValue]) {
        assert.notDeepEqual(contractViolations(idCatalog, mutant), []);
    }
});
