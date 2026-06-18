import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  User, 
  Lock, 
  ShieldAlert, 
  Users, 
  ChevronRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const AuthView: React.FC = () => {
  const { loginUser, users } = useSecurity();
  const [usernameInput, setUsernameInput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!usernameInput.trim()) {
      setErrorText('Identifier input required');
      return;
    }

    const targetUser = usernameInput.trim().toLowerCase();
    const success = loginUser(targetUser);

    if (!success) {
      const found = users.find(u => u.username.toLowerCase() === targetUser);
      if (found && found.status === 'Suspended') {
        setErrorText('ACCESS LOCK: User account status is SUSPENDED. Action logged to SIEM audit registries.');
      } else {
        setErrorText('Authentication failed. Invalid operations handle identifier.');
      }
    }
  };

  const selectTesterPersona = (name: string) => {
    setUsernameInput(name);
    setErrorText(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-850 dark:text-slate-101 selection:bg-indigo-500 selection:text-white dark:selection:bg-cyan-500 dark:selection:text-slate-950 transition-colors relative">
      
      {/* GLOWING TECH BACKGROUND AMBIENTS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-cyan-600/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 dark:bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col justify-between">
        
        {/* TOP GLOWING BORDER ACCENT */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500" />

        {/* LOGO GREETINGS */}
        <div className="p-6 text-center space-y-3.5 pt-8 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-150 dark:border-transparent">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-850 dark:from-cyan-600 dark:to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-cyan-950/20 my-1">
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Security Console login</h1>
            <span className="text-[10px] font-mono tracking-widest text-indigo-650 dark:text-cyan-400 mt-1 uppercase block font-bold">SECURE ENTERPRISE LAYER</span>
          </div>
        </div>

        {/* COMPACT MAIN FORM */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2 text-xs">
              <label className="text-[10px] text-slate-450 dark:text-slate-500 font-mono tracking-widest block uppercase font-bold">SECURITY OPERATOR CODEID</label>
              <div className="relative font-mono">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  autoFocus 
                  placeholder="e.g. alex_secops"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setErrorText(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-808 focus:border-indigo-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-cyan-500 text-sm outline-none rounded-2xl text-slate-950 dark:text-white placeholder-slate-400 font-sans transition-all"
                />
              </div>
            </div>

            {/* Simulated password hint */}
            <div className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal bg-slate-50 dark:bg-slate-955/65 p-2.5 border border-slate-200 dark:border-slate-900 rounded-xl font-mono flex items-center space-x-1.5 justify-center">
              <Lock className="h-3 w-3 text-indigo-650 dark:text-slate-600 animate-pulse" />
              <span>Identity keys validated via client certificates list</span>
            </div>

            {/* Error notifications warnings */}
            {errorText && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start space-x-2 text-rose-700 dark:text-rose-400 text-xs animate-headshake leading-relaxed">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="font-medium">{errorText}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-850 dark:from-cyan-600 dark:to-indigo-600 hover:from-indigo-550 dark:hover:from-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition duration-150 shadow-md flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Initialize Security Session</span>
              <ChevronRight className="h-4 w-4" />
            </button>

          </form>

          {/* ACTIVE TEST PERSONAS DROPDOWNS */}
          <div className="space-y-3.5 border-t border-slate-150 dark:border-slate-800/80 pt-5">
            <div className="flex items-center space-x-1.5 text-slate-450 dark:text-slate-500 font-mono text-[10px] tracking-widest uppercase font-bold">
              <Users className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <span>Rapid Tester Personas (MVP Shortcuts)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              {users.map(u => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => selectTesterPersona(u.username)}
                  className={`p-2 bg-slate-50 dark:bg-slate-950 border text-left rounded-xl flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-850/40 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700 transition duration-150 cursor-pointer ${
                    u.status === 'Suspended' ? 'opacity-40 hover:bg-slate-50 dark:hover:bg-slate-950 hover:border-red-900 border-red-900/40' : ''
                  }`}
                >
                  <img src={u.avatarUrl} alt={u.username} className="w-4 h-4 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <div className="truncate min-w-0 flex-1">
                    <p className="font-bold text-slate-700 dark:text-slate-200 truncate leading-none">@{u.username}</p>
                    <span className="text-[8px] text-slate-450 dark:text-slate-550 block uppercase tracking-wider mt-0.5 font-bold">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM METRICS TERMINAL LOG FOOTER */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800/80 text-center text-[10px] text-slate-450 dark:text-slate-500 font-mono flex items-center justify-center space-x-1 select-none">
          <Terminal className="h-3 w-3 text-indigo-650 dark:text-emerald-500 animate-pulse" />
          <span>CONSOLE ACCESS: SSL_KEY_CIPHER_OK_VALIDATED</span>
        </div>

      </div>

    </div>
  );
};
