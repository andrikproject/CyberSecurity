import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Terminal, 
  Activity, 
  Zap, 
  Globe, 
  Server, 
  Play, 
  Sliders
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    alerts, 
    incidents, 
    logs, 
    simulateIncidentEvent, 
    systemStatus 
  } = useSecurity();

  const { theme } = useTheme();

  const [activeSensors] = useState<number>(12);
  const [networkLoad, setNetworkLoad] = useState<number>(42);
  const [cpuUsage, setCpuUsage] = useState<number>(31);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Randomize some metric telemetries to make application feel "live"
  useEffect(() => {
    const timer = setInterval(() => {
      setNetworkLoad(prev => {
        const change = Math.floor(Math.random() * 9) - 4;
        const next = prev + change;
        return next > 90 ? 88 : next < 20 ? 30 : next;
      });
      setCpuUsage(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const next = prev + change;
        return next > 95 ? 90 : next < 10 ? 15 : next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Cyber Radar Canvas Sweeper
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const blips: { x: number; y: number; size: number; alpha: number; type: 'alert' | 'secure' }[] = [
      { x: 120, y: 70, size: 4, alpha: 1, type: 'secure' },
      { x: 80, y: 150, size: 5, alpha: 0.8, type: 'alert' },
      { x: 220, y: 120, size: 3, alpha: 0.5, type: 'secure' },
      { x: 170, y: 190, size: 6, alpha: 0.9, type: 'alert' },
    ];

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = 240;
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const drawRadar = () => {
      // Background trails matched specifically to theme settings
      ctx.fillStyle = theme === 'dark' ? 'rgba(2, 6, 23, 0.15)' : 'rgba(248, 250, 252, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Draw grids
      ctx.strokeStyle = theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.66, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Sweeping line
      const sweepX = centerX + radius * Math.cos(angle);
      const sweepY = centerY + radius * Math.sin(angle);

      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      gradient.addColorStop(0, theme === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, theme === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.35)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle - 0.25, angle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = theme === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.85)'; // Indigo sweeper line
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Draw blips
      blips.forEach(blip => {
        blip.alpha -= 0.005;
        if (blip.alpha <= 0) {
          blip.alpha = 1;
          blip.x = centerX + (Math.random() * (radius * 1.6) - radius * 0.8);
          blip.y = centerY + (Math.random() * (radius * 1.6) - radius * 0.8);
          blip.type = Math.random() > 0.6 ? 'alert' : 'secure';
        }

        ctx.beginPath();
        ctx.arc(blip.x, blip.y, blip.size, 0, Math.PI * 2);
        if (blip.type === 'alert') {
          ctx.fillStyle = `rgba(239, 68, 68, ${blip.alpha})`; // Rose
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ef4444';
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${blip.alpha})`; // Emerald
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#10b981';
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      angle += 0.015;
      animationFrameId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [theme]);

  // Filter counters
  const openAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Closed').length;

  const lineChartData = [
    { time: '20:00', Alerts: 3 },
    { time: '22:00', Alerts: 8 },
    { time: '00:00', Alerts: 5 },
    { time: '02:00', Alerts: 12 },
    { time: '04:00', Alerts: alerts.filter(a => a.timestamp.includes('T03:') || a.timestamp.includes('T04:')).length + 4 },
    { time: '06:00', Alerts: alerts.filter(a => a.timestamp.includes('T05:') || a.timestamp.includes('T06:')).length + 9 },
    { time: '07:00 (Now)', Alerts: openAlertsCount }
  ];

  const categoryCount: { [key: string]: number } = {
    'Credential Attack': 0,
    'SQL Injection': 0,
    'Data Exfiltration': 0,
    'Endpoint Malware': 0,
    'System Penetration': 0,
  };

  incidents.forEach(inc => {
    if (inc.category.includes('Breach') || inc.description.includes('SQL')) {
      categoryCount['SQL Injection'] += 1;
    } else if (inc.category.includes('Exfiltration') || inc.category.includes('Unauthorized')) {
      categoryCount['Data Exfiltration'] += 1;
    } else if (inc.category.includes('Malware') || inc.category.includes('Compromise')) {
      categoryCount['Endpoint Malware'] += 1;
    } else {
      categoryCount['System Penetration'] += 1;
    }
  });

  const barChartData = Object.keys(categoryCount).map(key => ({
    name: key,
    Incidents: categoryCount[key] || 1 // force min 1 for visual layout
  }));

  const getSystemStatusStyles = () => {
    switch (systemStatus) {
      case 'SAFE':
        return {
          banner: 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/25 text-emerald-850 dark:text-emerald-300 backdrop-blur-md',
          title: 'System Optimal & Secure',
          desc: 'All security enforcement models reports healthy, zero unresolved leakage, zero active breaches.',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.06)] border-emerald-500/30'
        };
      case 'ELEVATED':
        return {
          banner: 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/30 dark:border-amber-500/25 text-amber-850 dark:text-amber-300 backdrop-blur-md',
          title: 'Elevated Threat Vigilance',
          desc: 'Minor malicious activity indicators are reported on edge gateways. Enhancing monitoring frequencies.',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.06)] border-amber-500/30'
        };
      case 'CRITICAL':
        return {
          banner: 'bg-rose-500/10 dark:bg-rose-500/10 border-rose-500/30 dark:border-rose-500/25 text-rose-850 dark:text-rose-300 backdrop-blur-md',
          title: 'Critical Alarm Status',
          desc: 'Multiple unresolved high-level threats flags detected. Firewall parameters adjusted to restrictive.',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.06)] border-rose-500/30'
        };
      case 'ATTACK':
        return {
          banner: 'bg-red-500/15 dark:bg-red-500/15 border-red-500/35 dark:border-red-500/30 text-red-800 dark:text-red-200 animate-[pulse_3s_infinite] backdrop-blur-md',
          title: 'ACTIVE CYBER BREACH ESCALATED',
          desc: 'DDoS flood loads or data exfiltration events in progress on production networks! Immediate incident remediation advised!',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.12)] border-red-500/40'
        };
    }
  };

  const currentTheme = getSystemStatusStyles();

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* SECTION 1: DYNAMICAL TOP SYSTEM BANNER */}
      <div className={`p-5 rounded-2xl border ${currentTheme.banner} ${currentTheme.glow} transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl relative shrink-0">
            <Activity className={`h-6 w-6 ${
              systemStatus === 'SAFE' ? 'text-emerald-600 dark:text-emerald-400' :
              systemStatus === 'ELEVATED' ? 'text-amber-600 dark:text-amber-400' :
              systemStatus === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-red-650 dark:text-red-400 animate-bounce'
            }`} />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-ping" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{currentTheme.title}</h2>
            <p className="text-[11px] text-slate-600 dark:text-slate-350 max-w-2xl mt-0.5 leading-relaxed">{currentTheme.desc}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">
            Sensors Monitoring: <strong className="text-slate-900 dark:text-white">{activeSensors} Nodes</strong>
          </span>
          <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10">
            Firewall Rules: <strong className="text-indigo-650 dark:text-indigo-300 font-bold">Enforced</strong>
          </span>
        </div>
      </div>

      {/* METRICS CORE STATS BLOCKS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1 */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg p-5 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-xl">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono tracking-wider">Open Alerts</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{openAlertsCount}</p>
            <span className="text-[9px] text-rose-650 dark:text-rose-400 font-mono font-medium">Unmitigated events</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/25 rounded-xl">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg p-5 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-xl">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono tracking-wider">Active Incidents</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{activeIncidentsCount}</p>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-medium">Assigned to PICs</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/25 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* CARD 3 */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg p-5 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-xl">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono tracking-wider">Gateway Bandwidth</span>
            <p className="text-3xl font-extrabold text-indigo-650 dark:text-indigo-400 tracking-tight font-mono leading-none">{networkLoad}%</p>
            <span className="text-[9px] text-slate-550 dark:text-slate-400 font-mono">Network utilization</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/25 rounded-xl">
            <Globe className="h-5 w-5 animate-spin-slow" />
          </div>
        </div>

        {/* CARD 4 */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg p-5 rounded-2xl flex items-center justify-between shadow-sm dark:shadow-xl">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono tracking-wider">Endpoint CPU</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono leading-none">{cpuUsage}%</p>
            <span className="text-[9px] text-slate-550 dark:text-slate-400 font-mono">WAF sandbox nodes</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/25 rounded-xl">
            <Server className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: CHARTS & RADAR SWEEPER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE CHART: ALERTS FREQUENCY OVER TIME */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 lg:col-span-2 shadow-sm dark:shadow-xl text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Threat Signature Frequency</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time alert peaks captured over the past 12 system hours</p>
            </div>
            <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/25">
              Live Interval Updates
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} />
                <XAxis dataKey="time" stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={11} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff', 
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                  labelClassName="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold"
                />
                <Line 
                  type="monotone" 
                  dataKey="Alerts" 
                  stroke={theme === 'dark' ? '#6366f1' : '#4f46e5'} 
                  strokeWidth={3} 
                  dot={{ fill: '#4f46e5', stroke: '#818cf8', r: 4 }} 
                  activeDot={{ r: 8, fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INDIGO RADAR SWEEPER TARGETING SYSTEMS */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-between shadow-sm dark:shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active IDS Node Sweep</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Scanning subnet 10.0.x.x for endpoint abnormalities</p>
          </div>

          <div className="flex items-center justify-center py-2 h-48 relative">
            <canvas ref={radarCanvasRef} className="block rounded-lg max-w-full" />
            <div className="absolute bottom-1 text-[9px] font-mono text-indigo-650 dark:text-indigo-400 flex items-center space-x-1">
              <Zap className="h-2.5 w-2.5 animate-bounce" />
              <span>SCANNING FREQ: 3.5 GHz</span>
            </div>
          </div>

          <div className="text-[11px] bg-slate-100 dark:bg-black/20 p-2.5 border border-slate-250 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="font-mono">Threat telemetry found: <strong className="text-rose-600 dark:text-rose-400">High</strong></span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Angle 094°</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: CONTROLS & SECURITY THREAT TYPES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DYNAMIC PLAYGROUND INJECTOR (THE THREAT SIMULATOR) */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-between shadow-sm dark:shadow-xl">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sliders className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight animate-pulse">Threat Simulator</h3>
            </div>
            <p className="text-[11px] text-slate-650 dark:text-slate-300 leading-normal mb-4">
              MVP testing deck. Click any sensor below to dispatch a mock security incident via WebSockets to our SIEM server instantly. Pushes notifications and alert lists perfectly.
            </p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => simulateIncidentEvent('DDoS')}
              className="w-full flex items-center justify-between p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/20 rounded-xl transition text-xs font-mono group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="h-3 w-3 text-rose-600 dark:text-rose-500 animate-pulse group-hover:scale-125 transition" />
                <span>Simulate DDoS Attack</span>
              </div>
              <span className="bg-rose-900/15 dark:bg-rose-900/60 border border-rose-400/20 text-rose-700 dark:text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-right font-mono">CRITICAL</span>
            </button>

            <button 
              onClick={() => simulateIncidentEvent('SQLi')}
              className="w-full flex items-center justify-between p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 rounded-xl transition text-xs font-mono group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="h-3 w-3 text-amber-600 dark:text-amber-500 group-hover:scale-125 transition" />
                <span>Inject SQL Injection Probe</span>
              </div>
              <span className="bg-amber-905/15 dark:bg-amber-900/60 border border-amber-400/20 text-amber-700 dark:text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono">MEDIUM</span>
            </button>

            <button 
              onClick={() => simulateIncidentEvent('Ransomware')}
              className="w-full flex items-center justify-between p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/20 rounded-xl transition text-xs font-mono group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="h-3 w-3 text-red-650 dark:text-red-500 group-hover:scale-125 transition" />
                <span>Simulate Desktop Encryption</span>
              </div>
              <span className="bg-red-905/15 dark:bg-red-900/70 border border-red-400/20 text-red-700 dark:text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono">CRITICAL</span>
            </button>

            <button 
              onClick={() => simulateIncidentEvent('Phishing')}
              className="w-full flex items-center justify-between p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 rounded-xl transition text-xs font-mono group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Play className="h-3 w-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-125 transition" />
                <span>Inject Spoofed Landing redirect</span>
              </div>
              <span className="bg-emerald-905/15 dark:bg-emerald-950/60 border border-emerald-400/25 text-emerald-700 dark:text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono">LOW</span>
            </button>
          </div>

          <p className="text-[9px] text-slate-450 dark:text-slate-500 text-center mt-3 font-mono">
            *Broadcasting changes to all connected devices.
          </p>
        </div>

        {/* BAR CHART: INCIDENTS BY CATEGORY */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 lg:col-span-2 shadow-sm dark:shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Active Incident Categorization</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 mb-4">Frequency counts of severe issues declared inside SecOps team</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={10} angle={-5} textAnchor="end" height={45} />
                <YAxis stroke={theme === 'dark' ? '#64748b' : '#475569'} fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff', 
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a', 
                    borderRadius: '12px' 
                  }}
                  labelClassName="text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold"
                />
                <Bar dataKey="Incidents" fill={theme === 'dark' ? '#6366f1' : '#4f46e5'} radius={[4, 4, 0, 0]} maxBarSize={30}>
                  <Legend />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT SIEM LOGS TICK STREAM SECTION BRIEF */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Real-Time Core Security Logging Stream</h3>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Showing last 4 transactions</span>
        </div>

        <div className="space-y-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 p-3.5 rounded-2xl max-h-56 overflow-y-auto font-mono backdrop-blur-md">
          {logs.slice(0, 4).map((log) => {
            const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour12: false });
            return (
              <div key={log.id} className="text-xs hover:bg-slate-200/50 dark:hover:bg-white/5 p-1.5 rounded flex items-start space-x-2 border-b border-slate-100 dark:border-white/5 leading-relaxed text-slate-600 dark:text-slate-300 transition duration-150">
                <span className="text-indigo-600 dark:text-indigo-400 shrink-0 select-none font-bold">[{dateStr}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] shrink-0 font-bold font-mono ${
                  log.status === 'Success' ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/20' :
                  log.status === 'Mitigated' ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/20' :
                  log.status === 'Warning' ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/20' :
                  'bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                }`}>
                  {log.status === 'Mitigated' ? 'MITIGATED' : log.status.toUpperCase()}
                </span>
                <span className="text-slate-700 dark:text-slate-400 shrink-0 font-bold">@{log.username}</span>
                <span className="text-indigo-650 dark:text-indigo-300 shrink-0 select-all font-semibold font-mono">[{log.action}]</span>
                <span className="text-slate-800 dark:text-slate-200 truncate flex-1">{log.detail}</span>
                <span className="text-slate-400 dark:text-slate-500 font-mono ml-auto text-[10px] shrink-0 hidden sm:inline">{log.ipAddress}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
