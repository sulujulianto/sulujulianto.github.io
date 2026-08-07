import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const locales = ['id', 'en', 'ja', 'zh'];
const datasets = {
    experience: (locale) => `assets/data/history/experience/experience-${locale}.json`,
    educationAndTraining: (locale) =>
        `assets/data/history/education-and-training/education-and-training-${locale}.json`,
};

const parsed = Object.fromEntries(
    locales.map((locale) => [
        locale,
        {
            experience: JSON.parse(read(datasets.experience(locale))),
            educationAndTraining: JSON.parse(read(datasets.educationAndTraining(locale))),
        },
    ]),
);

const recordFacts = (record) => ({ id: record.id, start: record.start, end: record.end ?? null });

test('history uses separate experience and education-and-training locale datasets', () => {
    for (const locale of locales) {
        assert.ok(Array.isArray(parsed[locale].experience), locale);
        assert.ok(Array.isArray(parsed[locale].educationAndTraining), locale);
        assert.equal(parsed[locale].experience.length, 2, locale);
        assert.equal(parsed[locale].educationAndTraining.length, 3, locale);
        assert.equal(existsSync(new URL(`../assets/data/history/history-${locale}.json`, import.meta.url)), false, locale);
    }
});

test('every history record has a stable identity, valid date precision, and three summary lines', () => {
    const datePattern = /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/;

    for (const locale of locales) {
        for (const records of Object.values(parsed[locale])) {
            const ids = new Set();
            for (const record of records) {
                assert.equal(typeof record.id, 'string');
                assert.ok(record.id.trim(), `${locale}: id`);
                assert.equal(ids.has(record.id), false, `${locale}: duplicate ${record.id}`);
                ids.add(record.id);

                assert.match(record.start, datePattern, `${locale}: ${record.id} start`);
                if (record.end != null) assert.match(record.end, datePattern, `${locale}: ${record.id} end`);
                for (const field of ['title', 'organization', 'location']) {
                    assert.equal(typeof record[field], 'string', `${locale}: ${record.id}.${field}`);
                    assert.ok(record[field].trim(), `${locale}: ${record.id}.${field}`);
                }
                if (record.highlights != null) {
                    assert.ok(Array.isArray(record.highlights), `${locale}: ${record.id}.highlights`);
                    assert.ok(record.highlights.every((item) => typeof item === 'string' && item.trim()));
                }
            }
        }
    }
});

test('all locales preserve timeline facts while keeping their text in separate files', () => {
    const expectedExperience = parsed.id.experience.map(recordFacts);
    const expectedEducation = parsed.id.educationAndTraining.map(recordFacts);

    for (const locale of locales.slice(1)) {
        assert.deepEqual(parsed[locale].experience.map(recordFacts), expectedExperience, locale);
        assert.deepEqual(parsed[locale].educationAndTraining.map(recordFacts), expectedEducation, locale);
    }

    assert.notEqual(parsed.id.experience[0].title, parsed.en.experience[0].title);
    assert.notEqual(parsed.en.experience[0].title, parsed.ja.experience[0].title);
    assert.notEqual(parsed.ja.experience[0].title, parsed.zh.experience[0].title);
});

test('confidential project copy does not expose client, website, or regional identities', () => {
    const confidentialCopy = locales
        .map((locale) => JSON.stringify(parsed[locale].experience.find((item) => item.id === 'project-based-web-developer')))
        .join('\n');

    assert.doesNotMatch(confidentialCopy, /jawa\s*barat|west\s*java|\.go\.id|https?:\/\//i);
});

test('history runtime groups by start year and renders accessible accordion controls', () => {
    const runtime = read('assets/js/app.tsx');
    const stylesheet = read('assets/css/main.css');

    assert.match(runtime, /history\/experience\/experience-\$\{locale\}\.json/);
    assert.match(runtime, /history\/education-and-training\/education-and-training-\$\{locale\}\.json/);
    assert.match(runtime, /item\.start\.slice\(0, 4\)/);
    assert.match(runtime, /aria-expanded=/);
    assert.match(runtime, /aria-controls=/);
    assert.match(runtime, /setOpenItemId\(isOpen \? null : item\.id\)/);
    assert.match(stylesheet, /\.history-year-items \{/);
    assert.match(stylesheet, /\.history-entry-chevron\.is-open/);
    assert.match(stylesheet, /html\.dark \.history-entry-summary/);
    assert.match(stylesheet, /@media \(max-width: 639px\)/);
});
