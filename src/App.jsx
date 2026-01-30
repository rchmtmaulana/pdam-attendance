import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MahasiswaDashboard from './pages/mahasiswa/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Report from './pages/mahasiswa/Report';
import Logbook from './pages/mahasiswa/Logbook';
import ChangePassword from './pages/ChangePassword';

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />

					<Route path="/mahasiswa/dashboard" element={
						<ProtectedRoute>
							<MahasiswaDashboard />
						</ProtectedRoute>
					} />

					<Route path="/mahasiswa/logbook" element={
						<ProtectedRoute>
							<Logbook />
						</ProtectedRoute>
					} />

					<Route path="/mahasiswa/report" element={
						<ProtectedRoute>
							<Report />
						</ProtectedRoute>
					} />

					<Route path="/change-password" element={
						<ProtectedRoute>
							<ChangePassword />
						</ProtectedRoute>
					} />

					<Route path="/admin/dashboard" element={
						<ProtectedRoute adminOnly>
							<AdminDashboard />
						</ProtectedRoute>
					} />

					<Route path="/" element={<Navigate to="/login" replace />} />
				</Routes>
				<ToastContainer position="top-right" autoClose={4000} theme="colored" />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
