import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

// Seed Data
let users = [
  {
    id: 'user-1',
    username: 'alex_secops',
    email: 'alex.secops@cyberdefense.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    department: 'Incident Response Team',
    lastActive: 'Just now'
  },
  {
    id: 'user-2',
    username: 'sarah_analyst',
    email: 'sarah.l@cyberdefense.com',
    role: 'Analyst',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    department: 'Security Operations Center (SOC)',
    lastActive: '5 minutes ago'
  },
  {
    id: 'user-3',
    username: 'marcus_auditor',
    email: 'marcus.v@cyberdefense.com',
    role: 'Auditor',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
    department: 'Compliance & Audit',
    lastActive: '2 hours ago'
  },
  {
    id: 'user-4',
    username: 'guest_viewer',
    email: 'internal.guest@cyberdefense.com',
    role: 'Viewer',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    department: 'Technical Management',
    lastActive: 'Recently'
  },
  {
    id: 'user-5',
    username: 'rogue_test',
    email: 'rogue.acc@unauthorized.com',
    role: 'Viewer',
    status: 'Suspended',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    department: 'Sandbox',
    lastActive: '3 days ago'
  }
];

let alerts = [
  {
    id: 'ALT-101',
    title: 'Multiple SSH Brute Force Attempts',
    category: 'Authentication',
    description: 'An external IP address was detected attempting to connect to production SSH bastion on port 22 with multiple invalid username-password combinations.',
    severity: 'High',
    status: 'New',
    targetedAsset: 'Bastion-Host-Prod-01',
    sourceIp: '198.51.100.42',
    destIp: '10.0.1.15',
    timestamp: '2026-06-18T06:45:00-07:00',
    count: 142,
    triggerRule: 'AUTH_FAILED_LIMIT_EXCEEDED_10M',
    remediationSteps: [
      'Null-route/block the source IP on Cloud Firewall (FW-PROD-EDGE).',
      'Verify that SSH password authentication is disabled and only SSH-key auth is active.',
      'Check if any login attempts succeeded from associated subnets.'
    ],
    notes: [
      {
        id: 'n1',
        author: 'sarah_analyst',
        timestamp: '2026-06-18T06:55:00-07:00',
        content: 'Source IP matches known malicious proxy pools in Threat Intelligence Feed. Preparing IP lock block.'
      }
    ]
  },
  {
    id: 'ALT-102',
    title: 'SQL Injection Pattern Detected',
    category: 'Web Application Security',
    description: 'Web application firewall (WAF) flagged incoming payload on public endpoint /api/users/profile containing SQL UNION SELECT query clauses.',
    severity: 'Critical',
    status: 'Investigating',
    targetedAsset: 'E-Commerce-Frontend-API',
    sourceIp: '203.0.113.88',
    destIp: '10.0.5.200',
    timestamp: '2026-06-18T06:12:15-07:00',
    count: 36,
    triggerRule: 'WAF_SQLI_RULE_BLOCKED_HTTP_UA',
    remediationSteps: [
      'Confirm the query was successfully blocked by Cloud Armor/WAF.',
      'Perform a code auditing review on the SQL statement parameterized queries in the profile module.',
      'Examine SQL server logs around 06:12 AM to guarantee no tables were leaked.'
    ],
    notes: []
  },
  {
    id: 'ALT-103',
    title: 'Anomalous Data Exfiltration',
    category: 'Data Protection',
    description: 'An internal client host exported 12.4 GB of compressed archive data to a consumer cloud file storage server (MegaUpload) in less than 5 minutes.',
    severity: 'Critical',
    status: 'New',
    targetedAsset: 'Finance-Workstation-12',
    sourceIp: '10.2.40.82',
    destIp: '185.22.45.101',
    timestamp: '2026-06-18T05:30:00-07:00',
    count: 1,
    triggerRule: 'DLP_ANOMALOUS_OUTBOUND_DATA_SIZE',
    remediationSteps: [
      'Quarantine host finance-workstation-12 immediately using CrowdStrike endpoint agent.',
      'Contact User assigned to the Finance Workstation to investigate if the action was intentional and pre-approved.',
      'Conduct local disk forensic log analysis for file access operations.'
    ],
    notes: [
      {
        id: 'n2',
        author: 'alex_secops',
        timestamp: '2026-06-18T05:45:00-07:00',
        content: 'Quarantine trigger command issued to Endpoint Security framework. Active connection is terminated.'
      }
    ]
  },
  {
    id: 'ALT-104',
    title: 'Unsigned Kernel Driver Loaded',
    category: 'Endpoint Integrity',
    description: 'Endpoint Detection and Response (EDR) detected an installation of a third-party kernel driver lacking a valid Microsoft WHQL digital signature.',
    severity: 'Medium',
    status: 'Resolved',
    targetedAsset: 'K8s-Node-Worker-04',
    sourceIp: 'Internal Client',
    destIp: 'Kernel Space',
    timestamp: '2026-06-18T03:02:40-07:00',
    count: 1,
    triggerRule: 'OS_UNSIGNED_DRIVER_ALERT',
    remediationSteps: [
      'Investigate developer deployment history to see if debug configurations were applied.',
      'Uninstall driver and roll back cluster node machine.'
    ],
    notes: [
      {
        id: 'n3',
        author: 'sarah_analyst',
        timestamp: '2026-06-18T04:10:00-07:00',
        content: 'Deployment team confirmed it was an accidental dev test deployment of custom hypervisor tools. Driver removed and server cluster recycled.'
      }
    ]
  },
  {
    id: 'ALT-105',
    title: 'AWS RAM Cryptomining Traffic',
    category: 'Threat Intel / DNS',
    description: 'Internal DNS resolution requests found lookup attempts targeting pool.supportxmr.com associated with Monero cryptocurrency mining protocols.',
    severity: 'High',
    status: 'Suppressed',
    targetedAsset: 'AWS-EKS-Dev-Pod-91',
    sourceIp: '10.200.1.4',
    destIp: '51.15.54.102',
    timestamp: '2026-06-17T22:15:00-07:00',
    count: 812,
    triggerRule: 'DNS_MALICIOUS_DOMAIN_RESO',
    remediationSteps: [
      'Terminate rogue daemonset on dev namespace.',
      'Inspect docker container logs for external cron schedule leaks.'
    ],
    notes: [
      {
        id: 'n4',
        author: 'alex_secops',
        timestamp: '2026-06-17T23:00:00-07:00',
        content: 'Sandbox development pod cleared. Safe to suppress. False positive in deployment container scripts.'
      }
    ]
  },
  {
    id: 'ALT-106',
    title: 'Phishing Redirect Link Sent',
    category: 'Email Gateway Security',
    description: 'Inbound corporate email intercepted containing web redirection links mimicking standard corporate login but routing to a domain hosted in a low-trust registry.',
    severity: 'Low',
    status: 'Resolved',
    targetedAsset: 'Corporate Mail Exchange',
    sourceIp: '80.24.110.155',
    destIp: 'Mailboxes (25 Users)',
    timestamp: '2026-06-17T18:00:00-07:00',
    count: 25,
    triggerRule: 'EMAIL_PHISHING_MALICIOUS_LINK',
    remediationSteps: [
      'Purge mail message from all matching mailbox environments.',
      'Trigger security warning banner on remaining targeted users.'
    ],
    notes: []
  }
];

