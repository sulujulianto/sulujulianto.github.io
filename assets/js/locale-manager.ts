(function (globalScope) {
    'use strict';

    type Locale = 'id' | 'en' | 'ja' | 'zh';
    type PageKey = 'home' | 'projects' | 'certificates' | 'projectDetail' | 'notFound';

    interface LanguageApi {
        resolveCurrentLocale(): Locale;
        applyLocaleChoice(locale: Locale): string;
        buildLocaleUrl(currentUrl: string | URL, locale: Locale): string;
    }

    interface LocaleCatalog {
        locale: Locale;
        shared: {
            brand: string;
            navigation: Record<string, string>;
            footer: Record<string, string>;
        };
        pages: Record<string, Record<string, unknown>>;
    }

    interface PortfolioWindow extends Window {
        PortfolioLanguage?: LanguageApi;
        PortfolioUi?: Readonly<{
            getLocale(): Locale;
            getCatalog(): LocaleCatalog | null;
            setLocale(locale: Locale): Promise<void>;
        }>;
        PortfolioUiReady?: Promise<void>;
    }

    const windowScope = globalScope as PortfolioWindow;
    const SUPPORTED_LOCALES: readonly Locale[] = ['id', 'en', 'ja', 'zh'];
    const DEFAULT_LOCALE: Locale = 'id';
    const PAGE_PATHS: Record<PageKey, string> = {
        home: '/',
        projects: '/projects.html',
        certificates: '/certificates.html',
        projectDetail: window.location.pathname,
        notFound: '/404.html',
    };
    const HTML_LOCALES: Record<Locale, string> = {
        id: 'id',
        en: 'en',
        ja: 'ja',
        zh: 'zh-Hans',
    };
    const OG_LOCALES: Record<Locale, string> = {
        id: 'id_ID',
        en: 'en_US',
        ja: 'ja_JP',
        zh: 'zh_CN',
    };
    const LANGUAGE_LABELS: Record<Locale, string> = {
        id: 'Pilih bahasa',
        en: 'Choose language',
        ja: '言語を選択',
        zh: '选择语言',
    };
    const LANGUAGE_NAMES: Record<Locale, string> = {
        id: 'Bahasa Indonesia',
        en: 'English',
        ja: '日本語',
        zh: '中文',
    };
    const COMPACT_LANGUAGE_NAMES: Record<Locale, string> = {
        id: 'ID',
        en: 'EN',
        ja: 'JP',
        zh: 'CH',
    };

    let currentLocale: Locale = DEFAULT_LOCALE;
    let currentCatalog: LocaleCatalog | null = null;
    let catalogController: AbortController | null = null;

    const isLocale = (value: unknown): value is Locale => {
        return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale);
    };

    const pageKey = (): PageKey => {
        const value = document.body?.dataset.page;
        return value === 'projects' || value === 'certificates' || value === 'projectDetail' || value === 'notFound'
            ? value
            : 'home';
    };

    const readPath = (catalog: LocaleCatalog, path: string): string => {
        const value = path.split('.').reduce<unknown>((node, key) => {
            if (!node || typeof node !== 'object') return undefined;
            return (node as Record<string, unknown>)[key];
        }, catalog);

        return typeof value === 'string' ? value : '';
    };

    const loadCatalog = async (locale: Locale): Promise<LocaleCatalog> => {
        catalogController?.abort();
        const controller = new AbortController();
        catalogController = controller;

        const response = await fetch(`/assets/data/locales/ui-${locale}.json`, {
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Cannot load locale catalog (${response.status})`);
        }

        const catalog = (await response.json()) as LocaleCatalog;
        if (!catalog || catalog.locale !== locale) {
            throw new Error(`Invalid locale catalog: ${locale}`);
        }
        return catalog;
    };

    const localeUrl = (path: string, locale: Locale, hash = ''): string => {
        const url = new URL(path, window.location.origin);
        url.searchParams.set('lang', locale);
        url.hash = hash;
        return `${url.pathname}${url.search}${url.hash}`;
    };

    const updateRoutes = (locale: Locale) => {
        document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((link) => {
            const route = link.dataset.route || 'home';
            const hashes: Record<string, string> = {
                about: 'tentang',
                history: 'riwayat',
                skills: 'skills',
                featuredProjects: 'proyek',
                featuredCertificates: 'sertifikat',
                contact: 'contact',
            };

            if (route === 'projects') {
                link.href = localeUrl(PAGE_PATHS.projects, locale);
            } else if (route === 'certificates') {
                link.href = localeUrl(PAGE_PATHS.certificates, locale);
            } else {
                const hash = hashes[route] || '';
                link.href = localeUrl(PAGE_PATHS.home, locale, hash);
            }
        });

        document.querySelectorAll<HTMLElement>('[data-full-url]').forEach((container) => {
            const target = container.id === 'certificates-react-root' ? PAGE_PATHS.certificates : PAGE_PATHS.projects;
            container.dataset.fullUrl = localeUrl(target, locale);
        });

        const cvPath = locale === 'en'
            ? 'assets/data/CV/EN/CV_SuluEdwardJulianto.pdf'
            : 'assets/data/CV/ID/CV_SuluEdwardJulianto.pdf';
        document.querySelectorAll<HTMLAnchorElement>('[data-cv-link]').forEach((link) => {
            link.href = cvPath;
        });
    };

    const ensureMeta = (selector: string, create: () => HTMLElement): HTMLElement => {
        const existing = document.head.querySelector<HTMLElement>(selector);
        if (existing) return existing;
        const element = create();
        document.head.appendChild(element);
        return element;
    };

    const updateMetadata = (catalog: LocaleCatalog, locale: Locale) => {
        const page = pageKey();
        const title = readPath(catalog, `pages.${page}.documentTitle`);
        const descriptionPath = page === 'home'
            ? 'pages.home.about.description'
            : page === 'notFound'
                ? 'pages.notFound.description'
                : page === 'projectDetail'
                    ? 'pages.projectDetail.description'
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
            document.head.querySelector('link[rel="canonical"]')?.remove();
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

    const applyCatalog = (catalog: LocaleCatalog, locale: Locale) => {
        document.documentElement.lang = HTML_LOCALES[locale];

        document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
            element.textContent = readPath(catalog, element.dataset.i18n || '');
        });

        document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((element) => {
            const bindings = (element.dataset.i18nAttr || '').split(',');
            bindings.forEach((binding) => {
                const separator = binding.indexOf(':');
                if (separator < 1) return;
                const attribute = binding.slice(0, separator).trim();
                const path = binding.slice(separator + 1).trim();
                element.setAttribute(attribute, readPath(catalog, path));
            });
        });

        document.querySelectorAll<HTMLElement>('[data-locale]').forEach((element) => {
            element.dataset.locale = locale;
        });

        document.querySelectorAll<HTMLButtonElement>('[data-language-selector]').forEach((selector) => {
            const picker = selector.closest<HTMLElement>('[data-language-picker]');
            const currentLabel = selector.querySelector<HTMLElement>('[data-language-current]');
            const compact = picker?.classList.contains('language-picker-mobile') ?? false;
            if (currentLabel) {
                currentLabel.textContent = compact ? COMPACT_LANGUAGE_NAMES[locale] : LANGUAGE_NAMES[locale];
            }
            selector.setAttribute('aria-label', `${LANGUAGE_LABELS[locale]}: ${LANGUAGE_NAMES[locale]}`);

            picker?.querySelector<HTMLElement>('[data-language-menu]')
                ?.setAttribute('aria-label', LANGUAGE_LABELS[locale]);
            picker?.querySelectorAll<HTMLButtonElement>('[data-language-option]').forEach((option) => {
                option.setAttribute('aria-selected', String(option.dataset.languageOption === locale));
            });
        });

        updateRoutes(locale);
        updateMetadata(catalog, locale);
    };

    const setLocale = async (locale: Locale): Promise<void> => {
        if (!isLocale(locale)) throw new TypeError(`Unsupported locale: ${String(locale)}`);

        let catalog: LocaleCatalog;
        let appliedLocale = locale;
        try {
            catalog = await loadCatalog(locale);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            if (locale === DEFAULT_LOCALE) throw error;
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
        const pickers = Array.from(document.querySelectorAll<HTMLElement>('[data-language-picker]'));

        const setOpen = (picker: HTMLElement, open: boolean, focusOption = false) => {
            const selector = picker.querySelector<HTMLButtonElement>('[data-language-selector]');
            const menu = picker.querySelector<HTMLElement>('[data-language-menu]');
            if (!selector || !menu) return;

            selector.setAttribute('aria-expanded', String(open));
            menu.hidden = !open;
            if (open && focusOption) {
                const selected = menu.querySelector<HTMLButtonElement>('[data-language-option][aria-selected="true"]');
                const first = menu.querySelector<HTMLButtonElement>('[data-language-option]');
                (selected ?? first)?.focus();
            }
        };

        const closeOthers = (activePicker?: HTMLElement) => {
            pickers.forEach((picker) => {
                if (picker !== activePicker) setOpen(picker, false);
            });
        };

        pickers.forEach((picker) => {
            const selector = picker.querySelector<HTMLButtonElement>('[data-language-selector]');
            const menu = picker.querySelector<HTMLElement>('[data-language-menu]');
            const options = Array.from(picker.querySelectorAll<HTMLButtonElement>('[data-language-option]'));
            if (!selector || !menu || options.length === 0) return;

            selector.addEventListener('click', () => {
                const willOpen = selector.getAttribute('aria-expanded') !== 'true';
                closeOthers(willOpen ? picker : undefined);
                setOpen(picker, willOpen);
            });

            selector.addEventListener('keydown', (event) => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                closeOthers(picker);
                setOpen(picker, true, true);
                if (event.key === 'ArrowUp') options[options.length - 1]?.focus();
            });

            options.forEach((option) => {
                option.addEventListener('click', () => {
                    const locale = option.dataset.languageOption;
                    if (!isLocale(locale)) return;
                    setOpen(picker, false);
                    selector.focus();
                    closeOthers();
                    try {
                        windowScope.PortfolioLanguage?.applyLocaleChoice(locale);
                    } catch (error) {
                        console.error('Gagal memperbarui URL bahasa.', error);
                    }
                    void setLocale(locale);
                });
            });

            menu.addEventListener('keydown', (event) => {
                const activeIndex = options.indexOf(document.activeElement as HTMLButtonElement);
                let nextIndex: number | null = null;
                if (event.key === 'ArrowDown') nextIndex = (activeIndex + 1) % options.length;
                if (event.key === 'ArrowUp') nextIndex = (activeIndex - 1 + options.length) % options.length;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = options.length - 1;

                if (nextIndex !== null) {
                    event.preventDefault();
                    options[nextIndex]?.focus();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    setOpen(picker, false);
                    selector.focus();
                }
            });

            picker.addEventListener('focusout', (event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!nextTarget || !picker.contains(nextTarget)) setOpen(picker, false);
            });
        });

        document.addEventListener('pointerdown', (event) => {
            const target = event.target as Node | null;
            if (!target || !pickers.some((picker) => picker.contains(target))) closeOthers();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            pickers.forEach((picker) => {
                const selector = picker.querySelector<HTMLButtonElement>('[data-language-selector]');
                if (selector?.getAttribute('aria-expanded') !== 'true') return;
                setOpen(picker, false);
                selector.focus();
            });
        });
    };

    const bindContactForm = () => {
        const form = document.getElementById('contactForm') as HTMLFormElement | null;
        const submitButton = document.getElementById('submitBtn') as HTMLButtonElement | null;
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        if (!form || !submitButton || !successMessage || !errorMessage) return;
        const submitLabel = submitButton.querySelector<HTMLElement>('[data-i18n]');
        const setSubmitText = (value: string) => {
            if (submitLabel) submitLabel.textContent = value;
            else submitButton.textContent = value;
        };

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');

            const catalog = currentCatalog;
            if (!catalog) return;
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
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                successMessage.classList.remove('hidden');
                form.reset();
                successMessage.scrollIntoView({ behavior: 'smooth' });
                window.setTimeout(() => successMessage.classList.add('hidden'), 5000);
            } catch (error) {
                console.error('Gagal mengirim formulir kontak.', error);
                errorMessage.classList.remove('hidden');
                errorMessage.scrollIntoView({ behavior: 'smooth' });
                window.setTimeout(() => errorMessage.classList.add('hidden'), 5000);
            } finally {
                setSubmitText(readPath(catalog, `${formPath}.submit`));
                submitButton.disabled = false;
            }
        });
    };

    const initialize = async () => {
        const locale = windowScope.PortfolioLanguage?.resolveCurrentLocale() ?? DEFAULT_LOCALE;
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
