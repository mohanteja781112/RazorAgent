import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  UserCheck, 
  CreditCard, 
  ArrowRight, 
  HelpCircle,
  AlertOctagon,
  CheckCircle2,
  Zap,
  Loader2
} from 'lucide-react';

export default function PolicySafetyPanel({
  userBudget,
  totalAmount,
  policyStatus,
  requiresHumanApproval,
  agentAuthorization,
  onApproveHumanGate,
  onInitiatePayment,
  onClarifyQuery,
  isProcessingPayment
}) {
  const difference = Math.abs(userBudget - totalAmount);
  const isOverBudget = totalAmount > userBudget;

  let statusBadgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  let statusTitle = '✓ AUTONOMOUSLY APPROVED';
  let statusDesc = 'Transaction within set autonomous spending limit. Ready for instant bounded payment.';

  if (policyStatus === 'BLOCKED_REQUIRES_APPROVAL' || isOverBudget) {
    statusBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30';
    statusTitle = 'BLOCKED — HUMAN APPROVAL REQUIRED';
    statusDesc = `Cart total ₹${totalAmount.toLocaleString('en-IN')} exceeds set autonomous limit of ₹${userBudget.toLocaleString('en-IN')}.`;
  } else if (policyStatus === 'UNCERTAIN') {
    statusBadgeColor = 'bg-sky-500/15 text-sky-300 border-sky-500/40';
    statusTitle = 'UNCERTAIN — CLARIFICATION REQUIRED';
    statusDesc = 'Query match confidence < 80%. Agent requires user specification clarification.';
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#111827] to-[#0b0f19] border border-slate-700/80 p-5 shadow-2xl space-y-4">
      
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading tracking-wide">
              Financial Safety & Policy Gate
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Deterministic spending constraints enforced before payment
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          POLICY: STRICT
        </span>
      </div>

      {/* METRICS COMPARISON GRID */}
      <div className="grid grid-cols-3 gap-3 text-center">
        
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Autonomous Limit
          </span>
          <span className="text-lg font-extrabold text-slate-200 font-heading block mt-0.5">
            ₹{userBudget.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Current Cart
          </span>
          <span className="text-lg font-extrabold text-white font-heading block mt-0.5">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className={`rounded-xl p-3 border ${
          isOverBudget ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-90">
            {isOverBudget ? 'Exceeds By' : 'Remaining'}
          </span>
          <span className="text-lg font-extrabold font-heading block mt-0.5">
            ₹{Math.abs(difference).toLocaleString('en-IN')}
          </span>
        </div>

      </div>

      {/* STATUS BANNER */}
      <div className={`rounded-xl p-4 border ${statusBadgeColor} space-y-1`}>
        <div className="flex items-center gap-2">
          {policyStatus === 'BLOCKED_REQUIRES_APPROVAL' || isOverBudget ? (
            <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
          ) : policyStatus === 'UNCERTAIN' ? (
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <h4 className="text-xs font-bold uppercase tracking-wider font-heading">
            {statusTitle}
          </h4>
        </div>
        <p className="text-xs text-slate-300 font-medium pl-6 leading-relaxed">
          {statusDesc}
        </p>
      </div>

      {/* DYNAMIC ACTION BUTTON */}
      <div>
        {policyStatus === 'BLOCKED_REQUIRES_APPROVAL' || isOverBudget ? (
          <button
            onClick={onApproveHumanGate}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Continue & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : policyStatus === 'UNCERTAIN' ? (
          <button
            onClick={onClarifyQuery}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Clarify Specification Details</span>
          </button>
        ) : (
          <button
            onClick={onInitiatePayment}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            {agentAuthorization?.status === 'active' ? (
              <>
                {isProcessingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                ) : (
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>
                  {isProcessingPayment ? 'Processing Auto-Pay...' : `Continue & Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                </span>
                {!isProcessingPayment && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </>
            ) : (
              <>
                {isProcessingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                ) : (
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>
                  {isProcessingPayment ? 'Initiating Checkout...' : `Continue & Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                </span>
                {!isProcessingPayment && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
