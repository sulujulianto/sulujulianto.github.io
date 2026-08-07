"use strict";
(function (globalScope) {
    'use strict';
    const windowScope = globalScope;
    const SUPPORTED_LOCALES = ['id', 'en', 'ja', 'zh'];
    const DEFAULT_LOCALE = 'id';
    const PAGE_PATHS = {
        home: '/',
        projects: '/projects.html',
        certificates: '/certificates.html',
        notFound: '/404.html',
    };
    const HTML_LOCALES = {
        id: 'id',
        en: 'en',
        ja: 'ja',
        zh: 'zh-Hans',
    };
    const OG_LOCALES = {
        id: 'id_ID',
        en: 'en_US',
        ja: 'ja_JP',
        zh: 'zh_CN',
    };
    const LANGUAGE_LABELS = {
        id: 'Pilih bahasa',
        en: 'Choose language',
        ja: '言語を選択',
        zh: '选择语言',
    };
    const LANGUAGE_NAMES = {
        id: 'Bahasa Indonesia',
        en: 'English',
        ja: '日本語',
        zh: '中文',
    };
    const COMPACT_LANGUAGE_NAMES = {
        id: 'ID',
        en: 'EN',
        ja: 'JP',
        zh: 'CH',
    };
    let currentLocale = DEFAULT_LOCALE;
    let currentCatalog = null;
    let catalogController = null;
    const isLocale = (value) => {
        return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
    };
    const pageKey = () => {
        var _a;
        const value = (_a = document.body) === null || _a === void 0 ? void 0 : _a.dataset.page;
        return value === 'projects' || value === 'certificates' || value === 'notFound'
            ? value
            : 'home';
    };
    const readPath = (catalog, path) => {
        const value = path.split('.').reduce((node, key) => {
            if (!node || typeof node !== 'object')
                return undefined;
            return node[key];
        }, catalog);
        return typeof value === 'string' ? value : '';
    };
    const loadCatalog = async (locale) => {
        catalogController === null || catalogController === void 0 ? void 0 : catalogController.abort();
        const controller = new AbortController();
        catalogController = controller;
        const response = await fetch(`/assets/data/locales/ui-${locale}.json`, {
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Cannot load locale catalog (${response.status})`);
        }
        const catalog = (await response.json());
        if (!catalog || catalog.locale !== locale) {
            throw new Error(`Invalid locale catalog: ${locale}`);
        }
        return catalog;
    };
    const localeUrl = (path, locale, hash = '') => {
        const url = new URL(path, window.location.origin);
        url.searchParams.set('lang', locale);
        url.hash = hash;
        return `${url.pathname}${url.search}${url.hash}`;
    };
    const updateRoutes = (locale) => {
        document.querySelectorAll('[data-route]').forEach((link) => {
            const route = link.dataset.route || 'home';
            const hashes = {
                about: 'tentang',
                history: 'riwayat',
                skills: 'skills',
                featuredProjects: 'proyek',
                featuredCertificates: 'sertifikat',
                contact: 'contact',
            };
            if (route === 'projects') {
                link.href = localeUrl(PAGE_PATHS.projects, locale);
            }
            else if (route === 'certificates') {
                link.href = localeUrl(PAGE_PATHS.certificates, locale);
            }
            else {
                const hash = hashes[route] || '';
                link.href = localeUrl(PAGE_PATHS.home, locale, hash);
            }
        });
        document.querySelectorAll('[data-full-url]').forEach((container) => {
            const target = container.id === 'certificates-react-root' ? PAGE_PATHS.certificates : PAGE_PATHS.projects;
            container.dataset.fullUrl = localeUrl(target, locale);
        });
        const cvPath = locale === 'en'
            ? 'assets/data/CV/EN/CV_SuluEdwardJulianto.pdf'
            : 'assets/data/CV/ID/CV_SuluEdwardJulianto.pdf';
        document.querySelectorAll('[data-cv-link]').forEach((link) => {
            link.href = cvPath;
        });
    };
    const ensureMeta = (selector, create) => {
        const existing = document.head.querySelector(selector);
        if (existing)
            return existing;
        const element = create();
        document.head.appendChild(element);
        return element;
    };
    const updateMetadata = (catalog, locale) => {
        var _a;
        const page = pageKey();
        const title = readPath(catalog, `pages.${page}.documentTitle`);
        const descriptionPath = page === 'home'
            ? 'pages.home.about.description'
            : page === 'notFound'
                ? 'pages.notFound.description'
                : `pages.${page}.introduction`;
        const description = readPath(catalog, descriptionPath);
        const canonicalUrl = new URL(PAGE_PATHS[page], window.location.origin).toString();
        document.title = title;
        const descriptionMeta = ensureMeta('meta[name="description"]', () => {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            return meta;
        });
        descriptionMeta.setAttribute('content', description);
        if (page === 'notFound') {
            (_a = document.head.querySelector('link[rel="canonical"]')) === null || _a === void 0 ? void 0 : _a.remove();
            document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
            return;
        }
        const canonical = ensureMeta('link[rel="canonical"]', () => {
            const link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            return link;
        });
        canonical.setAttribute('href', canonicalUrl);
        const ogTitle = ensureMeta('meta[property="og:title"]', () => {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'og:title');
            return meta;
        });
        ogTitle.setAttribute('content', title);
        const ogDescription = ensureMeta('meta[property="og:description"]', () => {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'og:description');
            return meta;
        });
        ogDescription.setAttribute('content', description);
        const ogLocale = ensureMeta('meta[property="og:locale"]', () => {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'og:locale');
            return meta;
        });
        ogLocale.setAttribute('content', OG_LOCALES[locale]);
        document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
        SUPPORTED_LOCALES.forEach((alternateLocale) => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = alternateLocale;
            link.href = new URL(localeUrl(PAGE_PATHS[page], alternateLocale), window.location.origin).toString();
            document.head.appendChild(link);
        });
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = new URL(localeUrl(PAGE_PATHS[page], DEFAULT_LOCALE), window.location.origin).toString();
        document.head.appendChild(defaultLink);
    };
    const applyCatalog = (catalog, locale) => {
        document.documentElement.lang = HTML_LOCALES[locale];
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            element.textContent = readPath(catalog, element.dataset.i18n || '');
        });
        document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
            const bindings = (element.dataset.i18nAttr || '').split(',');
            bindings.forEach((binding) => {
                const separator = binding.indexOf(':');
                if (separator < 1)
                    return;
                const attribute = binding.slice(0, separator).trim();
                const path = binding.slice(separator + 1).trim();
                element.setAttribute(attribute, readPath(catalog, path));
            });
        });
        document.querySelectorAll('[data-locale]').forEach((element) => {
            element.dataset.locale = locale;
        });
        document.querySelectorAll('[data-language-selector]').forEach((selector) => {
            var _a, _b;
            const picker = selector.closest('[data-language-picker]');
            const currentLabel = selector.querySelector('[data-language-current]');
            const compact = (_a = picker === null || picker === void 0 ? void 0 : picker.classList.contains('language-picker-mobile')) !== null && _a !== void 0 ? _a : false;
            if (currentLabel) {
                currentLabel.textContent = compact ? COMPACT_LANGUAGE_NAMES[locale] : LANGUAGE_NAMES[locale];
            }
            selector.setAttribute('aria-label', `${LANGUAGE_LABELS[locale]}: ${LANGUAGE_NAMES[locale]}`);
            (_b = picker === null || picker === void 0 ? void 0 : picker.querySelector('[data-language-menu]')) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-label', LANGUAGE_LABELS[locale]);
            picker === null || picker === void 0 ? void 0 : picker.querySelectorAll('[data-language-option]').forEach((option) => {
                option.setAttribute('aria-selected', String(option.dataset.languageOption === locale));
            });
        });
        updateRoutes(locale);
        updateMetadata(catalog, locale);
    };
    const setLocale = async (locale) => {
        if (!isLocale(locale))
            throw new TypeError(`Unsupported locale: ${String(locale)}`);
        let catalog;
        let appliedLocale = locale;
        try {
            catalog = await loadCatalog(locale);
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            if (locale === DEFAULT_LOCALE)
                throw error;
            console.error(`Gagal memuat bahasa ${locale}; menggunakan Bahasa Indonesia.`, error);
            appliedLocale = DEFAULT_LOCALE;
            catalog = await loadCatalog(DEFAULT_LOCALE);
        }
        currentLocale = appliedLocale;
        currentCatalog = catalog;
        applyCatalog(catalog, appliedLocale);
        document.dispatchEvent(new CustomEvent('portfolio:localechange', {
            detail: { locale: appliedLocale },
        }));
    };
    const bindLanguageSelectors = () => {
        const pickers = Array.from(document.querySelectorAll('[data-language-picker]'));
        const setOpen = (picker, open, focusOption = false) => {
            var _a;
            const selector = picker.querySelector('[data-language-selector]');
            const menu = picker.querySelector('[data-language-menu]');
            if (!selector || !menu)
                return;
            selector.setAttribute('aria-expanded', String(open));
            menu.hidden = !open;
            if (open && focusOption) {
                const selected = menu.querySelector('[data-language-option][aria-selected="true"]');
                const first = menu.querySelector('[data-language-option]');
                (_a = (selected !== null && selected !== void 0 ? selected : first)) === null || _a === void 0 ? void 0 : _a.focus();
            }
        };
        const closeOthers = (activePicker) => {
            pickers.forEach((picker) => {
                if (picker !== activePicker)
                    setOpen(picker, false);
            });
        };
        pickers.forEach((picker) => {
            const selector = picker.querySelector('[data-language-selector]');
            const menu = picker.querySelector('[data-language-menu]');
            const options = Array.from(picker.querySelectorAll('[data-language-option]'));
            if (!selector || !menu || options.length === 0)
                return;
            selector.addEventListener('click', () => {
                const willOpen = selector.getAttribute('aria-expanded') !== 'true';
                closeOthers(willOpen ? picker : undefined);
                setOpen(picker, willOpen);
            });
            selector.addEventListener('keydown', (event) => {
                var _a;
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
                    return;
                event.preventDefault();
                closeOthers(picker);
                setOpen(picker, true, true);
                if (event.key === 'ArrowUp')
                    (_a = options[options.length - 1]) === null || _a === void 0 ? void 0 : _a.focus();
            });
            options.forEach((option) => {
                option.addEventListener('click', () => {
                    var _a;
                    const locale = option.dataset.languageOption;
                    if (!isLocale(locale))
                        return;
                    setOpen(picker, false);
                    selector.focus();
                    closeOthers();
                    try {
                        (_a = windowScope.PortfolioLanguage) === null || _a === void 0 ? void 0 : _a.applyLocaleChoice(locale);
                    }
                    catch (error) {
                        console.error('Gagal memperbarui URL bahasa.', error);
                    }
                    void setLocale(locale);
                });
            });
            menu.addEventListener('keydown', (event) => {
                var _a;
                const activeIndex = options.indexOf(document.activeElement);
                let nextIndex = null;
                if (event.key === 'ArrowDown')
                    nextIndex = (activeIndex + 1) % options.length;
                if (event.key === 'ArrowUp')
                    nextIndex = (activeIndex - 1 + options.length) % options.length;
                if (event.key === 'Home')
                    nextIndex = 0;
                if (event.key === 'End')
                    nextIndex = options.length - 1;
                if (nextIndex !== null) {
                    event.preventDefault();
                    (_a = options[nextIndex]) === null || _a === void 0 ? void 0 : _a.focus();
                }
                else if (event.key === 'Escape') {
                    event.preventDefault();
                    setOpen(picker, false);
                    selector.focus();
                }
            });
            picker.addEventListener('focusout', (event) => {
                const nextTarget = event.relatedTarget;
                if (!nextTarget || !picker.contains(nextTarget))
                    setOpen(picker, false);
            });
        });
        document.addEventListener('pointerdown', (event) => {
            const target = event.target;
            if (!target || !pickers.some((picker) => picker.contains(target)))
                closeOthers();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape')
                return;
            pickers.forEach((picker) => {
                const selector = picker.querySelector('[data-language-selector]');
                if ((selector === null || selector === void 0 ? void 0 : selector.getAttribute('aria-expanded')) !== 'true')
                    return;
                setOpen(picker, false);
                selector.focus();
            });
        });
    };
    const bindContactForm = () => {
        const form = document.getElementById('contactForm');
        const submitButton = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        if (!form || !submitButton || !successMessage || !errorMessage)
            return;
        const submitLabel = submitButton.querySelector('[data-i18n]');
        const setSubmitText = (value) => {
            if (submitLabel)
                submitLabel.textContent = value;
            else
                submitButton.textContent = value;
        };
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            const catalog = currentCatalog;
            if (!catalog)
                return;
            const formPath = 'pages.home.contact.form';
            setSubmitText(readPath(catalog, `${formPath}.submitting`));
            submitButton.disabled = true;
            const formData = new FormData(form);
            formData.append('_subject', readPath(catalog, `${formPath}.subject`));
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                successMessage.classList.remove('hidden');
                form.reset();
                successMessage.scrollIntoView({ behavior: 'smooth' });
                window.setTimeout(() => successMessage.classList.add('hidden'), 5000);
            }
            catch (error) {
                console.error('Gagal mengirim formulir kontak.', error);
                errorMessage.classList.remove('hidden');
                errorMessage.scrollIntoView({ behavior: 'smooth' });
                window.setTimeout(() => errorMessage.classList.add('hidden'), 5000);
            }
            finally {
                setSubmitText(readPath(catalog, `${formPath}.submit`));
                submitButton.disabled = false;
            }
        });
    };
    const initialize = async () => {
        var _a, _b;
        const locale = (_b = (_a = windowScope.PortfolioLanguage) === null || _a === void 0 ? void 0 : _a.resolveCurrentLocale()) !== null && _b !== void 0 ? _b : DEFAULT_LOCALE;
        bindLanguageSelectors();
        bindContactForm();
        await setLocale(locale);
    };
    windowScope.PortfolioUi = Object.freeze({
        getLocale: () => currentLocale,
        getCatalog: () => currentCatalog,
        setLocale,
    });
    windowScope.PortfolioUiReady = initialize().catch((error) => {
        console.error('Gagal menginisialisasi antarmuka multibahasa.', error);
    });
})(window);