let incidents = [
  {
    id: 'INC-201',
    title: 'SQL Injection Exploitation Attempt on Gateway API',
    category: 'Data Breach Risk',
    description: 'Escalation of ALT-102. WAF blocks failed with 403, but database log correlation indicated unexpected blind timing query patterns in PostgreSQL telemetry. Investigating potential schema leaks.',
    severity: 'Critical',
    status: 'Open',
    pic: 'sarah_analyst',
    dateStarted: '2026-06-18T06:12:15-07:00',
    dateUpdated: '2026-06-18T06:55:00-07:00',
    timeline: [
      {
        id: 'tl1',
        timestamp: '2026-06-18T06:12:15-07:00',
        actor: 'sarah_analyst',
        role: 'Analyst',
        action: 'Incident Created from Alert-ALT-102',
        note: 'Escalated because raw database metrics show elevated response delays indicative of blind injection exploitation.'
      },
      {
        id: 'tl2',
        timestamp: '2026-06-18T06:25:00-07:00',
        actor: 'alex_secops',
        role: 'Admin',
        action: 'WAF Rule Enforced Globally',
        note: 'WAF strict rule set activated for all profile API paths. Source IP 203.0.113.88 banned at firewall level.'
      },
      {
        id: 'tl3',
        timestamp: '2026-06-18T06:40:00-07:00',
        actor: 'sarah_analyst',
        role: 'Analyst',
        action: 'Database Audit Triggered',
        note: 'Executing query analysis on PostgreSQL master log to check if tables were returned.'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'sarah_analyst',
        role: 'Analyst',
        timestamp: '2026-06-18T06:30:00-07:00',
        content: 'Banned IPs are showing up in additional botnet telemetry feeds. We need to screen our /api/users endpoint closely.'
      },
      {
        id: 'c2',
        author: 'alex_secops',
        role: 'Admin',
        timestamp: '2026-06-18T06:45:00-07:00',
        content: 'Agreed. Verified that the profile tables have no sensitive data leakage based on database error triggers. Let\'s continue monitoring the audit query results.'
      }
    ]
  },
  {
    id: 'INC-202',
    title: 'Financial Host Anomalous High Transfer Containment',
    category: 'Unauthorized Data Transfer',
    description: 'Escalation of ALT-103. Finance User workstation observed exporting archives to MegaUpload. Initiated containment of host work machine to examine whether active command-and-control (C2) or insider threat is present.',
    severity: 'High',
    status: 'Containing',
    pic: 'alex_secops',
    dateStarted: '2026-06-18T05:30:00-07:00',
    dateUpdated: '2026-06-18T06:05:00-07:00',
    timeline: [
      {
        id: 'tl4',
        timestamp: '2026-06-18T05:30:00-07:00',
        actor: 'System Auto-Escalator',
        role: 'Admin',
        action: 'Incident Auto-Generated',
        note: 'Severe outbound trigger on Finance department workstation.'
      },
      {
        id: 'tl5',
        timestamp: '2026-06-18T05:42:00-07:00',
        actor: 'alex_secops',
        role: 'Admin',
        action: 'Endpoint Quarantine Initiated',
        note: 'CrowdStrike quarantine API fired. Host is disconnected from internet and internal LAN except to control endpoint server.'
      }
    ],
    comments: [
      {
        id: 'c3',
        author: 'alex_secops',
        role: 'Admin',
        timestamp: '2026-06-18T05:50:00-07:00',
        content: 'Contacted user via secondary channel (Slack/phone). User states they were backing up local personal archives because their hard disk reported block issues. Checking actual file hashes to verify lack of PII or financial balance sheets.'
      }
    ]
  },
  {
    id: 'INC-203',
    title: 'Malicious Office Macro Malware Beacon',
    category: 'Endpoint Compromise',
    description: 'Spotted suspicious PowerShell spawning under WINWORD.exe on legal workspace node. Outbound connection attempted to dynamically mapped fast-flux command and control host.',
    severity: 'High',
    status: 'Closed',
    pic: 'sarah_analyst',
    dateStarted: '2026-06-16T12:05:00-07:00',
    dateUpdated: '2026-06-17T11:45:00-07:00',
    timeline: [
      {
        id: 'tl6',
        timestamp: '2026-06-16T12:10:00-07:00',
        actor: 'sarah_analyst',
        role: 'Analyst',
        action: 'Asset Quarantined',
        note: 'Isolated Legal-Workstation-02.'
      },
      {
        id: 'tl7',
        timestamp: '2026-06-16T16:00:00-07:00',
        actor: 'sarah_analyst',
        role: 'Analyst',
        action: 'Malware Excluded & Cleaned',
        note: 'EDR cleanup engine purged rogue Temp directories and cleared local registry run keys.'
      },
      {
        id: 'tl8',
        timestamp: '2026-06-17T11:45:00-07:00',
        actor: 'sarah_analyst',
        role: 'Analyst',
        action: 'Incident Closed',
        note: 'Verified clean telemetry for 18 hours. Endpoint returned to operation with security policy warning.'
      }
    ],
    comments: [
      {
        id: 'c4',
        author: 'sarah_analyst',
        role: 'Analyst',
        timestamp: '2026-06-16T14:30:00-07:00',
        content: 'Macro payload analyzed. Standard commodity banking trojan delivery trying to look like invoices.'
      }
    ]
  }
];

