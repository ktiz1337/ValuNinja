import React, { useState, useEffect, useRef } from 'react';
import { X, Globe, Cpu, Zap, CheckCircle2, Loader2, ShieldCheck, Database, Server, Terminal, Share2, ExternalLink, MapPin, Radio } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: string[];
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, nodes }) => {
  const [step, setStep] = useState<'config' | 'deploying' | 'success'>('config');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [deployedNodes, setDeployedNodes] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const deploymentLogs = [
    "Establishing secure tunnel to Regional Hubs...",
    "Authenticating with Store ERP Gateway...",
    "Pushing updated MIN/MAX vectors to local databases...",
    "Validating SKU parity across nodes...",
    "Broadcasting rebalancing transfer requests...",
    "Setting local alert triggers for stockout risk...",
    "Synchronizing holographic price tag cache...",
    "Deployment finalized for local node."
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handleStartDeployment = async () => {
    setStep('deploying');
    setLogs(["[SYSTEM] Initiating Global Deployment Cycle..."]);
    
    for (const node of nodes) {
      setLogs(prev => [...prev, `[NETWORK] Connecting to ${node}...`]);
      await new Promise(r => setTimeout(r, 800));
      
      for (const log of deploymentLogs) {
        setLogs(prev => [...prev, `[${node}] ${log}`]);
        await new Promise(r => setTimeout(r, Math.random() * 200 + 100));
      }
      
      setDeployedNodes(prev => [...prev, node]);
      setLogs(prev => [...prev, `[SUCCESS] ${node} is now LIVE with optimized levels.`]);
      setProgress(prev => prev + (100 / nodes.length));
    }

    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative bg-slate-900 w-full max-w-3xl rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-12">
          {step === 'config' && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-[32px] flex items-center justify-center mx-auto border border-indigo-500/30">
                <Globe className="h-10 w-10 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tight">Push to Production</h2>
                <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg">
                  You are about to deploy optimized stock levels to <b>{nodes.length}</b> regional store nodes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white uppercase">Safety Check</p>
                    <p className="text-[11px] text-slate-500 mt-1">Levels verified against historical standard deviation.</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                  <Radio className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white uppercase">Real-time Sync</p>
                    <p className="text-[11px] text-slate-500 mt-1">Changes propagate to local POS and ERP systems instantly.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleStartDeployment}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                >
                  <Zap className="h-5 w-5 fill-current" /> Deploy Global Network
                </button>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Authorized by John Dalton (Director)</p>
              </div>
            </div>
          )}

          {step === 'deploying' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                    Propagating Vectors...
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Syncing store nodes via OptiStock Cloud Hub</p>
                </div>
                <span className="text-3xl font-mono font-black text-indigo-500">{Math.round(progress)}%</span>
              </div>

              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div 
                ref={logRef}
                className="bg-black/40 rounded-3xl p-6 font-mono text-[11px] text-indigo-300 h-64 overflow-y-auto custom-scrollbar border border-white/5 space-y-1.5"
              >
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 animate-in slide-in-from-left-2">
                    <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : log.includes('[NETWORK]') ? 'text-white font-bold' : ''}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {nodes.map(node => (
                  <div 
                    key={node} 
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all duration-500 border flex items-center gap-2 ${
                      deployedNodes.includes(node) 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${deployedNodes.includes(node) ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                    {node}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-8 animate-in zoom-in duration-500 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto border border-emerald-400 shadow-2xl">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-black text-white tracking-tight">Deployment Live</h2>
                <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg leading-relaxed">
                  Supply chain optimized across the entire regional network. <br />
                  <span className="text-white font-black text-2xl mt-4 block">Estimated Savings: $124,500/mo</span>
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={onClose}
                  className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition shadow-2xl"
                >
                  Return to Dashboard
                </button>
                <button 
                  className="px-10 py-5 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition flex items-center gap-2 border border-white/10"
                >
                  <Share2 className="h-5 w-5" /> Share Report
                </button>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Network Status</p>
                <div className="flex justify-center gap-12">
                  <div className="text-center">
                    <p className="text-emerald-400 text-xl font-black">99.9%</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase">Uptime</p>
                  </div>
                  <div className="text-center border-x border-white/5 px-12">
                    <p className="text-indigo-400 text-xl font-black">12ms</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase">Latency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-400 text-xl font-black">Secured</p>
                    <p className="text-slate-600 text-[9px] font-bold uppercase">TLS 1.3</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};