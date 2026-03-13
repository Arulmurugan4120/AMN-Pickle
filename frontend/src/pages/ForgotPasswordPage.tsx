import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

/**
 * Forgot Password Page
 * Admin uses ADMIN_CODE, User uses USER_CODE to reset password.
 */
const ForgotPasswordPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const isAdmin = role === 'admin';
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
        role: isAdmin ? 'admin' : 'customer',
      });
      if (response.data.success) {
        setSuccess('Password reset successful! You can now login with your new password.');
        setEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md px-4 animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            AMN<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Pickle</span>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isAdmin ? '⚙ Admin' : '🛒 Customer'} Reset
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Reset your password using your {isAdmin ? 'Admin' : 'User'} Code</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-6 text-red-400 text-sm font-medium">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 mb-6 text-emerald-400 text-sm font-medium">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                placeholder="arul@example.com" />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 block ${
                isAdmin ? 'text-amber-400' : 'text-blue-400'
              }`}>
                🔑 {isAdmin ? 'Admin' : 'User'} Reset Code
              </label>
              <input type="password" value={resetCode} onChange={e => setResetCode(e.target.value)} required
                className={`w-full border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all text-sm ${
                  isAdmin
                    ? 'bg-amber-500/5 border-amber-500/20 focus:border-amber-500/50 focus:ring-amber-500/25'
                    : 'bg-blue-500/5 border-blue-500/20 focus:border-blue-500/50 focus:ring-blue-500/25'
                }`}
                placeholder={`Enter ${isAdmin ? 'admin' : 'user'} reset code`} />
              <p className="text-[10px] text-gray-600 mt-1">Contact your administrator for the reset code</p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                placeholder="Min. 6 characters" />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 disabled:opacity-60">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              Remember your password?{' '}
              <Link to={`/${role}/login`} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">Sign in</Link>
            </p>
            <p className="text-gray-600 text-xs">
              <Link to="/welcome" className="hover:text-gray-400 transition-colors">← Back to role selection</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
