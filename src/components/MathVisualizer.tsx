import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualizerMode, VisualizerPreset } from '../data/curriculum';
import { evaluateMathExpression, numericalDerivative, riemannSum } from '../lib/pythonMathEngine';
import { Activity, Compass, Grid3X3, BarChart3, RotateCcw } from 'lucide-react';

interface MathVisualizerProps {
  preset: VisualizerPreset;
  day: number;
}

const MODE_META: { id: VisualizerMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'function', label: 'Function', icon: Activity },
  { id: 'vector', label: 'Vectors', icon: Grid3X3 },
  { id: 'geometry', label: 'Geometry', icon: Compass },
  { id: 'stats', label: 'Stats', icon: BarChart3 }
];

const EXPR_PRESETS = ['x**2 - 2*x', 'sin(x) * 2', '0.25*x**3 - x', 'exp(0.4*x)', '2*x + 1'];

function seededSimRolls(trials: number, seed: number): number[] {
  let state = (seed * 2654435761) >>> 0;
  const counts = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < trials; i++) {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    counts[Math.min(5, Math.floor(r * 6))]++;
  }
  return counts;
}

export function MathVisualizer({ preset, day }: MathVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<VisualizerMode>(preset.mode);
  const [expr, setExpr] = useState(preset.expression ?? 'x**2 - 2*x');
  const [x0, setX0] = useState(preset.x0 ?? 1.5);
  const [showDeriv, setShowDeriv] = useState(Boolean(preset.showDerivative));
  const [showRiemann, setShowRiemann] = useState(Boolean(preset.showRiemann));
  const [riemannA, setRiemannA] = useState(preset.a ?? 0);
  const [riemannB, setRiemannB] = useState(preset.b ?? 3);
  const [riemannN, setRiemannN] = useState(preset.riemannN ?? 12);

  const [ux, setUx] = useState(preset.vecU?.[0] ?? 3);
  const [uy, setUy] = useState(preset.vecU?.[1] ?? 2);
  const [vx, setVx] = useState(preset.vecV?.[0] ?? -1);
  const [vy, setVy] = useState(preset.vecV?.[1] ?? 3);
  const [scalarK, setScalarK] = useState(preset.scalarK ?? 1);
  const [useMatrix, setUseMatrix] = useState(Boolean(preset.matrixA));
  const [m00, setM00] = useState(preset.matrixA?.[0][0] ?? 1.3);
  const [m01, setM01] = useState(preset.matrixA?.[0][1] ?? 0.5);
  const [m10, setM10] = useState(preset.matrixA?.[1][0] ?? -0.2);
  const [m11, setM11] = useState(preset.matrixA?.[1][1] ?? 1.1);

  const [triA, setTriA] = useState(preset.triangleA ?? 4);
  const [triB, setTriB] = useState(preset.triangleB ?? 3);
  const [angleDeg, setAngleDeg] = useState(preset.angleDeg ?? 45);

  const [trials, setTrials] = useState(preset.trials ?? 600);
  const [simSeed, setSimSeed] = useState(day);
  const [combN, setCombN] = useState(8);
  const [combK, setCombK] = useState(3);

  // Sync preset when user switches days
  useEffect(() => {
    setMode(preset.mode);
    setExpr(preset.expression ?? 'x**2 - 2*x');
    setX0(preset.x0 ?? 1.5);
    setShowDeriv(Boolean(preset.showDerivative));
    setShowRiemann(Boolean(preset.showRiemann));
    setRiemannA(preset.a ?? 0);
    setRiemannB(preset.b ?? 3);
    setRiemannN(preset.riemannN ?? 12);
    setUx(preset.vecU?.[0] ?? 3);
    setUy(preset.vecU?.[1] ?? 2);
    setVx(preset.vecV?.[0] ?? -1);
    setVy(preset.vecV?.[1] ?? 3);
    setScalarK(preset.scalarK ?? 1);
    setUseMatrix(Boolean(preset.matrixA));
    setM00(preset.matrixA?.[0][0] ?? 1.3);
    setM01(preset.matrixA?.[0][1] ?? 0.5);
    setM10(preset.matrixA?.[1][0] ?? -0.2);
    setM11(preset.matrixA?.[1][1] ?? 1.1);
    setTriA(preset.triangleA ?? 4);
    setTriB(preset.triangleB ?? 3);
    setAngleDeg(preset.angleDeg ?? 45);
    setTrials(preset.trials ?? 600);
    setSimSeed(day);
  }, [preset, day]);

  // Derived metrics
  const funcMetrics = useMemo(() => {
    try {
      const y = evaluateMathExpression(expr, x0);
      const dy = numericalDerivative(expr, x0);
      const area = riemannSum(expr, riemannA, riemannB, riemannN, 'midpoint');
      return { valid: Number.isFinite(y), y, dy, area };
    } catch {
      return { valid: false, y: NaN, dy: NaN, area: NaN };
    }
  }, [expr, x0, riemannA, riemannB, riemannN]);

  const vecMetrics = useMemo(() => {
    const sux = ux * scalarK;
    const suy = uy * scalarK;
    const dot = sux * vx + suy * vy;
    const magU = Math.hypot(sux, suy);
    const magV = Math.hypot(vx, vy);
    const cosT = magU > 0 && magV > 0 ? Math.max(-1, Math.min(1, dot / (magU * magV))) : 0;
    const deg = (Math.acos(cosT) * 180) / Math.PI;
    const det = m00 * m11 - m01 * m10;
    return { sux, suy, dot, magU, magV, deg, det };
  }, [ux, uy, vx, vy, scalarK, m00, m01, m10, m11]);

  const geoMetrics = useMemo(() => {
    const hyp = Math.hypot(triA, triB);
    const rad = (angleDeg * Math.PI) / 180;
    return {
      hyp,
      area: 0.5 * triA * triB,
      rad,
      sin: Math.sin(rad),
      cos: Math.cos(rad),
      tan: Math.abs(Math.cos(rad)) < 1e-6 ? Infinity : Math.tan(rad)
    };
  }, [triA, triB, angleDeg]);

  const statsMetrics = useMemo(() => {
    const counts = seededSimRolls(trials, simSeed);
    const total = counts.reduce((a, b) => a + b, 0);
    const weightedSum = counts.reduce((acc, c, idx) => acc + c * (idx + 1), 0);
    const mean = weightedSum / total;
    const variance = counts.reduce((acc, c, idx) => acc + c * (idx + 1 - mean) ** 2, 0) / total;
    const kClamped = Math.min(combK, combN);
    let perm = 1;
    for (let i = 0; i < kClamped; i++) perm *= combN - i;
    let factK = 1;
    for (let i = 2; i <= kClamped; i++) factK *= i;
    return { counts, mean, std: Math.sqrt(variance), p6: counts[5] / total, perm, comb: Math.round(perm / factK) };
  }, [trials, simSeed, combN, combK]);

  // Draw live canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || 640;
    const cssH = canvas.clientHeight || 260;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear obsidian coordinate background
    ctx.fillStyle = '#090C12';
    ctx.fillRect(0, 0, cssW, cssH);

    if (mode === 'function') {
      const xMin = -6;
      const xMax = 6;
      const yMin = -5;
      const yMax = 5;
      const toPxX = (x: number) => ((x - xMin) / (xMax - xMin)) * cssW;
      const toPxY = (y: number) => cssH - ((y - yMin) / (yMax - yMin)) * cssH;

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let gx = Math.ceil(xMin); gx <= xMax; gx++) {
        const px = toPxX(gx);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, cssH);
        ctx.stroke();
      }
      for (let gy = Math.ceil(yMin); gy <= yMax; gy++) {
        const py = toPxY(gy);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(cssW, py);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, toPxY(0));
      ctx.lineTo(cssW, toPxY(0));
      ctx.moveTo(toPxX(0), 0);
      ctx.lineTo(toPxX(0), cssH);
      ctx.stroke();

      // Axis ticks
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.font = '10px "JetBrains Mono", monospace';
      for (let gx = -5; gx <= 5; gx += 2) {
        if (gx === 0) continue;
        ctx.fillText(String(gx), toPxX(gx) - 4, toPxY(0) + 12);
      }

      // Optional Riemann sum rectangles
      if (showRiemann && riemannB > riemannA) {
        const dx = (riemannB - riemannA) / riemannN;
        for (let i = 0; i < riemannN; i++) {
          const rx = riemannA + i * dx;
          const midX = rx + 0.5 * dx;
          try {
            const ry = evaluateMathExpression(expr, midX);
            if (!Number.isFinite(ry)) continue;
            const leftPx = toPxX(rx);
            const rightPx = toPxX(rx + dx);
            const topPx = toPxY(Math.max(0, ry));
            const botPx = toPxY(Math.min(0, ry));
            ctx.fillStyle = ry >= 0 ? 'rgba(56, 189, 248, 0.20)' : 'rgba(242, 125, 38, 0.20)';
            ctx.strokeStyle = ry >= 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(242, 125, 38, 0.55)';
            ctx.lineWidth = 1;
            ctx.fillRect(leftPx, topPx, Math.max(1, rightPx - leftPx), botPx - topPx);
            ctx.strokeRect(leftPx, topPx, Math.max(1, rightPx - leftPx), botPx - topPx);
          } catch {
            break;
          }
        }
      }

      // Main curve f(x)
      ctx.strokeStyle = '#F27D26';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      let started = false;
      const samples = 360;
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (i / samples) * (xMax - xMin);
        try {
          const y = evaluateMathExpression(expr, x);
          if (!Number.isFinite(y) || Math.abs(y) > 40) {
            started = false;
            continue;
          }
          const px = toPxX(x);
          const py = toPxY(y);
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();

      // Tangent line & probe point (x0, f(x0))
      if (funcMetrics.valid && Number.isFinite(funcMetrics.y)) {
        if (showDeriv && Number.isFinite(funcMetrics.dy)) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([5, 4]);
          const tx1 = x0 - 2.4;
          const tx2 = x0 + 2.4;
          ctx.beginPath();
          ctx.moveTo(toPxX(tx1), toPxY(funcMetrics.y + funcMetrics.dy * (tx1 - x0)));
          ctx.lineTo(toPxX(tx2), toPxY(funcMetrics.y + funcMetrics.dy * (tx2 - x0)));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const px0 = toPxX(x0);
        const py0 = toPxY(funcMetrics.y);
        if (py0 >= -10 && py0 <= cssH + 10) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px0, py0, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#F27D26';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    } else if (mode === 'vector') {
      const cx = cssW / 2;
      const cy = cssH / 2;
      const scale = Math.min(cssW, cssH) / 11;
      const toPt = (x: number, y: number): [number, number] => [cx + x * scale, cy - y * scale];

      // Base grid
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let g = -6; g <= 6; g++) {
        ctx.beginPath();
        ctx.moveTo(cx + g * scale, 0);
        ctx.lineTo(cx + g * scale, cssH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, cy - g * scale);
        ctx.lineTo(cssW, cy - g * scale);
        ctx.stroke();
      }

      // Optional transformed grid by 2x2 matrix A
      if (useMatrix) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1;
        for (let g = -4; g <= 4; g++) {
          const [ax1, ay1] = toPt(m00 * g + m01 * -4, m10 * g + m11 * -4);
          const [ax2, ay2] = toPt(m00 * g + m01 * 4, m10 * g + m11 * 4);
          ctx.beginPath();
          ctx.moveTo(ax1, ay1);
          ctx.lineTo(ax2, ay2);
          ctx.stroke();

          const [bx1, by1] = toPt(m00 * -4 + m01 * g, m10 * -4 + m11 * g);
          const [bx2, by2] = toPt(m00 * 4 + m01 * g, m10 * 4 + m11 * g);
          ctx.beginPath();
          ctx.moveTo(bx1, by1);
          ctx.lineTo(bx2, by2);
          ctx.stroke();
        }
      }

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(cssW, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cssH);
      ctx.stroke();

      const drawArrow = (x: number, y: number, color: string, label: string, dashed = false) => {
        const [tx, ty] = toPt(x, y);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = dashed ? 1.5 : 2.5;
        if (dashed) ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        const ang = Math.atan2(ty - cy, tx - cx);
        const head = 8;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - head * Math.cos(ang - 0.4), ty - head * Math.sin(ang - 0.4));
        ctx.lineTo(tx - head * Math.cos(ang + 0.4), ty - head * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(label, tx + 6, ty - 4);
      };

      const sux = vecMetrics.sux;
      const suy = vecMetrics.suy;
      drawArrow(sux, suy, '#F27D26', `k·u (${sux.toFixed(1)}, ${suy.toFixed(1)})`);
      drawArrow(vx, vy, '#38BDF8', `v (${vx.toFixed(1)}, ${vy.toFixed(1)})`);
      drawArrow(sux + vx, suy + vy, '#22C55E', 'k·u + v', true);
    } else if (mode === 'geometry') {
      // Split canvas: Left = Right Triangle, Right = Unit Circle
      const leftW = cssW * 0.48;
      const rightCx = cssW * 0.74;
      const rightCy = cssH * 0.52;
      const radius = Math.min(cssW * 0.2, cssH * 0.36);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(leftW, 14);
      ctx.lineTo(leftW, cssH - 14);
      ctx.stroke();

      // Right triangle
      const maxLeg = Math.max(triA, triB, 1);
      const tScale = Math.min((leftW - 70) / maxLeg, (cssH - 70) / maxLeg);
      const ox = 38;
      const oy = cssH - 36;
      const px = ox + triA * tScale;
      const py = oy - triB * tScale;

      ctx.fillStyle = 'rgba(242, 125, 38, 0.14)';
      ctx.strokeStyle = '#F27D26';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(px, oy);
      ctx.lineTo(ox, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right angle marker
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(ox, oy - 12, 12, 12);

      ctx.fillStyle = '#E8E6E1';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`a = ${triA}`, (ox + px) / 2 - 14, oy + 16);
      ctx.fillText(`b = ${triB}`, ox - 30, (oy + py) / 2);
      ctx.fillStyle = '#F27D26';
      ctx.fillText(`c = ${geoMetrics.hyp.toFixed(2)}`, (ox + px) / 2 + 8, (oy + py) / 2 - 6);

      // Unit Circle
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rightCx - radius - 16, rightCy);
      ctx.lineTo(rightCx + radius + 16, rightCy);
      ctx.moveTo(rightCx, rightCy - radius - 16);
      ctx.lineTo(rightCx, rightCy + radius + 16);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(rightCx, rightCy, radius, 0, Math.PI * 2);
      ctx.stroke();

      const uxPt = rightCx + Math.cos(geoMetrics.rad) * radius;
      const uyPt = rightCy - Math.sin(geoMetrics.rad) * radius;

      // cos & sin projections
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rightCx, rightCy);
      ctx.lineTo(uxPt, rightCy);
      ctx.stroke();

      ctx.strokeStyle = '#22C55E';
      ctx.beginPath();
      ctx.moveTo(uxPt, rightCy);
      ctx.lineTo(uxPt, uyPt);
      ctx.stroke();

      // Radius ray
      ctx.strokeStyle = '#F27D26';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(rightCx, rightCy);
      ctx.lineTo(uxPt, uyPt);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(uxPt, uyPt, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText(`θ = ${angleDeg}°`, rightCx - radius - 10, 22);
    } else {
      // Probability & Stats Histogram
      const counts = statsMetrics.counts;
      const maxC = Math.max(...counts, 1);
      const padL = 36;
      const padR = 20;
      const padT = 26;
      const padB = 34;
      const plotW = cssW - padL - padR;
      const plotH = cssH - padT - padB;

      // Theoretical 1/6 line
      const expected = trials / 6;
      const expY = padT + plotH - (expected / (maxC * 1.12)) * plotH;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, expY);
      ctx.lineTo(cssW - padR, expY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`Expected 1/6 (${Math.round(expected)})`, padL + 4, expY - 6);

      const barGap = 14;
      const barW = (plotW - barGap * 7) / 6;

      counts.forEach((c, idx) => {
        const x = padL + barGap + idx * (barW + barGap);
        const h = (c / (maxC * 1.12)) * plotH;
        const y = padT + plotH - h;
        ctx.fillStyle = idx === 5 ? 'rgba(242, 125, 38, 0.85)' : 'rgba(242, 125, 38, 0.42)';
        ctx.fillRect(x, y, barW, h);
        ctx.strokeStyle = '#F27D26';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barW, h);

        ctx.fillStyle = '#E8E6E1';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Face ${idx + 1}`, x + Math.max(0, barW / 2 - 19), cssH - 12);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText(String(c), x + Math.max(0, barW / 2 - 12), y - 6);
      });
    }
  }, [
    mode,
    expr,
    x0,
    showDeriv,
    showRiemann,
    riemannA,
    riemannB,
    riemannN,
    funcMetrics,
    vecMetrics,
    vx,
    vy,
    useMatrix,
    m00,
    m01,
    m10,
    m11,
    triA,
    triB,
    angleDeg,
    geoMetrics,
    statsMetrics,
    trials
  ]);

  return (
    <section className="rounded-xl border border-white/10 bg-[#0E1117] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-[#12161F]">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F27D26]">Interactive Math Canvas</p>
          <h3 className="text-sm font-medium text-white">{preset.label}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Math visualizer modes">
          {MODE_META.map(item => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(item.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-mono transition-colors ${
                  active
                    ? 'bg-[#F27D26] text-[#07090D] font-semibold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative rounded-lg border border-white/10 overflow-hidden bg-[#090C12]">
          <canvas
            ref={canvasRef}
            aria-label={`Interactive ${mode} mathematical visualization canvas`}
            className="w-full h-[240px] sm:h-[260px] block"
          />
        </div>

        {mode === 'function' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 flex items-center gap-2 rounded-lg bg-[#090C12] border border-white/15 px-3 py-2">
                <span className="text-xs font-mono text-[#F27D26] shrink-0">f(x) =</span>
                <input
                  type="text"
                  value={expr}
                  onChange={e => setExpr(e.target.value)}
                  aria-label="Mathematical function expression in x"
                  className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                  placeholder="x**2 - 2*x"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeriv(v => !v)}
                  className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono border transition-colors ${
                    showDeriv
                      ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  Tangent f'(x)
                </button>
                <button
                  type="button"
                  onClick={() => setShowRiemann(v => !v)}
                  className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono border transition-colors ${
                    showRiemann
                      ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  Riemann ∫
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {EXPR_PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setExpr(p)}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/75"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <label className="block bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70 mb-1">
                  <span>Probe x₀</span>
                  <span className="text-[#F27D26]">{x0.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={0.1}
                  value={x0}
                  onChange={e => setX0(Number(e.target.value))}
                  className="w-full accent-[#F27D26]"
                />
              </label>

              {showRiemann ? (
                <label className="block bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Rectangles n on [{riemannA}, {riemannB}]</span>
                    <span className="text-[#38BDF8]">{riemannN}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={48}
                    step={1}
                    value={riemannN}
                    onChange={e => setRiemannN(Number(e.target.value))}
                    className="w-full accent-[#38BDF8]"
                  />
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-2 bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white/45 text-[10px] uppercase">f(x₀)</div>
                    <div className="text-white text-sm">
                      {funcMetrics.valid ? funcMetrics.y.toFixed(3) : 'err'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/45 text-[10px] uppercase">Slope f'(x₀)</div>
                    <div className="text-[#38BDF8] text-sm">
                      {funcMetrics.valid && Number.isFinite(funcMetrics.dy) ? funcMetrics.dy.toFixed(3) : '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showRiemann && (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div>
                  <span className="text-white/45 block text-[10px]">f(x₀)</span>
                  <span className="text-white">{funcMetrics.valid ? funcMetrics.y.toFixed(3) : '—'}</span>
                </div>
                <div>
                  <span className="text-white/45 block text-[10px]">f'(x₀)</span>
                  <span className="text-[#38BDF8]">{funcMetrics.valid ? funcMetrics.dy.toFixed(3) : '—'}</span>
                </div>
                <div>
                  <span className="text-white/45 block text-[10px]">Midpoint ∫</span>
                  <span className="text-emerald-400">{funcMetrics.valid ? funcMetrics.area.toFixed(3) : '—'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'vector' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>u = ({ux}, {uy})</span><span className="text-[#F27D26]">ux</span></div>
                <input type="range" min={-4} max={4} step={0.5} value={ux} onChange={e => setUx(Number(e.target.value))} className="w-full accent-[#F27D26]" />
                <input type="range" min={-4} max={4} step={0.5} value={uy} onChange={e => setUy(Number(e.target.value))} className="w-full accent-[#F27D26]" />
              </label>
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>v = ({vx}, {vy})</span><span className="text-[#38BDF8]">vx</span></div>
                <input type="range" min={-4} max={4} step={0.5} value={vx} onChange={e => setVx(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
                <input type="range" min={-4} max={4} step={0.5} value={vy} onChange={e => setVy(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
              </label>
              <div className="col-span-2 sm:col-span-1 bg-[#090C12] p-2.5 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex justify-between text-white/70"><span>Scalar k</span><span className="text-emerald-400">{scalarK.toFixed(1)}</span></div>
                <input type="range" min={-2} max={2.5} step={0.1} value={scalarK} onChange={e => setScalarK(Number(e.target.value))} className="w-full accent-emerald-400" />
                <button
                  type="button"
                  onClick={() => setUseMatrix(v => !v)}
                  className={`w-full py-1 rounded text-[11px] border ${
                    useMatrix ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]' : 'bg-white/5 border-white/10 text-white/65'
                  }`}
                >
                  {useMatrix ? '2×2 Grid On' : 'Overlay 2×2 Matrix'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090C12] p-2.5 rounded-lg border border-white/10">
              <div><span className="text-white/45 block text-[10px]">(k·u) · v</span><span className="text-white">{vecMetrics.dot.toFixed(2)}</span></div>
              <div><span className="text-white/45 block text-[10px]">Angle θ</span><span className="text-[#38BDF8]">{vecMetrics.deg.toFixed(1)}°</span></div>
              <div><span className="text-white/45 block text-[10px]">||k·u||</span><span className="text-[#F27D26]">{vecMetrics.magU.toFixed(2)}</span></div>
              <div><span className="text-white/45 block text-[10px]">det(A)</span><span className="text-emerald-400">{vecMetrics.det.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {mode === 'geometry' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>Leg a</span><span className="text-[#F27D26]">{triA}</span></div>
                <input type="range" min={1} max={12} step={1} value={triA} onChange={e => setTriA(Number(e.target.value))} className="w-full accent-[#F27D26]" />
              </label>
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>Leg b</span><span className="text-[#F27D26]">{triB}</span></div>
                <input type="range" min={1} max={12} step={1} value={triB} onChange={e => setTriB(Number(e.target.value))} className="w-full accent-[#F27D26]" />
              </label>
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>Unit Angle θ</span><span className="text-[#38BDF8]">{angleDeg}°</span></div>
                <input type="range" min={0} max={360} step={5} value={angleDeg} onChange={e => setAngleDeg(Number(e.target.value))} className="w-full accent-[#38BDF8]" />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090C12] p-2.5 rounded-lg border border-white/10">
              <div><span className="text-white/45 block text-[10px]">Hypotenuse c</span><span className="text-[#F27D26]">{geoMetrics.hyp.toFixed(3)}</span></div>
              <div><span className="text-white/45 block text-[10px]">Radians</span><span className="text-white">{geoMetrics.rad.toFixed(3)}</span></div>
              <div><span className="text-white/45 block text-[10px]">sin(θ)</span><span className="text-emerald-400">{geoMetrics.sin.toFixed(3)}</span></div>
              <div><span className="text-white/45 block text-[10px]">cos(θ)</span><span className="text-[#38BDF8]">{geoMetrics.cos.toFixed(3)}</span></div>
            </div>
          </div>
        )}

        {mode === 'stats' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>Die Trials N</span><span className="text-[#F27D26]">{trials}</span></div>
                <input type="range" min={60} max={6000} step={60} value={trials} onChange={e => setTrials(Number(e.target.value))} className="w-full accent-[#F27D26]" />
              </label>
              <label className="bg-[#090C12] p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-white/70"><span>Combinatorics n, k</span><span className="text-[#38BDF8]">{combN}, {Math.min(combK, combN)}</span></div>
                <div className="flex gap-2">
                  <input type="range" min={3} max={12} step={1} value={combN} onChange={e => setCombN(Number(e.target.value))} className="w-1/2 accent-[#38BDF8]" />
                  <input type="range" min={1} max={combN} step={1} value={Math.min(combK, combN)} onChange={e => setCombK(Number(e.target.value))} className="w-1/2 accent-[#38BDF8]" />
                </div>
              </label>
              <div className="bg-[#090C12] p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-white/45 text-[10px]">Seed #{simSeed}</div>
                  <div className="text-white">P(6) = {statsMetrics.p6.toFixed(4)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSimSeed(s => s + 1)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  Resample
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#090C12] p-2.5 rounded-lg border border-white/10">
              <div><span className="text-white/45 block text-[10px]">Sample Mean</span><span className="text-white">{statsMetrics.mean.toFixed(3)}</span></div>
              <div><span className="text-white/45 block text-[10px]">Std Dev σ</span><span className="text-[#F27D26]">{statsMetrics.std.toFixed(3)}</span></div>
              <div><span className="text-white/45 block text-[10px]">P({combN},{Math.min(combK, combN)})</span><span className="text-[#38BDF8]">{statsMetrics.perm}</span></div>
              <div><span className="text-white/45 block text-[10px]">C({combN},{Math.min(combK, combN)})</span><span className="text-emerald-400">{statsMetrics.comb}</span></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
