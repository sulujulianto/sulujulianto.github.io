import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const bundleUrl = new URL('../assets/js/dist/language-resolver.js', import.meta.url);
const bundle = readFileSync(bundleUrl, 'utf8');

const loadResolver = (overrides = {}) => {
    const sandbox = {
        URL,
        URLSearchParams,
        ...overrides,
    };
    vm.createContext(sandbox);
    vm.runInContext(bundle, sandbox, { filename: 'language-resolver.js' });
    return { api: sandbox.PortfolioLanguage, sandbox };
};

test('valid query wins over storage and browser languages', () => {
    const { api } = loadResolver();
    assert.equal(
        api.resolveLocale({ query: '?lang=ja', storedLocale: 'en', browserLanguages: ['zh-CN'] }),
        'ja',
    );
});

test('empty query value resolves to id and still wins over storage', () => {
    const { api } = loadResolver();
    assert.equal(api.resolveLocale({ query: '?lang=', storedLocale: 'en', browserLanguages: ['ja'] }), 'id');
});

test('unsupported query value resolves to id and still wins over storage', () => {
    const { api } = loadResolver();
    assert.equal(
        api.resolveLocale({ query: '?lang=fr-FR', storedLocale: 'zh', browserLanguages: ['en-US'] }),
        'id',
    );
});

test('canonical locales and regional tags normalize correctly', () => {
    const { api } = loadResolver();
    const cases = [
        [' id-ID ', 'id'],
        ['EN-us', 'en'],
        ['ja-JP', 'ja'],
        ['zh-Hans-CN', 'zh'],
        ['en_US', 'en'],
    ];

    for (const [input, expected] of cases) assert.equal(api.normalizeLanguageTag(input), expected);
});

test('legacy aliases and unsupported languages are rejected', () => {
    const { api } = loadResolver();
    for (const input of ['jp', 'cn', 'fr-FR', '', null, 42]) {
        assert.equal(api.normalizeLanguageTag(input), null);
    }
});

test('valid storage wins over browser languages when query key is absent', () => {
    const { api } = loadResolver();
    assert.equal(
        api.resolveLocale({ query: '?filter=backend', storedLocale: 'zh-Hant', browserLanguages: ['en'] }),
        'zh',
    );
});

test('invalid storage falls through to browser languages', () => {
    const { api } = loadResolver();
    assert.equal(api.resolveLocale({ storedLocale: 'broken', browserLanguages: ['ja-JP'] }), 'ja');
});

test('storage read exception falls through to browser languages', () => {
    const { api } = loadResolver();
    const environment = {
        location: { search: '', href: 'https://example.test/' },
        localStorage: {
            getItem() {
                throw new Error('blocked');
            },
        },
        navigator: { languages: ['fr-FR', 'zh-CN'] },
    };

    assert.equal(api.resolveCurrentLocale(environment), 'zh');
});

test('navigator languages are checked in declared order', () => {
    const { api } = loadResolver();
    assert.equal(api.resolveLocale({ browserLanguages: ['fr-FR', 'EN-gb', 'ja-JP'] }), 'en');
});

test('no supported source falls back to id', () => {
    const { api } = loadResolver();
    assert.equal(api.resolveLocale({ storedLocale: '', browserLanguages: ['fr-FR', 'de-DE'] }), 'id');
});

test('resolving current locale does not mutate storage, history, or URL', () => {
    const { api } = loadResolver();
    let storageWrites = 0;
    let historyWrites = 0;
    const location = { search: '', href: 'https://example.test/projects.html?filter=all#work' };
    const environment = {
        location,
        localStorage: {
            getItem: () => 'en',
            setItem: () => {
                storageWrites += 1;
            },
        },
        navigator: { languages: ['ja'] },
        history: {
            replaceState: () => {
                historyWrites += 1;
            },
        },
    };

    assert.equal(api.resolveCurrentLocale(environment), 'en');
    assert.equal(storageWrites, 0);
    assert.equal(historyWrites, 0);
    assert.equal(location.href, 'https://example.test/projects.html?filter=all#work');
});

test('URL builder preserves pathname, other parameters, and hash', () => {
    const { api } = loadResolver();
    assert.equal(
        api.buildLocaleUrl('https://example.test/projects.html?filter=backend&lang=id#featured', 'zh'),
        'https://example.test/projects.html?filter=backend&lang=zh#featured',
    );
    assert.equal(
        api.buildLocaleUrl('https://example.test/certificates.html?filter=cloud#latest', 'ja'),
        'https://example.test/certificates.html?filter=cloud&lang=ja#latest',
    );
});

test('manual choice stores the canonical locale under portfolio.lang', () => {
    const { api } = loadResolver();
    const writes = [];
    const environment = {
        location: { href: 'https://example.test/?source=nav#home' },
        localStorage: { setItem: (...args) => writes.push(args) },
        history: { replaceState() {} },
    };

    api.applyLocaleChoice('ja', environment);
    assert.deepEqual(writes, [['portfolio.lang', 'ja']]);
});

test('manual choice updates URL with history.replaceState without navigation', () => {
    const { api } = loadResolver();
    const calls = [];
    const location = { href: 'https://example.test/projects.html?filter=all#work' };
    const environment = {
        location,
        localStorage: { setItem() {} },
        history: { replaceState: (...args) => calls.push(args) },
    };

    const result = api.applyLocaleChoice('en', environment);
    assert.equal(result, 'https://example.test/projects.html?filter=all&lang=en#work');
    assert.deepEqual(calls, [[null, '', result]]);
    assert.equal(location.href, 'https://example.test/projects.html?filter=all#work');
});

test('storage write failure does not prevent URL replacement', () => {
    const { api } = loadResolver();
    const calls = [];
    const environment = {
        location: { href: 'https://example.test/certificates.html#latest' },
        localStorage: {
            setItem() {
                throw new Error('quota exceeded');
            },
        },
        history: { replaceState: (...args) => calls.push(args) },
    };

    const result = api.applyLocaleChoice('zh', environment);
    assert.equal(result, 'https://example.test/certificates.html?lang=zh#latest');
    assert.deepEqual(calls, [[null, '', result]]);
});

test('invalid manual choice is rejected before any mutation', () => {
    const { api } = loadResolver();
    let storageWrites = 0;
    let historyWrites = 0;
    const environment = {
        location: { href: 'https://example.test/' },
        localStorage: { setItem: () => (storageWrites += 1) },
        history: { replaceState: () => (historyWrites += 1) },
    };

    assert.throws(() => api.applyLocaleChoice('en-US', environment), { name: 'TypeError' });
    assert.equal(storageWrites, 0);
    assert.equal(historyWrites, 0);
});

test('loading the bundle only exposes the API and causes no environment mutation', () => {
    let storageReads = 0;
    let storageWrites = 0;
    let historyWrites = 0;
    const { api } = loadResolver({
        location: { search: '?lang=en', href: 'https://example.test/?lang=en' },
        localStorage: {
            getItem: () => {
                storageReads += 1;
                return 'ja';
            },
            setItem: () => {
                storageWrites += 1;
            },
        },
        navigator: { languages: ['zh'] },
        history: {
            replaceState: () => {
                historyWrites += 1;
            },
        },
    });

    assert.equal(typeof api.normalizeLanguageTag, 'function');
    assert.equal(storageReads, 0);
    assert.equal(storageWrites, 0);
    assert.equal(historyWrites, 0);
});
