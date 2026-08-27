import React from 'react';
import { motion } from 'framer-motion';

export default function RazorAgentSplash() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#060913] flex flex-col items-center justify-center pt-2 overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-sky-500/10 rounded-full blur-[80px]"
      />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
        className="relative z-10 w-36 h-36 mb-6"
      >
        <img src="/images/RazorAgent_Logo.png" alt="RazorAgent" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-3xl font-bold text-white font-heading tracking-tight"
      >
        RazorAgent
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mt-8 flex flex-col items-center gap-3"
      >
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />
        </div>
        <p className="text-sky-300 font-semibold font-mono text-[10px] tracking-[0.2em] uppercase">
          Initializing Protocol...
        </p>
      </motion.div>
    </div>
  );
}
