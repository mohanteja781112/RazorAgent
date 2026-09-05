import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  UserCheck, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  PackageX,
  Wallet
} from 'lucide-react';

export default function FailureStateBanner({
  mode, // 'BUDGET' | 'BUDGET_EXCEEDED' | 'NOT_FOUND' | 'PAYMENT' | 'AMBIGUITY'
  cartTotal = 3798,
  userBudget = 3500,
  errorMessage = null,
  onApprove,
  onRetry,
  onSelectOption
}) {
  if (mode === 'NOT_FOUND') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-slate-900/80 via-[#111827] to-[#0f172a] border border-slate-600/40 p-6 shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-700/40 text-slate-300 border border-slate-600/30 shrink-0">
            <PackageX className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 font-heading">
              Product not available
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {errorMessage || 'The requested product was not found in the merchant catalog.'}
            </p>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-xs text-slate-400">
          💡 Try searching for a different product or check the catalog for available items.
        </div>
      </div>
    );
  }

  if (mode === 'BUDGET_EXCEEDED') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-orange-950/40 via-[#1c1209] to-[#0f172a] border border-orange-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-orange-300 font-heading">
              Product exceeds your budget
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {errorMessage || 'The product price exceeds your autonomous spending limit.'}
            </p>
          </div>
        </div>
        <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20 text-xs text-orange-200/90 font-medium">
          You can still proceed by manually authorizing this purchase below.
        </div>
        {onApprove && (
          <div className="flex items-center gap-3">
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Approve & Continue</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'BUDGET') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#191509] to-[#0f172a] border border-amber-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-300 font-heading">
              Autonomous payment blocked
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Cart total <strong className="text-white">₹{cartTotal.toLocaleString('en-IN')}</strong> exceeds your set autonomous limit of <strong className="text-white">₹{userBudget.toLocaleString('en-IN')}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-xs text-amber-200/90 font-medium">
          Policy Rule Enforced: <code className="font-mono text-white">MAX_AUTO_SPEND (₹{userBudget})</code>. Human authorization required before payment dispatch.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Approve & Authorize Payment</span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'PAYMENT') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#1c0d12] to-[#0f172a] border border-rose-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-300 font-heading">
              Payment could not be completed
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {errorMessage || 'Bank declined test transaction during HMAC signature verification.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your cart is safe. No duplicate order was created. Clean retry available.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Payment Safely</span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'AMBIGUITY') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0d172a] to-[#0f172a] border border-sky-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-sky-300 font-heading">
              I need a little more information.
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {errorMessage || 'The agent requires clarification or a budget increase to fulfill this request.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
