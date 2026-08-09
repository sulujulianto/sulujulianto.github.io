import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { validateProjectCategoryCatalogs } from './project-category-contract.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIR, '..');
const BASELINE_PATH = path.join(REPOSITORY_ROOT, 'tests/fixtures/portfolio-data-baseline.json');
const LOCALES = ['id', 'en', 'ja', 'zh'];

const DATASETS = {
    projects: {
        dateField: 'dateAdded',
        file(locale) {
            return `assets/data/projects/projects-${locale}.json`;
        },
    },
    certificates: {
        dateField: 'tanggalTerbit',
        file(locale) {
            return `assets/data/certificates/certificates-${locale}.json`;
        },
    },
};

const CATEGORY_DATASETS = {
    projects: {
        file(locale) {
            return `assets/data/categories/projects/project-categories-${locale}.json`;
        },
    },
    certificates: {
        file(locale) {
            return `assets/data/categories/certificates/certificate-categories-${locale}.json`;
        },
    },
};

const LEGACY_PAGE_DIRECTORIES = {
    id: 'id',
    en: 'en',
    ja: 'jp',
    zh: 'cn',
};

const EXPECTED_KNOWN_MISSING_ASSETS = [
    'assets/img/projects/id/antriankku.webp',
    'assets/img/projects/id/kospintar.webp',
    'assets/img/projects/id/lokerkita.webp',
];

const EXPECTED_REQUIRED_ASSETS = [
    'assets/data/CV/EN/CV_SuluEdwardJulianto.pdf',
    'assets/data/CV/ID/CV_SuluEdwardJulianto.pdf',
];

const failures = [];
const warnings = [];
const assetReferences = new Map();

const toRepositoryPath = (absolutePath) => path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/');

const sha256 = (raw) => createHash('sha256').update(raw).digest('hex');

const readJson = (relativePath, label) => {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    let raw;

    try {
        raw = readFileSync(absolutePath);
    } catch (error) {
        failures.push(`${label}: cannot read ${relativePath}: ${error.message}`);
        return null;
    }

    try {
        return { raw, value: JSON.parse(raw.toString('utf8')) };
    } catch (error) {
        failures.push(`${label}: invalid JSON in ${relativePath}: ${error.message}`);
        return null;
    }
};

const parseDateLikeRuntime = (value) => {
    if (!value) return 0;

    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) return timestamp;

    const parts = value.split(/[-/]/);
    if (parts.length === 3) {
        const [a, b, c] = parts;
        const fallback = Date.parse(`${c}-${b}-${a}`);
        if (!Number.isNaN(fallback)) return fallback;
    }

    return 0;
};

const importantRecord = (type, record) => {
    if (type === 'projects') {
        return {
            title: record.title ?? null,
            category: record.category ?? null,
            dateAdded: record.dateAdded ?? null,
            isFeatured: record.isFeatured ?? null,
            imageUrl: record.imageUrl ?? null,
            githubUrl: record.githubUrl ?? null,
            liveUrl: record.liveUrl ?? null,
            techStack: record.techStack ?? null,
        };
    }

    return {
        title: record.title ?? null,
        category: record.category ?? null,
        tanggalTerbit: record.tanggalTerbit ?? null,
        tanggalKadaluarsa: record.tanggalKadaluarsa ?? null,
        isFeatured: record.isFeatured ?? null,
        imageUrl: record.imageUrl ?? null,
        fullImageUrl: record.fullImageUrl ?? null,
        link: record.link ?? null,
        techStack: record.techStack ?? null,
    };
};

const isNonEmptyTitle = (record) => typeof record.title === 'string' && record.title.trim().length > 0;

const buildDatasetSnapshot = (type, locale, raw, records) => {
    const { dateField, file } = DATASETS[type];
    const sorted = [...records].sort(
        (left, right) => parseDateLikeRuntime(right[dateField]) - parseDateLikeRuntime(left[dateField]),
    );
    const onlyFeatured = sorted.filter((record) => record.isFeatured);
    const effectiveFeatured = onlyFeatured.length > 0 ? onlyFeatured : sorted;

    return {
        file: file(locale),
        sha256: sha256(raw),
        counts: {
            total: records.length,
            displayable: records.filter(isNonEmptyTitle).length,
            placeholder: records.filter((record) => !isNonEmptyTitle(record)).length,
            featured: records.filter((record) => record.isFeatured === true).length,
        },
        effectiveFeatured: effectiveFeatured.map((record) => ({
            title: record.title ?? null,
            date: record[dateField] ?? null,
        })),
        records: records.map((record) => importantRecord(type, record)),
    };
};

