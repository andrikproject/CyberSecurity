import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Send, 
  Clock, 
  User, 
  History, 
  CheckSquare, 
  X,
  Lock,
  AlertOctagon
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { IncidentStatus, IncidentSeverity } from '../types';

export const IncidentsView: React.FC = () => {
  const { 
    incidents, 
    currentUser, 
    createIncident, 
    updateIncidentStatus, 
    addIncidentComment, 
    addIncidentTimelineEvent 
  } = useSecurity();

  const [selectedIncId, setSelectedIncId] = useState<string | null>(() => {
    return incidents.length > 0 ? incidents[0].id : null;
  });

  const [mobileFocus, setMobileFocus] = useState<'list' | 'detail'>('list');

  const [commentsSection, setCommentsSection] = useState('');
  const [timelineActionText, setTimelineActionText] = useState('');
  const [timelineDetailText, setTimelineDetailText] = useState('');
  const [showingAddEvent, setShowingAddEvent] = useState(false);

  // Modal Raise Incident Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('High');
  const [newPic, setNewPic] = useState('alex_secops');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const activeInc = incidents.find(i => i.id === selectedIncId) || null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsSection.trim() || !activeInc) return;
    addIncidentComment(activeInc.id, commentsSection.trim());
    setCommentsSection('');
  };

  const handleTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineActionText.trim() || !activeInc) return;
    addIncidentTimelineEvent(activeInc.id, timelineActionText.trim(), timelineDetailText.trim() || undefined);
    setTimelineActionText('');
    setTimelineDetailText('');
    setShowingAddEvent(false);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategory.trim() || !newDescription.trim()) return;

    createIncident({
      title: newTitle.trim(),
      category: newCategory.trim(),
      description: newDescription.trim(),
      severity: newSeverity,
      pic: newPic
    });

    // Reset fields
    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setNewSeverity('High');
    setIsModalOpen(false);

    // Display banner instead of disruptive alert modal box
    setSuccessBanner("Pristine MVP Incident successfully registered in the telemetry base!");
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const getStatusBadgeColor = (st: IncidentStatus) => {
    switch (st) {
      case 'Open': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'Containing': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Eradicated': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Recovering': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Closed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const getSeverityColor = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'Critical': return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900';
      case 'High': return 'text-amber-700 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900';
      case 'Medium': return 'text-indigo-700 dark:text-cyan-400 bg-indigo-50 dark:bg-cyan-950/20 border-indigo-200 dark:border-cyan-900';
      case 'Low': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900';
    }
  };

  const isReadOnlySec = currentUser.role === 'Viewer' || currentUser.role === 'Auditor';

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-100 min-h-screen font-sans flex flex-col relative transition-colors">
      
      {/* SECTION TOP HEADER ACTION AREA */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-900 bg-[#f8fafc]/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-505" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Incident Response Center ({incidents.length})</h2>
        </div>

        {!isReadOnlySec ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-650 font-semibold text-xs text-slate-950 hover:text-white rounded-xl transition duration-150 shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Raise Formal Incident Plan</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-804 rounded-lg text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Read-Only Operations Clearance</span>
          </div>
        )}
      </div>

      {successBanner && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in">
          <span>{successBanner}</span>
          <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setSuccessBanner(null)} />
        </div>
      )}

      {/* BODY SPLIT VIEWPORTS */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-900">
        
        {/* LEFT COLUMN: ACTIVE CORPORATE INCIDENTS MATRIX GRID */}
        <div className={`lg:col-span-2 p-4 overflow-y-auto max-h-[calc(100vh-140px)] space-y-2 ${mobileFocus === 'detail' ? 'hidden' : 'block'}`}>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 px-1.5 py-1 font-bold">OPERATIONAL DISCLOSURES</div>
          {incidents.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400 italic">No formal breaches recorded or reported.</p>
          ) : (
            incidents.map((inc) => {
              const isSelected = inc.id === selectedIncId;
              const dateObj = new Date(inc.dateStarted);
              return (
                <div 
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncId(inc.id);
                    setShowingAddEvent(false);
                    setMobileFocus('detail');
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                    isSelected 
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-350 dark:border-amber-600/80 shadow-[0_0_12px_rgba(245,158,11,0.05)]' 
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-500 font-bold">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${getStatusBadgeColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold tracking-tight line-clamp-1 ${isSelected ? 'text-amber-955 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                    {inc.title}
                  </h3>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed">{inc.description}</p>

                  <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-900/60 pt-2 shrink-0">
                    <span className="flex items-center space-x-1.5">
                      <User className="h-3 w-3" />
                      <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">@{inc.pic}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: CORE TIMELINE AND COOPERATIONAL CHATS */}
        <div className={`lg:col-span-3 p-6 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6 ${mobileFocus === 'list' ? 'hidden' : 'block'}`}>
          {/* MOBILE BACK TO LIST ACTION TRIGGER */}
          <div className="lg:hidden pb-3 border-b border-slate-200 dark:border-slate-800/60 flex">
            <button 
              onClick={() => setMobileFocus('list')}
              className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-500 hover:opacity-80 transition"
            >
              <span>&larr; BACK TO INCIDENT REGISTRY ({incidents.length})</span>
            </button>
          </div>

          {activeInc ? (
            <div className="space-y-6">
              
              {/* INCIDENTS HEADING DETAILS */}
              <div className="border-b border-slate-200 dark:border-slate-900 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-full px-3 py-1 flex items-center space-x-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 dark:bg-emerald-400 animate-pulse mr-1" />
                    <span>ACTIVE SEC OPERATIONS WORKROOM</span>
                  </span>

                  <span className="text-xs text-slate-450 dark:text-slate-500 font-mono">Started: {new Date(activeInc.dateStarted).toUTCString()}</span>
                </div>

                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{activeInc.id}: {activeInc.title}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{activeInc.description}</p>

                {/* Sub-meta metrics cards */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs border-t border-slate-200 dark:border-slate-900 mt-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-mono uppercase font-bold">Investigator PIC:</p>
                    <p className="text-indigo-650 dark:text-cyan-400 mt-0.5 font-bold font-mono">@{activeInc.pic}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-mono uppercase font-bold">Classification impact:</p>
                    <span className={`text-[10px] tracking-tight font-bold border rounded px-1.5 mt-1 inline-block ${getSeverityColor(activeInc.severity)}`}>
                      {activeInc.severity}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <p className="text-[9px] text-slate-455 dark:text-slate-500 font-mono uppercase font-bold">Attack Category:</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 truncate font-sans text-[11px] font-medium font-bold">{activeInc.category}</p>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CASE WORKFLOW STATUS CONTROLLER */}
              {!isReadOnlySec ? (
                <div className="bg-slate-100/50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold">UPDATE LIFECYCLE STATUS</span>
                  <div className="flex flex-wrap gap-1.5 font-sans">
                    {(['Open', 'Containing', 'Eradicated', 'Recovering', 'Closed'] as IncidentStatus[]).map((st) => {
                      const isActive = activeInc.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => updateIncidentStatus(activeInc.id, st)}
                          className={`px-3 py-1 rounded text-xs transition duration-150 font-mono font-bold cursor-pointer ${
                            isActive 
                              ? 'bg-amber-600 text-slate-950 border border-amber-500 shadow-inner' 
                              : 'bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
                          }`}
                        >
                          {st.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-center text-xs text-slate-500 italic">
                  Read-only context. Your account is unauthorized to execute status transitions or contain devices.
                </div>
              )}

              {/* TIMELINE ACTIVITIES JOURNAL OF EVENTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2 font-mono">
                    <History className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                    <span>CHRONOLOGICAL INCIDENT WORKBOOK JOURNAL ({activeInc.timeline.length})</span>
                  </h3>

                  {!isReadOnlySec && (
                    <button 
                      onClick={() => setShowingAddEvent(!showingAddEvent)}
                      className="text-xs text-indigo-650 dark:text-cyan-400 hover:text-indigo-550 dark:hover:text-cyan-300 flex items-center space-x-1.5 font-mono cursor-pointer"
                    >
                      <span className="font-bold">+ Add Timeline Case Event</span>
                    </button>
                  )}
                </div>

                {/* Submit case timeline action form */}
                {showingAddEvent && (
                  <form onSubmit={handleTimelineSubmit} className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-205 dark:border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">Declare Remediation Action Taken:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Action (e.g. Host Isolated, Firewall block)"
                        value={timelineActionText}
                        onChange={(e) => setTimelineActionText(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 text-xs px-2.5 py-1.5 outline-none rounded text-slate-950 dark:text-white font-sans"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Detail notes (optional, e.g. proxy isolated)"
                        value={timelineDetailText}
                        onChange={(e) => setTimelineDetailText(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 text-xs px-2.5 py-1.5 outline-none rounded text-slate-950 dark:text-slate-100 font-sans"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-1.5">
                      <button 
                        type="button" 
                        onClick={() => setShowingAddEvent(false)}
                        className="text-slate-500 hover:text-slate-700 text-xs px-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-indigo-50 hover:bg-indigo-100 dark:bg-cyan-950 dark:hover:bg-cyan-900 border border-indigo-200 dark:border-cyan-800 text-indigo-700 dark:text-cyan-400 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        Append Event Card
                      </button>
                    </div>
                  </form>
                )}

                {/* Chrono timeline events map */}
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4 ml-2 max-w-2xl py-2">
                  {activeInc.timeline.map((event) => {
                    const dateObj = new Date(event.timestamp);
                    return (
                      <div key={event.id} className="relative mt-2 text-xs">
                        {/* Bullet circle ring */}
                        <span className="absolute -left-[30px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-950 border-2 border-amber-500 flex items-center justify-center animate-pulse z-20" />

                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-lg space-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition text-slate-755 dark:text-slate-300">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-slate-900 dark:text-white font-bold">{event.action}</span>
                            <span className="text-slate-450 dark:text-slate-500 font-bold">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({event.actor})
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal italic font-sans">{event.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TIMELINE DISCUSSION BOARD */}
              <div className="border-t border-slate-200 dark:border-slate-900 pt-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-950 dark:text-white font-mono flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-slate-500" />
                  <span>SEC OPS JOINT RESPONSE BOARD ({activeInc.comments.length})</span>
                </h3>

                {/* Comment feeds */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeInc.comments.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No threat analysis response logs posted.</p>
                  ) : (
                    activeInc.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl space-y-1.5 leading-relaxed text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-amber-600 dark:text-amber-500 font-bold">@{comm.author}</span>
                            <span className="text-slate-500 dark:text-slate-450 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.2 border border-slate-200 dark:border-slate-900 rounded font-sans">{comm.role}</span>
                          </div>
                          <span className="text-slate-405 dark:text-slate-500">{new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-705 dark:text-slate-300 font-sans leading-normal">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Send comments inputs */}
                {!isReadOnlySec && (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Comment with forensics or team updates..."
                      value={commentsSection}
                      onChange={(e) => setCommentsSection(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 outline-none rounded-xl text-xs text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-cyan-500"
                    />
                    <button 
                      type="submit" 
                      disabled={!commentsSection.trim()}
                      className="p-2.5 bg-amber-600 hover:bg-amber-555 border border-amber-500 text-slate-950 rounded-xl transition disabled:opacity-40 cursor-pointer flex items-center justify-center font-bold"
                    >
                      <Send className="h-3.5 w-3.5 text-slate-950" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-550 text-xs">
              <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <span>Select an ongoing incident case file to access responses and containment grids.</span>
            </div>
          )}
        </div>

      </div>

      {/* RAISING ENTIRE NEW INCIDENT MODAL PRE-FORM DIALOG */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-[#020617]/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl font-sans animate-zoom-in">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-505">
                <AlertOctagon className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">Declare Formal Incident Report</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4 text-slate-850 dark:text-slate-200">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold">Incident Classification</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DDoS Blockage, Malware compromises"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 rounded p-2 text-slate-900 dark:text-slate-105 placeholder-slate-400 outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold">Investigator Command PIC</label>
                  <select 
                    value={newPic}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 block rounded p-2 text-slate-900 dark:text-slate-105 outline-none font-sans"
                    onChange={(e) => setNewPic(e.target.value)}
                  >
                    <option value="alex_secops">alex_secops (Admin)</option>
                    <option value="sarah_analyst">sarah_analyst (Analyst)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold">Incident Title Summary</label>
                <input 
                  type="text" 
                  placeholder="e.g. Host latency spike detected due to malicious flood query"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 rounded p-2 text-slate-900 dark:text-slate-105 placeholder-slate-400 outline-none font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold font-bold">Defcon impact scale</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Critical', 'High', 'Medium', 'Low'].map((sevLevel) => {
                    const isSelected = newSeverity === sevLevel;
                    return (
                      <button
                        key={sevLevel}
                        type="button"
                        onClick={() => setNewSeverity(sevLevel as IncidentSeverity)}
                        className={`py-1.5 rounded font-extrabold border transition text-center text-[10px] cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-600 text-slate-950 border-amber-500' 
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-405 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {sevLevel.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest block uppercase font-bold">IOC evidence & Symptoms detail description</label>
                <textarea
                  rows={4}
                  placeholder="Verify network gateway anomalies, server dump details, memory leaks..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-cyan-500 rounded p-2.5 text-slate-900 dark:text-slate-105 placeholder-slate-405 outline-none leading-normal font-sans"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-555 text-slate-950 font-extrabold rounded-xl cursor-pointer"
                >
                  Raise Incident Report
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
