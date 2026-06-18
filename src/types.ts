export type SecurityRole = 'Admin' | 'Analyst' | 'Auditor' | 'Viewer';

export interface SecurityUser {
  id: string;
  username: string;
  email: string;
  role: SecurityRole;
  status: 'Active' | 'Suspended';
  avatarUrl: string;
  department: string;
  lastActive: string;
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'New' | 'Investigating' | 'Resolved' | 'Suppressed';

export interface AlertNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  targetedAsset: string;
  sourceIp: string;
  destIp: string;
  timestamp: string;
  count: number;
  triggerRule: string;
  remediationSteps: string[];
  notes: AlertNote[];
}

export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Open' | 'Containing' | 'Eradicated' | 'Recovering' | 'Closed';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: SecurityRole;
  action: string;
  note?: string;
}

export interface IncidentComment {
  id: string;
  author: string;
  role: SecurityRole;
  timestamp: string;
  content: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  pic: string; // User ID or username
  dateStarted: string;
  dateUpdated: string;
  timeline: IncidentTimelineEvent[];
  comments: IncidentComment[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  role: SecurityRole;
  action: string;
  detail: string;
  status: 'Success' | 'Mitigated' | 'Warning' | 'Failed';
  ipAddress: string;
}

export interface SecurityNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: AlertSeverity | 'Info';
  isRead: boolean;
  alertId?: string;
  incidentId?: string;
}
