import { JSX } from 'react';
import { Robot } from './types';

interface Props {
  robots: Map<string, Robot>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'ACTIVE',
  idle: 'IDLE',
  warning: 'WARN',
  offline: 'OFFL',
};

const STATUS_CLASS: Record<string, string> = {
  active: 'status-active',
  idle: 'status-idle',
  warning: 'status-warning',
  offline: 'status-offline',
};

function BatteryBar({ value }: { value: number }): JSX.Element {
  const cls = value < 20 ? 'battery-crit' : value < 40 ? 'battery-low' : 'battery-ok';
  return (
    <div className="battery-track">
      <div className={`battery-fill ${cls}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function SignalDots({ value }: { value: number }): JSX.Element {
  const bars = Math.round((value / 100) * 5);
  return (
    <span className="signal-dots">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`signal-bar ${i <= bars ? 'sig-on' : 'sig-off'}`} />
      ))}
    </span>
  );
}

function RobotCard({ robot, selected, onSelect }: {
  robot: Robot;
  selected: boolean;
  onSelect: () => void;
}): JSX.Element {
  const age = Date.now() - robot.lastUpdated;
  const stale = age > 3000;

  return (
    <div
      className={`robot-card ${selected ? 'robot-card-selected' : ''} ${stale ? 'robot-card-stale' : ''}`}
      onClick={onSelect}
    >
      <div className="robot-card-header">
        <span className="robot-card-name">{robot.name}</span>
        <span className={`status-badge ${STATUS_CLASS[robot.status]}`}>
          {STATUS_LABEL[robot.status]}
        </span>
      </div>

      <div className="robot-card-row">
        <span className="telem-label">MISSION</span>
        <span className="telem-val">{robot.mission.toUpperCase()}</span>
      </div>

      <div className="robot-card-row">
        <span className="telem-label">BATTERY</span>
        <span className="telem-val">{robot.battery.toFixed(0)}%</span>
      </div>
      <BatteryBar value={robot.battery} />

      <div className="robot-card-row" style={{ marginTop: 4 }}>
        <span className="telem-label">SPEED</span>
        <span className="telem-val">{robot.speed.toFixed(1)} m/s</span>
        <span className="telem-label" style={{ marginLeft: 8 }}>HDG</span>
        <span className="telem-val">{robot.heading.toFixed(0)}°</span>
      </div>

      <div className="robot-card-row">
        <span className="telem-label">SIGNAL</span>
        <SignalDots value={robot.signal} />
        <span className="telem-val" style={{ marginLeft: 4 }}>{robot.signal.toFixed(0)}%</span>
      </div>

      <div className="robot-card-row">
        <span className="telem-label">POS</span>
        <span className="telem-val mono-sm">
          {robot.x.toFixed(1)}, {robot.y.toFixed(1)}
        </span>
        {stale && <span className="stale-tag">STALE</span>}
      </div>
    </div>
  );
}

function DetailPanel({ robot }: { robot: Robot }): JSX.Element {
  return (
    <div className="detail-panel">
      <div className="detail-header">SELECTED · {robot.name}</div>
      <table className="detail-table">
        <tbody>
          <tr><td>STATUS</td><td className={STATUS_CLASS[robot.status]}>{robot.status.toUpperCase()}</td></tr>
          <tr><td>MISSION</td><td>{robot.mission.toUpperCase()}</td></tr>
          <tr><td>POSITION</td><td>({robot.x.toFixed(2)}, {robot.y.toFixed(2)})</td></tr>
          <tr><td>HEADING</td><td>{robot.heading.toFixed(1)}°</td></tr>
          <tr><td>SPEED</td><td>{robot.speed.toFixed(2)} m/s</td></tr>
          <tr><td>BATTERY</td><td>{robot.battery.toFixed(1)}%</td></tr>
          <tr><td>SIGNAL</td><td>{robot.signal.toFixed(0)}%</td></tr>
          <tr><td>TRAIL PTS</td><td>{robot.trail.length}</td></tr>
          <tr>
            <td>LAST UPD</td>
            <td>{new Date(robot.lastUpdated).toLocaleTimeString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function TelemetryPanel({ robots, selectedId, onSelect }: Props): JSX.Element {
  const robotList = Array.from(robots.values()).sort((a, b) => a.id.localeCompare(b.id));
  const selected = selectedId ? robots.get(selectedId) : null;

  return (
    <div className="telemetry-panel">
      <div className="panel-section-title">FLEET STATUS</div>
      <div className="robot-card-list">
        {robotList.map(r => (
          <RobotCard
            key={r.id}
            robot={r}
            selected={r.id === selectedId}
            onSelect={() => onSelect(r.id === selectedId ? null : r.id)}
          />
        ))}
      </div>
      {selected && <DetailPanel robot={selected} />}
    </div>
  );
}
