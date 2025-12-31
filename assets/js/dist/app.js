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
    const ALL_CATEGORY_LABEL = {
        id: 'Semua',
        en: 'All',
        ja: 'すべて',
        zh: '全部',
    };
    const buildCategoryList = (list, fallbackLabel) => {
        const fallback = { id: '*', label: fallbackLabel };
        const seen = new Set();
        const cleaned = [];
        if (Array.isArray(list)) {
            list.forEach((item) => {
                if (!item || typeof item.id !== 'string' || typeof item.label !== 'string')
                    return;
                const id = item.id.trim();
                if (!id || seen.has(id))
                    return;
                cleaned.push({ id, label: item.label });
                seen.add(id);
            });
        }
        const withoutFallback = cleaned.filter((cat) => cat.id !== fallback.id);
        return [fallback, ...withoutFallback];
    };
    const normalizeLocale = (value) => {
        const locale = (value || 'id').toLowerCase();
        if (locale === 'ja' || locale === 'jp')
            return 'ja';
        if (locale === 'zh' || locale === 'cn')
            return 'zh';
        if (locale === 'en')
            return 'en';
        return 'id';
    };
    const COMPONENT_LABELS = {
        id: {
            issued: 'Diberikan pada:',
            expires: 'Berlaku sampai:',
            techStack: 'Teknologi',
            loading: 'Memuat...',
            error: 'Terjadi kesalahan:',
            empty: 'Belum ada item yang dapat ditampilkan.',
            viewAll: 'Lihat Semua',
            modalClose: 'Tutup',
            modalGithub: 'Buka GitHub',
            modalPreview: 'Lihat Langsung',
        },
        en: {
            issued: 'Issued on:',
            expires: 'Valid until:',
            techStack: 'Tech Stack',
            loading: 'Loading...',
            error: 'Something went wrong:',
            empty: 'Nothing to display yet.',
            viewAll: 'View All',
            modalClose: 'Close',
            modalGithub: 'Open GitHub',
            modalPreview: 'View Live',
        },
        ja: {
            issued: '発行日:',
            expires: '有効期限:',
            techStack: '技術スタック',
            loading: '読み込み中...',
            error: 'エラーが発生しました:',
            empty: '表示できる項目はまだありません。',
            viewAll: 'すべて表示',
            modalClose: '閉じる',
            modalGithub: 'GitHub を開く',
            modalPreview: 'ライブを見る',
        },
        zh: {
            issued: '颁发于:',
            expires: '有效期至:',
            techStack: '技术栈',
            loading: '加载中...',
            error: '发生错误:',
            empty: '暂无可展示的内容。',
            viewAll: '查看全部',
            modalClose: '关闭',
            modalGithub: '打开 GitHub',
            modalPreview: '访问网站',
        },
    };
    const parseDate = (value) => {
        if (!value)
            return 0;
        const timestamp = Date.parse(value);
        if (!Number.isNaN(timestamp))
            return timestamp;
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
            const [a, b, c] = parts;
            const normalized = `${c}-${b}-${a}`;
            const fallback = Date.parse(normalized);
            if (!Number.isNaN(fallback))
                return fallback;
        }
        return 0;
    };
    const sortByNewest = (items, getter) => {
        return [...items].sort((a, b) => parseDate(getter(b)) - parseDate(getter(a)));
    };
    const parsePositiveNumber = (value, fallback) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    };
    const FilterButton = ({ isActive, onClick, children }) => (React.createElement("button", { type: "button", onClick: onClick, className: `filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-all duration-300 border-2 ${isActive
            ? 'filter-btn-active bg-blue-600 text-white border-blue-600 shadow-md'
            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'}`, "aria-pressed": isActive }, children));
    const PortfolioGrid = ({ data, isLoading, error, labels, renderCard, }) => {
        if (isLoading) {
            return (React.createElement("div", { className: "text-center col-span-full py-12" },
                React.createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
                React.createElement("p", { className: "text-gray-600 dark:text-gray-400" }, labels.loading)));
        }
        if (error) {
            return (React.createElement("div", { className: "col-span-full" },
                React.createElement("div", { className: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-600 dark:text-red-300" },
                    React.createElement("p", { className: "font-semibold mb-1" }, labels.error),
                    React.createElement("p", { className: "text-sm" }, error))));
        }
        if (data.length === 0) {
            return (React.createElement("div", { className: "col-span-full text-center text-gray-500 dark:text-gray-400 py-12" }, labels.empty));
        }
        return React.createElement(React.Fragment, null, data.map((item, index) => renderCard(item, index)));
    };
    const ProjectCard = ({ item, labels, categoryLabels, onAction, animationIndex, asLink = null }) => {
        const className = 'card h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left bg-white/70 dark:bg-slate-800 card-appear';
        const imageBlock = (React.createElement("div", { className: "w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center", style: { aspectRatio: '16 / 9', maxHeight: '210px' } },
            React.createElement("img", { src: item.imageUrl, alt: item.title, loading: "lazy", className: "w-full h-full object-contain" })));
        const body = (React.createElement("div", { className: "p-5 flex flex-col flex-grow gap-2" },
            React.createElement("div", { className: "flex items-center text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold mb-2" }, item.category && (categoryLabels[item.category] || item.category)),
            React.createElement("h3", { className: "text-lg font-bold text-gray-900 dark:text-white" }, item.title),
            React.createElement("p", { className: "text-sm text-gray-700 dark:text-gray-300 flex-grow" }, item.description),
            item.techStack && item.techStack.length > 0 && (React.createElement("div", { className: "mt-2" },
                React.createElement("p", { className: "text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-1" }, labels.techStack),
                React.createElement("p", { className: "text-sm font-normal text-gray-700 dark:text-gray-300" }, item.techStack.join(', '))))));
        if (asLink) {
            return (React.createElement("a", { href: asLink, className: className, style: { '--card-index': animationIndex }, onClick: onAction },
                imageBlock,
                body));
        }
        return (React.createElement("button", { type: "button", onClick: onAction, className: className, style: { '--card-index': animationIndex } },
            imageBlock,
            body));
    };
    const ProjectModal = ({ project, labels, categoryLabels, onClose }) => {
        React.useEffect(() => {
            const handleEsc = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }, [onClose]);
        const handleBackdrop = (event) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        };
        const detailedDescription = project.modalDescription || project.description;
        return (React.createElement("div", { className: "fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4", onClick: handleBackdrop },
            React.createElement("article", { className: "project-modal" },
                React.createElement("header", { className: "project-modal__header" },
                    React.createElement("div", null,
                        project.category && (React.createElement("span", { className: "project-modal__badge" }, categoryLabels[project.category] || project.category)),
                        React.createElement("h3", { className: "project-modal__title" }, project.title)),
                    React.createElement("button", { type: "button", onClick: onClose, "aria-label": labels.modalClose, className: "project-modal__close" },
                        React.createElement("i", { className: "fas fa-times" }))),
                React.createElement("div", { className: "project-modal__content" },
                    React.createElement("div", { className: "project-modal__image" },
                        React.createElement("img", { src: project.imageUrl, alt: project.title })),
                    React.createElement("div", { className: "project-modal__body" },
                        React.createElement("p", { className: "project-modal__description" }, detailedDescription),
                        project.techStack && project.techStack.length > 0 && (React.createElement("div", null,
                            React.createElement("p", { className: "project-modal__label" }, labels.techStack),
                            React.createElement("p", { className: "project-modal__tech" }, project.techStack.join(', ')))))),
                React.createElement("div", { className: "project-modal__actions" },
                    project.githubUrl && (React.createElement("a", { href: project.githubUrl, target: "_blank", rel: "noopener noreferrer", className: "project-modal__btn project-modal__btn--secondary", style: { textDecoration: 'none' } },
                        React.createElement("i", { className: "fab fa-github" }),
                        React.createElement("span", null, labels.modalGithub))),
                    project.liveUrl && (React.createElement("a", { href: project.liveUrl, target: "_blank", rel: "noopener noreferrer", className: "project-modal__btn project-modal__btn--primary", style: { textDecoration: 'none' } },
                        React.createElement("i", { className: "fas fa-external-link-alt" }),
                        React.createElement("span", null, labels.modalPreview))),
                    React.createElement("button", { type: "button", onClick: onClose, className: "project-modal__btn project-modal__btn--ghost" },
                        React.createElement("i", { className: "fas fa-times" }),
                        React.createElement("span", null, labels.modalClose))))));
    };
    const ProjectsApp = () => {
        const container = document.getElementById('portfolio-react-root');
        if (!container)
            return null;
        const locale = container.dataset.locale || 'id';
        const localeKey = normalizeLocale(locale);
        const basePath = container.dataset.basePath || '../';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';
        const showFiltersProjects = container.dataset.showFilters !== 'false';
        const batchSize = parsePositiveNumber(container.dataset.batchSize, 6);
        const gridColumns = container.dataset.gridColumns === '4' ? '4' : '3';
        const gridClass = gridColumns === '4'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        const labels = COMPONENT_LABELS[localeKey];
        const [data, setData] = React.useState([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        const [selectedProject, setSelectedProject] = React.useState(null);
        const [visibleCount, setVisibleCount] = React.useState(() => (mode === 'featured' ? highlightCount : batchSize));
        const sentinelRef = React.useRef(null);
        const [categoryDefinitions, setCategoryDefinitions] = React.useState(() => buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]));
        React.useEffect(() => {
            const abortController = new AbortController();
            const dataPath = `${basePath}assets/data/projects/projects-${localeKey}.json`;
            setIsLoading(true);
            setError(null);
            fetch(dataPath, { signal: abortController.signal })
                .then((response) => {
                if (!response.ok) {
                    throw new Error(`Cannot load ${dataPath} (${response.status})`);
                }
                return response.json();
            })
                .then((json) => {
                if (!Array.isArray(json)) {
                    throw new Error('Format data proyek tidak valid.');
                }
                setData(sortByNewest(json, (item) => item.dateAdded));
            })
                .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            })
                .finally(() => setIsLoading(false));
            return () => abortController.abort();
        }, [basePath, localeKey]);
        React.useEffect(() => {
            const path = `${basePath}assets/data/categories/projects/project-categories-${localeKey}.json`;
            const fallbackList = buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]);
            setCategoryDefinitions(fallbackList);
            fetch(path)
                .then((response) => {
                if (!response.ok) {
                    throw new Error('Cannot load categories');
                }
                return response.json();
            })
                .then((json) => setCategoryDefinitions(buildCategoryList(json, ALL_CATEGORY_LABEL[localeKey])))
                .catch(() => setCategoryDefinitions(fallbackList));
        }, [basePath, localeKey]);
        const filteredData = React.useMemo(() => {
            if (filter === '*')
                return data;
            return data.filter((item) => item.category === filter);
        }, [data, filter]);
        const featuredData = React.useMemo(() => {
            if (mode !== 'featured')
                return filteredData;
            const onlyFeatured = filteredData.filter((item) => item.isFeatured);
            return onlyFeatured.length > 0 ? onlyFeatured : filteredData;
        }, [filteredData, mode]);
        const highlightLimit = Number.isNaN(highlightCount) ? 3 : Math.max(1, highlightCount);
        const baseData = React.useMemo(() => {
            return mode === 'featured' ? featuredData.slice(0, highlightLimit) : featuredData;
        }, [featuredData, highlightLimit, mode]);
        const visibleData = React.useMemo(() => baseData.slice(0, visibleCount), [baseData, visibleCount]);
        const hasMore = visibleCount < baseData.length;
        React.useEffect(() => {
            const initialVisible = mode === 'featured' ? baseData.length : Math.min(batchSize, Math.max(baseData.length, 0)) || 0;
            setVisibleCount(initialVisible);
        }, [mode, batchSize, baseData.length, filter]);
        React.useEffect(() => {
            if (!hasMore)
                return;
            if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                setVisibleCount(baseData.length);
                return;
            }
            const sentinel = sentinelRef.current;
            if (!sentinel)
                return;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleCount((prev) => Math.min(prev + batchSize, baseData.length));
                    }
                });
            }, { rootMargin: '200px' });
            observer.observe(sentinel);
            return () => observer.disconnect();
        }, [hasMore, batchSize, baseData.length]);
        const categoryLabels = React.useMemo(() => {
            const map = {};
            categoryDefinitions.forEach((category) => {
                map[category.id] = category.label;
            });
            return map;
        }, [categoryDefinitions]);
        const availableCategories = React.useMemo(() => {
            const unique = new Set(data.map((item) => item.category).filter(Boolean));
            const result = [];
            const seen = new Set();
            categoryDefinitions.forEach((category) => {
                if (category.id === '*' || unique.has(category.id)) {
                    result.push(category);
                    seen.add(category.id);
                }
            });
            unique.forEach((id) => {
                if (!id || seen.has(id))
                    return;
                result.push({ id, label: categoryLabels[id] || id });
                seen.add(id);
            });
            if (!seen.has('*')) {
                result.unshift({ id: '*', label: ALL_CATEGORY_LABEL[localeKey] });
            }
            return result;
        }, [categoryDefinitions, categoryLabels, data, localeKey]);
        React.useEffect(() => {
            if (!availableCategories.some((category) => category.id === filter)) {
                setFilter('*');
            }
        }, [availableCategories, filter]);
        const CertificateImage = ({ item }) => {
            const [isPortrait, setIsPortrait] = React.useState(false);
            const handleLoad = (event) => {
                const img = event.currentTarget;
                if (img.naturalHeight > img.naturalWidth) {
                    setIsPortrait(true);
                }
            };
            const containerStyle = isPortrait
                ? { height: '240px', padding: '12px' }
                : { aspectRatio: '5 / 3' };
            return (React.createElement("div", { className: "w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center", style: containerStyle },
                React.createElement("img", { src: item.imageUrl, alt: item.title, loading: "lazy", className: "w-full h-full object-contain", onLoad: handleLoad })));
        };
        return (React.createElement("div", null,
            showFiltersProjects && (React.createElement("div", { className: "flex flex-wrap justify-center gap-3 mb-10", role: "group", "aria-label": "Project categories" }, availableCategories.map((category) => (React.createElement(FilterButton, { key: category.id, isActive: filter === category.id, onClick: () => setFilter(category.id) }, category.label))))),
            React.createElement("div", { className: gridClass, role: "list" },
                React.createElement(PortfolioGrid, { data: visibleData, isLoading: isLoading, error: error, labels: labels, renderCard: (item, index) => {
                        const shouldNavigate = mode === 'featured' && !!fullUrl;
                        const handleAction = () => {
                            if (shouldNavigate && fullUrl) {
                                window.location.href = fullUrl;
                                return;
                            }
                            setSelectedProject(item);
                        };
                        return (React.createElement(ProjectCard, { key: `${item.title}-${index}`, item: item, labels: labels, categoryLabels: categoryLabels, onAction: handleAction, asLink: shouldNavigate && fullUrl ? fullUrl : null, animationIndex: index }));
                    } })),
            hasMore && React.createElement("div", { ref: sentinelRef, className: "h-10 w-full", "aria-hidden": "true" }),
            mode === 'featured' && fullUrl && (React.createElement("div", { className: "text-center mt-10" },
                React.createElement("a", { href: fullUrl, className: "inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700" },
                    labels.viewAll,
                    React.createElement("i", { className: "fas fa-arrow-right" })))),
            selectedProject && (React.createElement(ProjectModal, { project: selectedProject, labels: labels, categoryLabels: categoryLabels, onClose: () => setSelectedProject(null) }))));
    };
    const CertificatesApp = () => {
        const container = document.getElementById('certificates-react-root');
        if (!container)
            return null;
        const locale = container.dataset.locale || 'id';
        const localeKey = normalizeLocale(locale);
        const basePath = container.dataset.basePath || '../';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';
        const batchSize = parsePositiveNumber(container.dataset.batchSize, 6);
        const gridColumns = container.dataset.gridColumns === '4' ? '4' : '3';
        const gridClass = gridColumns === '4'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        const labels = COMPONENT_LABELS[localeKey];
        const showFiltersCertificates = container.dataset.showFilters !== 'false';
        const [data, setData] = React.useState([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        const [visibleCount, setVisibleCount] = React.useState(() => (mode === 'featured' ? highlightCount : batchSize));
        const sentinelRef = React.useRef(null);
        const [categoryDefinitions, setCategoryDefinitions] = React.useState(() => buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]));
        React.useEffect(() => {
            const abortController = new AbortController();
            const dataPath = `${basePath}assets/data/certificates/certificates-${localeKey}.json`;
            setIsLoading(true);
            setError(null);
            fetch(dataPath, { signal: abortController.signal })
                .then((response) => {
                if (!response.ok) {
                    throw new Error(`Cannot load ${dataPath} (${response.status})`);
                }
                return response.json();
            })
                .then((json) => {
                if (!Array.isArray(json)) {
                    throw new Error('Format data sertifikat tidak valid.');
                }
                setData(sortByNewest(json, (item) => item.tanggalTerbit));
            })
                .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            })
                .finally(() => setIsLoading(false));
            return () => abortController.abort();
        }, [basePath, localeKey]);
        React.useEffect(() => {
            const path = `${basePath}assets/data/categories/certificates/certificate-categories-${localeKey}.json`;
            const fallbackList = buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]);
            setCategoryDefinitions(fallbackList);
            fetch(path)
                .then((response) => {
                if (!response.ok) {
                    throw new Error('Cannot load categories');
                }
                return response.json();
            })
                .then((json) => setCategoryDefinitions(buildCategoryList(json, ALL_CATEGORY_LABEL[localeKey])))
                .catch(() => setCategoryDefinitions(fallbackList));
        }, [basePath, localeKey]);
        const filteredData = React.useMemo(() => {
            if (filter === '*')
                return data;
            return data.filter((item) => item.category === filter);
        }, [data, filter]);
        const featuredData = React.useMemo(() => {
            if (mode !== 'featured')
                return filteredData;
            const onlyFeatured = filteredData.filter((item) => item.isFeatured);
            return onlyFeatured.length > 0 ? onlyFeatured : filteredData;
        }, [filteredData, mode]);
        const highlightLimit = Number.isNaN(highlightCount) ? 3 : Math.max(1, highlightCount);
        const baseData = React.useMemo(() => {
            return mode === 'featured' ? featuredData.slice(0, highlightLimit) : featuredData;
        }, [featuredData, highlightLimit, mode]);
        const visibleData = React.useMemo(() => baseData.slice(0, visibleCount), [baseData, visibleCount]);
        const hasMore = visibleCount < baseData.length;
        React.useEffect(() => {
            const initialVisible = mode === 'featured' ? baseData.length : Math.min(batchSize, Math.max(baseData.length, 0)) || 0;
            setVisibleCount(initialVisible);
        }, [mode, batchSize, baseData.length, filter]);
        React.useEffect(() => {
            if (!hasMore)
                return;
            if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                setVisibleCount(baseData.length);
                return;
            }
            const sentinel = sentinelRef.current;
            if (!sentinel)
                return;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleCount((prev) => Math.min(prev + batchSize, baseData.length));
                    }
                });
            }, { rootMargin: '200px' });
            observer.observe(sentinel);
            return () => observer.disconnect();
        }, [hasMore, batchSize, baseData.length]);
        const availableCategories = React.useMemo(() => {
            const unique = new Set(data.map((item) => item.category).filter(Boolean));
            const result = [];
            const seen = new Set();
            categoryDefinitions.forEach((category) => {
                if (category.id === '*' || unique.has(category.id)) {
                    result.push(category);
                    seen.add(category.id);
                }
            });
            unique.forEach((id) => {
                var _a;
                if (!id || seen.has(id))
                    return;
                result.push({ id, label: ((_a = categoryDefinitions.find((cat) => cat.id === id)) === null || _a === void 0 ? void 0 : _a.label) || id });
                seen.add(id);
            });
            if (!seen.has('*')) {
                result.unshift({ id: '*', label: ALL_CATEGORY_LABEL[localeKey] });
            }
            return result;
        }, [categoryDefinitions, data, localeKey]);
        React.useEffect(() => {
            if (!availableCategories.some((category) => category.id === filter)) {
                setFilter('*');
            }
        }, [availableCategories, filter]);
        const CertificateImage = ({ item }) => {
            const [isPortrait, setIsPortrait] = React.useState(false);
            const handleLoad = (event) => {
                const img = event.currentTarget;
                const isImagePortrait = img.naturalHeight > img.naturalWidth;
                setIsPortrait(isImagePortrait);
            };
            const containerStyle = {
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '1414 / 1000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };
            const portraitBgStyle = isPortrait
                ? {
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(12px)',
                    transform: 'scale(1.1)',
                    opacity: 0.25,
                }
                : {};
            const imgStyle = isPortrait
                ? {
                    position: 'relative',
                    height: '100%',
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                }
                : {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                };
            return (React.createElement("div", { className: "w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800", style: containerStyle },
                isPortrait && React.createElement("div", { style: portraitBgStyle, "aria-hidden": "true" }),
                React.createElement("img", { src: item.imageUrl, alt: item.title, loading: "lazy", style: imgStyle, onLoad: handleLoad })));
        };
        return (React.createElement("div", null,
            showFiltersCertificates && (React.createElement("div", { className: "flex flex-wrap justify-center gap-3 mb-10", role: "group", "aria-label": "Certificate categories" }, availableCategories.map((category) => (React.createElement(FilterButton, { key: category.id, isActive: filter === category.id, onClick: () => setFilter(category.id) }, category.label))))),
            React.createElement("div", { className: gridClass, role: "list" },
                React.createElement(PortfolioGrid, { data: visibleData, isLoading: isLoading, error: error, labels: labels, renderCard: (item, index) => {
                        const detailUrl = (item.link && item.link !== '#') ? item.link : item.fullImageUrl || item.imageUrl;
                        const Wrapper = detailUrl ? 'a' : 'div';
                        const wrapperProps = detailUrl
                            ? { href: detailUrl, target: '_blank', rel: 'noopener noreferrer' }
                            : { role: 'article' };
                        return (React.createElement(Wrapper, { key: `${item.title}-${index}`, className: "card flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-800 card-appear", style: { '--card-index': index }, ...wrapperProps },
                            React.createElement(CertificateImage, { item: item }),
                            React.createElement("div", { className: "p-5 flex flex-col flex-grow gap-2" },
                                React.createElement("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-2" }, item.title),
                                React.createElement("p", { className: "text-sm text-gray-700 dark:text-gray-300 flex-grow" }, item.description),
                                React.createElement("div", { className: "mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1" },
                                    item.tanggalTerbit && (React.createElement("p", null,
                                        React.createElement("span", { className: "font-semibold" }, labels.issued),
                                        " ",
                                        item.tanggalTerbit)),
                                    item.tanggalKadaluarsa && (React.createElement("p", null,
                                        React.createElement("span", { className: "font-semibold" }, labels.expires),
                                        " ",
                                        item.tanggalKadaluarsa))))));
                    } })),
            hasMore && React.createElement("div", { ref: sentinelRef, className: "h-10 w-full", "aria-hidden": "true" }),
            mode === 'featured' && fullUrl && (React.createElement("div", { className: "text-center mt-10" },
                React.createElement("a", { href: fullUrl, className: "inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700" },
                    labels.viewAll,
                    React.createElement("i", { className: "fas fa-arrow-right" }))))));
    };
    const initializeApp = () => {
        const projectContainer = document.getElementById('portfolio-react-root');
        if (projectContainer) {
            const root = ReactDOMClient.createRoot(projectContainer);
            root.render(React.createElement(ProjectsApp));
        }
        const certificateContainer = document.getElementById('certificates-react-root');
        if (certificateContainer) {
            const root = ReactDOMClient.createRoot(certificateContainer);
            root.render(React.createElement(CertificatesApp));
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    }
    else {
        initializeApp();
    }
})();
