import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
const reactDirectory = dirname(require.resolve('react/package.json'));
const reactDomDirectory = dirname(require.resolve('react-dom/package.json'));
const reactSource = join(reactDirectory, 'umd/react.production.min.js');
const reactDomSource = join(reactDomDirectory, 'umd/react-dom.production.min.js');
const portableChromiumPath = process.env.CERTIFICATE_TEST_CHROMIUM_PATH;
const viewports = [
    { name: 'mobile', width: 390, height: 844, minimumRootHeight: 4500 },
    { name: 'desktop', width: 1365, height: 768, minimumRootHeight: 1100 },
];
const delayScenarios = [
    { name: 'app.js delayed', delayApp: true, delayCertificates: false },
    { name: 'certificate JSON delayed', delayApp: false, delayCertificates: true },
];
const responsiveViewports = [
    { name: 'mobile', width: 390, height: 844, desktopNavigation: false },
    { name: 'compact desktop', width: 1024, height: 768, desktopNavigation: false },
    { name: 'wide desktop', width: 1280, height: 800, desktopNavigation: true },
];
const responsivePages = ['/', '/projects.html', '/certificates.html'];
const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.webp': 'image/webp',
};
const transparentCertificate = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1414" height="1000"></svg>',
);

const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

const calculateCumulativeLayoutShift = (entries) => {
    let maximumSessionValue = 0;
    let sessionValue = 0;
    let sessionStart = 0;
    let previousEntryTime = 0;

    for (const entry of entries) {
        if (
            sessionValue === 0 ||
            entry.startTime - previousEntryTime > 1000 ||
            entry.startTime - sessionStart > 5000
        ) {
            sessionStart = entry.startTime;
            sessionValue = entry.value;
        } else {
            sessionValue += entry.value;
        }
        previousEntryTime = entry.startTime;
        maximumSessionValue = Math.max(maximumSessionValue, sessionValue);
    }

    return maximumSessionValue;
};

