import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (role) => {
        return role === 'admin' 
            ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Title */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Magang PDAM
                        </h1>
                        {/* <span className="ml-3 px-3 py-1 text-xs font-medium bg-blue-100 text-primary rounded-full">
                            {userProfile?.role === "admin" ? "Admin" : "Mahasiswa"}
                        </span> */}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`w-10 h-10 rounded-full ${getAvatarColor(userProfile?.role)} text-white font-bold text-sm flex items-center justify-center hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                        >
                            {getInitials(userProfile?.name)}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fade-in">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {userProfile?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {userProfile?.email}
                                    </p>
                                    {userProfile?.nim && (
                                        <p className="text-xs text-gray-500">
                                            NIM: {userProfile.nim}
                                        </p>
                                    )}
                                </div>

                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate('/change-password');
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                    >
                                        <span className="text-lg">🔑</span>
                                        <span>Ganti Password</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
