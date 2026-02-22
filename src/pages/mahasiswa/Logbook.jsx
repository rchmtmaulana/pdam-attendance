import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MahasiswaLayout from '../../components/MahasiswaLayout';
import CameraCapture from '../../components/CameraCapture';
import { useAuth } from '../../context/AuthContext';
import { getTodayAttendance } from '../../services/attendanceServices';
import {
    uploadPhoto,
    saveLogbook,
    getTodayLogbook,
    updateAttendanceFlags
} from '../../services/logbookServices';
import LoadingSpinner from '../../components/LoadingSpinner';

const Logbook = () => {
    const { userProfile } = useAuth();
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [todayLogbook, setTodayLogbook] = useState(null);
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (userProfile) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile]);

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [attendance, logbook] = await Promise.all([
                getTodayAttendance(userProfile.uid),
                getTodayLogbook(userProfile.uid),
            ]);

            setTodayAttendance(attendance);
            setTodayLogbook(logbook);

            if (logbook) {
                setDescription(logbook.description || '');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handlePhotoCapture = (file) => {
        setPhotoFile(file);
    };

    const handleSaveLogbook = async () => {
        const trimmedDescription = description.trim();

        if (!trimmedDescription) {
            toast.error('Deskripsi kegiatan tidak boleh kosong!');
            return;
        }

        const wordCount = getWordCount(description);
        if (wordCount < 15) {
            toast.error(`Deskripsi minimal 15 kata! (Saat ini: ${wordCount} kata)`);
            return;
        }

        if (!photoFile && !todayLogbook?.photoUrl) {
            toast.error('Foto kegiatan wajib diupload!');
            return;
        }

        if (!todayAttendance?.checkIn) {
            toast.error('Anda belum absen masuk hari ini!');
            return;
        }

        setLoading(true);
        try {
            let photoData = null;

            if (photoFile) {
                photoData = await uploadPhoto(userProfile.uid, photoFile);
                toast.success('Foto berhasil diupload!');
            } else if (todayLogbook?.photoUrl) {
                photoData = {
                    url: todayLogbook.photoUrl,
                    path: todayLogbook.photoPath,
                };
            }

            await saveLogbook(
                userProfile.uid,
                userProfile.name,
                userProfile.nim,
                trimmedDescription,
                photoData
            );

            await updateAttendanceFlags(
                todayAttendance.id,
                true,
                true
            );

            toast.success('✅ Logbook berhasil disimpan!');

            await loadData();
        } catch (error) {
            toast.error('Gagal menyimpan logbook: ' + error.message);
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
    const canEdit = hasCheckedIn && !todayAttendance?.checkOut;

    const getWordCount = (text) => {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };


    return (
        <MahasiswaLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 md:ml-64">
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Logbook Harian</h1>
                            <p className="text-gray-600 mt-1">Dokumentasi kegiatan magang hari ini</p>
                        </div>

                        <div className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8">
                            {!hasCheckedIn && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ <strong>Perhatian:</strong> Anda belum absen masuk hari ini. Silakan absen terlebih dahulu di Dashboard.
                                    </p>
                                </div>
                            )}

                            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <h3 className="font-semibold text-blue-900 mb-3">📋 Panduan Pengisian:</h3>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li>• <strong>Foto:</strong> Ambil foto kegiatan saat sedang berlangsung</li>
                                    <li>• <strong>Deskripsi:</strong> Jelaskan detail kegiatan yang dilakukan hari ini</li>
                                    <li>• <strong>Waktu:</strong> Logbook dapat diisi kapan saja selama jam kerja</li>
                                    <li>• <strong>Edit:</strong> Logbook dapat diubah sebelum absen pulang</li>
                                </ul>
                            </div>

                            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        📸 Foto Kegiatan <span className="text-red-500">*</span>
                                    </label>
                                    <CameraCapture
                                        onPhotoCapture={handlePhotoCapture}
                                        existingPhoto={todayLogbook?.photoUrl}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        📝 Deskripsi Kegiatan <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={!canEdit && todayLogbook}
                                        placeholder="Tuliskan kegiatan yang dilakukan hari ini (minimal 15 kata)..."
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        {getWordCount(description)} / 15 kata minimum
                                        <span className="ml-2 text-gray-400">
                                            ({description.length} karakter)
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleSaveLogbook}
                                    disabled={loading || !hasCheckedIn || (todayLogbook && todayAttendance?.checkOut)}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Menyimpan...' : todayLogbook ? '💾 Update Logbook' : '💾 Simpan Logbook'}
                                </button>

                                {todayLogbook && (
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                        <p className="text-sm text-green-800">
                                            ✅ Logbook hari ini sudah tersimpan.
                                            {!todayAttendance?.checkOut && ' Anda masih bisa mengubahnya sebelum absen pulang.'}
                                        </p>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </MahasiswaLayout>
    );
};

export default Logbook;