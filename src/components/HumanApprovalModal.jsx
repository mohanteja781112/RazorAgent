import React from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export default function HumanApprovalModal({
  isOpen,
  onClose,
  totalAmount = 3798,
  userBudget = 3500,
  onApprove,
  onReject
}) {
  if (!isOpen) return null;

  const difference = totalAmount - userBudget;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1526] border border-amber-500/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/50 via-[#1c160b] to-[#0e1526] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-amber-300 font-heading">
                Financial Policy Gate Triggered
              </h3>
              <p className="text-xs text-amber-200/80 font-medium">
                Human Approval Required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            The AI Agent matched your request and recommended items totaling{' '}
            <strong className="text-white font-extrabold text-base">₹{totalAmount.toLocaleString('en-IN')}</strong>,
            which exceeds your set autonomous limit of{' '}
            <strong className="text-amber-400 font-extrabold text-base">₹{userBudget.toLocaleString('en-IN')}</strong>{' '}
            by <strong className="text-amber-300">+₹{difference.toLocaleString('en-IN')}</strong>.
          </p>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Selected Product (Keyboard):</span>
              <span>₹3,499</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Merchant Bundle (Wrist Rest):</span>
              <span>+₹299</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800 text-sm">
              <span>Total Cart Amount:</span>
              <span className="text-amber-400">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Overriding policy gate authorizes transaction creation on Razorpay.</span>
          </p>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            onClick={onReject}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            Block Transaction
          </button>

          <button
            onClick={onApprove}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Approve & Pay via Razorpay</span>
          </button>
        </div>

      </div>
    </div>
  );
}
