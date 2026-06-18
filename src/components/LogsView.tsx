import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Download, 
  Filter, 
  Database
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const LogsView: React.FC = () => {
  const { logs, addAuditLogEntry } = useSecurity();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Mitigated' | 'Warning' | 'Failed'>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');

  // Extract distinct actions to populate filter dropdown lists
  const distinctActions = Array.from(new Set(logs.map(log => log.action)));

  // Filter logs based on inputs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.detail.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.ipAddress.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;

    return matchesSearch && matchesStatus && matchesAction;
  });

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Success': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 font-bold';
      case 'Mitigated': return 'bg-indigo-50 dark:bg-cyan-950/60 text-indigo-700 dark:text-cyan-400 border-indigo-200 dark:border-cyan-900/60 font-bold';
      case 'Warning': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-900/60 font-bold';
      case 'Failed': return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 font-bold';
      default: return 'bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const handleExportDataCSV = () => {
    const headers = 'ID,Timestamp,Actor,Role,Action,Details,Status,IPAddress\n';
    const rows = filteredLogs.map((l) => 
      `"${l.id}","${l.timestamp}","${l.username}","${l.role}","${l.action}","${l.detail.replace(/"/g, '""')}","${l.status}","${l.ipAddress}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'secops_siem_audit_trail_export.csv');
    a.click();

    // Log the audit
    addAuditLogEntry('Audit Export Logfile', `Exported compliance audit trail CSV comprising ${filteredLogs.length} matching rows`, 'Success');
  };

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-100 min-h-screen font-sans p-6 space-y-6 transition-colors">
      
      {/* SECTION TOP COMPACT STATS HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-205 dark:border-slate-900 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-indigo-550 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">SIEM Compliance Audit Trail DB</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable audit compliance registry logs tracking console configuration shifts, auth, and alert mitigations.</p>
        </div>

        <button 
          onClick={handleExportDataCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-white border border-slate-200 dark:border-slate-808 text-slate-700 dark:text-slate-300 text-xs rounded-xl transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
          <span>Export logs (.CSV)</span>
        </button>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Search input query */}
        <div className="relative font-mono">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search Actor, action, logs detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 pr-2.5 py-1.5 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 outline-none rounded-lg text-xs placeholder-slate-450 text-slate-900 dark:text-white"
          />
        </div>

        {/* Transaction Status Dropdown */}
        <div className="flex items-center space-x-2 font-mono">
          <Filter className="h-3.5 w-3.5 text-slate-450" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-indigo-500 dark:focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Transactions Statuses</option>
            <option value="Success">Success</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Warning">Incident Warnings</option>
            <option value="Failed">Failed Exceptions</option>
          </select>
        </div>

        {/* Audit Scope / Action types dropdown */}
        <select 
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-650 dark:text-slate-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-indigo-550 dark:focus:border-cyan-500 cursor-pointer font-mono"
        >
          <option value="All">All Operations Scopes</option>
          {distinctActions.map(act => (
            <option key={act} value={act}>{act}</option>
          ))}
        </select>

      </div>

      {/* MAIN LOGS GRID DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-250 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider select-none font-bold">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4 hidden sm:table-cell">TRANSACTION</th>
                <th className="py-3 px-4">SYS SCOPE</th>
                <th className="py-3 px-4">OPERATOR ACTOR</th>
                <th className="py-3 px-4">TELEMETRY DETAIL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">NODE S_IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 italic">No transactional logs recorded matching filter query rules.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateForm = new Date(log.timestamp).toLocaleTimeString([], { hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
                  const dateDay = new Date(log.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' });
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition text-slate-700 dark:text-slate-300">
                      {/* DateTime Stamp formatted nicely */}
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-cyan-400/90 whitespace-nowrap">
                        <span>{dateDay}</span> <span className="text-slate-300 dark:text-slate-500">|</span> <span className="text-slate-700 dark:text-slate-350">{dateForm}</span>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 select-all font-semibold hidden sm:table-cell">
                        {log.id}
                      </td>

                      {/* Transaction Scope Type */}
                      <td className="py-3 px-4 font-mono font-bold text-[10px] text-slate-650 dark:text-slate-400 uppercase">
                        {log.action}
                      </td>

                      {/* Operator with small role tag */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 whitespace-nowrap">
                          <span className="text-slate-900 dark:text-white font-semibold">@{log.username}</span>
                          <span className="text-[8px] bg-slate-100 dark:bg-slate-950 text-slate-500 font-mono px-1 py-0.2 border border-slate-200 dark:border-slate-850 rounded">
                            {log.role}
                          </span>
                        </div>
                      </td>

                      {/* Raw details summary */}
                      <td className="py-3 px-4 max-w-sm truncate text-slate-805 dark:text-slate-300 font-sans leading-normal">
                        {log.detail}
                      </td>

                      {/* Status Tag badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold ${getStatusStyle(log.status)}`}>
                          {log.status === 'Mitigated' ? 'MITIGATED' : log.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Ip Location */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400 dark:text-slate-500 text-[10px] select-all hidden sm:table-cell">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* COMPACT INFOGRAPHIC TAB FOOTER */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Database className="h-3.5 w-3.5 text-slate-400" />
              <span>Matching index: <strong className="text-indigo-650 dark:text-slate-300">{filteredLogs.length} records</strong></span>
            </span>
          </div>

          <span>Total DB records size: {logs.length} logs</span>
        </div>

      </div>

    </div>
  );
};
