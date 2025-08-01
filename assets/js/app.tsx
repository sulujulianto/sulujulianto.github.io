'use strict';

// DEKLARASI GLOBAL UNTUK REACT DAN REACTDOM
// Ini memberitahu TypeScript bahwa 'React' dan 'ReactDOM' akan ada sebagai variabel global.
declare global {
    var React: typeof import('react');
    var ReactDOM: {
        createRoot(container: Element | DocumentFragment): {
            render(children: React.ReactNode): void;
            unmount(): void;
        };
        render(element: React.ReactElement, container: Element | DocumentFragment, callback?: () => void): React.Component;
    };
}

(function() { // Awal IIFE, untuk mencegah redeklarasi
    
    // 1. Definisi Antarmuka (Interface) untuk Objek Proyek dan Sertifikat
    interface DataItem {
        title: string;
        description: string;
        imageUrl: string;
        link: string;
        category?: string; // Menambahkan kategori sebagai opsional
    }

    // 2. Komponen Fungsional untuk Merender Kartu
    const Card = ({ title, description, imageUrl, link, index, isDownloadable }: DataItem & { index: number, isDownloadable: boolean }) => (
        <a href={link} key={index} 
           target="_blank" 
           download={isDownloadable} 
           rel="noopener noreferrer"   
           className="card block overflow-hidden rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col h-full">
                <div className="w-full h-36">
                    <img src={imageUrl} alt={title} 
                         className="w-full h-full object-cover" 
                         loading="lazy" /> 
                </div>
                <div className="p-4 flex-grow">
                    <h3 className="text-md font-bold mb-1 text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </div>
        </a>
    );

    // 3. Komponen Fungsional untuk Menangani Proyek: ProjectsApp
    const ProjectsApp = () => {
        const [projects, setProjects] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        const projectsContainer = document.getElementById('portfolio-react-root');
        const locale = projectsContainer?.dataset.locale || 'id';

        const getLocalizedCategories = (currentLocale: string) => {
            switch (currentLocale) {
                case 'id':
                    return { 
                        '*': 'Semua', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack'
                    };
                case 'en':
                    return { 
                        '*': 'All', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack'
                    };
                case 'jp':
                    return { 
                        '*': 'すべて', 'frontend': 'フロントエンド', 'backend': 'バックエンド', 'fullstack': 'フルスタック'
                    };
                case 'cn':
                    return { 
                        '*': '全部', 'frontend': '前端', 'backend': '后端', 'fullstack': '全栈'
                    };
                default:
                    return { 
                        '*': 'All', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack'
                    };
            }
        };
        const categories: Record<string, string> = getLocalizedCategories(locale);

        React.useEffect(() => {
            setIsLoading(true);
            setError(null);      
            const projectDataPath = `../assets/data/projects/projects-${locale}.json`;
            fetch(projectDataPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Gagal memuat data: Status HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then((data: DataItem[]) => { setProjects(data); })
                .catch(err => {
                    console.error(`Error loading project data for locale '${locale}':`, err);
                    setError(`Gagal memuat proyek. (${err.message}).`);
                })
                .finally(() => { setIsLoading(false); });
        }, [locale]);

        const filteredProjects = filter === '*' ? projects : projects.filter((p: DataItem) => p.category === filter);

        return (
            <div>
                <div className="flex justify-center flex-wrap gap-3 mb-12">
                    {Object.keys(categories).map((key: string) => ( 
                        <button 
                            key={key} 
                            onClick={() => setFilter(key)} 
                            className={`filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors duration-300 ${filter === key ? 'filter-btn-active' : ''}`}
                        >
                            {categories[key]} 
                        </button>
                    ))}
                </div>
                <div className="project-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {isLoading && <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Memuat proyek...</p>}
                    {error && <p className="text-center text-red-600 dark:text-red-400 col-span-full">Error: {error} Silakan coba lagi nanti.</p>}
                    {!isLoading && !error && filteredProjects.length === 0 && <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Tidak ada proyek yang tersedia untuk kategori ini.</p>}
                    {!isLoading && !error && filteredProjects.length > 0 && (
                        filteredProjects.map((project: DataItem, index: number) => ( <Card key={index} {...project} index={index} isDownloadable={false} /> ))
                    )}
                </div>
            </div>
        );
    };

    // 4. Komponen Fungsional untuk Sertifikat: CertificatesApp
    const CertificatesApp = () => {
        const [certificates, setCertificates] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        const certificatesContainer = document.getElementById('certificates-react-root');
        const locale = certificatesContainer?.dataset.locale || 'id';

        const getLocalizedCategories = (currentLocale: string) => {
            switch (currentLocale) {
                case 'id':
                    return { 
                        '*': 'Semua', 'programming': 'Pemrograman', 'web-development': 'Pengembangan Web',
                        'cyber-security': 'Keamanan Siber', 'networking': 'Jaringan'
                    };
                case 'en':
                    return { 
                        '*': 'All', 'programming': 'Programming', 'web-development': 'Web Development',
                        'cyber-security': 'Cyber Security', 'networking': 'Networking'
                    };
                case 'jp':
                    return { 
                        '*': 'すべて', 'programming': 'プログラミング', 'web-development': 'ウェブ開発',
                        'cyber-security': 'サイバーセキュリティ', 'networking': 'ネットワーキング'
                    };
                case 'cn':
                    return { 
                        '*': '全部', 'programming': '编程', 'web-development': '网页开发',
                        'cyber-security': '网络安全', 'networking': '网络'
                    };
                default:
                    return { 
                        '*': 'All', 'programming': 'Programming', 'web-development': 'Web Development',
                        'cyber-security': 'Cyber Security', 'networking': 'Networking'
                    };
            }
        };
        const categories: Record<string, string> = getLocalizedCategories(locale);

        React.useEffect(() => {
            setIsLoading(true);
            setError(null);      
            const certificatesDataPath = `../assets/data/certificates/certificates-${locale}.json`;
            fetch(certificatesDataPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Gagal memuat data: Status HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then((data: DataItem[]) => { setCertificates(data); })
                .catch(err => {
                    console.error(`Error loading certificates data for locale '${locale}':`, err);
                    setError(`Gagal memuat sertifikat. (${err.message}).`);
                })
                .finally(() => { setIsLoading(false); });
        }, [locale]);
        
        const filteredCertificates = filter === '*' ? certificates : certificates.filter((cert: DataItem) => cert.category === filter);

        return (
            <div>
                <div className="flex justify-center flex-wrap gap-3 mb-12">
                    {Object.keys(categories).map((key: string) => ( 
                        <button 
                            key={key} 
                            onClick={() => setFilter(key)} 
                            className={`filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors duration-300 ${filter === key ? 'filter-btn-active' : ''}`}
                        >
                            {categories[key]} 
                        </button>
                    ))}
                </div>
                <div className="certificate-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {isLoading && <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Memuat sertifikat...</p>}
                    {error && <p className="text-center text-red-600 dark:text-red-400 col-span-full">Error: {error} Silakan coba lagi nanti.</p>}
                    {!isLoading && !error && filteredCertificates.length === 0 && <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Tidak ada sertifikat yang tersedia untuk kategori ini.</p>}
                    {!isLoading && !error && filteredCertificates.length > 0 && (
                        filteredCertificates.map((cert: DataItem, index: number) => ( <Card key={index} {...cert} index={index} isDownloadable={true} /> ))
                    )}
                </div>
            </div>
        );
    };

    // Ini adalah pola inisialisasi yang lebih aman untuk React
    function initializeReactApp(containerId, AppComponent) {
        const container = document.getElementById(containerId);
        if (container) {
            if (!container._reactRoot) {
                container._reactRoot = ReactDOM.createRoot(container);
            }
            container._reactRoot.render(React.createElement(AppComponent));
        } else {
            console.error(`Error: Elemen dengan ID '${containerId}' tidak ditemukan di HTML.`);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        initializeReactApp('portfolio-react-root', ProjectsApp);
        initializeReactApp('certificates-react-root', CertificatesApp);
    });
})();