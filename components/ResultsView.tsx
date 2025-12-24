import React, { useState, useMemo, useEffect } from 'react';
import { Product, SpecAttribute, PriceRange, RetailerLink, UserLocation, ValueBreakdown, AdUnit } from '../types';
import { AttributeForm } from './AttributeForm';
import { Check, ShoppingCart, Award, Loader2, ScanLine, ExternalLink, SlidersHorizontal, Table as TableIcon, Globe, MapPin, Navigation, Zap, ShieldCheck, Store, Copy, Search, Link2, TrendingUp, Shield, Activity, Sparkles, Cpu, Hammer, Users, Timer, Lightbulb, MousePointer2, Landmark, Megaphone, Info, Crosshair } from 'lucide-react';
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
                {verified && <ShieldCheck className="w-3 h-3 text-emerald-500 ml-1" title="Scout Verified Intel" />}
            </div>
            {breakdown && (
                <div className="absolute top-full right-0 mt-2 w-64 p-5 bg-white border border-slate-200 rounded-[2rem] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none scale-95 group-hover:scale-100 origin-top-right">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
                        <ScanLine className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Tactical Analytics</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { key: 'performance', label: 'Power', icon: <Cpu className="w-3 h-3" />, value: breakdown.performance, color: 'bg-indigo-500' },
                          { key: 'buildQuality', label: 'Build', icon: <Hammer className="w-3 h-3" />, value: breakdown.buildQuality, color: 'bg-slate-500' },
                          { key: 'featureSet', label: 'Specs', icon: <Sparkles className="w-3 h-3" />, value: breakdown.featureSet, color: 'bg-violet-500' },
                          { key: 'reliability', label: 'Trust', icon: <ShieldCheck className="w-3 h-3" />, value: breakdown.reliability, color: 'bg-emerald-500' },
                          { key: 'userSatisfaction', label: 'Hype', icon: <Users className="w-3 h-3" />, value: breakdown.userSatisfaction, color: 'bg-pink-500' },
                          { key: 'efficiency', label: 'Usage', icon: <Activity className="w-3 h-3" />, value: breakdown.efficiency, color: 'bg-blue-500' },
                          { key: 'innovation', label: 'Tech', icon: <Lightbulb className="w-3 h-3" />, value: breakdown.innovation, color: 'bg-amber-500' },
                          { key: 'longevity', label: 'Life', icon: <Timer className="w-3 h-3" />, value: breakdown.longevity, color: 'bg-orange-500' },
                          { key: 'ergonomics', label: 'Design', icon: <MousePointer2 className="w-3 h-3" />, value: breakdown.ergonomics, color: 'bg-teal-500' },
                          { key: 'dealStrength', label: 'Deal', icon: <Landmark className="w-3 h-3" />, value: breakdown.dealStrength, color: 'bg-rose-500' },
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
  const [copied, setCopied] = useState(false);
  const isDirect = link.isDirect;
  const isSearch = link.icon === 'maps' || link.name.toLowerCase().includes('hub');
  
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-sm";
  let colorClasses = "bg-slate-100 text-slate-700 hover:bg-slate-200";
  
  if (primary) {
     colorClasses = isDirect ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700" : "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800";
     if (link.icon === 'bestbuy') colorClasses = "bg-[#0046be] text-white hover:bg-[#003da6]";
     if (link.icon === 'amazon') colorClasses = "bg-[#FF9900] text-black hover:bg-[#ffad33]";
  } else {
     if (link.icon === 'bestbuy') colorClasses = "bg-blue-50 text-[#0046be] hover:bg-blue-100 border border-blue-200";
     if (link.icon === 'amazon') colorClasses = "bg-orange-50 text-[#cc7a00] hover:bg-orange-100 border border-orange-200";
     if (link.icon === 'google' || link.icon === 'maps' || link.icon === 'generic') colorClasses = "bg-slate-50 text-slate-600 hover:bg-white border border-slate-200";
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 w-full md:w-auto">
        <div className="flex gap-1 w-full">
            <a href={link.url} target="_blank" rel="noreferrer" className={`${baseClasses} ${colorClasses} ${primary ? 'flex-1 px-6 py-4 text-base' : 'text-[9px]'}`}>
                {isDirect ? <Crosshair className="w-4 h-4" /> : (isSearch ? <TableIcon className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />)}
                <div className="flex flex-col items-start leading-tight">
                    <span className="truncate max-w-[140px]">{link.name}</span>
                    {primary && (
                      <span className="text-[9px] opacity-80 font-normal uppercase tracking-tighter">
                        {isDirect ? 'Direct Strike Protocol' : 'Verified Tactical Hub'}
                      </span>
                    )}
                </div>
            </a>
            <button 
                onClick={handleCopy}
                className={`px-3 rounded-xl border transition-all ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
            >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        </div>
        {isDirect && (
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-right px-1">Affiliate bounty may apply</span>
        )}
    </div>
  );
};

const AdCard: React.FC<{ ad: AdUnit }> = ({ ad }) => (
  <div className="group relative bg-slate-50 border border-slate-200 rounded-[2rem] p-6 hover:border-indigo-500 transition-all hover:shadow-xl overflow-hidden">
    <div className="absolute top-0 right-0 p-4">
      <span className="text-[8px] font-black tracking-widest bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase">Tactical Partner</span>
    </div>
    <div className="flex items-start gap-4 mb-4">
      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:rotate-6 transition-transform">
        <Megaphone className="w-5 h-5 text-indigo-500" />
      </div>
      <div>
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{ad.brand}</span>
        <h4 className="font-black text-slate-900 leading-tight">{ad.headline}</h4>
      </div>
    </div>
    <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2">{ad.description}</p>
    <button className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95">
      {ad.cta}
    </button>
  </div>
);

const AdSection: React.FC<{ adContent?: AdUnit[] }> = ({ adContent }) => {
  // Production Note: When AdSense is approved, you will inject the <ins> tag here.
  // The current AI-generated ads act as high-quality placeholders.
  useEffect(() => {
    try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="w-48 h-48 text-indigo-500" />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Sponsored Recon</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Partner Missions & Related Targets</p>
          </div>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-indigo-100 flex items-start gap-3 max-w-md shadow-sm">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
            Ad Statement: These tactical ads are provided by partners but do NOT impact our commitment to providing you with objective value. Our independent rankings remain shielded from third-party influence.
          </p>
        </div>
      </div>

      {/* ADSENSE PLACEHOLDER (Will show live ads once approved) */}
      <div className="mb-10 w-full flex justify-center">
         {/* 
         <ins className="adsbygoogle"
              style={{display: 'block', textAlign: 'center'}}
              data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
              data-ad-slot="YOUR_AD_SLOT_ID"></ins>
         */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {adContent && adContent.map((ad, i) => (
          <AdCard key={i} ad={ad} />
        ))}
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  products, summary, marketGuide, attributes, suggestions, userValues, 
  onAttributeUpdate, onRefine, isSearching, isLoadingProducts, 
  query, priceRange, regionFlag, loadingMessage, sources = [], adContent = [],
  location, onLocationRequest, onLocationUpdate
}) => {
  const sortedProducts = useMemo(() => {
    if (!products || !products.length) return [];
    return [...products].sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
  }, [products]);

  const topProduct = sortedProducts[0];
  const otherProducts = sortedProducts.slice(1);
  const allSpecKeys = useMemo(() => {
    if (!sortedProducts.length) return [];
    return Array.from(new Set(sortedProducts.flatMap(p => p.specs ? Object.keys(p.specs) : []))) as string[];
  }, [sortedProducts]);

  const getDisplayCurrency = (currency: string) => {
    if (currency === 'CAD' || currency === 'USD' || currency === 'AUD') return '$';
    if (currency === 'EUR') return '€';
    if (currency === 'GBP') return '£';
    return currency || '$';
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-6 md:py-8">
      <div className={`space-y-12 transition-opacity duration-300 ${isSearching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Status Hub */}
        <div className="flex flex-col md:flex-row gap-3">
          {location && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-indigo-400 animate-in slide-in-from-top-2 duration-300 shadow-xl">
               <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                 <MapPin className="w-4 h-4" />
                 <span>
                    {location.excludeRegionSpecific ? "GLOBAL_DISTRIBUTION_NETWORK_ACTIVE" : "HYBRID_LOCAL_ONLINE_SCAN_LOCKED"}
                 </span>
               </div>
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-mono bg-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-300 flex items-center gap-2 border border-indigo-500/30 uppercase tracking-tighter">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" /> Zero_Payout_Protocol
                 </span>
                 <span className="text-[10px] font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full text-emerald-400 uppercase tracking-widest border border-emerald-500/20">Independent_Intel</span>
               </div>
            </div>
          )}
        </div>

        {/* LOADING STATE WITH ADS */}
        {isLoadingProducts && (
           <div className="animate-in fade-in duration-700 space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 min-h-[400px] flex flex-col items-center justify-center border border-slate-800 shadow-2xl p-12 text-center">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40"></div>
                    <div className="z-10 w-full max-w-4xl flex flex-col items-center">
                       <div className="mb-12 flex items-center space-x-4 bg-slate-800/50 backdrop-blur-md px-8 py-3 rounded-full border border-slate-700/50 animate-pulse">
                         <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                         <span className="text-indigo-200 font-black tracking-widest text-sm uppercase">{loadingMessage}</span>
                       </div>
                       <div className="mb-6">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Targeting Value: <span className="text-indigo-400">{query}</span></h2>
                            <p className="text-xl text-slate-300 max-w-3xl mx-auto italic font-medium leading-relaxed opacity-80">"{marketGuide}"</p>
                       </div>
                    </div>
                </div>
             </div>
             <AdSection adContent={adContent} />
           </div>
        )}

        {/* RESULTS STATE */}
        {!isLoadingProducts && sortedProducts.length > 0 && (
          <>
            {/* ALPHA TARGET */}
            {topProduct && (
              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-slate-900 text-white border-2 border-indigo-500/30">
                <div className="absolute top-6 right-6 z-20">
                  <ValueIndicator score={topProduct.valueScore || 95} breakdown={topProduct.valueBreakdown} verified={!!topProduct.directUrl} />
                </div>
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px] opacity-30 -mr-30 -mt-30"></div>
                </div>
                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 bg-emerald-500 text-slate-900 px-5 py-2 rounded-full text-xs font-black uppercase mb-8 shadow-xl">
                        <Award className="w-4 h-4" /> <span>Ultimate Value King Acquired</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">{topProduct.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <span className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-xl text-xs font-black border border-white/10 tracking-widest uppercase">
                            <Store className="w-4 h-4 text-indigo-400" />
                            {topProduct.storeName || 'Verified Target'}
                        </span>
                        <span className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-black border border-indigo-500/20 tracking-widest uppercase">
                            <Search className="w-4 h-4" /> Recon complete: {topProduct.directUrl ? 'SOURCE_LOCKED' : 'HUB_ACTIVE'}
                        </span>
                    </div>
                    <p className="text-slate-300 text-xl mb-10 leading-relaxed max-w-2xl font-medium">{topProduct.description}</p>
                    
                    {/* Expanded Tactical Breakdown for Hero */}
                    {topProduct.valueBreakdown && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10 bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                        <ScoreBar value={topProduct.valueBreakdown.performance} label="Power" icon={<Cpu className="w-2.5 h-2.5" />} color="bg-indigo-400" />
                        <ScoreBar value={topProduct.valueBreakdown.buildQuality} label="Build" icon={<Hammer className="w-2.5 h-2.5" />} color="bg-slate-400" />
                        <ScoreBar value={topProduct.valueBreakdown.featureSet} label="Specs" icon={<Sparkles className="w-2.5 h-2.5" />} color="bg-violet-400" />
                        <ScoreBar value={topProduct.valueBreakdown.reliability} label="Trust" icon={<ShieldCheck className="w-2.5 h-2.5" />} color="bg-emerald-400" />
                        <ScoreBar value={topProduct.valueBreakdown.userSatisfaction} label="Hype" icon={<Users className="w-2.5 h-2.5" />} color="bg-pink-400" />
                        <ScoreBar value={topProduct.valueBreakdown.efficiency} label="Usage" icon={<Activity className="w-2.5 h-2.5" />} color="bg-blue-400" />
                        <ScoreBar value={topProduct.valueBreakdown.innovation} label="Tech" icon={<Lightbulb className="w-2.5 h-2.5" />} color="bg-amber-400" />
                        <ScoreBar value={topProduct.valueBreakdown.longevity} label="Life" icon={<Timer className="w-2.5 h-2.5" />} color="bg-orange-400" />
                        <ScoreBar value={topProduct.valueBreakdown.ergonomics} label="Design" icon={<MousePointer2 className="w-2.5 h-2.5" />} color="bg-teal-400" />
                        <ScoreBar value={topProduct.valueBreakdown.dealStrength} label="Deal" icon={<Landmark className="w-2.5 h-2.5" />} color="bg-rose-400" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topProduct.pros.slice(0, 4).map((pro, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-emerald-400 font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> {pro}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-8 min-w-[320px]">
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Estimated Target Price</span>
                      <div className="text-7xl font-black tracking-tighter mb-2">{getDisplayCurrency(topProduct.currency)}{topProduct.price?.toLocaleString()}</div>
                    </div>
                    <RetailerButton 
                        link={topProduct.retailers[0]} 
                        primary 
                    />
                    <RetailerButton 
                        link={topProduct.retailers[1]} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ADVERTISING INTELLIGENCE SECTION */}
            <AdSection adContent={adContent} />

            {/* SECONDARY TARGETS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {otherProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col hover:border-indigo-400 transition-all hover:shadow-2xl group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{product.brand}</span>
                                <h3 className="font-black text-slate-900 leading-tight text-lg line-clamp-2">{product.name}</h3>
                            </div>
                            <div className="text-2xl font-black text-slate-900 pl-4">{getDisplayCurrency(product.currency)}{product.price?.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                <Store className="w-4 h-4 text-indigo-500" /> {product.storeName}
                             </div>
                             <ValueIndicator score={product.valueScore || 70} breakdown={product.valueBreakdown} verified={!!product.directUrl} />
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-8 flex-1 leading-relaxed">{product.description}</p>
                        <RetailerButton link={product.retailers[0]} primary={product.retailers[0].isDirect} />
                    </div>
                ))}
            </div>

            {/* MATRIX */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <TableIcon className="w-6 h-6 text-indigo-500" />
                    Complete Tactical Matrix
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-indigo-900 px-4 py-2 rounded-xl text-white shadow-lg">
                        <ShieldCheck className="w-4 h-4 text-indigo-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Scout Intel Verified</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Links may generate affiliate bounties</span>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-4 py-4 border-b border-r sticky left-0 bg-slate-50 z-20 min-w-[160px]">Intelligence Vector</th>
                        {sortedProducts.map((p, i) => (
                          <th key={p.id} className={`px-4 py-4 border-b min-w-[260px] ${i === 0 ? 'bg-indigo-50/30' : ''}`}>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-indigo-500 mb-0.5 font-black tracking-widest flex items-center gap-1">
                                {p.storeName} {p.directUrl && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />}
                              </span>
                              <span className="truncate font-black text-slate-900 text-xs">{p.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                         <td className="px-4 py-3 font-black border-r sticky left-0 bg-white z-20 text-slate-900 uppercase tracking-widest text-[10px]">Aggregated Value</td>
                         {sortedProducts.map(p => <td key={p.id} className="px-4 py-3"><ValueIndicator score={p.valueScore || 0} breakdown={p.valueBreakdown} verified={!!p.directUrl} /></td>)}
                      </tr>
                      {/* COMPACT MATRIX ROWS */}
                      {[
                        { key: 'performance', label: 'Performance', icon: <Cpu className="w-3 h-3" />, color: 'bg-indigo-500' },
                        { key: 'buildQuality', label: 'Build Quality', icon: <Hammer className="w-3 h-3" />, color: 'bg-slate-500' },
                        { key: 'featureSet', label: 'Feature Set', icon: <Sparkles className="w-3 h-3" />, color: 'bg-violet-500' },
                        { key: 'reliability', label: 'Reliability', icon: <ShieldCheck className="w-3 h-3" />, color: 'bg-emerald-500' },
                        { key: 'userSatisfaction', label: 'User Satisfaction', icon: <Users className="w-3 h-3" />, color: 'bg-pink-500' },
                        { key: 'efficiency', label: 'Efficiency', icon: <Activity className="w-3 h-3" />, color: 'bg-blue-500' },
                        { key: 'innovation', label: 'Innovation', icon: <Lightbulb className="w-3 h-3" />, color: 'bg-amber-500' },
                        { key: 'longevity', label: 'Longevity', icon: <Timer className="w-3 h-3" />, color: 'bg-orange-500' },
                        { key: 'ergonomics', label: 'Ergonomics', icon: <MousePointer2 className="w-3 h-3" />, color: 'bg-teal-500' },
                        { key: 'dealStrength', label: 'Deal Strength', icon: <Landmark className="w-3 h-3" />, color: 'bg-rose-500' },
                      ].map(metric => (
                        <tr key={metric.key} className="bg-slate-50/30 group">
                           <td className="px-4 py-1.5 font-black border-r sticky left-0 bg-slate-50 z-20 text-slate-400 uppercase tracking-widest text-[8px] flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                             {metric.icon} {metric.label}
                           </td>
                           {sortedProducts.map(p => {
                             const val = (p.valueBreakdown as any)?.[metric.key] || 0;
                             return (
                               <td key={p.id} className="px-4 py-1.5">
                                 <div className="flex items-center gap-2 max-w-[100px]">
                                   <div className="flex-1 bg-slate-200 h-0.5 rounded-full overflow-hidden">
                                     <div className={`${metric.color} h-full transition-all duration-700`} style={{ width: `${val * 10}%` }}></div>
                                   </div>
                                   <span className="text-[8px] font-mono font-bold text-slate-400 min-w-[1rem] text-right">{val}</span>
                                 </div>
                               </td>
                             );
                           })}
                        </tr>
                      ))}

                      <tr className="hover:bg-slate-50/50">
                         <td className="px-4 py-4 font-black border-r sticky left-0 bg-white z-20 text-slate-900 uppercase tracking-widest text-[10px]">Estimated Price</td>
                         {sortedProducts.map(p => <td key={p.id} className="px-4 py-4 font-mono font-black text-slate-900 text-xl">{getDisplayCurrency(p.currency)}{p.price?.toLocaleString()}</td>)}
                      </tr>
                      {allSpecKeys.map(key => (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-400 border-r sticky left-0 bg-white z-20 font-black uppercase text-[9px] tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</td>
                          {sortedProducts.map(p => <td key={p.id} className="px-4 py-3 text-slate-700 font-bold text-[11px]">{p.specs ? (p.specs[key] || '-') : '-'}</td>)}
                        </tr>
                      ))}
                      <tr className="bg-slate-900">
                         <td className="px-4 py-6 font-black text-indigo-400 border-r sticky left-0 bg-slate-900 z-20 uppercase tracking-widest text-center text-[10px]">Deploy Scout</td>
                         {sortedProducts.map(p => (
                           <td key={p.id} className="px-4 py-6 text-center">
                             <a href={p.retailers[0].url} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 ${p.retailers[0].isDirect ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900'} rounded-xl font-black uppercase tracking-[0.1em] hover:scale-105 transition-all shadow-xl active:scale-95 text-[10px]`}>
                               {p.retailers[0].isDirect ? <Crosshair className="w-4 h-4" /> : <Search className="w-4 h-4 text-indigo-500" />}
                               {p.retailers[0].isDirect ? 'Direct Strike' : 'Scout Deals'}
                             </a>
                           </td>
                         ))}
                      </tr>
                    </tbody>
                 </table>
               </div>
            </div>

            {/* MISSION RE-CALIBRATION */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-900 p-8 md:p-14 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <NinjaIcon className="w-64 h-64 text-slate-900" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <SlidersHorizontal className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Mission Re-calibration</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tuning Scouting Parameters for Higher Precision</p>
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

            {/* NETWORK TRACE */}
            <div className="bg-slate-100/50 rounded-[2rem] p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-5 h-5 text-indigo-500" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Scouting Intelligence Network</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {sources && sources.length > 0 ? sources.map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:shadow-lg transition-all">
                    {source.uri.includes('amazon') ? <ShoppingCart className="w-4 h-4 mr-3" /> : <Link2 className="w-4 h-4 mr-3" />}
                    <span className="truncate max-w-[250px]">{source.title}</span>
                    <ExternalLink className="w-3 h-3 ml-3 opacity-20" />
                  </a>
                )) : (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global search protocol active. Deploy scout on specific items for direct links.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};