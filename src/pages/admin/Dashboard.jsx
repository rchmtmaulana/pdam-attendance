import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllStudents } from '../../services/adminServices';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getTodayDate } from '../../utils/dateHelper';

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        todayAttendance: 0,
        totalLogbooks: 0,
        attendancePercentage: 0
    });

    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [userProfile, navigate]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const students = await getAllStudents();
            const totalStudents = students.length;

            const today = getTodayDate();
            const attendanceRef = collection(db, 'attendance');
            const todayQuery = query(
                attendanceRef,
                where('date', '==', today)
            );
            const todaySnapshot = await getDocs(todayQuery);
            const todayAttendance = todaySnapshot.size;

            const logbooksRef = collection(db, 'logbooks');
            const logbooksSnapshot = await getDocs(logbooksRef);
            const totalLogbooks = logbooksSnapshot.size;

            const attendancePercentage = totalStudents > 0
                ? Math.round((todayAttendance / totalStudents) * 100)
                : 0;

            setStats({
                totalStudents,
                todayAttendance,
                totalLogbooks,
                attendancePercentage
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <LoadingSpinner message="Memuat dashboard..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-0">
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard Admin
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Selamat datang, {userProfile?.name || 'Admin'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Mahasiswa</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">
                                            {stats.totalStudents}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">👥</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Hadir Hari Ini</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">
                                            {stats.todayAttendance}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Logbook</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">
                                            {stats.totalLogbooks}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Kehadiran Hari Ini</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-1">
                                            {stats.attendancePercentage}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => navigate('/admin/students')}
                                    className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
                                >
                                    <span className="text-3xl mr-4">👥</span>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Kelola Mahasiswa</p>
                                        <p className="text-sm text-gray-600">Lihat & manage mahasiswa</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/admin/monitoring')}
                                    className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200"
                                >
                                    <span className="text-3xl mr-4">👁️</span>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Monitoring</p>
                                        <p className="text-sm text-gray-600">Monitor kehadiran real-time</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/admin/reports')}
                                    className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200"
                                >
                                    <span className="text-3xl mr-4">📄</span>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Laporan</p>
                                        <p className="text-sm text-gray-600">Export data & laporan</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
