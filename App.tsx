
import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from './components/Hero';
import { ResultsView } from './components/ResultsView';
import { VaultView } from './components/VaultView';
import { AuthModal } from './components/AuthModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AboutUs } from './components/AboutUs';
import { TermsOfService } from './components/TermsOfService';
import { AdminDashboard } from './components/AdminDashboard';
import { analyzeProductCategory, searchProducts, identifyProductFromImage } from './services/geminiService';
import { SearchState, AdUnit, Product, UserLocation, UserSession, NetworkUser, Briefing } from './types';
import { NinjaIcon } from './components/NinjaIcon';
import { ShieldCheck, Award, AlertCircle, Terminal, Activity, Zap, Cpu, Key, ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Box, User, LogIn, Bookmark, LogOut, LineChart } from 'lucide-react';

type View = 'HOME' | 'PRIVACY' | 'ABOUT' | 'TERMS' | 'RESULTS' | 'ADMIN' | 'VAULT';

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

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [showAuth, setShowAuth] = useState(false);
  
  const [userNetwork, setUserNetwork] = useState<NetworkUser[]>([]);
  
  const [session, setSession] = useState<UserSession>({ 
    isLoggedIn: false, 
    username: 'Guest Agent', 
    email: '',
    rank: 'RECRUIT', 
    vault: [] 
  });

  const [state, setState] = useState<SearchState>({
    query: '', 
    stage: 'IDLE', 
    attributes: [], 
    suggestions: [], 
    userValues: {}, 
    results: [], 
    resultsLimit: 4,
    location: { 
      excludeRegionSpecific: false, 
      localOnly: false,
      radius: 50,
      zipCode: '' 
    }
  });

  const [summary, setSummary] = useState<Briefing | undefined>(undefined);
  const [region, setRegion] = useState<{name: string, flag: string}>({ name: 'USA', flag: '🇺🇸' });
  const [loadingStep, setLoadingStep] = useState<string>("Initializing...");
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AppStats>({ totalMissions: 0, totalValueScouted: 0, lastMissionTime: null, history: [] });
  const [affiliates, setAffiliates] = useState<AffiliateConfig>({ amazonTag: '', ebayId: '', bestBuyId: '', impactId: '' });
  const [adminPasscode, setAdminPasscode] = useState<string>('NINJA2026');

  const addLog = useCallback((msg: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = { id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleTimeString(), msg, type };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const requestLocation = useCallback((): Promise<Partial<UserLocation>> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        addLog("Geolocation not supported.", "warning");
        resolve({});
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          addLog("Sector Lock acquired.", "success");
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (error) => {
          addLog(`Sector Search Aborted: ${error.message}`, "warning");
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
    const savedNetwork = localStorage.getItem('valuninja_network_users');
    if (savedNetwork) setUserNetwork(JSON.parse(savedNetwork));
    const savedSession = localStorage.getItem('valuninja_active_session');
    if (savedSession) setSession(JSON.parse(savedSession));
  }, []);

  useEffect(() => {
    if (session.isLoggedIn) {
      localStorage.setItem('valuninja_active_session', JSON.stringify(session));
      setUserNetwork(prev => {
        const updated = prev.some(u => u.email === session.email)
          ? prev.map(u => u.email === session.email ? { ...u, vault: session.vault, username: session.username, rank: session.rank } : u)
          : [...prev, { email: session.email, username: session.username, vault: session.vault, rank: session.rank }];
        localStorage.setItem('valuninja_network_users', JSON.stringify(updated));
        return updated;
      });
    }
  }, [session.vault, session.username, session.isLoggedIn, session.rank]);

  const handleInitialSearch = async (query: string) => {
    let currentLocation = state.location;

    if (!state.location.excludeRegionSpecific && !state.location.latitude) {
      setView('RESULTS');
      setLoadingStep("Synchronizing Local Market Data...");
      const locUpdate = await requestLocation();
      currentLocation = { ...state.location, ...locUpdate };
      setState(prev => ({ ...prev, location: currentLocation }));
    }

    setState(prev => ({ ...prev, query, stage: 'ANALYZING', error: undefined, results: [], resultsLimit: 4 }));
    setView('RESULTS');
    setLoadingStep("Conducting Intelligence Recon...");
    
    try {
      const res = await analyzeProductCategory(query);
      setRegion({ name: res.region.countryName, flag: res.region.flag });
      setState(prev => ({ ...prev, stage: 'LOADING_PRODUCTS', attributes: res.attributes, suggestions: res.suggestions, marketGuide: res.marketGuide, userValues: res.defaultValues, priceRange: res.priceRange, adContent: res.adUnits }));
      setLoadingStep("Extracting Top Targets...");
      
      const searchRes = await searchProducts(query, res.defaultValues, currentLocation, affiliates, 4);
      setSummary(searchRes.summary);
      setSources(searchRes.sources);
      setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
      addLog(`Strike complete. Verified targets identified.`, 'success');
      
      const newStats = {
        ...stats,
        totalMissions: stats.totalMissions + 1,
        totalValueScouted: stats.totalValueScouted + searchRes.products.reduce((acc, p) => acc + (p.price || 0), 0),
        lastMissionTime: new Date().toISOString()
      };
      setStats(newStats);
      localStorage.setItem('valuninja_stats', JSON.stringify(newStats));
    } catch (error: any) {
      const msg = error.message === "ENVIRONMENT_AUTH_FAILURE" ? "API_KEY rejected." : error.message || "Intelligence gathering failed.";
      addLog(`Strike Aborted: ${msg}`, 'error');
      setState(prev => ({ ...prev, stage: 'IDLE', error: `Mission Aborted: ${msg}` }));
    }
  };

  const handleExpandSearch = async () => {
    const newLimit = state.resultsLimit + 4;
    setState(prev => ({ ...prev, stage: 'SEARCHING', resultsLimit: newLimit }));
    setLoadingStep(`Boosting Recon Signal... Searching for ${newLimit} targets.`);
    
    try {
      const searchRes = await searchProducts(state.query, state.userValues, state.location, affiliates, newLimit);
      setSummary(searchRes.summary);
      setSources(searchRes.sources);
      setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
      addLog(`Intel expansion complete. ${newLimit} targets now in scope.`, 'success');
    } catch (e: any) {
      addLog(`Intel expansion failed: ${e.message}`, 'error');
      setState(prev => ({ ...prev, stage: 'RESULTS' }));
    }
  };

  const handlePhotoScout = async (base64Image: string) => {
    setState(prev => ({ ...prev, stage: 'ANALYZING', error: undefined, results: [], resultsLimit: 4 }));
    setLoadingStep("Activating Optical Recon...");
    setView('RESULTS');
    
    try {
      const identifiedProduct = await identifyProductFromImage(base64Image);
      if (identifiedProduct === "Unknown Product") {
        throw new Error("Optical sensors failed to resolve target ID.");
      }
      addLog(`Optical Lock Confirmed: Identified ${identifiedProduct}`, 'success');
      handleInitialSearch(identifiedProduct);
    } catch (error: any) {
      const msg = error.message || "Optical mission failed.";
      addLog(`Optical Recon Aborted: ${msg}`, 'error');
      setState(prev => ({ ...prev, stage: 'IDLE', error: `Mission Aborted: ${msg}` }));
    }
  };

  const handleAuthSuccess = (user: NetworkUser) => {
    setSession({ 
      isLoggedIn: true, 
      username: user.username, 
      email: user.email,
      rank: user.rank, 
      vault: user.vault || [],
      joinedAt: new Date().toISOString()
    });
    setShowAuth(false);
    addLog(`Identity Sync Complete: Operative ${user.username} Active.`, 'success');
  };

  const handleUpdateUser = (updatedUser: NetworkUser) => {
    setUserNetwork(prev => {
      const next = prev.map(u => u.email === updatedUser.email ? updatedUser : u);
      localStorage.setItem('valuninja_network_users', JSON.stringify(next));
      return next;
    });
    // If the updated user is the current session user, update the session
    if (session.email === updatedUser.email) {
      setSession(prev => ({ ...prev, rank: updatedUser.rank, username: updatedUser.username }));
    }
    addLog(`Security: Access Protocol for Operative ${updatedUser.username} re-calibrated.`, 'success');
  };

  const handleLogout = () => {
    setSession({ isLoggedIn: false, username: 'Guest Agent', email: '', rank: 'RECRUIT', vault: [] });
    localStorage.removeItem('valuninja_active_session');
    setView('HOME');
    addLog("Session terminated. Agent Offline.", "info");
  };

  const handleSaveToVault = (product: Product) => {
    if (!session.isLoggedIn) {
      setShowAuth(true);
      return;
    }
    if (session.vault.some(p => p.id === product.id)) return;
    setSession(prev => ({ ...prev, vault: [...prev.vault, { ...product, lastPriceUpdate: new Date().toISOString() }] }));
    addLog(`Target secured in Arsenal: ${product.name}`, 'success');
  };

  const handleSaveAllToVault = (products: Product[]) => {
    if (!session.isLoggedIn) {
      setShowAuth(true);
      return;
    }
    const newProducts = products.filter(p => !session.vault.some(v => v.id === p.id));
    if (newProducts.length === 0) return;
    
    setSession(prev => ({ 
      ...prev, 
      vault: [...prev.vault, ...newProducts.map(p => ({ ...p, lastPriceUpdate: new Date().toISOString() }))] 
    }));
    addLog(`Mass Extraction Complete: ${newProducts.length} new targets secured.`, 'success');
  };

  const resetSearch = () => { setView('HOME'); setState(prev => ({ ...prev, stage: 'IDLE', query: '', results: [], error: undefined })); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      {showAuth && (
          <AuthModal 
            onAuthComplete={handleAuthSuccess}
            onUpdateUser={handleUpdateUser}
            onCancel={() => setShowAuth(false)}
            existingUsers={userNetwork}
          />
      )}
      
      <nav className="border-b bg-white/80 sticky top-0 z-50 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center group hover:scale-110 transition-transform"><NinjaIcon className="w-5 h-5 text-white" /></div>
          <div>
            <span className="font-extrabold text-lg block leading-none">ValuNinja</span>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">Intelligence Protocol</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => session.isLoggedIn ? setView('VAULT') : setShowAuth(true)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors px-3 py-1 bg-slate-50 rounded-full border border-slate-100 hover:border-indigo-200"
          >
            <LineChart className={`w-3.5 h-3.5 ${session.vault.length > 0 ? 'text-indigo-600 animate-pulse' : ''}`} /> 
            Watch List {session.vault.length > 0 ? `(${session.vault.length})` : ''}
          </button>
          
          <div className="h-4 w-px bg-slate-200"></div>
          
          {session.isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group cursor-pointer bg-slate-900 px-3 py-1.5 rounded-2xl shadow-lg shadow-indigo-500/10">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <div className="flex flex-col text-left">
                       <span className="text-[10px] font-black uppercase text-white tracking-tighter leading-none">{session.username}</span>
                       <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">{session.rank}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Terminate Session">
                   <LogOut className="w-4 h-4" />
                </button>
              </div>
          ) : (
              <button onClick={() => setShowAuth(true)} className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 transition-all flex items-center gap-1.5 active:scale-95">
                  <LogIn className="w-3.5 h-3.5" /> Log in
              </button>
          )}
          <div className="text-xs font-bold text-slate-600 bg-white border px-3 py-1 rounded-full shadow-sm">{region.flag} {region.name}</div>
        </div>
      </nav>

      <main className="flex-grow">
        {state.error && (
          <div className="max-w-4xl mx-auto mt-10 px-6 pb-20 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-rose-50 border border-rose-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl mb-6">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/10"><AlertCircle className="w-8 h-8 text-white" /></div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h3 className="text-xl font-black text-rose-900 uppercase tracking-tight">Mission Aborted</h3>
                <p className="text-rose-700 font-bold leading-relaxed">{state.error}</p>
                <button onClick={resetSearch} className="px-8 py-3 bg-rose-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-all active:scale-95 mt-4">Retry Mission</button>
              </div>
            </div>
          </div>
        )}

        {view === 'HOME' && !state.error && (
          <Hero 
            onSearch={handleInitialSearch} 
            onPhotoScout={handlePhotoScout}
            isAnalyzing={state.stage === 'ANALYZING' || loadingStep === "Synchronizing Local Market Data..."} 
            location={state.location} 
            onLocationUpdate={(l) => setState(p => ({ ...p, location: { ...p.location, ...l } }))} 
            onLocationRequest={async () => {
              const loc = await requestLocation();
              setState(p => ({ ...p, location: { ...p.location, ...loc } }));
            }} 
            isLoggedIn={session.isLoggedIn}
            onOpenAuth={() => setShowAuth(true)}
          />
        )}
        
        {view === 'RESULTS' && !state.error && (
          <ResultsView 
            {...state} 
            session={session}
            onSaveToVault={handleSaveToVault}
            onSaveAllToVault={handleSaveAllToVault}
            onExpand={handleExpandSearch}
            onPhotoScout={handlePhotoScout}
            products={state.results}
            isSearching={state.stage === 'SEARCHING' || state.stage === 'ANALYZING' || loadingStep === "Synchronizing Local Market Data..."}
            summary={summary} 
            isLoadingProducts={state.stage === 'LOADING_PRODUCTS'} 
            query={state.query} 
            loadingMessage={loadingStep} 
            sources={sources} 
            onAttributeUpdate={(k, v) => setState(p => ({ ...p, userValues: { ...p.userValues, [k]: v } }))} 
            onRefine={async () => {
                setState(prev => ({ ...prev, stage: 'SEARCHING' }));
                try {
                  const searchRes = await searchProducts(state.query, state.userValues, state.location, affiliates, state.resultsLimit);
                  setSummary(searchRes.summary);
                  setSources(searchRes.sources);
                  setState(prev => ({ ...prev, stage: 'RESULTS', results: searchRes.products }));
                } catch (e: any) {
                  setState(prev => ({ ...prev, stage: 'IDLE', error: e.message }));
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
        
        {view === 'VAULT' && (
            <VaultView 
                session={session} 
                onBack={() => setView('HOME')} 
                onRemove={(id) => setSession(p => ({ ...p, vault: p.vault.filter(v => v.id !== id) }))} 
                onUpdate={(prod) => setSession(p => ({ ...p, vault: p.vault.map(v => v.id === prod.id ? prod : v) }))}
            />
        )}
        
        {view === 'PRIVACY' && <PrivacyPolicy onBack={() => setView('HOME')} />}
        {view === 'ABOUT' && <AboutUs onBack={() => setView('HOME')} />}
        {view === 'TERMS' && <TermsOfService onBack={() => setView('HOME')} />}
        {view === 'ADMIN' && <AdminDashboard onBack={() => setView('HOME')} logs={logs} stats={stats} affiliates={affiliates} onUpdateAffiliates={setAffiliates} currentPasscode={adminPasscode} onUpdatePasscode={setAdminPasscode} addLog={addLog} userNetwork={userNetwork} onUpdateUser={handleUpdateUser} />}
      </main>
      
      <footer className="p-10 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-center gap-8 mb-6">
            <button onClick={() => setView('PRIVACY')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">Privacy Protocol</button>
            <button onClick={() => setView('TERMS')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">Engagement Terms</button>
            <button onClick={() => setView('ABOUT')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">The Shinobi Legacy</button>
            <button onClick={() => setView('ADMIN')} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">Commander Console</button>
        </div>
        <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Shinobi Intelligence Protocol © 2026 • Secured Vector Signal</div>
      </footer>
    </div>
  );
};
export default App;
