import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const idCatalogUrl = new URL('../assets/data/locales/ui-id.json', import.meta.url);
const enCatalogUrl = new URL('../assets/data/locales/ui-en.json', import.meta.url);
const enIndexUrl = new URL('../en/index.html', import.meta.url);
const enProjectsUrl = new URL('../en/projects.html', import.meta.url);
const enCertificatesUrl = new URL('../en/certificates.html', import.meta.url);

const idCatalog = JSON.parse(readFileSync(idCatalogUrl, 'utf8'));
const enCatalog = JSON.parse(readFileSync(enCatalogUrl, 'utf8'));
const rawEnIndex = readFileSync(enIndexUrl, 'utf8');
const rawEnglishHtml = [
    rawEnIndex,
    readFileSync(enProjectsUrl, 'utf8'),
    readFileSync(enCertificatesUrl, 'utf8'),
].join('\n');

const scriptExceptions = new Map([
    ['pages.home.contact.form.submitting', 'Sending...'],
    ['pages.home.contact.form.subject', 'New Message from Portfolio Website'],
]);

const stripInactiveHtml = (html) => {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
};

const activeEnglishHtml = stripInactiveHtml(rawEnglishHtml);
const inlineScripts = [...rawEnIndex.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(
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
        if (candidate.trim().length === 0) violations.push(`${path}: empty string`);
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

test('Indonesian and English catalogs parse as JSON with canonical locales', () => {
    assert.equal(idCatalog.locale, 'id');
    assert.equal(enCatalog.locale, 'en');
});

test('all key paths are identical', () => {
    assert.deepEqual(collectKeyPaths(enCatalog), collectKeyPaths(idCatalog));
});

test('node types are identical at every path', () => {
    assert.deepEqual([...collectNodeKinds(enCatalog)], [...collectNodeKinds(idCatalog)]);
});

test('object key order follows the Indonesian catalog at every level', () => {
    assert.deepEqual(collectOrderMismatches(idCatalog, enCatalog), []);
});

test('every English leaf is a non-empty string', () => {
    const invalidLeaves = collectLeafEntries(enCatalog).filter(([_path, value]) => value.trim().length === 0);
    assert.deepEqual(invalidLeaves, []);
});

test('English catalog contains no arrays or project and certificate records', () => {
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

    visitNodes(enCatalog, '', (value, path) => {
        if (Array.isArray(value)) arrays.push(path);
        if (nodeKind(value) !== 'object') return;

        for (const key of Object.keys(value)) {
            if (forbiddenRecordKeys.has(key)) recordFields.push(path ? `${path}.${key}` : key);
        }
    });

    assert.deepEqual(arrays, []);
    assert.deepEqual(recordFields, []);
});

test('English catalog contains no markup, scripts, styles, or CSS class fields', () => {
    const violations = [];
    const forbiddenKeys = new Set(['class', 'className', 'css', 'style', 'styles']);

    visitNodes(enCatalog, '', (value, path) => {
        const key = path.split('.').at(-1);
        if (key && forbiddenKeys.has(key)) violations.push(path);
        if (typeof value === 'string' && (/<[^>]+>/i.test(value) || /\b(?:class|style)\s*=/i.test(value))) {
            violations.push(path);
        }
    });

    assert.deepEqual(violations, []);
});

test('every non-exception English value comes from active English HTML', () => {
    const missingValues = collectLeafEntries(enCatalog)
        .filter(([path]) => path !== 'locale' && !scriptExceptions.has(path))
        .filter(([_path, value]) => !activeEnglishHtml.includes(value));

    assert.deepEqual(missingValues, []);
});

test('the two approved exceptions occur literally inside en/index.html inline scripts', () => {
    for (const [path, expectedValue] of scriptExceptions) {
        const actualValue = path.split('.').reduce((value, key) => value[key], enCatalog);
        assert.equal(actualValue, expectedValue);
        assert.equal(rawEnIndex.includes(actualValue), true);
        assert.equal(inlineScripts.some((script) => script.includes(actualValue)), true);
        assert.equal(activeEnglishHtml.includes(actualValue), false);
    }
});

test('contract validation detects removed, added, array, and empty mutations', () => {
    const removed = cloneCatalog(enCatalog);
    delete removed.shared.brand;

    const added = cloneCatalog(enCatalog);
    added.shared.unexpected = 'Unexpected';

    const arrayValue = cloneCatalog(enCatalog);
    arrayValue.pages.home.hero.name = [];

    const emptyValue = cloneCatalog(enCatalog);
    emptyValue.pages.home.hero.name = '';

    for (const mutant of [removed, added, arrayValue, emptyValue]) {
        assert.notDeepEqual(contractViolations(idCatalog, mutant), []);
    }
});
