import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Edit2, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (userData) => {
    setEditingId(userData._id);
    setEditForm({
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
      location: userData.location,
      role: userData.role,
    });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/users/${editingId}`, editForm);
      toast.success('User updated successfully');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
      console.error(err);
    }
  };

  const handlePromoteAdmin = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/make-admin`);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteAdmin = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/remove-admin`);
      toast.success('Admin status removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to demote user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users and their roles</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((userData) => (
                    <tr key={userData._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {editingId === userData._id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{userData.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {editingId === userData._id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          userData.email
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === userData._id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              userData.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {userData.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {editingId === userData._id ? (
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Location"
                          />
                        ) : (
                          userData.location || '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {editingId === userData._id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                title="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(userData)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {userData._id !== user._id && (
                                <>
                                  {userData.role === 'user' ? (
                                    <button
                                      onClick={() => handlePromoteAdmin(userData._id)}
                                      className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                                      title="Make Admin"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDemoteAdmin(userData._id)}
                                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                      title="Remove Admin"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(userData._id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
