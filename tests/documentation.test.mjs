import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const docsDirectory = path.join(repositoryRoot, 'docs');
const requiredGuides = [
    'README.md',
    'SETUP-BARU.md',
    'ALUR-PENGEMBANGAN.md',
    'MENULIS-PROYEK.md',
    'MENGELOLA-SERTIFIKAT.md',
    'MENGELOLA-RIWAYAT-DAN-KEAHLIAN.md',
    'MENGELOLA-BAHASA-DAN-METADATA.md',
    'MEMPERBARUI-TEKNOLOGI.md',
    'PEMERIKSAAN-BULANAN.md',
    'CHECKLIST-PUBLIKASI.md',
    'TROUBLESHOOTING.md',
];

const markdownFiles = [
    path.join(repositoryRoot, 'README.md'),
    ...readdirSync(docsDirectory)
        .filter((filename) => filename.endsWith('.md'))
        .map((filename) => path.join(docsDirectory, filename)),
];

test('panduan pemeliharaan portfolio dipisahkan berdasarkan pekerjaan', () => {
    for (const guide of requiredGuides) {
        assert.ok(existsSync(path.join(docsDirectory, guide)), `panduan tidak ditemukan: docs/${guide}`);
    }

    assert.equal(
        existsSync(path.join(docsDirectory, 'UPDATE-KONTEN-PORTFOLIO.md')),
        false,
        'panduan konten lama seharusnya sudah dipecah',
    );
});

test('tautan Markdown lokal pada README dan docs mengarah ke file yang tersedia', () => {
    const brokenLinks = [];

    for (const markdownFile of markdownFiles) {
        const markdown = readFileSync(markdownFile, 'utf8');
        const links = markdown.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/gu);

        for (const [, rawTarget] of links) {
            const targetWithoutAnchor = rawTarget.split('#', 1)[0];

            if (!targetWithoutAnchor || /^[a-z][a-z\d+.-]*:/iu.test(targetWithoutAnchor)) continue;

            const resolvedTarget = path.resolve(path.dirname(markdownFile), targetWithoutAnchor);
            if (!existsSync(resolvedTarget)) {
                brokenLinks.push(
                    `${path.relative(repositoryRoot, markdownFile)} -> ${rawTarget}`,
                );
            }
        }
    }

    assert.deepEqual(brokenLinks, []);
});

test('panduan Git meminta staging file yang sudah ditinjau', () => {
    const unsafeInstructions = [];

    for (const markdownFile of markdownFiles) {
        const markdown = readFileSync(markdownFile, 'utf8');
        if (/\bgit add (?:-A|--all|\.)\b/u.test(markdown)) {
            unsafeInstructions.push(path.relative(repositoryRoot, markdownFile));
        }
    }

    assert.deepEqual(unsafeInstructions, []);
});

test('README mengarahkan pemeliharaan ke pusat dokumentasi berbahasa Indonesia', () => {
    const repositoryReadme = readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8');
    const documentationReadme = readFileSync(path.join(docsDirectory, 'README.md'), 'utf8');

    assert.match(repositoryReadme, /Dokumentasi pemeliharaan/u);
    assert.match(repositoryReadme, /docs\/README\.md/u);
    assert.match(documentationReadme, /^# Pusat Dokumentasi Portfolio/mu);
    assert.doesNotMatch(repositoryReadme, /UPDATE-KONTEN-PORTFOLIO/u);
    assert.doesNotMatch(documentationReadme, /UPDATE-KONTEN-PORTFOLIO/u);
});

test('dokumentasi mempertahankan pemisahan konten portfolio antarbahasa', () => {
    const repositoryReadme = readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8');
    const languageGuide = readFileSync(
        path.join(docsDirectory, 'MENGELOLA-BAHASA-DAN-METADATA.md'),
        'utf8',
    );
    const projectGuide = readFileSync(path.join(docsDirectory, 'MENULIS-PROYEK.md'), 'utf8');
    const certificateGuide = readFileSync(
        path.join(docsDirectory, 'MENGELOLA-SERTIFIKAT.md'),
        'utf8',
    );

    assert.match(repositoryReadme, /tidak boleh diduplikasi sebagai terjemahan/u);
    assert.match(languageGuide, /hanya boleh berada pada satu katalog bahasa/u);
    assert.match(projectGuide, /Setiap proyek hanya ditempatkan pada satu katalog bahasa/u);
    assert.match(certificateGuide, /Setiap sertifikat hanya ditempatkan pada satu katalog bahasa/u);
});
