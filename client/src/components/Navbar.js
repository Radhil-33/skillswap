import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, MessageCircle, Calendar, User, LogOut, Search, Star } from 'lucide-react';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <ArrowLeftRight className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">SkillSwap</span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/search"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Discover</span>
            </Link>
            <Link
              to="/swaps"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <ArrowLeftRight className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Swaps</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Chat</span>
            </Link>
            <Link
              to="/sessions"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Sessions</span>
            </Link>
            <Link
              to="/reviews"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
            >
              <Star className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Reviews</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Avatar src={user?.avatar} name={user?.name} size="xs" />
              <span className="hidden sm:inline text-sm font-medium">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
