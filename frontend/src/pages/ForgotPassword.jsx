import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset', SUCCESS: 'success' };

const ForgotPassword = () => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(STEPS.OTP);
      startCountdown();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      startCountdown();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to resend OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setStep(STEPS.RESET);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium";
  const labelCls = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl mb-4">
            {step === STEPS.SUCCESS
              ? <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
              : <KeyRound size={32} className="text-amber-600 dark:text-amber-400" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === STEPS.EMAIL && 'Forgot Password'}
            {step === STEPS.OTP && 'Enter OTP'}
            {step === STEPS.RESET && 'New Password'}
            {step === STEPS.SUCCESS && 'Password Reset!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm">
            {step === STEPS.EMAIL && "We'll send a reset code to your email"}
            {step === STEPS.OTP && `Code sent to ${email}`}
            {step === STEPS.RESET && 'Choose a strong new password'}
            {step === STEPS.SUCCESS && 'You can now log in with your new password'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[STEPS.EMAIL, STEPS.OTP, STEPS.RESET].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                step === s ? 'bg-blue-600 text-white' :
                [STEPS.OTP, STEPS.RESET, STEPS.SUCCESS].indexOf(step) > i ? 'bg-emerald-500 text-white' :
                'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`w-8 h-0.5 rounded ${[STEPS.OTP, STEPS.RESET, STEPS.SUCCESS].indexOf(step) > i ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* STEP 1: Email */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className={`${inputCls} pl-11`} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-500/20">
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className={labelCls}>6-Digit OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" maxLength={6} className={`${inputCls} tracking-[0.5em] text-center text-xl`} />
            </div>
            <button type="submit" disabled={otp.length !== 6} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white font-bold rounded-xl transition-colors text-sm">
              Verify OTP
            </button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">Resend in <span className="font-bold text-slate-700 dark:text-slate-300">{countdown}s</span></p>
              ) : (
                <button type="button" onClick={handleResend} className="flex items-center gap-2 mx-auto text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">
                  <RefreshCw size={14} /> Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === STEPS.RESET && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className={labelCls}>New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" required className={`${inputCls} pl-11`} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required className={`${inputCls} pl-11`} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-emerald-500/20">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === STEPS.SUCCESS && (
          <Link to="/login" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm text-center shadow-lg shadow-blue-500/20">
            Back to Login
          </Link>
        )}

        {step !== STEPS.SUCCESS && (
          <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Remember it?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
