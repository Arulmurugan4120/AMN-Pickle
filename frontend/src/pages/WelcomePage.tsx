import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Welcome Page — Role Selection
 * First page users see. Choose Admin or User to proceed to login/signup.
 */
const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-800/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl px-4 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-14">
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter">
            AMN<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> Pickle</span>
          </h1>
          <p className="text-gray-500 text-sm mt-3">AMN Pickle • Secured by Razorpay</p>
        </div>

        {/* Role Prompt */}
        <p className="text-center text-gray-400 text-lg font-bold mb-8">How would you like to continue?</p>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Admin Card */}
          <button
            onClick={() => navigate('/admin/login')}
            className="group glass-dark rounded-3xl p-8 text-left hover:border-emerald-500/30 border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">⚙️</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Admin</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Manage products, inventory, stock levels, and view orders.
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <span>Continue as Admin</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* User Card */}
          <button
            onClick={() => navigate('/user/login')}
            className="group glass-dark rounded-3xl p-8 text-left hover:border-emerald-500/30 border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Customer</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Browse products, place orders, and make secure payments.
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <span>Continue as Customer</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
          {[
            { icon: '🔒', label: '256-bit SSL' },
            { icon: '🛡️', label: 'JWT Secured' },
            { icon: '⚡', label: 'Razorpay Payments' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-gray-600">
              <span className="text-xs">{b.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
