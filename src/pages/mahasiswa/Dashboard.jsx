import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import MahasiswaLayout from '../../components/MahasiswaLayout';
import { useAuth } from "../../context/AuthContext";
import {
    getTodayAttendance,
    checkIn,
    checkOut,
    getGeofencingSettings,
    getAttendanceStats,
} from '../../services/attendanceServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLocation, checkGeofencing } from "../../utils/geolocation";
import { formatTime } from "../../utils/dateHelper";

const MahasiswaDashboard = () => {
    const { userProfile } = useAuth();
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [stats, setStats] = useState({
        totalDays: 0,
        completedDays: 0,
        percentage: 0,
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (userProfile) {
            loadAttendanceData();
        }
    }, [userProfile]);

    const loadAttendanceData = async () => {
        try {
            setLoadingData(true);
            const [attendance, statistics] = await Promise.all([
                getTodayAttendance(userProfile.uid),
                getAttendanceStats(userProfile.uid),
            ]);
            setTodayAttendance(attendance);
            setStats(statistics);
        } catch (error) {
            console.error("Error loading attendance:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const userLocation = await getCurrentLocation();

            const settings = await getGeofencingSettings();

            const { isWithin, distance } = checkGeofencing(
                userLocation,
                settings.officeLocation,
                settings.radius,
            );

            if (!isWithin) {
                toast.error(
                    `Anda berada di luar area kantor (${distance.toFixed(0)}m dari kantor). Radius maksimal: ${settings.radius}m`,
                );
                return;
            }

            const attendance = await checkIn(
                userProfile.uid,
                userProfile.name,
                userProfile.nim,
                userLocation,
                distance,
            );

            setTodayAttendance(attendance);
            toast.success(
                `✅ Absen masuk berhasil! Jarak dari kantor: ${distance.toFixed(0)}m`,
            );

            loadAttendanceData();
        } catch (error) {
            toast.error(error.message || "Gagal absen masuk");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const userLocation = await getCurrentLocation();

            const settings = await getGeofencingSettings();

            const { isWithin, distance } = checkGeofencing(
                userLocation,
                settings.officeLocation,
                settings.radius
            );

            if (!isWithin) {
                toast.error(
                    `Anda berada di luar jangkauan kantor (${distance.toFixed(0)}m dari kantor). Radius maksimal: ${settings.radius}m`
                );
                setLoading(false);
                return;
            }

            await checkOut(todayAttendance.id, userLocation, distance);

            toast.success(
                `✅ Absen pulang berhasil! Jarak dari kantor: ${distance.toFixed(0)}m`
            );

            await loadAttendanceData();

        } catch (error) {
            toast.error(error.message || 'Gagal absen pulang');
        } finally {
            setLoading(false);
        }
    };


    if (loadingData) {
        return (
            <MahasiswaLayout>
            <LoadingSpinner message="Memuat data kehadiran..." />
            </MahasiswaLayout>
        );
    }

    const hasCheckedIn = todayAttendance?.checkIn;
    const hasCheckedOut = todayAttendance?.checkOut;

    return (
        <MahasiswaLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-64">   
                <div className="min-h-screen bg-gray-50">

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Selamat datang, {userProfile?.name}!
                            </h1>
                            <p className="text-gray-600 mt-1">NIM: {userProfile?.nim}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Hari Hadir</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats.totalDays}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">📅</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Hari Lengkap</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats.completedDays}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Persentase Kehadiran
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats.percentage}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Absensi Hari Ini
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Absen Masuk
                                        </h3>
                                        {hasCheckedIn && <span className="text-2xl">✅</span>}
                                    </div>
                                    {hasCheckedIn ? (
                                        <div>
                                            <p className="text-sm text-gray-600">Waktu:</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatTime(todayAttendance.checkIn.time.toDate())}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Jarak: {todayAttendance.checkIn.distance.toFixed(0)}m dari
                                                kantor
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum absen masuk</p>
                                    )}
                                </div>

                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Absen Pulang
                                        </h3>
                                        {hasCheckedOut && <span className="text-2xl">✅</span>}
                                    </div>
                                    {hasCheckedOut ? (
                                        <div>
                                            <p className="text-sm text-gray-600">Waktu:</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {formatTime(todayAttendance.checkOut.time.toDate())}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Jarak: {todayAttendance.checkOut.distance.toFixed(0)}m dari
                                                kantor
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Belum absen pulang</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleCheckIn}
                                    disabled={loading || hasCheckedIn}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading
                                        ? "Memproses..."
                                        : hasCheckedIn
                                            ? "✅ Sudah Absen Masuk"
                                            : "📍 Absen Masuk"}
                                </button>

                                <button
                                    onClick={handleCheckOut}
                                    disabled={loading || !hasCheckedIn || hasCheckedOut}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading
                                        ? "Memproses..."
                                        : hasCheckedOut
                                            ? "✅ Sudah Absen Pulang"
                                            : "🏠 Absen Pulang"}
                                </button>
                            </div>

                            {hasCheckedIn && (
                                <div className="mt-4">
                                <Link
                                    to="/mahasiswa/logbook"
                                    className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                                >
                                    📝 Isi Logbook Harian
                                </Link>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    ℹ️ <strong>Penting:</strong> Pastikan GPS/Location aktif dan kamu
                                    berada di area kantor saat absen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>    
        </MahasiswaLayout>
    );
};

export default MahasiswaDashboard;
