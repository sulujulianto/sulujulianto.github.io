import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(
    new URL('../assets/js/app.tsx', import.meta.url),
    'utf8',
);
const packageJson = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('grid renders card-shaped loading skeletons and both apps reserve their initial card count', () => {
    assert.match(appSource, /const LoadingCardSkeleton:[\s\S]*?min-h-\[420px\][\s\S]*?rounded-2xl[\s\S]*?animate-pulse[\s\S]*?motion-reduce:animate-none/);
    assert.match(appSource, /aria-hidden="true"/);
    assert.match(appSource, /<span className="sr-only" role="status">\{labels\.loading\}<\/span>/);
    assert.match(appSource, /loadingItemCount = 3/);
    assert.match(appSource, /loadingAspectRatio = '16 \/ 9'/);

    const initialCountProps = appSource.match(/loadingItemCount=\{mode === 'featured' \? highlightLimit : batchSize\}/g) || [];
    assert.equal(initialCountProps.length, 2, 'projects and certificates must reserve their initial card count');
    assert.match(appSource, /loadingAspectRatio="16 \/ 9"/);
    assert.match(appSource, /loadingAspectRatio="1414 \/ 1000"/);
    assert.equal(packageJson.scripts['test:performance'], 'node --test tests/performance-regressions.test.mjs');
});

test('certificate canvas keeps a stable 1414 by 1000 ratio for every orientation', () => {
    const certificatesSource = appSource.slice(appSource.indexOf('const CertificatesApp'));

    assert.match(certificatesSource, /aspectRatio: '1414 \/ 1000'/);
    assert.match(certificatesSource, /width=\{1414\}/);
    assert.match(certificatesSource, /height=\{1000\}/);
    assert.doesNotMatch(appSource, /const containerStyle = isPortrait/);
    assert.doesNotMatch(appSource, /height: '240px'/);
    assert.doesNotMatch(appSource, /aspectRatio: '5 \/ 3'/);
});

test('only the first image in the full certificate catalog receives eager high priority', () => {
    const certificatesSource = appSource.slice(appSource.indexOf('const CertificatesApp'));

    assert.match(certificatesSource, /priority\?: boolean/);
    assert.match(certificatesSource, /loading=\{priority \? 'eager' : 'lazy'\}/);
    assert.match(certificatesSource, /fetchPriority=\{priority \? 'high' : 'auto'\}/);
    assert.match(certificatesSource, /decoding="async"/);
    assert.match(certificatesSource, /<CertificateImage item=\{item\} priority=\{mode === 'full' && index === 0\} \/>/);

    const eagerAssignments = certificatesSource.match(/loading=\{priority \? 'eager' : 'lazy'\}/g) || [];
    const priorityAssignments = certificatesSource.match(/fetchPriority=\{priority \? 'high' : 'auto'\}/g) || [];
    assert.equal(eagerAssignments.length, 1);
    assert.equal(priorityAssignments.length, 1);
});
