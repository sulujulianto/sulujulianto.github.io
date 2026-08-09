import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { gzipSync } from 'node:zlib';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const skills = JSON.parse(read('assets/data/skills/skills.json'));
const appSource = read('assets/js/app.tsx');
const home = read('index.html');
const stylesheet = read('assets/css/main.css');
const sprite = read('assets/icons/skills.svg');
const locales = ['id', 'en', 'ja', 'zh'].map((locale) =>
    JSON.parse(read(`assets/data/locales/ui-${locale}.json`)),
);

const groupsById = Object.fromEntries(skills.groups.map((group) => [group.id, group]));
const allSkills = skills.groups.flatMap((group) => group.skills);

test('skills use six balanced groups with DevSecOps visible in the category title', () => {
    assert.equal(skills.groups.length, 6);
    assert.deepEqual(
        skills.groups.map((group) => group.id),
        ['frontend', 'backend', 'data-cloud', 'devsecops-engineering', 'systems-networking', 'mobile-current'],
    );
    for (const catalog of locales) {
        assert.equal(Object.keys(catalog.pages.home.skills.accordion.groups).length, 6);
        assert.match(catalog.pages.home.skills.accordion.groups.devSecOpsEngineering, /DevSecOps/i);
    }
});

test('localized skills heading keeps visible fallback text and a highlighted segment', () => {
    assert.match(home, /data-i18n="pages\.home\.skills\.heading\.lead">Keahlian<\/span>/);
    assert.match(home, /data-i18n="pages\.home\.skills\.heading\.highlight" class="section-highlight">Teknis<\/span>/);
    for (const catalog of locales) {
        const heading = catalog.pages.home.skills.heading;
        assert.equal(typeof heading.lead, 'string');
        assert.equal(typeof heading.highlight, 'string');
        assert.ok(`${heading.lead}${heading.highlight}`.trim());
    }
});

test('all original technologies remain and the supported additions are present', () => {
    const ids = new Set(allSkills.map((skill) => skill.id));
    const expected = [
        'html5', 'css3', 'react', 'vue', 'tailwind', 'nodejs', 'nextjs', 'laravel', 'django', 'gin',
        'mysql', 'postgresql', 'mongodb', 'firebase', 'javascript', 'python', 'php', 'go', 'windows',
        'linux', 'git', 'github', 'vsCode', 'aws', 'gcp', 'docker', 'jenkins', 'windowsServer',
        'cisco', 'linuxServer', 'tcpIp', 'typescript', 'vite', 'fastify', 'fastapi', 'redis',
        'supabase', 'java', 'mobileDevelopment', 'systemDesign', 'secureCoding', 'owasp',
        'apiSecurity', 'inputValidation', 'csrfProtection', 'preparedStatements', 'rateLimiting',
        'webhookVerification', 'idempotency', 'githubActions', 'automatedTesting', 'pytest',
    ];
    assert.deepEqual(expected.filter((id) => !ids.has(id)), []);
    assert.equal(ids.size, allSkills.length, 'skill ids must be unique');
});

test('learning and planned work are labelled honestly', () => {
    const current = Object.fromEntries(groupsById['mobile-current'].skills.map((skill) => [skill.id, skill.status]));
    assert.equal(current.mobileDevelopment, 'planned');
    for (const id of ['systemDesign', 'go', 'gin', 'java']) assert.equal(current[id], 'activeDevelopment');
    for (const catalog of locales) {
        assert.ok(catalog.pages.home.skills.accordion.statuses.activeDevelopment.trim());
        assert.ok(catalog.pages.home.skills.accordion.statuses.planned.trim());
    }
});

test('every skill uses the optimized local SVG sprite', () => {
    const symbolIds = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]));
    assert.deepEqual(allSkills.filter((skill) => !symbolIds.has(skill.icon)).map((skill) => skill.id), []);
    assert.ok(Buffer.byteLength(sprite) < 150_000, 'uncompressed skill sprite should remain below 150 KB');
    assert.ok(gzipSync(sprite).byteLength < 50_000, 'compressed skill sprite should remain below 50 KB');
    assert.match(home, /id="skills-react-root"[^>]+data-locale="id"[^>]+data-base-path="\.\/"/);
    assert.doesNotMatch(home, /cdn\.jsdelivr\.net\/gh\/devicons|vectorlogo|worldvectorlogo|gin-gonic\/logo/);
});

test('desktop uses symmetric category tabs while mobile keeps a single-open accordion', () => {
    assert.match(appSource, /matchMedia\('\(min-width: 768px\)'\)/);
    assert.match(appSource, /className="skills-category-grid" role="tablist"/);
    assert.match(appSource, /role="tab"/);
    assert.match(appSource, /aria-selected=\{isActive\}/);
    assert.match(appSource, /role="tabpanel"/);
    assert.match(appSource, /className="skills-mobile-accordion"/);
    assert.match(appSource, /return isOpen \? new Set\(\) : new Set\(\[groupId\]\)/);
    assert.match(appSource, /aria-expanded=\{isOpen\}/);
    assert.match(appSource, /hidden=\{!isOpen\}/);
    assert.match(appSource, /event\.key === 'ArrowRight'/);
    assert.match(appSource, /event\.key === 'Home'/);
    assert.match(stylesheet, /@media \(min-width: 768px\)[\s\S]*?\.skills-mobile-accordion \{\s*display: none/);
    assert.match(stylesheet, /@media \(min-width: 1024px\)[\s\S]*?\.skills-category-grid \{\s*grid-template-columns: repeat\(3/);
    assert.match(stylesheet, /@media \(min-width: 1280px\)[\s\S]*?\.skills-desktop-panel \.skill-list \{\s*grid-template-columns: repeat\(4/);
});

test('public project evidence supports the security practices shown', () => {
    const projects = [
        'jejak-petualang',
        'nusantara-trans',
        'japan-travel',
        'sistem-informasi-wilayah-indonesia',
        'pixel-heist-co-op',
    ].map((slug) => read(`assets/data/project-details/id/${slug}.json`)).join(' ') +
        read('assets/data/project-details/en/atlas-country-api.json');
    for (const evidence of [
        /prepared statements/i,
        /token CSRF/i,
        /memverifikasi signature provider/i,
        /mencegah pemrosesan berulang/i,
        /rate limiter/i,
        /GitHub Actions/i,
        /Pytest/i,
    ]) {
        assert.match(projects, evidence);
    }
});
