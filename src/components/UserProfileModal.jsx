import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Wallet, CheckCircle2 } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, userEmail, agentAuthorization, onRevoke }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/80 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#0b0f19]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6"
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-400/50 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">User Profile</h2>
            <p className="text-sm text-slate-400 mt-1">{userEmail}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Agent Transaction Limit</p>
                  <p className="text-lg font-bold text-white">
                    {agentAuthorization?.status === 'active' 
                      ? `₹${agentAuthorization.transaction_limit?.toLocaleString('en-IN')}` 
                      : 'None'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Zero-Click Authorization</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {agentAuthorization?.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">Active ({agentAuthorization.payment_method?.toUpperCase()})</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-slate-500">Not Configured / Revoked</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {agentAuthorization?.status === 'active' && (
                <div className="pt-3 border-t border-slate-800/80">
                  <button 
                    onClick={onRevoke}
                    className="w-full px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-lg text-sm transition-colors border border-rose-500/20"
                  >
                    Revoke Agent Payments
                  </button>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
