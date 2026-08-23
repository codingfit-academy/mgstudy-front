"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./Fireworks.module.css";

const COLORS = ["#ff6b6b", "#ffb648", "#4285f4", "#9168c0", "#34a853", "#ff8a5b"];
const PARTICLE_COUNT = 26;
const DURATION_MS = 900;

type Particle = {
  id: number;
  color: string;
  dx: number;
  dy: number;
  delay: number;
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.3;
    const distance = 70 + Math.random() * 70;
    return {
      id: i,
      color: COLORS[i % COLORS.length],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      delay: Math.random() * 0.08,
    };
  });
}

/** Fires a confetti-like burst whenever `trigger` changes to a new, truthy value. */
export default function Fireworks({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    let cancelled = false;
    // Deferred to a microtask so the state updates happen in a callback
    // rather than synchronously in the effect body.
    queueMicrotask(() => {
      if (cancelled) return;
      setParticles(makeParticles());
      setShow(true);
    });
    const t = setTimeout(() => setShow(false), DURATION_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [trigger]);

  if (!show) return null;

  return (
    <div className={styles.burst} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={
            {
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
