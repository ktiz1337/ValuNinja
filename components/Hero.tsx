import React from 'react';
import { Search, MapPin, Target, Globe, Settings2, ShieldCheck, Zap, Navigation } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { UserLocation } from '../types';

interface HeroProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
  location?: UserLocation;
  onLocationUpdate: (loc: Partial<UserLocation>) => void;
  onLocationRequest: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onSearch, 
  isAnalyzing, 
  location, 
  onLocationUpdate, 
  onLocationRequest 
}) => {
  const [input, setInput] = React.useState('');
  const [showConfig, setShowConfig] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
      <div className="bg-slate-900 p-4 rounded-3xl mb-8 shadow-2xl shadow-slate-200 animate-in zoom-in duration-500">
        <NinjaIcon className="w-12 h-12 text-white" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6 animate-in slide-in-from-top-4 duration-700">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-800">Unbiased Ronin Intelligence • No Retailer Payouts</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        Target the Best. <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Strike the Deal.</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed font-medium">
        Stealthy intelligence to identify the absolute best value across <span className="font-bold text-slate-900">local sources</span> and <span className="font-bold text-slate-900">global markets.</span>
      </p>

      <div className="w-full max-w-2xl space-y-4">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Identify target..."
            className="block w-full pl-12 pr-4 py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-lg shadow-slate-100 text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-medium"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isAnalyzing}
            className="absolute inset-y-2 right-2 px-8 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isAnalyzing ? 'Analyzing...' : 'Strike'}
          </button>
        </form>

        <div className="flex flex-col items-center">
            <button 
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-slate-100 mb-4"
            >
                <Settings2 className="w-3 h-3" />
                Scouting Configuration
            </button>

            <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${showConfig ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border-2 border-indigo-50 rounded-2xl p-6 shadow-xl shadow-indigo-100/20 text-left space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-indigo-500" />
                                Regional Target (ZIP/Postal)
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={location?.zipCode || ''}
                                    onChange={(e) => onLocationUpdate({ zipCode: e.target.value, excludeRegionSpecific: false })}
                                    placeholder="e.g. M5V 2H1 or 90210"
                                    className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all font-bold text-slate-700"
                                    disabled={location?.excludeRegionSpecific}
                                />
                                <button 
                                    onClick={onLocationRequest}
                                    title="Auto-detect location"
                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${location?.latitude ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    <Target className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-indigo-500" />
                                Search Scope
                            </label>
                            <button 
                                onClick={() => onLocationUpdate({ excludeRegionSpecific: !location?.excludeRegionSpecific })}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${location?.excludeRegionSpecific ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                                <span className="text-sm font-bold">{location?.excludeRegionSpecific ? 'Global Online Only' : 'Local + Global'}</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${location?.excludeRegionSpecific ? 'bg-white/30' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${location?.excludeRegionSpecific ? 'right-0.5' : 'left-0.5'}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {!location?.excludeRegionSpecific && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <Navigation className="w-3 h-3 text-emerald-500" />
                                        Strike Radius
                                    </label>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{location?.radius || 50} km</span>
                                </div>
                                <input 
                                    type="range"
                                    min="5"
                                    max="500"
                                    step="5"
                                    value={location?.radius || 50}
                                    onChange={(e) => onLocationUpdate({ radius: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                    <span>Tactical (5km)</span>
                                    <span>Regional (500km)</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 text-amber-500" />
                                    Acquisition Mode
                                </label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onLocationUpdate({ localOnly: false })}
                                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!location?.localOnly ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                    >
                                        Hybrid Scan
                                    </button>
                                    <button 
                                        onClick={() => onLocationUpdate({ localOnly: true })}
                                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${location?.localOnly ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                                    >
                                        Local Pickup Only
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            {location?.excludeRegionSpecific 
                                ? "Ninja will skip local sources and focus on the best prices from worldwide online retailers." 
                                : location?.localOnly 
                                    ? `STRICT MODE: Scouting ONLY physical sources within ${location.radius || 50}km for immediate pickup.`
                                    : `Scouting physical sources within ${location.radius || 50}km + global online hubs.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <span className="text-sm text-slate-500 font-medium">Try our new Spec Wars Comparison Engine:</span>
        <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
          <button onClick={() => onSearch("4K OLED TV")} className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-all">4K OLED TV</button>
          <button onClick={() => onSearch("Espresso Machine")} className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-all">Espresso Machine</button>
          <button onClick={() => onSearch("Noise Cancelling Headphones")} className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-all">Headphones</button>
        </div>
      </div>
    </div>
  );
};