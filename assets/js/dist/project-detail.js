"use strict";
/// <reference types="react" />
/// <reference types="react-dom" />
(function () {
    'use strict';
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React atau ReactDOM tidak tersedia.');
        return;
    }
    const ReactDOMClient = ReactDOM;
    const windowScope = window;
    const DEFAULT_LABELS = {
        documentTitle: 'Detail Proyek — Sulu Edward Julianto',
        breadcrumb: 'Proyek',
        technologyHeading: 'Teknologi',
        github: 'Buka GitHub',
        liveDemo: 'Lihat Live Demo',
        backToProjects: 'Kembali ke Semua Proyek',
        loading: 'Memuat studi kasus...',
        error: 'Studi kasus tidak dapat dimuat.',
        unavailable: 'Konten proyek belum tersedia.',
    };
    const normalizeLocale = (value) => {
        if (value === 'en' || value === 'ja' || value === 'zh')
            return value;
        return 'id';
    };
    const getLabels = () => {
        var _a, _b, _c;
        const labels = (_c = (_b = (_a = windowScope.PortfolioUi) === null || _a === void 0 ? void 0 : _a.getCatalog()) === null || _b === void 0 ? void 0 : _b.pages) === null || _c === void 0 ? void 0 : _c.projectDetail;
        return labels || DEFAULT_LABELS;
    };
    const ensureMeta = (selector, property, value) => {
        let meta = document.head.querySelector(selector);
        if (!meta) {
            meta = document.createElement('meta');
            const [attribute, attributeValue] = property.split('=');
            meta.setAttribute(attribute, attributeValue);
            document.head.appendChild(meta);
        }
        meta.content = value;
    };
    const updateArticleMetadata = (article) => {
        const title = `${article.title} — Sulu Edward Julianto`;
        const canonicalUrl = new URL(window.location.pathname, window.location.origin);
        const heroUrl = new URL(article.hero.src, window.location.origin).toString();
        document.title = title;
        ensureMeta('meta[name="description"]', 'name=description', article.summary);
        ensureMeta('meta[property="og:title"]', 'property=og:title', title);
        ensureMeta('meta[property="og:description"]', 'property=og:description', article.summary);
        ensureMeta('meta[property="og:type"]', 'property=og:type', 'article');
        ensureMeta('meta[property="og:image"]', 'property=og:image', heroUrl);
        ensureMeta('meta[property="og:locale"]', 'property=og:locale', article.contentLanguage === 'en' ? 'en_US' : 'id_ID');
        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl.toString();
        document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());
        for (const language of [article.contentLanguage, 'x-default']) {
            const alternate = document.createElement('link');
            alternate.rel = 'alternate';
            alternate.hreflang = language;
            alternate.href = canonicalUrl.toString();
            document.head.appendChild(alternate);
        }
    };
    const ArticleContent = ({ blocks }) => (React.createElement("div", { className: "project-article__content" }, blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'paragraph') {
            return React.createElement("p", { key: key }, block.text);
        }
        if (block.type === 'heading') {
            return block.level === 3
                ? React.createElement("h3", { key: key }, block.text)
                : React.createElement("h2", { key: key }, block.text);
        }
        if (block.type === 'list') {
            return (React.createElement("ul", { key: key }, block.items.map((item, itemIndex) => React.createElement("li", { key: `${key}-${itemIndex}` }, item))));
        }
        if (block.type === 'image') {
            return (React.createElement("figure", { key: key, className: "project-article__inline-image" },
                React.createElement("img", { src: block.src, alt: block.alt, loading: "lazy" }),
                block.caption && React.createElement("figcaption", null, block.caption)));
        }
        if (block.type === 'code') {
            return (React.createElement("pre", { key: key, className: "project-article__code", "data-language": block.language || 'text' },
                React.createElement("code", null, block.code)));
        }
        if (block.type === 'callout') {
            return (React.createElement("aside", { key: key, className: "project-article__callout" },
                React.createElement("h3", null, block.title),
                React.createElement("p", null, block.text)));
        }
        return null;
    })));
    const ProjectDetailApp = () => {
        const root = document.getElementById('project-detail-root');
        const slug = (root === null || root === void 0 ? void 0 : root.dataset.projectSlug) || '';
        const contentLocale = ((root === null || root === void 0 ? void 0 : root.dataset.contentLocale) || 'id');
        const [locale, setLocale] = React.useState(() => normalizeLocale(root === null || root === void 0 ? void 0 : root.dataset.locale));
        const [article, setArticle] = React.useState(null);
        const [categoryLabel, setCategoryLabel] = React.useState('');
        const [labels, setLabels] = React.useState(DEFAULT_LABELS);
        const [error, setError] = React.useState('');
        React.useEffect(() => {
            var _a;
            let active = true;
            const syncLocale = () => {
                var _a;
                if (!active)
                    return;
                setLabels(getLabels());
                setLocale(normalizeLocale((_a = windowScope.PortfolioUi) === null || _a === void 0 ? void 0 : _a.getLocale()));
            };
            (_a = windowScope.PortfolioUiReady) === null || _a === void 0 ? void 0 : _a.then(syncLocale).catch(syncLocale);
            const handleLocale = (event) => {
                var _a;
                const localeEvent = event;
                setLocale(normalizeLocale((_a = localeEvent.detail) === null || _a === void 0 ? void 0 : _a.locale));
                setLabels(getLabels());
            };
            document.addEventListener('portfolio:localechange', handleLocale);
            return () => {
                active = false;
                document.removeEventListener('portfolio:localechange', handleLocale);
            };
        }, []);
        React.useEffect(() => {
            const controller = new AbortController();
            setError('');
            fetch(`/assets/data/project-details/${contentLocale}/${slug}.json`, { signal: controller.signal })
                .then((response) => {
                if (!response.ok)
                    throw new Error(`${response.status}`);
                return response.json();
            })
                .then((value) => {
                if (value.slug !== slug || value.contentLanguage !== contentLocale || !Array.isArray(value.content)) {
                    throw new Error('invalid project detail');
                }
                setArticle(value);
            })
                .catch((reason) => {
                if (reason.name !== 'AbortError')
                    setError(labels.unavailable);
            });
            return () => controller.abort();
        }, [contentLocale, labels.unavailable, slug]);
        React.useEffect(() => {
            if (article)
                updateArticleMetadata(article);
        }, [article, locale]);
        React.useEffect(() => {
            const controller = new AbortController();
            fetch(`/assets/data/categories/projects/project-categories-${locale}.json`, { signal: controller.signal })
                .then((response) => response.ok ? response.json() : [])
                .then((categories) => {
                const match = categories.find((category) => category.id === (article === null || article === void 0 ? void 0 : article.category));
                setCategoryLabel((match === null || match === void 0 ? void 0 : match.label) || (article === null || article === void 0 ? void 0 : article.category) || '');
            })
                .catch((reason) => {
                if (reason.name !== 'AbortError')
                    setCategoryLabel((article === null || article === void 0 ? void 0 : article.category) || '');
            });
            return () => controller.abort();
        }, [article === null || article === void 0 ? void 0 : article.category, locale]);
        const projectsUrl = `/projects.html?lang=${locale}`;
        if (error) {
            return React.createElement("div", { className: "project-detail-state project-detail-state--error" },
                labels.error,
                " ",
                error);
        }
        if (!article) {
            return React.createElement("div", { className: "project-detail-state" }, labels.loading);
        }
        return (React.createElement("article", { className: "project-article", lang: article.contentLanguage },
            React.createElement("nav", { className: "project-article__breadcrumb", "aria-label": labels.breadcrumb },
                React.createElement("a", { href: projectsUrl }, labels.breadcrumb),
                React.createElement("i", { className: "fas fa-chevron-right", "aria-hidden": "true" }),
                React.createElement("span", { "aria-current": "page" }, article.title)),
            React.createElement("header", { className: "project-article__header" },
                React.createElement("span", { className: "project-article__category" }, categoryLabel),
                React.createElement("h1", null, article.title),
                React.createElement("p", null, article.summary)),
            React.createElement("figure", { className: "project-article__hero" },
                React.createElement("img", { src: article.hero.src, alt: article.hero.alt }),
                article.hero.caption && React.createElement("figcaption", null, article.hero.caption)),
            article.techStack.length > 0 && (React.createElement("section", { className: "project-article__tech", "aria-labelledby": "project-tech-heading" },
                React.createElement("h2", { id: "project-tech-heading" }, labels.technologyHeading),
                React.createElement("ul", null, article.techStack.map((technology) => React.createElement("li", { key: technology }, technology))))),
            React.createElement(ArticleContent, { blocks: article.content }),
            React.createElement("footer", { className: "project-article__actions" },
                article.links.github && (React.createElement("a", { href: article.links.github, target: "_blank", rel: "noopener noreferrer", className: "project-action project-action--github" },
                    React.createElement("i", { className: "fab fa-github", "aria-hidden": "true" }),
                    React.createElement("span", null, labels.github))),
                article.links.liveDemo && (React.createElement("a", { href: article.links.liveDemo, target: "_blank", rel: "noopener noreferrer", className: "project-action project-action--live" },
                    React.createElement("i", { className: "fas fa-external-link-alt", "aria-hidden": "true" }),
                    React.createElement("span", null, labels.liveDemo))),
                React.createElement("a", { href: projectsUrl, className: "project-action project-action--back" },
                    React.createElement("i", { className: "fas fa-arrow-left", "aria-hidden": "true" }),
                    React.createElement("span", null, labels.backToProjects)))));
    };
    const container = document.getElementById('project-detail-root');
    if (container)
        ReactDOMClient.createRoot(container).render(React.createElement(ProjectDetailApp, null));
})();
