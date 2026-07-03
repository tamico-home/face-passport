import { useEffect, useState } from 'react';
import type { ScoredCountry } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import styles from './CountryPieChart.module.css';

interface CountryPieChartProps {
  top5: ScoredCountry[];
  otherPercent: number;
}

const PIE_COLORS = ['#FF6B57', '#FFC53D', '#3ECFA0', '#47B5E5', '#B892E8'];
const OTHER_COLOR = '#D8ECF5';

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 78;
const STROKE = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CountryPieChart({ top5, otherPercent }: CountryPieChartProps) {
  const reducedMotion = useReducedMotion();
  const [animated, setAnimated] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  const rows = [
    ...top5.map((c, i) => ({ key: c.id, label: c.name, flag: c.flag, percent: c.percent, color: PIE_COLORS[i] })),
    { key: 'other', label: 'その他', flag: '🌍', percent: otherPercent, color: OTHER_COLOR },
  ];

  let cumulative = 0;
  const segments = rows.map((row) => {
    const dash = (row.percent / 100) * CIRCUMFERENCE;
    const offset = (cumulative / 100) * CIRCUMFERENCE;
    cumulative += row.percent;
    return { ...row, dash, offset };
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.chartArea}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg} role="img" aria-label="国別内訳の円グラフ">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth={STROKE} />
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {segments.map((seg, i) => (
              <circle
                key={seg.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${animated ? seg.dash : 0} ${CIRCUMFERENCE}`}
                strokeDashoffset={-seg.offset}
                className={styles.segment}
                style={{ transitionDelay: `${i * 90}ms` }}
              />
            ))}
          </g>
        </svg>
        <div className={styles.center}>
          <span className={styles.centerFlag}>{rows[0].flag}</span>
          <span className={styles.centerPercent}>{rows[0].percent}%</span>
        </div>
      </div>

      <ul className={styles.legend}>
        {rows.map((row) => (
          <li key={row.key} className={styles.legendRow}>
            <span className={styles.dot} style={{ background: row.color }} />
            <span className={styles.legendLabel}>
              {row.flag} {row.label}
            </span>
            <span className={styles.legendPercent}>{row.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
