import React, { useState, useEffect } from 'react';
import { X, Code2, Copy, Check, ExternalLink } from 'lucide-react';

export default function JsonCatalogModal({ isOpen, onClose }) {
  const [catalogData, setCatalogData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/v1/agent-catalog')
        .then(res => res.json())
        .then(data => {
          setCatalogData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (catalogData) {
      navigator.clipboard.writeText(JSON.stringify(catalogData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0d1322] border border-slate-700/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Machine-Readable Merchant Catalog
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Structured commerce data designed for AI buyers (AP2 Protocol Standard)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Endpoint: /api/v1/agent-catalog</span>
            <a 
              href="/api/v1/agent-catalog" 
              target="_blank" 
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Raw Endpoint</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 max-h-[420px] overflow-y-auto font-mono text-xs text-sky-300 leading-relaxed">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading catalog schema...</div>
            ) : catalogData ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(catalogData, null, 2)}</pre>
            ) : (
              <div className="py-12 text-center text-rose-400">Failed to load catalog data.</div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#0b0f19] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            AP2 Schema Format • 4 Products Loaded
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!catalogData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
