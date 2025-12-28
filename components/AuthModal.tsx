
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogIn, Apple, UserPlus, AlertCircle, RefreshCw, X, ArrowLeft, Fingerprint, ShieldAlert, MailCheck, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { NinjaIcon } from './NinjaIcon';
import { NetworkUser } from '../types';

interface AuthModalProps {
  onAuthComplete: (user: NetworkUser) => void;
  onUpdateUser: (user: NetworkUser) => void;
  onCancel: () => void;
  existingUsers: NetworkUser[];
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

// Custom Google Icon for the button
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthComplete, onUpdateUser, onCancel, existingUsers }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [handshakeProvider, setHandshakeProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<NetworkUser | null>(null);

  // Simulation code for this session
  const simulatedCode = "SCOUT-77";

  const triggerSSOPopup = (provider: 'Google' | 'Apple') => {
    setIsProcessing(true);
    setHandshakeProvider(provider);
    
    // Create a real popup window to simulate the SSO provider's interaction
    const width = 500;
    const height = 650;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    const popup = window.open(
      'about:blank', 
      'ProviderAuth', 
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
    );

    if (popup) {
      const brandColor = provider === 'Apple' ? '#fff' : '#4285F4';

      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sign in with ${provider}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0; 
                background: #f8fafc;
                color: #1e293b;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 24px;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                width: 320px;
                text-align: center;
              }
              .logo {
                width: 60px;
                height: 60px;
                margin-bottom: 24px;
              }
              h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; color: #0f172a; }
              p { font-size: 14px; color: #64748b; margin-bottom: 32px; }
              .btn {
                width: 100%;
                padding: 16px;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
                background: ${provider === 'Apple' ? '#000' : '#4285F4'};
                color: white;
              }
              .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
              .btn:active { transform: translateY(0); }
              .footer { font-size: 11px; color: #94a3b8; margin-top: 24px; }
              .loading {
                display: none;
                border: 3px solid #f3f3f3;
                border-top: 3px solid ${brandColor};
                border-radius: 50%;
                width: 24px;
                height: 24px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
              }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card" id="main">
              <div class="logo">
                ${provider === 'Google' 
                  ? '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>'
                  : '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="black"><path d="M17.05 20.28c-.98.95-2.05 1.61-3.13 1.61-1.03 0-1.55-.61-2.71-.61-1.15 0-1.78.58-2.7.61-1.01.03-2.14-.73-3.18-1.73-2.11-2.04-3.72-5.75-3.72-8.54 0-4.33 2.65-6.61 5.17-6.61 1.3 0 2.37.78 3.11.78s1.86-.81 3.27-.81c1.55 0 3.73.83 4.94 2.87-3.05 1.83-2.55 5.92.51 7.21-.61 1.76-1.58 3.43-2.56 5.22zM12.03 5.4c-.06-1.52.88-3.08 1.96-4.22 1.31-1.38 2.92-1.9 4.31-1.18.06 1.48-.96 3.01-1.93 4.16-1.18 1.38-3.01 1.87-4.34 1.24z"/></svg>'
                }
              </div>
              <h2>Sign in with ${provider}</h2>
              <p>ValuNinja wants to access your profile for secure identity verification.</p>
              
              <button class="btn" id="loginBtn" onclick="doLogin()">Sign in as Agent</button>
              <div class="loading" id="loader"></div>
              
              <script>
                function doLogin() {
                  document.getElementById('loginBtn').style.display = 'none';
                  document.getElementById('loader').style.display = 'block';
                  setTimeout(() => {
                    window.opener.postMessage({ type: 'SSO_SUCCESS', provider: '${provider}' }, '*');
                    window.close();
                  }, 1500);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    }

    // Listener for the popup message
    const messageListener = (event: MessageEvent) => {
      if (event.data?.type === 'SSO_SUCCESS') {
        const prov = event.data.provider;
        setTimeout(() => {
          const ssoUser: NetworkUser = {
            email: `${prov.toLowerCase()}_agent_${Math.random().toString(36).substr(2, 5)}@shinobi.net`,
            username: `${prov}_Agent_${Math.floor(Math.random() * 1000)}`,
            rank: 'SHADOW',
            vault: []
          };
          onAuthComplete(ssoUser);
          setIsProcessing(false);
          setHandshakeProvider(null);
        }, 1000);
        window.removeEventListener('message', messageListener);
      }
    };
    window.addEventListener('message', messageListener);
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
        
        setPendingUser({
          email,
          username,
          password,
          rank: 'RECRUIT',
          vault: []
        });
        setView('VERIFY_EMAIL');
        setIsProcessing(false);
        
      } else if (view === 'VERIFY_EMAIL') {
        // Validation check for the simulation code
        if (verificationCode.toUpperCase().trim() === simulatedCode) {
          if (pendingUser) {
            onAuthComplete(pendingUser);
          }
        } else {
          setError("Verification Rejected: PIN mismatch.");
          setIsProcessing(false);
        }
      } else if (view === 'FORGOT_PASSWORD') {
        const user = existingUsers.find(u => u.email === email);
        if (user) {
          setView('RESET_PASSWORD');
        } else {
          setError("Signal Lost: Email account not found in network.");
        }
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
          setPassword('');
          setConfirmPassword('');
        }
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-[4rem] p-8 md:p-14 border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500 relative overflow-hidden">
        
        {/* Handshake Simulation Overlay */}
        {(handshakeProvider || isProcessing) && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse rounded-full"></div>
               <div className="relative w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/10 animate-bounce">
                  {handshakeProvider === 'Google' ? <GoogleIcon /> : <Fingerprint className="w-10 h-10 text-white" />}
               </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
              {view === 'VERIFY_EMAIL' ? 'Validating Email Identity' : (view === 'FORGOT_PASSWORD' ? 'Transmitting Recovery Signal' : `Establishing ${handshakeProvider || 'Secure'} Link`)}
            </h3>
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-6 border border-slate-200">
               <div className="h-full bg-slate-900 animate-[scroll_1.5s_linear_infinite]" style={{ width: '40%' }}></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">Negotiating_Handshake_Sequence_0x{Math.random().toString(16).substr(2, 4).toUpperCase()}...</p>
          </div>
        )}

        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl mb-6 group hover:rotate-12 transition-transform duration-500">
              <NinjaIcon className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {view === 'LOGIN' && 'Recall Identity'}
              {view === 'REGISTER' && 'Establish Profile'}
              {view === 'FORGOT_PASSWORD' && 'Signal Recovery'}
              {view === 'RESET_PASSWORD' && 'Recalibrate Key'}
              {view === 'VERIFY_EMAIL' && 'Authenticate Email'}
            </h2>
            <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest mt-3">Shinobi Intelligence Protocol</p>
          </div>

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="flex flex-col gap-3">
               <button 
                onClick={() => triggerSSOPopup('Google')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-4 py-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all active:scale-[0.98] group"
               >
                  <GoogleIcon />
                  <span className="text-sm font-bold text-slate-700">Continue with Google</span>
               </button>

               <button 
                onClick={() => triggerSSOPopup('Apple')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-4 py-4 bg-black text-white rounded-2xl hover:bg-slate-800 hover:shadow-xl transition-all active:scale-[0.98] group"
               >
                  <Apple className="w-5 h-5 fill-current" />
                  <span className="text-sm font-bold">Continue with Apple</span>
               </button>
            </div>
          )}

          {(view === 'LOGIN' || view === 'REGISTER') && (
            <div className="flex items-center gap-4 text-slate-200">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Or use Shinobi credentials</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'REGISTER' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <User className="w-3.5 h-3.5" /> Codename
                </label>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Shadow_Walker"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>
            )}
            
            {(view === 'LOGIN' || view === 'REGISTER' || view === 'FORGOT_PASSWORD') && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Mail className="w-3.5 h-3.5" /> {view === 'FORGOT_PASSWORD' ? 'Target Email' : 'Email Address'}
                </label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@shinobi.net"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>
            )}

            {view === 'VERIFY_EMAIL' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-start gap-4">
                  <MailCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Verification Signal Transmitted</p>
                    <p className="text-[12px] font-bold text-emerald-700 leading-tight mt-1">
                      A 6-digit confirmation key has been broadcast to <span className="underline">{email}</span>.
                    </p>
                  </div>
                </div>

                {/* DEBUG / SIMULATION INTERCEPT WINDOW */}
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-inner relative group">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                     <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Shinobi_Intercept_Protocol</span>
                     </div>
                     <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                  </div>
                  <div className="font-mono text-[10px] space-y-1">
                    <p className="text-slate-500">Intercepting_Packet... [OK]</p>
                    <p className="text-slate-500">Decrypting_Handshake... [OK]</p>
                    <p className="text-indigo-400 font-bold">PIN_RECOVERED: <span className="text-white bg-indigo-600 px-2 py-0.5 rounded ml-2">{simulatedCode}</span></p>
                    <p className="text-[8px] text-slate-600 italic">Demo Mode: Email signal intercepted for identity setup.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Handshake PIN
                  </label>
                  <input 
                    type="text" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="SCOUT-XX"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white tracking-[0.2em] text-center text-xl transition-all shadow-inner placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {view === 'RESET_PASSWORD' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-4 flex items-start gap-3">
                  <MailCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Handshake Verified</p>
                    <p className="text-[11px] font-bold text-indigo-700 leading-tight">Recovery code sent to {email}. Simulation: Use <span className="font-black">SCOUT-77</span>.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Verification Code
                  </label>
                  <input 
                    type="text" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="SCOUT-XX"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white tracking-[0.2em] text-center transition-all shadow-inner placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {(view === 'LOGIN' || view === 'REGISTER' || view === 'RESET_PASSWORD') && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Lock className="w-3.5 h-3.5" /> {view === 'RESET_PASSWORD' ? 'New Access Key' : 'Access Key'}
                </label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>
            )}

            {view === 'RESET_PASSWORD' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                  <Lock className="w-3.5 h-3.5" /> Confirm Access Key
                </label>
                <input 
                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {isProcessing && !handshakeProvider ? (
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Negotiating...</span>
                </div>
              ) : (
                <>
                  {view === 'LOGIN' ? <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : (view === 'FORGOT_PASSWORD' || view === 'VERIFY_EMAIL' ? <RefreshCw className="w-5 h-5" /> : <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />)}
                  {view === 'LOGIN' && 'Engage Session'}
                  {view === 'REGISTER' && 'Establish Profile'}
                  {view === 'FORGOT_PASSWORD' && 'Request Recovery Handshake'}
                  {view === 'RESET_PASSWORD' && 'Finalize Re-calibration'}
                  {view === 'VERIFY_EMAIL' && 'Complete Verification'}
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-50 flex flex-col gap-4">
             {view === 'LOGIN' && (
               <button 
                type="button" 
                onClick={() => setView('FORGOT_PASSWORD')}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center justify-center gap-2"
               >
                  <ShieldAlert className="w-3 h-3" /> Forgot Access Key?
               </button>
             )}

             <button 
              type="button" 
              onClick={() => {
                if (view === 'FORGOT_PASSWORD' || view === 'RESET_PASSWORD' || view === 'VERIFY_EMAIL') setView('LOGIN');
                else setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN');
              }}
              className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
             >
                {view === 'LOGIN' ? 'New Agent? Establish Identity' : (view === 'FORGOT_PASSWORD' || view === 'RESET_PASSWORD' || view === 'VERIFY_EMAIL' ? <><ArrowLeft className="w-3 h-3" /> Return to Login</> : 'Existing Agent? Recall Identity')}
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
