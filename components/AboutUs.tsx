
import React from 'react';
import { Target, ShieldCheck, Zap, Award, Users, ChevronLeft, Landmark, Mail, MessageSquare } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';

export const AboutUs: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Return to Base
      </button>

      <div className="space-y-16">
        <header className="space-y-6">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <NinjaIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">The Ronin Protocol.</h1>
          <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            ValuNinja was born from a simple realization: <span className="text-indigo-600">The market is bloated, and transparency is dead.</span>
          </p>
        </header>

        <section className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl font-black tracking-tight">The Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              We built ValuNinja to act as an autonomous agent for the consumer. Most "top 10" lists are paid advertisements in disguise. We use cold, hard data—specs, real-time pricing, and build quality analytics—to calculate a <strong>Value Score</strong> that cannot be bought.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div className="space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <h4 className="font-black text-xl">Cold Logic</h4>
                <p className="text-slate-400 text-sm">Our AI ignores brand marketing and focuses solely on the performance-to-price ratio.</p>
              </div>
              <div className="space-y-3">
                <Target className="w-8 h-8 text-indigo-400" />
                <h4 className="font-black text-xl">Targeted Scout</h4>
                <p className="text-slate-400 text-sm">We find local inventory that Google Shopping might miss, getting you products faster.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Transparency in Bounty</h2>
              <p className="text-slate-600 leading-relaxed">
                To keep this technology free for everyone, we use an affiliate revenue model. When you click a "Direct Strike" link and make a purchase, we may receive a commission. 
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl">
                <p className="text-sm font-bold text-amber-900 italic">
                  "Important: We do not prioritize retailers based on how much they pay. If a better deal exists at a retailer that pays us nothing, we will still list it as the Alpha Target. Our algorithm is blind to the bounty."
                </p>
              </div>
            </div>
            <div className="w-full md:w-72 h-72 bg-slate-100 rounded-[2rem] flex items-center justify-center border border-slate-200">
              <Landmark className="w-24 h-24 text-slate-300" />
            </div>
          </div>
        </section>

        <section className="bg-indigo-50 border border-indigo-100 rounded-[3rem] p-10 md:p-14">
           <div className="max-w-xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Tactical Contact Hub</h2>
              <p className="text-slate-600 font-medium">Spotted a broken deal? Want to join the scout network? Deploy a message to our systems.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                 <a href="mailto:intel@valuninja.ai" className="flex items-center justify-center gap-3 bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                    <Mail className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">General Intel</span>
                       <span className="block text-sm font-bold text-slate-900">intel@valuninja.ai</span>
                    </div>
                 </a>
                 <a href="#" className="flex items-center justify-center gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-900 shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-1 group">
                    <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                       <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Bounty Help</span>
                       <span className="block text-sm font-bold text-white">Open Tactical Chat</span>
                    </div>
                 </a>
              </div>
           </div>
        </section>

        <section className="text-center py-12 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Ronin Systems 2025</p>
          <div className="flex justify-center gap-8">
            <Award className="w-8 h-8 text-slate-300" />
            <ShieldCheck className="w-8 h-8 text-slate-300" />
            <Zap className="w-8 h-8 text-slate-300" />
          </div>
        </section>
      </div>
    </div>
  );
};
