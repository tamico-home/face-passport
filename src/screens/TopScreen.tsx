import { PageShell } from '../components/PageShell';
import { Button } from '../components/Button';
import { Disclaimer } from '../components/Disclaimer';
import styles from './TopScreen.module.css';

interface TopScreenProps {
  onStart: () => void;
  onOpenPrivacy: () => void;
}

export function TopScreen({ onStart, onOpenPrivacy }: TopScreenProps) {
  return (
    <PageShell
      footer={
        <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
          <button
            type="button"
            onClick={onOpenPrivacy}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px',
              minHeight: 'var(--tap-min)',
              color: 'var(--color-sky-deep)',
              textDecoration: 'underline',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            プライバシーポリシー
          </button>
        </p>
      }
    >
      <div className={styles.wrap}>
        <div className={styles.sky} aria-hidden="true">
          <svg className={styles.cloud} style={{ top: 10, left: -10 }} width="90" height="40" viewBox="0 0 90 40">
            <ellipse cx="30" cy="24" rx="26" ry="14" fill="#fff" />
            <ellipse cx="55" cy="18" rx="20" ry="16" fill="#fff" />
          </svg>
          <svg className={styles.cloud} style={{ top: 60, right: -6 }} width="70" height="32" viewBox="0 0 70 32">
            <ellipse cx="22" cy="18" rx="20" ry="11" fill="#fff" />
            <ellipse cx="44" cy="14" rx="15" ry="12" fill="#fff" />
          </svg>
          <svg
            className={styles.plane}
            style={{ top: 40 }}
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="var(--color-coral)"
          >
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.8V22l3.5-1 3.5 1v-1.2L12 19v-5.5l9 2.5z" />
          </svg>
        </div>

        <div className={styles.content}>
          <div className={styles.logo}>
            <span className={styles.badge}>🛂✈️</span>
            <h1 className={styles.title}>顔面パスポート</h1>
            <p className={styles.catch}>キミの顔、何カ国製?</p>
          </div>

          <Button variant="primary" onClick={onStart}>
            診断をはじめる
          </Button>

          <div className={styles.notes}>
            <Disclaimer compact />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
