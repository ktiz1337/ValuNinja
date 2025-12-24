import React from 'react';
import { AnalysisResult } from '../types';
import { DollarSign, AlertOctagon, TrendingDown, ArrowUpCircle, Shuffle, Truck, Layers, Package, PiggyBank, Target, ArrowDownCircle, Activity, HeartPulse, Ghost } from 'lucide-react';

interface DashboardStatsProps {
  analysis: AnalysisResult[];
  onQuickFilter?: (status: 'STOCKOUT' | 'LOW' | 'HIGH' | 'OK' | 'DEAD' | 'ALL') => void;
  isFiltered?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ analysis, onQuickFilter, isFiltered }) => {
  const totalValuation = analysis.reduce((acc, curr) => acc + curr.currentValuation, 0);
  const totalOptimalValuation = analysis.reduce((acc, curr) => acc + curr.optimalValuation, 0);
  const totalOverstockOpportunity = analysis.reduce((acc, curr) => acc + (curr.stockStatus === 'HIGH' ? curr.grossOverstockValuation : 0), 0);
  const deadStockValuation = analysis.reduce((acc, curr) => acc + (curr.stockStatus === 'DEAD' ? curr.currentValuation : 0), 0);
  const totalShortfall = analysis.reduce((acc, curr) => acc + curr.shortfallValuation, 0);
  
  const stockouts = analysis.filter((a) => a.stockStatus === 'STOCKOUT').length;
  const unhealthyCount = analysis.filter((a) => a.stockStatus === 'LOW' || a.stockStatus === 'STOCKOUT').length;
  const deadCount = analysis.filter((a) => a.stockStatus === 'DEAD').length;
  const totalActiveItems = analysis.filter(a => a.stockStatus !== 'INACTIVE').length;
  const healthyItems = analysis.filter(a => a.stockStatus === 'OK' || a.stockStatus === 'HIGH').length;
  
  const healthPercentage = totalActiveItems > 0 ? (healthyItems / totalActiveItems) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getHealthColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (val >= 75) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      {/* Portfolio Health */}
      <div 
        onClick={() => onQuickFilter?.('OK')}
        className={`p-4 rounded-2xl shadow-sm border cursor-pointer transition relative overflow-hidden group ${getHealthColor(healthPercentage)}`}
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Health</p>
            <HeartPulse className="h-3.5 w-3.5 opacity-60" />
        </div>
        <h3 className="text-xl font-black tracking-tight">{healthPercentage.toFixed(1)}%</h3>
        <p className="text-[8px] mt-1 font-bold uppercase opacity-70">Service Level</p>
      </div>

      {/* Valuation */}
      <div 
        onClick={() => onQuickFilter?.('ALL')}
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-200 transition group"
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Port.</p>
            <Target className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(totalValuation)}</h3>
        <p className="text-[8px] text-gray-400 mt-1 font-bold uppercase">Optimal: {formatCurrency(totalOptimalValuation)}</p>
      </div>

      {/* Recovery Opp */}
      <div 
        onClick={() => onQuickFilter?.('HIGH')}
        className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition group cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Recovery</p>
            <PiggyBank className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(totalOverstockOpportunity)}</h3>
        <p className="text-[8px] text-emerald-600 mt-1 font-bold uppercase">Overstock</p>
      </div>

      {/* Dead Stock */}
      <div 
        onClick={() => onQuickFilter?.('DEAD')}
        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-300 transition group cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Dead Stock</p>
            <Ghost className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(deadStockValuation)}</h3>
        <p className="text-[8px] text-gray-500 mt-1 font-bold uppercase">{deadCount} SKUs No Usage</p>
      </div>

      {/* Investment Gap */}
      <div 
        onClick={() => onQuickFilter?.('LOW')}
        className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 hover:border-rose-300 transition group cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Shortfall</p>
            <ArrowDownCircle className="h-3.5 w-3.5 text-rose-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(totalShortfall)}</h3>
        <p className="text-[8px] text-rose-600 mt-1 font-bold uppercase">Target Gap</p>
      </div>

      {/* Stockout Risk */}
      <div 
        onClick={() => onQuickFilter?.('STOCKOUT')}
        className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 cursor-pointer hover:border-red-200 transition group"
      >
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Risk</p>
            <AlertOctagon className="h-3.5 w-3.5 text-red-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{stockouts}</h3>
        <p className="text-[8px] text-red-500 mt-1 font-bold uppercase">{unhealthyCount} Low/Out</p>
      </div>

      {/* Efficiency Score */}
      <div className="bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden hidden lg:block">
        <div className="flex justify-between items-start mb-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</p>
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{(totalOptimalValuation / (totalValuation || 1) * 100).toFixed(0)}%</h3>
        <p className="text-[8px] text-gray-400 mt-1 font-bold uppercase">Asset Utilization</p>
      </div>
    </div>
  );
};