import React, { useState } from 'react';
import { 
  Users, 
  Sliders, 
  Lock, 
  Shield, 
  X
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { SecurityRole } from '../types';

export const AdminView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    updateUserStatus, 
    updateUserRole
  } = useSecurity();

  const [searchQuery, setSearchQuery] = useState('');

  // Check if current user is Admin
  const isGlobalAdmin = currentUser.role === 'Admin';

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (userId: string, currentStatus: 'Active' | 'Suspended') => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    updateUserStatus(userId, nextStatus);
  };

  const handleRoleChange = (userId: string, nextRole: SecurityRole) => {
    updateUserRole(userId, nextRole);
  };

  // RBAC Privileges definitions
  const rbacTable = [
    { permission: 'Monitor SecOps system condition metrics dashboard', Admin: true, Analyst: true, Auditor: true, Viewer: true },
    { permission: 'Browse, filter, and inspect threat signals/payloads', Admin: true, Analyst: true, Auditor: true, Viewer: true },
    { permission: 'Mitigate raw alert checks and add annotative comments', Admin: true, Analyst: true, Auditor: false, Viewer: false },
    { permission: 'Escalate active alerts to incidents file system', Admin: true, Analyst: true, Auditor: false, Viewer: false },
    { permission: 'Deploy firewall containment and update incident lifecycle status', Admin: true, Analyst: true, Auditor: false, Viewer: false },
    { permission: 'Browse immutable transactional compliance logs and export details', Admin: true, Analyst: true, Auditor: true, Viewer: false },
    { permission: 'Carry out administrative actions: user suspensions, authority edits', Admin: true, Analyst: false, Auditor: false, Viewer: false }
  ];

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-100 min-h-screen font-sans p-6 space-y-6 transition-colors">
      
      {/* SECTION TOP SUB-BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-205 dark:border-slate-900 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-550 dark:text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Security Personnel & Access Governance</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control operational statuses, modify role levels, and audit detailed Role-Based Access controls (RBAC) metrics.</p>
        </div>

        {/* Global check if they are Administrator */}
        {!isGlobalAdmin && (
          <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-500 font-mono text-[10px] bg-amber-50 dark:bg-amber-955/20 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900 animate-pulse">
            <X className="h-3.5 w-3.5" />
            <span>ADMIN WRITE LOCK ACTIVE: Switch Persona in header dropdown checklist to Alexander Admin IP</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO-THIRDS: SECURITY TEAM REGISTRY GRID */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Active Analysts Registry ({users.length})</h3>
            
            {/* Search box */}
            <input 
              type="text" 
              placeholder="Search user, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 outline-none rounded-xl text-xs w-48 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden divide-y divide-slate-105 dark:divide-slate-850">
            {filteredUsers.map((u) => {
              const uStatusActive = u.status === 'Active';
              const isSelf = currentUser.id === u.id;
              
              return (
                <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition">
                  {/* Photo and detail layout */}
                  <div className="flex items-center space-x-3.5">
                    <img 
                      src={u.avatarUrl} 
                      alt={u.username} 
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">@{u.username}</p>
                        {isSelf && (
                          <span className="text-[8px] bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 font-mono px-1 rounded uppercase font-bold text-center">
                            Current Self
                          </span>
                        )}
                        {!uStatusActive && (
                          <span className="text-[8px] bg-rose-100 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-mono px-1 rounded uppercase font-bold animate-pulse text-center">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono leading-none mt-1">{u.email}</p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-sans mt-1.5">Department: <strong className="text-slate-900 dark:text-slate-350 font-semibold">{u.department}</strong></p>
                    </div>
                  </div>

                  {/* Administrative selectors role switching */}
                  <div className="flex items-center space-x-3 self-end md:self-center font-mono">
                    <div className="space-y-1 text-right">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Operational Status</span>
                      <button
                        onClick={() => toggleUserStatus(u.id, u.status)}
                        disabled={!isGlobalAdmin || isSelf}
                        className={`px-2 py-1 text-[9px] rounded font-extrabold border transition cursor-pointer ${
                          uStatusActive 
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-800 dark:hover:text-rose-400 hover:border-rose-350 dark:hover:border-rose-900' 
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-220 dark:border-rose-900 hover:bg-emerald-55 to-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-305 dark:hover:border-emerald-900'
                        } disabled:opacity-45 disabled:cursor-not-allowed`}
                      >
                        {uStatusActive ? 'SUSPEND LEVEL' : 'REACTIVATE LEVEL'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Role Authority</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as SecurityRole)}
                        disabled={!isGlobalAdmin || isSelf}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 py-1.5 px-2 rounded focus:border-indigo-550 dark:focus:border-cyan-500 outline-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed font-sans font-medium"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Auditor">Auditor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            <Shield className="h-5 w-5 text-indigo-500 dark:text-cyan-400 shrink-0" />
            <p>
              *Personnel suspended inside administrative blocks cannot initialize secure sessions. Their logins will resolve to active authentication failure blocks.
            </p>
          </div>

        </div>

        {/* RIGHT ONE-THIRD: ACCESS DECISION TREE RULES */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-indigo-550 dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight uppercase">Privilege Matrix Ledger</h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 font-sans max-h-[500px] overflow-y-auto">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Reference checklist of the Role-Based Access Control logic executed inside the SEC security sandbox model.
            </p>

            <div className="space-y-3">
              {rbacTable.map((rule, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-900 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {idx + 1}. {rule.permission}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-1 text-[8px] font-mono text-center font-bold">
                    <div className={`p-1 rounded border ${rule.Admin ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-955/40 text-rose-700 dark:text-rose-500 border-rose-100 dark:border-rose-950/40'}`}>
                      ADM: {rule.Admin ? '✓' : '✗'}
                    </div>
                    <div className={`p-1 rounded border ${rule.Analyst ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-955/40 text-rose-700 dark:text-rose-500 border-rose-100 dark:border-rose-950/40'}`}>
                      ANY: {rule.Analyst ? '✓' : '✗'}
                    </div>
                    <div className={`p-1 rounded border ${rule.Auditor ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-955/40 text-rose-700 dark:text-rose-500 border-rose-100 dark:border-rose-950/40'}`}>
                      AUD: {rule.Auditor ? '✓' : '✗'}
                    </div>
                    <div className={`p-1 rounded border ${rule.Viewer ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-955/40 text-rose-700 dark:text-rose-500 border-rose-100 dark:border-rose-950/40'}`}>
                      VIW: {rule.Viewer ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
