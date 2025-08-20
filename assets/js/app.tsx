'use strict';
(function() {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error("Error: React atau ReactDOM tidak ditemukan. Pastikan CDN sudah benar.");
        return;
    }
    interface DataItem {
        title: string;
        description: string;
        category?: string;
        imageUrl: string;
        link: string;
        tanggalTerbit?: string;
        tanggalKadaluarsa?: string;
        techStack?: string[];
    }

    interface LocalizedLabels {
        [key: string]: {
            issued: string;
            expires: string;
            techStack: string;
            loading: string;
            error: string;
            showMore: string;
            showLess: string;
        };
    }

    interface CategoryLabels {
        [key: string]: {
            [category: string]: string;
        };
    }

    const COMPONENT_LABELS: LocalizedLabels = {
        // Indonesian (Default)
        id: {
            issued: "Diberikan pada:",
            expires: "Berlaku sampai:",
            techStack: "Teknologi",
            loading: "Memuat...",
            error: "Error:",
            showMore: "Lihat Selengkapnya",
            showLess: "Lihat Lebih Sedikit"
        },
        // English
        en: {
            issued: "Issued on:",
            expires: "Valid until:",
            techStack: "Tech Stack",
            loading: "Loading...",
            error: "Error:",
            showMore: "Show More",
            showLess: "Show Less"
        },
        // Japanese
        jp: {
            issued: "発行日:",
            expires: "有効期限:",
            techStack: "技術スタック",
            loading: "読み込み中...",
            error: "エラー:",
            showMore: "もっと見る",
            showLess: "少なく表示"
        },
        // Chinese (Simplified)
        cn: {
            issued: "颁发于:",
            expires: "有效期至:",
            techStack: "技术栈",
            loading: "加载中...",
            error: "错误:",
            showMore: "查看更多",
            showLess: "收起"
        }
    };

    /** Kategori Proyek - Multibahasa */
    const PROJECT_CATEGORIES: CategoryLabels = {
        id: {
            '*': 'Semua',
            'frontend': 'Front-End',
            'backend': 'Back-End',
            'fullstack': 'Full-Stack'
        },
        en: {
            '*': 'All',
            'frontend': 'Front-End',
            'backend': 'Back-End',
            'fullstack': 'Full-Stack'
        },
        jp: {
            '*': 'すべて',
            'frontend': 'フロントエンド',
            'backend': 'バックエンド',
            'fullstack': 'フルスタック'
        },
        cn: {
            '*': '全部',
            'frontend': '前端',
            'backend': '后端',
            'fullstack': '全栈'
        }
    };

    /** Kategori Sertifikat - Multibahasa */
    const CERTIFICATE_CATEGORIES: CategoryLabels = {
        id: {
            '*': 'Semua',
            'programming': 'Pemrograman',
            'web-development': 'Pengembangan Web',
            'ai-data': 'AI, Data Science & Cloud',
            'networking': 'Jaringan'
        },
        en: {
            '*': 'All',
            'programming': 'Programming',
            'web-development': 'Web Development',
            'ai-data': 'AI, Data Science & Cloud',
            'networking': 'Networking'
        },
        jp: {
            '*': 'すべて',
            'programming': 'プログラミング',
            'web-development': 'ウェブ開発',
            'ai-data': 'AI・データサイエンス・クラウド',
            'networking': 'ネットワーキング'
        },
        cn: {
            '*': '全部',
            'programming': '编程',
            'web-development': '网页开发',
            'ai-data': 'AI、数据科学和云计算',
            'networking': '网络'
        }
    };

    const resolveLocalizedLabels = (locale: string, labelSet: LocalizedLabels | CategoryLabels): any => {
        switch(locale.toLowerCase()) {
            case 'ja':
            case 'jp':
                return labelSet['jp'];
            case 'cn':
            case 'zh':
                return labelSet['cn'];
            case 'en':
                return labelSet['en'];
            default:
                return labelSet['id'];
        }
    };

    interface CardProps extends DataItem {
        isDownloadable?: boolean;
        locale?: string;
    }

    interface FilterButtonProps {
        isActive: boolean;
        onClick: () => void;
        children: React.ReactNode;
    }

    interface PortfolioGridProps {
        data: DataItem[];
        isLoading: boolean;
        error: string | null;
        locale: string;
        isDownloadable?: boolean;
        showAll?: boolean;
        onShowMore?: () => void;
        onShowLess?: () => void;
        maxInitialItems?: number;
    }

    interface ShowMoreButtonProps {
        onClick: () => void;
        children: React.ReactNode;
        showAll: boolean;
    }

    const Card: React.FC<CardProps> = ({ 
        title, 
        description, 
        imageUrl, 
        link, 
        tanggalTerbit, 
        tanggalKadaluarsa, 
        techStack, 
        isDownloadable = false, 
        locale = 'id' 
    }) => {
        // Dapatkan labels sesuai locale
        const labels = resolveLocalizedLabels(locale, COMPONENT_LABELS);

        return (
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                {...(isDownloadable && { download: true })}
                className="card flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gray-100 dark:bg-gray-800"
                aria-label={`${title} - ${description}`}
            >
                {/* Gambar */}
                <div className="w-full h-48 flex-shrink-0 overflow-hidden">
                    <img 
                        src={imageUrl} 
                        alt={title}
                        loading="lazy"
                    /> 
                </div>

                {/* Konten */}
                <div className="p-4 flex flex-col flex-grow">
                    {/* Judul */}
                    <h3 className="text-md font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">
                        {title}
                    </h3>
                    
                    {/* Deskripsi */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {description}
                    </p>
                    
                    <div className="flex-grow"></div>
                    
                    {/* Metadata */}
                    <div className="mt-4 pt-4 space-y-3">
                        {/* Tech Stack */}
                        {techStack && techStack.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                    {labels.techStack}
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {techStack.join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Informasi Tanggal */}
                        {(tanggalTerbit || tanggalKadaluarsa) && (
                            <div className="space-y-1">
                                {tanggalTerbit && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">{labels.issued}</span> {tanggalTerbit}
                                    </p>
                                )}
                                {tanggalKadaluarsa && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">{labels.expires}</span> {tanggalKadaluarsa}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </a>
        );
    };

    /** 
     * Komponen FilterButton - Tombol filter kategori
     */
    const FilterButton: React.FC<FilterButtonProps> = ({ isActive, onClick, children }) => (
        <button 
            onClick={onClick} 
            className={`
                filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm 
                transition-all duration-300 border-2
                ${isActive 
                    ? 'filter-btn-active bg-blue-500 text-white border-blue-500 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                }
            `}
            aria-pressed={isActive}
            type="button"
        >
            {children}
        </button>
    );

    /** 
     * Komponen ShowMoreButton - Tombol untuk menampilkan lebih banyak/sedikit item
     */
    const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({ onClick, children, showAll }) => (
        <div className="col-span-full flex justify-center mt-8">
            <button
                onClick={onClick}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                type="button"
            >
                {children}
            </button>
        </div>
    );

    /** 
     * Komponen PortfolioGrid - Menampilkan grid portfolio dengan loading & error states
     */
    const PortfolioGrid: React.FC<PortfolioGridProps> = ({ 
        data, 
        isLoading, 
        error, 
        locale, 
        isDownloadable = false,
        showAll = true,
        onShowMore,
        onShowLess,
        maxInitialItems = 3
    }) => {
        // Dapatkan labels sesuai locale
        const labels = resolveLocalizedLabels(locale, COMPONENT_LABELS);

        // Loading state
        if (isLoading) {
            return (
                <div className="text-center col-span-full py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{labels.loading}</p>
                </div>
            );
        }

        // Error state
        if (error) {
            return (
                <div className="text-center text-red-500 col-span-full py-12">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                        <p className="font-semibold">{labels.error}</p>
                        <p className="text-sm mt-2 text-red-600 dark:text-red-400">{error}</p>
                    </div>
                </div>
            );
        }

        // Empty state
        if (data.length === 0) {
            return (
                <div className="text-center col-span-full py-12">
                    <p className="text-gray-500 dark:text-gray-400">No items found.</p>
                </div>
            );
        }

        // Tentukan data yang akan ditampilkan
        const displayData = showAll ? data : data.slice(0, maxInitialItems);
        const hasMoreItems = data.length > maxInitialItems;

        return (
            <>
                {/* Render portfolio items */}
                {displayData.map((item, index) => (
                    <Card 
                        key={`${item.title}-${index}`} 
                        {...item} 
                        locale={locale} 
                        isDownloadable={isDownloadable}
                    />
                ))}

                {/* Show More/Less Button - hanya untuk certificates */}
                {!showAll && hasMoreItems && onShowMore && (
                    <ShowMoreButton onClick={onShowMore} showAll={showAll}>
                        {labels.showMore} ({data.length - maxInitialItems} lainnya)
                    </ShowMoreButton>
                )}

                {showAll && hasMoreItems && onShowLess && (
                    <ShowMoreButton onClick={onShowLess} showAll={showAll}>
                        {labels.showLess}
                    </ShowMoreButton>
                )}
            </>
        );
    };

    /**
     * Aplikasi Utama
     */

    /** 
     * ProjectsApp - Aplikasi untuk menampilkan proyek dengan filter kategori
     */
    const ProjectsApp: React.FC = () => {
        // State management
        const [data, setData] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        // Ambil locale dari DOM
        const container = document.getElementById('portfolio-react-root');
        const locale = container?.dataset.locale || 'id';
        
        // Dapatkan kategori sesuai locale
        const categories = resolveLocalizedLabels(locale, PROJECT_CATEGORIES);

        /** Load data proyek berdasarkan locale */
        React.useEffect(() => {
            const dataPath = `../assets/data/projects/projects-${locale}.json`;
            
            setIsLoading(true);
            setError(null);
            
            fetch(dataPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Projects JSON file (${dataPath}) not found. Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((fetchedData: DataItem[]) => {
                    // Validasi struktur data
                    if (!Array.isArray(fetchedData)) {
                        throw new Error('Format data tidak valid: Expected array');
                    }
                    setData(fetchedData);
                })
                .catch(err => {
                    console.error('Gagal memuat data proyek:', err);
                    setError(err.message);
                })
                .finally(() => setIsLoading(false));
        }, [locale]);

        /** Filter data berdasarkan kategori yang dipilih */
        const filteredData = React.useMemo(() => {
            return filter === '*' ? data : data.filter(item => item.category === filter);
        }, [data, filter]);

        /** Generate kategori yang tersedia berdasarkan data */
        const availableCategories = React.useMemo(() => {
            if (data.length === 0) return { '*': categories['*'] };
            
            const uniqueCategories = new Set(data.map(item => item.category).filter(Boolean));
            const categoryEntries = Object.entries(categories).filter(([key]) => 
                key === '*' || uniqueCategories.has(key)
            );
            return Object.fromEntries(categoryEntries);
        }, [data, categories]);

        return (
            <div className="portfolio-container">
                {/* Filter Kategori */}
                <div className="flex justify-center flex-wrap gap-3 mb-12" role="group" aria-label="Project categories">
                    {Object.entries(availableCategories).map(([key, value]) => (
                        <FilterButton 
                            key={key} 
                            isActive={filter === key}
                            onClick={() => setFilter(key)}
                        >
                            {value}
                        </FilterButton>
                    ))}
                </div>

                {/* Grid Portfolio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    <PortfolioGrid 
                        data={filteredData}
                        isLoading={isLoading}
                        error={error}
                        locale={locale}
                        isDownloadable={false}
                        showAll={true}
                    />
                </div>
            </div>
        );
    };
    const CertificatesApp: React.FC = () => {
        // State management
        const [data, setData] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);
        const [showAll, setShowAll] = React.useState<boolean>(false);

        // Ambil locale dari DOM
        const container = document.getElementById('certificates-react-root');
        const locale = container?.dataset.locale || 'id';
        
        // Dapatkan kategori sesuai locale
        const categories = resolveLocalizedLabels(locale, CERTIFICATE_CATEGORIES);

        /** Load data sertifikat berdasarkan locale */
        React.useEffect(() => {
            const dataPath = `../assets/data/certificates/certificates-${locale}.json`;
            
            setIsLoading(true);
            setError(null);
            
            fetch(dataPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Certificates JSON file (${dataPath}) not found. Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((fetchedData: DataItem[]) => {
                    // Validate data structure
                    if (!Array.isArray(fetchedData)) {
                        throw new Error('Invalid data format: Expected array of certificates');
                    }
                    setData(fetchedData);
                })
                .catch(err => {
                    console.error('Failed to load certificates data:', err);
                    setError(err.message);
                })
                .finally(() => setIsLoading(false));
        }, [locale]);

        /** Reset showAll saat filter berubah */
        React.useEffect(() => {
            setShowAll(false);
        }, [filter]);
        const filteredData = React.useMemo(() => {
            return filter === '*' ? data : data.filter(item => item.category === filter);
        }, [data, filter]);
        const availableCategories = React.useMemo(() => {
            if (data.length === 0) return { '*': categories['*'] };
            
            const uniqueCategories = new Set(data.map(item => item.category).filter(Boolean));
            const categoryEntries = Object.entries(categories).filter(([key]) => 
                key === '*' || uniqueCategories.has(key)
            );
            return Object.fromEntries(categoryEntries);
        }, [data, categories]);

        /** Handler untuk show more */
        const handleShowMore = () => {
            setShowAll(true);
        };

        /** Handler untuk show less */
        const handleShowLess = () => {
            setShowAll(false);
            // Scroll ke atas section certificates
            const certificatesSection = document.getElementById('certificates-react-root');
            if (certificatesSection) {
                certificatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        return (
            <div className="certificates-container">
                {/* Category Filter Section */}
                <div className="flex justify-center flex-wrap gap-3 mb-12" role="group" aria-label="Certificate categories">
                    {Object.entries(availableCategories).map(([key, value]) => (
                        <FilterButton 
                            key={key} 
                            isActive={filter === key}
                            onClick={() => setFilter(key)}
                        >
                            {value}
                        </FilterButton>
                    ))}
                </div>

                {/* Certificates Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    <PortfolioGrid 
                        data={filteredData}
                        isLoading={isLoading}
                        error={error}
                        locale={locale}
                        isDownloadable={true}
                        showAll={showAll}
                        onShowMore={handleShowMore}
                        onShowLess={handleShowLess}
                        maxInitialItems={3}
                    />
                </div>
            </div>
        );
    };
    const initializeApp = (): void => {
        try {
            // Initialize Projects App
            const projectContainer = document.getElementById('portfolio-react-root');
            if (projectContainer) {
                const projectRoot = ReactDOM.createRoot(projectContainer);
                projectRoot.render(React.createElement(ProjectsApp));
                console.log('Projects app initialized successfully');
            }

            // Initialize Certificates App
            const certificatesContainer = document.getElementById('certificates-react-root');
            if (certificatesContainer) {
                const certificatesRoot = ReactDOM.createRoot(certificatesContainer);
                certificatesRoot.render(React.createElement(CertificatesApp));
                console.log('Certificates app initialized successfully');
            }
        } catch (error) {
            console.error('Failed to initialize applications:', error);
        }
    };

    // Initialize applications when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();