const buildCategorySnapshot = (type, locale, raw, records) => ({
    file: CATEGORY_DATASETS[type].file(locale),
    sha256: sha256(raw),
    count: records.length,
    records: records.map((record) => ({
        id: record.id ?? null,
        label: record.label ?? null,
    })),
});

const updateBaselineFromCurrentData = () => {
    const nextBaseline = {
        schemaVersion: 1,
        knownMissingAssets: [...EXPECTED_KNOWN_MISSING_ASSETS],
        requiredAssets: [...EXPECTED_REQUIRED_ASSETS],
        datasets: {
            projects: {},
            certificates: {},
        },
        categories: {
            projects: {},
            certificates: {},
        },
    };
    const projectsByLocale = {};
    const projectCategoriesByLocale = {};

    for (const type of Object.keys(DATASETS)) {
        for (const locale of LOCALES) {
            const relativePath = DATASETS[type].file(locale);
            const parsed = readJson(relativePath, `${type} ${locale.toUpperCase()}`);
            if (!parsed) continue;
            if (!Array.isArray(parsed.value)) {
                failures.push(`${type} ${locale.toUpperCase()}: top-level JSON value must be an array`);
                continue;
            }

            nextBaseline.datasets[type][locale] = buildDatasetSnapshot(
                type,
                locale,
                parsed.raw,
                parsed.value,
            );
            collectAssetReferences(type, locale, relativePath, parsed.value);
            if (type === 'projects') projectsByLocale[locale] = parsed.value;
        }
    }

    for (const type of Object.keys(CATEGORY_DATASETS)) {
        for (const locale of LOCALES) {
            const relativePath = CATEGORY_DATASETS[type].file(locale);
            const parsed = readJson(relativePath, `${type} categories ${locale.toUpperCase()}`);
            if (!parsed) continue;
            if (!Array.isArray(parsed.value)) {
                failures.push(`${type} categories ${locale.toUpperCase()}: top-level JSON value must be an array`);
                continue;
            }

            nextBaseline.categories[type][locale] = buildCategorySnapshot(
                type,
                locale,
                parsed.raw,
                parsed.value,
            );
            if (type === 'projects') projectCategoriesByLocale[locale] = parsed.value;
        }
    }

    if (LOCALES.every((locale) => projectsByLocale[locale] && projectCategoriesByLocale[locale])) {
        validateProjectCategoryCatalogs({
            locales: LOCALES,
            catalogs: projectCategoriesByLocale,
            projectsByLocale,
        }).forEach((error) => failures.push(`project categories: ${error}`));
    }

    for (const requiredPath of EXPECTED_REQUIRED_ASSETS) {
        if (!existsSync(path.join(REPOSITORY_ROOT, requiredPath))) {
            failures.push(`required asset is missing: ${requiredPath}`);
        }
    }

    for (const [assetPath, sources] of assetReferences) {
        if (existsSync(path.join(REPOSITORY_ROOT, assetPath))) continue;
        if (EXPECTED_KNOWN_MISSING_ASSETS.includes(assetPath)) continue;
        failures.push(`unexpected missing local asset: ${assetPath} (referenced by ${sources.join(', ')})`);
    }

    for (const knownPath of EXPECTED_KNOWN_MISSING_ASSETS) {
        if (!assetReferences.has(knownPath)) {
            failures.push(`known-missing allowlist entry is no longer referenced; review policy: ${knownPath}`);
        } else if (existsSync(path.join(REPOSITORY_ROOT, knownPath))) {
            failures.push(`known-missing asset now exists; remove it from the allowlist: ${knownPath}`);
        }
    }

    if (failures.length > 0) return false;

    writeFileSync(BASELINE_PATH, `${JSON.stringify(nextBaseline, null, 2)}\n`, 'utf8');
    return true;
};

