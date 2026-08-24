import React from 'react';
import { TrendingUp, ShoppingBag, ArrowUpRight, ShieldCheck, DollarSign, BarChart3, Repeat } from 'lucide-react';

export default function MerchantGrowthDashboard({
  aiOrders = 37,
  upsellsAccepted = 14,
  cartsRecovered = 8,
  revenueUplift = 12450
}) {
  return (
    <section className="rounded-2xl bg-gradient-to-b from-[#11192e] to-[#0c1220] border border-slate-800 p-6 md:p-8 space-y-6 shadow-2xl">
      
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white font-heading">
              Live Merchant Analytics
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
              LIVE SESSION
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Automated AOV expansion & cart protection driven by RazorAgent
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>AOV Increase: +22.4%</span>
        </div>
      </div>

      {/* 4 METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Orders</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-heading">
              {aiOrders}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +18% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Autonomous intent purchases</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Upsells Accepted</span>
            <Repeat className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-heading">
              {upsellsAccepted}
            </span>
            <span className="text-xs font-bold text-purple-400">
              37.8% Conv.
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Contextual bundle recommendations</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Carts Recovered</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-heading">
              {cartsRecovered}
            </span>
            <span className="text-xs font-bold text-amber-400">
              Human Gate
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Approved budget overrides</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Revenue Uplift</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-heading">
              ₹{revenueUplift.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              +32.4% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Influenced order volume</p>
        </div>

      </div>

      {/* REVENUE GROWTH CHART SVG */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white font-heading">Cumulative AI Revenue Influence</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Last 30 Days (Demo)</span>
        </div>

        {/* SVG CHART */}
        <div className="h-44 w-full pt-2">
          <svg className="w-full h-full" viewBox="0 0 500 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="500" y2="70" stroke="#1e293b" strokeDasharray="4 4" />
            <line x1="0" y1="110" x2="500" y2="110" stroke="#1e293b" strokeDasharray="4 4" />

            {/* Area */}
            <path
              d="M0,130 Q60,110 120,95 T240,70 T360,40 T500,15 L500,140 L0,140 Z"
              fill="url(#chartGradient)"
            />

            {/* Line */}
            <path
              d="M0,130 Q60,110 120,95 T240,70 T360,40 T500,15"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Glowing dots */}
            <circle cx="120" cy="95" r="4" fill="#38bdf8" className="animate-pulse" />
            <circle cx="240" cy="70" r="4" fill="#6366f1" />
            <circle cx="360" cy="40" r="4" fill="#38bdf8" />
            <circle cx="500" cy="15" r="5" fill="#10b981" />
          </svg>
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-2">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4 (Current)</span>
        </div>
      </div>

    </section>
  );
}
