import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, ArrowLeftRight, MessageCircle, Calendar, Star, Users } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function Dashboard() {
  const { user } = useAuth();

  const quickActions = [
    { icon: Search, label: 'Discover Skills', path: '/search', color: 'bg-blue-500', desc: 'Find people to swap skills with' },
    { icon: ArrowLeftRight, label: 'My Swaps', path: '/swaps', color: 'bg-indigo-500', desc: 'View your swap requests' },
    { icon: MessageCircle, label: 'Messages', path: '/chat', color: 'bg-green-500', desc: 'Chat with your partners' },
    { icon: Calendar, label: 'Sessions', path: '/sessions', color: 'bg-purple-500', desc: 'Manage your learning sessions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center space-x-4">
          <Avatar src={user?.avatar} name={user?.name} size="xl" className="border-4 border-white/30" />
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
            <p className="text-indigo-100 text-lg">Ready to learn something new today?</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user?.skillsOffered?.length || 0}</p>
              <p className="text-sm text-gray-500">Skills Offered</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user?.skillsWanted?.length || 0}</p>
              <p className="text-sm text-gray-500">Want to Learn</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user?.rating?.average || 0}</p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user?.rating?.count || 0}</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
            <p className="text-sm text-gray-500">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Skills Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Skills I Can Teach</h3>
          {user?.skillsOffered?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {skill.name} · {skill.level}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              No skills added yet.{' '}
              <Link to="/profile" className="text-indigo-600 hover:underline">Add skills</Link>
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Skills I Want to Learn</h3>
          {user?.skillsWanted?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              No skills added yet.{' '}
              <Link to="/profile" className="text-indigo-600 hover:underline">Add skills</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
