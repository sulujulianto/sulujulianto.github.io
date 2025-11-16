'use strict';
(function () {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('React atau ReactDOM tidak tersedia.');
        return;
    }

    type LocaleKey = 'id' | 'en' | 'jp' | 'cn';

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
        isFeatured?: boolean;
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

    const normalizeLocale = (value?: string): LocaleKey => {
        const locale = (value || 'id').toLowerCase();
        if (locale === 'ja' || locale === 'jp') return 'jp';
        if (locale === 'zh' || locale === 'cn') return 'cn';
        if (locale === 'en') return 'en';
        return 'id';
    };

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
        jp: {
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
        cn: {
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

    const PROJECT_CATEGORIES: Record<LocaleKey, Record<string, string>> = {
        id: { '*': 'Semua', frontend: 'Front-End', backend: 'Back-End', fullstack: 'Full-Stack' },
        en: { '*': 'All', frontend: 'Front-End', backend: 'Back-End', fullstack: 'Full-Stack' },
        jp: { '*': 'すべて', frontend: 'フロントエンド', backend: 'バックエンド', fullstack: 'フルスタック' },
        cn: { '*': '全部', frontend: '前端', backend: '后端', fullstack: '全栈' },
    };

    const CERTIFICATE_CATEGORIES: Record<LocaleKey, Record<string, string>> = {
        id: {
            '*': 'Semua',
            programming: 'Pemrograman',
            'web-development': 'Pengembangan Web',
            'ai-data': 'AI, Data & Cloud',
            networking: 'Jaringan',
        },
        en: {
            '*': 'All',
            programming: 'Programming',
            'web-development': 'Web Development',
            'ai-data': 'AI, Data & Cloud',
            networking: 'Networking',
        },
        jp: {
            '*': 'すべて',
            programming: 'プログラミング',
            'web-development': 'ウェブ開発',
            'ai-data': 'AI・データ・クラウド',
            networking: 'ネットワーク',
        },
        cn: {
            '*': '全部',
            programming: '编程',
            'web-development': '网页开发',
            'ai-data': 'AI·数据·云',
            networking: '网络',
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
        onClick: () => void;
    }> = ({ item, labels, categoryLabels, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className="card flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left bg-white/70 dark:bg-slate-800"
        >
            <div className="w-full h-48 overflow-hidden">
                <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300 font-semibold mb-2">
                    {item.category && (categoryLabels[item.category] || item.category)}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 flex-grow">{item.description}</p>
                {item.techStack && item.techStack.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">{labels.techStack}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.techStack.join(', ')}</p>
                    </div>
                )}
            </div>
        </button>
    );

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

        const locale = container.dataset.locale || 'id';
        const localeKey = normalizeLocale(locale);
        const basePath = container.dataset.basePath || '../';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';
        const showFiltersProjects = container.dataset.showFilters !== 'false';

        const labels = COMPONENT_LABELS[localeKey];
        const categories = PROJECT_CATEGORIES[localeKey];

        const [data, setData] = React.useState<ProjectItem[]>([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);
        const [selectedProject, setSelectedProject] = React.useState<ProjectItem | null>(null);

        React.useEffect(() => {
            const dataPath = `${basePath}assets/data/projects/projects-${localeKey}.json`;
            setIsLoading(true);
            setError(null);
            fetch(dataPath)
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
                    setData(sortByNewest(json, (item) => item.dateAdded));
                })
                .catch((err) => setError(err.message))
                .finally(() => setIsLoading(false));
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
        const displayData = mode === 'featured' ? featuredData.slice(0, highlightLimit) : featuredData;

        const availableCategories = React.useMemo(() => {
            if (data.length === 0) return { '*': categories['*'] };
            const unique = new Set(data.map((item) => item.category).filter(Boolean) as string[]);
            const entries = Object.entries(categories).filter(([key]) => key === '*' || unique.has(key));
            return Object.fromEntries(entries);
        }, [data, categories]);

        return (
            <div>
                {showFiltersProjects && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10" role="group" aria-label="Project categories">
                        {Object.entries(availableCategories).map(([key, value]) => (
                            <FilterButton key={key} isActive={filter === key} onClick={() => setFilter(key)}>
                                {value}
                            </FilterButton>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    <PortfolioGrid
                        data={displayData}
                        isLoading={isLoading}
                        error={error}
                        labels={labels}
                        renderCard={(item, index) => (
                            <ProjectCard
                                key={`${item.title}-${index}`}
                                item={item}
                                labels={labels}
                                categoryLabels={categories}
                                onClick={() => setSelectedProject(item)}
                            />
                        )}
                    />
                </div>

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
                        categoryLabels={categories}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </div>
        );
    };

    const CertificatesApp: React.FC = () => {
        const container = document.getElementById('certificates-react-root');
        if (!container) return null;

        const locale = container.dataset.locale || 'id';
        const localeKey = normalizeLocale(locale);
        const basePath = container.dataset.basePath || '../';
        const mode = (container.dataset.mode || 'featured').toLowerCase();
        const highlightCount = Number(container.dataset.highlightCount || '3');
        const fullUrl = container.dataset.fullUrl || '';

        const labels = COMPONENT_LABELS[localeKey];
        const categories = CERTIFICATE_CATEGORIES[localeKey];
        const showFiltersCertificates = container.dataset.showFilters !== 'false';

        const [data, setData] = React.useState<CertificateItem[]>([]);
        const [filter, setFilter] = React.useState('*');
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
            const dataPath = `${basePath}assets/data/certificates/certificates-${localeKey}.json`;
            setIsLoading(true);
            setError(null);
            fetch(dataPath)
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
                    setData(sortByNewest(json, (item) => item.tanggalTerbit));
                })
                .catch((err) => setError(err.message))
                .finally(() => setIsLoading(false));
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
        const displayData = mode === 'featured' ? featuredData.slice(0, highlightLimit) : featuredData;

        const availableCategories = React.useMemo(() => {
            if (data.length === 0) return { '*': categories['*'] };
            const unique = new Set(data.map((item) => item.category).filter(Boolean) as string[]);
            const entries = Object.entries(categories).filter(([key]) => key === '*' || unique.has(key));
            return Object.fromEntries(entries);
        }, [data, categories]);

        return (
            <div>
                {showFiltersCertificates && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10" role="group" aria-label="Certificate categories">
                        {Object.entries(availableCategories).map(([key, value]) => (
                            <FilterButton key={key} isActive={filter === key} onClick={() => setFilter(key)}>
                                {value}
                            </FilterButton>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    <PortfolioGrid
                        data={displayData}
                        isLoading={isLoading}
                        error={error}
                        labels={labels}
                        renderCard={(item, index) => (
                            <a
                                key={`${item.title}-${index}`}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-800"
                            >
                                <div className="w-full h-48 overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 flex-grow">{item.description}</p>
                                    <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                        {item.tanggalTerbit && (
                                            <p><span className="font-semibold">{labels.issued}</span> {item.tanggalTerbit}</p>
                                        )}
                                        {item.tanggalKadaluarsa && (
                                            <p><span className="font-semibold">{labels.expires}</span> {item.tanggalKadaluarsa}</p>
                                        )}
                                    </div>
                                </div>
                            </a>
                        )}
                    />
                </div>

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

    const initializeApp = () => {
        const projectContainer = document.getElementById('portfolio-react-root');
        if (projectContainer) {
            const root = ReactDOM.createRoot(projectContainer);
            root.render(React.createElement(ProjectsApp));
        }

        const certificateContainer = document.getElementById('certificates-react-root');
        if (certificateContainer) {
            const root = ReactDOM.createRoot(certificateContainer);
            root.render(React.createElement(CertificatesApp));
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
