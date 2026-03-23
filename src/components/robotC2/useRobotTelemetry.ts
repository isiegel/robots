import { useEffect, useRef, useState, useCallback } from 'react';
import { Robot, LogEntry, WSMessage } from './types';
import { MockWebSocket } from './mockWebSocket';

const WS_URL = 'ws://localhost:8765/telemetry';
const MAX_LOG = 60;

export interface TelemetryState {
  connected: boolean;
  robots: Map<string, Robot>;
  log: LogEntry[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export function useRobotTelemetry(): TelemetryState {
  const [connected, setConnected] = useState(false);
  const [robots, setRobots] = useState<Map<string, Robot>>(new Map());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wsRef = useRef<MockWebSocket | null>(null);

  const appendLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLog(prev => [
      { ...entry, id: `${entry.timestamp}-${Math.random().toString(36).slice(2)}` },
      ...prev,
    ].slice(0, MAX_LOG));
  }, []);

  useEffect(() => {
    const ws = new MockWebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Seed initial robot state from simulator
      const initial = ws.getInitialRobots();
      setRobots(new Map(initial.map(r => [r.id, r])));
      appendLog({ timestamp: Date.now(), severity: 'info', message: 'WebSocket connected to fleet controller' });
    };

    ws.onclose = () => {
      setConnected(false);
      appendLog({ timestamp: Date.now(), severity: 'warning', message: 'WebSocket connection closed' });
    };

    ws.onmessage = (event: { data: string }) => {
      let msg: WSMessage;
      try {
        msg = JSON.parse(event.data) as WSMessage;
      } catch {
        return;
      }

      if (msg.type === 'telemetry') {
        const t = msg; // capture narrowed type for closure
        setRobots(prev => {
          const existing = prev.get(t.robotId);
          const trail = existing?.trail ?? [];
          const newTrail = [...trail, { x: t.x, y: t.y }].slice(-12);
          const updated = new Map(prev);
          updated.set(t.robotId, {
            id: t.robotId,
            name: t.robotId,
            x: t.x,
            y: t.y,
            heading: t.heading,
            speed: t.speed,
            battery: t.battery,
            status: t.status,
            mission: existing?.mission ?? 'patrol',
            signal: t.signal,
            lastUpdated: t.timestamp,
            trail: newTrail,
          });
          return updated;
        });
      }

      if (msg.type === 'alert') {
        appendLog({
          timestamp: msg.timestamp,
          robotId: msg.robotId,
          severity: msg.severity,
          message: msg.message,
        });
      }

      if (msg.type === 'connection') {
        appendLog({
          timestamp: msg.timestamp,
          severity: 'info',
          message: `Fleet controller: ${msg.status}`,
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [appendLog]);

  return { connected, robots, log, selectedId, setSelectedId };
}
