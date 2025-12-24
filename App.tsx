import React, { useState, useMemo, useEffect } from 'react';
import { Product, Transaction, PurchaseOrder, ServiceLevelConfig, AnalysisResult } from './types';
import { calculateInventoryMetrics, generateMockData, downloadCSV } from './utils';
import { DashboardStats } from './components/DashboardStats';
import { InventoryTable } from './components/InventoryTable';
import { SettingsPanel } from './components/SettingsPanel';
import { TransactionModal } from './components/TransactionModal';
import { AISidebar } from './components/AISidebar';
import { DataImportModal } from './components/DataImportModal';
import { CalculationDetailModal } from './components/CalculationDetailModal';
import { LandingPage } from './components/LandingPage';
import { VideoDemoModal } from './components/VideoDemoModal';
import { DeploymentModal } from './components/DeploymentModal';
import { 
    LayoutDashboard, Plus, Upload, Sparkles, 
    Search, Database, Activity, DatabaseBackup,
    Eye, EyeOff, Info, Check, MapPin, Layers, Filter, RefreshCw, Play,
    FileSpreadsheet, ArrowRight, AlertCircle, ZapOff, Zap, Download,
    LogOut, User, CreditCard, Bell, ChevronDown, Lock, Crown, Globe
} from 'lucide-react';

type StockStatus = 'LOW' | 'OK' | 'HIGH' | 'STOCKOUT' | 'INACTIVE' | 'DEAD';
export type UserPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export type SortKey = 
  | 'category' 
  | 'product' 
  | 'branch' 
  | 'usage' 
  | 'stock' 
  | 'onOrder' 
  | 'savings' 
  | 'currentSet' 
  | 'target' 
  | 'sugOrder' 
  | 'health'
  | 'cost'
  | 'default';

export interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>('FREE');
  
  const initialData = generateMockData();
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialData.purchaseOrders);
  const [isUsingMockData, setIsUsingMockData] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [isTxModalOpen, setTxModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isAISidebarOpen, setAISidebarOpen] = useState(false);
  const [examiningItem, setExaminingItem] = useState<AnalysisResult | null>(null);
  
  // UI State
  const [selectedStatuses, setSelectedStatuses] = useState<StockStatus[]>(['LOW', 'OK', 'HIGH', 'STOCKOUT', 'DEAD']);
  const [showInactive, setShowInactive] = useState(false);
  const [hideLowUsage, setHideLowUsage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'default', direction: 'asc' });

  // STAGED STATE
  const [stagedBranches, setStagedBranches] = useState<string[]>([]);
  const [stagedCategories, setStagedCategories] = useState<string[]>([]);
  const [stagedSlConfig, setStagedSlConfig] = useState<ServiceLevelConfig>({
    global: 0.95,
    categories: {},
    stockBasis: 'physical',
    outlierThreshold: 3,
    orderCycleDays: 14,
    replenishmentModel: 'MIN_MAX',
    safetyStockStrategy: 'STATISTICAL',
    weeksOfSafetyStock: 2,
    leadTimeMode: 'AVERAGE',
    growthFactor: 1.0,
    rebalancingStrategy: 0.3,
    orderPlacementCost: 50,
    holdingCostAnnualPct: 0.20
  });

  // ACTIVE STATE
  const [activeBranches, setActiveBranches] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSlConfig, setActiveSlConfig] = useState<ServiceLevelConfig>(stagedSlConfig);

  const allBranches = useMemo(() => Array.from(new Set(products.map(p => p.branch || 'Unknown'))).sort(), [products]);
  const allCategories = useMemo(() => Array.from(new Set(products.map(p => p.category || 'General'))).sort(), [products]);

  useEffect(() => {
    if (products.length > 0 && stagedBranches.length === 0) {
      setStagedBranches(allBranches);
      setActiveBranches(allBranches);
    }
    if (products.length > 0 && stagedCategories.length === 0) {
      setStagedCategories(allCategories);
      setActiveCategories(allCategories);
    }
  }, [products, allBranches, allCategories]);

  const handleImportProducts = (p: Product[]) => {
      setProducts(p);
      setIsUsingMockData(false);
      const branches = Array.from(new Set(p.map(x => x.branch || 'Unknown'))).sort();
      const categories = Array.from(new Set(p.map(x => x.category || 'General'))).sort();
      setStagedBranches(branches);
      setStagedCategories(categories);
      setActiveBranches(branches);
      setActiveCategories(categories);
  };

  const handleRunAnalysis = () => {
      setIsCalculating(true);
      setTimeout(() => {
          setActiveSlConfig(stagedSlConfig);
          setActiveBranches(stagedBranches);
          setActiveCategories(stagedCategories);
          setIsCalculating(false);
          setCurrentPage(1);
      }, 600);
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleExportSuggestions = () => {
    if (userPlan === 'FREE') {
        alert("📊 Exporting results is a Pro feature. Please upgrade to download your audit.");
        return;
    }
    if (analysis.length === 0) return;
    
    const headers = ["SKU", "Product", "Branch", "Category", "ABC", "Status", "Usage/Day", "Current Min", "Target Min", "Current Max", "Target Max", "Sug. Order Qty", "Cost", "Opportunity"];
    const rows = analysis.map(item => [
      item.sku,
      `"${item.productName.replace(/"/g, '""')}"`,
      item.branch,
      item.category,
      item.abcClass,
      item.stockStatus,
      item.avgDailyUsage.toFixed(2),
      item.currentMinSetting,
      item.minStock,
      item.currentMaxSetting,
      item.maxStock,
      item.suggestedOrderQty,
      item.unitCost,
      item.grossOverstockValuation > 0 ? item.grossOverstockValuation : -item.shortfallValuation
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    downloadCSV(`inventory_optimization_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  };

  const hasPendingChanges = useMemo(() => {
      const configChanged = JSON.stringify(stagedSlConfig) !== JSON.stringify(activeSlConfig);
      const branchesChanged = JSON.stringify(stagedBranches.sort()) !== JSON.stringify(activeBranches.sort());
      const categoriesChanged = JSON.stringify(stagedCategories.sort()) !== JSON.stringify(activeCategories.sort());
      return configChanged || branchesChanged || categoriesChanged;
  }, [stagedSlConfig, activeSlConfig, stagedBranches, activeBranches, stagedCategories, activeCategories]);

  const toggleBranch = (branch: string) => setStagedBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);
  const toggleCategory = (cat: string) => setStagedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const analysis = useMemo(() => {
    try {
      const scopedProducts = products.filter(p => {
        const branchMatch = activeBranches.length === 0 || activeBranches.includes(p.branch);
        const categoryMatch = activeCategories.length === 0 || activeCategories.includes(p.category);
        return branchMatch && categoryMatch;
      });

      const results = calculateInventoryMetrics(scopedProducts, transactions, purchaseOrders, activeSlConfig);
      
      const filtered = results.filter(item => {
        const statusMatch = selectedStatuses.includes(item.stockStatus);
        const inactiveCheck = showInactive || item.stockStatus !== 'INACTIVE';
        const searchMatch = !searchQuery || 
                           item.productId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.productName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const usageCheck = !hideLowUsage || item.avgDailyUsage >= 1.0 || item.stockStatus === 'DEAD';

        return statusMatch && inactiveCheck && searchMatch && usageCheck;
      });

      return filtered.sort((a, b) => {
        const hierarchicalSort = () => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          if (a.sku !== b.sku) return a.sku.localeCompare(b.sku);
          return a.branch.localeCompare(b.branch);
        };

        if (sortConfig.key === 'default') {
          return hierarchicalSort();
        }

        let valA: any = 0;
        let valB: any = 0;

        switch (sortConfig.key) {
          case 'category': valA = a.category; valB = b.category; break;
          case 'branch': valA = a.branch; valB = b.branch; break;
          case 'product': valA = a.productName; valB = b.productName; break;
          case 'usage': valA = a.avgDailyUsage; valB = b.avgDailyUsage; break;
          case 'stock': valA = a.calculatedStock; valB = b.calculatedStock; break;
          case 'onOrder': valA = a.onOrderQty; valB = b.onOrderQty; break;
          case 'currentSet': valA = a.currentMaxSetting; valB = b.currentMaxSetting; break;
          case 'target': valA = a.maxStock; valB = b.maxStock; break;
          case 'sugOrder': valA = a.suggestedOrderQty; valB = b.suggestedOrderQty; break;
          case 'cost': valA = a.unitCost; valB = b.unitCost; break;
          case 'savings':
            valA = a.grossOverstockValuation > 0 ? a.grossOverstockValuation : -a.shortfallValuation;
            valB = b.grossOverstockValuation > 0 ? b.grossOverstockValuation : -b.shortfallValuation;
            break;
          case 'health':
            const priority = { 'STOCKOUT': 0, 'DEAD': 1, 'LOW': 2, 'OK': 3, 'HIGH': 4, 'INACTIVE': 5 };
            valA = priority[a.stockStatus];
            valB = priority[b.stockStatus];
            break;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        
        return hierarchicalSort();
      });
    } catch (e) {
      console.error("Analysis calculation failed:", e);
      return [];
    }
  }, [products, transactions, purchaseOrders, activeSlConfig, activeBranches, activeCategories, selectedStatuses, searchQuery, showInactive, hideLowUsage, sortConfig]);

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onGetStarted={() => setIsLoggedIn(true)} onWatchDemo={() => setIsDemoModalOpen(true)} />
        <VideoDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      </>
    );
  }

  const upgradeToPro = () => {
      setUserPlan('PRO');
      alert("🚀 Congratulations! You are now on the Pro Plan. All features unlocked.");
  };

  const handlePushToProduction = () => {
    if (userPlan === 'FREE') {
      upgradeToPro();
      return;
    }
    setIsDeployModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setIsLoggedIn(false)}
              title="Return to Website"
            >
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:bg-indigo-700 transition">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter italic">OptiStock<span className="text-indigo-600">.ai</span></span>
              <div className={`ml-4 px-2.5 py-1 border rounded-full text-[10px] uppercase font-black tracking-widest ${userPlan === 'FREE' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                {userPlan} Plan
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => userPlan === 'PRO' ? setAISidebarOpen(!isAISidebarOpen) : upgradeToPro()} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${userPlan === 'PRO' ? 'text-slate-600 hover:bg-slate-50 border-transparent' : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'}`}
               >
                {userPlan === 'PRO' ? <Sparkles className="h-4 w-4 text-indigo-500" /> : <Crown className="h-4 w-4 text-amber-500" />}
                {userPlan === 'PRO' ? 'AI Assistant' : 'Unlock Pro AI'}
               </button>
               
               <div className="h-8 w-px bg-slate-100 mx-2"></div>

               <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>

               <div className="flex items-center gap-3 pl-4 border-l border-slate-100 group cursor-pointer" onClick={() => setIsLoggedIn(false)}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition">
                     JD
                  </div>
                  <div className="hidden lg:flex flex-col">
                     <span className="text-xs font-black text-slate-900">John Dalton</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Director (LogiCorp)</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-300" />
               </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar sticky top-16 h-[calc(100vh-64px)] hidden xl:block p-6">
            <div className="space-y-8">
                {/* Billing Summary / Upgrade Hook */}
                {userPlan === 'FREE' ? (
                    <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl relative overflow-hidden group cursor-pointer" onClick={upgradeToPro}>
                       <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                       <h4 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Crown className="h-4 w-4 text-amber-400" /> Upgrade to Pro
                       </h4>
                       <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">Unlock CSV Bulk Imports, AI-Powered Strategy, and Cross-Branch Rebalancing.</p>
                       <div className="mt-4 py-2 bg-white text-indigo-600 text-center rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition">Get Unlimited Access</div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition"></div>
                       <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="h-4 w-4 text-indigo-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subscription</span>
                       </div>
                       <h4 className="text-lg font-black leading-tight">Enterprise Plus</h4>
                       <p className="text-[10px] text-slate-400 font-bold mt-1">Renewal: Jan 12, 2026</p>
                       <button className="w-full mt-4 py-2 bg-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition">Manage Billing</button>
                    </div>
                )}

                <div className={`rounded-2xl p-5 shadow-xl transition-all duration-500 ${hasPendingChanges ? 'bg-indigo-600' : 'bg-slate-50'}`}>
                   <h3 className={`font-black text-[10px] uppercase tracking-widest ${hasPendingChanges ? 'text-white' : 'text-slate-400'}`}>Logic Orchestrator</h3>
                   <button 
                      onClick={handleRunAnalysis}
                      disabled={isCalculating || !hasPendingChanges}
                      className={`w-full mt-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 ${
                        hasPendingChanges 
                        ? 'bg-white text-indigo-600 shadow-lg' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                   >
                      {isCalculating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                      Recalculate Network
                   </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 mb-4">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Layer {userPlan === 'FREE' && <Lock className="h-3 w-3 inline ml-1" />}</h3>
                   </div>
                   
                   <div className={`space-y-6 ${userPlan === 'FREE' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                      <div className="space-y-3">
                         <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Node Filter</span>
                         <div className="flex flex-wrap gap-1.5">
                            {allBranches.map(branch => (
                               <button 
                                 key={branch}
                                 onClick={() => toggleBranch(branch)}
                                 className={`px-2 py-1 rounded text-[10px] font-bold transition border ${
                                   stagedBranches.includes(branch) 
                                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                   : 'bg-white text-slate-400 border-slate-100'
                                 }`}
                               >
                                 {branch}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-3">
                         <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5"><Layers className="h-3 w-3" /> Class Filter</span>
                         <div className="flex flex-wrap gap-1.5">
                            {allCategories.map(cat => (
                               <button 
                                 key={cat}
                                 onClick={() => toggleCategory(cat)}
                                 className={`px-2 py-1 rounded text-[10px] font-bold transition border ${
                                   stagedCategories.includes(cat) 
                                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                   : 'bg-white text-slate-400 border-slate-100'
                                 }`}
                               >
                                 {cat}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                   {userPlan === 'FREE' && (
                     <button onClick={upgradeToPro} className="w-full mt-4 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Unlock Advanced Filtering</button>
                   )}
                </div>

                <SettingsPanel config={stagedSlConfig} onUpdate={setStagedSlConfig} categories={allCategories} />
            </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50">
            <div className="flex flex-col md:flex-row justify-between mb-10 gap-4 items-end">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Console Executive</h1>
                   <p className="text-sm text-slate-400 mt-2 font-medium">Monitoring {products.length} SKU nodes across {allBranches.length} global locations</p>
                </div>
                <div className="flex gap-2 h-fit">
                    <button 
                        onClick={handlePushToProduction}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-2xl shadow-slate-200"
                    >
                        <Globe className="h-4 w-4 text-indigo-400" /> Push to Production
                    </button>
                    <button 
                        onClick={handleExportSuggestions} 
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm relative group overflow-hidden"
                    >
                        {userPlan === 'FREE' && <Lock className="h-3 w-3 text-slate-300 absolute -top-1 -right-1 group-hover:text-indigo-500 transition" />}
                        <Download className="h-4 w-4" /> Export Audit
                    </button>
                    <button onClick={() => setTxModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100"><Plus className="h-4 w-4" /> Log Movement</button>
                </div>
            </div>

            <DashboardStats 
                analysis={analysis} 
                onQuickFilter={(s) => {
                    setCurrentPage(1);
                    if (s === 'ALL') {
                        setSelectedStatuses(['LOW','OK','HIGH','STOCKOUT', 'DEAD']);
                    } else if (s === 'HIGH') {
                        setSelectedStatuses(['HIGH']);
                        setSortConfig({ key: 'savings', direction: 'desc' });
                    } else if (s === 'LOW') {
                        setSelectedStatuses(['LOW', 'STOCKOUT']);
                        setSortConfig({ key: 'savings', direction: 'asc' });
                    } else if (s === 'DEAD') {
                        setSelectedStatuses(['DEAD']);
                        setSortConfig({ key: 'savings', direction: 'desc' });
                    } else {
                        setSelectedStatuses([s as any]);
                    }
                }} 
            />

            <div className="relative">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="relative flex-1 w-full max-w-lg group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition" />
                        <input 
                            type="text" 
                            placeholder="Identify specific SKU or Branch ID..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none transition shadow-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setImportModalOpen(true)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border ${
                                userPlan === 'PRO' 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                            <Upload className="h-4 w-4" /> 
                            {userPlan === 'PRO' ? 'Bulk Upload' : 'Unlock Bulk Upload'}
                        </button>

                        <button 
                            onClick={() => setHideLowUsage(!hideLowUsage)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border ${
                                hideLowUsage 
                                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-inner' 
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {hideLowUsage ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                            {hideLowUsage ? 'Usage Filter: Active' : 'All Usage'}
                        </button>

                        <button 
                            onClick={() => setShowInactive(!showInactive)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition border ${
                                showInactive 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' 
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {showInactive ? 'Zero-Stock Visible' : 'Zero-Stock Hidden'}
                        </button>
                    </div>
                </div>

                <div className={`transition-all duration-700 ${isCalculating ? 'opacity-30 blur-md pointer-events-none scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
                    <InventoryTable 
                        analysis={analysis} 
                        products={products} 
                        onExamine={setExaminingItem} 
                        hasScopeSelected={activeBranches.length > 0 || activeCategories.length > 0}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
                
                {isCalculating && (
                   <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-white/90 backdrop-blur-2xl px-12 py-6 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-indigo-100 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                         <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin relative z-10" />
                         </div>
                         <div className="text-center">
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Syncing Market Vectors</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Stochastic Optimization Engine v2.4</p>
                         </div>
                      </div>
                   </div>
                )}
            </div>
        </main>
      </div>

      <TransactionModal isOpen={isTxModalOpen} onClose={() => setTxModalOpen(false)} products={products} onAddTransaction={(t) => setTransactions(prev => [...prev, t])} />
      <DataImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImportProducts={handleImportProducts} onImportTransactions={setTransactions} onImportPOs={setPurchaseOrders} onClearAll={() => {setProducts([]); setTransactions([]); setPurchaseOrders([]);}} hasData={products.length > 0} isPro={userPlan === 'PRO'} onUpgrade={upgradeToPro} />
      <AISidebar isOpen={isAISidebarOpen} onClose={() => setAISidebarOpen(false)} analysis={analysis} products={products} />
      {examiningItem && <CalculationDetailModal isOpen={true} onClose={() => setExaminingItem(null)} item={examiningItem} product={products.find(p => p.id === examiningItem.productId)!} />}
      <DeploymentModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} nodes={activeBranches} />
    </div>
  );
};

export default App;