const createStaticServer = () => {
    const server = createServer(async (request, response) => {
        try {
            const pathname = new URL(request.url ?? '/', 'http://portfolio.test').pathname;
            const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
            const filePath = resolve(rootDirectory, relativePath);
            if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${sep}`)) {
                response.writeHead(403).end('Forbidden');
                return;
            }

            const fileStat = await stat(filePath);
            if (!fileStat.isFile()) throw new Error('Not a file');
            const body = await readFile(filePath);
            response.writeHead(200, {
                'cache-control': 'no-store',
                'content-length': body.length,
                'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
            });
            response.end(body);
        } catch {
            response.writeHead(404).end('Not found');
        }
    });

    return server;
};

const launchBrowser = () => chromium.launch({
    headless: true,
    ...(portableChromiumPath
        ? {
              executablePath: portableChromiumPath,
              args: [
                  '--disable-dev-shm-usage',
                  '--disable-setuid-sandbox',
                  '--disable-webgl',
                  '--no-sandbox',
                  '--no-zygote',
                  '--single-process',
              ],
          }
        : {}),
});

const makeExternalResourcesDeterministic = async (page) => {
    await page.route(/^https:\/\//, async (route) => {
        const url = route.request().url();
        if (url.includes('unpkg.com/react@18.3.1/umd/react.production.min.js')) {
            await route.fulfill({ path: reactSource, contentType: 'application/javascript' });
            return;
        }
        if (url.includes('unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js')) {
            await route.fulfill({ path: reactDomSource, contentType: 'application/javascript' });
            return;
        }
        await route.fulfill({ status: 204, body: '' });
    });

    await page.route(/\/assets\/img\/certificates\/.*\.webp$/u, async (route) => {
        await route.fulfill({ body: transparentCertificate, contentType: 'image/svg+xml' });
    });
};

const installLayoutShiftObserver = async (page) => {
    await page.addInitScript(() => {
        window.__certificateLayoutShifts = [];
        window.IntersectionObserver = class DeterministicIntersectionObserver {
            disconnect() {}
            observe() {}
            takeRecords() { return []; }
            unobserve() {}
        };
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                const root = document.getElementById('certificates-react-root');
                const footer = document.querySelector('footer');
                const sources = Array.from(entry.sources ?? []);
                window.__certificateLayoutShifts.push({
                    startTime: entry.startTime,
                    value: entry.value,
                    certificateRelated: sources.some(({ node }) => (
                        node instanceof Node &&
                        ((root?.contains(node) ?? false) || node === footer)
                    )),
                });
            }
        }).observe({ type: 'layout-shift', buffered: true });
    });
};

const runNoJavaScriptCheck = async (baseUrl, viewport) => {
    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({
            javaScriptEnabled: false,
            viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await page.goto(`${baseUrl}/certificates.html?lang=id`, { waitUntil: 'domcontentloaded' });

        const placeholderCount = await page.locator('[data-certificate-static-placeholder]').count();
        const rootBox = await page.locator('#certificates-react-root').boundingBox();
        const footerBox = await page.locator('footer').boundingBox();

        assert.equal(
            placeholderCount,
            1,
            `${viewport.name}: HTML awal harus memiliki tepat satu placeholder sertifikat`,
        );
        assert.ok(
            rootBox && rootBox.height >= viewport.minimumRootHeight,
            `${viewport.name}: placeholder HTML tidak memesan ruang yang cukup (${rootBox?.height ?? 0}px)`,
        );
        assert.ok(
            footerBox && footerBox.y > viewport.height,
            `${viewport.name}: footer terlihat karena root sertifikat masih runtuh`,
        );

        await page.goto(`${baseUrl}/?lang=id#sertifikat`, { waitUntil: 'domcontentloaded' });
        const featuredPlaceholderCount = await page
            .locator('#certificates-react-root [data-certificate-static-placeholder]')
            .count();
        const featuredLoadingCardCount = await page
            .locator('#certificates-react-root .certificate-loading-card')
            .count();
        const featuredRootBox = await page.locator('#certificates-react-root').boundingBox();
        const featuredMinimumHeight = viewport.name === 'mobile' ? 1700 : 550;

        assert.equal(
            featuredPlaceholderCount,
            1,
            `${viewport.name}: beranda harus memiliki placeholder sertifikat dari HTML awal`,
        );
        assert.equal(
            featuredLoadingCardCount,
            3,
            `${viewport.name}: beranda harus memesan tiga kartu sertifikat unggulan`,
        );
        assert.ok(
            featuredRootBox && featuredRootBox.height >= featuredMinimumHeight,
            `${viewport.name}: placeholder sertifikat beranda terlalu pendek`,
        );
    } finally {
        await browser.close();
    }
};

const runDelayedRenderCheck = async (baseUrl, viewport, scenario) => {
    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await installLayoutShiftObserver(page);
        await makeExternalResourcesDeterministic(page);

        if (scenario.delayApp) {
            await page.route(/\/assets\/js\/dist\/app\.js$/u, async (route) => {
                await wait(1200);
                await route.continue();
            });
        }
        if (scenario.delayCertificates) {
            await page.route(/\/assets\/data\/certificates\/certificates-id\.json$/u, async (route) => {
                await wait(1200);
                await route.continue();
            });
        }

        const navigation = page.goto(`${baseUrl}/certificates.html?lang=id`, {
            waitUntil: 'domcontentloaded',
        });
        await page.locator('#certificates-react-root').waitFor({ state: 'attached' });
        const staticPlaceholderPresent = await page
            .locator('[data-certificate-static-placeholder]')
            .count();
        const initialLoadingCardCount = await page
            .locator('#certificates-react-root .certificate-loading-card')
            .count();
        const initialRootBox = await page.locator('#certificates-react-root').boundingBox();
        const initialFooterBox = await page.locator('footer').boundingBox();

        await navigation;
        await page.locator('#certificates-react-root [role="list"] > a').first().waitFor({
            state: 'visible',
            timeout: 10000,
        });
        await page.waitForTimeout(1000);

        const finalRootBox = await page.locator('#certificates-react-root').boundingBox();
        const ariaBusy = await page.locator('#certificates-react-root').getAttribute('aria-busy');
        const entries = await page.evaluate(() => window.__certificateLayoutShifts ?? []);
        const totalCls = calculateCumulativeLayoutShift(entries);
        const certificateCls = calculateCumulativeLayoutShift(
            entries.filter((entry) => entry.certificateRelated),
        );
        const rootHeightDelta = Math.abs(
            (finalRootBox?.height ?? 0) - (initialRootBox?.height ?? 0),
        );

        if (scenario.delayApp) {
            assert.equal(
                staticPlaceholderPresent,
                1,
                `${viewport.name}, ${scenario.name}: placeholder harus berasal dari HTML awal`,
            );
        }
        assert.equal(
            initialLoadingCardCount,
            8,
            `${viewport.name}, ${scenario.name}: jumlah kartu loading awal tidak stabil`,
        );
        assert.ok(
            initialRootBox && initialRootBox.height >= viewport.minimumRootHeight,
            `${viewport.name}, ${scenario.name}: tinggi awal root hanya ${initialRootBox?.height ?? 0}px`,
        );
        assert.ok(
            initialFooterBox && initialFooterBox.y > viewport.height,
            `${viewport.name}, ${scenario.name}: footer muncul sebelum aplikasi siap`,
        );
        assert.ok(
            rootHeightDelta <= 32,
            `${viewport.name}, ${scenario.name}: tinggi root berubah ${rootHeightDelta.toFixed(2)}px`,
        );
        assert.equal(ariaBusy, 'false', `${viewport.name}, ${scenario.name}: status loading tidak selesai`);
        assert.ok(
            certificateCls <= 0.02,
            `${viewport.name}, ${scenario.name}: CLS sertifikat ${certificateCls.toFixed(4)} > 0.02`,
        );
        assert.ok(
            totalCls <= 0.05,
            `${viewport.name}, ${scenario.name}: total CLS ${totalCls.toFixed(4)} > 0.05`,
        );

        return {
            certificateCls,
            rootHeightDelta,
            totalCls,
            viewport: viewport.name,
            scenario: scenario.name,
        };
    } finally {
        await browser.close();
    }
};

const runResponsiveOverflowCheck = async (baseUrl, viewport) => {
    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await makeExternalResourcesDeterministic(page);

        for (const pagePath of responsivePages) {
            await page.goto(`${baseUrl}${pagePath}?lang=id`, { waitUntil: 'networkidle' });

            const layout = await page.evaluate(() => {
                const desktopNavigation = document.querySelector('header nav');
                const mobileNavigation = document.querySelector('.language-picker-mobile')?.parentElement;
                return {
                    clientWidth: document.documentElement.clientWidth,
                    desktopNavigationVisible: desktopNavigation
                        ? window.getComputedStyle(desktopNavigation).display !== 'none'
                        : false,
                    mobileNavigationVisible: mobileNavigation
                        ? window.getComputedStyle(mobileNavigation).display !== 'none'
                        : false,
                    scrollWidth: document.documentElement.scrollWidth,
                };
            });

            assert.ok(
                layout.scrollWidth <= layout.clientWidth,
                `${viewport.name}, ${pagePath}: halaman melebar ${layout.scrollWidth - layout.clientWidth}px`,
            );
            assert.equal(
                layout.desktopNavigationVisible,
                viewport.desktopNavigation,
                `${viewport.name}, ${pagePath}: mode navigasi desktop tidak sesuai`,
            );
            assert.equal(
                layout.mobileNavigationVisible,
                !viewport.desktopNavigation,
                `${viewport.name}, ${pagePath}: mode navigasi ringkas tidak sesuai`,
            );
        }
    } finally {
        await browser.close();
    }
};

const server = createStaticServer();
await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
});

try {
    const address = server.address();
    assert.ok(address && typeof address === 'object', 'Server HTTP lokal gagal dimulai');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const results = [];

    for (const viewport of viewports) {
        await runNoJavaScriptCheck(baseUrl, viewport);
        for (const scenario of delayScenarios) {
            results.push(await runDelayedRenderCheck(baseUrl, viewport, scenario));
        }
    }

    for (const viewport of responsiveViewports) {
        await runResponsiveOverflowCheck(baseUrl, viewport);
    }

    for (const result of results) {
        console.log(
            `PASS ${result.viewport}, ${result.scenario}: ` +
            `CLS total=${result.totalCls.toFixed(4)}, ` +
            `CLS sertifikat=${result.certificateCls.toFixed(4)}, ` +
            `delta tinggi=${result.rootHeightDelta.toFixed(2)}px`,
        );
    }
    console.log('PASS responsive overflow: mobile, compact desktop, and wide desktop');
} finally {
    await new Promise((resolveClose) => server.close(resolveClose));
}
