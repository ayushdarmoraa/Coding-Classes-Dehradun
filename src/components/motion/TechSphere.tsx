"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";

export type SphereItem = { label: string; color?: string; src?: string };

// Only topics that already exist on the DCA site (courses.ts)
const DEFAULT_ITEMS: SphereItem[] = [
  { label: "React", color: "#0EA5E9" },
  { label: "Python", color: "#2F7BF0" },
  { label: "Java", color: "#DC2626" },
  { label: "JavaScript", color: "#CA8A04" },
  { label: "Tailwind", color: "#0891B2" },
  { label: "HTML", color: "#EA580C" },
  { label: "CSS", color: "#4B3FD8" },
  { label: "Pandas", color: "#5B21B6" },
  { label: "NumPy", color: "#1D5FD1" },
  { label: "Hooks", color: "#16A34A" },
  { label: "Routing", color: "#0F1B33" },
  { label: "Collections", color: "#C2410C" },
];

type Props = { items?: SphereItem[]; size?: number; className?: string };

export default function TechSphere({ items = DEFAULT_ITEMS, size = 460, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const n = items.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    // Evenly spread points on a sphere (Fibonacci sphere)
    const pts = items.map((_, i) => {
      const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      return { x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r };
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const auto = reduce ? 0 : 0.004; // idle spin speed
    const R = size * 0.44; // sphere radius in px
    const D = size * 1.4; // perspective distance

    let vy = auto, vx = 0; // angular velocity (rad/frame)
    let dragging = false, lastX = 0, lastY = 0, pdx = 0, pdy = 0, raf = 0;

    const frame = () => {
      if (dragging) {
        vy = pdx * 0.006;
        vx = -pdy * 0.006;
        pdx = 0;
        pdy = 0;
      } else {
        vy += (auto - vy) * 0.03; // ease back to idle spin
        vx *= 0.95; // vertical inertia fades out
      }
      const cy = Math.cos(vy), sy = Math.sin(vy);
      const cx = Math.cos(vx), sx = Math.sin(vx);

      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y1 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const l = Math.hypot(x1, y1, z2) || 1; // keep points on the sphere
        p.x = x1 / l; p.y = y1 / l; p.z = z2 / l;

        const el = nodeRefs.current[i];
        if (!el) continue;
        const s = D / (D - p.z * R);
        el.style.transform = `translate(-50%,-50%) translate(${p.x * R * s}px,${p.y * R * s}px) scale(${s})`;
        el.style.opacity = String(0.55 + 0.45 * ((p.z + 1) / 2));
        el.style.zIndex = String(Math.round((p.z + 1) * 100));
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const down = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      root.setPointerCapture(e.pointerId);
      root.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      pdx += e.clientX - lastX; pdy += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; root.style.cursor = "grab"; };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);

    // Only animate while visible on screen
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()));
    io.observe(root);

    return () => {
      stop(); io.disconnect();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, [items, size]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={className}
      style={{ position: "relative", width: size, height: size, cursor: "grab", touchAction: "pan-y", userSelect: "none" }}
    >
      <div
        style={{
          position: "absolute", inset: "8%", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, rgba(47,123,240,.16), rgba(75,63,216,.06) 60%, transparent 72%)",
        }}
      />
      {items.map((it, i) => (
        <div
          key={it.label + i}
          ref={(el) => { nodeRefs.current[i] = el; }}
          style={{ position: "absolute", left: "50%", top: "50%", willChange: "transform, opacity" }}
        >
          {it.src ? (
            <img src={it.src} alt="" width={64} height={64} draggable={false}
              style={{ display: "block", width:64, height: 64, objectFit: "contain" }} />
          ) : (
            <span
              style={{
                display: "block", padding: "8px 14px", borderRadius: 12, background: "#fff",
                border: "1px solid #D9E4F7", boxShadow: "0 8px 20px rgba(30,70,160,.14)",
                font: "600 14px var(--font-mono, ui-monospace, monospace)",
                color: it.color ?? "#0F1B33", whiteSpace: "nowrap",
              }}
            >
              {it.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}