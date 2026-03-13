import React, { useRef } from 'react';

interface BillItem {
  name: string;
  weight: string;
  quantity: number;
  price: number;
}

interface PaymentSuccessModalProps {
  items: BillItem[];
  total: number;
  paymentId: string;
  orderId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

/**
 * Payment Success Modal with Printable Invoice
 * Shows transaction confirmation and allows the user to print a bill.
 */
const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  items, total, paymentId, orderId, userName, userEmail, onClose
}) => {
  const billRef = useRef<HTMLDivElement>(null);
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    const printContent = billRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>AMN Pickle - Invoice</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
            body { padding: 40px; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { font-size: 28px; color: #059669; }
            .header p { color: #666; font-size: 12px; margin-top: 4px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #555; }
            .meta div { line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f0fdf4; color: #059669; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #059669; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .total-row td { font-weight: 800; font-size: 16px; border-top: 2px solid #059669; background: #f0fdf4; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc; color: #999; font-size: 11px; }
            .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🫙 AMN Pickle</h1>
            <p>AMN Pickle — Premium Quality</p>
            <div style="margin-top:8px"><span class="badge">✓ PAYMENT SUCCESSFUL</span></div>
          </div>
          <div class="meta">
            <div>
              <strong>Bill To:</strong><br/>
              ${userName}<br/>
              ${userEmail}
            </div>
            <div style="text-align:right">
              <strong>Invoice Date:</strong><br/>
              ${date}<br/>
              <strong>Order ID:</strong><br/>
              ${orderId.slice(-12)}<br/>
              <strong>Payment ID:</strong><br/>
              ${paymentId.slice(-12)}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Weight</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.weight}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td style="text-align:right">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">Total Amount Paid</td>
                <td style="text-align:right">₹${total}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Thank you for shopping with AMN Pickle!</p>
            <p style="margin-top:4px">Powered by Razorpay Secure Payments • This is a computer-generated invoice.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-dark rounded-3xl shadow-2xl animate-fade-up overflow-hidden">
        {/* Success Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mt-1">Your order has been confirmed</p>
        </div>

        {/* Invoice Preview */}
        <div ref={billRef} className="px-8 py-4 max-h-[35vh] overflow-y-auto">
          <div className="flex justify-between text-[11px] text-gray-500 mb-4">
            <div>
              <span className="font-bold text-gray-400">Order:</span> {orderId.slice(-12)}
            </div>
            <div>
              <span className="font-bold text-gray-400">Payment:</span> {paymentId.slice(-12)}
            </div>
          </div>

          {items.map(item => (
            <div key={item.name} className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-[11px] text-gray-500">{item.weight} × {item.quantity}</div>
              </div>
              <span className="text-sm font-bold text-white">₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="flex items-center justify-between py-4 mt-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Total Paid</span>
            <span className="text-2xl font-black text-emerald-400">₹{total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/25"
          >
            🖨 Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
