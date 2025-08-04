'use strict';
/// <reference types="react" />
/// <reference types="react-dom" />

(function() {

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error("Kesalahan Kritis: Gagal memuat library React atau ReactDOM. Pastikan link CDN di HTML Anda benar dan ada koneksi internet.");
        return;
    }

    interface DataItem {
        title: string;
        description: string;
        category?: string;
        imageUrl: string;
        link: string;
    }

    const Card = ({ title, description, imageUrl, link, isDownloadable = false }: DataItem & { isDownloadable?: boolean }) => (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          {...(isDownloadable && { download: true })}
          className="card block overflow-hidden rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="flex flex-col h-full">
                <div className="w-full h-48 sm:h-56">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" /> 
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-md font-bold mb-2 text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
                </div>
            </div>
        </a>
    );

    const ProjectsApp = () => {
        const [data, setData] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        const container = document.getElementById('portfolio-react-root');
        const locale = container?.dataset.locale || 'id';

        const projectCategories = {
            id: { '*': 'Semua', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack' },
            en: { '*': 'All', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack' },
            jp: { '*': 'すべて', 'frontend': 'フロントエンド', 'backend': 'バックエンド', 'fullstack': 'フルスタック' },
            cn: { '*': '全部', 'frontend': '前端', 'backend': '后端', 'fullstack': '全栈' },
        };
        const categories = projectCategories[locale as keyof typeof projectCategories] || projectCategories.id;

        React.useEffect(() => {
            const dataPath = `../assets/data/projects/projects-${locale}.json`;
            fetch(dataPath)
                .then(response => {
                    if (!response.ok) throw new Error(`File JSON proyek (${dataPath}) tidak ditemukan.`);
                    return response.json();
                })
                .then((fetchedData: DataItem[]) => setData(fetchedData))
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(false));
        }, [locale]);

        const filteredData = filter === '*' ? data : data.filter(p => p.category === filter);

        return (
            <div>
                <div className="flex justify-center flex-wrap gap-3 mb-12">
                    {Object.entries(categories).map(([key, value]) => (
                        <button key={key} onClick={() => setFilter(key)} className={`filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors duration-300 ${filter === key ? 'filter-btn-active' : ''}`}>{value}</button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && <p className="text-center col-span-full">Memuat proyek...</p>}
                    {error && <p className="text-center text-red-500 col-span-full">Error: {error}</p>}
                    {!isLoading && !error && filteredData.map((item, index) => <Card key={`${item.title}-${index}`} {...item} />)}
                </div>
            </div>
        );
    };
    
    const CertificatesApp = () => {
        const [data, setData] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        const container = document.getElementById('certificates-react-root');
        const locale = container?.dataset.locale || 'id';
        
        const certificateCategories = {
            id: { '*': 'Semua', 'programming': 'Pemrograman', 'web-development': 'Pengembangan Web', 'cyber-security': 'Keamanan Siber', 'networking': 'Jaringan' },
            en: { '*': 'All', 'programming': 'Programming', 'web-development': 'Web Development', 'cyber-security': 'Cyber Security', 'networking': 'Networking' },
            jp: { '*': 'すべて', 'programming': 'プログラミング', 'web-development': 'ウェブ開発', 'cyber-security': 'サイバーセキュリティ', 'networking': 'ネットワーキング' },
            cn: { '*': '全部', 'programming': '编程', 'web-development': '网页开发', 'cyber-security': '网络安全', 'networking': '网络' },
        };
        const categories = certificateCategories[locale as keyof typeof certificateCategories] || certificateCategories.id;

        React.useEffect(() => {
            const dataPath = `../assets/data/certificates/certificates-${locale}.json`;
            fetch(dataPath)
                .then(response => {
                    if (!response.ok) throw new Error(`File JSON sertifikat (${dataPath}) tidak ditemukan.`);
                    return response.json();
                })
                .then((fetchedData: DataItem[]) => setData(fetchedData))
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(false));
        }, [locale]);
        
        const filteredData = filter === '*' ? data : data.filter(c => c.category === filter);

        return (
            <div>
                <div className="flex justify-center flex-wrap gap-3 mb-12">
                    {Object.entries(categories).map(([key, value]) => (
                        <button key={key} onClick={() => setFilter(key)} className={`filter-btn px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors duration-300 ${filter === key ? 'filter-btn-active' : ''}`}>{value}</button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && <p className="text-center col-span-full">Memuat sertifikat...</p>}
                    {error && <p className="text-center text-red-500 col-span-full">Error: {error}</p>}
                    {!isLoading && !error && filteredData.map((item, index) => <Card key={`${item.title}-${index}`} {...item} isDownloadable={true} />)}
                </div>
            </div>
        );
    };

    const projectContainer = document.getElementById('portfolio-react-root');
    if (projectContainer) {
        const root = ReactDOM.createRoot(projectContainer);
        root.render(React.createElement(ProjectsApp));
    }

    const certificatesContainer = document.getElementById('certificates-react-root');
    if (certificatesContainer) {
        const root = ReactDOM.createRoot(certificatesContainer);
        root.render(React.createElement(CertificatesApp));
    }
})();