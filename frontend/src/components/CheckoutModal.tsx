import React from 'react';
import { IProduct } from '../types';

interface CheckoutModalProps {
  products: IProduct[];
  quantities: Record<string, number>;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

/**
 * Checkout Confirmation Modal
 * Shows order summary with itemized prices before initiating Razorpay payment.
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ({
  products, quantities, total, onConfirm, onCancel, isProcessing
}) => {
  const selectedItems = products.filter(p => quantities[p.id] > 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-dark rounded-3xl shadow-2xl animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Order Summary</h2>
              <p className="text-gray-500 text-xs mt-1">Review your items before payment</p>
            </div>
            <button onClick={onCancel} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              ✕
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="px-8 py-6 max-h-[40vh] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="text-left pb-3">Item</th>
                <th className="text-center pb-3">Qty</th>
                <th className="text-right pb-3">Price</th>
                <th className="text-right pb-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="py-4">
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-gray-500">{item.weight}</div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-black">
                      {quantities[item.id]}
                    </span>
                  </td>
                  <td className="py-4 text-right text-sm text-gray-400">₹{item.price}</td>
                  <td className="py-4 text-right text-sm font-bold text-white">
                    ₹{item.price * quantities[item.id]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total & Actions */}
        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Payable</span>
            <span className="text-3xl font-black text-white tracking-tight">
              <span className="text-emerald-400">₹</span>{total}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                '🔒 Proceed to Pay'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
            <span className="text-xs">🔒</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
