
import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from './components/Hero';
import { ResultsView } from './components/ResultsView';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AboutUs } from './components/AboutUs';
import { TermsOfService } from './components/TermsOfService';
import { AdminDashboard } from './components/AdminDashboard';
import { analyzeProductCategory, searchProducts } from './services/geminiService';
import { SearchState, AdUnit, Product, UserLocation } from './types';
import { NinjaIcon } from './components/NinjaIcon';
import { ShieldCheck, Award, AlertCircle, Terminal, Activity, Zap, Cpu, Key, ExternalLink } from 'lucide-react';

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
  const steps = ["Ronin OS Protocol...", "Initialising Hybrid Nodes...", "Verifying Core...", "Strike Protocol Ready"];
  
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
    }, 400);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-pulse">
        <NinjaIcon className="w-8 h-8 text-white" />
      </div>
      <div className="font-mono text-indigo-400 text-xs tracking-wider uppercase">{steps[step]}</div>
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
      localOnly: false,
      radius: 50,
      zipCode: '' 
    }
  });
  const [summary, setSummary] = useState<string>("");
  const [region, setRegion] = useState<{name: string, flag: string}>({ name: 'USA', flag: '🇺🇸' });
  const [loadingStep, setLoadingStep] = useState<string>("Initializing...");
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AppStats>({ totalMissions: 0, totalValueScouted: 0, lastMissionTime: null, history: [] });
  const [affiliates, setAffiliates] = useState<AffiliateConfig>({ amazonTag: '', ebayId: '', bestBuyId: '', impactId: '' });
  const [adminPasscode, setAdminPasscode] = useState<string>('NINJA2025');
  const [requiresKeySelection, setRequiresKeySelection] = useState(false);

  const addLog = useCallback((msg: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = { id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleTimeString(), msg, type };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const checkKeyStatus = useCallback(async () => {
    // @ts-ignore
    if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && !process.env.API_KEY) {
            setRequiresKeySelection(true);
            return false;
        }
    }
    return true;
  }, []);

  const handleOpenKeySelection = async () => {
      // @ts-ignore
      if (window.aistudio) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
          // Mitigate race condition: Assume success and proceed
          setRequiresKeySelection(false);
          addLog("Resuming scouting protocol...", "success");
      }
  };

  const requestLocation = useCallback((): Promise<Partial<UserLocation>> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        addLog("Geolocation not supported.", "warning");
        resolve({});
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          addLog("GPS Lock acquired.", "success");
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (error) => {
          addLog(`GPS Failed: ${error.message}`, "warning");
          resolve({});
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }, [addLog]);

  useEffect(() => {
    const savedStats = localStorage.getItem('valuninja_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedAffiliates = localStorage.getItem('valuninja_affiliates');
    if (savedAffiliates) setAffiliates(JSON.parse(savedAffiliates));
    
    checkKeyStatus();
  }, [checkKeyStatus]);

  const handleInitialSearch = async (query: string) => {
    const keyReady = await checkKeyStatus();
    if (!keyReady) {
        addLog("API Key missing. Master Key Selection required.", "error");
        return;
    }

    let currentLocation = state.location;

    if (!state.location.excludeRegionSpecific && !state.location.latitude) {
      setView('RESULTS');
      setLoadingStep("Acquiring GPS Target...");
      const locUpdate = await requestLocation();
      currentLocation = { ...state.location, ...locUpdate };
      setState(prev => ({ ...prev, location: currentLocation }));
    }

    setState(prev => ({ ...prev, query, stage: 'ANALYZING', error: undefined, results: [] }));
    setView('RESULTS');
    setLoadingStep("Scouting Market Conditions...");
    
    try {
      const res = await analyzeProductCategory(query);
      setRegion({ name: res.region.countryName, flag: res.region.flag });
      setState(prev => ({ ...prev, stage: 'LOADING_PRODUCTS', attributes: res.attributes, suggestions: res.suggestions, marketGuide: res.marketGuide, userValues: res.defaultValues, priceRange: res.priceRange, adContent: res.adUnits }));
      setLoadingStep("Extracting Top Targets...");
      
      const searchRes = await searchProducts(query, res.defaultValues, currentLocation, affiliates);
      setSummary(searchRes.summary);
      setSources(searchRes.sources);
      setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
      addLog(`Strike complete. Verified targets identified.`, 'success');
    } catch (error: any) {
      let msg = error.message;
      // Handle the specific "Requested entity was not found" error by prompting for key re-selection
      if (msg.includes("API Key") || msg.includes("Requested entity was not found")) {
          setRequiresKeySelection(true);
          msg = "Security link failed. Please select an active API Key from a paid GCP project.";
      }
      addLog(`Strike Aborted: ${msg}`, 'error');
      setState(prev => ({ ...prev, stage: 'IDLE', error: `Mission Aborted: ${msg}` }));
    }
  };

  const resetSearch = () => { setView('HOME'); setState(prev => ({ ...prev, stage: 'IDLE', query: '', results: [], error: undefined })); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      
      <nav className="border-b bg-white/80 sticky top-0 z-50 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center"><NinjaIcon className="w-5 h-5 text-white" /></div>
          <div>
            <span className="font-extrabold text-lg block leading-none">ValuNinja</span>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">Intelligence Scout</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {view !== 'HOME' && <button onClick={() => setView('HOME')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Back to Base</button>}
          <div className="text-xs font-bold text-slate-600 bg-white border px-3 py-1 rounded-full shadow-sm">{region.flag} {region.name}</div>
        </div>
      </nav>

      <main className="flex-grow">
        {requiresKeySelection && (
            <div className="max-w-4xl mx-auto mt-10 px-6 animate-in zoom-in duration-300">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-16 flex flex-col items-center text-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10"><Key className="w-48 h-48" /></div>
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl relative z-10"><Key className="w-10 h-10 text-white" /></div>
                    <div className="space-y-4 relative z-10 max-w-xl">
                        <h2 className="text-4xl font-black tracking-tight uppercase">Master Key Selection</h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                            To get real prices and links securely, ValuNinja requires an active Gemini API Key from a paid project.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
                            <button 
                                onClick={handleOpenKeySelection}
                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Select Master Key
                            </button>
                            <a 
                                href="https://ai.google.dev/gemini-api/docs/billing" 
                                target="_blank" rel="noreferrer"
                                className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                Billing Docs <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {state.error && !requiresKeySelection && (
          <div className="max-w-4xl mx-auto mt-10 px-6">
            <div className="bg-rose-50 border border-rose-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0"><AlertCircle className="w-8 h-8 text-white" /></div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight">Mission Aborted</h3>
                <p className="text-rose-700 font-bold leading-relaxed">{state.error}</p>
                <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                  <button onClick={resetSearch} className="px-6 py-3 bg-rose-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-all">Retry Scouting</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!requiresKeySelection && view === 'HOME' && (
          <Hero 
            onSearch={handleInitialSearch} 
            isAnalyzing={state.stage === 'ANALYZING' || loadingStep === "Acquiring GPS Target..."} 
            location={state.location} 
            onLocationUpdate={(l) => setState(p => ({ ...p, location: { ...p.location, ...l } }))} 
            onLocationRequest={async () => {
              const loc = await requestLocation();
              setState(p => ({ ...p, location: { ...p.location, ...loc } }));
            }} 
          />
        )}
        {!requiresKeySelection && view === 'RESULTS' && (
          <ResultsView 
            {...state} 
            products={state.results}
            isSearching={state.stage === 'SEARCHING' || state.stage === 'ANALYZING' || loadingStep === "Acquiring GPS Target..."}
            summary={summary} 
            isLoadingProducts={state.stage === 'LOADING_PRODUCTS'} 
            query={state.query} 
            loadingMessage={loadingStep} 
            sources={sources} 
            onAttributeUpdate={(k, v) => setState(p => ({ ...p, userValues: { ...p.userValues, [k]: v } }))} 
            onRefine={async () => {
                const keyReady = await checkKeyStatus();
                if (!keyReady) return;
                setState(prev => ({ ...prev, stage: 'SEARCHING' }));
                try {
                  const searchRes = await searchProducts(state.query, state.userValues, state.location, affiliates);
                  setSummary(searchRes.summary);
                  setSources(searchRes.sources);
                  setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
                } catch (e: any) {
                  let msg = e.message;
                  if (msg.includes("Requested entity was not found")) {
                    setRequiresKeySelection(true);
                  }
                  setState(prev => ({ ...prev, stage: 'IDLE', error: msg }));
                }
            }} 
            regionFlag={region.flag} 
            onLocationUpdate={(l) => setState(p => ({ ...p, location: { ...p.location, ...l } }))}
            onLocationRequest={async () => {
              const loc = await requestLocation();
              setState(p => ({ ...p, location: { ...p.location, ...loc } }));
            }}
          />
        )}
        {view === 'PRIVACY' && <PrivacyPolicy onBack={() => setView('HOME')} />}
        {view === 'ABOUT' && <AboutUs onBack={() => setView('HOME')} />}
        {view === 'TERMS' && <TermsOfService onBack={() => setView('HOME')} />}
        {view === 'ADMIN' && <AdminDashboard onBack={() => setView('HOME')} logs={logs} stats={stats} affiliates={affiliates} onUpdateAffiliates={setAffiliates} currentPasscode={adminPasscode} onUpdatePasscode={setAdminPasscode} addLog={addLog} />}
      </main>
      
      <footer className="p-10 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Ronin Systems © 2025 • Secured Intelligence Node</div>
      </footer>
    </div>
  );
};
export default App;
