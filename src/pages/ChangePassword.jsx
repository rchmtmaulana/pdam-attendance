import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Semua field wajib diisi!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password baru minimal 6 karakter!');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Password baru dan konfirmasi tidak cocok!');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error('Password baru harus berbeda dari password lama!');
            return;
        }

        setLoading(true);

        try {
            const user = auth.currentUser;

            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, formData.newPassword);

            toast.success('✅ Password berhasil diubah!');

            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setTimeout(() => {
                if (userProfile?.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/mahasiswa/dashboard');
                }
            }, 1500);

        } catch (error) {
            console.error('Error changing password:', error);

            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    toast.error('❌ Password lama salah!');
                    break;

                case 'auth/weak-password':
                    toast.error('❌ Password terlalu lemah! Minimal 6 karakter.');
                    break;

                case 'auth/requires-recent-login':
                    toast.error('⚠️ Sesi login sudah lama. Silakan login ulang.');
                    setTimeout(() => {
                        signOut(auth);
                        navigate('/login');
                    }, 2000);
                    break;

                case 'auth/network-request-failed':
                    toast.error('❌ Koneksi internet bermasalah!');
                    break;

                case 'auth/too-many-requests':
                    toast.error('❌ Terlalu banyak percobaan. Coba lagi nanti.');
                    break;

                default:
                    toast.error('❌ Gagal mengubah password. Silakan coba lagi.');
                    console.error('Unhandled error:', error);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (userProfile?.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/mahasiswa/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔑</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Ganti Password</h1>
                    <p className="text-gray-600 mt-2">
                        Perbarui password akun Anda
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Lama <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.current ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Masukkan password lama"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword.current ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Baru <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Masukkan password baru (min. 6 karakter)"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword.new ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konfirmasi Password Baru <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ulangi password baru"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword.confirm ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800">
                        💡 <strong>Tips keamanan:</strong> Gunakan kombinasi huruf kecil, angka, dan simbol untuk password yang kuat.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
