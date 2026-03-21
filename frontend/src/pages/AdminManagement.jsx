import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, Shield, Trash2, AlertCircle, Plus, X, UserPlus, ShieldCheck } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';

const AdminManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'librarian' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/users');
      // Filter only admins and librarians
      const filtered = res.data.filter(u => u.role === 'admin' || u.role === 'librarian');
      setStaff(filtered);
    } catch (err) {
      setError('Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await api.post('/auth/admin/add', formData);
      setMessage(`New ${formData.role} added successfully!`);
      setFormData({ name: '', email: '', password: '', role: 'librarian' });
      setShowAddForm(false);
      fetchStaff();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to add staff');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRole = async (userId, userName, newRole) => {
    const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId === currentUserId && newRole !== 'admin') {
      alert("You cannot demote yourself.");
      return;
    }

    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setMessage(`Role for ${userName} updated to ${newRole}.`);
      fetchStaff();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const removeAccess = async (userId, userName) => {
    if (!window.confirm(`Remove admin/librarian access for "${userName}"? They will be demoted to Reader.`)) return;
    try {
      await api.put(`/auth/users/${userId}/role`, { role: 'user' });
      setMessage(`Access removed. ${userName} is now a Reader.`);
      fetchStaff();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove access');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">Loading staff records...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage library staff and permissions</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-2xl px-6"
          variant={showAddForm ? 'outline' : 'primary'}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Cancel' : 'Add New Staff'}
        </Button>
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

      {showAddForm && (
        <Card className="max-w-2xl animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Admin / Librarian</h2>
          </div>
          
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Staff Name" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="staff@library.com" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Initial Password</label>
              <Input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••••" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full h-[46px] px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white"
              >
                <option value="librarian">Librarian (Manage Books)</option>
                <option value="admin">Full Admin (Manage All)</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <Button type="submit" disabled={actionLoading} className="w-full h-12 rounded-xl">
                {actionLoading ? 'Creating staff account...' : 'Create Staff Account'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="glass overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Manager Name</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Email</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">Current Role</th>
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{user.name}</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, user.name, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none appearance-none cursor-pointer border transition-all ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeAccess(user._id, user.name)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group"
                        title="Remove access"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
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

export default AdminManagement;
