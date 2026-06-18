import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle, 
  Terminal, 
  AlertOctagon, 
  History, 
  ChevronRight, 
  Lock,
  PlusCircle,
  X
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { SecurityAlert, AlertSeverity, AlertStatus } from '../types';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    currentUser, 
    resolveAlert, 
    updateAlertStatus, 
    addAlertNote, 
    createIncident 
  } = useSecurity();

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(() => {
    return alerts.length > 0 ? alerts[0].id : null;
  });

  const [mobileFocus, setMobileFocus] = useState<'list' | 'detail'>('list');

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'All'>('All');
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showingResolveBox, setShowingResolveBox] = useState(false);
  const [escalatedSuccessMsg, setEscalatedSuccessMsg] = useState<string | null>(null);

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || null;

  // Filter alerts
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.sourceIp.includes(searchQuery) || 
                          a.targetedAsset.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedAlert) return;
    addAlertNote(selectedAlert.id, newNoteContent.trim());
    setNewNoteContent('');
  };

  const handleResolve = () => {
    if (!selectedAlert) return;
    resolveAlert(selectedAlert.id, resolutionNote.trim());
    setResolutionNote('');
    setShowingResolveBox(false);
  };

  const handleEscalateIncident = () => {
    if (!selectedAlert) return;
    
    createIncident({
      title: `Escalated Alert: ${selectedAlert.title}`,
      category: selectedAlert.category,
      description: `Target System compromised or evaluated under threat code ALT-${selectedAlert.id}. Raw alert report: ${selectedAlert.description}. Attacking Node IP: ${selectedAlert.sourceIp} to local destination vector ${selectedAlert.destIp}`,
      severity: selectedAlert.severity,
      pic: currentUser.username
    });

    updateAlertStatus(selectedAlert.id, 'Investigating');
    setEscalatedSuccessMsg(`Security alert ${selectedAlert.id} has been successfully escalated! Incident declared.`);
    setTimeout(() => setEscalatedSuccessMsg(null), 5000);
  };

  const getSeverityBadgeColor = (sev: AlertSeverity) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/85';
      case 'High': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/85';
      case 'Medium': return 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/85';
      case 'Low': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800/85';
    }
  };

  const getStatusBadgeColor = (st: AlertStatus) => {
    switch (st) {
      case 'New': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'Investigating': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Suppressed': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const isUnauthorized = currentUser.role === 'Viewer';

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-100 min-h-screen font-sans flex flex-col transition-colors">
      
      {/* Top filter dashboard menu */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-900 bg-[#f8fafc]/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-indigo-650 dark:text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">SecOps Threat Alerts ({alerts.length})</h2>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Text search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search ID, IP, target..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-705 focus:border-indigo-500 dark:focus:border-cyan-500 outline-none rounded-xl text-xs w-52 text-slate-850 dark:text-white transition font-mono"
            />
          </div>

          {/* Severity selector */}
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3 w-3 text-slate-400" />
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'All')}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-indigo-550 dark:focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status selector */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'All')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 py-1.5 px-2.5 rounded-lg outline-none focus:border-indigo-550 dark:focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All States</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Suppressed">Suppressed</option>
          </select>
        </div>
      </div>

      {/* CORE ALERTS split-layout grids */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-900">
        
        {/* LEFT COLUMN: THE FILTERED ALERTS LIST GRID */}
        <div className={`lg:col-span-2 overflow-y-auto max-h-[calc(100vh-140px)] p-4 space-y-2 ${mobileFocus === 'detail' ? 'hidden' : 'block'}`}>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No security threat signals found matching filters.
            </div>
          ) : (
            filteredAlerts.map((alt) => {
              const isSelected = alt.id === selectedAlertId;
              const dateObj = new Date(alt.timestamp);
              return (
                <div
                  key={alt.id}
                  onClick={() => {
                    setSelectedAlertId(alt.id);
                    setShowingResolveBox(false);
                    setResolutionNote('');
                    setMobileFocus('detail');
                  }}
                  className={`p-3.5 rounded-xl border transition duration-150 cursor-pointer flex flex-col space-y-2 ${
                    isSelected 
                      ? 'bg-indigo-50/50 dark:bg-cyan-950/30 border-indigo-350 dark:border-cyan-500/85 shadow-[0_0_12px_rgba(99,102,241,0.06)]' 
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{alt.id}</span>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded border ${getSeverityBadgeColor(alt.severity)}`}>
                        {alt.severity}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded border font-mono ${getStatusBadgeColor(alt.status)}`}>
                        {alt.status}
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                    {alt.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Source: {alt.sourceIp}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-right">Target: {alt.targetedAsset}</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>Count: {alt.count} events</span>
                    <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE ALERT ANATOMY DETAIL VIEW */}
        <div className={`lg:col-span-3 p-6 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6 ${mobileFocus === 'list' ? 'hidden' : 'block'}`}>
          {/* MOBILE BACK TO LIST ACTION TRIGGER */}
          <div className="lg:hidden pb-3 border-b border-slate-200 dark:border-slate-800/60 flex">
            <button 
              onClick={() => setMobileFocus('list')}
              className="flex items-center space-x-2 text-xs font-mono font-bold text-indigo-650 dark:text-cyan-400 hover:opacity-80 transition"
            >
              <span>&larr; BACK TO ALERTS LIST ({filteredAlerts.length})</span>
            </button>
          </div>

          {selectedAlert ? (
            <div className="space-y-6">
              
              {/* Alert Title Banner Header */}
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertOctagon className="h-5 w-5 text-indigo-650 dark:text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-500">ALERT VECTOR PATH:</span>
                    <span className="text-xs font-mono bg-indigo-50 dark:bg-cyan-950 font-bold px-2 py-0.5 rounded text-indigo-705 dark:text-cyan-400 border border-indigo-200 dark:border-cyan-900">
                      {selectedAlert.id}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    {new Date(selectedAlert.timestamp).toUTCString()}
                  </span>
                </div>

                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">{selectedAlert.title}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{selectedAlert.description}</p>
              </div>

              {/* Escalate Success Notification Overlay (Inline) */}
              {escalatedSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-800/50 rounded-xl text-xs font-sans flex items-center justify-between animate-pulse">
                  <span>{escalatedSuccessMsg}</span>
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setEscalatedSuccessMsg(null)} />
                </div>
              )}

              {/* Technical indicators metadata mapping */}
              <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 font-mono text-xs">
                <h3 className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider font-bold">THREAT TELEMETRY DATA</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-805">
                  <div className="space-y-1.5 p-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">SOURCE IP ADDRESS:</p>
                    <p className="text-indigo-950 dark:text-white font-bold text-xs break-all">{selectedAlert.sourceIp}</p>
                    <p className="text-[9px] text-slate-500">Inbound to Interface: {selectedAlert.destIp}</p>
                  </div>

                  <div className="space-y-1.5 p-1 md:pl-4">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">TARGETED LOGICAL RESOURCE:</p>
                    <p className="text-emerald-950 dark:text-white font-bold text-xs">{selectedAlert.targetedAsset}</p>
                    <p className="text-[9px] text-slate-550 dark:text-slate-400">Trigger rule rule_id: {selectedAlert.triggerRule}</p>
                  </div>
                </div>
              </div>

              {/* Mitigation/Remediation checklist steps */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-indigo-550 dark:text-cyan-400" />
                  <span>Interactive Threat Runbook Steps</span>
                </h3>
                
                <div className="space-y-1.5 max-w-3xl">
                  {selectedAlert.remediationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                      <span className="bg-indigo-50 dark:bg-cyan-950 text-indigo-700 dark:text-cyan-400 font-mono text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 border border-indigo-200 dark:border-cyan-900">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed mt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION MATRIX PANELS */}
              <div className="border-t border-slate-200 dark:border-slate-900 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-sans uppercase tracking-wider">Mitigation Firewalls Control</h3>
                  
                  {isUnauthorized && (
                    <div className="flex items-center space-x-1.5 text-amber-650 dark:text-amber-500 text-[10px] font-mono bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-950">
                      <Lock className="h-3 w-3" />
                      <span>Read-only Mode Active: {currentUser.role}</span>
                    </div>
                  )}
                </div>

                {/* Mitigate action buttons triggers */}
                {!isUnauthorized ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.status !== 'Resolved' && (
                      <button 
                        onClick={() => setShowingResolveBox(!showingResolveBox)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-555 border border-emerald-500 rounded-lg text-white font-semibold text-xs transition cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Mitigate & Close Alert</span>
                      </button>
                    )}
                    
                    {selectedAlert.status === 'New' && (
                      <button 
                        onClick={() => updateAlertStatus(selectedAlert.id, 'Investigating')}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-xs transition cursor-pointer"
                      >
                        <span>Mark Investigating</span>
                      </button>
                    )}

                    {selectedAlert.status === 'New' && (
                      <button 
                        onClick={() => updateAlertStatus(selectedAlert.id, 'Suppressed')}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs transition cursor-pointer"
                      >
                        <span>Suppress Signal</span>
                      </button>
                    )}

                    {selectedAlert.status !== 'Resolved' && (
                      <button 
                        onClick={handleEscalateIncident}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/75 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg font-semibold text-xs transition ml-auto cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
                        <span>Escalate to Corporate Incident</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-550 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-3 rounded text-center border border-slate-200 dark:border-slate-900">
                    Your test account role ({currentUser.role}) has view-only permissions. Change test persona in the top panel bar block for mitigation controls!
                  </div>
                )}

                {/* Expanded Resolve form field boxes */}
                {showingResolveBox && (
                  <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-emerald-305 dark:border-emerald-800/40 space-y-3 font-sans animate-fade-in">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Declare Incident Resolution Notes:</p>
                    <textarea
                      placeholder="Specify patch deploy ID, firewall blocked rule hash, or analyst validation logs..."
                      rows={3}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 outline-none rounded-lg p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:border-emerald-555 leading-normal"
                    />
                    <div className="flex items-center space-x-2 justify-end">
                      <button 
                        onClick={() => setShowingResolveBox(false)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleResolve}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-555 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Confirm Threat Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TIMELINE COMMENTING LOGS */}
              <div className="border-t border-slate-200 dark:border-slate-900 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2 font-mono">
                  <History className="h-4 w-4 text-slate-400" />
                  <span>SIEM INVESTIGATIVE DISCUSSIONS BOARD ({selectedAlert.notes.length})</span>
                </h3>

                {/* Comment streams */}
                <div className="space-y-2.5">
                  {selectedAlert.notes.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No custom security comments registered on this telemetry yet.</p>
                  ) : (
                    selectedAlert.notes.map((note) => (
                      <div key={note.id} className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-900 rounded-xl p-3 space-y-1.5 text-slate-750 dark:text-slate-300">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center space-x-2">
                            <span className="text-indigo-650 dark:text-cyan-400 font-bold">@{note.author}</span>
                            <span className="text-slate-450 dark:text-slate-550 font-normal">| SecOps Team Officer</span>
                          </div>
                          <span className="text-slate-400 dark:text-slate-500">
                            {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-normal">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Append comment form logs */}
                {!isUnauthorized && (
                  <form onSubmit={handleAddNote} className="flex gap-2.5 items-center">
                    <input 
                      type="text" 
                      placeholder="Comment on threat inspection..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 outline-none rounded-xl text-xs text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-cyan-500"
                    />
                    <button 
                      type="submit" 
                      disabled={!newNoteContent.trim()}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-cyan-950 dark:hover:bg-cyan-900 border border-indigo-200 dark:border-cyan-800 text-indigo-700 dark:text-cyan-400 font-bold text-xs rounded-xl transition disabled:opacity-40"
                    >
                      Comment
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-550 text-xs">
              <ShieldAlert className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
              <span>Select an investigation channel from threat index to begin manual trace analysis.</span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
