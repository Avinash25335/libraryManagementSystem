import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import ManageUsers from './pages/ManageUsers';
import IssuedBooks from './pages/IssuedBooks';
import AdminManagement from './pages/AdminManagement';
import UserDashboard from './pages/UserDashboard';
import BookSearch from './pages/BookSearch';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' || user.role === 'librarian' ? '/admin/books' : '/search'} />;
  
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 relative">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-white dark:bg-slate-950 transition-colors duration-300 min-h-screen relative z-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/books" element={<PrivateRoute roles={['admin', 'librarian']}><ManageBooks /></PrivateRoute>} />
          <Route path="/admin/issued" element={<PrivateRoute roles={['admin', 'librarian']}><IssuedBooks /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><ManageUsers /></PrivateRoute>} />
          <Route path="/admin/managers" element={<PrivateRoute roles={['admin']}><AdminManagement /></PrivateRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute roles={['user']}><BookSearch /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
