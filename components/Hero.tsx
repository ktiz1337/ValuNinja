
import React, { useRef } from 'react';
import { Search, MapPin, Target, Globe, Settings2, ShieldCheck, Zap, Navigation, Crosshair, Camera, Award, LineChart, Cpu, Fingerprint, LogIn, RefreshCw, Gift, Layers } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { AdSenseUnit } from './AdSenseUnit';
import { UserLocation } from '../types';

interface HeroProps {
  onSearch: (query: string) => void;
  onPhotoScout: (base64Image: string) => void;
  isAnalyzing: boolean;
  location?: UserLocation;
  resultsLimit: number;
  onResultsLimitUpdate: (limit: number) => void;
  onLocationUpdate: (loc: Partial<UserLocation>) => void;
  onLocationRequest: () => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onSearch, 
  onPhotoScout,
  isAnalyzing, 
  location, 
  resultsLimit,
  onResultsLimitUpdate,
  onLocationUpdate, 
  onLocationRequest,
  isLoggedIn,
  onOpenAuth
}) => {
  const [input, setInput] = React.useState('');
  const [showConfig, setShowConfig] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoScout(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getActiveMode = () => {
    if (location?.excludeRegionSpecific) return 'GLOBAL';
    if (location?.localOnly) return 'LOCAL';
    return 'HYBRID';
  };

  const setMode = (mode: 'GLOBAL' | 'HYBRID' | 'LOCAL') => {
    switch (mode) {
      case 'GLOBAL':
        onLocationUpdate({ excludeRegionSpecific: true, localOnly: false });
        break;
      case 'HYBRID':
        onLocationUpdate({ excludeRegionSpecific: false, localOnly: false });
        break;
      case 'LOCAL':
        onLocationUpdate({ excludeRegionSpecific: false, localOnly: true });
        break;
    }
  };

  return (
    <div className="flex flex-row justify-center w-full px-4 lg:px-10 gap-8 min-h-[85vh] animate-in fade-in slide-in-from-top-6 duration-700">
      
      {/* Side Rail Ad Support during analysis */}
      {isAnalyzing && (
        <aside className="hidden xl:flex flex-col gap-6 w-[200px] py-20 shrink-0">
          <AdSenseUnit slotId="SEARCH_SIDE_LEFT" className="h-[600px]" />
        </aside>
      )}

      <div className="flex flex-col items-center justify-center flex-grow max-w-4xl py-12 md:py-20 text-center">
        <div className="bg-slate-900 p-4 rounded-[2rem] mb-8 shadow-xl shadow-slate-200 group hover:rotate-6 transition-transform">
          <NinjaIcon className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800">Unbiased Shinobi Intelligence Protocol</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-none uppercase">
          Target the Best. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Strike the Deal.</span>
        </h1>
        <p className="text-base md:text-xl text-slate-500 max-w-xl mb-10 leading-relaxed font-medium">
          Identify absolute value across <span className="font-bold text-slate-900">local sources</span> and <span className="font-bold text-slate-900">global markets.</span>
        </p>

        <div className="w-full max-w-2xl space-y-6">
          <div className="relative group">
            <form onSubmit={handleSubmit}>
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Initiate Mission Query or Gift Request..."
                className="block w-full pl-12 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-xl shadow-slate-200/50 text-lg placeholder-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-bold text-slate-800"
                disabled={isAnalyzing}
              />
              <div className="absolute inset-y-2 right-2 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                    title="Optical Sensor"
                >
                    <Camera className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    disabled={!input.trim() || isAnalyzing}
                    className="px-6 py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 focus:outline-none disabled:opacity-50 transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
                >
                    {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Strike'}
                </button>
              </div>
            </form>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
             {[
               { q: 'best gifts for 11 year old', label: '11yr Gifts', icon: <Gift className="w-3 h-3" /> },
               { q: 'top tech gifts 2026', label: '2026 Tech', icon: <Cpu className="w-3 h-3" /> },
               { q: 'gaming setup essentials', label: 'Battlestations', icon: <Zap className="w-3 h-3" /> }
             ].map(s => (
               <button 
                key={s.q} 
                onClick={() => onSearch(s.q)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95"
               >
                 {s.icon} {s.label}
               </button>
             ))}
          </div>

          {!isLoggedIn && (
             <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                   <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                         <Award className="w-3 h-3 text-amber-400" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Shinobi Benefits</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight leading-tight">Elevate Agent Status</h3>
                      <div className="flex flex-wrap gap-2 opacity-80">
                         <span className="text-[9px] font-bold bg-black/20 px-2 py-1 rounded-lg">Price Trends</span>
                         <span className="text-[9px] font-bold bg-black/20 px-2 py-1 rounded-lg">Arsenal Vault</span>
                      </div>
                   </div>
                   <button 
                    onClick={onOpenAuth}
                    className="flex-shrink-0 bg-white text-indigo-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
                   >
                      <LogIn className="w-3.5 h-3.5" /> Secure Identity
                   </button>
                </div>
             </div>
          )}

          <div className="flex flex-col items-center">
              <button 
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest bg-white/50 px-5 py-2.5 rounded-full border border-slate-100 hover:shadow-md"
              >
                  <Settings2 className="w-3 h-3" />
                  Mission Config
              </button>

              <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${showConfig ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-white border-2 border-indigo-50 rounded-[2.5rem] p-8 shadow-xl mt-4 text-left space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                  <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
                                  Strategy Protocol
                              </label>
                              <div className="grid grid-cols-3 p-1 bg-slate-50 rounded-2xl gap-1">
                                  {[
                                      { id: 'GLOBAL', label: 'Global', icon: <Globe className="w-4 h-4" /> },
                                      { id: 'HYBRID', label: 'Hybrid', icon: <Zap className="w-4 h-4" /> },
                                      { id: 'LOCAL', label: 'Local Only', icon: <MapPin className="w-4 h-4" /> }
                                  ].map(m => (
                                      <button
                                          key={m.id}
                                          onClick={() => setMode(m.id as any)}
                                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${getActiveMode() === m.id ? 'bg-white text-slate-900 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                      >
                                          {m.icon}
                                          <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                      Strike Depth (Quantity)
                                  </label>
                                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{resultsLimit} targets</span>
                              </div>
                              <input 
                                  type="range"
                                  min="1"
                                  max="20"
                                  step="1"
                                  value={resultsLimit}
                                  onChange={(e) => onResultsLimitUpdate(parseInt(e.target.value))}
                                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                              />
                              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                  <span>Precision (1)</span>
                                  <span>Deep Intel (20)</span>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                                  Target Sector (ZIP)
                              </label>
                              <div className="flex gap-2">
                                  <input 
                                      type="text"
                                      value={location?.zipCode || ''}
                                      onChange={(e) => onLocationUpdate({ zipCode: e.target.value })}
                                      placeholder="ZIP Code"
                                      className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:outline-none focus:bg-white transition-all font-black text-slate-700 disabled:opacity-50"
                                      disabled={getActiveMode() === 'GLOBAL'}
                                  />
                                  <button 
                                      onClick={onLocationRequest}
                                      disabled={getActiveMode() === 'GLOBAL'}
                                      className={`p-2 rounded-xl transition-all active:scale-90 shadow-lg ${location?.latitude ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}
                                  >
                                      <Target className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>

                          {getActiveMode() !== 'GLOBAL' && (
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                                          Strike Radius
                                      </label>
                                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{location?.radius || 50} km</span>
                                  </div>
                                  <input 
                                      type="range"
                                      min="5"
                                      max="500"
                                      step="5"
                                      value={location?.radius || 50}
                                      onChange={(e) => onLocationUpdate({ radius: parseInt(e.target.value) })}
                                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                  />
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <aside className="hidden xl:flex flex-col gap-6 w-[200px] py-20 shrink-0">
          <AdSenseUnit slotId="SEARCH_SIDE_RIGHT" className="h-[600px]" />
        </aside>
      )}
    </div>
  );
};
