import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { toast } from 'react-toastify';

const Login = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
        toast.error('Email dan password harus diisi!');
        return;
    }

    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
        );

        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Check if account is active
            if (userData.isActive === false) {
                toast.error('Akun Anda telah dinonaktifkan. Hubungi admin.');
                await auth.signOut(); // Sign out immediately
                setLoading(false);
                return;
            }

            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/mahasiswa/dashboard');
            }

            toast.success(`Selamat datang, ${userData.name}!`);
        } else {
            // User authenticated but no profile in Firestore
            toast.error('Profil pengguna tidak ditemukan. Hubungi admin.');
            await auth.signOut();
        }
    } catch (error) {
        console.error('Error logging in:', error);

        // Better error messages
        switch (error.code) {
            case 'auth/user-not-found':
                toast.error('❌ Email tidak terdaftar! Silakan daftar terlebih dahulu.');
                break;
            case 'auth/wrong-password':
                toast.error('❌ Password salah! Silakan coba lagi.');
                break;
            case 'auth/invalid-credential':
                toast.error('❌ Email atau password salah!');
                break;
            case 'auth/invalid-email':
                toast.error('❌ Format email tidak valid!');
                break;
            case 'auth/user-disabled':
                toast.error('❌ Akun ini telah dinonaktifkan. Hubungi admin.');
                break;
            case 'auth/too-many-requests':
                toast.error('⚠️ Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.');
                break;
            case 'auth/network-request-failed':
                toast.error('❌ Koneksi internet bermasalah. Periksa jaringan Anda.');
                break;
            default:
                toast.error('❌ Gagal login: ' + (error.message || 'Silakan coba lagi.'));
                break;
        }
    } finally {
        setLoading(false);
    }
};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-3xl">🏢</span>
					</div>
					<h1 className="text-2xl font-bold text-gray-900">Login</h1>
					<p className="text-gray-600 mt-2">
						Sistem Absensi Magang PDAM
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="nama@email.com"
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
							disabled={loading}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Password <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Masukkan password"
								className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
								disabled={loading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
							>
								{showPassword ? (
									// Eye with slash (hiding)
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
									</svg>
								) : (
									// Eye open (showing)
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
								)}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Memproses...' : 'Login'}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Belum punya akun?{' '}
						<Link
							to="/register"
							className="text-primary font-medium hover:underline"
						>
							Daftar di sini
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
