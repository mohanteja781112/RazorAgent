import React from 'react';
import { 
  Zap, 
  Trophy, 
  ShieldCheck, 
  Code2, 
  History, 
  TrendingUp, 
  Bot, 
  Bug, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenJsonModal,
  onToggleTelemetryDrawer,
  isAuditDrawerOpen,
  simulatedFailureMode,
  setSimulatedFailureMode,
  telemetryLogsCount
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-sky-400 fill-sky-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                RazorAgent
              </h1>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-Native Commerce & Bounded Checkout
            </p>
          </div>
        </div>

        {/* CENTER: BUILDATHON BADGE & TAB NAVIGATION */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Razorpay Buildathon • Track 01</span>
          </div>

          <div className="flex bg-[#131b2e] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'workspace'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agent Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('merchant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'merchant'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Merchant Growth</span>
            </button>
          </div>
        </div>

        {/* RIGHT: STATUS INDICATORS & ACTIONS */}
        <div className="flex items-center gap-3">
          {/* Failure Simulation Toggle Button */}
          <button
            onClick={() => setSimulatedFailureMode(!simulatedFailureMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              simulatedFailureMode
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Simulate Bank Payment Decline for testing error recovery"
          >
            <Bug className={`w-3.5 h-3.5 ${simulatedFailureMode ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {simulatedFailureMode ? 'Fail Mode: ON' : 'Simulate Failure'}
            </span>
          </button>

          {/* Machine Catalog JSON Button */}
          <button
            onClick={onOpenJsonModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all"
            title="View Machine-Readable AP2 Catalog JSON"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">JSON Catalog</span>
          </button>

          {/* Telemetry Drawer Trigger */}
          <button
            onClick={onToggleTelemetryDrawer}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isAuditDrawerOpen
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Audit Trail</span>
            {telemetryLogsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">
                {telemetryLogsCount}
              </span>
            )}
          </button>

          {/* Test Mode Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Razorpay Test Mode</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-700/60">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
              DU
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
