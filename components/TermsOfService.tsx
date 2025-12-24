import React from 'react';
import { ShieldAlert, Gavel, Scale, FileText, ChevronLeft, AlertTriangle } from 'lucide-react';

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Return to Base
      </button>

      <div className="space-y-16">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Terms of Engagement</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Engagement Protocol</h1>
          <p className="text-xl text-slate-500 font-medium">The rules of the Ronin marketplace.</p>
        </header>

        <section className="space-y-12">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">1. Intelligence Accuracy</h3>
              <p className="text-slate-600 leading-relaxed">
                ValuNinja utilizes autonomous AI agents to scour the web. While we aim for 100% precision, prices and availability are volatile. We do not guarantee that the intelligence provided matches the retailer's current checkout price. Always verify intel at the source.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">2. No Fiduciary Master</h3>
              <p className="text-slate-600 leading-relaxed">
                We are an information service, not a marketplace. We do not process payments. Your relationship for any purchase is strictly with the merchant identified during the strike. We are not liable for any issues arising from third-party transactions.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">3. Automated Scouting</h3>
              <p className="text-slate-600 leading-relaxed">
                Our services are provided "as-is." Use of automated scripts to scrap ValuNinja's intelligence is strictly prohibited. We are the scouts; do not scout the scouts.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
             <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Full Legal Disclosure
             </h4>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
               By using ValuNinja, you acknowledge that we are a participant in various affiliate programs, including but not limited to the Amazon Associates Program. This partnership allows us to sustain our independent intelligence operations. Our algorithms remain shielded from retailer influence, ensuring that our "Alpha Target" is always the best value product found, regardless of its affiliate status.
             </p>
          </div>
        </section>

        <footer className="pt-12 border-t border-slate-100">
          <p className="text-slate-400 text-sm italic">Protocol enforced as of: March 2025 • Version 1.0.4-LEGAL</p>
        </footer>
      </div>
    </div>
  );
};