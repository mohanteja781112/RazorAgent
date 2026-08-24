import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Send, 
  ShieldAlert, 
  Sliders, 
  Keyboard, 
  Mouse, 
  Package, 
  HelpCircle,
  Loader2
} from 'lucide-react';

export default function HeroCommandArea({
  promptInput,
  setPromptInput,
  userBudget,
  setUserBudget,
  onExecute,
  isProcessing,
  simulatedFailureMode
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setPromptInput(transcript);
        setIsRecording(false);
        onExecute(transcript);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      setRecognition(rec);
    }
  }, []);

  const handleMicClick = () => {
    if (recognition) {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert('Speech recognition is not supported in this browser. Please type your query.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onExecute();
    }
  };

  const handlePresetClick = (text, forceMode = null) => {
    setPromptInput(text);
    onExecute(text, forceMode);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#11192e] via-[#0f172a] to-[#0d1322] border border-slate-800/90 shadow-2xl p-6 md:p-8">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* HERO TITLE & SUBTITLE */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Commerce Protocol</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading">
            Let AI buy safely.
          </h2>
          <p className="text-sm md:text-base text-slate-400 font-medium tracking-wide">
            <span className="text-sky-400 font-semibold">Understand.</span>{' '}
            <span className="text-indigo-400 font-semibold">Decide.</span>{' '}
            <span className="text-amber-400 font-semibold">Guard.</span>{' '}
            <span className="text-emerald-400 font-semibold">Transact.</span>
          </p>
        </div>

        {/* MAIN CONVERSATIONAL INPUT BOX */}
        <div className="relative rounded-2xl bg-[#0a0e17]/90 border border-slate-700/80 p-3 md:p-4 shadow-xl focus-within:border-sky-500/80 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all glow-active">
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find me a mechanical keyboard under ₹4,000 and buy it..."
              rows={2}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm md:text-base focus:outline-none resize-none px-2 py-1"
            />

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {/* Mic Speech Button */}
              <button
                onClick={handleMicClick}
                type="button"
                className={`p-3 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-400 mic-recording'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/80 hover:bg-slate-700'
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Execute Order CTA */}
              <button
                onClick={() => onExecute()}
                disabled={isProcessing || !promptInput.trim()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Order</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SPENDING LIMIT SLIDER INSIDE INPUT CONTAINER */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Autonomous Spend Limit:</span>
              <span className="font-bold text-sky-400 text-sm">
                ₹{userBudget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="range"
                min="1000"
                max="6000"
                step="250"
                value={userBudget}
                onChange={(e) => setUserBudget(Number(e.target.value))}
                className="w-full sm:w-48 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                <ShieldAlert className="w-3 h-3 text-amber-400" /> Policy Gate
              </span>
            </div>
          </div>
        </div>

        {/* PRESET PROMPT CHIPS */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Examples:</span>
          
          <button
            onClick={() => handlePresetClick('Find me a mechanical keyboard under ₹4,000 and buy it')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-sky-500/10 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all"
          >
            <Keyboard className="w-3 h-3 text-sky-400" />
            <span>Keyboard under ₹4,000</span>
          </button>

          <button
            onClick={() => handlePresetClick('Buy me a wireless gaming mouse under ₹3,000')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-sky-500/10 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all"
          >
            <Mouse className="w-3 h-3 text-indigo-400" />
            <span>Gaming mouse under ₹3,000</span>
          </button>

          <button
            onClick={() => handlePresetClick('Find me a mechanical keyboard with wrist rest accessory bundle')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-purple-500/10 text-slate-300 hover:text-purple-300 border border-slate-700/60 hover:border-purple-500/40 transition-all"
          >
            <Package className="w-3 h-3 text-purple-400" />
            <span>Keyboard + bundle</span>
          </button>

          <button
            onClick={() => handlePresetClick('Buy me a good gaming keyboard', 'AMBIGUITY')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>Test Ambiguity Gate</span>
          </button>
        </div>

      </div>
    </section>
  );
}
