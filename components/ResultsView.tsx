import React, { useState, useMemo, useEffect } from 'react';
import { Product, SpecAttribute, PriceRange, RetailerLink, UserLocation, ValueBreakdown, AdUnit, SearchState } from '../types';
import { AttributeForm } from './AttributeForm';
import { Check, ShoppingCart, Award, Loader2, ScanLine, ExternalLink, SlidersHorizontal, Table as TableIcon, Globe, MapPin, Navigation, Zap, ShieldCheck, Store, Search, Link2, TrendingUp, Activity, Sparkles, Cpu, Hammer, Users, Timer, Lightbulb, MousePointer2, Landmark, Megaphone, Crosshair, ScrollText, Binary, Terminal, Radio } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';

interface ResultsViewProps {
  products: Product[];
  summary: string;
  marketGuide?: string;
  attributes: SpecAttribute[];
  suggestions?: string[];
  userValues: Record<string, any>;
  onAttributeUpdate: (key: string, value: any) => void;
  onRefine: () => void;
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
  onLocationRequest?: () => void;
  onLocationUpdate?: (loc: Partial<UserLocation>) => void;
}

const ScoreBar: React.FC<{ value: number, label: string, icon: React.ReactNode, color: string, slim?: boolean }> = ({ value, label, icon, color, slim }) => (
  <div className={`space-y-1 ${slim ? 'flex-1' : ''}`}>
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
      <div className="flex items-center gap-1">
        {icon} {label}
      </div>
      <span className="font-mono">{value}/10</span>
    </div>
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${slim ? 'h-0.5' : 'h-1'}`}>
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out`} 
        style={{ width: `${value * 10}%` }}
      ></div>
    </div>
  </div>
);

