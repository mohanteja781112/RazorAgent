import React from 'react';
import { Gift, Sparkles, Plus, Check, X, ArrowRight } from 'lucide-react';

export default function SmartUpsellSection({ 
  upsellItem, 
  mainProductName = "Main Product",
  mainProductPrice = 3499,
  userBudget = 3500,
  isIncluded = true,
  onToggleUpsell 
}) {
  const bundlePrice = upsellItem ? (upsellItem.bundle_price || upsellItem.price) : 299;
  const normalPrice = Math.round(bundlePrice * 1.25); // Just for demo UI savings
  const totalWithUpsell = mainProductPrice + (isIncluded ? bundlePrice : 0);
  const exceedsBudget = upsellItem?.exceeds_budget;

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#111827] border border-indigo-500/30 p-5 shadow-xl transition-all">
      
      {/* HEADER BADGE */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${exceedsBudget ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'}`}>
            {exceedsBudget ? <Sparkles className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
          </div>
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider font-heading ${exceedsBudget ? 'text-amber-300' : 'text-purple-300'}`}>
              {exceedsBudget ? 'Recommended Upgrade' : 'Smart Recommendation'}
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              AI recommends adding:
            </p>
          </div>
        </div>

        {!exceedsBudget && (
          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Bundle Savings: ₹{normalPrice - bundlePrice}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
        
        {/* UPSELL ITEM DETAILS */}
        <div className="md:col-span-7 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 shrink-0 overflow-hidden">
            <img 
              src="public/images/wrist_rest.jpg" 
              alt="Ergonomic Wrist Rest" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1541140590914-579f21e66c43?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>

          <div className="space-y-1">
            <h5 className="text-sm font-bold text-white font-heading">
              {upsellItem ? upsellItem.product : 'Complementary Add-on'}
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              "{upsellItem?.reason || 'Recommended because it complements your selected item.'}"
            </p>
            {exceedsBudget && !isIncluded && (
              <p className="text-[10px] text-amber-400 font-bold mt-1 uppercase tracking-wider bg-amber-500/10 inline-block px-2 py-0.5 rounded border border-amber-500/20">
                ⚠️ ₹{totalWithUpsell - userBudget} over your autonomous budget
              </p>
            )}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-sm font-extrabold text-purple-300">
                ₹{bundlePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 line-through">
                ₹{normalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* MATH BREAKDOWN & CONTROLS */}
        <div className="md:col-span-5 bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="text-xs font-mono text-slate-300 space-y-1 border-b border-slate-800 pb-2">
            <div className="flex justify-between">
              <span className="text-slate-400 truncate max-w-[120px]">{mainProductName}:</span>
              <span>₹{mainProductPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span className="truncate max-w-[120px]">+ {upsellItem?.product || 'Add-on'}:</span>
              <span>₹{isIncluded ? bundlePrice.toLocaleString('en-IN') : 0}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
              <span>Cart Total:</span>
              <span className={exceedsBudget && isIncluded ? "text-amber-400" : "text-sky-400"}>
                ₹{totalWithUpsell.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isIncluded ? (
              <button
                onClick={() => onToggleUpsell && onToggleUpsell(false)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove Add-on</span>
              </button>
            ) : (
              <button
                onClick={onToggleUpsell}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-all ${
                  exceedsBudget 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white'
                }`}
              >
                {exceedsBudget ? (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add & Approve ₹{totalWithUpsell.toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

