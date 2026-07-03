import { useEffect, useMemo, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { mulberry32 } from '../lib/seed';
import { useReducedMotion } from '../hooks/useReducedMotion';
import styles from './AnalyzingScreen.module.css';

interface AnalyzingScreenProps {
  photoDataUrl: string;
  seed: number;
  resultFlag: string;
  onComplete: () => void;
}

const MESH_LINES = [
  [10, 20, 90, 20],
  [10, 40, 90, 40],
  [10, 60, 90, 60],
  [10, 80, 90, 80],
  [30, 5, 30, 95],
  [50, 5, 50, 95],
  [70, 5, 70, 95],
];

export function AnalyzingScreen({ photoDataUrl, seed, resultFlag, onComplete }: AnalyzingScreenProps) {
  const reducedMotion = useReducedMotion();
  const flagOrder = useMemo(() => {
    const rng = mulberry32(seed);
    const flags = COUNTRIES.map((c) => c.flag);
    for (let i = flags.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [flags[i], flags[j]] = [flags[j], flags[i]];
    }
    return flags;
  }, [seed]);

  const [flagIndex, setFlagIndex] = useState(0);
  const totalDurationMs = reducedMotion ? 500 : 2500;

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(onComplete, totalDurationMs);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    const start = performance.now();
    const settleAt = totalDurationMs - 500;

    function tick() {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      if (elapsed >= totalDurationMs) {
        onComplete();
        return;
      }
      if (elapsed >= settleAt) {
        setFlagIndex(-1); // -1 signals "show final flag"
        setTimeout(tick, 120);
        return;
      }
      setFlagIndex((i) => (i + 1) % flagOrder.length);
      const speed = elapsed < totalDurationMs * 0.5 ? 70 : 120;
      setTimeout(tick, speed);
    }

    const id = setTimeout(tick, 70);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, totalDurationMs]);

  const displayedFlag = flagIndex === -1 ? resultFlag : flagOrder[flagIndex];

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <img className={styles.photo} src={photoDataUrl} alt="" />
        <svg className={styles.meshSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
          {MESH_LINES.map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--color-mint)"
              strokeWidth="0.4"
            />
          ))}
        </svg>
        {!reducedMotion && <div className={styles.scanLine} />}
      </div>

      <p className={styles.label}>顔面データを解析中…</p>
      <div className={styles.flagRoulette} aria-hidden="true">
        {displayedFlag}
      </div>
    </div>
  );
}
