
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, ShieldCheck, Activity, Users, Target, Zap, 
  Lock, ArrowRight, LayoutDashboard,
  RefreshCw, Cpu, TrendingUp, Rocket, Server, ShieldAlert,
  Wallet, Link as LinkIcon, Save, CheckCircle2, Globe, Key, AlertCircle, Info, BarChart3, User, Award, MoreVertical, Trash2, Search, ChevronLeft,
  Unlock, Eye, EyeOff, Download, Image as ImageIcon, Palette, Type, Layers, Share2
} from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { NetworkUser, AdminConfig } from '../types';

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
  bestbuyId: string;
  impactId: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  logs: SystemLog[];
  stats: AppStats;
  affiliates: AffiliateConfig;
  onUpdateAffiliates: (config: AffiliateConfig) => void;
  currentPasscode: string;
  onUpdatePasscode: (newPass: string) => void;
  addLog: (msg: string, type?: SystemLog['type']) => void;
  userNetwork: NetworkUser[];
  onUpdateUser: (user: NetworkUser) => void;
}

const TacticalSparkline: React.FC<{ data: { name: string; missions: number }[] }> = ({ data }) => {
  if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">Insufficient Tactical Data</div>;

  const max = Math.max(...data.map(d => d.missions), 5);
  const width = 1000;
  const height = 400;
  const padding = 40;
  
  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - (d.missions * (height - 2 * padding)) / max;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
          fill="url(#grad)"
        />
        <polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => {
          const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
          const y = height - padding - (d.missions * (height - 2 * padding)) / max;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="#6366f1" className="animate-pulse" />
              <text x={x} y={height - 10} textAnchor="middle" fontSize="18" fontWeight="900" fill="#94a3b8" className="uppercase tracking-tighter">
                {d.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBack, logs, stats, affiliates, onUpdateAffiliates, currentPasscode, onUpdatePasscode, addLog, userNetwork, onUpdateUser 
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USER_INTEL' | 'AI_OPS' | 'AFFILIATES' | 'BRAND_KIT' | 'SECURITY'>('ANALYTICS');
  
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem('valuninja_admin_config');
    return saved ? JSON.parse(saved) : {
      thinkingBudget: 16000,
      systemDirective: "Always prioritize absolute value and technical reliability. Strictly ground data in late 2025/2026.",
      modelSelection: 'gemini-3-pro-preview'
    };
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === currentPasscode) {
      setIsUnlocked(true);
      setError(false);
      addLog("Commander Console Unlocked: High-Level Access Granted.", "success");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      addLog("Access Violation: Incorrect Commander Passcode.", "error");
    }
  };

  const downloadLogo = (color: string, filename: string) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C7.03 2 3 6.03 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9z" />
        <path d="M7 11c0-1.5 2-3 5-3s5 1.5 5 3" />
        <path d="M9 13h.01" stroke-width="3" />
        <path d="M15 13h.01" stroke-width="3" />
        <path d="M21 11l-2-2" />
        <path d="M3 11l2-2" />
      </svg>
    `;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    const svg64 = btoa(svgString);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;

    img.onload = function() {
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        addLog(`Brand Kit: ${filename} exported to system.`, 'success');
      }
    };
    img.src = image64;
  };

  const handleSaveAdminConfig = () => {
    localStorage.setItem('valuninja_admin_config', JSON.stringify(adminConfig));
    addLog(`AI Ops: Strategy Protocol re-calibrated. Budget: ${adminConfig.thinkingBudget} tokens.`, 'success');
  };

  const handlePromoteUser = (user: NetworkUser) => {
    const ranks: NetworkUser['rank'][] = ['RECRUIT', 'SHADOW', 'ELITE', 'SHINOBI'];
    const currentIndex = ranks.indexOf(user.rank);
    if (currentIndex < ranks.length - 1) {
      const nextRank = ranks[currentIndex + 1];
      onUpdateUser({ ...user, rank: nextRank });
      addLog(`User Intel: Promoted ${user.username} to ${nextRank}.`, 'success');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="grid grid-cols-12 gap-4 p-10 font-mono text-[8px] text-indigo-400">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.01}s` }}>
                  {Math.random().toString(16).substring(2, 6)}
                </div>
              ))}
           </div>
        </div>
        
        <div className={`w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl border-2 transition-all duration-300 ${error ? 'border-rose-500 scale-95' : 'border-indigo-500/30'}`}>
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative group">
               <div className="absolute inset-0 bg-indigo-500 rounded-[2rem] animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></div>
               <Lock className="w-10 h-10 text-indigo-400" />
            </div>
            
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Terminal Lock</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Commander Authorization Required</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <input 
                  type={showPass ? 'text' : 'password'}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Enter Passcode..."
                  className="w-full px-6 py-5 bg-slate-100 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-center tracking-[0.3em] focus:outline-none focus:border-indigo-500 transition-all placeholder:tracking-normal placeholder:font-bold"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <button 
                type="submit"
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Unlock className="w-5 h-5" /> Execute
              </button>
            </form>

            <button 
              onClick={onBack}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              Abort Mission
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 group">
             <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Command Center</h1>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mt-2">
              <Activity className="w-4 h-4" /> Systems Optimal • Recon Ver: 2026.2
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           {['ANALYTICS', 'USER_INTEL', 'AI_OPS', 'AFFILIATES', 'BRAND_KIT', 'SECURITY'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
             >
                {tab.replace('_', ' ')}
             </button>
           ))}
        </div>
        <button onClick={() => setIsUnlocked(false)} className="bg-rose-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg">Lock Terminal</button>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Missions Conducted', value: stats.totalMissions, icon: <Target className="text-indigo-500" />, color: 'text-indigo-600' },
              { label: 'Active Operatives', value: userNetwork.length, icon: <Users className="text-emerald-500" />, color: 'text-emerald-600' },
              { label: 'Value Tracked', value: `$${stats.totalValueScouted.toLocaleString()}`, icon: <Zap className="text-amber-500" />, color: 'text-amber-600' },
              { label: 'Recon Core', value: adminConfig.modelSelection.includes('pro') ? 'PRO' : 'FLASH', icon: <Cpu className="text-violet-500" />, color: 'text-violet-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">{s.icon}</div>
                  <BarChart3 className="w-4 h-4 text-slate-200" />
                </div>
                <div className={`text-3xl font-black tracking-tighter ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Flux Density</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Real-time Telemetry</span>
                </div>
              </div>
              <div className="flex-1 w-full"><TacticalSparkline data={stats.history} /></div>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl h-[500px] flex flex-col border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><Search className="w-64 h-64 text-white" /></div>
               <h3 className="text-white font-black uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10"><Terminal className="w-5 h-5 text-indigo-400" /> Command Signal Feed</h3>
               <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 font-mono relative z-10">
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase tracking-widest font-black">No Active Signal Logged</div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="text-[10px] flex gap-4">
                         <span className="text-slate-600 whitespace-nowrap">{log.time}</span>
                         <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>{log.msg}</span>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BRAND_KIT' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Standard Shadow', color: '#0f172a', bg: 'bg-slate-50', file: 'valuninja_logo_shadow.png' },
                { name: 'Indigo Pulse', color: '#6366f1', bg: 'bg-slate-100', file: 'valuninja_logo_indigo.png' },
                { name: 'Ghost Inversion', color: '#ffffff', bg: 'bg-slate-900', file: 'valuninja_logo_ghost.png' }
              ].map((asset, i) => (
                <div key={i} className="bg-white rounded-[3rem] border border-slate-200 p-10 flex flex-col items-center group overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <div className={`w-full aspect-square ${asset.bg} rounded-[2rem] mb-8 flex items-center justify-center relative overflow-hidden`}>
                     <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse"></div>
                     <NinjaIcon className="w-32 h-32 relative z-10 transition-transform group-hover:scale-110" style={{ color: asset.color }} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{asset.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">High-Res PNG • 1024x1024</p>
                  <button 
                    onClick={() => downloadLogo(asset.color, asset.file)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Download className="w-5 h-5" /> Export Asset
                  </button>
                </div>
              ))}
           </div>

           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Visual Identity Protocol</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Autonomous Asset Generator</h2>
                <p className="text-slate-500 font-medium leading-relaxed">Your brand identifiers are vector-perfect. This utility converts code-based signals into rasterized production assets for your external communication channels. No source files needed—the code is the source.</p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-5 py-3 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Alpha Channel PNG</div>
                  <div className="px-5 py-3 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 flex items-center gap-2"><Type className="w-4 h-4" /> Inter Black Font</div>
                </div>
              </div>
              <div className="w-full md:w-80 p-8 bg-slate-900 rounded-[3rem] text-white flex flex-col items-center justify-center gap-4 text-center border-4 border-indigo-500/20">
                <Share2 className="w-12 h-12 text-indigo-400 mb-2" />
                <span className="text-xs font-black uppercase tracking-widest">Global Synchronization</span>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">"The ninja remains unseen, but the mark is unmistakable."</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'USER_INTEL' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
           <table className="w-full border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Operative</th>
                    <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Network Identifier</th>
                    <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Assets Secured</th>
                    <th className="p-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Protocol Rank</th>
                    <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {userNetwork.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No Registered Operatives in Sector</td></tr>
                 ) : (
                    userNetwork.map(user => (
                      <tr key={user.email} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <td className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><User className="w-5 h-5 text-indigo-400" /></div>
                                <span className="font-black text-slate-900 uppercase tracking-tight">{user.username}</span>
                            </div>
                        </td>
                        <td className="p-6 text-sm font-bold text-slate-500">{user.email}</td>
                        <td className="p-6">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{user.vault.length} Targets</span>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2">
                             <Award className={`w-4 h-4 ${user.rank === 'SHINOBI' ? 'text-amber-500' : 'text-slate-300'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{user.rank}</span>
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handlePromoteUser(user)}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Promote Rank"
                              >
                                 <ArrowRight className="w-4 h-4" />
                              </button>
                              <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'AI_OPS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Cpu className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recon Strategy</h3>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Neural Model</label>
                    <select 
                      value={adminConfig.modelSelection}
                      onChange={(e) => setAdminConfig({...adminConfig, modelSelection: e.target.value as any})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                       <option value="gemini-3-pro-preview">Gemini 3 Pro (Deep Logic)</option>
                       <option value="gemini-3-flash-preview">Gemini 3 Flash (High Latency)</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thinking Token Budget</label>
                       <span className="text-xs font-black text-indigo-600">{adminConfig.thinkingBudget.toLocaleString()} Tokens</span>
                    </div>
                    <input 
                      type="range" min="0" max="32768" step="1024"
                      value={adminConfig.thinkingBudget}
                      onChange={(e) => setAdminConfig({...adminConfig, thinkingBudget: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary System Directive</label>
                    <textarea 
                      value={adminConfig.systemDirective}
                      onChange={(e) => setAdminConfig({...adminConfig, systemDirective: e.target.value})}
                      className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>

                 <button 
                  onClick={handleSaveAdminConfig}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                 >
                    <Save className="w-5 h-5" /> Commit Changes
                 </button>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 text-white space-y-8">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-3 bg-white/10 rounded-2xl text-indigo-400"><Rocket className="w-6 h-6" /></div>
                 <h3 className="text-xl font-black uppercase tracking-tight">System Integrity</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Grounding API', status: 'ACTIVE', color: 'text-emerald-400' },
                   { label: 'Neural Mesh', status: 'SYNCHRONIZED', color: 'text-emerald-400' },
                   { label: 'Vector Database', status: 'OPTIMIZED', color: 'text-indigo-400' },
                   { label: 'Latency Offset', status: '124ms', color: 'text-amber-400' }
                 ].map((sys, idx) => (
                   <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">{sys.label}</span>
                      <span className={`text-xs font-black uppercase tracking-tight ${sys.color}`}>{sys.status}</span>
                   </div>
                 ))}
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Protocols</span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">System state is periodically verified against the global blocklist. Any non-standard signal will trigger an immediate terminal lockout.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'AFFILIATES' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-left-4 max-w-4xl mx-auto">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600"><Wallet className="w-8 h-8" /></div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Affiliate Recon Engine</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Referral Token Configuration</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <LinkIcon className="w-3 h-3" /> Amazon Associate Tag
                    </label>
                    <input 
                      type="text"
                      value={affiliates.amazonTag}
                      onChange={(e) => onUpdateAffiliates({...affiliates, amazonTag: e.target.value})}
                      placeholder="valuninja-20"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <LinkIcon className="w-3 h-3" /> eBay Network ID
                    </label>
                    <input 
                      type="text"
                      value={affiliates.ebayId}
                      onChange={(e) => onUpdateAffiliates({...affiliates, ebayId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <LinkIcon className="w-3 h-3" /> Impact Radius (Best Buy/Walmart)
                    </label>
                    <input 
                      type="text"
                      value={affiliates.impactId}
                      onChange={(e) => onUpdateAffiliates({...affiliates, impactId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <LinkIcon className="w-3 h-3" /> Best Buy Specific ID
                    </label>
                    <input 
                      type="text"
                      value={affiliates.bestbuyId}
                      onChange={(e) => onUpdateAffiliates({...affiliates, bestbuyId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
                    />
                 </div>
              </div>
           </div>

           <div className="mt-12 bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><CheckCircle2 className="w-6 h-6" /></div>
                 <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none">Scrubbing Protocol Active</h4>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Automatic Link Sanitization Enabled</p>
                 </div>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem('valuninja_affiliates', JSON.stringify(affiliates));
                  addLog("Affiliate Recon: Production tokens synchronized.", "success");
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl"
              >
                 Push to Production
              </button>
           </div>
        </div>
      )}

      {activeTab === 'SECURITY' && (
        <div className="max-w-xl mx-auto bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
           <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto"><Key className="w-10 h-10" /></div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Protocol</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Update Commander Passcode</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Secret Identifier</label>
                    <input 
                      type="text"
                      value={currentPasscode}
                      onChange={(e) => onUpdatePasscode(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-center tracking-[0.3em]"
                    />
                 </div>
                 
                 <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-900 font-bold leading-relaxed text-left">Changing this passcode will immediately invalidate all currently active commander sessions. Ensure this token is stored in a secure physical location.</p>
                 </div>

                 <button 
                  onClick={() => addLog("Security: Access tokens re-encrypted.", "warning")}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
                 >
                    Update Key
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
