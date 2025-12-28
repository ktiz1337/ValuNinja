
import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, Activity, Users, Target, Zap, 
  Lock, ArrowRight, LayoutDashboard,
  RefreshCw, Cpu, TrendingUp, Rocket, Server, ShieldAlert,
  Wallet, Link as LinkIcon, Save, CheckCircle2, Globe, Key, AlertCircle, Info, BarChart3, User, Award, MoreVertical, Trash2, Search
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
  bestBuyId: string;
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
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'USER_INTEL' | 'AI_OPS' | 'AFFILIATES' | 'SECURITY'>('ANALYTICS');
  
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem('valuninja_admin_config');
    return saved ? JSON.parse(saved) : {
      thinkingBudget: 16000,
      systemDirective: "Always prioritize absolute value and technical reliability. Strictly ground data in late 2025/2026.",
      modelSelection: 'gemini-3-pro-preview'
    };
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === currentPasscode) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasscode('');
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border-t-2 border-indigo-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <NinjaIcon className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl border border-white/10 mb-6">
                <Lock className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Tactical Override</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Enter Commander Passcode</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
                placeholder="********"
                className={`w-full bg-white/5 border-2 rounded-2xl px-6 py-4 text-white font-black text-center text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${error ? 'border-rose-500 animate-shake' : 'border-white/10 focus:border-indigo-500'}`}
              />
              <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-xl">
                Unlock Command Center <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            <button onClick={onBack} className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Abort to Public View</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Command Center</h1>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4" /> Systems Optimal • Recon Ver: 2026.2
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           {['ANALYTICS', 'USER_INTEL', 'AI_OPS', 'AFFILIATES', 'SECURITY'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
             >
                {tab.replace('_', ' ')}
             </button>
           ))}
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Lock</button>
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{user.rank}</span>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => handlePromoteUser(user)}
                                  disabled={user.rank === 'SHINOBI'}
                                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md active:scale-90" 
                                  title="Promote Operative"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all active:scale-90" title="Revoke Access">
                                  <ShieldAlert className="w-4 h-4" />
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
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner"><Cpu className="w-6 h-6 text-indigo-600" /></div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI Recon Calibrator</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuning Neural Scouting Vectors</p>
                   </div>
                </div>
                <button onClick={handleSaveAdminConfig} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                   <Save className="w-4 h-4" /> Save Protocol
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                          <span>Thinking Tokens (Budget)</span>
                          <span className="text-indigo-600 font-mono">{adminConfig.thinkingBudget}</span>
                       </label>
                       <input 
                         type="range" min="0" max="32768" step="1024"
                         value={adminConfig.thinkingBudget}
                         onChange={(e) => setAdminConfig({...adminConfig, thinkingBudget: parseInt(e.target.value)})}
                         className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                       />
                       <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase">
                          <span>Speed (0)</span>
                          <span>Deep Analytics (32k)</span>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Strike Engine</label>
                       <select 
                        value={adminConfig.modelSelection}
                        onChange={(e) => setAdminConfig({...adminConfig, modelSelection: e.target.value as any})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none appearance-none"
                       >
                          <option value="gemini-3-pro-preview">GEMINI 3 PRO (MAX ACCURACY)</option>
                          <option value="gemini-3-flash-preview">GEMINI 3 FLASH (REAL-TIME)</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                       Global Operational Directive
                    </label>
                    <textarea 
                      value={adminConfig.systemDirective}
                      onChange={(e) => setAdminConfig({...adminConfig, systemDirective: e.target.value})}
                      placeholder="e.g. Always prioritize absolute value and technical reliability..."
                      className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-6 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none resize-none shadow-inner"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase italic leading-tight">Injection: This directive is appended to every agent mission to eliminate bias and prioritize user value.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'AFFILIATES' && (
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-inner"><Wallet className="w-6 h-6 text-emerald-600" /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Bounty Keyring</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managing Referral Intelligence</p>
                 </div>
              </div>
              <button onClick={() => onUpdateAffiliates(affiliates)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                 <Key className="w-4 h-4" /> Inject Protocols
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['amazonTag', 'impactId', 'ebayId', 'bestBuyId'].map(k => (
                <div key={k} className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{k.replace(/([A-Z])/g, ' $1')}</label>
                   <input 
                    type="text" value={(affiliates as any)[k]}
                    onChange={(e) => onUpdateAffiliates({...affiliates, [k]: e.target.value})}
                    placeholder="KEY_ID_0X..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black focus:bg-white transition-all shadow-inner"
                   />
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'SECURITY' && (
        <div className="max-w-xl mx-auto bg-slate-900 p-10 rounded-[4rem] shadow-2xl space-y-8 text-center border border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-2xl"><ShieldAlert className="w-10 h-10 text-rose-500" /></div>
           <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Key Override</h3>
           <p className="text-slate-400 text-sm font-medium leading-relaxed">Modify the master commander key. This re-keys the entire Command Center access protocol.</p>
           <div className="space-y-4">
              <input 
                type="password" placeholder="NEW MASTER PROTOCOL KEY"
                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 font-black text-white text-center focus:outline-none focus:border-indigo-500 tracking-widest"
                onBlur={(e) => e.target.value && onUpdatePasscode(e.target.value)}
              />
              <button 
                onClick={() => { if(confirm("ABSOLUTE DATA WIPE: Proceed?")) { localStorage.clear(); window.location.reload(); } }} 
                className="w-full py-5 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
              >
                Emergency System Scour (Factory Reset)
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