let logs = [
  {
    id: 'LOG-901',
    timestamp: '2026-06-18T07:01:10-07:00',
    username: 'alex_secops',
    role: 'Admin',
    action: 'User Authentication',
    detail: 'Successful MFA session login to console',
    status: 'Success',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG-902',
    timestamp: '2026-06-18T06:55:00-07:00',
    username: 'sarah_analyst',
    role: 'Analyst',
    action: 'Alert Update',
    detail: 'Added investigator note on ALT-101 brute force alert',
    status: 'Success',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'LOG-903',
    timestamp: '2026-06-18T06:40:00-07:00',
    username: 'sarah_analyst',
    role: 'Analyst',
    action: 'Incident Escalation',
    detail: 'Escalated SQLi alert ALT-102 into system incident INC-201',
    status: 'Success',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'LOG-904',
    timestamp: '2026-06-18T06:12:15-07:00',
    username: 'System Automated Guard',
    role: 'Admin',
    action: 'Threat Detection',
    detail: 'WAF SQLi block rule evaluated on api profile path',
    status: 'Mitigated',
    ipAddress: '203.0.113.88'
  },
  {
    id: 'LOG-905',
    timestamp: '2026-06-18T05:42:00-07:00',
    username: 'alex_secops',
    role: 'Admin',
    action: 'Target Mitigate Command',
    detail: 'Quarantine issued for Asset ID: Finance-Workstation-12 via EDR platform',
    status: 'Success',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG-906',
    timestamp: '2026-06-18T05:31:00-07:00',
    username: 'System Automated Guard',
    role: 'Admin',
    action: 'Threat Detection',
    detail: 'DLP limit breach: 12.4 GB transferred from finance-workstation-12',
    status: 'Warning',
    ipAddress: '10.2.40.82'
  },
  {
    id: 'LOG-907',
    timestamp: '2026-06-18T04:30:12-07:00',
    username: 'marcus_auditor',
    role: 'Auditor',
    action: 'Audit Log Export Attempt',
    detail: 'Searched compliance reports for Q2 financial access trail',
    status: 'Success',
    ipAddress: '192.168.12.15'
  },
  {
    id: 'LOG-908',
    timestamp: '2026-06-18T03:55:00-07:00',
    username: 'guest_viewer',
    role: 'Viewer',
    action: 'Unregistered Command Execute',
    detail: 'Attempted to perform admin write operation on setting toggles',
    status: 'Failed',
    ipAddress: '10.50.4.12'
  }
];