const addAssetReference = (locale, datasetFile, recordIndex, field, value) => {
    if (typeof value !== 'string' || value.trim() === '') return;

    const reference = value.trim();
    if (/^[a-z][a-z\d+.-]*:/i.test(reference) || reference.startsWith('//') || reference.startsWith('#')) {
        return;
    }

    const pathWithoutQuery = reference.split(/[?#]/, 1)[0];
    const pageDirectory = path.join(REPOSITORY_ROOT, LEGACY_PAGE_DIRECTORIES[locale]);
    const absolutePath = reference.startsWith('/')
        ? path.resolve(REPOSITORY_ROOT, `.${pathWithoutQuery}`)
        : path.resolve(pageDirectory, pathWithoutQuery);
    const repositoryPath = toRepositoryPath(absolutePath);

    if (repositoryPath.startsWith('../') || path.isAbsolute(repositoryPath)) {
        failures.push(
            `${datasetFile}[${recordIndex}].${field}: local asset escapes repository: ${reference}`,
        );
        return;
    }

    const sources = assetReferences.get(repositoryPath) ?? [];
    sources.push(`${datasetFile}[${recordIndex}].${field}`);
    assetReferences.set(repositoryPath, sources);
};

const collectAssetReferences = (type, locale, datasetFile, records) => {
    const fields = type === 'projects' ? ['imageUrl'] : ['imageUrl', 'fullImageUrl', 'link'];

    records.forEach((record, index) => {
        fields.forEach((field) => addAssetReference(locale, datasetFile, index, field, record[field]));
    });
};

const compareValue = (label, field, actual, expected) => {
    if (isDeepStrictEqual(actual, expected)) return true;

    failures.push(
        `${label}: ${field} changed\n` +
            `      expected ${JSON.stringify(expected)}\n` +
            `      actual   ${JSON.stringify(actual)}`,
    );
    return false;
};

const auditDataset = (baseline, type, locale) => {
    const label = `${type} ${locale.toUpperCase()}`;
    const relativePath = DATASETS[type].file(locale);
    const parsed = readJson(relativePath, label);
    const expected = baseline.datasets?.[type]?.[locale];
    let passed = true;

    if (!expected) {
        failures.push(`${label}: dataset is missing from baseline`);
        return { passed: false, counts: null, effectiveFeatured: [], records: [] };
    }

    if (!parsed) {
        return {
            passed: false,
            counts: expected.counts ?? null,
            effectiveFeatured: expected.effectiveFeatured ?? [],
            records: [],
        };
    }

    if (!Array.isArray(parsed.value)) {
        failures.push(`${label}: top-level JSON value must be an array`);
        return {
            passed: false,
            counts: expected.counts ?? null,
            effectiveFeatured: expected.effectiveFeatured ?? [],
            records: [],
        };
    }

    collectAssetReferences(type, locale, relativePath, parsed.value);
    const actual = buildDatasetSnapshot(type, locale, parsed.raw, parsed.value);

    for (const field of ['file', 'sha256', 'counts', 'effectiveFeatured', 'records']) {
        passed = compareValue(label, field, actual[field], expected[field]) && passed;
    }

    return { passed, counts: actual.counts, effectiveFeatured: actual.effectiveFeatured, records: parsed.value };
};

const auditCategories = (baseline, type, locale) => {
    const label = `${type} categories ${locale.toUpperCase()}`;
    const relativePath = CATEGORY_DATASETS[type].file(locale);
    const parsed = readJson(relativePath, label);
    const expected = baseline.categories?.[type]?.[locale];
    let passed = true;

    if (!expected) {
        failures.push(`${label}: dataset is missing from baseline`);
        return { passed: false, count: null, records: [] };
    }

    if (!parsed) return { passed: false, count: expected?.count ?? null, records: [] };

    if (!Array.isArray(parsed.value)) {
        failures.push(`${label}: top-level JSON value must be an array`);
        return { passed: false, count: expected?.count ?? null, records: [] };
    }

    const actual = buildCategorySnapshot(type, locale, parsed.raw, parsed.value);
    for (const field of ['file', 'sha256', 'count', 'records']) {
        passed = compareValue(label, field, actual[field], expected[field]) && passed;
    }

    return { passed, count: actual.count, records: parsed.value };
};

const auditAssetPolicy = (baseline) => {
    let passed = true;
    const baselineKnownMissing = [...(baseline.knownMissingAssets ?? [])].sort();
    const baselineRequired = [...(baseline.requiredAssets ?? [])].sort();

    passed =
        compareValue('asset policy', 'knownMissingAssets', baselineKnownMissing, EXPECTED_KNOWN_MISSING_ASSETS) &&
        passed;
    passed =
        compareValue('asset policy', 'requiredAssets', baselineRequired, EXPECTED_REQUIRED_ASSETS) && passed;

    for (const requiredPath of EXPECTED_REQUIRED_ASSETS) {
        if (!existsSync(path.join(REPOSITORY_ROOT, requiredPath))) {
            failures.push(`required asset is missing: ${requiredPath}`);
            passed = false;
        }
    }

    for (const [assetPath, sources] of [...assetReferences.entries()].sort(([left], [right]) => left.localeCompare(right))) {
        if (existsSync(path.join(REPOSITORY_ROOT, assetPath))) continue;
        if (EXPECTED_KNOWN_MISSING_ASSETS.includes(assetPath)) continue;

        failures.push(`unexpected missing local asset: ${assetPath} (referenced by ${sources.join(', ')})`);
        passed = false;
    }

    for (const knownPath of EXPECTED_KNOWN_MISSING_ASSETS) {
        if (!assetReferences.has(knownPath)) {
            failures.push(`known-missing allowlist entry is no longer referenced; review baseline: ${knownPath}`);
            passed = false;
            continue;
        }

        if (existsSync(path.join(REPOSITORY_ROOT, knownPath))) {
            failures.push(`known-missing asset now exists; remove it from the allowlist: ${knownPath}`);
            passed = false;
            continue;
        }

        warnings.push(`known missing local asset: ${knownPath}`);
    }

    return passed;
};

const loadBaseline = () => {
    const parsed = readJson(toRepositoryPath(BASELINE_PATH), 'baseline');
    if (!parsed) return null;
    if (!parsed.value || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) {
        failures.push('baseline: top-level JSON value must be an object');
        return null;
    }
    if (parsed.value.schemaVersion !== 1) {
        failures.push(`baseline: unsupported schemaVersion ${JSON.stringify(parsed.value.schemaVersion)}`);
        return null;
    }
    return parsed.value;
};

if (process.argv.includes('--update-baseline')) {
    console.log('Portfolio data baseline update');
    console.log('==============================');

    if (!updateBaselineFromCurrentData()) {
        console.log('\nBaseline was not changed because validation failed:');
        for (const failure of failures) console.log(`  FAIL ${failure}`);
        process.exit(1);
    }

    console.log(`Updated ${toRepositoryPath(BASELINE_PATH)} from the current intentional data.`);
    failures.length = 0;
    warnings.length = 0;
    assetReferences.clear();
    console.log('Running the regular audit against the new baseline...\n');
}

console.log('Portfolio data audit');
console.log('====================');

const baseline = loadBaseline();
const results = {};

if (baseline) {
    for (const locale of LOCALES) {
        results[locale] = {
            projects: auditDataset(baseline, 'projects', locale),
            certificates: auditDataset(baseline, 'certificates', locale),
            projectCategories: auditCategories(baseline, 'projects', locale),
            certificateCategories: auditCategories(baseline, 'certificates', locale),
        };
    }

    const projectCategoryErrors = validateProjectCategoryCatalogs({
        locales: LOCALES,
        catalogs: Object.fromEntries(
            LOCALES.map((locale) => [locale, results[locale].projectCategories.records]),
        ),
        projectsByLocale: Object.fromEntries(
            LOCALES.map((locale) => [locale, results[locale].projects.records]),
        ),
    });
    if (projectCategoryErrors.length > 0) {
        projectCategoryErrors.forEach((error) => failures.push(`project categories: ${error}`));
        LOCALES.forEach((locale) => {
            results[locale].projectCategories.passed = false;
        });
    }

    for (const locale of LOCALES) {
        const localeResults = results[locale];
        console.log(`\nLocale ${locale.toUpperCase()}`);

        for (const [name, result] of [
            ['Projects', localeResults.projects],
            ['Certificates', localeResults.certificates],
        ]) {
            const counts = result.counts;
            const detail = counts
                ? `total=${counts.total}, displayable=${counts.displayable}, placeholder=${counts.placeholder}, featured=${counts.featured}`
                : 'counts unavailable';
            console.log(`  ${result.passed ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
            const featuredOrder = result.effectiveFeatured.length
                ? result.effectiveFeatured
                      .map((item) => `${item.title || '<empty title>'} (${item.date || '<empty date>'})`)
                      .join(' > ')
                : 'none';
            console.log(`       Effective featured: ${featuredOrder}`);
        }

        const categoryPass =
            localeResults.projectCategories.passed && localeResults.certificateCategories.passed;
        console.log(
            `  ${categoryPass ? 'PASS' : 'FAIL'} Categories: projects=${localeResults.projectCategories.count ?? 'unavailable'}, certificates=${localeResults.certificateCategories.count ?? 'unavailable'}`,
        );
    }

    const assetsPassed = auditAssetPolicy(baseline);
    console.log('\nAssets');
    console.log(`  ${assetsPassed ? 'PASS' : 'FAIL'} Required CV files: ${EXPECTED_REQUIRED_ASSETS.length}`);
    for (const warning of warnings) console.log(`  WARNING ${warning}`);
}

if (failures.length > 0) {
    console.log('\nFailures');
    for (const failure of failures) console.log(`  FAIL ${failure}`);
    console.log(`\nFAIL Audit completed with ${failures.length} failure(s) and ${warnings.length} warning(s).`);
    process.exitCode = 1;
} else {
    console.log(`\nPASS Audit completed with 0 failures and ${warnings.length} warning(s).`);
}
