"use client";

import { useMemo, useState, type MouseEvent } from "react";

export interface ScorePoint {
  date: Date;
  score: number;
}

const WIDTH = 480;
const HEIGHT = 140;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ScoreTrendChart({ data }: { data: ScorePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    const innerWidth = WIDTH - PAD_X * 2;
    const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    return data.map((d, i) => {
      const x = data.length === 1 ? WIDTH / 2 : PAD_X + (i / (data.length - 1)) * innerWidth;
      const y = PAD_TOP + innerHeight * (1 - d.score / 100);
      return { x, y, ...d };
    });
  }, [data]);

  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Score history appears here after a couple more scans.
      </p>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${HEIGHT - PAD_BOTTOM} L${points[0].x},${HEIGHT - PAD_BOTTOM} Z`;

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const first = data[0];
  const last = data[data.length - 1];

  return (
    <div className="space-y-2">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label={`Configuration health score trend from ${first.score} to ${last.score} over ${data.length} scans`}
        >
          {[0, 50, 100].map((mark) => {
            const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * (1 - mark / 100);
            return (
              <line
                key={mark}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
              />
            );
          })}

          <path d={areaPath} className="fill-primary/10" />
          <path d={linePath} className="fill-none stroke-primary" strokeWidth={2} strokeLinejoin="round" />

          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={HEIGHT - PAD_BOTTOM}
              className="stroke-muted-foreground/40"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4 : 2.5}
              className={hoverIndex === i ? "fill-primary" : "fill-primary/60"}
            />
          ))}

          <text x={PAD_X} y={HEIGHT - 6} className="fill-muted-foreground text-[10px]">
            {formatDate(first.date)}
          </text>
          <text x={WIDTH - PAD_X} y={HEIGHT - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">
            {formatDate(last.date)}
          </text>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-border bg-card px-2 py-1 text-xs shadow-md"
            style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
          >
            <span className="font-medium">{hovered.score}</span>
            <span className="text-muted-foreground"> · {formatDate(hovered.date)}</span>
          </div>
        )}
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-1 font-normal">Date</th>
              <th className="py-1 font-normal">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-1">{d.date.toLocaleString()}</td>
                <td className="py-1">{d.score}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
