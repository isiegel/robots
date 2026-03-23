import { JSX } from 'react';
import { useRobotTelemetry } from './useRobotTelemetry';
import RobotMap from './RobotMap';
import TelemetryPanel from './TelemetryPanel';
import EventLog from './EventLog';
import './robotC2.css';

function StatusBar({ connected, robotCount }: { connected: boolean; robotCount: number }): JSX.Element {
  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className="c2-logo">&#9632; GROUND FLEET C2</span>
        <span className="status-bar-sep">|</span>
        <span className={`conn-indicator ${connected ? 'conn-on' : 'conn-off'}`}>
          <span className="conn-dot" />
          {connected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
        <span className="status-bar-sep">|</span>
        <span className="status-bar-stat">
          WS: <span className="stat-val">ws://fleet-ctrl/telemetry</span>
        </span>
      </div>
      <div className="status-bar-right">
        <span className="status-bar-stat">
          UNITS: <span className="stat-val">{robotCount}</span>
        </span>
        <span className="status-bar-sep">|</span>
        <span className="status-bar-stat">
          UTC: <span className="stat-val mono-sm">{now}</span>
        </span>
      </div>
    </div>
  );
}

function FleetSummary({ robots }: { robots: Map<string, import('./types').Robot> }): JSX.Element {
  const list = Array.from(robots.values());
  const counts = {
    active: list.filter(r => r.status === 'active').length,
    idle: list.filter(r => r.status === 'idle').length,
    warning: list.filter(r => r.status === 'warning').length,
    offline: list.filter(r => r.status === 'offline').length,
  };

  return (
    <div className="fleet-summary">
      <span className="summary-chip chip-active">ACT {counts.active}</span>
      <span className="summary-chip chip-idle">IDL {counts.idle}</span>
      <span className="summary-chip chip-warning">WRN {counts.warning}</span>
      <span className="summary-chip chip-offline">OFF {counts.offline}</span>
    </div>
  );
}

export default function RobotC2(): JSX.Element {
  const { connected, robots, log, selectedId, setSelectedId } = useRobotTelemetry();

  return (
    <div className="c2-root">
      <StatusBar connected={connected} robotCount={robots.size} />
      <FleetSummary robots={robots} />

      <div className="c2-body">
        <div className="c2-map-pane">
          <RobotMap
            robots={robots}
            selectedId={selectedId}
            onSelectRobot={setSelectedId}
          />
        </div>
        <div className="c2-side-pane">
          <TelemetryPanel
            robots={robots}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      <EventLog log={log} />
    </div>
  );
}
