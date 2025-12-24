import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, ShoppingCart, Trash2, Info, FileSearch, Loader2, ListFilter, ArrowRight, Activity, Cpu, Database, Binary, Terminal, Lock, Crown } from 'lucide-react';
import { downloadCSV, PRODUCT_TEMPLATE, TRANSACTION_TEMPLATE, PO_TEMPLATE, parseProductsFromCSV, parseTransactionsFromCSV, parsePOsFromCSV, detectCSVType } from '../utils';
import { Product, Transaction, PurchaseOrder } from '../types';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (products: Product[]) => void;
  onImportTransactions: (transactions: Transaction[]) => void;
  onImportPOs: (pos: PurchaseOrder[]) => void;
  onClearAll: () => void;
  hasData: boolean;
  isPro: boolean;
  onUpgrade: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onImportProducts, 
  onImportTransactions,
  onImportPOs,
  onClearAll,
  hasData,
  isPro,
  onUpgrade
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [ingestedFiles, setIngestedFiles] = useState<{name: string, status: 'pending' | 'done'}[]>([]);
  const [snippets, setSnippets] = useState<string[]>([]);
  const [phase, setPhase] = useState<'ingesting' | 'analyzing' | 'idle'>('idle');
  
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null; 
    message: string;
    batchResults?: string[];
    details?: string[];
  }>({ type: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsFinished(false);
      setProgress(0);
      setSnippets([]);
      setIngestedFiles([]);
      setPhase('idle');
      setImportStatus({ type: null, message: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [snippets]);

  const analysisLogs = [
    "Initializing OptiStock Math Kernel v2.4...",
    "Scanning SKU database for historical usage patterns...",
    "Found usage anomalies in 4% of records. Normalizing...",
    "Applying Growth Factor multipliers to demand forecast...",
    "Calculating Standard Deviation of daily sales per branch...",
    "Performing lead-time variance analysis from PO history...",
    "Simulating service level fill-rates at 95.0% target...",
    "Computing optimal safety stock (Statistical Method)...",
    "Mapping current vs optimized MIN/MAX boundaries...",
    "Valuating pipeline inventory and committed capital...",
    "Identifying Dead Stock (Physical > 0, Usage = 0)...",
    "Finalizing replenishment recommendations...",
    "Syncing results with Executive Dashboard."
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setPhase('ingesting');
    setProgress(0);
    setSnippets(["[INFO] Starting ingestion cycle..."]);
    
    const fileArray: File[] = Array.from(files);
    setIngestedFiles(fileArray.map(f => ({ name: f.name, status: 'pending' })));

    const summaryResults: string[] = [];
    const allErrors: string[] = [];
    let totalItems = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setCurrentFileName(file.name);
      try {
        const text = await file.text();
        const csvType = detectCSVType(text);
        
        if (csvType === 'products') {
          const { data } = parseProductsFromCSV(text);
          onImportProducts(data);
          summaryResults.push(`Products: ${data.length} SKUs`);
          totalItems += data.length;
        } else if (csvType === 'transactions') {
          const { data } = parseTransactionsFromCSV(text);
          onImportTransactions(data);
          summaryResults.push(`Transactions: ${data.length} records`);
          totalItems += data.length;
        } else if (csvType === 'pos') {
          const { data } = parsePOsFromCSV(text);
          onImportPOs(data);
          summaryResults.push(`Purchase Orders: ${data.length} entries`);
          totalItems += data.length;
        } else {
          allErrors.push(`[${file.name}] Invalid CSV Schema.`);
        }

        setIngestedFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        setSnippets(prev => [...prev, `[SUCCESS] Parsed ${file.name} (${csvType}).`]);
        
        setProgress(Math.round(((i + 1) / fileArray.length) * 25));
        await new Promise(r => setTimeout(r, 200));
      } catch (err: any) {
        allErrors.push(`[${file.name}] Error: ${err.message}`);
        setSnippets(prev => [...prev, `[ERROR] Failed to read ${file.name}.`]);
      }
    }

    if (totalItems > 0) {
      setPhase('analyzing');
      setCurrentFileName("Logic Optimization Engine");
      
      for (let s = 0; s < analysisLogs.length; s++) {
        const stepProgress = 25 + Math.round(((s + 1) / analysisLogs.length) * 75);
        setProgress(stepProgress);
        setSnippets(prev => [...prev, `[PROCESS] ${analysisLogs[s]}`]);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 150));
      }

      setImportStatus({
        type: allErrors.length > 0 ? 'warning' : 'success',
        message: 'Intelligence Engine Synchronized.',
        batchResults: summaryResults,
        details: allErrors
      });
      setIsFinished(true);
    } else {
      setImportStatus({
        type: 'error',
        message: 'No usable data identified in upload.',
        details: allErrors
      });
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-indigo-600 p-6 flex justify-between items-start flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/30 rounded-xl">
                <Cpu className="h-6 w-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Data Pipeline</h2>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">Syncing Master Datasets</p>
             </div>
          </div>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition bg-indigo-500/20 p-2 rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isPro ? (
            <div className="p-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                  <Lock className="h-10 w-10" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Import is a Pro Feature</h3>
                  <p className="text-slate-500 mt-2 font-medium max-w-sm">Manual entry is free, but Pro users can import thousands of SKUs, years of sales history, and branch-wide POs in seconds.</p>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
                     <CheckCircle className="h-4 w-4 text-emerald-500 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Saved</p>
                     <p className="text-xs font-bold text-slate-900 mt-1">Estimated 40+ hours/month manual entry bypass.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
                     <Activity className="h-4 w-4 text-indigo-500 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scale</p>
                     <p className="text-xs font-bold text-slate-900 mt-1">Analyze up to 500,000 records in one sync.</p>
                  </div>
               </div>
               <button 
                onClick={() => { onUpgrade(); onClose(); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-3"
               >
                  <Crown className="h-5 w-5 text-amber-400" /> Unlock Bulk Import Now
               </button>
               <button onClick={onClose} className="text-slate-400 font-bold text-xs hover:text-slate-600">Maybe Later</button>
            </div>
        ) : (
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            {isFinished ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Analysis Complete</h3>
                <p className="text-gray-500 mb-8 max-w-xs text-sm">Logic Engine has integrated your new data into the rebalancing model.</p>
                
                <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                    <div className="flex flex-col gap-3">
                        {importStatus.batchResults?.map((res, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{res.split(':')[0]}</span>
                            <span className="font-mono font-bold text-indigo-600">{res.split(':')[1].trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={onClose} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                    View Optimized Stock <ArrowRight className="h-5 w-5" />
                </button>
                </div>
            ) : (
                <div className="flex flex-col space-y-8">
                {!isProcessing ? (
                    <div className="flex flex-col items-center">
                    <div className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        <div className="p-4 bg-gray-100 text-gray-400 rounded-2xl mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                            <Upload className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Select CSV Sources</h3>
                        <p className="text-sm text-gray-500 text-center max-w-xs mb-6">Drop your Product Master, Sales History, or PO Status files here.</p>
                        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">Browse Files</button>
                        <input ref={fileInputRef} type="file" accept=".csv" multiple className="hidden" onChange={handleFileChange} />
                    </div>
                    
                    <div className="mt-8 w-full grid grid-cols-3 gap-3">
                        <button onClick={() => downloadCSV('products.csv', PRODUCT_TEMPLATE)} className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition shadow-sm">
                            <FileSpreadsheet className="h-5 w-5 text-gray-400 mb-2" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Master CSV</span>
                        </button>
                        <button onClick={() => downloadCSV('usage.csv', TRANSACTION_TEMPLATE)} className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition shadow-sm">
                            <Activity className="h-5 w-5 text-gray-400 mb-2" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Usage CSV</span>
                        </button>
                        <button onClick={() => downloadCSV('pos.csv', PO_TEMPLATE)} className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition shadow-sm">
                            <ShoppingCart className="h-5 w-5 text-gray-400 mb-2" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Orders CSV</span>
                        </button>
                    </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                {phase === 'ingesting' ? <Database className="h-3 w-3" /> : <Terminal className="h-3 w-3 animate-pulse" />}
                                {phase === 'ingesting' ? 'Phase 1: Record Ingestion' : 'Phase 2: Stochastic Optimization'}
                            </span>
                            <h4 className="font-bold text-gray-900 mt-1">{currentFileName}</h4>
                        </div>
                        <span className="text-xl font-mono font-black text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                        <div className="h-full bg-indigo-600 transition-all duration-300 ease-out flex items-center justify-end px-1 rounded-full shadow-sm" style={{ width: `${progress}%` }}>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                        </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Binary className="h-3 w-3" />
                        OptiStock Execution Log
                        </p>
                        <div 
                        ref={logContainerRef}
                        className="bg-gray-950 rounded-2xl p-5 font-mono text-[10px] text-indigo-300 space-y-1.5 h-48 overflow-y-auto border border-gray-800 shadow-2xl custom-scrollbar"
                        >
                        <div className="flex items-center gap-2 text-gray-600 mb-2 border-b border-gray-800 pb-2 sticky top-0 bg-gray-950 z-10">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>ENGINE_KERNEL_v2.4_READY</span>
                        </div>
                        {snippets.map((s, i) => (
                            <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                <span className={`truncate ${s.includes('[ERROR]') ? 'text-red-400' : s.includes('[SUCCESS]') ? 'text-green-400' : ''}`}>
                                {s}
                                </span>
                            </div>
                        ))}
                        </div>
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>
        )}

        {isPro && !isFinished && !isProcessing && (
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-500">
                  <Info className="h-4 w-4" />
                  <span className="text-xs">Yield-safe engine supports &gt;100k data points.</span>
              </div>
              <button 
                  onClick={onClearAll}
                  disabled={!hasData}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-bold transition disabled:opacity-30 px-4 py-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
              >
                  <Trash2 className="h-4 w-4" />
                  Purge Datasets
              </button>
          </div>
        )}
      </div>
    </div>
  );
};