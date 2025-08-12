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
        tanggalTerbit?: string;
        tanggalKadaluarsa?: string;
        techStack?: string[];
    }

    const Card = ({ title, description, imageUrl, link, tanggalTerbit, tanggalKadaluarsa, techStack, isDownloadable = false, locale = 'id' }: DataItem & { isDownloadable?: boolean, locale?: string }) => {

        const componentLabels = {
            id: {
                issued: "Diberikan pada:",
                expires: "Berlaku sampai:",
                techStack: "Tech Stack"
            },
            en: {
                issued: "Issued on:",
                expires: "Valid until:",
                techStack: "Tech Stack"
            },
            jp: {
                issued: "発行日:",
                expires: "有効期限:",
                techStack: "技術スタック"
            },
            cn: {
                issued: "颁发于:",
                expires: "有效期至:",
                techStack: "技术栈"
            }
        };

        const labels = componentLabels[locale as keyof typeof componentLabels] || componentLabels.id;

        return (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              {...(isDownloadable && { download: true })}
              className="card flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800"
            >
                {/* 1. BAGIAN GAMBAR */}
                <div className="w-full h-48 flex-shrink-0">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" loading="lazy" /> 
                </div>

                {/* 2. BAGIAN ISI KARTU */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-md font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
                    
                    <div className="flex-grow"></div> 
                    
                    {/* 3. AREA BAWAH */}
                    <div className="mt-4 pt-4">
                        
                        {/* Tech Stack untuk Proyek (dengan label dinamis) */}
                        {techStack && techStack.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">{labels.techStack}</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {techStack.join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Tanggal untuk Sertifikat (dengan label dinamis) */}
                        {(tanggalTerbit || tanggalKadaluarsa) && (
                            <div className="space-y-1">
                                <p className="text-sm text-gray-700 dark:text-gray-300 h-5">
                                    {tanggalTerbit ? `${labels.issued} ${tanggalTerbit}` : ''}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 h-5">
                                    {tanggalKadaluarsa ? `${labels.expires} ${tanggalKadaluarsa}` : ''}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </a>
        );
    };

    const ProjectsApp = () => {
        const [data, setData] = React.useState<DataItem[]>([]);
        const [filter, setFilter] = React.useState<string>('*');
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [error, setError] = React.useState<string | null>(null);

        const container = document.getElementById('portfolio-react-root');
        const locale = container?.dataset.locale || 'id';

        const projectCategories = {
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
            },
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
                    {/* MODIFIKASI: Mengirim `locale` ke komponen Card */}
                    {!isLoading && !error && filteredData.map((item, index) => <Card key={`${item.title}-${index}`} {...item} locale={locale} />)}
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
                'cyber-security': 'Cyber Security',
                'networking': 'Networking'
            },
            jp: {
                '*': 'すべて',
                'programming': 'プログラミング',
                'web-development': 'ウェブ開発',
                'cyber-security': 'サイバーセキュリティ',
                'networking': 'ネットワーキング'
            },
            cn: {
                '*': '全部',
                'programming': '编程',
                'web-development': '网页开发',
                'cyber-security': '网络安全',
                'networking': '网络'
            },
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
                    {/* MODIFIKASI: Mengirim `locale` ke komponen Card */}
                    {!isLoading && !error && filteredData.map((item, index) => <Card key={`${item.title}-${index}`} {...item} isDownloadable={true} locale={locale} />)}
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