let notifications = [
  {
    id: 'N-301',
    title: 'New High Severity Alert',
    message: 'Multiple SSH Brute Force attempts detected on Bastion host (ALT-101)',
    timestamp: '2026-06-18T06:45:00-07:00',
    severity: 'High',
    isRead: false,
    alertId: 'ALT-101'
  },
  {
    id: 'N-302',
    title: 'Incident Escalated',
    message: 'Sarah escalated SQL Injection vulnerability attempt into Incident INC-201',
    timestamp: '2026-06-18T06:12:15-07:00',
    severity: 'Critical',
    isRead: false,
    incidentId: 'INC-201'
  },
  {
    id: 'N-303',
    title: 'DLP System Trigger',
    message: 'Anomalous Data Exfiltration detected from Finance Workstation (ALT-103)',
    timestamp: '2026-06-18T05:30:00-07:00',
    severity: 'Critical',
    isRead: true,
    alertId: 'ALT-103'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Web Socket connections set
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // Helper to send messages to all clients
  function broadcast(type: string, payload: any) {
    const data = JSON.stringify({ type, payload });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  wss.on('connection', (ws) => {
    console.log('Client connected to real-time security stream');
    // Send current states as sync
    ws.send(JSON.stringify({
      type: 'SYNC',
      payload: {
        alerts,
        incidents,
        logs,
        notifications,
        users
      }
    }));
  });

  // REST API Routes
  app.get('/api/state', (req, res) => {
    res.json({ alerts, incidents, logs, notifications, users });
  });

  app.get('/api/alerts', (req, res) => {
    res.json(alerts);
  });

  // REST endpoints that update state
  app.put('/api/alerts/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, username, role } = req.body;
    let updated = false;

    alerts = alerts.map(a => {
      if (a.id === id) {
        updated = true;
        return { ...a, status };
      }
      return a;
    });

    if (updated) {
      // Add audit log
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp: new Date().toISOString(),
        username: username || 'System',
        role: role || 'Analyst',
        action: 'Alert State Change',
        detail: `Alert ${id} transitioned to ${status}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { alerts, logs });
      res.json({ success: true, alerts, logs });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  app.post('/api/alerts/:id/resolve', (req, res) => {
    const { id } = req.params;
    const { analystNote, username, role } = req.body;
    let resolved = false;

    alerts = alerts.map(a => {
      if (a.id === id) {
        resolved = true;
        const noteId = `n-${Date.now()}`;
        const newNotes = analystNote ? [
          ...a.notes,
          {
            id: noteId,
            author: username || 'System',
            timestamp: new Date().toISOString(),
            content: analystNote
          }
        ] : a.notes;
        return {
          ...a,
          status: 'Resolved',
          notes: newNotes
        };
      }
      return a;
    });

    if (resolved) {
      // Add audit log
      const logId = `LOG-${900 + logs.length + 1}`;
      const newLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        username: username || 'System',
        role: role || 'Analyst',
        action: 'Alert Remediation',
        detail: `Alert ${id} resolved. Closing remediation checklist.`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      // Add notification
      const newNotif = {
        id: `N-${Date.now()}`,
        title: 'Alert Remediated Successfully',
        message: `Alert ${id} has been resolved by ${username || 'System'}. Threat mitigated.`,
        timestamp: new Date().toISOString(),
        severity: 'Info',
        isRead: false,
        alertId: id
      };
      notifications = [newNotif, ...notifications];

      broadcast('UPDATE_STATE', { alerts, logs, notifications });
      res.json({ success: true, alerts, logs, notifications });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  app.post('/api/alerts/:id/notes', (req, res) => {
    const { id } = req.params;
    const { content, username, role } = req.body;
    let updated = false;

    alerts = alerts.map(a => {
      if (a.id === id) {
        updated = true;
        return {
          ...a,
          notes: [
            ...a.notes,
            {
              id: `n-${Date.now()}`,
              author: username || 'System',
              timestamp: new Date().toISOString(),
              content
            }
          ]
        };
      }
      return a;
    });

    if (updated) {
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp: new Date().toISOString(),
        username: username || 'System',
        role: role || 'Analyst',
        action: 'Telemetry Investigation Comment',
        detail: `Appended analyst annotation on threat alert ${id}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { alerts, logs });
      res.json({ success: true, alerts, logs });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  app.post('/api/incidents', (req, res) => {
    const incidentData = req.body;
    const newId = `INC-${200 + incidents.length + 1}`;
    const timestamp = new Date().toISOString();

    const newIncident = {
      ...incidentData,
      id: newId,
      dateStarted: timestamp,
      dateUpdated: timestamp,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp,
          actor: incidentData.username || 'System',
          role: incidentData.role || 'Analyst',
          action: 'Incident Created Interactively',
          note: incidentData.description
        }
      ],
      comments: []
    };

    incidents = [newIncident, ...incidents];

    const newLog = {
      id: `LOG-${900 + logs.length + 1}`,
      timestamp,
      username: incidentData.username || 'System',
      role: incidentData.role || 'Analyst',
      action: 'Incident Creation Event',
      detail: `Critical security incident ${newId} declared by ${incidentData.username || 'System'}`,
      status: 'Warning' as const,
      ipAddress: '127.0.0.1'
    };
    logs = [newLog, ...logs];

    const newNotif = {
      id: `N-${Date.now()}`,
      title: 'New Severe Incident Raised',
      message: `${newId}: ${incidentData.title} was registered to status: Open.`,
      timestamp,
      severity: incidentData.severity === 'Critical' ? 'Critical' : 'High',
      isRead: false,
      incidentId: newId
    };
    notifications = [newNotif, ...notifications];

    broadcast('UPDATE_STATE', { incidents, logs, notifications });
    res.json({ success: true, incidents, logs, notifications });
  });

  app.put('/api/incidents/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, username, role } = req.body;
    const timestamp = new Date().toISOString();
    let updated = false;

    incidents = incidents.map(inc => {
      if (inc.id === id) {
        updated = true;
        return {
          ...inc,
          status,
          dateUpdated: timestamp,
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              actor: username || 'System',
              role: role || 'Analyst',
              action: `Status change: ${status}`,
              note: `Incident status updated to ${status}`
            }
          ]
        };
      }
      return inc;
    });

    if (updated) {
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: username || 'System',
        role: role || 'Admin',
        action: 'Incident Lifecycle Shift',
        detail: `Incident ${id} set to state: ${status}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { incidents, logs });
      res.json({ success: true, incidents, logs });
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  });

  app.post('/api/incidents/:id/comments', (req, res) => {
    const { id } = req.params;
    const { content, username, role } = req.body;
    const timestamp = new Date().toISOString();
    let updated = false;

    incidents = incidents.map(inc => {
      if (inc.id === id) {
        updated = true;
        return {
          ...inc,
          comments: [
            ...inc.comments,
            {
              id: `comm-${Date.now()}`,
              author: username || 'System',
              role: role || 'Analyst',
              timestamp,
              content
            }
          ]
        };
      }
      return inc;
    });

    if (updated) {
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: username || 'System',
        role: role || 'Analyst',
        action: 'Incident Comment Added',
        detail: `User commented on incident record ${id}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { incidents, logs });
      res.json({ success: true, incidents, logs });
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  });

  app.post('/api/incidents/:id/timeline', (req, res) => {
    const { id } = req.params;
    const { action, note, username, role } = req.body;
    const timestamp = new Date().toISOString();
    let updated = false;

    incidents = incidents.map(inc => {
      if (inc.id === id) {
        updated = true;
        return {
          ...inc,
          dateUpdated: timestamp,
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp,
              actor: username || 'System',
              role: role || 'Analyst',
              action,
              note
            }
          ]
        };
      }
      return inc;
    });

    if (updated) {
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: username || 'System',
        role: role || 'Analyst',
        action: 'Incident Timeline Entry',
        detail: `Extended incident ${id} activity journal`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { incidents, logs });
      res.json({ success: true, incidents, logs });
    } else {
      res.status(404).json({ error: 'Incident not found' });
    }
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const { id } = req.params;
    let updated = false;

    notifications = notifications.map(n => {
      if (n.id === id) {
        updated = true;
        return { ...n, isRead: true };
      }
      return n;
    });

    if (updated) {
      broadcast('UPDATE_STATE', { notifications });
      res.json({ success: true, notifications });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  });

  app.delete('/api/notifications/:id', (req, res) => {
    const { id } = req.params;
    notifications = notifications.filter(n => n.id !== id);

    broadcast('UPDATE_STATE', { notifications });
    res.json({ success: true, notifications });
  });

  app.put('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, activeUsername, activeRole } = req.body;
    let updated = false;

    users = users.map(u => {
      if (u.id === id) {
        updated = true;
        return { ...u, status };
      }
      return u;
    });

    if (updated) {
      const targetUser = users.find(u => u.id === id);
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp: new Date().toISOString(),
        username: activeUsername || 'System',
        role: activeRole || 'Admin',
        action: 'Access Governance Revision',
        detail: `Set account status for ${targetUser?.username || id} to ${status}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { users, logs });
      res.json({ success: true, users, logs });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.put('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role: newRole, activeUsername, activeRole } = req.body;
    let updated = false;

    users = users.map(u => {
      if (u.id === id) {
        updated = true;
        return { ...u, role: newRole };
      }
      return u;
    });

    if (updated) {
      const targetUser = users.find(u => u.id === id);
      const newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp: new Date().toISOString(),
        username: activeUsername || 'System',
        role: activeRole || 'Admin',
        action: 'Auth Privilege Moderation',
        detail: `Assigned user role ${newRole} to ${targetUser?.username || id}`,
        status: 'Success' as const,
        ipAddress: '127.0.0.1'
      };
      logs = [newLog, ...logs];

      broadcast('UPDATE_STATE', { users, logs });
      res.json({ success: true, users, logs });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/alerts/simulate', (req, res) => {
    const { type, username, role } = req.body;
    const timestamp = new Date().toISOString();
    const alertId = `ALT-${100 + alerts.length + 1}`;

    let newAlert: any = null;
    let newNotif: any = null;
    let newLog: any = null;

    if (type === 'DDoS') {
      newAlert = {
        id: alertId,
        title: 'DDoS Threat: Bandwidth Overload Alert',
        category: 'Network Intrusion',
        description: 'An immense burst of concurrent HTTP GET flood traffic detected from decentralized IP botnets targeting key proxy server nodes causing high memory spikes (94%).',
        severity: 'Critical',
        status: 'New',
        targetedAsset: 'Core-Reverse-Proxy-LB',
        sourceIp: 'Decentralized Botnet (850+ Nodes)',
        destIp: '10.0.0.100',
        timestamp,
        count: 12500,
        triggerRule: 'NET_FLOOD_LIMIT_50K_RPS',
        remediationSteps: [
          'Enable Cloud Armor adaptive ratelimit-scrubbing.',
          'Reroute traffic through Cloudflare Advanced DDoS Protection layer.',
          'Quarantine unresponsive docker hosts and recycle deployment pods.'
        ],
        notes: []
      };

      newNotif = {
        id: `N-${Date.now()}`,
        title: 'CRITICAL DDoS Threat Registered',
        message: 'Inbound requests reached peak limits (12,500 req/s). Threat active on CDN Gateway.',
        timestamp,
        severity: 'Critical',
        isRead: false,
        alertId
      };

      newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: 'System IDS Sensor',
        role: 'Admin',
        action: 'Threat Detection Triggered',
        detail: 'Automatic DDoS signature triggered (50,000 queries per sec limit)',
        status: 'Warning',
        ipAddress: '10.0.0.100'
      };
    } else if (type === 'Phishing') {
      newAlert = {
        id: alertId,
        title: 'Phishing Campaign: Spoofed Identity Domain',
        category: 'Email Security',
        description: 'Incoming emails pretending to be Google HR Payroll portal was intercepted. Domains resolved to spoofed address: google-rewards-hr-verification.hk.',
        severity: 'Low',
        status: 'New',
        targetedAsset: 'Enterprise Mail Gateways',
        sourceIp: '91.240.118.52',
        destIp: 'Internal Employees',
        timestamp,
        count: 14,
        triggerRule: 'MAIL_SPOOFED_MX_RECORD',
        remediationSteps: [
          'Add domain *.google-rewards-hr-verification.hk to global email sender blacklist.',
          'Alert active recipients to bypass links and report via phishing helper add-on.'
        ],
        notes: []
      };

      newNotif = {
        id: `N-${Date.now()}`,
        title: 'Phishing Campaign Blocked',
        message: 'Interdicted phishing flow trying to bypass SPF protection records.',
        timestamp,
        severity: 'Low',
        isRead: false,
        alertId
      };

      newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: 'Email Protection Gateway',
        role: 'Analyst',
        action: 'Spam Filtering Intercept',
        detail: 'Intercepted DNS-spoofed corporate redirect linkages',
        status: 'Mitigated',
        ipAddress: '91.240.118.52'
      };
    } else if (type === 'Ransomware') {
      newAlert = {
        id: alertId,
        title: 'EICAR Test/Ransomware Signature Detected',
        category: 'Endpoint Intrusion',
        description: 'A host terminal triggered EDR protection for active ransomware file locking entropy spikes. Suspicious activity spotted of heavy mass encryption (.locked formats).',
        severity: 'Critical',
        status: 'New',
        targetedAsset: 'R&D-Desktop-Windows-05',
        sourceIp: 'Internal LAN / Host',
        destIp: 'Local DFS Directories',
        timestamp,
        count: 1,
        triggerRule: 'DISK_ENTROPY_ENCRYPTION_SPIKE',
        remediationSteps: [
          'Shutdown K8s node workstation immediately.',
          'Revert directory file shares to shadow copies from 04:00 snapshot state.',
          'Carry out full malware isolation check.'
        ],
        notes: []
      };

      newNotif = {
        id: `N-${Date.now()}`,
        title: 'MALICIOUS RANSOMWARE SIGNATURE',
        message: 'Disk entropy limit surpassed. Active isolation workflow initialized for R&D-Desktop-Windows-05.',
        timestamp,
        severity: 'Critical',
        isRead: false,
        alertId
      };

      newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: 'Sentinel Agent EDR',
        role: 'Admin',
        action: 'Process Kill Activity',
        detail: 'Ransomware process suspended successfully via automatic heuristics engine',
        status: 'Mitigated',
        ipAddress: '127.0.0.1'
      };
    } else if (type === 'SQLi') {
      newAlert = {
        id: alertId,
        title: 'WAF Block: SQL Union Injection Probe',
        category: 'Web Application Security',
        description: 'Repeated attacks caught from distributed IPs probing database error variables on profile listings.',
        severity: 'Medium',
        status: 'New',
        targetedAsset: 'API Gateway Proxy Prod',
        sourceIp: '185.120.44.15',
        destIp: '172.16.100.8',
        timestamp,
        count: 73,
        triggerRule: 'WAF_SQL_UNION_SIGNATURE',
        remediationSteps: [
          'Verify backend node application parses inputs with proper validation constraints.',
          'Review error output responses of Postgres; confirm stack traces are disabled in prod configurations.'
        ],
        notes: []
      };

      newNotif = {
        id: `N-${Date.now()}`,
        title: 'Web Application Probe Logged',
        message: 'WAF suppressed SQL injection scanner payloads from IP 185.120.44.15.',
        timestamp,
        severity: 'Medium',
        isRead: false,
        alertId
      };

      newLog = {
        id: `LOG-${900 + logs.length + 1}`,
        timestamp,
        username: 'Defense WAF Guard',
        role: 'Analyst',
        action: 'Threat Probe Deflection',
        detail: 'SQL Injection signatures successfully rejected under response code 400',
        status: 'Mitigated',
        ipAddress: '185.120.44.15'
      };
    }

    if (newAlert) {
      alerts = [newAlert, ...alerts];
      notifications = [newNotif, ...notifications];
      logs = [newLog, ...logs];

      broadcast('ALERT_CREATED', { alert: newAlert, log: newLog, notification: newNotif, alerts, logs, notifications });
      res.json({ success: true, alerts, logs, notifications });
    } else {
      res.status(400).json({ error: 'Invalid simulator type' });
    }
  });

  // Serve static files and handle Vite mounting
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SecOps server running on http://localhost:${PORT}`);
  });
}

startServer();
