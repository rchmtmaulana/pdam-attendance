import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    getStudentById,
    getStudentAttendanceStats,
    getStudentLogbooks
} from '../../services/adminServices';
import { formatDate, formatTime } from '../../utils/dateHelper';

const StudentDetail = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [logbooks, setLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedLogbook, setSelectedLogbook] = useState(null);

    useEffect(() => {
        loadStudentData();
    }, [studentId]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            const [studentData, statsData, logbooksData] = await Promise.all([
                getStudentById(studentId),
                getStudentAttendanceStats(studentId),
                getStudentLogbooks(studentId)
            ]);

            setStudent(studentData);
            setAttendanceStats(statsData);
            setLogbooks(logbooksData);
        } catch (error) {
            console.error('Error loading student data:', error);
            toast.error('Gagal memuat data mahasiswa');
            navigate('/admin/students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <LoadingSpinner message="Memuat data mahasiswa..." />
            </AdminLayout>
        );
    }

    if (!student) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Mahasiswa tidak ditemukan</p>
                </div>
            </AdminLayout>
        );
    }

    const attendancePercentage = attendanceStats?.totalDays > 0
        ? Math.round((attendanceStats.completeDays / attendanceStats.totalDays) * 100)
        : 0;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-0">
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-semibold"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali ke Dashboard
                        </button>

                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center mb-4 md:mb-0">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                        {student.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-6">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {student.name}
                                        </h1>
                                        <p className="text-gray-600 mt-1">NIM: {student.nim || '-'}</p>
                                        <p className="text-gray-600">{student.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div>
                                    <p className="text-sm text-gray-600">Total Hari</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-1">
                                        {attendanceStats?.totalDays || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div>
                                    <p className="text-sm text-gray-600">Hari Lengkap</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">
                                        {attendanceStats?.completeDays || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div>
                                    <p className="text-sm text-gray-600">Tepat Waktu</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-1">
                                        {attendanceStats?.onTimeDays || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div>
                                    <p className="text-sm text-gray-600">Persentase</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-1">
                                        {attendancePercentage}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="border-b border-gray-200">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${activeTab === 'profile'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        👤 Profil
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('attendance')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${activeTab === 'attendance'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        📅 Riwayat Kehadiran
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('logbook')}
                                        className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${activeTab === 'logbook'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        📝 Logbook ({logbooks.length})
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Nama Lengkap
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {student.name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    NIM
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {student.nim || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {student.email}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Asal Kampus
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {student.kampus}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Tanggal Daftar
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {formatDate(student.createdAt)}
                                                </p>
                                            </div>
                                            {/* <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Role
                                                </label>
                                                <p className="text-gray-900 bg-gray-200 px-4 py-3 rounded-xl">
                                                    {student.role || 'mahasiswa'}
                                                </p>
                                            </div> */}
                                        </div>
                                    </div>
                                )}

                                {/* Attendance Tab */}
                                {activeTab === 'attendance' && (
                                    <div className="overflow-x-auto">
                                        {attendanceStats?.attendances && attendanceStats.attendances.length > 0 ? (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                            Tanggal
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                            Check In
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                            Check Out
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {attendanceStats.attendances.map((attendance) => (
                                                        <tr key={attendance.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatDate(attendance.date)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {/* FIX: Use attendance.checkIn.time */}
                                                                {attendance.checkIn?.time ? formatTime(attendance.checkIn.time) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {/* FIX: Use attendance.checkOut.time */}
                                                                {attendance.checkOut?.time ? formatTime(attendance.checkOut.time) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {attendance.checkIn && attendance.checkOut ? (
                                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                        ✅ Lengkap
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        ⏳ Belum Checkout
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                Belum ada riwayat kehadiran
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Logbook Tab */}
                                {activeTab === 'logbook' && (
                                    <div>
                                        {logbooks.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {logbooks.map((logbook) => (
                                                    <div
                                                        key={logbook.id}
                                                        className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                                        onClick={() => setSelectedLogbook(logbook)}
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {formatDate(logbook.date)}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {formatTime(logbook.createdAt)}
                                                                </p>
                                                            </div>
                                                            <span className="text-2xl">📝</span>
                                                        </div>

                                                        {logbook.photoUrl && (
                                                            <img
                                                                src={logbook.photoUrl}
                                                                alt="Logbook"
                                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                                            />
                                                        )}

                                                        <p className="text-sm text-gray-700 line-clamp-3">
                                                            {logbook.description}
                                                        </p>

                                                        <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                                            Lihat Detail →
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                Belum ada logbook
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logbook Detail Modal */}
            {selectedLogbook && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedLogbook(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Logbook Detail
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatDate(selectedLogbook.date)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedLogbook(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {selectedLogbook.photoUrl && (
                                <img
                                    src={selectedLogbook.photoUrl}
                                    alt="Logbook"
                                    className="w-full rounded-xl mb-4"
                                />
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Deskripsi Kegiatan
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl whitespace-pre-wrap">
                                    {selectedLogbook.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="block text-gray-600 mb-1">Waktu Input</label>
                                    <p className="text-gray-900 font-semibold">
                                        {formatTime(selectedLogbook.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-gray-600 mb-1">Tanggal</label>
                                    <p className="text-gray-900 font-semibold">
                                        {formatDate(selectedLogbook.date)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLogbook(null)}
                                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default StudentDetail;
