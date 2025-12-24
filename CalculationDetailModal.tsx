import React from 'react';
import { AnalysisResult, Product } from '../types';
import { X, Calculator, Info, Sigma, ArrowRight, Zap, TrendingUp, ShieldCheck, History, Sparkles, BrainCircuit, Clock, ArrowDown, ArrowUp, Package, PiggyBank, Target, Shuffle, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface CalculationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AnalysisResult;
  product: Product;
}

export const CalculationDetailModal: React.FC<CalculationDetailModalProps> = ({ isOpen, onClose, item, product }) => {
  if (!isOpen) return null;

  const d = item.avgDailyUsage;
  const L = item.leadTimeUsed;
  const SS = item.safetyStock;
  const model = item.replenishmentModelUsed;
  const ssStrategy = item.safetyStockStrategyUsed;
  const serviceLevelLabel = (item.serviceLevelUsed * 100).toFixed(1);

  const minDiff = item.minStock - item.currentMinSetting;
  const maxDiff = item.maxStock - item.currentMaxSetting;

  const onOrderValuation = item.onOrderQty * product.cost;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const chartData = item.monthlyTrend && item.monthlyTrend.length > 0 
    ? item.monthlyTrend 
    : [
        { month: 'Jan', quantity: 0 },
        { month: 'Feb', quantity: 0 },
        { month: 'Mar', quantity: 0 }
      ];

  return (
    <div className="fixed inset-0 bg-indigo-950/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-indigo-100 flex flex-col max-h-[95vh]">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-start flex-shrink-0">
          <div className="flex gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Strategy Audit</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.abcClass === 'A' ? 'bg-amber-400 text-indigo-900' : 'bg-white/20 text-white'}`}>
                    CLASS {item.abcClass}
                </span>
              </div>
              <p className="text-indigo-100 text-sm opacity-90">{product.name} ({product.sku}) - {item.branch}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          {/* Trend Chart */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                   <BarChart3 className="h-3.5 w-3.5" /> Demand Seasonality
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Last {chartData.length} Months</span>
             </div>
             <div className="h-48 w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 800 }}
                        cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="quantity" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorQty)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Transfer & EOQ Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className={`p-4 rounded-2xl border transition ${item.suggestedTransferQty > 0 ? 'bg-emerald-50 border-emerald-100 animate-pulse' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                   <Shuffle className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Internal Transfer</span>
                </div>
                {item.suggestedTransferQty > 0 ? (
                    <div className="space-y-1">
                       <p className="text-xl font-mono font-black text-emerald-900">{item.suggestedTransferQty} Units</p>
                       <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Source: {item.transferSourceBranch}</p>
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-400 font-bold italic">No internal stock excess found.</p>
                )}
             </div>

             <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-700">
                   <DollarSign className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Economic Order (EOQ)</span>
                </div>
                <div className="space-y-1">
                   <p className="text-xl font-mono font-black text-indigo-900">{item.eoq} Units</p>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">Minimizes Total TCO</p>
                </div>
             </div>
          </div>

          {/* Logic Summary */}
          <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-xl">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Algorithm Pattern</span>
            <div className="text-xl font-mono font-bold text-white">
               {model === 'MIN_MAX' && "ROP = (Demand × Lead) + Safety"}
               {model === 'PERIODIC_REVIEW' && "Max = Demand × (Int + Lead) + Safety"}
               {model === 'FIXED_DAYS' && "Fixed Coverage Loop"}
            </div>
          </div>

          {/* Setting Comparison Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-3">Reorder Point (Min)</span>
                  <div className="flex items-end justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold">CURRENT</span>
                        <span className="text-xl font-mono font-bold text-gray-500 line-through">{item.currentMinSetting}</span>
                     </div>
                     <ArrowRight className="h-4 w-4 text-gray-300 mb-2" />
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] text-indigo-600 font-bold">OPTIMIZED</span>
                        <div className="flex items-center gap-1 text-2xl font-mono font-black text-indigo-900">
                           {item.minStock}
                           {minDiff !== 0 && (
                             minDiff > 0 ? <ArrowUp className="h-4 w-4 text-rose-500" /> : <ArrowDown className="h-4 w-4 text-emerald-500" />
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-3">Order-Up-To (Max)</span>
                  <div className="flex items-end justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold">CURRENT</span>
                        <span className="text-xl font-mono font-bold text-gray-500 line-through">{item.currentMaxSetting}</span>
                     </div>
                     <ArrowRight className="h-4 w-4 text-gray-300 mb-2" />
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] text-indigo-600 font-bold">OPTIMIZED</span>
                        <div className="flex items-center gap-1 text-2xl font-mono font-black text-indigo-900">
                           {item.maxStock}
                           {maxDiff !== 0 && (
                             maxDiff > 0 ? <ArrowUp className="h-4 w-4 text-rose-500" /> : <ArrowDown className="h-4 w-4 text-emerald-500" />
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Demand Base</span>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                   <span className="text-xs text-gray-500">Usage Rate (Adjusted)</span>
                   <span className="font-mono font-bold">{d.toFixed(2)}/day</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                   <span className="text-xs text-gray-500">Lead Time ({item.leadTimeModeUsed})</span>
                   <span className="font-mono font-bold">{L.toFixed(1)} days</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Safety Protocol</span>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                   <span className="text-xs text-indigo-600 font-bold">{ssStrategy === 'STATISTICAL' ? `Statistical (${serviceLevelLabel}%)` : 'Weeks Cover Rule'}</span>
                   <span className="font-mono font-bold text-indigo-700">{SS} units</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                    {ssStrategy === 'WEEKS_OF_COVER' 
                        ? "Calculated based on your manual weeks-of-usage target." 
                        : `Calculated based on demand variability at a ${serviceLevelLabel}% fill rate target.`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl flex gap-3 items-start border border-amber-100 text-xs text-amber-800 leading-relaxed italic">
             <Info className="h-4 w-4 text-amber-600 mt-0.5" />
             <p>Rebalancing Logic: This audit credits "In Transit" stock and potential "Donor Branch" transfers to your target gap. If a transfer is suggested, the new order quantity is reduced to prioritize existing internal capital over new debt.</p>
          </div>
        </div>
      </div>
    </div>
  );
};