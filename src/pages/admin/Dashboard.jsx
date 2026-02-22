import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllStudents, deleteStudent } from '../../services/adminServices';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getTodayDate } from '../../utils/dateHelper';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, student: null });
    const [deleting, setDeleting] = useState(false);
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

            // Get all students
            const studentsData = await getAllStudents();
            setStudents(studentsData);
            const totalStudents = studentsData.length;

            // Get today's attendance
            const today = getTodayDate();
            const attendanceRef = collection(db, 'attendance');
            const todayQuery = query(
                attendanceRef,
                where('date', '==', today)
            );
            const todaySnapshot = await getDocs(todayQuery);
            const todayAttendance = todaySnapshot.size;

            // Get today logbooks
            const logbooksRef = collection(db, 'logbooks');
            const todayLogbooksQuery = query(
                logbooksRef,
                where('date', '==', today)
            );
            const todayLogbooksSnapshot = await getDocs(todayLogbooksQuery);
            const totalLogbooks = todayLogbooksSnapshot.size;

            // Calculate percentage
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
            toast.error('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (student) => {
        setDeleteModal({ show: true, student });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.student) return;

        setDeleting(true);
        try {
            const result = await deleteStudent(deleteModal.student.id);

            toast.success(
                `✅ Mahasiswa berhasil dihapus! (${result.deletedAttendance} kehadiran, ${result.deletedLogbooks} logbook)`
            );

            setDeleteModal({ show: false, student: null });
            await loadDashboardData();
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Gagal menghapus mahasiswa: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModal({ show: false, student: null });
    };

    const handleViewDetail = (studentId) => {
        navigate(`/admin/students/${studentId}`);
    };

    const filteredStudents = students.filter(student => {
        const search = searchTerm.toLowerCase();
        return (
            student.name?.toLowerCase().includes(search) ||
            student.nim?.toLowerCase().includes(search) ||
            student.email?.toLowerCase().includes(search) ||
            student.kampus?.toLowerCase().includes(search)
        );
    });

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

                        {/* Cards */}
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
                                        <p className="text-sm text-gray-600">Total Logbook Hari Ini</p>
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

                        {/* Quick Actions */}
                        {/* <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div> */}

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari mahasiswa (nama, NIM, email, kampus)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            {searchTerm && (
                                <div className="mt-3 text-sm text-gray-600">
                                    Menampilkan <span className="font-semibold text-blue-600">{filteredStudents.length}</span> dari {students.length} mahasiswa
                                </div>
                            )}
                        </div>

                        {/* Students Table */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Daftar Mahasiswa</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Total {filteredStudents.length} mahasiswa
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <div className="inline-block min-w-[1000px] w-full">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-left border-b-2 border-gray-200">
                                                <th className="px-4 py-3 text-center w-16 font-semibold text-gray-700">No.</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">Mahasiswa</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">NIM</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">Asal Kampus</th>
                                                <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                                <span className="text-3xl">🔍</span>
                                                            </div>
                                                            <p className="text-gray-600 font-medium">
                                                                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada mahasiswa terdaftar'}
                                                            </p>
                                                            {searchTerm && (
                                                                <button
                                                                    onClick={() => setSearchTerm('')}
                                                                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                                >
                                                                    ← Kembali ke semua mahasiswa
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredStudents.map((student, index) => (
                                                    <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                                                        <td className="px-4 py-4 text-center text-gray-600 font-medium">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-semibold text-gray-900 break-words">
                                                                {student.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-700">
                                                            <span className="font-semibold text-gray-900 break-words">
                                                                {student.nim || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-700">
                                                            <span className="font-semibold text-gray-900 break-words">
                                                                {student.kampus || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 font-semibold text-gray-900 break-words">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleViewDetail(student.id)}
                                                                    className="group flex items-center justify-center rounded-lg p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow"
                                                                    title="Lihat Detail"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                                                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(student)}
                                                                    className="group flex items-center justify-center rounded-lg p-2 bg-red-100 hover:bg-red-200 text-red-600 border border-red-300 hover:border-red-400 transition-all duration-200 shadow-sm hover:shadow"
                                                                    title="Hapus Mahasiswa"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleCancelDelete}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Mahasiswa?</h3>
                            <p className="text-gray-600">Apakah Anda yakin ingin menghapus mahasiswa:</p>
                            <p className="text-lg font-semibold text-gray-900 mt-2">{deleteModal.student?.name}</p>
                            <p className="text-sm text-gray-600">NIM: {deleteModal.student?.nim}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Data yang akan dihapus:</p>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• Profil mahasiswa</li>
                                <li>• Semua riwayat kehadiran</li>
                                <li>• Semua logbook</li>
                                <li>• Data tidak dapat dikembalikan</li>
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCancelDelete} disabled={deleting} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50">
                                Batal
                            </button>
                            <button onClick={handleConfirmDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50">
                                {deleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menghapus...
                                    </span>
                                ) : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
