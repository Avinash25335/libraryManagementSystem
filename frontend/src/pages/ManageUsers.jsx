import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, Shield, Calendar, Trash2, AlertCircle } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This action cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      setMessage(`User "${userName}" deleted successfully.`);
      setTimeout(() => setMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading members...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">View and manage library members</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={16} />{error}
        </div>
      )}
      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium">
          {message}
        </div>
      )}

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">User</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Email</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Role</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Joined</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Users size={16} />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        if (user._id === JSON.parse(localStorage.getItem('user'))?.id && newRole !== 'admin') {
                          alert("You cannot demote yourself.");
                          return;
                        }
                        try {
                          await api.put(`/auth/users/${user._id}/role`, { role: newRole });
                          setMessage(`User ${user.name} is now a ${newRole}.`);
                          setTimeout(() => setMessage(''), 3000);
                          fetchUsers();
                        } catch (err) {
                          setError(err?.response?.data?.msg || 'Failed to update role');
                          setTimeout(() => setError(''), 3000);
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none appearance-none cursor-pointer transition-colors ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : user.role === 'librarian'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      <option value="user" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Reader</option>
                      <option value="librarian" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Librarian</option>
                      <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => deleteUser(user._id, user.name)}
                      disabled={deletingId === user._id}
                      className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-40"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
