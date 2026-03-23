import React, { JSX } from 'react';
import { Robot } from './types';

interface Props {
  robots: Map<string, Robot>;
  selectedId: string | null;
  onSelectRobot: (id: string | null) => void;
}

const MAP_W = 820;
const MAP_H = 600;

function toSVG(coord: number, dim: number): number {
  return (coord / 100) * dim;
}

const STATUS_COLOR: Record<string, string> = {
  active: '#00ff88',
  idle: '#4488ff',
  warning: '#ffaa00',
  offline: '#555566',
};

// ── Static map features ────────────────────────────────────────────────────

function MapBackground(): JSX.Element {
  return (
    <>
      {/* Base */}
      <rect width={MAP_W} height={MAP_H} fill="#080f1c" />

      {/* Terrain patches */}
      <rect x={0} y={0} width={MAP_W * 0.45} height={MAP_H * 0.45}
        fill="#0a1420" />
      <rect x={MAP_W * 0.55} y={MAP_H * 0.55} width={MAP_W * 0.45} height={MAP_H * 0.45}
        fill="#0a1420" />

      {/* Zone overlays */}
      {/* Safe/patrol zone — NW */}
      <rect x={toSVG(8, MAP_W)} y={toSVG(8, MAP_H)}
        width={toSVG(38, MAP_W)} height={toSVG(38, MAP_H)}
        fill="rgba(0,180,80,0.06)" stroke="#00aa44" strokeWidth={0.8}
        strokeDasharray="6 4" rx={2} />
      <text x={toSVG(10, MAP_W)} y={toSVG(11.5, MAP_H)}
        fill="#00aa44" fontSize={9} fontFamily="monospace" opacity={0.7}>
        ZONE-A · PATROL
      </text>

      {/* Survey zone — NE */}
      <rect x={toSVG(58, MAP_W)} y={toSVG(8, MAP_H)}
        width={toSVG(34, MAP_W)} height={toSVG(38, MAP_H)}
        fill="rgba(60,120,255,0.06)" stroke="#3366cc" strokeWidth={0.8}
        strokeDasharray="6 4" rx={2} />
      <text x={toSVG(60, MAP_W)} y={toSVG(11.5, MAP_H)}
        fill="#3366cc" fontSize={9} fontFamily="monospace" opacity={0.7}>
        ZONE-B · SURVEY
      </text>

      {/* Restricted zone — center */}
      <rect x={toSVG(38, MAP_W)} y={toSVG(38, MAP_H)}
        width={toSVG(24, MAP_W)} height={toSVG(24, MAP_H)}
        fill="rgba(255,40,40,0.07)" stroke="#cc2222" strokeWidth={0.8}
        strokeDasharray="4 3" rx={2} />
      <text x={toSVG(40, MAP_W)} y={toSVG(41, MAP_H)}
        fill="#cc2222" fontSize={9} fontFamily="monospace" opacity={0.7}>
        RESTRICTED
      </text>

      {/* Roads / paths */}
      <line x1={toSVG(0, MAP_W)} y1={toSVG(50, MAP_H)}
        x2={toSVG(100, MAP_W)} y2={toSVG(50, MAP_H)}
        stroke="#1a2840" strokeWidth={6} />
      <line x1={toSVG(50, MAP_W)} y1={toSVG(0, MAP_H)}
        x2={toSVG(50, MAP_W)} y2={toSVG(100, MAP_H)}
        stroke="#1a2840" strokeWidth={6} />
      <line x1={toSVG(0, MAP_W)} y1={toSVG(50, MAP_H)}
        x2={toSVG(100, MAP_W)} y2={toSVG(50, MAP_H)}
        stroke="#1e3050" strokeWidth={2} />
      <line x1={toSVG(50, MAP_W)} y1={toSVG(0, MAP_H)}
        x2={toSVG(50, MAP_W)} y2={toSVG(100, MAP_H)}
        stroke="#1e3050" strokeWidth={2} />

      {/* Structures */}
      {/* HQ */}
      <rect x={toSVG(44, MAP_W)} y={toSVG(44, MAP_H)}
        width={toSVG(12, MAP_W)} height={toSVG(12, MAP_H)}
        fill="#101d30" stroke="#1e3d60" strokeWidth={1} rx={1} />
      <text x={toSVG(50, MAP_W)} y={toSVG(51, MAP_H)}
        fill="#2a5090" fontSize={8} fontFamily="monospace"
        textAnchor="middle" dominantBaseline="middle">HQ</text>

      {/* North outpost */}
      <rect x={toSVG(20, MAP_W)} y={toSVG(14, MAP_H)}
        width={toSVG(8, MAP_W)} height={toSVG(6, MAP_H)}
        fill="#0e1a28" stroke="#1a3050" strokeWidth={1} rx={1} />
      <text x={toSVG(24, MAP_W)} y={toSVG(17.5, MAP_H)}
        fill="#1a3050" fontSize={7} fontFamily="monospace" textAnchor="middle">POST-N</text>

      {/* East outpost */}
      <rect x={toSVG(70, MAP_W)} y={toSVG(30, MAP_H)}
        width={toSVG(8, MAP_W)} height={toSVG(6, MAP_H)}
        fill="#0e1a28" stroke="#1a3050" strokeWidth={1} rx={1} />
      <text x={toSVG(74, MAP_W)} y={toSVG(33.5, MAP_H)}
        fill="#1a3050" fontSize={7} fontFamily="monospace" textAnchor="middle">POST-E</text>

      {/* SW depot */}
      <rect x={toSVG(14, MAP_W)} y={toSVG(65, MAP_H)}
        width={toSVG(10, MAP_W)} height={toSVG(8, MAP_H)}
        fill="#0e1a28" stroke="#1a3050" strokeWidth={1} rx={1} />
      <text x={toSVG(19, MAP_W)} y={toSVG(69.5, MAP_H)}
        fill="#1a3050" fontSize={7} fontFamily="monospace" textAnchor="middle">DEPOT</text>

      {/* Grid */}
      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(v => (
        <React.Fragment key={v}>
          <line x1={toSVG(v, MAP_W)} y1={0}
            x2={toSVG(v, MAP_W)} y2={MAP_H}
            stroke="#0d1a2a" strokeWidth={0.5} />
          <line x1={0} y1={toSVG(v, MAP_H)}
            x2={MAP_W} y2={toSVG(v, MAP_H)}
            stroke="#0d1a2a" strokeWidth={0.5} />
        </React.Fragment>
      ))}

      {/* Grid labels */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <React.Fragment key={i}>
          <text x={toSVG(i * 10 + 1, MAP_W)} y={12}
            fill="#0e2040" fontSize={7} fontFamily="monospace">{i}</text>
          <text x={3} y={toSVG(i * 10 + 2, MAP_H)}
            fill="#0e2040" fontSize={7} fontFamily="monospace">{i}</text>
        </React.Fragment>
      ))}

      {/* Compass */}
      <g transform={`translate(${MAP_W - 36}, 36)`}>
        <circle r={18} fill="rgba(0,0,0,0.5)" stroke="#1a3050" strokeWidth={1} />
        <text x={0} y={-9} fill="#3399ff" fontSize={7} fontFamily="monospace"
          textAnchor="middle" fontWeight="bold">N</text>
        <text x={0} y={14} fill="#334466" fontSize={6} fontFamily="monospace" textAnchor="middle">S</text>
        <text x={10} y={3} fill="#334466" fontSize={6} fontFamily="monospace" textAnchor="middle">E</text>
        <text x={-10} y={3} fill="#334466" fontSize={6} fontFamily="monospace" textAnchor="middle">W</text>
        <line x1={0} y1={-6} x2={0} y2={-14} stroke="#3399ff" strokeWidth={1.5} />
        <line x1={0} y1={6} x2={0} y2={14} stroke="#334466" strokeWidth={1} />
      </g>

      {/* Scale bar */}
      <g transform={`translate(${MAP_W - 120}, ${MAP_H - 18})`}>
        <line x1={0} y1={0} x2={80} y2={0} stroke="#1e3d60" strokeWidth={1.5} />
        <line x1={0} y1={-4} x2={0} y2={4} stroke="#1e3d60" strokeWidth={1} />
        <line x1={80} y1={-4} x2={80} y2={4} stroke="#1e3d60" strokeWidth={1} />
        <text x={40} y={-5} fill="#1e3d60" fontSize={7} fontFamily="monospace"
          textAnchor="middle">500 m</text>
      </g>

      {/* Scanline overlay */}
      <rect width={MAP_W} height={MAP_H}
        fill="url(#scanlines)" opacity={0.06} pointerEvents="none" />

      <defs>
        <pattern id="scanlines" x={0} y={0} width={2} height={2}
          patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={2} height={1} fill="#fff" />
        </pattern>
      </defs>
    </>
  );
}

