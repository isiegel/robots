import { Robot, RobotStatus, MissionType, WSMessage, Waypoint } from './types';

const TRAIL_LENGTH = 12;
const UPDATE_INTERVAL_MS = 600;

interface RobotConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  heading: number;
  speed: number;
  battery: number;
  status: RobotStatus;
  mission: MissionType;
  signal: number;
  waypoints: Waypoint[];
  waypointIndex: number;
  batteryDrainRate: number; // % per second
}

const INITIAL_ROBOTS: RobotConfig[] = [
  {
    id: 'UNIT-01', name: 'UNIT-01',
    x: 18, y: 22, heading: 90, speed: 2.4, battery: 88, status: 'active',
    mission: 'patrol', signal: 94,
    waypoints: [{ x: 18, y: 22 }, { x: 35, y: 18 }, { x: 38, y: 35 }, { x: 20, y: 38 }],
    waypointIndex: 0, batteryDrainRate: 0.04,
  },
  {
    id: 'UNIT-02', name: 'UNIT-02',
    x: 72, y: 20, heading: 180, speed: 1.8, battery: 72, status: 'active',
    mission: 'survey', signal: 87,
    waypoints: [{ x: 72, y: 20 }, { x: 82, y: 28 }, { x: 80, y: 42 }, { x: 68, y: 38 }, { x: 65, y: 24 }],
    waypointIndex: 0, batteryDrainRate: 0.03,
  },
  {
    id: 'UNIT-03', name: 'UNIT-03',
    x: 50, y: 50, heading: 0, speed: 0, battery: 91, status: 'idle',
    mission: 'standby', signal: 99,
    waypoints: [{ x: 50, y: 50 }],
    waypointIndex: 0, batteryDrainRate: 0.01,
  },
  {
    id: 'UNIT-04', name: 'UNIT-04',
    x: 22, y: 72, heading: 270, speed: 3.1, battery: 55, status: 'active',
    mission: 'patrol', signal: 78,
    waypoints: [{ x: 22, y: 72 }, { x: 15, y: 60 }, { x: 12, y: 48 }, { x: 22, y: 58 }, { x: 30, y: 68 }],
    waypointIndex: 0, batteryDrainRate: 0.05,
  },
  {
    id: 'UNIT-05', name: 'UNIT-05',
    x: 74, y: 70, heading: 315, speed: 2.7, battery: 33, status: 'warning',
    mission: 'intercept', signal: 61,
    waypoints: [{ x: 74, y: 70 }, { x: 88, y: 62 }, { x: 90, y: 78 }, { x: 76, y: 82 }],
    waypointIndex: 0, batteryDrainRate: 0.06,
  },
  {
    id: 'UNIT-06', name: 'UNIT-06',
    x: 55, y: 82, heading: 45, speed: 0, battery: 12, status: 'warning',
    mission: 'patrol', signal: 45,
    waypoints: [{ x: 55, y: 82 }, { x: 62, y: 75 }, { x: 58, y: 68 }, { x: 50, y: 74 }],
    waypointIndex: 0, batteryDrainRate: 0.02,
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function angleToTarget(fx: number, fy: number, tx: number, ty: number): number {
  // SVG: y increases downward; heading 0 = north (up) = negative y
  const dx = tx - fx;
  const dy = ty - fy;
  const rad = Math.atan2(dx, -dy);
  return ((rad * 180) / Math.PI + 360) % 360;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

export type MessageHandler = (data: WSMessage) => void;

export class MockWebSocket {
  readyState: number = 0; // CONNECTING
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private robots: RobotConfig[];
  private trails: Map<string, Array<{ x: number; y: number }>>;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;

  constructor(_url: string) {
    this.robots = INITIAL_ROBOTS.map(r => ({ ...r, waypoints: [...r.waypoints] }));
    this.trails = new Map(this.robots.map(r => [r.id, [{ x: r.x, y: r.y }]]));

    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen(new Event('open'));
      this.emit({ type: 'connection', status: 'connected', timestamp: Date.now() });
      this.robots.forEach(r => this.emitTelemetry(r));
      this.startLoop();
    }, 400);
  }

  private emit(msg: WSMessage): void {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(msg) });
    }
  }

  private emitTelemetry(r: RobotConfig): void {
    this.emit({
      type: 'telemetry',
      robotId: r.id,
      timestamp: Date.now(),
      x: r.x, y: r.y,
      heading: r.heading,
      speed: r.speed,
      battery: r.battery,
      status: r.status,
      signal: r.signal,
    });
  }

  private stepRobot(r: RobotConfig, dtSec: number): void {
    if (r.status === 'offline' || r.waypoints.length === 0) return;

    const target = r.waypoints[r.waypointIndex % r.waypoints.length];
    const d = dist(r.x, r.y, target.x, target.y);

    if (r.status === 'idle') {
      r.speed = 0;
      return;
    }

    const moveSpeed = r.status === 'warning' ? Math.max(r.speed * 0.6, 0.8) : r.speed;
    const step = moveSpeed * dtSec * 3; // scale units/sec to map units

    if (d < 0.8) {
      r.waypointIndex = (r.waypointIndex + 1) % r.waypoints.length;
    } else {
      const t = Math.min(step / d, 1);
      r.x = lerp(r.x, target.x, t);
      r.y = lerp(r.y, target.y, t);
      r.heading = angleToTarget(r.x, r.y, target.x, target.y);
    }

    // Drain battery
    r.battery = Math.max(0, r.battery - r.batteryDrainRate * dtSec);
    if (r.battery < 10 && r.status === 'active') r.status = 'warning';

    // Signal jitter
    r.signal = Math.min(100, Math.max(20, r.signal + (Math.random() - 0.5) * 4));

    // Update trail
    const trail = this.trails.get(r.id) ?? [];
    trail.push({ x: r.x, y: r.y });
    if (trail.length > TRAIL_LENGTH) trail.shift();
    this.trails.set(r.id, trail);
  }

  private startLoop(): void {
    const dtSec = UPDATE_INTERVAL_MS / 1000;

    this.intervalId = setInterval(() => {
      this.tickCount++;

      this.robots.forEach(r => {
        this.stepRobot(r, dtSec);
        this.emitTelemetry(r);
      });

      // Occasional alerts
      if (this.tickCount % 10 === 0) {
        const alerts = this.robots
          .filter(r => r.status === 'warning')
          .map(r => ({
            type: 'alert' as const,
            robotId: r.id,
            severity: r.battery < 15 ? 'critical' as const : 'warning' as const,
            message: r.battery < 15
              ? `${r.id}: Critical battery — ${r.battery.toFixed(0)}%`
              : `${r.id}: Low battery — ${r.battery.toFixed(0)}%`,
            timestamp: Date.now(),
          }));
        alerts.forEach(a => this.emit(a));
      }

      if (this.tickCount % 25 === 0) {
        const active = this.robots.filter(r => r.status === 'active');
        if (active.length) {
          const r = active[Math.floor(Math.random() * active.length)];
          this.emit({
            type: 'alert', robotId: r.id, severity: 'info',
            message: `${r.id}: Waypoint reached — resuming route`,
            timestamp: Date.now(),
          });
        }
      }
    }, UPDATE_INTERVAL_MS);
  }

  getInitialRobots(): Robot[] {
    return this.robots.map(r => ({
      id: r.id,
      name: r.name,
      x: r.x,
      y: r.y,
      heading: r.heading,
      speed: r.speed,
      battery: r.battery,
      status: r.status,
      mission: r.mission,
      signal: r.signal,
      lastUpdated: Date.now(),
      trail: this.trails.get(r.id) ?? [],
    }));
  }

  close(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose(new Event('close'));
  }

  send(_data: string): void {
    // Accept commands — extend as needed
  }
}
