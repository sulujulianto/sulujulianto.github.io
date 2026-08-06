(function (globalScope) {
    'use strict';

    type Locale = 'id' | 'en' | 'ja' | 'zh';

    interface QueryParametersLike {
        has(name: string): boolean;
        get(name: string): string | null;
    }

    interface ResolveLocaleInput {
        query?: string | QueryParametersLike | null;
        storedLocale?: unknown;
        browserLanguages?: readonly unknown[] | null;
    }

    interface StorageLike {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
    }

    interface HistoryLike {
        replaceState(data: unknown, unused: string, url?: string | URL | null): void;
    }

    interface LanguageEnvironment {
        location?: {
            href?: string;
            search?: string;
        };
        localStorage?: StorageLike;
        navigator?: {
            languages?: readonly unknown[];
        };
        history?: HistoryLike;
    }

    interface PortfolioLanguageApi {
        normalizeLanguageTag(value: unknown): Locale | null;
        resolveLocale(input?: ResolveLocaleInput): Locale;
        resolveCurrentLocale(environment?: LanguageEnvironment): Locale;
        buildLocaleUrl(currentUrl: string | URL, locale: Locale): string;
        applyLocaleChoice(locale: Locale, environment?: LanguageEnvironment): string;
    }

    type PortfolioLanguageGlobal = typeof globalThis & {
        PortfolioLanguage?: PortfolioLanguageApi;
    };

    const SUPPORTED_LOCALES: readonly Locale[] = ['id', 'en', 'ja', 'zh'];
    const DEFAULT_LOCALE: Locale = 'id';
    const STORAGE_KEY = 'portfolio.lang';

    const isCanonicalLocale = (value: unknown): value is Locale => {
        return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale);
    };

    const normalizeLanguageTag = (value: unknown): Locale | null => {
        if (typeof value !== 'string') return null;

        const normalized = value.trim().toLowerCase().replace(/_/g, '-');
        if (!normalized) return null;

        const [primaryLanguage] = normalized.split('-');
        return isCanonicalLocale(primaryLanguage) ? primaryLanguage : null;
    };

    const queryParameters = (query: ResolveLocaleInput['query']): QueryParametersLike | null => {
        if (typeof query === 'string') {
            return new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
        }

        if (query && typeof query.has === 'function' && typeof query.get === 'function') {
            return query;
        }

        return null;
    };

    const resolveQueryChoice = (query: ResolveLocaleInput['query']): Locale | undefined => {
        const parameters = queryParameters(query);
        if (!parameters || !parameters.has('lang')) return undefined;

        return normalizeLanguageTag(parameters.get('lang')) ?? DEFAULT_LOCALE;
    };

    const resolveLocale = (input: ResolveLocaleInput = {}): Locale => {
        const queryChoice = resolveQueryChoice(input.query);
        if (queryChoice !== undefined) return queryChoice;

        const storedChoice = normalizeLanguageTag(input.storedLocale);
        if (storedChoice) return storedChoice;

        if (Array.isArray(input.browserLanguages)) {
            for (const language of input.browserLanguages) {
                const browserChoice = normalizeLanguageTag(language);
                if (browserChoice) return browserChoice;
            }
        }

        return DEFAULT_LOCALE;
    };

    const readLocationSearch = (environment: LanguageEnvironment): string => {
        try {
            return typeof environment.location?.search === 'string' ? environment.location.search : '';
        } catch {
            return '';
        }
    };

    const readStoredLocale = (environment: LanguageEnvironment): unknown => {
        try {
            return environment.localStorage?.getItem(STORAGE_KEY) ?? null;
        } catch {
            return null;
        }
    };

    const readBrowserLanguages = (environment: LanguageEnvironment): readonly unknown[] => {
        try {
            return Array.isArray(environment.navigator?.languages) ? environment.navigator.languages : [];
        } catch {
            return [];
        }
    };

    const resolveCurrentLocale = (environment?: LanguageEnvironment): Locale => {
        const currentEnvironment = environment ?? (globalScope as unknown as LanguageEnvironment);
        const query = readLocationSearch(currentEnvironment);
        const queryChoice = resolveQueryChoice(query);

        if (queryChoice !== undefined) return queryChoice;

        return resolveLocale({
            storedLocale: readStoredLocale(currentEnvironment),
            browserLanguages: readBrowserLanguages(currentEnvironment),
        });
    };

    const requireCanonicalLocale = (locale: unknown): Locale => {
        if (!isCanonicalLocale(locale)) {
            throw new TypeError(`Unsupported portfolio locale: ${String(locale)}`);
        }
        return locale;
    };

    const buildLocaleUrl = (currentUrl: string | URL, locale: Locale): string => {
        const canonicalLocale = requireCanonicalLocale(locale);
        const nextUrl = new URL(String(currentUrl));
        nextUrl.searchParams.set('lang', canonicalLocale);
        return nextUrl.toString();
    };

    const applyLocaleChoice = (locale: Locale, environment?: LanguageEnvironment): string => {
        const canonicalLocale = requireCanonicalLocale(locale);
        const currentEnvironment = environment ?? (globalScope as unknown as LanguageEnvironment);
        const currentUrl = currentEnvironment.location?.href;

        if (typeof currentUrl !== 'string' || !currentUrl) {
            throw new TypeError('A current absolute URL is required to apply a locale choice.');
        }

        const nextUrl = buildLocaleUrl(currentUrl, canonicalLocale);

        try {
            currentEnvironment.localStorage?.setItem(STORAGE_KEY, canonicalLocale);
        } catch {
            // URL updates must remain available when storage is blocked or unavailable.
        }

        if (!currentEnvironment.history || typeof currentEnvironment.history.replaceState !== 'function') {
            throw new TypeError('History.replaceState is required to apply a locale choice.');
        }

        currentEnvironment.history.replaceState(null, '', nextUrl);
        return nextUrl;
    };

    const api: PortfolioLanguageApi = Object.freeze({
        normalizeLanguageTag,
        resolveLocale,
        resolveCurrentLocale,
        buildLocaleUrl,
        applyLocaleChoice,
    });

    (globalScope as PortfolioLanguageGlobal).PortfolioLanguage = api;
})(globalThis);
