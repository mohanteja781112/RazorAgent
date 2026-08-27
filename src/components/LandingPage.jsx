import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Bot, ShieldCheck, CreditCard, ArrowRight, Sparkles, MessageSquareCode, ShoppingCart } from 'lucide-react';

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
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-slate-800/60 bg-[#060913]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#060913] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-heading">
              RazorAgent
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Architecture</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button onClick={() => onLogin('signup')} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
                Launch Agent <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onGoToWorkspace} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">
                Enter Workspace <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Razorpay Buildathon 2026
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight font-heading">
              Autonomous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                AI Commerce.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Tell RazorAgent what you need. It searches the catalog, builds your cart, enforces your financial policy, and prepares a completely secure Razorpay checkout.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-4">
              {!isAuthenticated ? (
                <>
                  <button onClick={() => onLogin('login')} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#060913] text-base font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 hover:shadow-white/20">
                    User Login
                  </button>
                  <button onClick={() => onLogin('admin')} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-base font-bold transition-all shadow-lg shadow-amber-500/5 hover:shadow-amber-500/10">
                    Admin Login
                  </button>
                </>
              ) : (
                <button onClick={onGoToWorkspace} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-base font-bold transition-colors shadow-lg shadow-emerald-500/20">
                  Open Agent Workspace
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* AI VISUALIZATION DEMO CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-purple-500/20 blur-2xl rounded-3xl"></div>
            
            {/* Glass Card */}
            <div className="relative bg-[#0b1021]/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
              
              {/* User Intent */}
              <div className="flex gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <div className="bg-slate-800/80 rounded-2xl rounded-tl-none p-4 border border-slate-700/50">
                  <p className="text-sm text-slate-200">"Find me the best mechanical keyboard under ₹4,000."</p>
                </div>
              </div>

              {/* Agent Workflow Sequence */}
              <div className="space-y-4 pl-4 border-l-2 border-slate-800 ml-4 relative">
                
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="flex items-center gap-3">
                  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-[#0b1021] border-2 border-sky-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-mono text-sky-400 bg-sky-900/30 px-2 py-1 rounded">01_SEARCH</span>
                  <span className="text-sm text-slate-400">Parsing catalog for matches...</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }} className="flex items-center gap-3">
                  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-[#0b1021] border-2 border-indigo-400"></div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">02_UPSELL</span>
                  <span className="text-sm text-slate-400">Bundling Ergonomic Wrist Rest (+₹500)</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.4 }} className="flex items-center gap-3">
                  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-[#0b1021] border-2 border-purple-400"></div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-900/30 px-2 py-1 rounded">03_POLICY</span>
                  <span className="text-sm text-slate-400">Budget Guardrail: ₹3,700 {'<'} ₹4,000</span>
                </motion.div>

              </div>

              {/* Final Result Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 3.2 }}
                className="mt-8 bg-[#131b2e] border border-emerald-500/30 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg">Cart Approved</h4>
                    <p className="text-xs text-emerald-400 mt-1">Autonomous Policy Validated</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white font-mono">₹3,700</span>
                  </div>
                </div>
                <button onClick={onLogin} className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
                  <ShieldCheck className="w-4 h-4" /> Proceed to Secure Checkout
                </button>
              </motion.div>

            </div>
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
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#0b1021] border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-7xl font-bold text-slate-800/30 group-hover:text-indigo-900/20 transition-colors pointer-events-none">02</div>
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <MessageSquareCode className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-left">The Policy Engine</h3>
              <p className="text-slate-400 text-sm text-left leading-relaxed">
                A deterministic programmatic layer that recalculates the AI's math, checks inventory limits, and rigorously enforces user-defined financial budgets before approving the cart.
              </p>
            </motion.div>

            {/* Layer 3 */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#0b1021] border border-slate-800 rounded-3xl p-8 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-7xl font-bold text-slate-800/30 group-hover:text-purple-900/20 transition-colors pointer-events-none">03</div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <CreditCard className="w-6 h-6 text-purple-400" />
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
