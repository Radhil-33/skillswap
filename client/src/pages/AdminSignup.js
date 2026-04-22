import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRegister } from '../api';

export default function AdminSignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', adminCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password || !form.adminCode) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await adminRegister(form);
      toast.success('Admin account created successfully!');
      setForm({ name: '', email: '', password: '', adminCode: '' });
      navigate('/admin-login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <p className="text-gray-600">Create admin account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Sign Up</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Your name"
              />
            </div>

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
                  type={showPassword ? 'text' : 'password'}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Code</label>
              <input
                type="password"
                required
                value={form.adminCode}
                onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Enter admin verification code"
              />
              <p className="text-xs text-gray-500 mt-1">You need an admin code to register</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Admin Account...' : 'Sign Up as Admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an admin account?{' '}
            <Link to="/admin-login" className="text-red-600 font-semibold hover:underline">
              Admin Login
            </Link>
          </p>
          <p className="mt-3 text-center text-gray-600 text-sm">
            Regular user?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
