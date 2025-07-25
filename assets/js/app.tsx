'use strict';

const portfolioContainer = document.getElementById('portfolio-react-root');

// Mendefinisikan "cetakan" untuk objek proyek kita
interface Project {
    title: string;
    description: string;
    category: 'frontend' | 'backend' | 'fullstack';
    imageUrl: string;
    link: string;
}

if (portfolioContainer) {

    // PERUBAHAN DI SINI: dari "function PortfolioApp()" menjadi "const PortfolioApp = () =>"
    const PortfolioApp = () => {
        // Memberitahu React bahwa state "projects" akan berisi sebuah array dari Project
        const [projects, setProjects] = React.useState<Project[]>([]);
        const [filter, setFilter] = React.useState<string>('*');

        React.useEffect(() => {
            fetch('../assets/data/projects-id.json')
                .then(response => response.json())
                .then((data: Project[]) => setProjects(data))
                .catch(error => console.error('Gagal memuat data proyek:', error));
        }, []);

        const filteredProjects = filter === '*' ? projects : projects.filter(p => p.category === filter);
        const categories: { [key: string]: string } = { '*': 'Semua', 'frontend': 'Front-End', 'backend': 'Back-End', 'fullstack': 'Full-Stack' };

        return (
            <div>
                <div className="flex justify-center flex-wrap gap-3 mb-12">
                    {Object.keys(categories).map(key => (
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
                    {filteredProjects.map((project, index) => (
                        <a href={project.link} key={index} className="card block overflow-hidden rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex flex-col h-full">
                                <div className="w-full h-36">
                                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4 flex-grow">
                                    <h3 className="text-md font-bold mb-1">{project.title}</h3>
                                    <p className="text-sm">{project.description}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    }
    
    const portfolioRoot = ReactDOM.createRoot(portfolioContainer);
    portfolioRoot.render(<PortfolioApp />);
}