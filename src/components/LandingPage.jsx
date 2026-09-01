import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, ShieldCheck, CreditCard, ArrowRight, Sparkles, MessageSquareCode, ShoppingCart, Terminal, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LandingPage({ onLogin, isAuthenticated, onGoToWorkspace }) {
  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-hidden relative">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-slate-800/60 bg-[#060913]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/images/RazorAgent_Logo.png" alt="RazorAgent Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-heading">
              RazorAgent
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#security" className="hover:text-white transition-colors">Architecture</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button onClick={() => onLogin('signup')} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
                Launch Agent <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onGoToWorkspace} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#1687E8] text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                Enter Workspace <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-7 lg:pr-8 xl:pr-12">
            
            {/* 1. SMALL TECHNICAL EYEBROW (REMOVED) */}
            
            {/* 2. HERO HEADLINE */}
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.1] font-heading">
              YOUR INTENT.<br/>
              OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8F5] to-[#1687E8]">AUTONOMY.</span>
            </motion.h1>
            
            {/* 3. SUPPORTING COPY */}
            <motion.p variants={fadeUp} className="text-[17px] text-[#9AAAC0] leading-relaxed max-w-lg opacity-90">
              Give RazorAgent an objective. It finds the right products, applies your spending mandate, and prepares a secure checkout.
            </motion.p>
            
            {/* 4. CENTRAL COMMAND INTERFACE */}
            <motion.div variants={fadeUp} className="group relative w-full lg:w-[90%] xl:w-[85%] rounded-2xl bg-[#0D1728]/80 backdrop-blur-xl border border-[#3399CC]/30 overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#00B8F5]/60 hover:shadow-[0_0_30px_rgba(0,184,245,0.15)]">
              {/* Subtle top glare */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00B8F5]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="p-5 border-b border-[#101B2D]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[#9AAAC0] text-[10px] font-mono tracking-widest uppercase">
                    <Terminal className="w-3.5 h-3.5" />
                    Agent Command
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00B8F5]">
                    <span className="w-1 h-1 rounded-full bg-[#00B8F5] animate-pulse"></span>
                    READY
                  </div>
                </div>
                <p className="text-[#F5F8FC] font-medium text-[16px] md:text-[17px] leading-snug">
                  "Find me the best mechanical keyboard under ₹4,000"
                </p>
              </div>

              <div className="p-4 bg-[#070D17]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[#9AAAC0] text-[10px] font-mono uppercase tracking-wider">Autonomous Spend Limit</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">₹5,000</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20">Active</span>
                  </div>
                </div>
                {!isAuthenticated ? (
                  <button 
                    onClick={() => onLogin('signup')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1687E8] to-[#00B8F5] text-white text-[13px] font-bold shadow-lg shadow-[#00B8F5]/25 hover:shadow-[#00B8F5]/40 hover:-translate-y-0.5 transition-all"
                  >
                    Launch Agent <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={onGoToWorkspace}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#1687E8] text-white text-[13px] font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Enter Workspace <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 5. LIVE AGENT STATE (Embedded at bottom of panel) */}
              <div className="px-4 py-2.5 bg-[#0D1728] border-t border-[#101B2D] flex items-center justify-between overflow-hidden">
                {['Understand', 'Decide', 'Guard', 'Transact'].map((step, i) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#00B8F5]' : 'bg-[#101B2D] border border-[#3399CC]/30'}`}></div>
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${i === 0 ? 'text-[#00B8F5]' : 'text-[#9AAAC0]/50'}`}>
                      {step}
                    </span>
                    {i < 3 && <div className="w-3 md:w-6 h-px bg-[#101B2D]"></div>}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 6. BOUNDED AUTONOMY / TRUST PANEL (REMOVED) */}

            {/* 7. LOGIN ACTIONS */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              {!isAuthenticated ? (
                <>
                  <button onClick={() => onLogin('login')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#070D17] text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 hover:shadow-white/20">
                    Continue as User
                  </button>
                  <button onClick={() => onLogin('admin')} className="text-[13px] font-semibold text-[#9AAAC0] hover:text-[#F5B62E] transition-colors flex items-center gap-1 group">
                    Admin access <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <button onClick={onGoToWorkspace} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-[#1687E8] text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                  Open Agent Workspace
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* HERO IMAGE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex justify-center items-center"
          >
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/30 to-blue-500/30 blur-[100px] rounded-full"></div>
            
            <motion.img 
              src="/images/RazorAgent_Homepage_Image.png" 
              alt="RazorAgent Autonomous Commerce" 
              className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* --- ARCHITECTURE SECTION --- */}
      <section id="security" className="relative z-10 py-24 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading"
          >
            The 3-Layer Security Architecture
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg"
          >
            AI can decide. Policy controls. Razorpay secures. We built a tripartite system ensuring autonomous commerce is mathematically bounded and financially impenetrable.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Layer 1 */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#0b1021] border border-slate-800 rounded-3xl p-8 hover:border-sky-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-7xl font-bold text-slate-800/30 group-hover:text-sky-900/20 transition-colors pointer-events-none">01</div>
              <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/20">
                <Bot className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-left">The AI Shopper</h3>
              <p className="text-slate-400 text-sm text-left leading-relaxed">
                Interprets natural language intent, searches the machine-readable catalog, identifies smart upsells, and builds the optimal cart completely autonomously.
              </p>
            </motion.div>

            {/* Layer 2 */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#0b1021] border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-7xl font-bold text-slate-800/30 group-hover:text-blue-900/20 transition-colors pointer-events-none">02</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <MessageSquareCode className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-left">The Policy Engine</h3>
              <p className="text-slate-400 text-sm text-left leading-relaxed">
                A deterministic programmatic layer that recalculates the AI's math, checks inventory limits, and rigorously enforces user-defined financial budgets before approving the cart.
              </p>
            </motion.div>

            {/* Layer 3 */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#0b1021] border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-7xl font-bold text-slate-800/30 group-hover:text-blue-900/20 transition-colors pointer-events-none">03</div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-left">Razorpay Network</h3>
              <p className="text-slate-400 text-sm text-left leading-relaxed">
                The final gatekeeper. The AI never sees banking credentials. Razorpay handles the final authentication (UPI/OTP) ensuring RBI-grade compliance and total user security.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">Built for the future of trade.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Intent-Based Shopping", icon: <MessageSquareCode />, desc: "Say what you want. RazorAgent handles the browsing." },
              { title: "Autonomous Selection", icon: <Bot />, desc: "Evaluates JSON catalogs to find the perfect mathematical match." },
              { title: "Smart Upselling", icon: <ShoppingCart />, desc: "Increases merchant AOV by adding highly relevant bundles." },
              { title: "Financial Guardrails", icon: <ShieldCheck />, desc: "Strict budget enforcement using deterministic logic." },
              { title: "Agentic Checkout", icon: <Zap />, desc: "Skips the funnel. The AI builds the exact payment API payload." },
              { title: "Secure Payments", icon: <CreditCard />, desc: "Backed by the security and trust of Razorpay Standard Checkout." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 transition-colors flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0 text-sky-400">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
