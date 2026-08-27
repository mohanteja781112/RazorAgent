import React, { useState } from 'react';
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
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';

export default function Header({
  onOpenJsonModal,
  onToggleTelemetryDrawer,
  isAuditDrawerOpen,
  telemetryLogsCount,
  agentAuthorization,
  onSetupAgentPayments,
  userEmail,
  userRole,
  onLogout,
  onOpenProfile,
  onOpenHistory,
  onGoHome
}) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* LEFT: BRANDING & NAVIGATION */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/images/RazorAgent_Logo.png" alt="RazorAgent Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-heading">
              RazorAgent
            </h1>
          </div>
          
          <div className="hidden md:flex items-center">
            <button onClick={onGoHome} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Home
            </button>
          </div>
        </div>

        {/* RIGHT: STATUS INDICATORS & ACTIONS */}
        <div className="flex items-center gap-3">


          {/* Machine Catalog JSON Button (Admin Only) */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenJsonModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all"
              title="View Machine-Readable AP2 Catalog JSON"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">JSON Catalog</span>
            </button>
          )}

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

          {/* Agent Authorization Status */}
          {agentAuthorization?.status === 'active' ? (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold" title="Agent is authorized for Zero-Click Payments">
              <CheckCircle2 className="w-4 h-4" />
              <span>Agent Mandate Active</span>
            </div>
          ) : (
            <button
              onClick={onSetupAgentPayments}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Set Up Agent Payments</span>
            </button>
          )}

          {/* User Profile */}
          <div className="relative flex items-center pl-3 ml-1 border-l border-slate-700/60">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/50 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
              title={userEmail || 'Demo User'}
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'DU'}
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#131b2e] border border-slate-700/60 rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-700/60 mb-1">
                  <p className="text-xs text-slate-400 truncate">{userEmail || 'demo@razorpay.com'}</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onOpenHistory) onOpenHistory();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <History className="w-4 h-4 text-[#00E676]" />
                  Agentic History
                </button>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
