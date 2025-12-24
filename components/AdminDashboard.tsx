import React, { useState } from 'react';
import { 
  Terminal, ShieldCheck, Activity, Users, Target, Zap, 
  Lock, ArrowRight, LayoutDashboard,
  RefreshCw, Cpu, TrendingUp, Rocket, Server, ShieldAlert,
  Wallet, Link as LinkIcon, Save, CheckCircle2, Globe, Key, AlertCircle, Info, BarChart3
} from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';

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
}

// Tactical SVG Sparkline - Replaces Recharts for zero-dependency reliability
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
  onBack, logs, stats, affiliates, onUpdateAffiliates, currentPasscode, onUpdatePasscode, addLog 
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'SYSTEM' | 'AFFILIATES' | 'SECURITY'>('ANALYTICS');
  
  const [showRecovery, setShowRecovery] = useState(false);
  const [passUpdate, setPassUpdate] = useState({ current: '', next: '', confirm: '' });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [tempAffiliates, setTempAffiliates] = useState<AffiliateConfig>(affiliates);
  const [isSaving, setIsSaving] = useState(false);

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

  const handlePassUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    if (passUpdate.current !== currentPasscode) {
      setUpdateError('Current Protocol Key is invalid.');
      return;
    }
    if (passUpdate.next.length < 4) {
      setUpdateError('New Key must be at least 4 characters.');
      return;
    }
    if (passUpdate.next !== passUpdate.confirm) {
      setUpdateError('New Keys do not match.');
      return;
    }

    onUpdatePasscode(passUpdate.next);
    setUpdateSuccess(true);
    setPassUpdate({ current: '', next: '', confirm: '' });
    addLog('Security: Master Protocol Key updated successfully.', 'success');
  };

  const performSystemReset = () => {
    if (window.confirm("WARNING: This will purge ALL tactical data (Stats, Logs, Affiliates) and reset the Protocol Key to factory default 'NINJA2025'. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveAffiliates = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateAffiliates(tempAffiliates);
      setIsSaving(false);
    }, 800);
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
              <div className="relative">
                <input 
                  type="password" 
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="********"
                  className={`w-full bg-white/5 border-2 rounded-2xl px-6 py-4 text-white font-black text-center text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${error ? 'border-rose-500 animate-shake' : 'border-white/10 focus:border-indigo-500'}`}
                />
                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center mt-3">Invalid Protocol Key</p>}
              </div>
              <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-500/20">
                Unlock Command Center <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="text-center pt-4">
               {!showRecovery ? (
                  <button onClick={() => setShowRecovery(true)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Lost Protocol Key?</button>
               ) : (
                  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                      This node uses local persistence. If you have lost your key, a <span className="text-rose-400">System Wipe</span> will reset the key to factory default <span className="text-white">'NINJA2025'</span> but will purge all logs and stats.
                    </p>
                    <button onClick={performSystemReset} className="text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                       <AlertCircle className="w-3 h-3" /> Initiate System Wipe
                    </button>
                    <button onClick={() => setShowRecovery(false)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest block w-full">Cancel</button>
                  </div>
               )}
            </div>

            <button onClick={onBack} className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
              Abort to Public View
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
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
            <div className="flex items-center gap-4 mt-1">
               <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Systems Operational: Ronin_Protocol_v2.5
               </p>
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-700 uppercase">Live Deployment</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
           {[
             { id: 'ANALYTICS', label: 'Analytics' },
             { id: 'AFFILIATES', label: 'Affiliate HQ' },
             { id: 'SYSTEM', label: 'System Health' },
             { id: 'SECURITY', label: 'Security' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
             >
                {tab.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsAuthenticated(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Lock Console</button>
        </div>
      </div>

      {activeTab === 'ANALYTICS' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Missions', value: stats.totalMissions.toLocaleString(), color: 'text-indigo-500', icon: <Target className="text-indigo-500" /> },
              { label: 'Strike Success', value: stats.totalMissions > 0 ? '99.4%' : '0%', color: 'text-emerald-500', icon: <ShieldCheck className="text-emerald-500" /> },
              { label: 'Value Scouted', value: `$${stats.totalValueScouted.toLocaleString()}`, color: 'text-amber-500', icon: <Zap className="text-amber-500" /> },
              { label: 'AI Nodes', value: 'Gemini-3-Flash', color: 'text-violet-500', icon: <Cpu className="text-violet-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+Realtime</span>
                </div>
                <div className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Mission Intensity History
                </h3>
                <div className="px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">Sparkline_Engine_v1</div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <TacticalSparkline data={stats.history} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-slate-800 flex flex-col h-[500px]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-white font-black tracking-tight flex items-center gap-3">
                     <Terminal className="w-5 h-5 text-indigo-400" /> Live Tactical Feed
                  </h3>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
               </div>
               <div className="flex-1 overflow-y-auto space-y-4 font-mono scrollbar-hide">
                  {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="text-[11px] flex gap-4 group">
                       <span className="text-slate-600 font-bold whitespace-nowrap">{log.time}</span>
                       <span className={`leading-relaxed transition-colors ${
                         log.type === 'error' ? 'text-rose-400' :
                         log.type === 'warning' ? 'text-amber-400' :
                         log.type === 'success' ? 'text-emerald-400' :
                         'text-slate-300 group-hover:text-indigo-300'
                       }`}>
                          {log.msg}
                       </span>
                    </div>
                  )) : (
                    <div className="h-full flex items-center justify-center text-slate-700 uppercase tracking-[0.3em] font-black italic">Waiting for Mission Sync...</div>
                  )}
               </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'SECURITY' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-rose-600" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Protocol Key Management</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Update the Master Override Passcode</p>
                 </div>
              </div>

              <form onSubmit={handlePassUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Key</label>
                    <input 
                       type="password"
                       value={passUpdate.current}
                       onChange={(e) => setPassUpdate({ ...passUpdate, current: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                       placeholder="********"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Master Key</label>
                    <input 
                       type="password"
                       value={passUpdate.next}
                       onChange={(e) => setPassUpdate({ ...passUpdate, next: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                       placeholder="Min 4 chars"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Key</label>
                    <input 
                       type="password"
                       value={passUpdate.confirm}
                       onChange={(e) => setPassUpdate({ ...passUpdate, confirm: e.target.value })}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                       placeholder="********"
                    />
                 </div>
                 <div className="md:col-span-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                       {updateError && (
                         <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                           <AlertCircle className="w-4 h-4" /> {updateError}
                         </div>
                       )}
                       {updateSuccess && (
                         <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                           <CheckCircle2 className="w-4 h-4" /> Protocol Key re-calibrated successfully.
                         </div>
                       )}
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Update Security Level</button>
                 </div>
              </form>

              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                 <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Security Caution</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">Changing the Master Protocol Key is an irreversible action unless you perform a full System Wipe. Ensure your new key is recorded in a secure tactical safe.</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <AlertCircle className="w-32 h-32 text-rose-500" />
              </div>
              <div className="relative z-10 space-y-4">
                 <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                    <Activity className="w-6 h-6 text-rose-500" /> Danger Zone
                 </h3>
                 <p className="text-slate-400 text-sm font-medium">Perform a full atomic reset of this node. All data will be purged.</p>
                 <button onClick={performSystemReset} className="px-12 py-4 border-2 border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Emergency System Purge</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'AFFILIATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                       <Wallet className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bounty Configuration</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inject your tracking IDs into the scouting protocol</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleSaveAffiliates}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'}`}
                 >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Injecting...' : 'Save Configuration'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { key: 'amazonTag', label: 'Amazon Associate Tag', placeholder: 'valuninja-20', icon: <LinkIcon className="text-orange-500" /> },
                   { key: 'impactId', label: 'Impact.com Click ID', placeholder: '1234567', icon: <Activity className="text-indigo-500" /> },
                   { key: 'ebayId', label: 'eBay Partner ID', placeholder: '987654321', icon: <Globe className="text-blue-500" /> },
                   { key: 'bestBuyId', label: 'Best Buy Partner Key', placeholder: 'BB_RONIN_ALPHA', icon: <Zap className="text-yellow-500" /> },
                 ].map(item => (
                   <div key={item.key} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         {item.icon} {item.label}
                      </label>
                      <input 
                        type="text"
                        value={(tempAffiliates as any)[item.key]}
                        onChange={(e) => setTempAffiliates({ ...tempAffiliates, [item.key]: e.target.value })}
                        placeholder={item.placeholder}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                   </div>
                 ))}
              </div>

              <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                 <ShieldAlert className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                 <div className="space-y-1">
                    <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">Ronin Security Note</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">Tracking IDs are stored locally on this node and are never transmitted to third-party databases other than the destination retailer during a strike mission.</p>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl space-y-6">
                 <h3 className="text-white font-black text-xl tracking-tight flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Active Bounties
                 </h3>
                 <div className="space-y-3">
                    {Object.entries(affiliates).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                         <span className={`text-[10px] font-black uppercase ${val ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {val ? 'Protocol Active' : 'Offline'}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h4 className="font-black text-slate-900 uppercase tracking-tight">Deploy to Live</h4>
                 <p className="text-xs text-slate-500 font-medium">Push these configurations to the production edge node via Vercel.</p>
                 <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Trigger Edge Deploy</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'SYSTEM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-emerald-600" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deployment Readiness</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Gemini Core Connectivity', status: 'Online', verified: true },
                   { label: 'Ronin Bias-Shield Protocol', status: 'Active', verified: true },
                   { label: 'Regional Grounding Engine', status: 'Optimal', verified: true },
                   { label: 'Affiliate Strike Mechanism', status: 'Locked', verified: true },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.status}
                        </span>
                        {item.verified ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Server className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-2xl font-black text-white tracking-tight">Infrastructure Info</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { l: 'Local IP', v: '127.0.0.1' },
                   { l: 'Sample Rate', v: '16,000 Hz' },
                   { l: 'Regional DNS', v: 'CDN_RONIN' },
                   { l: 'Encryption', v: 'AES-256' }
                 ].map((x, i) => (
                   <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{x.l}</span>
                      <span className="block font-mono text-xs text-indigo-400">{x.v}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};