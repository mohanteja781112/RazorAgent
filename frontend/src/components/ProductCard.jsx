import React from 'react';
import { Sparkles, CheckCircle, Truck, Package, Tag, ShieldCheck } from 'lucide-react';

const PRODUCT_IMAGES = {
  kb_mech_01: '/images/keyboard_mech.jpg',
  wrist_rest_01: '/images/wrist_rest.jpg',
  mouse_pro_02: '/images/mouse_pro.jpg',
  headset_anc_03: '/images/headset_anc.jpg',
};

export default function ProductCard({ item }) {
  // Use local image if available, else generate a dynamic Unsplash placeholder based on category
  const fallbackQuery = encodeURIComponent(item.category || item.product || 'technology');
  const dynamicFallback = `https://images.unsplash.com/featured/600x450/?${fallbackQuery}`;
  
  const imageSrc = PRODUCT_IMAGES[item.product_id] || dynamicFallback;
  
  // Format specs into array
  const specsList = item.specs 
    ? Object.entries(item.specs).map(([key, val]) => `${val}`) 
    : ['In Stock', 'Original Spec'];

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0f172a] border border-slate-700/70 p-5 shadow-xl transition-all hover:border-sky-500/50">
      
      {/* AI MATCH BADGE */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>AI Selected</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>94% Match</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* PRODUCT IMAGE */}
        <div className="md:col-span-5 relative group overflow-hidden rounded-xl bg-slate-900 border border-slate-800 aspect-4/3 flex items-center justify-center">
          <img 
            src={imageSrc} 
            alt={item.product}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // secondary fallback if unsplash fails
              if (e.target.src !== dynamicFallback) {
                e.target.onerror = null; 
                e.target.src = dynamicFallback;
              }
            }}
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0b0f19]/80 text-[10px] font-mono text-slate-300 backdrop-blur-sm border border-slate-700">
            ID: {item.product_id}
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-sky-400">
              {item.category || 'Peripherals'}
            </span>
            <h3 className="text-xl font-bold text-white font-heading tracking-tight mt-0.5">
              {item.product}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-heading">
              ₹{item.price ? item.price.toLocaleString('en-IN') : '3,499'}
            </span>
            <span className="text-xs text-slate-400 font-medium">INR</span>
          </div>

          {/* METADATA / SPECS BADGES */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {specsList.map((spec, idx) => (
              <span 
                key={idx} 
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700/60"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* STOCK & DELIVERY INFO */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-slate-200">{item.stock || 18}</strong> in stock
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Delivery in <strong className="text-slate-200">{item.delivery_days || 2} days</strong></span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

