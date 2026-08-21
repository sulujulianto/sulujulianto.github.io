import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const certificates = JSON.parse(
    readFileSync(new URL('../assets/data/certificates/certificates-id.json', import.meta.url), 'utf8'),
);
const englishCertificates = JSON.parse(
    readFileSync(new URL('../assets/data/certificates/certificates-en.json', import.meta.url), 'utf8'),
);

test('deskripsi sertifikat Indonesia ringkas, lengkap, dan mudah dibaca', () => {
    const displayedCertificates = certificates.filter(({ title }) => title?.trim());

    assert.ok(displayedCertificates.length > 0);

    for (const certificate of displayedCertificates) {
        const description = certificate.description?.trim() ?? '';

        assert.ok(description.length >= 80, `${certificate.title}: deskripsi terlalu pendek`);
        assert.ok(description.length <= 240, `${certificate.title}: deskripsi terlalu panjang`);
        assert.match(description, /[.!?]$/u, `${certificate.title}: deskripsi harus diakhiri tanda baca`);
        assert.doesNotMatch(description, /^Mencakup\b/iu, `${certificate.title}: pembuka terlalu kaku`);
        assert.doesNotMatch(
            description,
            /(?:ahli|menguasai sepenuhnya|terbaik|terdepan|kelas dunia|siap produksi)/iu,
            `${certificate.title}: klaim tidak proporsional`,
        );
    }
});

test('nama resmi sertifikasi BNSP tidak diubah oleh copywriting', () => {
    const titles = new Set(certificates.map(({ title }) => title));

    assert.ok(titles.has('Junior Web Developer (BNSP)'));
    assert.ok(titles.has('Web Development With Node.js and React (BNSP)'));
});

test('English certificate descriptions are natural, factual, and concise', () => {
    const displayedCertificates = englishCertificates.filter(({ title }) => title?.trim());

    assert.equal(displayedCertificates.length, 38);

    for (const certificate of displayedCertificates) {
        const description = certificate.description?.trim() ?? '';

        assert.ok(description.length >= 80, `${certificate.title}: description is too short`);
        assert.ok(description.length <= 240, `${certificate.title}: description is too long`);
        assert.match(description, /[.!?]$/u, `${certificate.title}: description must end with punctuation`);
        assert.doesNotMatch(description, /^Covered\b/iu, `${certificate.title}: repetitive opening detected`);
        assert.doesNotMatch(
            description,
            /(?:expert|mastery|world-class|industry-leading|production-ready|professional proficiency)/iu,
            `${certificate.title}: claim is not supported by a course certificate`,
        );
    }
});

test('English Sololearn credentials remain a complete but selectively featured archive', () => {
    const sololearnCertificates = englishCertificates.filter(({ link }) =>
        /^https:\/\/(?:www\.)?sololearn\.com\/certificates\//u.test(link ?? ''),
    );
    const featuredCertificates = englishCertificates.filter(({ isFeatured }) => isFeatured);

    assert.equal(sololearnCertificates.length, 38);
    assert.equal(featuredCertificates.length, 3);
    assert.deepEqual(
        featuredCertificates.map(({ title }) => title),
        ['Angular + NestJS', 'React + Redux', 'Data Science'],
    );
});
