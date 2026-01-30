import MahasiswaLayout from '../../components/MahasiswaLayout';
import { useAuth } from '../../context/AuthContext';

const Report = () => {
    const { userProfile } = useAuth();

    return (
        <MahasiswaLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-64">
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Laporan Magang</h1>
                            <p className="text-gray-600 mt-1">Download rekap kehadiran & logbook</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="text-center py-12">
                                <div className="mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-5xl">📄</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Fitur Laporan PDF
                                    </h2>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        Generate laporan lengkap kehadiran dan logbook harian dalam format PDF untuk diserahkan ke kampus
                                    </p>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-lg mx-auto">
                                    <p className="text-sm text-yellow-800 mb-4">
                                        🚧 <strong>Coming Soon!</strong> Fitur ini sedang dalam development.
                                    </p>
                                    <div className="text-left text-sm text-yellow-700 space-y-2">
                                        <p>✨ <strong>Preview fitur yang akan tersedia:</strong></p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Rekap total kehadiran & persentase</li>
                                            <li>Detail absensi harian (masuk & pulang)</li>
                                            <li>Logbook lengkap dengan foto kegiatan</li>
                                            <li>Format PDF professional & siap print</li>
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    disabled
                                    className="mt-8 bg-gray-300 text-gray-500 font-semibold py-4 px-8 rounded-xl cursor-not-allowed"
                                >
                                    📥 Generate Laporan PDF
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-3">💡 Untuk saat ini:</h3>
                            <p className="text-sm text-blue-800">
                                Anda masih bisa mengakses data kehadiran di Dashboard dan logbook harian di menu Logbook.
                                Fitur download PDF akan segera tersedia!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MahasiswaLayout>
    );
};

export default Report;
