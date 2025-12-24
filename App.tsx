
import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from './components/Hero';
import { ResultsView } from './components/ResultsView';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AboutUs } from './components/AboutUs';
import { TermsOfService } from './components/TermsOfService';
import { AdminDashboard } from './components/AdminDashboard';
import { analyzeProductCategory, searchProducts, getRegionInfo, resolveRegionFromLocation } from './services/geminiService';
import { SearchState, AdUnit, Product, UserLocation } from './types';
import { NinjaIcon } from './components/NinjaIcon';
import { ShieldCheck, Award, Heart, ShieldAlert, ChevronLeft, X, Info, Terminal, Activity, Zap, Cpu, Globe, AlertCircle } from 'lucide-react';

type View = 'HOME' | 'PRIVACY' | 'ABOUT' | 'TERMS' | 'RESULTS' | 'ADMIN';

interface SystemLog {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppStats {
  totalMissions: number;
  totalValueScouted: number;
  lastMissionTime: string | null;
  history: { name: string; missions: number; value: number }[];
}

interface AffiliateConfig {
  amazonTag: string;
  ebayId: string;
  bestBuyId: string;
  impactId: string;
}

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Initializing Ronin OS v2.5.0...",
    "Syncing Global Scout Nodes...",
    "Verifying Gemini Intelligence Core...",
    "Injecting Zero-Bias Protocol...",
    "System Integrity 100% - Ready for Strike"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return s;
        }
        return s + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,#000_50%),linear-gradient(90deg,rgba(30,58,138,0.1),rgba(30,58,138,0.1),rgba(30,58,138,0.1))] bg-[length:100%_4px,4px_100%]"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-pulse">
          <NinjaIcon className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-white font-black uppercase tracking-[0.5em] text-xs opacity-50">ValuNinja Boot Sequence</h2>
          <div className="h-1 w-64 bg-slate-800 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
          </div>
          <div className="font-mono text-indigo-400 text-xs tracking-wider h-6">
            {steps[step]}
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<{ setView: (v: View) => void }> = ({ setView }) => (
  <footer className="bg-slate-900 text-white pt-20 pb-10 mt-20 relative overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <NinjaIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">ValuNinja</span>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
            The world's first autonomous tactical scout for product discovery. We operate on a zero-bias protocol.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Unbiased Intel
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              <ShieldAlert className="w-4 h-4" /> Affiliate Funded
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <h4 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">The Ninja's Creed</h4>
          <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
            "ValuNinja is a ronin in the digital market—beholden to no master. Our mission is pure: calculate the highest specification for the lowest cost. We are funded by affiliate partnerships; when you strike a deal through our portal, we may earn a bounty at no cost to you. This keeps the scout free and our data objective."
          </p>
          <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <Award className="w-4 h-4 text-amber-500" />
            Scouting Intelligence Verified 2025
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-6">
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          © 2025 ValuNinja Systems. Built for the tactical buyer.
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => { setView('ABOUT'); window.scrollTo(0, 0); }} className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">About Mission</button>
          <button onClick={() => { setView('PRIVACY'); window.scrollTo(0, 0); }} className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Privacy Protocol</button>
          <button onClick={() => { setView('TERMS'); window.scrollTo(0, 0); }} className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">Terms of Engagement</button>
          <button onClick={() => { setView('ADMIN'); window.scrollTo(0, 0); }} className="text-slate-800 hover:text-indigo-400 transition-colors">
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </footer>
);

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem('valuninja-consent');
    if (!consented) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('valuninja-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl border border-indigo-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-sm font-black uppercase tracking-widest mb-1">Scouting Consent Required</h4>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            We use tactical cookies for affiliate tracking and AdSense. By continuing your mission, you accept our <span className="text-indigo-400">Privacy Protocol</span> and the use of tracking for affiliate bounties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={accept} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Accept Protocol</button>
          <button onClick={() => setShow(false)} className="p-3 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<View>('HOME');
  const [state, setState] = useState<SearchState>({
    query: '',
    stage: 'IDLE',
    attributes: [],
    suggestions: [],
    userValues: {},
    results: [],
    location: {
        excludeRegionSpecific: false,
        zipCode: ''
    }
  });

  const [summary, setSummary] = useState<string>("");
  const [region, setRegion] = useState<{name: string, flag: string}>({ name: 'USA', flag: '🇺🇸' });
  const [loadingStep, setLoadingStep] = useState<string>("ValuNinja Scouting Global Inventory...");
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalMissions: 0,
    totalValueScouted: 0,
    lastMissionTime: null,
    history: []
  });

  const [affiliates, setAffiliates] = useState<AffiliateConfig>({
    amazonTag: '',
    ebayId: '',
    bestBuyId: '',
    impactId: ''
  });

  const [adminPasscode, setAdminPasscode] = useState<string>('NINJA2025');

  const addLog = useCallback((msg: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      msg,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const savedStats = localStorage.getItem('valuninja_stats');
    if (savedStats) setStats(JSON.parse(savedStats));

    const savedAffiliates = localStorage.getItem('valuninja_affiliates');
    if (savedAffiliates) setAffiliates(JSON.parse(savedAffiliates));

    const savedPasscode = localStorage.getItem('valuninja_passcode');
    if (savedPasscode) setAdminPasscode(savedPasscode);

    if (!isBooting) {
      addLog('System: Ronin Protocol version 2.5 initialized.', 'info');
      addLog('Security: Operational Integrity Protocol verified.', 'success');
    }
  }, [addLog, isBooting]);

  useEffect(() => {
    localStorage.setItem('valuninja_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('valuninja_affiliates', JSON.stringify(affiliates));
  }, [affiliates]);

  useEffect(() => {
    localStorage.setItem('valuninja_passcode', adminPasscode);
  }, [adminPasscode]);

  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      addLog('Location: Requesting geolocation access...', 'info');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          addLog(`Location: Target acquired at [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`, 'success');
          setState(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude,
              longitude,
              excludeRegionSpecific: false
            }
          }));

          const preciseRegion = await resolveRegionFromLocation(latitude, longitude);
          if (preciseRegion) {
            setRegion({ name: preciseRegion.countryName, flag: preciseRegion.flag });
            addLog(`Region: Re-calibrated to ${preciseRegion.countryName}`, 'info');
          }
        },
        (error) => {
          addLog(`Location: Access denied by user protocol.`, 'warning');
          console.warn("Geolocation denied or failed.", error);
        }
      );
    }
  }, [addLog]);

  useEffect(() => {
    const info = getRegionInfo();
    setRegion({ name: info.countryName, flag: info.flag });
  }, []);

  const handleInitialSearch = async (query: string) => {
    setState(prev => ({ ...prev, query, stage: 'ANALYZING', error: undefined, results: [] }));
    setView('RESULTS');
    setLoadingStep("AI Analyzing Target...");
    addLog(`Mission: Scout target "${query}" identified.`, 'info');
    
    try {
      const { attributes, suggestions, marketGuide, defaultValues, priceRange, adUnits, region: usedRegion } = await analyzeProductCategory(query);

      setRegion({ name: usedRegion.countryName, flag: usedRegion.flag });
      addLog(`AI: Category analysis complete for "${query}".`, 'success');

      setState(prev => ({
        ...prev,
        stage: 'LOADING_PRODUCTS',
        attributes,
        suggestions,
        marketGuide, 
        userValues: defaultValues,
        priceRange,
        adContent: adUnits
      }));

      setLoadingStep(state.location?.excludeRegionSpecific 
        ? "Scouring global online distribution networks..." 
        : "Scrubbing Local Sources (50km) & Online Hubs...");
      
      addLog(`Grounding: Initializing search grounding for ${query}...`, 'info');
        
      const { products, summary: searchSummary, sources: groundingSources, region: resultRegion } = await searchProducts(query, defaultValues, state.location, affiliates);
      
      setRegion({ name: resultRegion.countryName, flag: resultRegion.flag });
      setSummary(searchSummary);
      setSources(groundingSources);
      setState(prev => ({ ...prev, stage: 'RESULTS', results: products }));

      const topPrice = products[0]?.price || 0;
      addLog(`Mission: Success. Found ${products.length} targets. Alpha Target price: ${topPrice}`, 'success');
      
      setStats(prev => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const existingDayIndex = prev.history.findIndex(h => h.name === today);
        let newHistory = [...prev.history];
        
        if (existingDayIndex > -1) {
          newHistory[existingDayIndex] = {
            ...newHistory[existingDayIndex],
            missions: newHistory[existingDayIndex].missions + 1,
            value: newHistory[existingDayIndex].value + topPrice
          };
        } else {
          newHistory.push({ name: today, missions: 1, value: topPrice });
          if (newHistory.length > 7) newHistory.shift();
        }

        return {
          totalMissions: prev.totalMissions + 1,
          totalValueScouted: prev.totalValueScouted + topPrice,
          lastMissionTime: new Date().toISOString(),
          history: newHistory
        };
      });

    } catch (error: any) {
      const errorMsg = error.message || "Unknown mission failure.";
      addLog(`Mission Failure: ${errorMsg}`, 'error');
      setState(prev => ({ ...prev, stage: 'IDLE', error: `Mission aborted: ${errorMsg}` }));
    }
  };

  const handleAttributeUpdate = (key: string, value: any) => {
    setState(prev => ({ ...prev, userValues: { ...prev.userValues, [key]: value } }));
  };

  const updateLocation = (loc: Partial<UserLocation>) => {
    setState(prev => ({ ...prev, location: { ...prev.location, ...loc } }));
  };

  const executeRefinedSearch = async () => {
     addLog(`Mission: Re-calibrating targets for ${state.query}...`, 'info');
     setState(prev => ({ ...prev, stage: 'SEARCHING', error: undefined }));
     try {
       const res = await searchProducts(state.query, state.userValues, state.location, affiliates);
       setRegion({ name: res.region.countryName, flag: res.region.flag });
       setSummary(res.summary);
       setSources(res.sources);
       setState(prev => ({ ...prev, stage: 'RESULTS', results: res.products }));
       addLog(`Mission: Re-calibration complete. Targets updated.`, 'success');
     } catch (e: any) {
       addLog(`Mission: Re-calibration failed.`, 'error');
       setState(prev => ({ ...prev, stage: 'RESULTS', error: `Re-calibration failed: ${e.message}` }));
     }
  }

  const resetSearch = () => {
    setState(prev => ({ ...prev, stage: 'IDLE', query: '', results: [], error: undefined }));
    setView('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200 flex flex-col relative">
      {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      
      <nav className="border-b border-white/50 bg-white/80 sticky top-0 z-50 backdrop-blur-md shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6 cursor-pointer group" onClick={resetSearch}>
             <div className="flex items-center space-x-2">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                 <NinjaIcon className="w-6 h-6 text-white" />
               </div>
               <span className="font-extrabold text-xl leading-none text-slate-900 tracking-tight">ValuNinja</span>
             </div>
             
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Live_Protocol_Active</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {view !== 'HOME' && (
              <button 
                onClick={() => setView('HOME')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Base
              </button>
            )}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:border-indigo-200 transition-colors">
              <span className="text-xl leading-none">{region.flag}</span>
              <span className="text-xs font-bold text-slate-600 tracking-tight">{region.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex-grow transition-opacity duration-1000 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
        {state.error && (
          <div className="max-w-4xl mx-auto mt-10 px-6">
            <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-xl animate-in fade-in slide-in-from-top-4">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight">Strike Aborted</h3>
                <p className="text-rose-700 font-bold leading-relaxed">{state.error}</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={resetSearch} className="px-6 py-2 bg-rose-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-all">Reset Mission</button>
                  <button onClick={() => setView('ADMIN')} className="px-6 py-2 bg-white border border-rose-200 text-rose-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">Review System Logs</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'HOME' && (
          <Hero 
              onSearch={handleInitialSearch} 
              isAnalyzing={state.stage === 'ANALYZING'} 
              location={state.location}
              onLocationUpdate={updateLocation}
              onLocationRequest={requestLocation}
          />
        )}

        {view === 'RESULTS' && (
          <ResultsView 
            query={state.query}
            products={state.results} 
            summary={summary}
            marketGuide={state.marketGuide}
            attributes={state.attributes}
            suggestions={state.suggestions}
            userValues={state.userValues}
            onAttributeUpdate={handleAttributeUpdate}
            onRefine={executeRefinedSearch}
            isSearching={state.stage === 'SEARCHING'}
            isLoadingProducts={state.stage === 'LOADING_PRODUCTS'}
            priceRange={state.priceRange}
            regionFlag={region.flag}
            loadingMessage={loadingStep}
            adContent={state.adContent}
            sources={sources}
            location={state.location}
            onLocationRequest={requestLocation}
            onLocationUpdate={updateLocation}
            stage={state.stage}
          />
        )}

        {view === 'PRIVACY' && <PrivacyPolicy onBack={() => setView('HOME')} />}
        {view === 'ABOUT' && <AboutUs onBack={() => setView('HOME')} />}
        {view === 'TERMS' && <TermsOfService onBack={() => setView('HOME')} />}
        {view === 'ADMIN' && <AdminDashboard 
          onBack={() => setView('HOME')} 
          logs={logs} 
          stats={stats} 
          affiliates={affiliates} 
          onUpdateAffiliates={setAffiliates} 
          currentPasscode={adminPasscode}
          onUpdatePasscode={setAdminPasscode}
          addLog={addLog}
        />}
      </main>

      {!isBooting && (
        <>
          <Footer setView={setView} />
          <CookieConsent />
        </>
      )}
    </div>
  );
};

export default App;
