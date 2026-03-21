import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Book, Mail, Lock, User as UserIcon, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(formData);
      // Instant login applied! Route based on chosen role.
      navigate(formData.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm";
  const labelCls = "block text-sm font-bold text-slate-700 dark:text-slate-300";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4">
            <Book size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Join our library community</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className={labelCls}>Full Name</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required className={inputCls} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className={labelCls}>Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required className={inputCls} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                placeholder="At least 6 characters" 
                required 
                className={inputCls} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-1.5">
            <label className={labelCls}>Account Type</label>
            <div className="relative">
              <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className={`${inputCls} appearance-none`}
              >
                <option value="user" className="bg-white dark:bg-slate-900">Reader / Student</option>
                <option value="admin" className="bg-white dark:bg-slate-900">Library Admin</option>
              </select>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Creating account...' : 'Register & Verify Email'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