// ── Robot marker ────────────────────────────────────────────────────────────

interface MarkerProps {
  robot: Robot;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function RobotMarker({ robot, selected, onClick }: MarkerProps): JSX.Element {
  const cx = toSVG(robot.x, MAP_W);
  const cy = toSVG(robot.y, MAP_H);
  const color = STATUS_COLOR[robot.status] ?? '#888';
  const rot = robot.heading; // 0 = north

  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Trail */}
      {robot.trail.length > 1 && (
        <polyline
          points={robot.trail.map(p =>
            `${toSVG(p.x, MAP_W) - cx},${toSVG(p.y, MAP_H) - cy}`
          ).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Selection ring */}
      {selected && (
        <circle r={18} fill="none" stroke={color} strokeWidth={1.5}
          strokeDasharray="4 3" opacity={0.8} />
      )}

      {/* Pulse ring for active */}
      {robot.status === 'active' && (
        <circle r={13} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3}>
          <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Body circle */}
      <circle r={9} fill="#0a1628" stroke={color} strokeWidth={1.8} />

      {/* Heading arrow */}
      <g transform={`rotate(${rot})`}>
        <polygon points="0,-11 3,-4 -3,-4" fill={color} opacity={0.9} />
      </g>

      {/* Status dot */}
      {robot.status === 'warning' && (
        <circle cx={7} cy={-7} r={3} fill="#ffaa00">
          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Label */}
      <text y={20} fill={color} fontSize={8} fontFamily="monospace"
        textAnchor="middle" fontWeight="bold">
        {robot.name}
      </text>
    </g>
  );
}

// ── Main map component ──────────────────────────────────────────────────────

export default function RobotMap({ robots, selectedId, onSelectRobot }: Props): JSX.Element {
  return (
    <div className="robot-map-container">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        onClick={() => onSelectRobot(null)}
      >
        <MapBackground />
        {Array.from(robots.values()).map(robot => (
          <RobotMarker
            key={robot.id}
            robot={robot}
            selected={robot.id === selectedId}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectRobot(robot.id);
            }}
          />
        ))}
      </svg>
    </div>
  );
}
