
import React, { useState } from 'react';
import { Product, UserSession, PricePoint } from '../types';
import { ShieldCheck, TrendingDown, TrendingUp, RefreshCw, Trash2, ExternalLink, Target, Activity, Zap, Store, LineChart } from 'lucide-react';
import { refreshProductPrice } from '../services/geminiService';
import { AdSenseUnit } from './AdSenseUnit';

interface VaultViewProps {
  session: UserSession;
  onRemove: (id: string) => void;
  onUpdate: (product: Product) => void;
  onBack: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ session, onRemove, onUpdate, onBack }) => {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefreshIntel = async (product: Product) => {
    setRefreshingId(product.id);
    try {
      const recon = await refreshProductPrice(product);
      onUpdate({
        ...product,
        previousPrice: product.price,
        price: recon.price,
        storeName: recon.store,
        lastPriceUpdate: new Date().toISOString()
      });
    } catch (e) {
      console.error("Intelligence Refresh Failed", e);
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 space-y-12 animate-in fade-in slide-in-from-top-8 duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
            <LineChart className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Arsenal Asset Vault</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Tracking Active • Domain Verified</p>
          </div>
        </div>
        <button onClick={onBack} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">New Mission</button>
      </header>

      <AdSenseUnit slotId="VAULT_HEADER" className="h-[90px]" type="auto" />

      {session.vault.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-6">
          <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">Vault is Empty</h3>
          <button onClick={onBack} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em]">Deploy Agent</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {session.vault.map(product => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group relative flex flex-col">
               <div className="absolute top-0 right-0 p-6">
                 {product.price < (product.previousPrice || Infinity) && (
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[9px] font-black uppercase">
                     <TrendingDown className="w-3 h-3 inline mr-1" /> Price Drop
                   </div>
                 )}
               </div>

               <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">{product.brand}</span>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                  </div>

                  <div className="flex items-end justify-between border-b border-slate-50 pb-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Live Asset Value</span>
                      <div className="text-4xl font-black text-slate-900">{product.currency}{product.price.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      onClick={() => handleRefreshIntel(product)}
                      disabled={refreshingId === product.id}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingId === product.id ? 'animate-spin' : ''}`} />
                      Re-Analyze
                    </button>
                    <a 
                      href={product.sourceUrl || product.retailers[0]?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4" /> Strike Deal
                    </a>
                  </div>

                  <button 
                    onClick={() => onRemove(product.id)}
                    className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Terminate Tracking
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
