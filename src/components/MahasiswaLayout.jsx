import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';

const MahasiswaLayout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/mahasiswa/dashboard', icon: '🏠', label: 'Dashboard' },
        { path: '/mahasiswa/logbook', icon: '📝', label: 'Logbook' },
        { path: '/mahasiswa/report', icon: '📄', label: 'Laporan' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar />

            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            
            <div className="pb-20 md:pb-8">
                {children}
            </div>

            {/* Bottom Navigation (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
                <div className="grid grid-cols-3 gap-1 p-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${isActive(item.path)
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-2xl mb-1">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            
        </div>
    );
};

export default MahasiswaLayout;
