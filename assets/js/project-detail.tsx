/// <reference types="react" />
/// <reference types="react-dom" />

(function () {
    'use strict';

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React atau ReactDOM tidak tersedia.');
        return;
    }

    type LocaleKey = 'id' | 'en' | 'ja' | 'zh';
    type ContentLocale = 'id' | 'en';

    type ArticleBlock =
        | { type: 'paragraph'; text: string }
        | { type: 'heading'; level: 2 | 3; text: string }
        | { type: 'list'; items: string[] }
        | { type: 'image'; src: string; alt: string; caption?: string }
        | { type: 'code'; language?: string; code: string }
        | { type: 'callout'; title: string; text: string };

    interface ProjectArticle {
        version: number;
        slug: string;
        contentLanguage: ContentLocale;
        title: string;
        summary: string;
        category: string;
        hero: {
            src: string;
            alt: string;
            caption?: string;
        };
        techStack: string[];
        content: ArticleBlock[];
        links: {
            github?: string | null;
            liveDemo?: string | null;
        };
    }

    interface ProjectDetailLabels {
        documentTitle: string;
        breadcrumb: string;
        technologyHeading: string;
        github: string;
        liveDemo: string;
        backToProjects: string;
        loading: string;
        error: string;
        unavailable: string;
    }

    interface LocaleCatalog {
        locale: LocaleKey;
        pages: {
            projectDetail?: ProjectDetailLabels;
        };
    }

    type PortfolioLocaleEvent = CustomEvent<{ locale: LocaleKey }>;

    type PortfolioWindow = typeof window & {
        PortfolioUi?: Readonly<{
            getLocale(): LocaleKey;
            getCatalog(): LocaleCatalog | null;
        }>;
        PortfolioUiReady?: Promise<void>;
    };

    const ReactDOMClient = ReactDOM as unknown as typeof import('react-dom/client');
    const windowScope = window as PortfolioWindow;

    const DEFAULT_LABELS: ProjectDetailLabels = {
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

    const normalizeLocale = (value?: string): LocaleKey => {
        if (value === 'en' || value === 'ja' || value === 'zh') return value;
        return 'id';
    };

    const getLabels = (): ProjectDetailLabels => {
        const labels = windowScope.PortfolioUi?.getCatalog()?.pages?.projectDetail;
        return labels || DEFAULT_LABELS;
    };

    const ensureMeta = (selector: string, property: string, value: string): void => {
        let meta = document.head.querySelector<HTMLMetaElement>(selector);
        if (!meta) {
            meta = document.createElement('meta');
            const [attribute, attributeValue] = property.split('=');
            meta.setAttribute(attribute, attributeValue);
            document.head.appendChild(meta);
        }
        meta.content = value;
    };

    const updateArticleMetadata = (article: ProjectArticle): void => {
        const title = `${article.title} — Sulu Edward Julianto`;
        const canonicalUrl = new URL(window.location.pathname, window.location.origin);
        const heroUrl = new URL(article.hero.src, window.location.origin).toString();

        document.title = title;
        ensureMeta('meta[name="description"]', 'name=description', article.summary);
        ensureMeta('meta[property="og:title"]', 'property=og:title', title);
        ensureMeta('meta[property="og:description"]', 'property=og:description', article.summary);
        ensureMeta('meta[name="twitter:title"]', 'name=twitter:title', title);
        ensureMeta('meta[name="twitter:description"]', 'name=twitter:description', article.summary);
        ensureMeta('meta[property="og:type"]', 'property=og:type', 'article');
        ensureMeta('meta[property="og:image"]', 'property=og:image', heroUrl);
        ensureMeta(
            'meta[property="og:locale"]',
            'property=og:locale',
            article.contentLanguage === 'en' ? 'en_US' : 'id_ID',
        );

        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
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

    const ArticleContent: React.FC<{ blocks: ArticleBlock[] }> = ({ blocks }) => (
        <div className="project-article__content">
            {blocks.map((block, index) => {
                const key = `${block.type}-${index}`;
                if (block.type === 'paragraph') {
                    return <p key={key}>{block.text}</p>;
                }
                if (block.type === 'heading') {
                    return block.level === 3
                        ? <h3 key={key}>{block.text}</h3>
                        : <h2 key={key}>{block.text}</h2>;
                }
                if (block.type === 'list') {
                    return (
                        <ul key={key}>
                            {block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{item}</li>)}
                        </ul>
                    );
                }
                if (block.type === 'image') {
                    return (
                        <figure key={key} className="project-article__inline-image">
                            <img src={block.src} alt={block.alt} loading="lazy" />
                            {block.caption && <figcaption>{block.caption}</figcaption>}
                        </figure>
                    );
                }
                if (block.type === 'code') {
                    return (
                        <pre key={key} className="project-article__code" data-language={block.language || 'text'}>
                            <code>{block.code}</code>
                        </pre>
                    );
                }
                if (block.type === 'callout') {
                    return (
                        <aside key={key} className="project-article__callout">
                            <h3>{block.title}</h3>
                            <p>{block.text}</p>
                        </aside>
                    );
                }
                return null;
            })}
        </div>
    );

    const ProjectDetailApp: React.FC = () => {
        const root = document.getElementById('project-detail-root');
        const slug = root?.dataset.projectSlug || '';
        const contentLocale = (root?.dataset.contentLocale || 'id') as ContentLocale;
        const [locale, setLocale] = React.useState<LocaleKey>(() => normalizeLocale(root?.dataset.locale));
        const [article, setArticle] = React.useState<ProjectArticle | null>(null);
        const [categoryLabel, setCategoryLabel] = React.useState('');
        const [labels, setLabels] = React.useState<ProjectDetailLabels>(DEFAULT_LABELS);
        const [error, setError] = React.useState('');

        React.useEffect(() => {
            let active = true;
            const syncLocale = () => {
                if (!active) return;
                setLabels(getLabels());
                setLocale(normalizeLocale(windowScope.PortfolioUi?.getLocale()));
            };
            windowScope.PortfolioUiReady?.then(syncLocale).catch(syncLocale);
            const handleLocale = (event: Event) => {
                const localeEvent = event as PortfolioLocaleEvent;
                setLocale(normalizeLocale(localeEvent.detail?.locale));
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
                    if (!response.ok) throw new Error(`${response.status}`);
                    return response.json();
                })
                .then((value: ProjectArticle) => {
                    if (value.slug !== slug || value.contentLanguage !== contentLocale || !Array.isArray(value.content)) {
                        throw new Error('invalid project detail');
                    }
                    setArticle(value);
                })
                .catch((reason) => {
                    if (reason.name !== 'AbortError') setError(labels.unavailable);
                });
            return () => controller.abort();
        }, [contentLocale, labels.unavailable, slug]);

        React.useEffect(() => {
            if (article) updateArticleMetadata(article);
        }, [article, locale]);

        React.useEffect(() => {
            const controller = new AbortController();
            fetch(`/assets/data/categories/projects/project-categories-${locale}.json`, { signal: controller.signal })
                .then((response) => response.ok ? response.json() : [])
                .then((categories: Array<{ id: string; label: string }>) => {
                    const match = categories.find((category) => category.id === article?.category);
                    setCategoryLabel(match?.label || article?.category || '');
                })
                .catch((reason) => {
                    if (reason.name !== 'AbortError') setCategoryLabel(article?.category || '');
                });
            return () => controller.abort();
        }, [article?.category, locale]);

        const projectsUrl = `/projects.html?lang=${locale}`;

        if (error) {
            return <div className="project-detail-state project-detail-state--error">{labels.error} {error}</div>;
        }
        if (!article) {
            return <div className="project-detail-state">{labels.loading}</div>;
        }

        return (
            <article className="project-article" lang={article.contentLanguage}>
                <nav className="project-article__breadcrumb" aria-label={labels.breadcrumb}>
                    <a href={projectsUrl}>{labels.breadcrumb}</a>
                    <i className="fas fa-chevron-right" aria-hidden="true"></i>
                    <span aria-current="page">{article.title}</span>
                </nav>

                <header className="project-article__header">
                    <span className="project-article__category">{categoryLabel}</span>
                    <h1>{article.title}</h1>
                    <p>{article.summary}</p>
                </header>

                <figure className="project-article__hero">
                    <img src={article.hero.src} alt={article.hero.alt} />
                    {article.hero.caption && <figcaption>{article.hero.caption}</figcaption>}
                </figure>

                {article.techStack.length > 0 && (
                    <section className="project-article__tech" aria-labelledby="project-tech-heading">
                        <h2 id="project-tech-heading">{labels.technologyHeading}</h2>
                        <ul>
                            {article.techStack.map((technology) => <li key={technology}>{technology}</li>)}
                        </ul>
                    </section>
                )}

                <ArticleContent blocks={article.content} />

                <footer className="project-article__actions">
                    {article.links.github && (
                        <a href={article.links.github} target="_blank" rel="noopener noreferrer" className="project-action project-action--github">
                            <i className="fab fa-github" aria-hidden="true"></i>
                            <span>{labels.github}</span>
                        </a>
                    )}
                    {article.links.liveDemo && (
                        <a href={article.links.liveDemo} target="_blank" rel="noopener noreferrer" className="project-action project-action--live">
                            <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                            <span>{labels.liveDemo}</span>
                        </a>
                    )}
                    <a href={projectsUrl} className="project-action project-action--back">
                        <i className="fas fa-arrow-left" aria-hidden="true"></i>
                        <span>{labels.backToProjects}</span>
                    </a>
                </footer>
            </article>
        );
    };

    const container = document.getElementById('project-detail-root');
    if (container) ReactDOMClient.createRoot(container).render(<ProjectDetailApp />);
})();
