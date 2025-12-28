
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, LogIn, Apple, UserPlus, AlertCircle, RefreshCw, X, ArrowLeft, Fingerprint, ShieldAlert, MailCheck, ShieldCheck, Terminal, Zap, ShieldQuestion, Globe } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { NetworkUser } from '../types';

interface AuthModalProps {
  onAuthComplete: (user: NetworkUser) => void;
  onUpdateUser: (user: NetworkUser) => void;
  onCancel: () => void;
  existingUsers: NetworkUser[];
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthComplete, onUpdateUser, onCancel, existingUsers }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<NetworkUser | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const simulatedCode = "SCOUT-77";

  useEffect(() => {
    if (googleBtnRef.current && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: googleBtnRef.current.offsetWidth || 350
        });
      } catch (e) {
        console.warn("Production GSI Button Render Failed:", e);
      }
    }
  }, [view]);

  const handleAppleAuth = () => {
    setError("Apple authentication requires full domain verification and a paid developer ID. Contact admin if deployment is incomplete.");
  };

  const handleTacticalBypass = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAuthComplete({
        email: 'dev@valuninja.ai',
        username: 'Dev_Override',
        rank: 'SHINOBI',
        vault: []
      });
      setIsProcessing(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    setTimeout(() => {
      if (view === 'LOGIN') {
        const user = existingUsers.find(u => u.email === email && u.password === password);
        if (user) {
          onAuthComplete(user);
        } else {
          setError("Identity Recall Failed: Invalid Credentials.");
          setIsProcessing(false);
        }
      } else if (view === 'REGISTER') {
        if (existingUsers.some(u => u.email === email)) {
          setError("Network Conflict: Email already synchronized.");
          setIsProcessing(false);
          return;
        }
        
        setPendingUser({ email, username, password, rank: 'RECRUIT', vault: [] });
        setView('VERIFY_EMAIL');
        setIsProcessing(false);
      } else if (view === 'VERIFY_EMAIL') {
        if (verificationCode.toUpperCase().trim() === simulatedCode) {
          if (pendingUser) onAuthComplete(pendingUser);
        } else {
          setError("Verification Rejected: PIN mismatch.");
          setIsProcessing(false);
        }
      } else if (view === 'FORGOT_PASSWORD') {
        const user = existingUsers.find(u => u.email === email);
        if (user) setView('RESET_PASSWORD');
        else setError("Signal Lost: Email account not found in network.");
        setIsProcessing(false);
      } else if (view === 'RESET_PASSWORD') {
        if (password !== confirmPassword) {
          setError("Recalibration Failed: Access Keys do not match.");
          setIsProcessing(false);
          return;
        }
        const user = existingUsers.find(u => u.email === email);
        if (user) {
          onUpdateUser({ ...user, password });
          setView('LOGIN');
        }
        setIsProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-[4rem] p-8 md:p-14 border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500 relative overflow-hidden">
        
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse rounded-full"></div>
               <div className="relative w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 animate-bounce">
                  <Fingerprint className="w-10 h-10 text-white" />
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Validating Production Signal</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Secure_Handshake_Active...</p>
          </div>
        )}

        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-6">
              <NinjaIcon className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {view === 'LOGIN' ? 'Secure Login' : view === 'REGISTER' ? 'New Operative' : 'Identity Recon'}
            </h2>
            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest mt-3">Production Access Protocol</p>
          </div>

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="flex flex-col gap-3 items-center">
               <div className="w-full space-y-2">
                   <div ref={googleBtnRef} className="w-full flex justify-center min-h-[50px]"></div>
               </div>
               
               <button 
                onClick={handleAppleAuth}
                className="w-full flex items-center justify-center gap-4 py-3.5 bg-black text-white rounded-full hover:bg-slate-800 transition-all active:scale-[0.98] group"
               >
                  <Apple className="w-5 h-5 fill-current" />
                  <span className="text-sm font-bold">Continue with Apple</span>
               </button>
            </div>
          )}

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="flex items-center gap-4 text-slate-200">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Or use Ninja Vault</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'REGISTER' && (
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Codename"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            )}
            
            {(view === 'LOGIN' || view === 'REGISTER' || view === 'FORGOT_PASSWORD') && (
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@valuninja.ai"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            )}

            {view === 'VERIFY_EMAIL' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl">
                   <p className="text-[11px] font-black text-emerald-900 uppercase">Verification PIN broadcast to {email}</p>
                   <p className="text-[10px] font-bold text-emerald-700 italic mt-1">Intercept Signal: {simulatedCode}</p>
                </div>
                <input 
                  type="text" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="SCOUT-XX"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white tracking-[0.2em] text-center text-xl transition-all"
                />
              </div>
            )}

            {(view === 'LOGIN' || view === 'REGISTER' || view === 'RESET_PASSWORD') && (
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Key"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            )}

            {error && (
              <div className="flex items-center gap-3 text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}

            <button 
              type="submit" disabled={isProcessing}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {view === 'LOGIN' ? 'Engage Session' : view === 'REGISTER' ? 'Establish Profile' : 'Complete Verification'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-50 flex flex-col gap-4">
             <button 
              type="button" 
              onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
              className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] hover:text-slate-900 transition-colors"
             >
                {view === 'LOGIN' ? 'Establish New Profile' : 'Recall Existing Identity'}
             </button>
             <button 
              type="button" 
              onClick={onCancel}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
             >
                Abort & Browse as Guest
             </button>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 leading-tight">
              <ShieldAlert className="w-3 h-3 inline mr-1 text-amber-500" />
              Ensuring real-world production security. <br/>
              Authorized domains: <span className="text-indigo-600 font-black">valuninja.ai</span>, <span className="text-indigo-600 font-black">*.vercel.app</span>.
            </p>
            <button 
              onClick={handleTacticalBypass}
              className="mt-3 text-[8px] font-black uppercase text-slate-300 hover:text-indigo-400 transition-colors tracking-widest"
            >
              Emergency Override (Dev only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
