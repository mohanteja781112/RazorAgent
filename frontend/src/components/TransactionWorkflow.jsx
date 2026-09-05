import React from 'react';
import { Database, BrainCircuit, ShieldCheck, CreditCard, Check, AlertTriangle } from 'lucide-react';

export default function TransactionWorkflow({ currentStep, policyStatus, paymentStatus }) {
  // Steps definitions
  const steps = [
    {
      id: 1,
      number: '01',
      title: 'UNDERSTAND',
      subtitle: 'AI-readable catalog',
      icon: Database,
    },
    {
      id: 2,
      number: '02',
      title: 'DECIDE',
      subtitle: 'Buyer + upsell agent',
      icon: BrainCircuit,
    },
    {
      id: 3,
      number: '03',
      title: 'GUARD',
      subtitle: 'Financial policy',
      icon: ShieldCheck,
    },
    {
      id: 4,
      number: '04',
      title: 'TRANSACT',
      subtitle: 'Razorpay payment',
      icon: CreditCard,
    },
  ];

  const getStepStatus = (stepId) => {
    if (currentStep > stepId) {
      return 'completed';
    } else if (currentStep === stepId) {
      if (stepId === 3 && policyStatus === 'BLOCKED_REQUIRES_APPROVAL') return 'blocked';
      if (stepId === 3 && policyStatus === 'UNCERTAIN') return 'blocked';
      if (stepId === 4 && paymentStatus === 'FAILED') return 'failed';
      return 'active';
    } else {
      return 'pending';
    }
  };

  return (
    <section className="w-full bg-[#0e1424] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 font-heading">
          Autonomous Commerce Execution Protocol
        </h3>
        <span className="text-[11px] font-medium text-slate-500">
          Bounded Execution Pipeline
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const IconComponent = step.icon;

          let statusBg = 'bg-slate-800/40 text-slate-500 border-slate-700/50';
          let iconBg = 'bg-slate-800 text-slate-500';
          let statusBadge = (
            <span className="w-4 h-4 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px]">
              ○
            </span>
          );

          if (status === 'completed') {
            statusBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            iconBg = 'bg-emerald-500/20 text-emerald-400';
            statusBadge = (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            );
          } else if (status === 'active') {
            statusBg = 'bg-sky-500/15 text-sky-200 border-sky-500/50 ring-2 ring-sky-500/20 glow-active';
            iconBg = 'bg-sky-500/20 text-sky-400';
            statusBadge = (
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping inline-block" />
            );
          } else if (status === 'blocked' || status === 'failed') {
            statusBg = 'bg-amber-500/15 text-amber-200 border-amber-500/50';
            iconBg = 'bg-amber-500/20 text-amber-400';
            statusBadge = (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 stroke-[3]" />
              </span>
            );
          }

          return (
            <div
              key={step.id}
              className={`relative rounded-xl border p-3.5 flex flex-col justify-between transition-all ${statusBg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-widest text-slate-400 font-mono">
                  {step.number}
                </span>
                {statusBadge}
              </div>

              <div className="flex items-center gap-2.5 my-1">
                <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-heading tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress Line Connector between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <div className="w-4 h-0.5 bg-slate-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
