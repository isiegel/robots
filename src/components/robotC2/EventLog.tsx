import { JSX } from 'react';
import { LogEntry } from './types';

interface Props {
  log: LogEntry[];
}

const SEV_CLASS: Record<string, string> = {
  info: 'log-info',
  warning: 'log-warning',
  critical: 'log-critical',
};

const SEV_PREFIX: Record<string, string> = {
  info: '[INFO]',
  warning: '[WARN]',
  critical: '[CRIT]',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export default function EventLog({ log }: Props): JSX.Element {
  return (
    <div className="event-log">
      <div className="panel-section-title">EVENT LOG</div>
      <div className="log-entries">
        {log.map(entry => (
          <div key={entry.id} className={`log-entry ${SEV_CLASS[entry.severity]}`}>
            <span className="log-ts">{fmt(entry.timestamp)}</span>
            <span className="log-sev">{SEV_PREFIX[entry.severity]}</span>
            {entry.robotId && <span className="log-robot">{entry.robotId}</span>}
            <span className="log-msg">{entry.message}</span>
          </div>
        ))}
        {log.length === 0 && (
          <div className="log-entry log-info log-empty">Awaiting events…</div>
        )}
      </div>
    </div>
  );
}
