
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, LogIn, Apple, UserPlus, AlertCircle, RefreshCw, X, ArrowLeft, Fingerprint, ShieldAlert, MailCheck, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { NetworkUser } from '../types';

// Fix: Declare google property on Window to support Google Identity Services global object
declare global {
  interface Window {
    google: any;
  }
}

interface AuthModalProps {
  onAuthComplete: (user: NetworkUser) => void;
  onUpdateUser: (user: NetworkUser) => void;
  onCancel: () => void;
  existingUsers: NetworkUser[];
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

// Helper to decode Google JWT tokens without external libraries
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

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

  // Initialize REAL Google Identity Services
  useEffect(() => {
    const initializeGSI = () => {
      if (typeof window.google === 'undefined') return;

      // NOTE: In a production environment, 'YOUR_GOOGLE_CLIENT_ID' would be process.env.GOOGLE_CLIENT_ID
      // For this implementation, we rely on the client being pre-configured or using a global setup.
      window.google.accounts.id.initialize({
        client_id: "703607087230-oat663p5h2v6q76u1b9q1f5g8b2m5h2q.apps.googleusercontent.com", // Example public client ID for testing
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 400
        });
      }
    };

    // Retry initialization if script isn't loaded yet
    const timer = setInterval(() => {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        initializeGSI();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [view]);

  const handleGoogleResponse = (response: any) => {
    setIsProcessing(true);
    const payload = parseJwt(response.credential);
    
    if (payload) {
      setTimeout(() => {
        const user: NetworkUser = {
          email: payload.email,
          username: payload.name || payload.email.split('@')[0],
          rank: 'SHADOW',
          vault: []
        };
        onAuthComplete(user);
        setIsProcessing(false);
      }, 1000);
    } else {
      setError("Identity synchronization failed.");
      setIsProcessing(false);
    }
  };

  const handleAppleAuth = () => {
    setError("Apple authentication requires domain verification. Please use Google or Shinobi credentials.");
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
    }, 1500);
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
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Establishing Secure Link</h3>
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
               <div className="h-full bg-slate-900 animate-[scroll_1.5s_linear_infinite]" style={{ width: '40%' }}></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Negotiating_Handshake...</p>
          </div>
        )}

        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-6">
              <NinjaIcon className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {view === 'LOGIN' ? 'Recall Identity' : view === 'REGISTER' ? 'Establish Profile' : 'Identity Recon'}
            </h2>
            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest mt-3">Shinobi Intelligence Protocol</p>
          </div>

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="flex flex-col gap-3 items-center">
               <div ref={googleBtnRef} className="w-full flex justify-center"></div>
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
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Or use Ronin credentials</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'REGISTER' && (
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Codename (e.g. Shadow_Walker)"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            )}
            
            {(view === 'LOGIN' || view === 'REGISTER' || view === 'FORGOT_PASSWORD') && (
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@shinobi.net"
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
                {view === 'LOGIN' ? 'New Agent? Establish Identity' : 'Existing Agent? Recall Identity'}
             </button>
             <button 
              type="button" 
              onClick={onCancel}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
             >
                Continue as Guest Agent
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
