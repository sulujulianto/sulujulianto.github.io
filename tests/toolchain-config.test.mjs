import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
const workflow = read('.github/workflows/portfolio-ci.yml');
const nodeVersion = read('.nvmrc').trim();
const rootLockDependencies = packageLock.packages[''].devDependencies;

const internalTailwindDependencies = [
    '@alloc/quick-lru',
    'arg',
    'chokidar',
    'didyoumean',
    'dlv',
    'fast-glob',
    'is-glob',
    'jiti',
    'normalize-path',
    'postcss-js',
    'postcss-load-config',
    'postcss-nested',
    'postcss-selector-parser',
    'sucrase',
];

const parseVersion = (version) => version.split('.').map(Number);
const isAtLeast = (version, minimum) => {
    const actualParts = parseVersion(version);
    const minimumParts = parseVersion(minimum);
    for (let index = 0; index < minimumParts.length; index += 1) {
        if (actualParts[index] > minimumParts[index]) return true;
        if (actualParts[index] < minimumParts[index]) return false;
    }
    return true;
};

test('Node and GitHub Actions use the supported portfolio toolchain', () => {
    assert.equal(nodeVersion, '24');
    assert.equal(packageJson.engines.node, '^22.22.0 || ^24.0.0');
    assert.match(workflow, /uses: actions\/checkout@v6/);
    assert.match(workflow, /uses: actions\/setup-node@v6/);
    assert.match(workflow, /node-version-file: \.nvmrc/);
    assert.doesNotMatch(workflow, /node-version: 20|checkout@v4|setup-node@v4/);
});

test('Tailwind implementation packages are transitive rather than direct dependencies', () => {
    for (const dependency of internalTailwindDependencies) {
        assert.equal(packageJson.devDependencies[dependency], undefined, dependency);
        assert.equal(rootLockDependencies[dependency], undefined, dependency);
    }
});

test('locked nanoid includes the custom-generator denial-of-service fix', () => {
    const nanoidVersion = packageLock.packages['node_modules/nanoid'].version;
    assert.equal(isAtLeast(nanoidVersion, '3.3.18'), true, nanoidVersion);
});
