import React from 'react';
import { 
  X, 
  History, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Bot, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';

export default function AuditTelemetryDrawer({
  isOpen,
  onClose,
  telemetryLogs = [],
  onClearLogs
}) {
  if (!isOpen) return null;

  const getLogStyle = (event = '') => {
    if (event.includes('SUCCESS') || event.includes('VERIFICATION') || event.includes('SEALED') || event.includes('APPROVED')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      };
    }
    if (event.includes('BLOCKED') || event.includes('GATE') || event.includes('UNCERTAIN') || event.includes('RECOMMENDED')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      };
    }
    if (event.includes('ERROR') || event.includes('FAILED')) {
      return {
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
        icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
      };
    }
    return {
      bg: 'bg-slate-800/60 border-slate-700/60 text-slate-300',
      icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-[#0d1322] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* DRAWER HEADER */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading tracking-wide">
                Audit Telemetry & Timeline
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Structured agent action log
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              title="Clear Logs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOGS TIMELINE CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {telemetryLogs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <History className="w-8 h-8 opacity-40" />
              <p className="text-xs font-medium">No telemetry logs recorded yet.</p>
              <p className="text-[11px] opacity-70">Execute an AI command to populate execution audit trail.</p>
            </div>
          ) : (
            telemetryLogs.map((log, index) => {
              const { bg, icon } = getLogStyle(log.event);
              return (
                <div 
                  key={index}
                  className={`rounded-xl border p-3 text-xs space-y-1 transition-all ${bg}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {icon}
                      <span className="font-bold tracking-wide uppercase font-heading">
                        {log.event}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {log.timestamp || new Date().toISOString().substring(11, 19)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed pl-5">
                    {log.details}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* DRAWER FOOTER */}
        <div className="p-3 border-t border-slate-800 bg-[#0b0f19] text-center text-[10px] text-slate-500 font-mono">
          Strict Audit Trail • Immutable Bounded Log
        </div>

      </div>
    </div>
  );
}
