import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Terminal, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  X,
  AlertTriangle,
  Info,
  Users,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    notifications, 
    markNotificationRead, 
    clearNotification 
  } = useSecurity();

  const { theme, toggleTheme } = useTheme();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-rose-500 fill-rose-950/20" />;
      case 'High':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'Medium':
        return <Info className="h-4 w-4 text-cyan-500" />;
      case 'Low':
      case 'Info':
      default:
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/10 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition">
      {/* Search / Live Telemetry Stream */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="hidden md:flex items-center space-x-2 text-xs font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400 font-medium font-mono">SIEM STREAMING:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Global Timestamps */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span className="font-mono">
            <span className="hidden sm:inline">UTC: {currentTime.toUTCString().replace('GMT', 'UTC')}</span>
            <span className="sm:hidden">UTC: {currentTime.toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })}</span>
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center space-x-3.5">
        
        {/* LIGHT / DARK THEME TOGGLE BUTTON */}
        <button 
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Rapid Tester Profile Switcher Info Bar */}
        <button 
          onClick={() => setProfileSwitcherOpen(!profileSwitcherOpen)}
          className="relative flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs rounded-xl text-slate-750 dark:text-slate-200 transition duration-150 backdrop-blur-md cursor-pointer"
        >
          <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-mono text-slate-500 dark:text-slate-400">Test:</span>
          <span className="font-semibold text-slate-900 dark:text-white">@{currentUser.username}</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded text-indigo-700 dark:text-indigo-300 truncate max-w-[70px]">
            {currentUser.role}
          </span>
          <ChevronRight className="h-3 w-3 transform rotate-90 text-slate-400 dark:text-slate-500" />
        </button>

        {/* Rapid Switcher Panel Dropdown */}
        {profileSwitcherOpen && (
          <div className="absolute right-24 top-14 w-64 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl">
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-white/10 mb-1">
              <p className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 uppercase">Change Active Persona</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500">Useful to test role access level permissions</p>
            </div>
            <div className="space-y-0.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  disabled={u.status === 'Suspended'}
                  onClick={() => {
                    switchUser(u.id);
                    setProfileSwitcherOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition duration-155 ${
                    currentUser.id === u.id 
                      ? 'bg-indigo-650/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-white' 
                      : u.status === 'Suspended' 
                        ? 'opacity-40 cursor-not-allowed'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img src={u.avatarUrl} alt={u.username} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">@{u.username}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{u.role}</p>
                    </div>
                  </div>
                  {currentUser.id === u.id && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS BILL CENTER */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition duration-150 relative cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 border-2 border-white dark:border-slate-950 text-[10px] font-bold text-white h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown panel */}
          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white/95 dark:bg-[#090d16]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans">
              <div className="p-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">In-App Bulletins ({unreadCount})</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-mono"
                  >
                    Read All
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-550 dark:text-slate-500">
                    No active incident notifications. System normal.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 transition duration-150 text-xs flex items-start space-x-2.5 ${
                        notif.isRead ? 'bg-transparent opacity-60' : 'bg-slate-50 dark:bg-white/5 text-slate-855 dark:text-slate-100 border-l-2 border-indigo-600 dark:border-indigo-500'
                      }`}
                    >
                      <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800 dark:text-slate-300 truncate">{notif.title}</p>
                          <span className="text-[8px] text-slate-500 shrink-0 font-mono font-bold">
                            {notif.alertId || notif.incidentId || 'SYS'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{notif.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[8px] text-slate-500 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex items-center space-x-2">
                            {!notif.isRead && (
                              <button 
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-550 dark:hover:text-indigo-300 font-mono font-medium"
                              >
                                Mark Read
                              </button>
                            )}
                            <button 
                              onClick={() => clearNotification(notif.id)}
                              className="text-slate-400 hover:text-slate-600 dark:text-slate-550 dark:hover:text-slate-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
