/// <reference types="react" />
/// <reference types="react-dom" />

(function () {
    'use strict';
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React atau ReactDOM tidak tersedia.');
        return;
    }
    const ReactDOMClient = ReactDOM as unknown as typeof import('react-dom/client');

    type LocaleKey = 'id' | 'en' | 'ja' | 'zh';

    type PortfolioLocaleEvent = CustomEvent<{ locale: LocaleKey }>;

    type PortfolioRuntimeWindow = typeof window & {
        PortfolioUiReady?: Promise<void>;
    };

    interface ProjectItem {
        title: string;
        description: string;
        category?: string;
        imageUrl: string;
        githubUrl?: string;
        liveUrl?: string;
        techStack?: string[];
        dateAdded?: string;
        modalDescription?: string;
        isFeatured?: boolean;
    }

    interface CertificateItem {
        title: string;
        description: string;
        category?: string;
        imageUrl: string;
        link: string;
        tanggalTerbit?: string;
        tanggalKadaluarsa?: string;
        fullImageUrl?: string;
        isFeatured?: boolean;
    }

    interface AboutImageItem {
        src: string;
        alt?: string;
        caption?: string;
    }

    interface TimelineItem {
        id: string;
        start: string;
        end?: string | null;
        title: string;
        organization: string;
        location: string;
        description?: string;
        highlights?: string[];
        links?: Array<{
            label: string;
            url: string;
        }>;
    }

    interface HistoryData {
        experience: TimelineItem[];
        educationAndTraining: TimelineItem[];
    }

    interface HistoryLabels {
        experience: string;
        educationAndTraining: string;
        emptyExperience: string;
        emptyEducationAndTraining: string;
        unavailable: string;
        present: string;
        gallery: string;
    }

    interface ComponentLabels {
        issued: string;
        expires: string;
        techStack: string;
        loading: string;
        error: string;
        empty: string;
        viewAll: string;
        modalClose: string;
        modalGithub: string;
        modalPreview: string;
    }

    interface CategoryDefinition {
        id: string;
        label: string;
    }

    const ALL_CATEGORY_LABEL: Record<LocaleKey, string> = {
        id: 'Semua',
        en: 'All',
        ja: 'すべて',
        zh: '全部',
    };

    const buildCategoryList = (list: CategoryDefinition[] | undefined, fallbackLabel: string): CategoryDefinition[] => {
        const fallback: CategoryDefinition = { id: '*', label: fallbackLabel };
        const seen = new Set<string>();
        const cleaned: CategoryDefinition[] = [];
        if (Array.isArray(list)) {
            list.forEach((item) => {
                if (!item || typeof item.id !== 'string' || typeof item.label !== 'string') return;
                const id = item.id.trim();
                if (!id || seen.has(id)) return;
                cleaned.push({ id, label: item.label });
                seen.add(id);
            });
        }
        const withoutFallback = cleaned.filter((cat) => cat.id !== fallback.id);
        return [fallback, ...withoutFallback];
    };

    const normalizeLocale = (value?: string): LocaleKey => {
        const locale = (value || 'id').toLowerCase();
        if (locale === 'ja' || locale === 'jp') return 'ja';
        if (locale === 'zh' || locale === 'cn') return 'zh';
        if (locale === 'en') return 'en';
        return 'id';
    };

    const usePortfolioLocale = (container: HTMLElement | null): LocaleKey => {
        const [locale, setLocale] = React.useState<LocaleKey>(() => normalizeLocale(container?.dataset.locale));

        React.useEffect(() => {
            const handleLocaleChange = (event: Event) => {
                const localeEvent = event as PortfolioLocaleEvent;
                setLocale(normalizeLocale(localeEvent.detail?.locale));
            };
            document.addEventListener('portfolio:localechange', handleLocaleChange);
            return () => document.removeEventListener('portfolio:localechange', handleLocaleChange);
        }, []);

        return locale;
    };

    const resolveAssetUrl = (value?: string): string => {
        if (!value) return '';
        if (/^(?:https?:|data:|blob:|#|\/)/i.test(value)) return value;
        const rootRelative = value.replace(/^(?:\.\.\/)+/, '').replace(/^\.\//, '');
        return new URL(rootRelative, document.baseURI).toString();
    };

    const isDisplayableItem = (item: { title?: string }) => {
        return typeof item.title === 'string' && item.title.trim() !== '';
    };

    const normalizeProjectAssets = (item: ProjectItem): ProjectItem => ({
        ...item,
        imageUrl: resolveAssetUrl(item.imageUrl),
    });

    const normalizeCertificateAssets = (item: CertificateItem): CertificateItem => ({
        ...item,
        imageUrl: resolveAssetUrl(item.imageUrl),
        fullImageUrl: resolveAssetUrl(item.fullImageUrl),
    });

    const COMPONENT_LABELS: Record<LocaleKey, ComponentLabels> = {
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

    const HISTORY_LABELS: Record<LocaleKey, HistoryLabels> = {
        id: {
            experience: 'Pengalaman',
            educationAndTraining: 'Pendidikan & Pelatihan',
            emptyExperience: 'Belum ada data pengalaman.',
            emptyEducationAndTraining: 'Belum ada data pendidikan dan pelatihan.',
            unavailable: 'Riwayat belum dapat ditampilkan.',
            present: 'Sekarang',
            gallery: 'Galeri Tentang Saya',
        },
        en: {
            experience: 'Experience',
            educationAndTraining: 'Education & Training',
            emptyExperience: 'No experience data yet.',
            emptyEducationAndTraining: 'No education or training data yet.',
            unavailable: 'History is currently unavailable.',
            present: 'Present',
            gallery: 'About Me gallery',
        },
        ja: {
            experience: '職歴',
            educationAndTraining: '学歴・職業訓練',
            emptyExperience: '職歴データはまだありません。',
            emptyEducationAndTraining: '学歴・職業訓練のデータはまだありません。',
            unavailable: '経歴を現在表示できません。',
            present: '現在',
            gallery: 'プロフィールギャラリー',
        },
        zh: {
            experience: '工作经历',
            educationAndTraining: '教育与培训',
            emptyExperience: '暂无工作经历数据。',
            emptyEducationAndTraining: '暂无教育或培训数据。',
            unavailable: '暂时无法显示个人经历。',
            present: '至今',
            gallery: '关于我图片集',
        },
    };

    const parseDate = (value?: string): number => {
        if (!value) return 0;
        const timestamp = Date.parse(value);
        if (!Number.isNaN(timestamp)) return timestamp;
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
            const [a, b, c] = parts;
            const normalized = `${c}-${b}-${a}`;
            const fallback = Date.parse(normalized);
            if (!Number.isNaN(fallback)) return fallback;
        }
        return 0;
    };

    const sortByNewest = <T,>(items: T[], getter: (item: T) => string | undefined) => {
        return [...items].sort((a, b) => parseDate(getter(b)) - parseDate(getter(a)));
    };

    const localeCode: Record<LocaleKey, string> = {
        id: 'id-ID',
        en: 'en-US',
        ja: 'ja-JP',
        zh: 'zh-CN',
    };

    const formatMonthYear = (value: string, locale: LocaleKey) => {
        if (/^\d{4}$/.test(value)) return value;

        const match = /^(\d{4})-(\d{2})$/.exec(value);
        if (!match) return value;

        const year = Number(match[1]);
        const month = Number(match[2]);
        if (month < 1 || month > 12) return value;

        return new Intl.DateTimeFormat(localeCode[locale], {
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(Date.UTC(year, month - 1, 1)));
    };

    const sortTimeline = (items: TimelineItem[]) => {
        const dateValue = (value: string) => parseDate(`${value.length === 4 ? `${value}-01` : value}-01`);
        return [...items].sort((a, b) => {
            const difference = dateValue(b.start) - dateValue(a.start);
            return difference !== 0 ? difference : a.title.localeCompare(b.title);
        });
    };

    const normalizeTimelineItems = (items: TimelineItem[] | undefined) => {
        if (!Array.isArray(items)) return [];
        return items.filter(
            (item) =>
                item &&
                typeof item.id === 'string' &&
                item.id.trim() !== '' &&
                typeof item.start === 'string' &&
                /^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/.test(item.start) &&
                typeof item.title === 'string' &&
                item.title.trim() !== '' &&
                typeof item.organization === 'string' &&
                item.organization.trim() !== '' &&
                typeof item.location === 'string' &&
                item.location.trim() !== '',
        );
    };

    const readJson = async <T,>(url: string, signal?: AbortSignal): Promise<T> => {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
    };

    const parsePositiveNumber = (value: string | undefined, fallback: number) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    };

    const FilterButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
        <button
            type="button"
            onClick={onClick}
            className={`filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-all duration-300 border-2 ${
                isActive
                    ? 'filter-btn-active bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
            }`}
            aria-pressed={isActive}
        >
            {children}
        </button>
    );

    const PortfolioGrid = <T,>({
        data,
        isLoading,
        error,
        labels,
        renderCard,
    }: {
        data: T[];
        isLoading: boolean;
        error: string | null;
        labels: ComponentLabels;
        renderCard: (item: T, index: number) => React.ReactNode;
    }) => {
        if (isLoading) {
            return (
                <div className="text-center col-span-full py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{labels.loading}</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="col-span-full">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-600 dark:text-red-300">
                        <p className="font-semibold mb-1">{labels.error}</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                    {labels.empty}
                </div>
            );
        }

        return <>{data.map((item, index) => renderCard(item, index))}</>;
    };

    const ProjectCard: React.FC<{
        item: ProjectItem;
        labels: ComponentLabels;
        categoryLabels: Record<string, string>;
        onAction: () => void;
        animationIndex: number;
        asLink?: string | null;
    }> = ({ item, labels, categoryLabels, onAction, animationIndex, asLink = null }) => {
        const className =
            'card h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left bg-white/70 dark:bg-slate-800 card-appear';

        const imageBlock = (
            <div
                className="w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                style={{ aspectRatio: '16 / 9', maxHeight: '210px' }}
            >
                <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-contain" />
            </div>
        );

        const body = (
            <div className="p-5 flex flex-col flex-grow gap-2">
                <div className="flex items-center text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold mb-2">
                    {item.category && (categoryLabels[item.category] || item.category)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-grow">{item.description}</p>
                {item.techStack && item.techStack.length > 0 && (
                    <div className="mt-2">
                        <p className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white mb-1">{labels.techStack}</p>
                        <p className="text-sm font-normal text-gray-700 dark:text-gray-300">{item.techStack.join(', ')}</p>
                    </div>
                )}
            </div>
        );

        if (asLink) {
            return (
                <a
                    href={asLink}
                    className={className}
                    style={{ '--card-index': animationIndex } as React.CSSProperties}
                    onClick={onAction}
                >
                    {imageBlock}
                    {body}
                </a>
            );
        }

        return (
            <button
                type="button"
                onClick={onAction}
                className={className}
                style={{ '--card-index': animationIndex } as React.CSSProperties}
            >
                {imageBlock}
                {body}
            </button>
        );
    };

    const ProjectModal: React.FC<{
        project: ProjectItem;
        labels: ComponentLabels;
        categoryLabels: Record<string, string>;
        onClose: () => void;
    }> = ({ project, labels, categoryLabels, onClose }) => {
        React.useEffect(() => {
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }, [onClose]);

        const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        };

        const detailedDescription = project.modalDescription || project.description;

        return (
            <div
                className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-4"
                onClick={handleBackdrop}
            >
                <article className="project-modal">
                    <header className="project-modal__header">
                        <div>
                            {project.category && (
                                <span className="project-modal__badge">
                                    {categoryLabels[project.category] || project.category}
                                </span>
                            )}
                            <h3 className="project-modal__title">{project.title}</h3>
                        </div>
                        <button type="button" onClick={onClose} aria-label={labels.modalClose} className="project-modal__close">
                            <i className="fas fa-times"></i>
                        </button>
                    </header>

                    <div className="project-modal__content">
                        <div className="project-modal__image">
                            <img src={project.imageUrl} alt={project.title} />
                        </div>

                        <div className="project-modal__body">
                            <p className="project-modal__description">{detailedDescription}</p>

                            {project.techStack && project.techStack.length > 0 && (
                                <div>
                                    <p className="project-modal__label">{labels.techStack}</p>
                                    <p className="project-modal__tech">{project.techStack.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="project-modal__actions">
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-modal__btn project-modal__btn--secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fab fa-github"></i>
                                <span>{labels.modalGithub}</span>
                            </a>
                        )}
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-modal__btn project-modal__btn--primary"
                                style={{ textDecoration: 'none' }}
                            >
                                <i className="fas fa-external-link-alt"></i>
                                <span>{labels.modalPreview}</span>
                            </a>
                        )}
                        <button type="button" onClick={onClose} className="project-modal__btn project-modal__btn--ghost">
                            <i className="fas fa-times"></i>
                            <span>{labels.modalClose}</span>
                        </button>
                    </div>
                </article>
            </div>
        );
    };

    const ProjectsApp: React.FC = () => {
        const container = document.getElementById('portfolio-react-root');
        if (!container) return null;

        const localeKey = usePortfolioLocale(container);
        const basePath = container.dataset.basePath || './';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';
        const showFiltersProjects = container.dataset.showFilters !== 'false';
        const batchSize = parsePositiveNumber(container.dataset.batchSize, 6);
        const gridColumns = container.dataset.gridColumns === '4' ? '4' : '3';
        const gridClass =
            gridColumns === '4'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

        const labels = COMPONENT_LABELS[localeKey];

        const [data, setData] = React.useState<ProjectItem[]>([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);
        const [selectedProject, setSelectedProject] = React.useState<ProjectItem | null>(null);
        const [visibleCount, setVisibleCount] = React.useState(() => (mode === 'featured' ? highlightCount : batchSize));
        const sentinelRef = React.useRef<HTMLDivElement | null>(null);
        const [categoryDefinitions, setCategoryDefinitions] = React.useState<CategoryDefinition[]>(() =>
            buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey])
        );

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
                .then((json: ProjectItem[]) => {
                    if (!Array.isArray(json)) {
                        throw new Error('Format data proyek tidak valid.');
                    }
                    const displayable = json.filter(isDisplayableItem).map(normalizeProjectAssets);
                    setData(sortByNewest(displayable, (item) => item.dateAdded));
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
            const abortController = new AbortController();
            const path = `${basePath}assets/data/categories/projects/project-categories-${localeKey}.json`;
            const fallbackList = buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]);
            setCategoryDefinitions(fallbackList);
            fetch(path, { signal: abortController.signal })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Cannot load categories');
                    }
                    return response.json();
                })
                .then((json: CategoryDefinition[]) => setCategoryDefinitions(buildCategoryList(json, ALL_CATEGORY_LABEL[localeKey])))
                .catch((error) => {
                    if (error.name !== 'AbortError') setCategoryDefinitions(fallbackList);
                });
            return () => abortController.abort();
        }, [basePath, localeKey]);

        const filteredData = React.useMemo(() => {
            if (filter === '*') return data;
            return data.filter((item) => item.category === filter);
        }, [data, filter]);

        const featuredData = React.useMemo(() => {
            if (mode !== 'featured') return filteredData;
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
            if (!hasMore) return;

            if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                setVisibleCount(baseData.length);
                return;
            }

            const sentinel = sentinelRef.current;
            if (!sentinel) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setVisibleCount((prev) => Math.min(prev + batchSize, baseData.length));
                        }
                    });
                },
                { rootMargin: '200px' }
            );

            observer.observe(sentinel);
            return () => observer.disconnect();
        }, [hasMore, batchSize, baseData.length]);

        const categoryLabels = React.useMemo(() => {
            const map: Record<string, string> = {};
            categoryDefinitions.forEach((category) => {
                map[category.id] = category.label;
            });
            return map;
        }, [categoryDefinitions]);

        const availableCategories = React.useMemo(() => {
            const unique = new Set(data.map((item) => item.category).filter(Boolean) as string[]);
            const result: CategoryDefinition[] = [];
            const seen = new Set<string>();

            categoryDefinitions.forEach((category) => {
                if (category.id === '*' || unique.has(category.id)) {
                    result.push(category);
                    seen.add(category.id);
                }
            });

            unique.forEach((id) => {
                if (!id || seen.has(id)) return;
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

        const CertificateImage: React.FC<{ item: CertificateItem }> = ({ item }) => {
            const [isPortrait, setIsPortrait] = React.useState(false);

            const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
                const img = event.currentTarget;
                if (img.naturalHeight > img.naturalWidth) {
                    setIsPortrait(true);
                }
            };

            const containerStyle = isPortrait
                ? { height: '240px', padding: '12px' }
                : { aspectRatio: '5 / 3' };

            return (
                <div
                    className="w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    style={containerStyle}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onLoad={handleLoad}
                    />
                </div>
            );
        };

        return (
            <div>
                {showFiltersProjects && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10" role="group" aria-label="Project categories">
                        {availableCategories.map((category) => (
                            <FilterButton key={category.id} isActive={filter === category.id} onClick={() => setFilter(category.id)}>
                                {category.label}
                            </FilterButton>
                        ))}
                    </div>
                )}

                <div className={gridClass} role="list">
                    <PortfolioGrid
                        data={visibleData}
                        isLoading={isLoading}
                        error={error}
                        labels={labels}
                        renderCard={(item, index) => {
                            const shouldNavigate = mode === 'featured' && !!fullUrl;
                            const handleAction = () => {
                                if (shouldNavigate && fullUrl) {
                                    window.location.href = fullUrl;
                                    return;
                                }
                                setSelectedProject(item);
                            };

                            return (
                                <ProjectCard
                                    key={`${item.title}-${index}`}
                                    item={item}
                                    labels={labels}
                                    categoryLabels={categoryLabels}
                                    onAction={handleAction}
                                    asLink={shouldNavigate && fullUrl ? fullUrl : null}
                                    animationIndex={index}
                                />
                            );
                        }}
                    />
                </div>
                {hasMore && <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true"></div>}

                {mode === 'featured' && fullUrl && (
                    <div className="text-center mt-10">
                        <a
                            href={fullUrl}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700"
                        >
                            {labels.viewAll}
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                )}

                {selectedProject && (
                    <ProjectModal
                        project={selectedProject}
                        labels={labels}
                        categoryLabels={categoryLabels}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </div>
        );
    };

    const CertificatesApp: React.FC = () => {
        const container = document.getElementById('certificates-react-root');
        if (!container) return null;

        const localeKey = usePortfolioLocale(container);
        const basePath = container.dataset.basePath || './';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';
        const batchSize = parsePositiveNumber(container.dataset.batchSize, 6);
        const gridColumns = container.dataset.gridColumns === '4' ? '4' : '3';
        const gridClass =
            gridColumns === '4'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

        const labels = COMPONENT_LABELS[localeKey];
        const showFiltersCertificates = container.dataset.showFilters !== 'false';

        const [data, setData] = React.useState<CertificateItem[]>([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);
        const [visibleCount, setVisibleCount] = React.useState(() => (mode === 'featured' ? highlightCount : batchSize));
        const sentinelRef = React.useRef<HTMLDivElement | null>(null);
        const [categoryDefinitions, setCategoryDefinitions] = React.useState<CategoryDefinition[]>(() =>
            buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey])
        );

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
                .then((json: CertificateItem[]) => {
                    if (!Array.isArray(json)) {
                        throw new Error('Format data sertifikat tidak valid.');
                    }
                    const displayable = json.filter(isDisplayableItem).map(normalizeCertificateAssets);
                    setData(sortByNewest(displayable, (item) => item.tanggalTerbit));
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
            const abortController = new AbortController();
            const path = `${basePath}assets/data/categories/certificates/certificate-categories-${localeKey}.json`;
            const fallbackList = buildCategoryList(undefined, ALL_CATEGORY_LABEL[localeKey]);
            setCategoryDefinitions(fallbackList);
            fetch(path, { signal: abortController.signal })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Cannot load categories');
                    }
                    return response.json();
                })
                .then((json: CategoryDefinition[]) => setCategoryDefinitions(buildCategoryList(json, ALL_CATEGORY_LABEL[localeKey])))
                .catch((error) => {
                    if (error.name !== 'AbortError') setCategoryDefinitions(fallbackList);
                });
            return () => abortController.abort();
        }, [basePath, localeKey]);

        const filteredData = React.useMemo(() => {
            if (filter === '*') return data;
            return data.filter((item) => item.category === filter);
        }, [data, filter]);

        const featuredData = React.useMemo(() => {
            if (mode !== 'featured') return filteredData;
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
            if (!hasMore) return;

            if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
                setVisibleCount(baseData.length);
                return;
            }

            const sentinel = sentinelRef.current;
            if (!sentinel) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setVisibleCount((prev) => Math.min(prev + batchSize, baseData.length));
                        }
                    });
                },
                { rootMargin: '200px' }
            );

            observer.observe(sentinel);
            return () => observer.disconnect();
        }, [hasMore, batchSize, baseData.length]);

        const availableCategories = React.useMemo(() => {
            const unique = new Set(data.map((item) => item.category).filter(Boolean) as string[]);
            const result: CategoryDefinition[] = [];
            const seen = new Set<string>();

            categoryDefinitions.forEach((category) => {
                if (category.id === '*' || unique.has(category.id)) {
                    result.push(category);
                    seen.add(category.id);
                }
            });

            unique.forEach((id) => {
                if (!id || seen.has(id)) return;
                result.push({ id, label: categoryDefinitions.find((cat) => cat.id === id)?.label || id });
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

        const CertificateImage: React.FC<{ item: CertificateItem }> = ({ item }) => {
            const [isPortrait, setIsPortrait] = React.useState(false);

            const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
                const img = event.currentTarget;
                const isImagePortrait = img.naturalHeight > img.naturalWidth;
                setIsPortrait(isImagePortrait);
            };

            const containerStyle: React.CSSProperties = {
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '1414 / 1000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };

            const portraitBgStyle: React.CSSProperties = isPortrait
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

            const imgStyle: React.CSSProperties = isPortrait
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

            return (
                <div className="w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800" style={containerStyle}>
                    {isPortrait && <div style={portraitBgStyle} aria-hidden="true"></div>}
                    <img src={item.imageUrl} alt={item.title} loading="lazy" style={imgStyle} onLoad={handleLoad} />
                </div>
            );
        };

        return (
            <div>
                {showFiltersCertificates && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10" role="group" aria-label="Certificate categories">
                        {availableCategories.map((category) => (
                            <FilterButton key={category.id} isActive={filter === category.id} onClick={() => setFilter(category.id)}>
                                {category.label}
                            </FilterButton>
                        ))}
                    </div>
                )}

                <div className={gridClass} role="list">
                    <PortfolioGrid
                        data={visibleData}
                        isLoading={isLoading}
                        error={error}
                        labels={labels}
                        renderCard={(item, index) => {
                            const detailUrl = (item.link && item.link !== '#') ? item.link : item.fullImageUrl || item.imageUrl;
                            const Wrapper: React.ElementType = detailUrl ? 'a' : 'div';
                            const wrapperProps = detailUrl
                                ? { href: detailUrl, target: '_blank', rel: 'noopener noreferrer' }
                                : { role: 'article' };

                            return (
                                <Wrapper
                                    key={`${item.title}-${index}`}
                                    className="card flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-800 card-appear"
                                    style={{ '--card-index': index } as React.CSSProperties}
                                    {...wrapperProps}
                                >
                                    <CertificateImage item={item} />
                                    <div className="p-5 flex flex-col flex-grow gap-2">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex-grow">{item.description}</p>
                                        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                            {item.tanggalTerbit && (
                                                <p>
                                                    <span className="font-semibold">{labels.issued}</span> {item.tanggalTerbit}
                                                </p>
                                            )}
                                            {item.tanggalKadaluarsa && (
                                                <p>
                                                    <span className="font-semibold">{labels.expires}</span> {item.tanggalKadaluarsa}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Wrapper>
                            );
                        }}
                    />
                </div>
                {hasMore && <div ref={sentinelRef} className="h-10 w-full" aria-hidden="true"></div>}

                {mode === 'featured' && fullUrl && (
                    <div className="text-center mt-10">
                        <a
                            href={fullUrl}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700"
                        >
                            {labels.viewAll}
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                )}
            </div>
        );
    };

    const AboutGalleryApp: React.FC = () => {
        const container = document.getElementById('about-gallery-root');
        const locale = usePortfolioLocale(container);
        const basePath = container?.dataset.basePath || './';
        const labels = HISTORY_LABELS[locale];
        const [images, setImages] = React.useState<AboutImageItem[]>([]);

        React.useEffect(() => {
            const abortController = new AbortController();
            readJson<{ images?: AboutImageItem[] }>(`${basePath}assets/data/about/about-images.json`, abortController.signal)
                .then((result) => {
                    const validImages = Array.isArray(result.images)
                        ? result.images.filter((item) => item && typeof item.src === 'string' && item.src.trim())
                        : [];
                    setImages(validImages);
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') console.error('Gagal memuat galeri Tentang Saya.', error);
                });

            return () => abortController.abort();
        }, [basePath]);

        if (images.length === 0) return null;

        return (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-8" aria-label={labels.gallery}>
                {images.map((image, index) => (
                    <figure key={`${image.src}-${index}`} className="min-w-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-md">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src={`${basePath}${image.src.replace(/^\.\//, '')}`}
                                alt={image.alt || `${labels.gallery} ${index + 1}`}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        {image.caption && <figcaption className="px-3 py-2 text-xs sm:text-sm text-left">{image.caption}</figcaption>}
                    </figure>
                ))}
            </div>
        );
    };

    const HistoryApp: React.FC = () => {
        const container = document.getElementById('history-react-root');
        const locale = usePortfolioLocale(container);
        const basePath = container?.dataset.basePath || './';
        const labels = HISTORY_LABELS[locale];
        const [activeTab, setActiveTab] = React.useState<'experience' | 'educationAndTraining'>('experience');
        const [openItemId, setOpenItemId] = React.useState<string | null>(null);
        const [data, setData] = React.useState<HistoryData>({ experience: [], educationAndTraining: [] });
        const [isLoading, setIsLoading] = React.useState(true);
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
            const abortController = new AbortController();
            setIsLoading(true);
            setOpenItemId(null);

            Promise.all([
                readJson<TimelineItem[]>(
                    `${basePath}assets/data/history/experience/experience-${locale}.json`,
                    abortController.signal,
                ),
                readJson<TimelineItem[]>(
                    `${basePath}assets/data/history/education-and-training/education-and-training-${locale}.json`,
                    abortController.signal,
                ),
            ])
                .then(([experience, educationAndTraining]) => {
                    setData({
                        experience: normalizeTimelineItems(experience),
                        educationAndTraining: normalizeTimelineItems(educationAndTraining),
                    });
                    setHasError(false);
                })
                .catch((error) => {
                    if (error.name === 'AbortError') return;
                    console.error('Gagal memuat data riwayat.', error);
                    setHasError(true);
                })
                .finally(() => {
                    if (!abortController.signal.aborted) setIsLoading(false);
                });

            return () => abortController.abort();
        }, [basePath, locale]);

        React.useEffect(() => {
            setOpenItemId(null);
        }, [activeTab]);

        const items = React.useMemo(() => sortTimeline(data[activeTab]), [activeTab, data]);
        const groupedItems = React.useMemo(() => {
            const groups = new Map<string, TimelineItem[]>();
            items.forEach((item) => {
                const year = item.start.slice(0, 4);
                groups.set(year, [...(groups.get(year) || []), item]);
            });
            return [...groups.entries()].map(([year, yearItems]) => ({ year, items: yearItems }));
        }, [items]);
        const panelId = `history-${activeTab}-panel`;

        return (
            <div className="card w-full overflow-hidden rounded-2xl p-5 sm:p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist" aria-label="History">
                    {(['experience', 'educationAndTraining'] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                id={`history-${tab}-tab`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`history-${tab}-panel`}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-lg px-3 py-3 text-sm sm:text-base font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-transparent text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span style={isActive ? { color: '#ffffff' } : undefined}>{labels[tab]}</span>
                            </button>
                        );
                    })}
                </div>

                <div
                    id={panelId}
                    role="tabpanel"
                    aria-labelledby={`history-${activeTab}-tab`}
                    className="mt-5 sm:mt-8"
                >
                    {isLoading && <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">&hellip;</p>}
                    {!isLoading && hasError && (
                        <p className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {labels.unavailable}
                        </p>
                    )}
                    {!isLoading && !hasError && items.length === 0 && (
                        <p className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {activeTab === 'experience' ? labels.emptyExperience : labels.emptyEducationAndTraining}
                        </p>
                    )}
                    {!isLoading && !hasError && items.length > 0 && (
                        <div className="history-timeline">
                            {groupedItems.map((group) => (
                                <section
                                    key={group.year}
                                    className="history-year-group"
                                    aria-labelledby={`history-year-${activeTab}-${group.year}`}
                                >
                                    <h3 id={`history-year-${activeTab}-${group.year}`} className="history-year-heading">
                                        {group.year}
                                    </h3>
                                    <div className="history-year-items">
                                        {group.items.map((item) => {
                                            const isOpen = openItemId === item.id;
                                            const detailId = `history-detail-${activeTab}-${item.id}`;
                                            const hasDetails = Boolean(
                                                item.description || item.highlights?.length || item.links?.length,
                                            );

                                            return (
                                                <article key={item.id} className="history-entry">
                                                    <span className="history-entry-dot" aria-hidden="true"></span>
                                                    <button
                                                        type="button"
                                                        className="history-entry-summary"
                                                        aria-expanded={hasDetails ? isOpen : undefined}
                                                        aria-controls={hasDetails ? detailId : undefined}
                                                        disabled={!hasDetails}
                                                        onClick={() => hasDetails && setOpenItemId(isOpen ? null : item.id)}
                                                    >
                                                        <span className="history-entry-date">
                                                            {formatMonthYear(item.start, locale)} &ndash;{' '}
                                                            {item.end ? formatMonthYear(item.end, locale) : labels.present}
                                                        </span>
                                                        <span className="history-entry-main">
                                                            <span className="history-entry-copy">
                                                                <span className="history-entry-title">{item.title}</span>
                                                                <span className="history-entry-organization">{item.organization}</span>
                                                                <span className="history-entry-location">{item.location}</span>
                                                            </span>
                                                            {hasDetails && (
                                                                <i
                                                                    className={`fas fa-chevron-down history-entry-chevron ${isOpen ? 'is-open' : ''}`}
                                                                    aria-hidden="true"
                                                                ></i>
                                                            )}
                                                        </span>
                                                    </button>
                                                    {hasDetails && (
                                                        <div id={detailId} className="history-entry-details" hidden={!isOpen}>
                                                            {item.description && <p>{item.description}</p>}
                                                            {item.highlights && item.highlights.length > 0 && (
                                                                <ul>
                                                                    {item.highlights.map((highlight, index) => (
                                                                        <li key={`${item.id}-highlight-${index}`}>{highlight}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {item.links && item.links.length > 0 && (
                                                                <div className="history-entry-links">
                                                                    {item.links.map((link) => (
                                                                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                                                                            <i className="fab fa-github" aria-hidden="true"></i>
                                                                            <span>{link.label}</span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const initializeApp = () => {
        const aboutGalleryContainer = document.getElementById('about-gallery-root');
        if (aboutGalleryContainer) {
            const root = ReactDOMClient.createRoot(aboutGalleryContainer);
            root.render(React.createElement(AboutGalleryApp));
        }

        const historyContainer = document.getElementById('history-react-root');
        if (historyContainer) {
            const root = ReactDOMClient.createRoot(historyContainer);
            root.render(React.createElement(HistoryApp));
        }

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

    const startApp = () => {
        const ready = (window as PortfolioRuntimeWindow).PortfolioUiReady;
        if (ready) {
            void ready.finally(initializeApp);
            return;
        }
        initializeApp();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
