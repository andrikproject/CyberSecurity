import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  Users, 
  LogOut,
  X,
  ShieldAlert as ShieldIcon
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { currentUser, logoutUser, systemStatus } = useSecurity();

  const menuItems = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Analyst', 'Auditor', 'Viewer'] },
    { id: 'alerts', label: 'Threat Alerts', icon: ShieldAlert, roles: ['Admin', 'Analyst', 'Auditor', 'Viewer'] },
    { id: 'incidents', label: 'Incidents Hub', icon: AlertTriangle, roles: ['Admin', 'Analyst', 'Auditor', 'Viewer'] },
    { id: 'logs', label: 'Audit Trail Logs', icon: Terminal, roles: ['Admin', 'Analyst', 'Auditor', 'Viewer'] },
    { id: 'admin', label: 'SecOps Team', icon: Users, roles: ['Admin', 'Analyst', 'Auditor'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'SAFE': return 'bg-emerald-500 border-emerald-400 text-emerald-100';
      case 'ELEVATED': return 'bg-amber-500 border-amber-400 text-amber-100';
      case 'CRITICAL': return 'bg-rose-500 border-rose-400 text-rose-100';
      case 'ATTACK': return 'bg-red-600 border-red-500 animate-pulse text-white';
    }
  };

  const getStatusLabel = () => {
    switch (systemStatus) {
      case 'SAFE': return 'DEFCON 5 / SECURE';
      case 'ELEVATED': return 'DEFCON 4 / ELEVATED';
      case 'CRITICAL': return 'DEFCON 2 / CRITICAL';
      case 'ATTACK': return 'DEFCON 1 / ACTIVE BREACH';
    }
  };

  return (
    <aside className={`w-64 bg-[#f8fafc] dark:bg-slate-950 border-r border-[#e2e8f0] dark:border-white/10 text-slate-700 dark:text-slate-300 flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:flex'}`}>
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#e2e8f0] dark:border-white/10 flex items-center justify-between bg-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-505 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight leading-none uppercase">SENTINEL<span className="text-indigo-600 dark:text-indigo-400 font-extrabold ml-0.5">V1</span></h1>
              <span className="text-[9px] text-[#4f46e5] dark:text-indigo-300/80 font-mono tracking-wide mt-1 block">CYBER DEFENSE</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* DEFCON / SYSTEM HEALTH */}
        <div className="p-4 mx-4 my-4 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-slate-200/50 dark:bg-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">System condition</span>
            <span className={`h-2 w-2 rounded-full ${systemStatus === 'ATTACK' ? 'animate-pulse bg-red-500' : 'bg-[#10b981] dark:bg-emerald-400'}`} />
          </div>
          <div className={`text-xs font-mono font-bold py-1 px-2 rounded border text-center ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 space-y-1.5">
          <div className="text-[9px] px-3 py-1 font-mono tracking-widest text-[#64748b] dark:text-slate-500 uppercase">OPERATIONS</div>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card Foot */}
      <div className="p-4 border-t border-[#e2e8f0] dark:border-white/10 bg-transparent">
        <div className="flex items-center space-x-3 mb-3 bg-slate-200/50 dark:bg-white/5 p-2 rounded-xl border border-slate-300/50 dark:border-white/5 backdrop-blur-md">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.username} 
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-white/10 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">@{currentUser.username}</h2>
            <div className="flex items-center">
              <span className="text-[8px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logoutUser}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs bg-slate-200/50 dark:bg-white/5 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-200 border border-slate-305 dark:border-white/5 hover:border-rose-400 dark:hover:border-rose-900/40 text-slate-600 dark:text-slate-400 rounded-lg transition duration-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Exit Security Session</span>
        </button>
      </div>
    </aside>
  );
};
