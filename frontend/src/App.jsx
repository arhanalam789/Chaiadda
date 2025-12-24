import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div className="p-10 text-xl font-bold text-center">User Dashboard (Verified Access)</div>} />
            <Route path="/admin/dashboard" element={<div className="p-10 text-xl font-bold text-center text-red-600">Admin Dashboard (Verified Access)</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
