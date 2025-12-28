
import React, { useState, useMemo } from 'react';
import { Product, SpecAttribute, PriceRange, RetailerLink, UserLocation, ValueBreakdown, AdUnit, SearchState, UserSession, Briefing, MarketIntel } from '../types';
import { AttributeForm } from './AttributeForm';
import { AdSenseUnit } from './AdSenseUnit';
import { 
  Check, ShoppingCart, Award, SlidersHorizontal, Table as TableIcon, Globe, MapPin, 
  ShieldCheck, Store, Search, Link2, TrendingUp, Activity, Sparkles, Cpu, Hammer, 
  Users, Timer, Lightbulb, MousePointer2, Landmark, Crosshair, ScrollText, Binary, 
  Terminal, Radio, BookmarkPlus, ShieldAlert, Box, RefreshCw, ShoppingBag, ExternalLink, 
  Target as TargetIcon, CheckCircle2, Bookmark, PlusCircle, Camera, Fingerprint, Eye, Zap,
  Info
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
  resultsLimit: number;
  onResultsLimitUpdate?: (limit: number) => void;
  stage: SearchState['stage'];
  session: UserSession;
  onSaveToVault: (product: Product) => void;
  onSaveAllToVault?: (products: Product[]) => void;
  onLocationRequest?: () => void;
  onLocationUpdate?: (loc: Partial<UserLocation>) => void;
  scoutedImage?: string;
  identification?: SearchState['identification'];
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

const ValueIndicator: React.FC<{ score: number, verified?: boolean, isAffiliate?: boolean }> = ({ score, verified, isAffiliate }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (s >= 75) return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    };

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${getColor(score)}`}>
            {isAffiliate ? <Zap className="w-3.5 h-3.5 fill-current" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {isAffiliate ? 'Alpha Value' : `Value: ${score}`}
            {verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
        </div>
    );
};

const RetailerButton: React.FC<{ link: RetailerLink, primary?: boolean }> = ({ link, primary }) => {
  const name = link.name.toLowerCase();
  
  const getIcon = () => {
    if (name.includes('amazon')) return <ShoppingBag className="w-4 h-4" />;
    if (name.includes('best buy')) return <Store className="w-4 h-4" />;
    if (name.includes('walmart')) return <ShoppingBag className="w-4 h-4" />;
    if (name.includes('target')) return <TargetIcon className="w-4 h-4" />;
    return <ExternalLink className="w-4 h-4" />;
  };

  const baseClasses = "flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg w-full uppercase tracking-widest text-[10px]";
  let colorClasses = "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10";
  
  if (primary) {
     colorClasses = "bg-indigo-600 text-white shadow-indigo-900/20 hover:bg-indigo-500";
     if (name.includes('amazon')) colorClasses = "bg-[#232F3E] text-white hover:bg-slate-800";
     if (name.includes('best buy')) colorClasses = "bg-[#0046be] text-white hover:bg-[#003da6]";
  }

  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={`${baseClasses} ${colorClasses}`}>
        {getIcon()}
        <span>{link.name}</span>
    </a>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  products, summary, marketGuide, attributes, suggestions, userValues, 
  onAttributeUpdate, onRefine, onExpand, onPhotoScout, isSearching, isLoadingProducts, 
  query, priceRange, loadingMessage, sources = [], adContent = [],
  location, resultsLimit, onResultsLimitUpdate, stage, session, onSaveToVault, onSaveAllToVault, onLocationRequest, onLocationUpdate,
  scoutedImage, identification
}) => {
  const isTransitioning = stage === 'ANALYZING' || stage === 'LOADING_PRODUCTS' || stage === 'SEARCHING';
  const hasResults = products.length > 0;

  const getDisplayCurrency = (currency: string) => currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0));
  }, [products]);

  const topProduct = sortedProducts[0];

  return (
    <div className="w-full mx-auto flex flex-col items-center">
      <div className="flex flex-row justify-center w-full px-4 lg:px-10 gap-8">
        
        {/* Ad Rail Left */}
        <aside className="hidden xl:flex flex-col gap-6 w-[220px] py-10 sticky top-24 h-fit shrink-0">
          <AdSenseUnit slotId="SIDEBAR_MONEY_1" className="h-[600px]" type="vertical" />
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Neutral Discovery</h4>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed">Our AI analyzes products independently. Referral links are added automatically only after the best deals are identified.</p>
          </div>
        </aside>

        <div className="flex-grow max-w-5xl py-10 space-y-12">
          {hasResults && topProduct && (
            <div className={`space-y-16 animate-in fade-in duration-1000 ${isTransitioning ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              
              {/* Alpha Target Highlight Card */}
              <div className="relative overflow-hidden rounded-[3.5rem] shadow-2xl bg-slate-900 text-white border-2 border-indigo-500/30 group">
                <div className="absolute top-8 right-8 z-20">
                  <ValueIndicator score={topProduct.valueScore || 95} verified={!!topProduct.sourceUrl} />
                </div>
                <div className="relative z-10 p-10 md:p-14 flex flex-col lg:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-full text-[11px] font-black uppercase shadow-xl tracking-widest">
                        <Award className="w-4 h-4" /> <span>Independent Value Leader</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase">
                      <span className="text-indigo-400">{topProduct.brand}</span> {topProduct.name}
                    </h1>
                    <p className="text-slate-300 text-base md:text-xl leading-relaxed max-w-xl font-medium italic opacity-90">"{topProduct.description}"</p>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-8 min-w-[340px]">
                    <div className="text-5xl md:text-7xl font-black tracking-tighter">{getDisplayCurrency(topProduct.currency)}{topProduct.price?.toLocaleString()}</div>
                    <div className="flex flex-col w-full gap-4">
                       {topProduct.retailers?.slice(0, 3).map((link, idx) => (
                         <RetailerButton key={idx} link={link} primary={idx === 0} />
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Ad Integration (Inline) */}
              <AdSenseUnit slotId="RESULTS_INLINE_1" className="h-[150px] md:h-[120px]" type="auto" />

              {/* Grid for Other Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {sortedProducts.slice(1).map((prod, pIdx) => (
                   <div key={prod.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 flex flex-col hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <ValueIndicator score={prod.valueScore || 80} />
                         <span className="text-2xl font-black text-slate-900">{getDisplayCurrency(prod.currency)}{prod.price.toLocaleString()}</span>
                      </div>
                      <div className="flex-1 space-y-3 mb-8">
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{prod.brand} <span className="text-slate-400">{prod.name}</span></h3>
                         <p className="text-xs text-slate-500 font-medium line-clamp-3 italic">"{prod.description}"</p>
                      </div>
                      <div className="space-y-3">
                         {prod.retailers.slice(0, 2).map((link, lIdx) => (
                           <RetailerButton key={lIdx} link={link} primary={lIdx === 0} />
                         ))}
                      </div>
                   </div>
                 ))}
              </div>

              {/* Mission Transparency Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Info className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Transparency Protocol</h4>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">ValuNinja scouts the entire web independently. If the best price is at a retailer where we have a referral partnership, we may earn a small bounty at no cost to you. If the best price is at a store we have no partnership with, we show it anyway. The mission is always to find <strong>you</strong> the best deal.</p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Ad Rail Right */}
        <aside className="hidden xl:flex flex-col gap-6 w-[220px] py-10 sticky top-24 h-fit shrink-0">
          <AdSenseUnit slotId="SIDEBAR_MONEY_2" className="h-[250px]" type="rectangle" />
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Intel</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">"Shinobi-class accuracy. AI price points are synchronized in real-time."</p>
          </div>
          <AdSenseUnit slotId="SIDEBAR_MONEY_3" className="h-[400px]" type="vertical" />
        </aside>
      </div>
    </div>
  );
};
