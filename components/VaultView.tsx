
import React, { useState, useRef, useMemo } from 'react';
import { Product, UserSession, PricePoint } from '../types';
import { ShieldCheck, TrendingDown, TrendingUp, RefreshCw, Trash2, ExternalLink, Target, Calendar, Clock, Activity, Zap, MousePointer2, TrendingUp as TrendingIcon, LineChart, Store } from 'lucide-react';
import { refreshProductPrice } from '../services/geminiService';

interface VaultViewProps {
  session: UserSession;
  onRemove: (id: string) => void;
  onUpdate: (product: Product) => void;
  onBack: () => void;
}

const PriceIntelligenceChart: React.FC<{ history: PricePoint[], currency: string }> = ({ history, currency }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, data: PricePoint } | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  if (!history || history.length < 2) return null;

  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const width = 1000;
  const height = 300;
  const paddingX = 40;
  const paddingY = 60;

  const points = useMemo(() => history.map((h, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (history.length - 1);
    const y = (height - paddingY) - ((h.price - min) * (height - 2 * paddingY)) / range;
    return { x, y, data: h };
  }), [history, min, range]);

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    
    // Find closest point
    let closest = points[0];
    let minDiff = Math.abs(x - points[0].x);
    
    for (const p of points) {
      const diff = Math.abs(x - p.x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    
    setHoveredPoint(closest);
  };

  return (
    <div className="mt-8 mb-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner relative group/chart">
      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-500" /> 
          Shinobi_Price_Log (30D)
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Floor: {currency}{min.toLocaleString()}</span>
          <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Ceiling: {currency}{max.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative">
        <svg 
          ref={containerRef}
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-[180px] overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <path d={areaD} fill="url(#chartGradient)" />
          
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]"
          />

          {hoveredPoint && (
            <>
              {/* Vertical Scaler Line */}
              <line 
                x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2={height} 
                stroke="#6366f1" strokeWidth="2" strokeDasharray="8 8" 
                className="opacity-40 animate-in fade-in duration-200"
              />
              {/* Active Pulse Point */}
              <circle 
                cx={hoveredPoint.x} cy={hoveredPoint.y} r="12" 
                fill="#6366f1" className="animate-ping opacity-20" 
              />
              <circle 
                cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" 
                fill="white" stroke="#6366f1" strokeWidth="4" 
              />
            </>
          )}

          {/* Static endpoints if not hovering */}
          {!hoveredPoint && points.map((p, i) => {
            if (i === points.length - 1) {
              return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6366f1" className="animate-pulse" />;
            }
            return null;
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-200 ease-out"
            style={{ 
                left: `${(hoveredPoint.x / width) * 100}%`, 
                top: `${(hoveredPoint.y / height) * 100}%`,
                transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-white/10 min-w-[140px] animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[14px] font-black tracking-tight">{currency}{hoveredPoint.data.price.toLocaleString()}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(hoveredPoint.data.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
               </div>
               <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest border-t border-white/5 pt-2">
                  <Store className="w-3 h-3" />
                  {hoveredPoint.data.store || 'Unknown Sector'}
               </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45 mx-auto -mt-1.5"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-2">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Scalable Intelligence Interface • Slide to Inspect</p>
      </div>
    </div>
  );
};

export const VaultView: React.FC<VaultViewProps> = ({ session, onRemove, onUpdate, onBack }) => {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefreshIntel = async (product: Product) => {
    setRefreshingId(product.id);
    try {
      const recon = await refreshProductPrice(product);
      const newPricePoint: PricePoint = {
        date: new Date().toISOString().split('T')[0],
        price: recon.price,
        store: recon.store
      };
      
      onUpdate({
        ...product,
        previousPrice: product.price,
        price: recon.price,
        storeName: recon.store,
        lastPriceUpdate: new Date().toISOString(),
        priceHistory: [...(product.priceHistory || []), newPricePoint].slice(-15)
      });
    } catch (e) {
      console.error("Intelligence Refresh Failed", e);
    } finally {
      setRefreshingId(null);
    }
  };

  const getPriceStatus = (product: Product) => {
    if (!product.previousPrice) return 'STABLE';
    if (product.price < product.previousPrice) return 'DOWN';
    if (product.price > product.previousPrice) return 'UP';
    return 'STABLE';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12 animate-in fade-in slide-in-from-top-8 duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
            <LineChart className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Arsenal Asset Vault</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Identity: {session.username} • Agent Profile 0x77
            </p>
          </div>
        </div>
        <button onClick={onBack} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all border border-slate-200">New Mission</button>
      </header>

      {session.vault.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <LineChart className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">Vault is Empty</h3>
            <p className="text-slate-500 font-medium">Add targets to your watch list during strike missions.</p>
          </div>
          <button onClick={onBack} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">Deploy Agent Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {session.vault.map(product => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 p-6">
                  {refreshingId === product.id ? (
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : (
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${
                      getPriceStatus(product) === 'DOWN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      getPriceStatus(product) === 'UP' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {getPriceStatus(product) === 'DOWN' && <TrendingDown className="w-3 h-3 inline mr-1" />}
                      {getPriceStatus(product) === 'UP' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                      {getPriceStatus(product)}
                    </div>
                  )}
               </div>

               <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">{product.brand}</span>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                  </div>

                  {product.priceHistory && <PriceIntelligenceChart history={product.priceHistory} currency={product.currency} />}

                  <div className="flex items-end justify-between border-b border-slate-50 pb-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Live Asset Value</span>
                      <div className="text-4xl font-black text-slate-900">{product.currency}{product.price.toLocaleString()}</div>
                    </div>
                    {product.previousPrice && product.previousPrice !== product.price && (
                      <div className="text-right">
                         <span className="text-[8px] font-black text-slate-400 uppercase block">Last Delta</span>
                         <span className={`text-xs font-bold ${product.price < product.previousPrice ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {product.price < product.previousPrice ? '-' : '+'}
                            {product.currency}{Math.abs(product.price - product.previousPrice).toLocaleString()}
                         </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Recon Log
                        </span>
                        <p className="text-[11px] font-bold text-slate-700">
                          {product.lastPriceUpdate ? new Date(product.lastPriceUpdate).toLocaleTimeString() : 'Fresh Recon'}
                        </p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <Target className="w-3 h-3" /> Source
                        </span>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{product.storeName || 'Online Marketplace'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      onClick={() => handleRefreshIntel(product)}
                      disabled={refreshingId === product.id}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-900/10"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingId === product.id ? 'animate-spin' : ''}`} />
                      Re-Analyze
                    </button>
                    <a 
                      href={product.sourceUrl || product.retailers[0]?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Strike Deal
                    </a>
                  </div>

                  <button 
                    onClick={() => onRemove(product.id)}
                    className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Terminate Tracking
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
