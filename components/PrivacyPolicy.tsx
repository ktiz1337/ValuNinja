import React from 'react';
import { ShieldCheck, Lock, Globe, Eye, Database, Cookie, ChevronLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Return to Base
      </button>

      <div className="space-y-16">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800">Operational Integrity Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Privacy Protocol</h1>
          <p className="text-xl text-slate-500 font-medium">How we handle your tactical scouting data.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Zero-Persistence Policy</h3>
            <p className="text-slate-600 leading-relaxed">We do not store your search queries on our permanent servers. Every mission is considered transient. Once you close your session, the specific scouting parameters are purged from our active memory.</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Location Stealth</h3>
            <p className="text-slate-600 leading-relaxed">Your location data is used exclusively to find local stores near you. This data remains on your device and is only transmitted to our search grounding engine to refine regional inventory results.</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Third-Party Intel</h3>
            <p className="text-slate-600 leading-relaxed">We use Google Search Grounding to find real-time deals. Their privacy policies apply to how they process those search requests. We also use Google AdSense for monetization, which may use cookies to serve relevant ads.</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Affiliate Tracking</h3>
            <p className="text-slate-600 leading-relaxed">When you use a "Direct Strike" link, an affiliate cookie may be placed to track the referral. This is how the ValuNinja scouts are paid. These cookies are industry standard and do not collect personally identifiable information (PII).</p>
          </div>
        </section>

        <footer className="pt-12 border-t border-slate-100">
          <p className="text-slate-400 text-sm italic">Last Updated: March 2025 • Protocol Version 2.1.0-STRIKE</p>
        </footer>
      </div>
    </div>
  );
};