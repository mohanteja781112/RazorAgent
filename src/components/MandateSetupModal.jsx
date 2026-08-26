import React, { useState } from 'react';
import { ShieldCheck, Loader2, IndianRupee, AlertCircle } from 'lucide-react';

export default function MandateSetupModal({ isOpen, onClose, onAuthorize, isProcessing }) {
  const [selectedLimit, setSelectedLimit] = useState(5000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050810]/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Agent Payments</h2>
            <p className="text-sm text-slate-400">Secure zero-click authorization</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              By authorizing, you allow RazorAgent to automatically execute purchases on your behalf up to your selected limit.
            </p>
            <div className="flex items-start gap-2 text-xs text-sky-400 bg-sky-500/10 p-3 rounded-lg border border-sky-500/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>You can revoke this authorization at any time from your profile. No raw card details or PINs are ever stored.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200">Enter Autonomous Spend Limit</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <input
                type="number"
                min="1"
                value={selectedLimit === 0 ? '' : selectedLimit}
                onChange={(e) => setSelectedLimit(Number(e.target.value))}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-bold transition-all"
                placeholder="e.g. 5000"
              />
            </div>
            <p className="text-xs text-slate-400">Enter the maximum amount the agent is allowed to spend per transaction without your explicit approval.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAuthorize(selectedLimit)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-[#050810] shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {isProcessing ? 'Authorizing...' : 'Authorize via Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
}
