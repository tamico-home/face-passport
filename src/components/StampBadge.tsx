import styles from './StampBadge.module.css';

interface StampBadgeProps {
  flag: string;
  name: string;
  percent: number;
  title?: string;
  size?: 'lg' | 'md';
  rotate?: number;
  visible: boolean;
}

export function StampBadge({
  flag,
  name,
  percent,
  title,
  size = 'md',
  rotate = -6,
  visible,
}: StampBadgeProps) {
  return (
    <div
      className={[styles.stamp, styles[size], visible ? styles.visible : ''].join(' ')}
      style={{ '--stamp-rotate': `${rotate}deg` } as React.CSSProperties}
    >
      <div className={styles.ring}>
        <span className={styles.flag}>{flag}</span>
        <span className={styles.name}>{name}</span>
        {title ? <span className={styles.title}>{title}</span> : null}
        <span className={styles.percent}>{percent}%</span>
      </div>
    </div>
  );
}
