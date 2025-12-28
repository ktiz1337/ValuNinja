
import React, { useState, useMemo } from 'react';
import { Product, SpecAttribute, PriceRange, RetailerLink, UserLocation, ValueBreakdown, AdUnit, SearchState, UserSession, Briefing, MarketIntel } from '../types';
import { AttributeForm } from './AttributeForm';
import { AdSenseUnit } from './AdSenseUnit';
import { 
  Check, ShoppingCart, Award, SlidersHorizontal, Table as TableIcon, Globe, MapPin, 
  ShieldCheck, Store, Search, Link2, TrendingUp, Activity, Sparkles, Cpu, Hammer, 
  Users, Timer, Lightbulb, MousePointer2, Landmark, Crosshair, ScrollText, Binary, 
  Terminal, Radio, BookmarkPlus, ShieldAlert, Box, RefreshCw, ShoppingBag, ExternalLink, 
  Target as TargetIcon, CheckCircle2, Bookmark, PlusCircle
} from 'lucide-react';

interface ResultsViewProps {
  products: Product[];
  summary?: Briefing;
  marketGuide?: MarketIntel;
  attributes: SpecAttribute[];
  suggestions?: string[];
  userValues: Record<string, any>;
  onAttributeUpdate: (key: string, value: any) => void;
  onRefine: () => void;
  onExpand?: () => void;
  onPhotoScout?: (base64Image: string) => void;
  isSearching: boolean;
  isLoadingProducts: boolean;
  query: string;
  priceRange?: PriceRange;
  regionFlag?: string;
  loadingMessage?: string;
  adContent?: AdUnit[];
  sources?: { title: string, uri: string }[];
  location?: UserLocation;
  stage: SearchState['stage'];
  session: UserSession;
  onSaveToVault: (product: Product) => void;
  onSaveAllToVault?: (products: Product[]) => void;
  onLocationRequest?: () => void;
  onLocationUpdate?: (loc: Partial<UserLocation>) => void;
}

const ScoreBar: React.FC<{ value: number, label: string, icon: React.ReactNode, color: string, slim?: boolean }> = ({ value, label, icon, color, slim }) => (
  <div className={`space-y-1 ${slim ? 'flex-1' : ''}`}>
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
      <div className="flex items-center gap-1">
        {icon} <span className={slim ? 'hidden sm:inline' : ''}>{label}</span>
      </div>
      <span className="font-mono text-[8px] sm:text-[9px]">{value}/10</span>
    </div>
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${slim ? 'h-1' : 'h-1.5'}`}>
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${value * 10}%` }}
      ></div>
    </div>
  </div>
);

const ValueIndicator: React.FC<{ score: number, verified?: boolean }> = ({ score, verified }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (s >= 75) return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        if (s >= 60) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${getColor(score)}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            Score: {score}
            {verified && (
              <span title="Verified Intelligence" className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              </span>
            )}
        </div>
    );
};

const RetailerButton: React.FC<{ link: RetailerLink, primary?: boolean }> = ({ link, primary }) => {
  const isDirect = link.isDirect;
  const name = link.name.toLowerCase();
  
  // Icon resolution logic
  const getIcon = () => {
    if (isDirect) return <Crosshair className="w-4 h-4" />;
    if (name.includes('amazon')) return <ShoppingBag className="w-4 h-4" />;
    if (name.includes('best buy')) return <Store className="w-4 h-4" />;
    if (name.includes('walmart')) return <ShoppingBag className="w-4 h-4" />;
    if (name.includes('google') || name.includes('shopping')) return <Globe className="w-4 h-4" />;
    if (name.includes('target')) return <TargetIcon className="w-4 h-4" />;
    if (name.includes('ebay')) return <Link2 className="w-4 h-4" />;
    return <ExternalLink className="w-4 h-4" />;
  };

  const baseClasses = "flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg w-full uppercase tracking-widest text-[10px]";
  let colorClasses = "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10";
  
  if (primary) {
     colorClasses = isDirect ? "bg-emerald-600 text-white shadow-emerald-900/20 hover:bg-emerald-500" : "bg-indigo-600 text-white shadow-indigo-900/20 hover:bg-indigo-500";
     
     // Specific store branding overrides
     if (name.includes('best buy')) colorClasses = "bg-[#0046be] text-white hover:bg-[#003da6]";
     if (name.includes('amazon')) colorClasses = "bg-[#232F3E] text-white hover:bg-slate-800";
     if (name.includes('walmart')) colorClasses = "bg-[#0071ce] text-white hover:bg-[#005da8]";
     if (name.includes('target')) colorClasses = "bg-[#cc0000] text-white hover:bg-[#a30000]";
  }

  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={`${baseClasses} ${colorClasses}`}>
        {getIcon()}
        <span>{link.name}</span>
    </a>
  );
};

