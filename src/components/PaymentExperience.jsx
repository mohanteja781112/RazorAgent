import React from 'react';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck, History, RefreshCw } from 'lucide-react';

export default function PaymentExperience({
  status, // 'READY' | 'SUCCESS' | 'PROCESSING'
  orderDetails,
  totalAmount,
  onOpenAuditTrail,
  onResetOrder
}) {
  if (status === 'SUCCESS') {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-[#0c241a] via-[#091a13] to-[#090d16] border border-emerald-500/40 p-6 md:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 fade-in duration-500">
        
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75"></div>
          {/* Inner Coin */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-white border-4 border-[#0c241a] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-in slide-in-from-top-10 zoom-in spin-in-12 duration-700 ease-out">
            <CheckCircle2 className="w-10 h-10 stroke-[3]" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            Razorpay Payment Verified
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
            Transaction Complete
          </h3>
          <p className="text-sm font-semibold text-slate-300">
            Amount Paid: <span className="text-emerald-400 font-extrabold text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-xs font-mono space-y-1 max-w-md mx-auto text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Order ID:</span>
            <span>{orderDetails?.order_id || 'order_mock_178741'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Razorpay Key:</span>
            <span>{orderDetails?.key_id || 'rzp_test_mode'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Status:</span>
            <span className="text-emerald-400 font-bold">HMAC VERIFIED</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenAuditTrail}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>View Audit Trail</span>
          </button>

          <button
            onClick={onResetOrder}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Commerce Session</span>
          </button>
        </div>

      </div>
    );
  }

  if (status === 'READY') {
    return (
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Ready to Transact</span>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">
            Razorpay Test Mode
          </span>
        </div>

        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1 font-mono text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span>{orderDetails?.order_id || 'Generated on click'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount:</span>
            <span className="text-white font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
