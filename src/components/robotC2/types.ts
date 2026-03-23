export type RobotStatus = 'active' | 'idle' | 'warning' | 'offline';
export type MissionType = 'patrol' | 'survey' | 'standby' | 'intercept';
type Severity = 'info' | 'warning' | 'critical';
type ConnectionStatus = 'connected' | 'disconnected';

export interface Robot {
  id: string;
  name: string;
  x: number; // 0–100 map coordinate
  y: number; // 0–100 map coordinate
  heading: number; // degrees, 0 = north (up)
  speed: number; // m/s
  battery: number; // 0–100
  status: RobotStatus;
  mission: MissionType;
  signal: number; // 0–100
  lastUpdated: number;
  trail: Array<{ x: number; y: number }>;
}

export interface TelemetryMessage {
  type: 'telemetry';
  robotId: string;
  timestamp: number;
  x: number;
  y: number;
  heading: number;
  speed: number;
  battery: number;
  status: RobotStatus;
  signal: number;
}

export interface AlertMessage {
  type: 'alert';
  robotId: string;
  severity: Severity;
  message: string;
  timestamp: number;
}

export interface ConnectionMessage {
  type: 'connection';
  status: ConnectionStatus;
  timestamp: number;
}

export type WSMessage = TelemetryMessage | AlertMessage | ConnectionMessage;

export interface LogEntry {
  id: string;
  timestamp: number;
  robotId?: string;
  severity: Severity;
  message: string;
}

export interface Waypoint {
  x: number;
  y: number;
}
