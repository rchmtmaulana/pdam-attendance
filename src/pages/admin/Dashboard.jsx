import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Dashboard Admin
                    </h1>
                    <p className="text-gray-600">
                        Panel kontrol untuk monitoring mahasiswa magang
                    </p>
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800">
                            🚀 <strong>Coming Soon:</strong> Monitoring kehadiran, manajemen lokasi, dan laporan mahasiswa
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
