import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SecurityUser, 
  SecurityAlert, 
  SecurityIncident, 
  ActivityLog, 
  SecurityNotification,
  SecurityRole,
  AlertStatus,
  IncidentStatus
} from '../types';

interface LiveToastType {
  id: string;
  title: string;
  severity: string;
  timestamp: string;
  message: string;
}

interface SecurityContextType {
  currentUser: SecurityUser;
  users: SecurityUser[];
  alerts: SecurityAlert[];
  incidents: SecurityIncident[];
  logs: ActivityLog[];
  notifications: SecurityNotification[];
  systemStatus: 'SAFE' | 'ELEVATED' | 'CRITICAL' | 'ATTACK';
  switchUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'Active' | 'Suspended') => void;
  updateUserRole: (userId: string, role: SecurityRole) => void;
  resolveAlert: (alertId: string, analystNote: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  addAlertNote: (alertId: string, content: string) => void;
  createIncident: (incident: Omit<SecurityIncident, 'id' | 'dateStarted' | 'dateUpdated' | 'timeline' | 'comments'>) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  addIncidentComment: (incidentId: string, content: string) => void;
  addIncidentTimelineEvent: (incidentId: string, action: string, note?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotification: (notificationId: string) => void;
  simulateIncidentEvent: (type: 'DDoS' | 'Phishing' | 'Ransomware' | 'SQLi') => void;
  addAuditLogEntry: (action: string, detail: string, status: 'Success' | 'Mitigated' | 'Warning' | 'Failed', ipAddress?: string) => void;
  loginUser: (username: string) => boolean;
  logoutUser: () => void;
  isLoggedIn: boolean;
  isConnected: boolean;
  liveToast: LiveToastType | null;
  clearLiveToast: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Play dynamic notification chime using Web Audio API
const playNotificationSound = (severity: string) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    if (severity === 'Critical') {
      // Urgent warning sound
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 0.15);
      
      osc2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc2.frequency.exponentialRampToValueAtTime(550, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.61);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.65);
      osc2.stop(audioCtx.currentTime + 0.65);
    } else {
      // High notification beep
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.41);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    }
  } catch (err) {
    console.warn('Audio feedback suppressed on modern browser until user interaction:', err);
  }
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sec_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<SecurityUser>(() => {
    const saved = localStorage.getItem('sec_current_user');
    if (saved) return JSON.parse(saved);
    return {
      id: 'user-1',
      username: 'alex_secops',
      email: 'alex.secops@cyberdefense.com',
      role: 'Admin',
      status: 'Active',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      department: 'Incident Response Team',
      lastActive: 'Just now'
    };
  });

  const [users, setUsers] = useState<SecurityUser[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [systemStatus, setSystemStatus] = useState<'SAFE' | 'ELEVATED' | 'CRITICAL' | 'ATTACK'>('CRITICAL');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveToast, setLiveToast] = useState<LiveToastType | null>(null);

  const clearLiveToast = () => setLiveToast(null);

  // Initialize and Sync via WebSockets + fallback REST fetch
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts);
          setIncidents(data.incidents);
          setLogs(data.logs);
          setNotifications(data.notifications);
          setUsers(data.users);
        }
      } catch (e) {
        console.warn("Could not load backup API state parameters:", e);
      }
    };

    fetchInitialState();

    let socket: WebSocket;
    let reconnectTimer: any;

    const setupWS = () => {
      const isSecure = window.location.protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}`;
      
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
        console.log('Real-time security pipeline established.');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, payload } = message;

          if (type === 'SYNC') {
            setAlerts(payload.alerts);
            setIncidents(payload.incidents);
            setLogs(payload.logs);
            setNotifications(payload.notifications);
            setUsers(payload.users);
          } else if (type === 'UPDATE_STATE') {
            if (payload.alerts) setAlerts(payload.alerts);
            if (payload.incidents) setIncidents(payload.incidents);
            if (payload.logs) setLogs(payload.logs);
            if (payload.notifications) setNotifications(payload.notifications);
            if (payload.users) setUsers(payload.users);
          } else if (type === 'ALERT_CREATED') {
            const { alert, log, notification, alerts: newAlerts, logs: newLogs, notifications: newNotifs } = payload;
            setAlerts(newAlerts);
            setLogs(newLogs);
            setNotifications(newNotifs);

            // Audio + Visual Cues for high severity alert
            if (alert.severity === 'Critical' || alert.severity === 'High') {
              playNotificationSound(alert.severity);
              setLiveToast({
                id: alert.id,
                title: alert.title,
                severity: alert.severity,
                timestamp: alert.timestamp,
                message: alert.description
              });
            }
          }
        } catch (e) {
          console.error("Failed to parse system channel packet:", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("Real-time stream error: ", err);
        socket.close();
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('Security stream disconnected, schedules retry loop...');
        reconnectTimer = setTimeout(setupWS, 3500);
      };
    };

    setupWS();

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  // System status auto derivation
  useEffect(() => {
    const criticalIncidents = incidents.filter(inc => inc.severity === 'Critical' && inc.status !== 'Closed').length;
    const criticalAlerts = alerts.filter(alt => alt.severity === 'Critical' && alt.status === 'New').length;
    const highAlerts = alerts.filter(alt => alt.severity === 'High' && alt.status === 'New').length;

    if (criticalAlerts > 0 || criticalIncidents > 0) {
      setSystemStatus('ATTACK');
    } else if (highAlerts > 1) {
      setSystemStatus('CRITICAL');
    } else if (highAlerts > 0 || alerts.filter(a => a.status === 'New').length > 2) {
      setSystemStatus('ELEVATED');
    } else {
      setSystemStatus('SAFE');
    }
  }, [alerts, incidents]);

  // Auth Cache Local Storage Sync
  useEffect(() => {
    localStorage.setItem('sec_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sec_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Helper REST dispatcher wrapper to make standard API requests
  const apiRequest = async (url: string, method: string, body: any = null) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify({
          ...body,
          username: currentUser?.username,
          role: currentUser?.role
        });
      }
      const res = await fetch(url, options);
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) setAlerts(data.alerts);
        if (data.incidents) setIncidents(data.incidents);
        if (data.logs) setLogs(data.logs);
        if (data.notifications) setNotifications(data.notifications);
        if (data.users) setUsers(data.users);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Network error requesting ${url}:`, e);
      return false;
    }
  };

  // Switch persona identity
  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found && found.status !== 'Suspended') {
      setCurrentUser(found);
      addAuditLogEntry('Internal Delegation Identity Switch', `Analyst switched context views to role ${found.role} (${found.username})`, 'Success');
    }
  };

  // Live Auditing Logs
  const addAuditLogEntry = async (
    action: string, 
    detail: string, 
    status: 'Success' | 'Mitigated' | 'Warning' | 'Failed',
    ipAddress?: string
  ) => {
    const mockLog = {
      timestamp: new Date().toISOString(),
      action,
      detail,
      status,
      ipAddress: ipAddress || '127.0.0.1'
    };
    // REST API call is triggered, websocket broadcasts to sync back in real-time
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mockLog, username: currentUser.username, role: currentUser.role })
      });
    } catch (e) {
      console.warn("Failed to push client audit trace:", e);
    }
  };

  // Authenticate user
  const loginUser = (username: string): boolean => {
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      if (found.status === 'Suspended') {
        return false;
      }
      setCurrentUser(found);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
  };

  const updateUserStatus = (userId: string, status: 'Active' | 'Suspended') => {
    apiRequest(`/api/users/${userId}/status`, 'PUT', { status, activeUsername: currentUser.username, activeRole: currentUser.role });
  };

  const updateUserRole = (userId: string, role: SecurityRole) => {
    apiRequest(`/api/users/${userId}/role`, 'PUT', { role, activeUsername: currentUser.username, activeRole: currentUser.role });
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    apiRequest(`/api/alerts/${alertId}/status`, 'PUT', { status });
  };

  const resolveAlert = (alertId: string, analystNote: string) => {
    apiRequest(`/api/alerts/${alertId}/resolve`, 'POST', { analystNote });
  };

  const addAlertNote = (alertId: string, content: string) => {
    apiRequest(`/api/alerts/${alertId}/notes`, 'POST', { content });
  };

  const createIncident = (incidentData: Omit<SecurityIncident, 'id' | 'dateStarted' | 'dateUpdated' | 'timeline' | 'comments'>) => {
    apiRequest('/api/incidents', 'POST', incidentData);
  };

  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    apiRequest(`/api/incidents/${incidentId}/status`, 'PUT', { status });
  };

  const addIncidentComment = (incidentId: string, content: string) => {
    apiRequest(`/api/incidents/${incidentId}/comments`, 'POST', { content });
  };

  const addIncidentTimelineEvent = (incidentId: string, action: string, note?: string) => {
    apiRequest(`/api/incidents/${incidentId}/timeline`, 'POST', { action, note });
  };

  const markNotificationRead = (notificationId: string) => {
    apiRequest(`/api/notifications/${notificationId}/read`, 'POST');
  };

  const clearNotification = (notificationId: string) => {
    apiRequest(`/api/notifications/${notificationId}`, 'DELETE');
  };

  const simulateIncidentEvent = (type: 'DDoS' | 'Phishing' | 'Ransomware' | 'SQLi') => {
    apiRequest('/api/alerts/simulate', 'POST', { type });
  };

  return (
    <SecurityContext.Provider value={{
      currentUser,
      users,
      alerts,
      incidents,
      logs,
      notifications,
      systemStatus,
      switchUser,
      updateUserStatus,
      updateUserRole,
      resolveAlert,
      updateAlertStatus,
      addAlertNote,
      createIncident,
      updateIncidentStatus,
      addIncidentComment,
      addIncidentTimelineEvent,
      markNotificationRead,
      clearNotification,
      simulateIncidentEvent,
      addAuditLogEntry,
      loginUser,
      logoutUser,
      isLoggedIn,
      isConnected,
      liveToast,
      clearLiveToast
    }}>
      {children}
    </SecurityContext.Provider>
  );
};
