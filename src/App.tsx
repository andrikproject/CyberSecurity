import React, { useState } from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AlertsView } from './components/AlertsView';
import { IncidentsView } from './components/IncidentsView';
import { LogsView } from './components/LogsView';
import { AdminView } from './components/AdminView';
import { AuthView } from './components/AuthView';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

function MainConsoleApp() {
  const { isLoggedIn, currentUser, liveToast, clearLiveToast } = useSecurity();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <AuthView />;
  }

  // Double check authorization limits just in case they switched personas to something not matching
  // (e.g. Viewer trying to see Admin)
  const isAuthorized = (tab: string) => {
    if (tab === 'admin') {
      return ['Admin', 'Analyst', 'Auditor'].includes(currentUser.role);
    }
    return true;
  };

  const currentTab = isAuthorized(activeTab) ? activeTab : 'dashboard';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* SIDEBAR NAVIGATION CONTROL */}
      <Sidebar 
        activeTab={currentTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* MOBILE BACKDROP DRAWER OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
        />
      )}

      {/* RIGHT VIEW CODESPORT CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-transparent relative">
        {/* Background Gradients for Frosted Glass backing depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 dark:bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-purple-600/5 dark:bg-purple-600/5 rounded-full blur-[110px] pointer-events-none -z-10" />

        {/* TOP BAR INFORMATION HEADER PANEL */}
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        {/* COMPARTMENT VIEWS WITH FLUID SLIDING ANTIMATIONS */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full w-full overflow-y-auto"
            >
              {currentTab === 'dashboard' && <DashboardView />}
              {currentTab === 'alerts' && <AlertsView />}
              {currentTab === 'incidents' && <IncidentsView />}
              {currentTab === 'logs' && <LogsView />}
              {currentTab === 'admin' && <AdminView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* GLOBAL CHANNELS: HIGH-SEVERITY REAL-TIME ALERT TOAST (WEB AND MOBILE STYLE) */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-[380px] sm:w-[420px] bg-slate-900/95 dark:bg-slate-900/95 border-2 border-rose-500/80 shadow-[0_15px_35px_rgba(244,63,94,0.35)] p-4 rounded-2xl backdrop-blur-md text-white overflow-hidden"
          >
            {/* Blinking severe status indicator line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 animate-pulse" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[9px] uppercase font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  {liveToast.severity} CRITICAL THREAT
                </span>
                <span className="text-[9px] font-mono text-slate-500 font-bold">{liveToast.id}</span>
              </div>
              <button 
                onClick={clearLiveToast}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-rose-200 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                {liveToast.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">{liveToast.message}</p>
            </div>
            
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[9px] font-mono text-slate-400">
              <span className="animate-pulse">STREAMING LIVE FEED</span>
              <button 
                onClick={() => {
                  setActiveTab('alerts');
                  clearLiveToast();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1"
              >
                Inspect Threat &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SecurityProvider>
        <MainConsoleApp />
      </SecurityProvider>
    </ThemeProvider>
  );
}
