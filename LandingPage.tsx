
import React from 'react';
import { 
  Zap, ShieldCheck, BarChart3, Globe, ArrowRight, 
  CheckCircle2, Layers, Cpu, TrendingUp, Package,
  LineChart, MousePointerClick, PlayCircle,
  Database, Activity, FileSpreadsheet, Truck,
  Users, Landmark, Workflow, ChevronRight,
  PiggyBank, Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onWatchDemo }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-slate-900 font-sans scroll-smooth">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight italic cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            OptiStock<span className="text-indigo-600">.ai</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <button onClick={() => scrollTo('features')} className="hover:text-indigo-600 transition">Features</button>
          <button onClick={() => scrollTo('solutions')} className="hover:text-indigo-600 transition">Solutions</button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-indigo-600 transition">Pricing</button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-200"
          >
            Launch Console
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-8 animate-bounce">
          <Zap className="h-4 w-4 text-indigo-600 fill-current" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">New: Generative Supply Chain Audit</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
          Stop guessing. <br />
          <span className="text-indigo-600">Start Optimizing.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          The first AI-native inventory operating system. Recapture millions in trapped capital by balancing demand, lead times, and risk with mathematical precision.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={onGetStarted}
            className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </button>
          <button 
            onClick={onWatchDemo}
            className="w-full md:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition flex items-center justify-center gap-3 group"
          >
            <div className="p-1 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition">
              <PlayCircle className="h-6 w-6" />
            </div>
            Watch AI Demo
          </button>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-24 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[40px] blur-3xl opacity-10 animate-pulse"></div>
          <div className="relative bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden p-4">
             <div className="bg-slate-50 rounded-2xl h-[400px] flex items-center justify-center border border-slate-100 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4 opacity-40">
                      <LineChart className="h-20 w-20 text-indigo-300" />
                      <span className="font-black text-sm uppercase tracking-widest text-slate-400">Intelligent Rebalancing Engine</span>
                   </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute top-10 left-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                   {/* Fix: Added PiggyBank to imports */}
                   <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600"><PiggyBank className="h-5 w-5"/></div>
                   <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase">Capital Found</p><p className="text-sm font-black">$42,900</p></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-100">
        <div className="text-center mb-20">
           <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Core Technology</h2>
           <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Engineered for mathematical certainty.</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="p-8 rounded-3xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 group">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-indigo-100">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-4">ABC Prioritization</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Automatically classify your inventory by revenue velocity. Focus your capital on the 'A' items that drive 80% of your business.
            </p>
            <ul className="mt-6 space-y-3">
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-indigo-500"/> Revenue-weighted ranking</li>
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-indigo-500"/> Dynamic class shifting</li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 group">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-emerald-100">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-4">Demand Sensing</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Our AI engine identifies statistical anomalies and seasonal shifts, providing dynamic MIN/MAX targets that adapt in real-time.
            </p>
            <ul className="mt-6 space-y-3">
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Outlier filtering</li>
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Growth factor modeling</li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 group">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-purple-100">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-4">Multi-Node Sync</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Optimize across your entire network. Identify transfer opportunities between branches to avoid new purchases.
            </p>
            <ul className="mt-6 space-y-3">
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-purple-500"/> Inter-branch rebalancing</li>
               <li className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-purple-500"/> Global stock visibility</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-20">
             <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Targeted Solutions</h2>
             <h3 className="text-5xl font-black tracking-tighter mb-8 leading-tight">Built for every stakeholder <br /> in your supply chain.</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition">
                <Users className="h-10 w-10 text-indigo-400 mb-6" />
                <h4 className="text-2xl font-black mb-4">Operations Leaders</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">Reduce operational friction with automated replenishment logic. Stop firefighting stockouts and start executing strategy.</p>
                <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white hover:text-indigo-400 transition">View OPS Roadmap <ArrowRight className="h-4 w-4"/></button>
             </div>
             <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition">
                <Landmark className="h-10 w-10 text-emerald-400 mb-6" />
                <h4 className="text-2xl font-black mb-4">Finance & CFOs</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">Improve your cash conversion cycle by liquidating dead stock and minimizing capital trapped in slow-moving overstock.</p>
                <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white hover:text-emerald-400 transition">Valuation Audit <ArrowRight className="h-4 w-4"/></button>
             </div>
             <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition">
                <Workflow className="h-10 w-10 text-purple-400 mb-6" />
                <h4 className="text-2xl font-black mb-4">IT & Logistics Architects</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">Bridge the gap between your legacy ERP and modern data science. Clean, ingest, and analyze data at enterprise scale.</p>
                <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white hover:text-purple-400 transition">API Documentation <ArrowRight className="h-4 w-4"/></button>
             </div>
             <div className="p-10 bg-indigo-600 rounded-[40px] shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition duration-700"></div>
                {/* Fix: Added Sparkles to imports */}
                <Sparkles className="h-10 w-10 text-white mb-6" />
                <h4 className="text-2xl font-black mb-4">AI Strategy Team</h4>
                <p className="text-indigo-100 font-medium leading-relaxed mb-8">Leverage Gemini 3.0 Pro to uncover deep pattern anomalies and receive strategic advice directly through your stock console.</p>
                {/* Fix: Added Sparkles to imports */}
                <button onClick={onGetStarted} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white bg-white/20 px-6 py-3 rounded-2xl hover:bg-white/30 transition">Try AI Assistant <Sparkles className="h-4 w-4"/></button>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
           <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Simple Pricing</h2>
           <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Scale your savings, not your costs.</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {/* Starter */}
           <div className="p-10 rounded-[40px] border border-slate-100 bg-white hover:border-indigo-100 transition shadow-sm hover:shadow-xl">
              <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-6">Starter</h4>
              <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-black tracking-tighter">$0</span>
                 <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-slate-500 font-medium mb-10">Perfect for exploring the math behind your warehouse.</p>
              <ul className="space-y-4 mb-10">
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> 50 SKU Limit</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Manual Entry Only</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Core Min/Max Calculation</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-300 line-through"><CheckCircle2 className="h-5 w-5 text-slate-200"/> No Bulk Upload</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition">Get Started</button>
           </div>

           {/* Professional */}
           <div className="p-10 rounded-[40px] border-4 border-indigo-600 bg-white shadow-2xl relative transform md:scale-105 z-10">
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">Most Popular</div>
              <h4 className="text-lg font-black text-indigo-600 uppercase tracking-widest mb-6">Professional</h4>
              <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-black tracking-tighter text-slate-900">$149</span>
                 <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-slate-500 font-medium mb-10">Everything you need for full-scale warehouse optimization.</p>
              <ul className="space-y-4 mb-10">
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Unlimited SKUs</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Bulk CSV Upload (Pro)</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> AI Strategic Assistant</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Audit & CSV Export</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Multi-User Access</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">Start 14-Day Trial</button>
           </div>

           {/* Enterprise */}
           <div className="p-10 rounded-[40px] border border-slate-100 bg-white hover:border-indigo-100 transition shadow-sm hover:shadow-xl">
              <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-6">Enterprise</h4>
              <div className="flex items-baseline gap-1 mb-8">
                 <span className="text-5xl font-black tracking-tighter text-slate-900">Custom</span>
              </div>
              <p className="text-slate-500 font-medium mb-10">Bespoke integrations for multi-national supply networks.</p>
              <ul className="space-y-4 mb-10">
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> ERP Direct Sync (API)</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Multi-Branch Rebalancing</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Custom Model Training</li>
                 <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle2 className="h-5 w-5 text-indigo-500"/> Dedicated Success Manager</li>
              </ul>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition">Contact Sales</button>
           </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Trusted by logistics leaders worldwide</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale">
               <span className="text-2xl font-black italic">GLOBAL_LOGI</span>
               <span className="text-2xl font-black italic">PRIME_SUPPLY</span>
               <span className="text-2xl font-black italic">VENTURE_WH</span>
               <span className="text-2xl font-black italic">NEXUS_DIST</span>
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[160px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">Ready to unlock <br /> trapped capital?</h2>
          <button 
            onClick={onGetStarted}
            className="px-12 py-6 bg-white text-slate-900 rounded-2xl font-black text-xl hover:bg-indigo-50 transition flex items-center gap-3 mx-auto shadow-2xl"
          >
            Launch Your Workspace <MousePointerClick className="h-6 w-6" />
          </button>
          <p className="mt-8 text-slate-500 font-bold uppercase text-xs tracking-widest"> No credit card required for initial audit.</p>
        </div>
      </section>

      {/* Real Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm font-medium">
         <p>© 2025 OptiStock AI. All rights reserved.</p>
         <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">API Documentation</a>
         </div>
      </footer>
    </div>
  );
};
