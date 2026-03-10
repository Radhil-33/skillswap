import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar } from '../api';
import toast from 'react-hot-toast';
import { Plus, X, Save, Camera } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
  });
  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', level: 'intermediate' });
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data } = await uploadAvatar(file);
      setUser(data.user);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSkillOffered = () => {
    if (!newSkillOffered.name.trim()) return;
    setForm({
      ...form,
      skillsOffered: [...form.skillsOffered, { ...newSkillOffered, name: newSkillOffered.name.trim() }],
    });
    setNewSkillOffered({ name: '', level: 'intermediate' });
  };

  const removeSkillOffered = (index) => {
    setForm({
      ...form,
      skillsOffered: form.skillsOffered.filter((_, i) => i !== index),
    });
  };

  const addSkillWanted = () => {
    if (!newSkillWanted.trim()) return;
    setForm({
      ...form,
      skillsWanted: [...form.skillsWanted, { name: newSkillWanted.trim() }],
    });
    setNewSkillWanted('');
  };

  const removeSkillWanted = (index) => {
    setForm({
      ...form,
      skillsWanted: form.skillsWanted.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      setUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar src={user?.avatar} name={form.name} size="xl" className="border-4 border-white/30" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{form.name || 'Your Profile'}</h1>
              <p className="text-indigo-100">{user?.email}</p>
              {uploadingAvatar && <p className="text-indigo-200 text-sm mt-1">Uploading...</p>}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Skills I Can Teach */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills I Can Teach</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skillsOffered.map((skill, i) => (
                <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  <span>{skill.name} · {skill.level}</span>
                  <button onClick={() => removeSkillOffered(i)} className="hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillOffered.name}
                onChange={(e) => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. Python, Guitar, Photography"
              />
              <select
                value={newSkillOffered.level}
                onChange={(e) => setNewSkillOffered({ ...newSkillOffered, level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={addSkillOffered}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Skills I Want to Learn */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills I Want to Learn</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skillsWanted.map((skill, i) => (
                <span key={i} className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <span>{skill.name}</span>
                  <button onClick={() => removeSkillWanted(i)} className="hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillWanted}
                onChange={(e) => setNewSkillWanted(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. JavaScript, Cooking, Design"
              />
              <button
                onClick={addSkillWanted}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
