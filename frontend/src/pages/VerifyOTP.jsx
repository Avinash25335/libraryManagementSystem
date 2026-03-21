import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpString });
      localStorage.setItem('token', res.data.token);
      setSuccess(true);
      setTimeout(() => {
        const role = res.data.user?.role;
        navigate(role === 'admin' ? '/admin' : '/search');
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.msg || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verified!</h2>
        <p className="text-slate-500 dark:text-slate-400">Redirecting you to the app...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl mb-4">
            <Mail size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Check Your Email</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">
            We sent a 6-digit code to<br/>
            <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-2xl font-black bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white font-bold rounded-xl transition-colors mb-4 text-sm shadow-lg shadow-blue-500/20"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        {/* Resend */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 mx-auto text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline disabled:opacity-50"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Resend OTP in <span className="font-bold text-slate-700 dark:text-slate-300">{countdown}s</span>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          Wrong email?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
