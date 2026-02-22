import { useState } from 'react';
import { toast } from 'react-toastify';
import MahasiswaLayout from '../../components/MahasiswaLayout';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceStats } from '../../services/attendanceServices';
import { getAllAttendance, getAllLogbooks } from '../../services/reportServices';
import { generatePDFReport } from '../../services/pdfServices';

const Report = () => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGeneratePDF = async () => {
        if (!userProfile) {
            toast.error('User profile tidak ditemukan!');
            return;
        }

        setLoading(true);

        try {
            const [attendances, logbooks, stats] = await Promise.all([
                getAllAttendance(userProfile.uid),
                getAllLogbooks(userProfile.uid),
                getAttendanceStats(userProfile.uid),
            ]);

            if (attendances.length === 0) {
                toast.warning('Belum ada data kehadiran. Silakan absen terlebih dahulu.');
                setLoading(false);
                return;
            }

            const fileName = await generatePDFReport(
                userProfile,
                attendances,
                logbooks,
                stats
            );

            toast.success(`✅ Laporan berhasil diunduh: ${fileName}`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Gagal generate laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MahasiswaLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-64">
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Laporan Magang</h1>
                            <p className="text-gray-600 mt-1">Download rekap kehadiran & logbook</p>
                        </div>

                        <div className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <div className="text-center">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Generate Laporan PDF
                                        </h2>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            Download laporan lengkap kehadiran dan logbook harian dalam format PDF
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto mb-8">
                                        <p className="text-sm text-blue-800 mb-4">
                                            📋 <strong>Laporan akan berisi:</strong>
                                        </p>
                                        <div className="text-left text-sm text-blue-700 space-y-2">
                                            <ul className="list-disc list-inside ml-4 space-y-1">
                                                <li>Informasi mahasiswa (Nama, NIM, Email)</li>
                                                <li>Ringkasan kehadiran (Total hari, Persentase)</li>
                                                <li>Tabel detail absensi harian (masuk & pulang)</li>
                                                <li>Logbook kegiatan lengkap dengan foto</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGeneratePDF}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Membuat Laporan...
                                            </span>
                                        ) : (
                                            '📥 Generate & Download Laporan PDF'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MahasiswaLayout>
    );

};

export default Report;
