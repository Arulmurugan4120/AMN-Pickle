import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';

/**
 * Login Page — Role-Aware Authentication
 * Renders differently for admin vs user roles.
 */
const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const isAdmin = role === 'admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // After login, the App.tsx routing handles redirect based on user role
      navigate(isAdmin ? '/admin' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md px-4 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            AMN<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Pickle</span>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isAdmin ? '⚙ Admin' : '🛒 Customer'}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Sign in to your {isAdmin ? 'admin' : ''} account</p>
        </div>

        {/* Form Card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-6 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                placeholder="arul@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 disabled:opacity-60">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              No account?{' '}
              <Link to={`/${role}/signup`} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Create one
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              <Link to={`/${role}/forgot-password`} className="hover:text-gray-400 transition-colors">
                Forgot password?
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              <Link to="/welcome" className="hover:text-gray-400 transition-colors">
                ← Back to role selection
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-600">
          <span>🔒</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">256-bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
