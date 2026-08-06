"use strict";
(function (globalScope) {
    'use strict';
    const SUPPORTED_LOCALES = ['id', 'en', 'ja', 'zh'];
    const DEFAULT_LOCALE = 'id';
    const STORAGE_KEY = 'portfolio.lang';
    const isCanonicalLocale = (value) => {
        return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
    };
    const normalizeLanguageTag = (value) => {
        if (typeof value !== 'string')
            return null;
        const normalized = value.trim().toLowerCase().replace(/_/g, '-');
        if (!normalized)
            return null;
        const [primaryLanguage] = normalized.split('-');
        return isCanonicalLocale(primaryLanguage) ? primaryLanguage : null;
    };
    const queryParameters = (query) => {
        if (typeof query === 'string') {
            return new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
        }
        if (query && typeof query.has === 'function' && typeof query.get === 'function') {
            return query;
        }
        return null;
    };
    const resolveQueryChoice = (query) => {
        var _a;
        const parameters = queryParameters(query);
        if (!parameters || !parameters.has('lang'))
            return undefined;
        return (_a = normalizeLanguageTag(parameters.get('lang'))) !== null && _a !== void 0 ? _a : DEFAULT_LOCALE;
    };
    const resolveLocale = (input = {}) => {
        const queryChoice = resolveQueryChoice(input.query);
        if (queryChoice !== undefined)
            return queryChoice;
        const storedChoice = normalizeLanguageTag(input.storedLocale);
        if (storedChoice)
            return storedChoice;
        if (Array.isArray(input.browserLanguages)) {
            for (const language of input.browserLanguages) {
                const browserChoice = normalizeLanguageTag(language);
                if (browserChoice)
                    return browserChoice;
            }
        }
        return DEFAULT_LOCALE;
    };
    const readLocationSearch = (environment) => {
        var _a;
        try {
            return typeof ((_a = environment.location) === null || _a === void 0 ? void 0 : _a.search) === 'string' ? environment.location.search : '';
        }
        catch {
            return '';
        }
    };
    const readStoredLocale = (environment) => {
        var _a, _b;
        try {
            return (_b = (_a = environment.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(STORAGE_KEY)) !== null && _b !== void 0 ? _b : null;
        }
        catch {
            return null;
        }
    };
    const readBrowserLanguages = (environment) => {
        var _a;
        try {
            return Array.isArray((_a = environment.navigator) === null || _a === void 0 ? void 0 : _a.languages) ? environment.navigator.languages : [];
        }
        catch {
            return [];
        }
    };
    const resolveCurrentLocale = (environment) => {
        const currentEnvironment = environment !== null && environment !== void 0 ? environment : globalScope;
        const query = readLocationSearch(currentEnvironment);
        const queryChoice = resolveQueryChoice(query);
        if (queryChoice !== undefined)
            return queryChoice;
        return resolveLocale({
            storedLocale: readStoredLocale(currentEnvironment),
            browserLanguages: readBrowserLanguages(currentEnvironment),
        });
    };
    const requireCanonicalLocale = (locale) => {
        if (!isCanonicalLocale(locale)) {
            throw new TypeError(`Unsupported portfolio locale: ${String(locale)}`);
        }
        return locale;
    };
    const buildLocaleUrl = (currentUrl, locale) => {
        const canonicalLocale = requireCanonicalLocale(locale);
        const nextUrl = new URL(String(currentUrl));
        nextUrl.searchParams.set('lang', canonicalLocale);
        return nextUrl.toString();
    };
    const applyLocaleChoice = (locale, environment) => {
        var _a, _b;
        const canonicalLocale = requireCanonicalLocale(locale);
        const currentEnvironment = environment !== null && environment !== void 0 ? environment : globalScope;
        const currentUrl = (_a = currentEnvironment.location) === null || _a === void 0 ? void 0 : _a.href;
        if (typeof currentUrl !== 'string' || !currentUrl) {
            throw new TypeError('A current absolute URL is required to apply a locale choice.');
        }
        const nextUrl = buildLocaleUrl(currentUrl, canonicalLocale);
        try {
            (_b = currentEnvironment.localStorage) === null || _b === void 0 ? void 0 : _b.setItem(STORAGE_KEY, canonicalLocale);
        }
        catch {
            // URL updates must remain available when storage is blocked or unavailable.
        }
        if (!currentEnvironment.history || typeof currentEnvironment.history.replaceState !== 'function') {
            throw new TypeError('History.replaceState is required to apply a locale choice.');
        }
        currentEnvironment.history.replaceState(null, '', nextUrl);
        return nextUrl;
    };
    const api = Object.freeze({
        normalizeLanguageTag,
        resolveLocale,
        resolveCurrentLocale,
        buildLocaleUrl,
        applyLocaleChoice,
    });
    globalScope.PortfolioLanguage = api;
})(globalThis);
