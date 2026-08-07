import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const packageLock = JSON.parse(
    readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
);
const outputCss = readFileSync(
    new URL('../assets/css/output.css', import.meta.url),
    'utf8',
);

test('Tailwind stays pinned to the compatible v3 toolchain', () => {
    assert.equal(packageJson.devDependencies.tailwindcss, '3.4.19');
    assert.equal(packageJson.devDependencies['@tailwindcss/cli'], undefined);
    assert.equal(packageLock.packages[''].devDependencies.tailwindcss, '3.4.19');
    assert.equal(packageLock.packages[''].devDependencies['@tailwindcss/cli'], undefined);
    assert.equal(packageLock.packages['node_modules/tailwindcss'].version, '3.4.19');
});

test('compiled CSS contains representative portfolio utilities', () => {
    const requiredSelectors = [
        '.bg-gray-100',
        '.dark\\:bg-gray-800',
        '.md\\:grid-cols-2',
        '.rounded-2xl',
        '.shadow-xl',
        '.lg\\:px-8',
        '.max-w-5xl',
    ];

    for (const selector of requiredSelectors) {
        assert.ok(outputCss.includes(selector), `Missing required selector: ${selector}`);
    }
});

test('compiled CSS is not an accidental Tailwind v4 build', () => {
    assert.ok(outputCss.includes('*, ::before, ::after'));
    assert.ok(!outputCss.includes('tailwindcss v4'));
    assert.ok(!outputCss.includes('@layer properties'));
});
