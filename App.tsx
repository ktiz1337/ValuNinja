
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
import { ShieldCheck, Award, Heart, ShieldAlert, ChevronLeft, X, Info, Terminal, Activity, Zap, Cpu, Globe, AlertCircle, Key, Lock, ArrowRight, ExternalLink } from 'lucide-react';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

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
  const steps = ["Ronin OS Phase 1...", "Initialising Hybrid Nodes...", "Verifying Gemini Core...", "Strike Protocol Ready"];
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
      localOnly: false, // HYBRID is Local+Global (Both false)
      radius: 50,
      zipCode: '' 
    }
  });
  const [summary, setSummary] = useState<string>("");
  const [region, setRegion] = useState<{name: string, flag: string}>({ name: 'USA', flag: '🇺🇸' });
  const [loadingStep, setLoadingStep] = useState<string>("ValuNinja Scouting...");
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AppStats>({ totalMissions: 0, totalValueScouted: 0, lastMissionTime: null, history: [] });
  const [affiliates, setAffiliates] = useState<AffiliateConfig>({ amazonTag: '', ebayId: '', bestBuyId: '', impactId: '' });
  const [adminPasscode, setAdminPasscode] = useState<string>('NINJA2025');

  const addLog = useCallback((msg: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = { id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleTimeString(), msg, type };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const savedStats = localStorage.getItem('valuninja_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedAffiliates = localStorage.getItem('valuninja_affiliates');
    if (savedAffiliates) setAffiliates(JSON.parse(savedAffiliates));
    if (!isBooting) addLog('Phase 1 Launch Protocol: Active.', 'info');
  }, [addLog, isBooting]);

  const handleOpenKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setState(prev => ({ ...prev, error: undefined }));
      addLog('System: Secure Uplink Bridge re-established.', 'success');
    }
  };

  const handleInitialSearch = async (query: string) => {
    setState(prev => ({ ...prev, query, stage: 'ANALYZING', error: undefined, results: [] }));
    setView('RESULTS');
    setLoadingStep("AI Analyzing Target...");
    try {
      const res = await analyzeProductCategory(query);
      setRegion({ name: res.region.countryName, flag: res.region.flag });
      setState(prev => ({ ...prev, stage: 'LOADING_PRODUCTS', attributes: res.attributes, suggestions: res.suggestions, marketGuide: res.marketGuide, userValues: res.defaultValues, priceRange: res.priceRange, adContent: res.adUnits }));
      setLoadingStep("Scrubbing Market Sources...");
      const searchRes = await searchProducts(query, res.defaultValues, state.location, affiliates);
      setSummary(searchRes.summary);
      setSources(searchRes.sources);
      setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
      addLog(`Mission complete. Alpha Target identified.`, 'success');
    } catch (error: any) {
      const msg = error.message;
      addLog(`Mission Failure: ${msg}`, 'error');
      setState(prev => ({ ...prev, stage: 'IDLE', error: msg === "API_KEY_MISSING" ? "Uplink Lost: Secure Connection required." : `Mission aborted: ${msg}` }));
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
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">Phase 1 Launch</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {view !== 'HOME' && <button onClick={() => setView('HOME')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Back to Base</button>}
          <div className="text-xs font-bold text-slate-600 bg-white border px-3 py-1 rounded-full shadow-sm">{region.flag} {region.name}</div>
        </div>
      </nav>

      <main className="flex-grow">
        {state.error && (
          <div className="max-w-4xl mx-auto mt-10 px-6">
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0"><AlertCircle className="w-8 h-8 text-white" /></div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight">Strike Aborted</h3>
                <p className="text-rose-700 font-bold leading-relaxed">{state.error}</p>
                <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                  {state.error.includes("Uplink") && (
                    <button onClick={handleOpenKey} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Connect to Gemini</button>
                  )}
                  <button onClick={resetSearch} className="px-6 py-2 bg-rose-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-all">Retry Base Scan</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'HOME' && <Hero onSearch={handleInitialSearch} isAnalyzing={state.stage === 'ANALYZING'} location={state.location} onLocationUpdate={(l) => setState(p => ({ ...p, location: { ...p.location, ...l } }))} onLocationRequest={() => {}} />}
        {view === 'RESULTS' && (
          <ResultsView 
            {...state} 
            products={state.results}
            isSearching={state.stage === 'SEARCHING' || state.stage === 'ANALYZING'}
            summary={summary} 
            isLoadingProducts={state.stage === 'LOADING_PRODUCTS'} 
            query={state.query} 
            loadingMessage={loadingStep} 
            sources={sources} 
            onAttributeUpdate={(k, v) => setState(p => ({ ...p, userValues: { ...p.userValues, [k]: v } }))} 
            onRefine={async () => {
                setState(prev => ({ ...prev, stage: 'SEARCHING' }));
                try {
                  const searchRes = await searchProducts(state.query, state.userValues, state.location, affiliates);
                  setSummary(searchRes.summary);
                  setSources(searchRes.sources);
                  setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
                } catch (e: any) {
                  setState(prev => ({ ...prev, stage: 'RESULTS', error: e.message }));
                }
            }} 
            regionFlag={region.flag} 
            onLocationUpdate={(l) => setState(p => ({ ...p, location: { ...p.location, ...l } }))}
            onLocationRequest={() => {}}
          />
        )}
        {view === 'PRIVACY' && <PrivacyPolicy onBack={() => setView('HOME')} />}
        {view === 'ABOUT' && <AboutUs onBack={() => setView('HOME')} />}
        {view === 'TERMS' && <TermsOfService onBack={() => setView('HOME')} />}
        {view === 'ADMIN' && <AdminDashboard onBack={() => setView('HOME')} logs={logs} stats={stats} affiliates={affiliates} onUpdateAffiliates={setAffiliates} currentPasscode={adminPasscode} onUpdatePasscode={setAdminPasscode} addLog={addLog} />}
      </main>
      <footer className="p-10 text-center">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Ronin Systems © 2025 • Phase 1 Specification</div>
      </footer>
    </div>
  );
};
export default App;
