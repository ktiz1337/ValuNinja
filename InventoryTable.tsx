import React, { useState, useMemo } from 'react';
import { AnalysisResult, Product } from '../types';
import { SortConfig, SortKey } from '../App';
import { 
  AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Sigma, SearchX, 
  PackageOpen, MousePointer2, Ghost, ChevronLeft, ChevronRight,
  Truck, Shuffle, ArrowRight, PiggyBank,
  ArrowUp, ArrowDown, TrendingDown as TrendDownIcon,
  Package, Layers, MapPin, Settings2, Eye, EyeOff, RotateCcw,
  MoveUp, MoveDown, GripVertical, Info
} from 'lucide-react';

interface InventoryTableProps {
  analysis: AnalysisResult[];
  products: Product[];
  onExamine: (item: AnalysisResult) => void;
  isFilterActive?: boolean;
  hasScopeSelected?: boolean;
  sortConfig?: SortConfig;
  onSort?: (key: SortKey) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: string;
  bold?: boolean;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'category', label: 'Group', minWidth: '120px' },
  { key: 'product', label: 'Product Node', minWidth: '220px', bold: true },
  { key: 'branch', label: 'Node Location', minWidth: '130px' },
  { key: 'usage', label: 'Velocity', align: 'center' },
  { key: 'cost', label: 'Unit Cost', align: 'right' },
  { key: 'stock', label: 'On Hand', align: 'right', minWidth: '90px' },
  { key: 'onOrder', label: 'Pipeline', align: 'center' },
  { key: 'savings', label: 'Capital Delta', align: 'right', minWidth: '140px' },
  { key: 'currentSet', label: 'Current ROP/OUT', align: 'right', minWidth: '120px' },
  { key: 'target', label: 'Optimized Target', align: 'right', minWidth: '150px' },
  { key: 'sugOrder', label: 'Action Qty', align: 'center', minWidth: '120px' },
  { key: 'health', label: 'Risk State', align: 'center' },
];

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  analysis, 
  products, 
  onExamine, 
  isFilterActive, 
  hasScopeSelected,
  sortConfig,
  onSort,
  currentPage,
  onPageChange
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<SortKey>>(new Set());
  const [columnOrder, setColumnOrder] = useState<SortKey[]>(DEFAULT_COLUMNS.map(c => c.key));

  const activeColumns = useMemo(() => {
    return columnOrder.map(key => DEFAULT_COLUMNS.find(c => c.key === key)!).filter(c => !hiddenColumns.has(c.key));
  }, [columnOrder, hiddenColumns]);

  const itemsPerPage = 25;
  const totalPages = Math.ceil(analysis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  const paginatedData = analysis.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleColumn = (key: SortKey) => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...columnOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setColumnOrder(newOrder);
  };

  const resetTable = () => {
    setColumnOrder(DEFAULT_COLUMNS.map(c => c.key));
    setHiddenColumns(new Set());
    onSort?.('default');
  };

  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUp className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-30 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-indigo-600" /> : <ArrowDown className="h-3 w-3 ml-1 text-indigo-600" />;
  };

  if (!hasScopeSelected && products.length > 0) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-24 flex flex-col items-center justify-center text-center">
        <div className="p-8 bg-indigo-50 rounded-[28px] mb-8 animate-pulse">
          <Layers className="h-12 w-12 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Scope Required</h3>
        <p className="text-slate-500 mt-2 max-w-sm font-medium">Please select a global node or product classification to initiate stochastic analysis.</p>
      </div>
    );
  }

  if (analysis.length === 0) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-slate-50 rounded-full mb-6">
          {isFilterActive ? <SearchX className="h-12 w-12 text-slate-300" /> : <PackageOpen className="h-12 w-12 text-slate-300" />}
        </div>
        <h3 className="text-xl font-black text-slate-900">Zero Result Vectors</h3>
        <p className="text-slate-400 font-medium">No SKU nodes matched your current logical filters.</p>
      </div>
    );
  }

  const getABCStyle = (abc: 'A'|'B'|'C') => {
    if (abc === 'A') return 'bg-indigo-600 text-white ring-2 ring-indigo-100 shadow-lg';
    if (abc === 'B') return 'bg-indigo-100 text-indigo-700 font-black';
    return 'bg-slate-100 text-slate-400 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Table Header Controls */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{analysis.length} SKUs Identified</span>
            {(sortConfig?.key !== 'default' || hiddenColumns.size > 0 || JSON.stringify(columnOrder) !== JSON.stringify(DEFAULT_COLUMNS.map(c => c.key))) && (
                <button 
                  onClick={resetTable}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
                >
                  <RotateCcw className="h-3 w-3" /> Restore Factory Grid
                </button>
            )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-2xl border transition ${showConfig ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Settings2 className="h-3.5 w-3.5" /> View Preferences
          </button>
          
          {showConfig && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grid Configuration</p>
                    <div className="p-1 bg-slate-50 rounded-lg"><Info className="h-3 w-3 text-slate-300" /></div>
                </div>
                
                <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                  {columnOrder.map((key, index) => {
                    const col = DEFAULT_COLUMNS.find(c => c.key === key)!;
                    const isHidden = hiddenColumns.has(key);
                    return (
                      <div 
                        key={key}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition ${isHidden ? 'bg-slate-50 border-slate-50 opacity-40' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                           <GripVertical className="h-4 w-4 text-slate-200 shrink-0" />
                           <button 
                             onClick={() => toggleColumn(key)}
                             className="flex items-center gap-3 overflow-hidden text-left"
                           >
                              <div className={`p-1.5 rounded-xl transition ${isHidden ? 'text-slate-300' : 'text-indigo-600 bg-indigo-50'}`}>
                                 {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </div>
                              <span className={`text-[11px] truncate tracking-tight ${isHidden ? 'text-slate-400 font-bold' : 'text-slate-900 font-black'}`}>
                                {col.label}
                              </span>
                           </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                           <button 
                             onClick={() => moveColumn(index, 'up')}
                             disabled={index === 0}
                             className="p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-0 rounded-lg transition"
                           >
                              <MoveUp className="h-3.5 w-3.5" />
                           </button>
                           <button 
                             onClick={() => moveColumn(index, 'down')}
                             disabled={index === columnOrder.length - 1}
                             className="p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-0 rounded-lg transition"
                           >
                              <MoveDown className="h-3.5 w-3.5" />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                {activeColumns.map(col => (
                  <th 
                    key={col.key}
                    onClick={() => onSort?.(col.key)}
                    className={`px-6 py-6 font-black tracking-widest cursor-pointer hover:bg-slate-100 transition group ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.key === 'product' ? 'sticky left-0 bg-slate-50/80 backdrop-blur-md z-10' : ''}`}
                    style={{ minWidth: col.minWidth }}
                  >
                    <div className={`flex items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}>
                      {col.label} <SortIndicator columnKey={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((item) => {
                let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                let Icon = CheckCircle;
                if (item.stockStatus === 'LOW') { statusColor = 'text-amber-600 bg-amber-50 border-amber-100'; Icon = TrendingDown; }
                else if (item.stockStatus === 'HIGH') { statusColor = 'text-indigo-600 bg-indigo-50 border-indigo-100'; Icon = TrendingUp; }
                else if (item.stockStatus === 'STOCKOUT') { statusColor = 'text-rose-600 bg-rose-50 border-rose-100'; Icon = AlertTriangle; }
                else if (item.stockStatus === 'DEAD') { statusColor = 'text-slate-400 bg-slate-100 border-slate-200'; Icon = Ghost; }
                else if (item.stockStatus === 'INACTIVE') { statusColor = 'text-slate-300 bg-slate-50 border-slate-50'; Icon = SearchX; }

                return (
                  <tr key={`${item.productId}-${item.branch}`} className="hover:bg-slate-50/80 transition-all group">
                    {activeColumns.map(col => {
                      const cellClass = `px-6 py-6 whitespace-nowrap ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right font-mono' : ''}`;
                      
                      switch (col.key) {
                        case 'category':
                          return (
                            <td key={col.key} className={cellClass}>
                               <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                  <Layers className="h-3.5 w-3.5 text-slate-200" />
                                  {item.category}
                               </div>
                            </td>
                          );
                        case 'product':
                          return (
                            <td key={col.key} className="px-8 py-6 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                              <div className="flex items-start gap-4">
                                  <span className={`flex-shrink-0 w-5 h-5 rounded-lg text-[9px] font-black flex items-center justify-center mt-0.5 ${getABCStyle(item.abcClass)}`}>
                                     {item.abcClass}
                                  </span>
                                  <div className="flex flex-col">
                                      <span className="font-black text-slate-900 tracking-tight">{item.productName}</span>
                                      <span className="text-[10px] text-slate-400 font-mono tracking-tighter mt-1">{item.sku}</span>
                                  </div>
                              </div>
                            </td>
                          );
                        case 'branch':
                          return (
                            <td key={col.key} className={cellClass}>
                               <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
                                  <MapPin className="h-3.5 w-3.5 text-indigo-200" />
                                  {item.branch}
                               </div>
                            </td>
                          );
                        case 'usage':
                          return (
                            <td key={col.key} className={cellClass}>
                               <span className={`font-mono text-[13px] font-black ${item.avgDailyUsage < 1.0 ? 'text-amber-400' : 'text-slate-800'}`}>
                                {(item.avgDailyUsage || 0).toFixed(2)}
                               </span>
                            </td>
                          );
                        case 'cost':
                          return <td key={col.key} className={`${cellClass} text-slate-500 font-medium`}>{formatCurrency(item.unitCost)}</td>;
                        case 'stock':
                          return (
                            <td key={col.key} className={`${cellClass} border-l border-slate-100 font-black text-lg tracking-tighter ${item.calculatedStock <= 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                              {item.calculatedStock.toLocaleString()}
                            </td>
                          );
                        case 'onOrder':
                          return (
                            <td key={col.key} className={`${cellClass} border-l border-slate-100`}>
                                {item.onOrderQty > 0 ? (
                                   <div className="flex flex-col items-center">
                                      <span className="text-amber-600 font-black text-[11px] bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
                                        <Package className="h-3 w-3" />
                                        {item.onOrderQty.toLocaleString()}
                                      </span>
                                   </div>
                                ) : <span className="text-slate-200">—</span>}
                            </td>
                          );
                        case 'savings':
                          return (
                            <td key={col.key} className={`${cellClass} border-l border-indigo-100/50 bg-indigo-50/5 ${item.grossOverstockValuation > 1000 || item.shortfallValuation > 1000 ? 'bg-indigo-50/20' : ''}`}>
                              {item.stockStatus === 'DEAD' ? (
                                <div className="flex flex-col items-end">
                                   <span className="flex items-center gap-1.5 text-slate-500 font-black text-xs">
                                     <Ghost className="h-3.5 w-3.5" />
                                     {formatCurrency(item.currentValuation)}
                                   </span>
                                </div>
                              ) : item.grossOverstockValuation > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                                    <PiggyBank className="h-3.5 w-3.5" />
                                    +{formatCurrency(item.grossOverstockValuation)}
                                  </span>
                                </div>
                              ) : item.shortfallValuation > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="flex items-center gap-1.5 text-rose-500 font-black text-xs">
                                    <TrendDownIcon className="h-3.5 w-3.5" />
                                    -{formatCurrency(item.shortfallValuation)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        case 'currentSet':
                          return (
                            <td key={col.key} className={`${cellClass} border-l border-slate-100 text-slate-300 text-[10px] font-bold italic tracking-widest`}>
                                {item.currentMinSetting} / {item.currentMaxSetting}
                            </td>
                          );
                        case 'target':
                          return (
                            <td key={col.key} className={`${cellClass} bg-indigo-50/20 group-hover:bg-indigo-50/40 transition-all border-x border-indigo-50`}>
                                <div className="flex flex-col items-end">
                                  <div className="font-mono text-indigo-700 font-black text-[13px] flex items-center gap-2">
                                    {item.minStock} / {item.maxStock}
                                    <button 
                                      onClick={() => onExamine(item)} 
                                      className="p-1 bg-white border border-indigo-100 rounded-lg text-indigo-400 hover:text-indigo-700 hover:shadow-md transition shadow-sm"
                                    >
                                      <Sigma className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                            </td>
                          );
                        case 'sugOrder':
                          return (
                            <td key={col.key} className={`${cellClass}`}>
                                {item.suggestedOrderQty > 0 || item.suggestedTransferQty > 0 ? (
                                    <div className="flex flex-col items-center gap-1.5">
                                        {item.suggestedTransferQty > 0 ? (
                                           <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 border border-emerald-100">
                                              <Shuffle className="h-3.5 w-3.5" /> XFER: {item.suggestedTransferQty.toLocaleString()}
                                           </span>
                                        ) : null}
                                        {item.suggestedOrderQty > 0 ? (
                                           <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 border border-indigo-100">
                                              <Truck className="h-3.5 w-3.5" /> BUY: {item.suggestedOrderQty.toLocaleString()}
                                           </span>
                                        ) : null}
                                    </div>
                                ) : <span className="text-slate-200">—</span>}
                            </td>
                          );
                        case 'health':
                          return (
                            <td key={col.key} className="px-8 py-6 text-center">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] border ${statusColor}`}>
                                <Icon className="w-3 h-3" />
                                {item.stockStatus}
                              </span>
                            </td>
                          );
                        default:
                          return <td key={col.key} className={cellClass} />;
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-10 py-5 bg-white border border-slate-200 rounded-[32px] shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence {currentPage} of {totalPages}</span>
           <div className="flex gap-4">
              <button onClick={() => goToPage(currentPage-1)} disabled={currentPage===1} className="p-3 border border-slate-200 rounded-2xl disabled:opacity-20 hover:bg-slate-50 transition shadow-sm"><ChevronLeft className="h-5 w-5"/></button>
              <button onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages} className="p-3 border border-slate-200 rounded-2xl disabled:opacity-20 hover:bg-slate-50 transition shadow-sm"><ChevronRight className="h-5 w-5"/></button>
           </div>
        </div>
      )}
    </div>
  );
};