const ScoutRadarOverlay: React.FC = () => (
  <div className="relative w-40 h-40 flex items-center justify-center scale-75 md:scale-100">
    <div className="absolute inset-0 border-[8px] border-indigo-500/10 rounded-full"></div>
    <div className="absolute inset-4 border border-indigo-500/10 rounded-full"></div>
    <div className="absolute inset-8 border border-indigo-500/10 rounded-full"></div>
    <div className="absolute inset-0 border-t-[8px] border-indigo-500 rounded-full animate-spin-slow"></div>
    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_20px_#6366f1] -translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute w-full h-px bg-indigo-500/10 top-1/2"></div>
    <div className="absolute h-full w-px bg-indigo-500/10 left-1/2"></div>
    <div className="absolute top-10 right-12 animate-pulse">
      <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"></div>
    </div>
  </div>
);

const MissionControlCenter: React.FC<{ 
  message: string, 
  query: string, 
  summary?: Briefing,
  marketGuide?: MarketIntel, 
  isLoading: boolean,
  sources?: { title: string, uri: string }[],
  onSaveAll?: () => void,
  onExpand?: () => void,
  hasProducts?: boolean
}> = ({ message, query, summary, marketGuide, isLoading, sources, onSaveAll, onExpand, hasProducts }) => {
  return (
    <div className="w-full bg-slate-900 text-white rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-1000">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] opacity-20 -mr-40 -mt-40 animate-pulse pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="relative group">
             <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 group hover:rotate-6 transition-transform relative z-10 overflow-hidden">
               {isLoading ? <ScoutRadarOverlay /> : <Search className="w-12 h-12 text-indigo-400" />}
             </div>
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {isLoading ? 'Active Intel Mission' : 'Mission Recon Analysis'}: <span className="text-indigo-400">{query}</span>
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
               <span className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                  <Terminal className="w-3 h-3" /> Intel_Verified
               </span>
               <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                  <Globe className="w-3 h-3" /> Grounded_Search
               </span>
               {isLoading && (
                 <span className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> {message}
                 </span>
               )}
            </div>
          </div>
          {!isLoading && hasProducts && (
            <div className="flex flex-col sm:flex-row gap-3">
              {onExpand && (
                <button 
                  onClick={onExpand}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-400" /> Expand Recon Area
                </button>
              )}
              {onSaveAll && (
                <button 
                  onClick={onSaveAll}
                  className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20"
                >
                  <Bookmark className="w-4 h-4" /> Secure All Targets
                </button>
              )}
            </div>
          )}
        </div>

        {summary && (
          <div className="space-y-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Strategic Intel Overview
              </h4>
              <div className="space-y-6 border-l-4 border-indigo-500 pl-8 max-w-4xl">
                <p className="text-lg md:text-2xl text-slate-200 leading-relaxed font-medium italic">
                  "{summary.overview}"
                </p>
                {summary.deepDive && (
                  <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium">
                    {summary.deepDive}
                  </p>
                )}
              </div>
            </div>

            {summary.checklist && summary.checklist.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 md:p-10 space-y-6">
                 <h4 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <TargetIcon className="w-4 h-4" /> Scout's Vital Checklist
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {summary.checklist.map((item, i) => (
                     <div key={i} className="flex items-start gap-3 group">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-300 font-bold text-sm md:text-base leading-tight">{item}</span>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {sources && sources.length > 0 && (
               <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Grounding Sources:</span>
                 {sources.map((s, i) => (
                   <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase border border-indigo-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                     {s.title} <ExternalLink className="w-2.5 h-2.5" />
                   </a>
                 ))}
               </div>
             )}
          </div>
        )}

        {marketGuide && (
          <div className="bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 p-8 md:p-12 relative overflow-hidden group space-y-8">
             <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               <ScrollText className="w-48 h-48 text-white" />
             </div>
             
             <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Lightbulb className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Expert Market Intelligence</h5>
                   <p className="text-xl text-white font-black tracking-tight uppercase">Category Guidance Protocol</p>
                </div>
             </div>

             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <h6 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ronin Advice</h6>
                      <p className="text-base text-slate-300 leading-relaxed font-semibold">
                        {marketGuide.expertAdvice}
                      </p>
                   </div>
                   <div className="space-y-3">
                      <h6 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Technical Nuance</h6>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        {marketGuide.technicalDepth}
                      </p>
                   </div>
                </div>

                <div className="space-y-6">
                   <h6 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical Differentiators</h6>
                   <div className="space-y-4">
                      {marketGuide.keyDifferentiators.map((point, idx) => (
                         <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                            <Sparkles className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                            <span className="text-sm font-bold text-slate-200">{point}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StrategicComparisonMatrix: React.FC<{ products: Product[], currencySymbol: string }> = ({ products, currencySymbol }) => {
  const categories = [
    { key: 'performance', label: 'Power', icon: <Cpu className="w-3.5 h-3.5" />, color: 'text-indigo-500' },
    { key: 'buildQuality', label: 'Build', icon: <Hammer className="w-3.5 h-3.5" />, color: 'text-slate-500' },
    { key: 'featureSet', label: 'Specs', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-violet-500' },
    { key: 'reliability', label: 'Trust', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
    { key: 'userSatisfaction', label: 'Hype', icon: <Users className="w-3.5 h-3.5" />, color: 'text-pink-500' },
    { key: 'efficiency', label: 'Utility', icon: <Activity className="w-3.5 h-3.5" />, color: 'text-blue-500' },
    { key: 'innovation', label: 'Tech', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-amber-500' },
    { key: 'longevity', label: 'Life', icon: <Timer className="w-3.5 h-3.5" />, color: 'text-orange-500' },
    { key: 'ergonomics', label: 'Design', icon: <MousePointer2 className="w-3.5 h-3.5" />, color: 'text-teal-500' },
    { key: 'dealStrength', label: 'Value', icon: <Landmark className="w-3.5 h-3.5" />, color: 'text-rose-500' },
  ];

  return (
    <div className="w-full bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-900 p-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <TableIcon className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">Tactical Intelligence Matrix</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Cross-Target Value Optimization (Deep Logic)</p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
              <Binary className="w-3 h-3" /> Multi-Source_Sync
           </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-left w-64 border-r border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Shinobi Vector</span>
              </th>
              {products.map(p => (
                <th key={p.id} className="p-6 text-center min-w-[200px]">
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{p.brand}</div>
                  <div className="text-sm font-black text-slate-900 line-clamp-1 uppercase">{p.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-emerald-50/30 border-b border-slate-100">
              <td className="p-6 border-r border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Total Score (100)</span>
                </div>
              </td>
              {products.map(p => (
                <td key={p.id} className="p-6 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-4xl font-black text-emerald-600 tracking-tighter">{p.valueScore || 85}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ninja Value</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-indigo-50/30 border-b border-slate-100">
              <td className="p-6 border-r border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100 text-indigo-600">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Brand Sector</span>
                </div>
              </td>
              {products.map(p => (
                <td key={p.id} className="p-6 text-center">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{p.brand}</span>
                </td>
              ))}
            </tr>
            {categories.map((cat, idx) => (
              <tr key={cat.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="p-6 border-r border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-100 ${cat.color}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{cat.label}</div>
                      <div className="text-[9px] font-medium text-slate-400">Shinobi Analysis</div>
                    </div>
                  </div>
                </td>
                {products.map(p => {
                  const val = (p.valueBreakdown as any)?.[cat.key] || 5;
                  return (
                    <td key={p.id} className="p-6">
                       <ScoreBar value={val} label={cat.label} icon={null} color={cat.key === 'dealStrength' ? 'bg-rose-500' : 'bg-indigo-500'} slim />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-slate-900 text-white">
               <td className="p-8 border-r border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                       <Crosshair className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Strike Deal</span>
                  </div>
               </td>
               {products.map(p => (
                 <td key={p.id} className="p-8 text-center">
                    <div className="space-y-4">
                       <div className="text-xl font-black text-indigo-400 leading-none">
                          {currencySymbol}{p.price.toLocaleString()}
                          <div className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-widest">{p.storeName}</div>
                       </div>
                       {p.retailers && p.retailers.length > 0 ? (
                         <div className="flex flex-col gap-2">
                           {p.retailers.slice(0, 2).map((retailer, i) => (
                             <RetailerButton key={i} link={retailer} primary={i === 0} />
                           ))}
                         </div>
                       ) : (
                         <span className="text-[9px] font-black text-slate-500 uppercase">Searching Stores...</span>
                       )}
                    </div>
                 </td>
               ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  products, summary, marketGuide, attributes, suggestions, userValues, 
  onAttributeUpdate, onRefine, onExpand, onPhotoScout, isSearching, isLoadingProducts, 
  query, priceRange, loadingMessage, sources = [], adContent = [],
  location, stage, session, onSaveToVault, onSaveAllToVault, onLocationRequest, onLocationUpdate
}) => {
  const isTransitioning = stage === 'ANALYZING' || stage === 'LOADING_PRODUCTS' || stage === 'SEARCHING';
  const hasResults = products.length > 0;
  const isTracked = (id: string) => session.vault.some(p => p.id === id);

  const getDisplayCurrency = (currency: string) => {
    if (currency === 'CAD' || currency === 'USD' || currency === 'AUD') return '$';
    if (currency === 'EUR') return '€';
    if (currency === 'GBP') return '£';
    return currency || '$';
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
  }, [products]);

  const topProduct = sortedProducts[0];

  return (
    <div className="w-full mx-auto flex flex-col items-center">
      <div className="flex flex-row justify-center w-full px-4 lg:px-10 gap-8">
        
        {/* Left Ad Rail */}
        <aside className="hidden xl:flex flex-col gap-6 w-[200px] py-10 sticky top-24 h-fit shrink-0">
          <AdSenseUnit slotId="RESULTS_SIDE_LEFT_1" className="h-[450px]" type="vertical" />
          <AdSenseUnit slotId="RESULTS_SIDE_LEFT_2" className="h-[250px]" type="rectangle" />
        </aside>

        {/* Main Intelligence Core */}
        <div className="flex-grow max-w-5xl py-10 space-y-12">
          
          {/* Mission Control at top ONLY if no results yet */}
          {(!hasResults) && (
             <MissionControlCenter 
                message={loadingMessage || "Gathering Intel..."} 
                query={query} 
                summary={summary}
                marketGuide={marketGuide}
                isLoading={isTransitioning}
                sources={sources}
             />
          )}

          {hasResults && (
            <div className={`space-y-16 animate-in fade-in duration-1000 ${isTransitioning ? 'opacity-40 pointer-events-none' : ''}`}>
              
              {/* [1] Alpha Target Highlight Card (ABSOLUTE TOP) */}
              {topProduct && (
                <div className="relative overflow-hidden rounded-[3.5rem] shadow-2xl bg-slate-900 text-white border-2 border-indigo-500/30 group">
                  <div className="absolute top-8 right-8 z-20 flex gap-3">
                    <ValueIndicator score={topProduct.valueScore || 95} verified={!!topProduct.sourceUrl} />
                    <button 
                       onClick={() => onSaveToVault(topProduct)}
                       disabled={isTracked(topProduct.id)}
                       className={`p-2.5 rounded-2xl transition-all active:scale-95 disabled:opacity-40 border ${isTracked(topProduct.id) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/20 hover:bg-indigo-600 text-white'}`}
                       title="Save to Arsenal"
                    >
                      {isTracked(topProduct.id) ? <Check className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] opacity-25 -mr-40 -mt-40 transition-all duration-1000 group-hover:opacity-35"></div>
                  </div>
                  <div className="relative z-10 p-10 md:p-14 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-4 md:space-y-6">
                      <div className="inline-flex items-center space-x-2 bg-emerald-500 text-slate-900 px-4 py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase shadow-xl tracking-widest">
                          <Award className="w-4 h-4" /> <span>Alpha Value Target Identified</span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase max-w-xl">
                        <span className="text-indigo-400">{topProduct.brand}</span> {topProduct.name}
                      </h1>
                      <p className="text-slate-300 text-base md:text-xl leading-relaxed max-w-xl font-medium italic opacity-90">"{topProduct.description}"</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-6 md:gap-8 min-w-[300px] md:min-w-[340px]">
                      <div className="flex flex-col items-center md:items-end leading-none">
                        <span className="text-[10px] md:text-[12px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Strike Price</span>
                        <div className="text-5xl md:text-7xl font-black tracking-tighter mb-2">{getDisplayCurrency(topProduct.currency)}{topProduct.price?.toLocaleString()}</div>
                        <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{topProduct.storeName || 'Verified Hub'}</div>
                      </div>
                      <div className="flex flex-col w-full gap-3 md:gap-4">
                         {topProduct.retailers && topProduct.retailers.map((link, idx) => (
                           <RetailerButton key={idx} link={link} primary={idx === 0} />
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* [2] Strategic Comparison Matrix (Deep Data) */}
              <StrategicComparisonMatrix products={sortedProducts} currencySymbol={getDisplayCurrency(sortedProducts[0]?.currency || '$')} />

              {/* [3] Mission Recon Analysis (MOVED BELOW MATRIX) */}
              <MissionControlCenter 
                message={loadingMessage || "Re-calculating..."} 
                query={query} 
                summary={summary}
                marketGuide={marketGuide}
                isLoading={isTransitioning}
                sources={sources}
                onSaveAll={() => onSaveAllToVault?.(products)}
                onExpand={onExpand}
                hasProducts={products.length > 0}
              />

              {/* [4] Recalibration Section */}
              <div className="bg-white rounded-[3.5rem] shadow-xl border-2 border-slate-100 p-10 md:p-14">
                  <div className="flex items-center gap-5 mb-10 pb-6 border-b border-slate-100">
                      <div className="w-14 h-14 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-lg">
                        <SlidersHorizontal className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Mission Re-calibration</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Fine-tune Intelligence Parameters</p>
                      </div>
                  </div>
                  <AttributeForm 
                    suggestions={suggestions} 
                    userValues={userValues} 
                    onUpdateValue={onAttributeUpdate} 
                    onSubmit={onRefine} 
                    onPhotoScout={onPhotoScout}
                    isSearching={isSearching || isLoadingProducts} 
                    priceRange={priceRange} 
                    location={location}
                    onLocationRequest={onLocationRequest}
                    onLocationUpdate={onLocationUpdate}
                  />
              </div>

              {/* Secondary Ad Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <AdSenseUnit slotId="RESULTS_MID_1" className="h-[250px]" type="rectangle" />
                 <AdSenseUnit slotId="RESULTS_MID_2" className="h-[250px]" type="rectangle" />
              </div>
            </div>
          )}
        </div>

        {/* Right Ad Rail */}
        <aside className="hidden xl:flex flex-col gap-6 w-[200px] py-10 sticky top-24 h-fit shrink-0">
          <AdSenseUnit slotId="RESULTS_SIDE_RIGHT_1" className="h-[450px]" type="vertical" />
          <AdSenseUnit slotId="RESULTS_SIDE_RIGHT_2" className="h-[250px]" type="rectangle" />
        </aside>
      </div>
    </div>
  );
};
