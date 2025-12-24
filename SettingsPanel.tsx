import React from 'react';
import { ServiceLevelConfig, ReplenishmentModel, SafetyStockStrategy, LeadTimeMode } from '../types';
import { Settings, Info, Layers, ZapOff, CalendarRange, BrainCircuit, ShieldCheck, TrendingUp, Clock, Shuffle, Target, Lock } from 'lucide-react';

interface SettingsPanelProps {
  config: ServiceLevelConfig;
  onUpdate: (newConfig: ServiceLevelConfig) => void;
  categories: string[];
  isPro?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onUpdate, categories, isPro = true }) => {
  const update = (patch: Partial<ServiceLevelConfig>) => onUpdate({ ...config, ...patch });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 bg-gray-50 rounded-lg text-gray-500">
            <Settings className="h-3.5 w-3.5" />
        </div>
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Strategy Sliders</h3>
      </div>

      <div className="space-y-8">
        {/* GLOBAL SERVICE LEVEL */}
        <div>
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
            <Target className="h-3 w-3 text-indigo-500" /> Service Target
          </label>
          <div className="flex items-center gap-3">
              <input 
                type="range" min="0.80" max="0.995" step="0.005"
                value={config.global}
                onChange={(e) => update({ global: parseFloat(e.target.value) })}
                className="flex-1 accent-indigo-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold w-12 text-center text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded-lg border border-indigo-100">
                  {(config.global * 100).toFixed(1)}%
              </span>
          </div>
          <p className="text-[9px] text-gray-400 mt-2 leading-tight">
            Probability of stock availability.
          </p>
        </div>

        {/* REBALANCING LOGIC */}
        <div className={!isPro ? 'opacity-40 grayscale pointer-events-none' : ''}>
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
            <Shuffle className="h-3 w-3 text-blue-500" /> Rebalancing {!isPro && <Lock className="h-2 w-2" />}
          </label>
          <div className="flex justify-between text-[8px] text-gray-400 font-black mb-1.5 uppercase">
              <span>Transfer</span>
              <span>Order</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.1"
            value={config.rebalancingStrategy}
            onChange={(e) => update({ rebalancingStrategy: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer mb-2"
          />
        </div>

        {/* FORECAST GROWTH */}
        <div>
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Demand Growth
          </label>
          <div className="flex items-center gap-3">
              <input 
                type="range" min="0.5" max="2.0" step="0.05"
                value={config.growthFactor}
                onChange={(e) => update({ growthFactor: parseFloat(e.target.value) })}
                className="flex-1 accent-emerald-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono font-bold w-12 text-center text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-lg border border-emerald-100">
                  {Math.round((config.growthFactor - 1) * 100)}%
              </span>
          </div>
        </div>

        {/* REPLENISHMENT MODEL */}
        <div className="pt-4 border-t border-gray-50">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 block">Model Type</label>
          <select
            value={config.replenishmentModel}
            onChange={(e) => update({ replenishmentModel: e.target.value as ReplenishmentModel })}
            className="w-full px-3 py-2 text-[11px] border border-gray-100 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
          >
            <option value="MIN_MAX">Min / Max (Traditional)</option>
            <option value="PERIODIC_REVIEW">Periodic Review</option>
            <option value="FIXED_DAYS">Fixed Days Basis</option>
          </select>
        </div>

        {/* SAFETY STOCK STRATEGY */}
        <div className="pt-4 border-t border-gray-50">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-indigo-400" /> Buffer Logic
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 rounded-lg mb-4">
              <button 
                onClick={() => update({ safetyStockStrategy: 'STATISTICAL' })}
                className={`py-1.5 text-[9px] font-black uppercase rounded transition ${config.safetyStockStrategy === 'STATISTICAL' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
              >Stats</button>
              <button 
                onClick={() => update({ safetyStockStrategy: 'WEEKS_OF_COVER' })}
                className={`py-1.5 text-[9px] font-black uppercase rounded transition ${config.safetyStockStrategy === 'WEEKS_OF_COVER' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
              >Weeks</button>
          </div>
          
          {config.safetyStockStrategy === 'WEEKS_OF_COVER' && (
             <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-gray-400">Target</span>
                    <span className="text-[10px] font-bold text-indigo-600">{config.weeksOfSafetyStock}w</span>
                </div>
                <input 
                    type="range" min="0.5" max="12" step="0.5"
                    value={config.weeksOfSafetyStock}
                    onChange={(e) => update({ weeksOfSafetyStock: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};