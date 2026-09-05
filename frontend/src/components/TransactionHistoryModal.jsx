import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function TransactionHistoryModal({ isOpen, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('razoragent_token');
      if (token) {
        setLoading(true);
        fetch('/api/user/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTransactions(data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
          }
        })
        .catch(err => console.error("Failed to load transactions", err))
        .finally(() => setLoading(false));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00E676]" />
              Agentic Purchase History
            </h2>
            <p className="text-sm text-slate-400 mt-1">Autonomous transactions executed on your behalf</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E676]"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No autonomous purchases yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Once the AI agent autonomously buys something for you, it will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, idx) => (
                <div key={idx} className="bg-[#1F2937]/50 rounded-xl p-4 border border-[#374151] flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{tx.product_name || 'Autonomous Order'}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>{new Date(tx.date).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono">{tx.payment_id || 'simulated_charge'}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-lg font-bold text-white">₹{tx.amount}</span>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                      {tx.payment_mode === 'S2S RESTRICTED - SIMULATED' || tx.payment_mode === 'DEMO MODE - SIMULATED' ? (
                        <span 
                          className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase cursor-help"
                          title="Razorpay Test Accounts do not have Server-to-Server TokenHQ charging enabled by default. Falling back to safe simulation for demo purposes."
                        >
                          S2S Restricted (Simulated)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-full uppercase">
                          Razorpay Test Mode
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}