const ValueIndicator: React.FC<{ score: number, breakdown?: ValueBreakdown, verified?: boolean }> = ({ score, breakdown, verified }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (s >= 75) return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
        if (s >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    return (
        <div className="group relative">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest cursor-help transition-all hover:scale-105 ${getColor(score)}`}>
                <TrendingUp className="w-3 h-3" />
                Score: {score}
                {verified && (
                  <span title="Scout Verified Intel" className="flex items-center">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 ml-1" />
                  </span>
                )}
            </div>
            {breakdown && (
                <div className="absolute top-full right-0 mt-2 w-72 p-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none scale-95 group-hover:scale-100 origin-top-right">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-50">
                        <ScanLine className="w-5 h-5 text-indigo-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Tactical Value Matrix (10 Points)</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                          { key: 'performance', label: 'Power', icon: <Cpu className="w-3 h-3" />, value: breakdown.performance, color: 'bg-indigo-500' },
                          { key: 'buildQuality', label: 'Build', icon: <Hammer className="w-3 h-3" />, value: breakdown.buildQuality, color: 'bg-slate-500' },
                          { key: 'featureSet', label: 'Specs', icon: <Sparkles className="w-3 h-3" />, value: breakdown.featureSet, color: 'bg-violet-500' },
                          { key: 'reliability', label: 'Trust', icon: <ShieldCheck className="w-3 h-3" />, value: breakdown.reliability, color: 'bg-emerald-500' },
                          { key: 'userSatisfaction', label: 'Hype', icon: <Users className="w-3 h-3" />, value: breakdown.userSatisfaction, color: 'bg-pink-500' },
                          { key: 'efficiency', label: 'Utility', icon: <Activity className="w-3 h-3" />, value: breakdown.efficiency, color: 'bg-blue-500' },
                          { key: 'innovation', label: 'Tech', icon: <Lightbulb className="w-3 h-3" />, value: breakdown.innovation, color: 'bg-amber-500' },
                          { key: 'longevity', label: 'Life', icon: <Timer className="w-3 h-3" />, value: breakdown.longevity, color: 'bg-orange-500' },
                          { key: 'ergonomics', label: 'Design', icon: <MousePointer2 className="w-3 h-3" />, value: breakdown.ergonomics, color: 'bg-teal-500' },
                          { key: 'dealStrength', label: 'Value', icon: <Landmark className="w-3 h-3" />, value: breakdown.dealStrength, color: 'bg-rose-500' },
                        ].map(m => (
                          <ScoreBar key={m.key} value={m.value} label={m.label} icon={m.icon} color={m.color} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const RetailerButton: React.FC<{ link: RetailerLink, primary?: boolean }> = ({ link, primary }) => {
  const isDirect = link.isDirect;
  const isSearch = link.icon === 'maps' || link.name.toLowerCase().includes('hub');
  
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm w-full";
  let colorClasses = "bg-slate-100 text-slate-700 hover:bg-slate-200";
  
  if (primary) {
     colorClasses = isDirect ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700" : "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800";
     if (link.icon === 'bestbuy') colorClasses = "bg-[#0046be] text-white hover:bg-[#003da6]";
     if (link.icon === 'amazon') colorClasses = "bg-[#FF9900] text-black hover:bg-[#ffad33]";
  }

  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={`${baseClasses} ${colorClasses} ${primary ? 'px-6 py-4 text-sm uppercase tracking-widest' : 'text-[10px]'}`}>
        {isDirect ? <Crosshair className="w-4 h-4" /> : (isSearch ? <TableIcon className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />)}
        <span>{link.name}</span>
    </a>
  );
};

const AdCard: React.FC<{ ad: AdUnit }> = ({ ad }) => (
  <div className="group relative bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 hover:border-indigo-500 transition-all hover:shadow-xl overflow-hidden">
    <div className="absolute top-0 right-0 p-4">
      <span className="text-[9px] font-black tracking-widest bg-slate-200 text-slate-500 px-3 py-1 rounded-full uppercase">Tactical Partner</span>
    </div>
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
        <Megaphone className="w-6 h-6 text-indigo-500" />
      </div>
      <div>
        <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{ad.brand}</span>
        <h4 className="font-black text-slate-900 leading-tight text-xl">{ad.headline}</h4>
      </div>
    </div>
    <p className="text-base text-slate-500 mb-8 leading-relaxed line-clamp-2">{ad.description}</p>
    <button className="w-full py-4 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95">
      {ad.cta}
    </button>
  </div>
);

const AdSenseUnit: React.FC<{ slotId?: string, className?: string }> = ({ slotId = "DEFAULT_SLOT", className }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.debug('AdSense init delayed or failed', e);
    }
  }, []);

  return (
    <div className={`bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center p-6 overflow-hidden min-h-[250px] ${className || 'w-full'}`}>
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', height: '100%', minHeight: '200px' }}
           data-ad-client="ca-pub-7036070872302532"
           data-ad-slot={slotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

const AdSection: React.FC<{ adContent?: AdUnit[] }> = ({ adContent }) => {
  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-[3rem] p-10 md:p-14 relative overflow-hidden my-12">
      <div className="absolute top-0 right-0 p-12 opacity-5">
          <Zap className="w-64 h-64 text-indigo-500" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Megaphone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Sponsored Recon Hub</h3>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Global Tactical Partner Matrix</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {adContent && adContent.slice(0, 4).map((ad, i) => (
          <AdCard key={i} ad={ad} />
        ))}
        {/* AdSense filling out the 4-column grid at the bottom */}
        <AdSenseUnit slotId="BOTTOM_PAGE_UNIT_1" />
        <AdSenseUnit slotId="BOTTOM_PAGE_UNIT_2" />
        <AdSenseUnit slotId="BOTTOM_PAGE_UNIT_3" />
        <AdSenseUnit slotId="BOTTOM_PAGE_UNIT_4" />
      </div>
    </div>
  );
};

const ScoutRadarOverlay: React.FC = () => (
  <div className="relative w-40 h-40 flex items-center justify-center">
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
    <div className="absolute bottom-16 left-10 animate-pulse" style={{ animationDelay: '0.4s' }}>
      <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] opacity-60"></div>
    </div>
    <div className="absolute top-20 left-6 animate-pulse" style={{ animationDelay: '0.8s' }}>
       <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_10px_#fbbf24]"></div>
    </div>
  </div>
);

const MissionControlCenter: React.FC<{ 
  message: string, 
  query: string, 
  marketGuide?: string, 
  attributes: SpecAttribute[], 
  isLoading: boolean,
  location?: UserLocation,
  sources?: { title: string, uri: string }[]
}> = ({ message, query, marketGuide, attributes, isLoading, location, sources = [] }) => {
  const protocolMessage = location?.excludeRegionSpecific 
    ? "GLOBAL_DISTRIBUTION_NETWORK_ACTIVE • Skipping physical local nodes for pure online pricing." 
    : location?.localOnly 
        ? "STRICT_LOCAL_ACQUISITION_LOCK • Local sources prioritized within strike radius."
        : "HYBRID_SCALING_ACTIVE • Synchronizing local sources with global online market hubs.";

  return (
    <div className="w-full bg-slate-900 rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-600 rounded-full blur-[200px] opacity-20 -mr-60 -mt-60 animate-pulse pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-5 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                 <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Active Scout Protocol</span>
                 <p className="text-[11px] text-emerald-200 font-bold tracking-tight">
                    {protocolMessage}
                 </p>
              </div>
           </div>
           <div className="hidden md:block flex-1 h-px bg-emerald-500/10 mx-4"></div>
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strike Radius: <span className="text-white">{location?.radius || 50}KM</span></span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left pt-2">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
               {isLoading && (
                 <div className="absolute inset-0 -m-4">
                   <div className="w-full h-full bg-indigo-500/20 blur-xl animate-pulse rounded-full"></div>
                 </div>
               )}
               <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 group hover:rotate-6 transition-transform relative z-10 overflow-hidden">
                 {isLoading ? (
                   <ScoutRadarOverlay />
                 ) : (
                   <Search className="w-12 h-12 text-indigo-400" />
                 )}
               </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                {isLoading ? 'Active Recon Mission' : 'Mission Recon Complete'}: <span className="text-indigo-400 uppercase">{query}</span>
              </h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <span className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    <Terminal className="w-3.5 h-3.5" /> Intelligence_Verified
                 </span>
                 <span className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                    <Globe className="w-3.5 h-3.5" /> Multi-Source_Grounding
                 </span>
                 {isLoading && (
                    <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                      <Radio className="w-3.5 h-3.5" /> Deep Scout Engaged
                    </span>
                 )}
              </div>
            </div>
          </div>
          {isLoading && (
            <div className="flex flex-col items-end gap-3 min-w-[240px] bg-white/5 p-6 rounded-[2rem] border border-white/10">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scout Telemetry Output</span>
               <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div className="h-full bg-indigo-500 animate-[scroll_1.5s_linear_infinite]" style={{ width: '60%' }}></div>
               </div>
               <p className="text-indigo-300 text-[11px] font-mono animate-pulse">{message}...</p>
            </div>
          )}
        </div>

        {/* Full 4-Unit Ad Matrix - Active only during searching to capture high intent */}
        {isLoading && (
          <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-8 duration-1000">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                   <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">Strike Partner Opportunities</h4>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Scouting for relevant tactical deals for "{query}"</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-2 overflow-hidden shadow-2xl transition-all hover:bg-white/10">
                   <AdSenseUnit slotId="LOADING_PHASE_1" className="bg-transparent border-none min-h-[250px]" />
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-2 overflow-hidden shadow-2xl transition-all hover:bg-white/10 hidden md:block">
                   <AdSenseUnit slotId="LOADING_PHASE_2" className="bg-transparent border-none min-h-[250px]" />
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-2 overflow-hidden shadow-2xl transition-all hover:bg-white/10 hidden md:block">
                   <AdSenseUnit slotId="LOADING_PHASE_3" className="bg-transparent border-none min-h-[250px]" />
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-2 overflow-hidden shadow-2xl transition-all hover:bg-white/10 hidden lg:block">
                   <AdSenseUnit slotId="LOADING_PHASE_4" className="bg-transparent border-none min-h-[250px]" />
                </div>
             </div>
          </div>
        )}

        {marketGuide && (
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 md:p-12 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               <ScrollText className="w-48 h-48 text-white" />
             </div>
             
             <div className="flex flex-col gap-8 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <ScrollText className="w-6 h-6 text-white" />
                   </div>
                   <div className="flex-1 text-left">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Strike Intelligence Briefing</h4>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Expert Scout Analysis & Core Advice</p>
                   </div>
                </div>

                <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-semibold italic border-l-4 border-indigo-500/50 pl-8">
                  "{marketGuide}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                   {attributes.slice(0, 4).map((attr, idx) => (
                     <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group/card">
                        <div className="flex items-center gap-3 mb-3">
                          <Binary className="w-4 h-4 text-indigo-400 group-hover/card:scale-125 transition-transform" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strike Vector</span>
                        </div>
                        <h5 className="font-black text-white text-sm mb-2">{attr.label}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Recommendation: <span className="text-indigo-400">{attr.defaultValue || "Market Optimized"}</span></p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {!isLoading && sources && sources.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 relative overflow-hidden">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                   <Link2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">Grounding Intelligence Sources</h4>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Multi-Source Recon Data</p>
                </div>
             </div>
             <div className="flex flex-wrap gap-3">
                {sources.map((source, idx) => (
                   <a 
                     key={idx} 
                     href={source.uri} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-indigo-500/10 rounded-xl text-[11px] font-bold text-indigo-300 transition-all border border-white/5 hover:border-indigo-500/30"
                   >
                     <ExternalLink className="w-3 h-3" />
                     <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                   </a>
                ))}
             </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 font-mono">
             <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                   <Terminal className="w-4 h-4" /> Strike_Module_Buffer
                </div>
                <span className="text-[9px] text-slate-600">Verifying_Grounding_Signals...</span>
             </div>
             <div className="space-y-1.5 opacity-60">
                <p className="text-slate-500 text-[10px] flex items-center gap-2"><span className="text-indigo-500 font-black">STRIKE:</span> Scrubbing local sources & online distribution nodes...</p>
                <p className="text-slate-500 text-[10px] flex items-center gap-2"><span className="text-indigo-500 font-black">STRIKE:</span> Analyzing 10-point value breakdown for all targets...</p>
                <p className="text-slate-500 text-[10px] flex items-center gap-2"><span className="text-indigo-500 font-black">STRIKE:</span> Verifying logistics & local sources...</p>
                <p className="text-emerald-500/50 text-[10px] animate-pulse">{" >>> "} SCANNING_ACTIVE_PRICING_DELTAS...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  products, summary, marketGuide, attributes, suggestions, userValues, 
  onAttributeUpdate, onRefine, isSearching, isLoadingProducts, 
  query, priceRange, regionFlag, loadingMessage, sources = [], adContent = [],
  location, stage, onLocationRequest, onLocationUpdate
}) => {
  const sortedProducts = useMemo(() => {
    if (!products || !products.length) return [];
    return [...products].sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
  }, [products]);

  const allSpecKeys = useMemo(() => {
    if (!sortedProducts.length) return [];
    const keys = new Set<string>();
    sortedProducts.forEach(p => {
      if (p.specs) Object.keys(p.specs).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [sortedProducts]);

  const topProduct = sortedProducts[0];
  const otherProducts = sortedProducts.slice(1);

  const getDisplayCurrency = (currency: string) => {
    if (currency === 'CAD' || currency === 'USD' || currency === 'AUD') return '$';
    if (currency === 'EUR') return '€';
    if (currency === 'GBP') return '£';
    return currency || '$';
  };

  const isTransitioning = stage === 'ANALYZING' || stage === 'LOADING_PRODUCTS' || stage === 'SEARCHING';
  const hasResults = sortedProducts.length > 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-10 md:py-16 min-h-screen">
      <div className={`space-y-16 transition-all duration-700 ${isSearching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex items-center justify-between text-indigo-400 shadow-2xl overflow-hidden relative">
             <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500"></div>
             <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest relative z-10">
               <MapPin className="w-5 h-5" />
               <span>
                  {location?.excludeRegionSpecific ? "GLOBAL_DISTRIBUTION_NETWORK_ACTIVE" : "HYBRID_LOCAL_ONLINE_SCAN_LOCKED"}
               </span>
             </div>
             <div className="flex items-center gap-6 relative z-10">
               <span className="hidden md:flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full text-indigo-300 text-[11px] font-mono border border-indigo-500/30 uppercase tracking-tighter">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> Zero_Payout_Protocol
               </span>
               <span className="text-[11px] font-mono bg-emerald-500/10 px-4 py-2 rounded-full text-emerald-400 uppercase tracking-widest border border-emerald-500/20">Independent_Intel</span>
             </div>
          </div>
        </div>

        {(isTransitioning || !hasResults) && (
           <MissionControlCenter 
              message={loadingMessage || "Deploying Scouts..."} 
              query={query} 
              marketGuide={marketGuide}
              attributes={attributes}
              isLoading={isTransitioning}
              location={location}
              sources={sources}
           />
        )}

        {!isTransitioning && hasResults && (
          <div className="space-y-16 animate-in fade-in duration-1000">
            {topProduct && (
              <div className="relative overflow-hidden rounded-[3.5rem] shadow-2xl bg-slate-900 text-white border-2 border-indigo-500/30">
                <div className="absolute top-8 right-8 z-20">
                  <ValueIndicator score={topProduct.valueScore || 95} breakdown={topProduct.valueBreakdown} verified={!!topProduct.sourceUrl} />
                </div>
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600 rounded-full blur-[180px] opacity-30 -mr-40 -mt-40"></div>
                </div>
                <div className="relative z-10 p-12 md:p-20 flex flex-col lg:flex-row gap-16 items-center">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-3 bg-emerald-500 text-slate-900 px-6 py-3 rounded-full text-[11px] font-black uppercase mb-10 shadow-2xl">
                        <Award className="w-5 h-5" /> <span>Ultimate Value King Identified</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none uppercase">{topProduct.name}</h1>
                    <div className="flex flex-wrap items-center gap-6 mb-10">
                        <span className="flex items-center gap-3 px-6 py-2.5 bg-white/10 rounded-2xl text-[13px] font-black border border-white/10 tracking-widest uppercase">
                            <Store className="w-5 h-5 text-indigo-400" />
                            {topProduct.storeName || 'Verified Target'}
                        </span>
                    </div>
                    <p className="text-slate-300 text-2xl mb-12 leading-relaxed max-w-3xl font-medium">{topProduct.description}</p>
                    
                    {topProduct.valueBreakdown && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                        <ScoreBar value={topProduct.valueBreakdown.performance} label="Power" icon={<Cpu className="w-3 h-3" />} color="bg-indigo-400" />
                        <ScoreBar value={topProduct.valueBreakdown.buildQuality} label="Build" icon={<Hammer className="w-3 h-3" />} color="bg-slate-400" />
                        <ScoreBar value={topProduct.valueBreakdown.featureSet} label="Specs" icon={<Sparkles className="w-3 h-3" />} color="bg-violet-400" />
                        <ScoreBar value={topProduct.valueBreakdown.reliability} label="Trust" icon={<ShieldCheck className="w-3 h-3" />} color="bg-emerald-400" />
                        <ScoreBar value={topProduct.valueBreakdown.userSatisfaction} label="Hype" icon={<Users className="w-3 h-3" />} color="bg-pink-400" />
                        <ScoreBar value={topProduct.valueBreakdown.efficiency} label="Utility" icon={<Activity className="w-3 h-3" />} color="bg-blue-400" />
                        <ScoreBar value={topProduct.valueBreakdown.innovation} label="Tech" icon={<Lightbulb className="w-3 h-3" />} color="bg-amber-400" />
                        <ScoreBar value={topProduct.valueBreakdown.longevity} label="Life" icon={<Timer className="w-3 h-3" />} color="bg-orange-400" />
                        <ScoreBar value={topProduct.valueBreakdown.ergonomics} label="Design" icon={<MousePointer2 className="w-3 h-3" />} color="bg-teal-400" />
                        <ScoreBar value={topProduct.valueBreakdown.dealStrength} label="Value" icon={<Landmark className="w-3 h-3" />} color="bg-rose-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-10 min-w-[380px]">
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Target Price Profile</span>
                      <div className="text-8xl font-black tracking-tighter mb-4">{getDisplayCurrency(topProduct.currency)}{topProduct.price?.toLocaleString()}</div>
                    </div>
                    {topProduct.retailers?.[0] && <RetailerButton link={topProduct.retailers[0]} primary />}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {otherProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 flex flex-col hover:border-indigo-400 transition-all hover:shadow-2xl group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex-1">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors uppercase">{product.brand}</span>
                                <h3 className="font-black text-slate-900 leading-tight text-xl line-clamp-2 uppercase">{product.name}</h3>
                            </div>
                            <div className="text-3xl font-black text-slate-900 pl-6">{getDisplayCurrency(product.currency)}{product.price?.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                                <Store className="w-5 h-5 text-indigo-500" /> {product.storeName}
                             </div>
                             <ValueIndicator score={product.valueScore || 70} breakdown={product.valueBreakdown} verified={!!product.sourceUrl} />
                        </div>
                        <p className="text-base text-slate-500 line-clamp-3 mb-10 flex-1 leading-relaxed">{product.description}</p>
                        {product.retailers?.[0] && <RetailerButton link={product.retailers[0]} primary={product.retailers[0].isDirect} />}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
               <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                      <TableIcon className="w-8 h-8 text-indigo-500" />
                      Complete Tactical Matrix
                    </h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Full cross-reference of target intelligence</p>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5 border-r border-slate-200 sticky left-0 bg-slate-50 z-20">Analysis Vector</th>
                        {sortedProducts.map((p, i) => (
                          <th key={p.id} className={`px-8 py-5 min-w-[300px] ${i === 0 ? 'bg-indigo-50/30' : ''}`}>
                            <div className="flex flex-col">
                              <span className="text-indigo-500 text-[9px] mb-1">{p.brand} {p.storeName}</span>
                              <span className="text-slate-900 font-black truncate">{p.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px] font-bold text-slate-700">
                       <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5 border-r border-slate-200 sticky left-0 bg-white z-20 text-[11px] font-black uppercase tracking-widest">Aggregated Value</td>
                          {sortedProducts.map(p => <td key={p.id} className="px-8 py-5"><ValueIndicator score={p.valueScore || 0} /></td>)}
                       </tr>
                       <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5 border-r border-slate-200 sticky left-0 bg-white z-20 text-[11px] font-black uppercase tracking-widest">Price Point</td>
                          {sortedProducts.map(p => <td key={p.id} className="px-8 py-5 text-xl font-black text-slate-900">{getDisplayCurrency(p.currency)}{p.price?.toLocaleString()}</td>)}
                       </tr>
                       {allSpecKeys.map(key => (
                         <tr key={key} className="hover:bg-slate-50 transition-colors">
                           <td className="px-8 py-4 border-r border-slate-200 sticky left-0 bg-white z-20 text-[11px] font-black uppercase tracking-widest text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</td>
                           {sortedProducts.map(p => <td key={p.id} className="px-8 py-4">{p.specs ? (p.specs[key] || '-') : '-'}</td>)}
                         </tr>
                       ))}
                       {[
                         { k: 'performance', l: 'Performance' }, { k: 'buildQuality', l: 'Build Quality' }, 
                         { k: 'featureSet', l: 'Feature Set' }, { k: 'reliability', l: 'Reliability' }, 
                         { k: 'userSatisfaction', l: 'User Sentiment' }, { k: 'efficiency', l: 'Utility/Efficiency' }, 
                         { k: 'innovation', l: 'Tech Innovation' }, { k: 'longevity', l: 'Longevity/Durability' }, 
                         { k: 'ergonomics', l: 'Design/Ergo' }, { k: 'dealStrength', l: 'Deal Strength' }
                       ].map(metric => (
                        <tr key={metric.k} className="hover:bg-slate-50 transition-colors bg-slate-50/20">
                           <td className="px-8 py-4 border-r border-slate-200 sticky left-0 bg-white z-20 text-[10px] font-black uppercase tracking-widest text-indigo-400">{metric.l}</td>
                           {sortedProducts.map(p => <td key={p.id} className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black">{p.valueBreakdown ? (p.valueBreakdown as any)[metric.k] : '7'}/10</span>
                                <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500" style={{ width: `${(p.valueBreakdown ? (p.valueBreakdown as any)[metric.k] : 7) * 10}%` }}></div>
                                </div>
                              </div>
                           </td>)}
                        </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* Bottom-loaded ad grid ensuring the results page is also monetized */}
            <AdSection adContent={adContent} />

            {!isTransitioning && (
              <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-900 p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <NinjaIcon className="w-80 h-80 text-slate-900" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-12 pb-8 border-b border-slate-100">
                        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
                          <SlidersHorizontal className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Mission Re-calibration</h3>
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Tuning Scouting Parameters for Higher Precision</p>
                        </div>
                    </div>
                    <AttributeForm 
                      suggestions={suggestions} 
                      userValues={userValues} 
                      onUpdateValue={onAttributeUpdate} 
                      onSubmit={onRefine} 
                      isSearching={isSearching || isLoadingProducts} 
                      priceRange={priceRange} 
                      location={location}
                      onLocationRequest={onLocationRequest}
                      onLocationUpdate={onLocationUpdate}
                    />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};