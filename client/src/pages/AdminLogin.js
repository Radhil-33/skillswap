import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeftRight, Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      
      // Check if user is admin
      if (data.user.role !== 'admin') {
        toast.error('Access denied: Admin privileges required');
        setLoading(false);
        return;
      }
      
      loginUser(data.token, data.user);
      toast.success('Welcome Admin!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-10 w-10 text-red-600" />
            <span className="text-3xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <p className="text-gray-600">Manage users and system settings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
          <div className="flex items-center space-x-2 mb-6 bg-red-50 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-red-600" />
            <span className="text-sm font-semibold text-red-700">Admin Access Required</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-600 text-sm">
            Regular user?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              User Login
            </Link>
          </p>
          <p className="mt-3 text-center text-gray-600 text-sm">
            Need an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
