import React, { useState, useEffect, useCallback } from 'react';
import ProductList from '../components/ProductList';
import CartSummary from '../components/CartSummary';
import CheckoutModal from '../components/CheckoutModal';
import PaymentSuccessModal from '../components/PaymentSuccessModal';
import { useProducts } from '../hooks/useProducts';
import { OrderService, PaymentService } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window { Razorpay: any; }
}

/**
 * AMN Pickle - MNC-Grade HomePage
 * Flow: Select Products → Review Order → Razorpay Payment → Print Bill
 */
const HomePage: React.FC = () => {
  const {
    products,
    quantities,
    updateQuantity,
    resetQuantities,
    total,
    loading,
    error: productError
  } = useProducts();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Payment success state
  const [paymentSuccess, setPaymentSuccess] = useState<{
    items: { name: string; weight: string; quantity: number; price: number }[];
    total: number;
    paymentId: string;
    orderId: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Step 1: User clicks "Pay Now" → Show order summary modal
  const handlePayClick = useCallback(() => {
    if (total <= 0) return;
    setShowCheckout(true);
  }, [total]);

  // Step 2: User confirms order → Create Razorpay order → Open payment popup
  const handleConfirmPayment = useCallback(async () => {
    if (isProcessing || total <= 0) return;
    setIsProcessing(true);
    setToast(null);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Payment gateway unavailable. Check your connection.');

      const orderItems = products
        .filter(p => quantities[p.id] > 0)
        .map(p => ({ product_id: p.id, name: p.name, price: p.price, quantity: quantities[p.id] }));

      const response = await OrderService.createOrder({ items: orderItems, total_amount: total });
      const { order, razorpay_order_id, key_id } = response.data.data;

      const options = {
        key: key_id,
        amount: Math.round(order.total_amount * 100),
        currency: 'INR',
        name: 'AMN Pickle',
        description: `Order #${razorpay_order_id.slice(-8)}`,
        order_id: razorpay_order_id,
        handler: async (resp: any) => {
          try {
            const verification = await PaymentService.verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              amount: order.total_amount * 100,
            });
            if (verification.data.success) {
              // Step 3: Show payment success with bill
              setShowCheckout(false);
              setPaymentSuccess({
                items: orderItems.map(item => ({
                  name: item.name,
                  weight: products.find(p => p.id === item.product_id)?.weight || '',
                  quantity: item.quantity,
                  price: item.price,
                })),
                total,
                paymentId: resp.razorpay_payment_id,
                orderId: resp.razorpay_order_id,
              });
              resetQuantities();
            }
          } catch (err: any) {
            setToast({ type: 'error', message: `Verification failed: ${err.message}` });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name: user?.name || 'Arul', email: user?.email || 'arul@example.com', contact: '9999999999' },
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
          escape: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setToast({ type: 'error', message: resp.error.description });
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || err.message || 'Checkout failed.' });
      setIsProcessing(false);
    }
  }, [isProcessing, total, products, quantities, resetQuantities, user]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <svg className="w-7 h-7 text-white animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Loading Store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] animate-fade-up">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold ${
            toast.type === 'error'
              ? 'bg-red-500 text-white shadow-red-500/25'
              : 'bg-emerald-500 text-white shadow-emerald-500/25'
          }`}>
            {toast.type === 'error' ? '✕' : '✓'}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ─── Checkout Confirmation Modal ─── */}
      {showCheckout && (
        <CheckoutModal
          products={products}
          quantities={quantities}
          total={total}
          onConfirm={handleConfirmPayment}
          onCancel={() => { setShowCheckout(false); setIsProcessing(false); }}
          isProcessing={isProcessing}
        />
      )}

      {/* ─── Payment Success + Print Bill Modal ─── */}
      {paymentSuccess && (
        <PaymentSuccessModal
          items={paymentSuccess.items}
          total={paymentSuccess.total}
          paymentId={paymentSuccess.paymentId}
          orderId={paymentSuccess.orderId}
          userName={user?.name || 'Customer'}
          userEmail={user?.email || ''}
          onClose={() => setPaymentSuccess(null)}
        />
      )}

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <header className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#050505]">
        {/* Top Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
          <span className="text-white/60 text-sm font-bold">
            Welcome, <span className="text-emerald-400">{user?.name}</span>
          </span>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="glass-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                ⚙ Admin Panel
              </button>
            )}
            <button
              onClick={logout}
              className="glass-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-teal-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 glass-dark px-5 py-2.5 rounded-full mb-10 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              Secure Payment Gateway Active
            </span>
          </div>

          {/* Title */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none animate-fade-up" style={{ animationDelay: '0.15s' }}>
            AMN
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 animate-shimmer">
              {' '}Pickle
            </span>
          </h1>



          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 flex-wrap animate-fade-up" style={{ animationDelay: '0.45s' }}>
            {[
              { icon: '🔒', label: 'SSL Encrypted' },
              { icon: '⚡', label: 'Razorpay Secured' },
              { icon: '🛡️', label: 'PCI Compliant' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 text-gray-500">
                <span className="text-base">{badge.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-gray-700 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce" />
          </div>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <main className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        {productError ? (
          <div className="glass rounded-3xl p-16 text-center max-w-lg mx-auto shadow-xl animate-fade-up">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Connection Issue</h3>
            <p className="text-gray-400 mb-8 text-sm">{productError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <ProductList
            products={products}
            quantities={quantities}
            onUpdateQuantity={updateQuantity}
          />
        )}
      </main>



      {/* ─── Floating Cart ─── */}
      <CartSummary
        total={total}
        onPay={handlePayClick}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default HomePage;
