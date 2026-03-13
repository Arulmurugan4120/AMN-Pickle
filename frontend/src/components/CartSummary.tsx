import React from 'react';

interface CartSummaryProps {
  total: number;
  onPay: () => void;
  isProcessing: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({ total, onPay, isProcessing }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 animate-fade-up" style={{ animationDelay: '0.5s' }}>
      <div className="glass rounded-[2rem] px-8 py-6 shadow-2xl shadow-black/10 ring-1 ring-white/40 flex items-center justify-between gap-6">
        {/* Total */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Total</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={onPay}
          disabled={total === 0 || isProcessing}
          className={`
            relative px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300
            ${total === 0
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 animate-pulse-glow'}
            disabled:opacity-60 disabled:animate-none
          `}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Pay Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
