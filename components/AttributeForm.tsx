import React from 'react';
import { PriceRange, UserLocation } from '../types';
import { Loader2, RefreshCw, DollarSign, Search, Plus, MapPin, Target, Navigation, Zap, Globe, Settings2, ShieldCheck } from 'lucide-react';

interface AttributeFormProps {
  suggestions?: string[];
  userValues: Record<string, any>;
  onUpdateValue: (key: string, value: any) => void;
  onSubmit: () => void;
  isSearching: boolean;
  priceRange?: PriceRange;
  location?: UserLocation;
  onLocationRequest?: () => void;
  onLocationUpdate?: (loc: Partial<UserLocation>) => void;
}

export const AttributeForm: React.FC<AttributeFormProps> = ({
  suggestions = [],
  userValues,
  onUpdateValue,
  onSubmit,
  isSearching,
  priceRange,
  location,
  onLocationRequest,
  onLocationUpdate
}) => {
  const suggestedMax = priceRange ? Math.ceil(priceRange.max * 1.5) : 2000;
  const currentMin = userValues['minPrice'] || 0;
  const isUnlimited = userValues['maxPrice'] === null || userValues['maxPrice'] === undefined;
  const currentMax = isUnlimited ? suggestedMax : (userValues['maxPrice'] || suggestedMax);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax - 10);
    onUpdateValue('minPrice', val);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const newMax = Math.max(val, currentMin + 10);
    onUpdateValue('maxPrice', newMax);
  };

  const handleMinInput = (val: string) => {
    const num = parseInt(val) || 0;
    onUpdateValue('minPrice', num);
  };

  const handleMaxInput = (val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
       onUpdateValue('maxPrice', num);
    }
  };

  const toggleUnlimited = () => {
    if (isUnlimited) {
      onUpdateValue('maxPrice', Math.floor(suggestedMax * 0.75));
    } else {
      onUpdateValue('maxPrice', null);
    }
  };

  const handleAddSuggestion = (suggestion: string) => {
    const currentQuery = userValues['customQuery'] || '';
    if (!currentQuery.includes(suggestion)) {
      const newQuery = currentQuery ? `${currentQuery}, ${suggestion}` : suggestion;
      onUpdateValue('customQuery', newQuery);
    }
  };

  const minPercent = (currentMin / suggestedMax) * 100;
  const maxPercent = (currentMax / suggestedMax) * 100;

  return (
    <div className="space-y-8">
      <style>{`
        .range-slider-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          transition: transform 0.1s ease;
          margin-top: -8px;
        }
        .range-slider-thumb::-webkit-slider-thumb:hover { transform: scale(1.1); }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-indigo-500" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Scouting Configuration</h4>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Regional Target (ZIP/Postal)
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={location?.zipCode || ''}
                        onChange={(e) => onLocationUpdate?.({ zipCode: e.target.value, excludeRegionSpecific: false })}
                        placeholder="e.g. M5V 2H1 or 90210"
                        className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all font-bold text-slate-700 disabled:opacity-50"
                        disabled={location?.excludeRegionSpecific}
                    />
                    <button 
                        onClick={onLocationRequest}
                        title="Auto-detect location"
                        className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-sm border ${location?.latitude ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <Target className="w-5 h-5" />
                    </button>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    Search Scope
                </label>
                <button 
                    onClick={() => onLocationUpdate?.({ excludeRegionSpecific: !location?.excludeRegionSpecific })}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${location?.excludeRegionSpecific ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
                >
                    <span className="text-sm font-bold">{location?.excludeRegionSpecific ? 'Global Online Only' : 'Local + Global'}</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${location?.excludeRegionSpecific ? 'bg-white/30' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${location?.excludeRegionSpecific ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                </button>
             </div>

             {!location?.excludeRegionSpecific && (
               <div className="animate-in slide-in-from-top-2 duration-300 space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                          Strike Radius
                      </label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{location?.radius || 50} km</span>
                  </div>
                  <input 
                      type="range" min="5" max="500" step="5"
                      value={location?.radius || 50}
                      onChange={(e) => onLocationUpdate?.({ radius: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                      <span>Tactical (5km)</span>
                      <span>Regional (500km)</span>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Acquisition Intel</h4>
          </div>

          <div className="space-y-6">
             {!location?.excludeRegionSpecific && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Acquisition Mode
                  </label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onLocationUpdate?.({ localOnly: false })}
                      className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!location?.localOnly ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                      Hybrid Scan
                    </button>
                    <button 
                      onClick={() => onLocationUpdate?.({ localOnly: true })}
                      className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${location?.localOnly ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                      Local Pickup Only
                    </button>
                  </div>
                </div>
             )}

             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" /> Price Threshold
                  </label>
                  <button onClick={toggleUnlimited} className={`text-[9px] font-black px-3 py-1 rounded-full transition-all ${isUnlimited ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-200'}`}>
                    {isUnlimited ? 'UNLIMITED' : 'SET CAP'}
                  </button>
                </div>
                
                <div className="relative h-6 mb-4 px-2">
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-slate-200 rounded-full"></div>
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${isUnlimited ? 'bg-indigo-300 opacity-40' : 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)]'}`}
                    style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                  ></div>
                  <input type="range" min={0} max={suggestedMax} value={currentMin} onChange={handleMinChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer range-slider-thumb" style={{ zIndex: 3 }} />
                  {!isUnlimited && <input type="range" min={0} max={suggestedMax} value={currentMax} onChange={handleMaxChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer range-slider-thumb" style={{ zIndex: 4 }} />}
                </div>

                <div className="flex gap-3">
                   <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{priceRange?.currency || '$'}</span>
                      <input type="number" value={currentMin} onChange={(e) => handleMinInput(e.target.value)} className="w-full pl-7 pr-2 py-2 text-xs border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                      <span className="absolute -top-3 left-0 text-[8px] font-black text-slate-300 uppercase">Min</span>
                   </div>
                   <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{priceRange?.currency || '$'}</span>
                      <input 
                        type="number" 
                        value={isUnlimited ? '' : currentMax} 
                        placeholder={isUnlimited ? '∞' : ''}
                        onChange={(e) => handleMaxInput(e.target.value)} 
                        disabled={isUnlimited}
                        className="w-full pl-7 pr-2 py-2 text-xs border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400" 
                      />
                      <span className="absolute -top-3 left-0 text-[8px] font-black text-slate-300 uppercase">Max</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center mb-1">
                  <Search className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Mission Requirements (Specific Specs, Colors, Features)
              </label>
              <textarea
                  value={userValues['customQuery'] || ''}
                  onChange={(e) => onUpdateValue('customQuery', e.target.value)}
                  placeholder="e.g. Matte finish, 120Hz display, mechanical switches..."
                  className="block w-full p-4 text-sm border-slate-200 bg-slate-50 text-slate-900 rounded-2xl min-h-[120px] resize-none font-bold placeholder:font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              />
          </div>

          {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                      <button key={i} onClick={() => handleAddSuggestion(s)} className="inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 uppercase tracking-tight">
                          {s} <Plus className="w-3 h-3 ml-2" />
                      </button>
                  ))}
              </div>
          )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex-1 w-full shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Active Scout Protocol</span>
                <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">
                    {location?.excludeRegionSpecific ? "Ninja will skip local sources and focus on the best prices from worldwide online retailers." : location?.localOnly ? `STRICT MODE: Scouting ONLY physical sources within ${location.radius || 50}km for immediate pickup.` : `Scouting physical sources within ${location.radius || 50}km + global online hubs.`}
                </p>
            </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSearching}
          className="flex items-center justify-center w-full md:w-auto px-12 py-5 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 tracking-widest uppercase"
        >
          {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <RefreshCw className="mr-3 h-5 w-5" />}
          {isSearching ? 'Scouting...' : 'Re-Strike Target'}
        </button>
      </div>
    </div>
  );
};