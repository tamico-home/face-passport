import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { StampBadge } from '../components/StampBadge';
import { PhotoStampCard } from '../components/PhotoStampCard';
import { CountryPieChart } from '../components/CountryPieChart';
import { Disclaimer } from '../components/Disclaimer';
import { Button } from '../components/Button';
import { comboPhrase } from '../lib/scoring';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { DiagnosisResult } from '../types';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  result: DiagnosisResult;
  photoDataUrl: string | null;
  onShare: () => void;
  onRestart: () => void;
}

export function ResultScreen({ result, photoDataUrl, onShare, onRestart }: ResultScreenProps) {
  const reducedMotion = useReducedMotion();
  const [photoShown, setPhotoShown] = useState(reducedMotion);
  const [stampShown, setStampShown] = useState(reducedMotion);
  const [cardShown, setCardShown] = useState(reducedMotion);

  const [first, second] = result.top5;

  useEffect(() => {
    if (reducedMotion) return;
    const t0 = setTimeout(() => setPhotoShown(true), 100);
    const t1 = setTimeout(() => setStampShown(true), 500);
    const t2 = setTimeout(() => setCardShown(true), 850);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reducedMotion]);

  return (
    <PageShell
      footer={
        <>
          <div className={styles.actions}>
            <Button variant="coral" fullWidth onClick={onShare}>
              結果画像を保存・シェア
            </Button>
            <Button variant="secondary" fullWidth onClick={onRestart}>
              もう一回診断
            </Button>
          </div>
          <div style={{ marginTop: 16 }}>
            <Disclaimer compact />
          </div>
        </>
      }
    >
      <div className={styles.wrap}>
        <div className={styles.stampSlot}>
          {photoDataUrl ? (
            <PhotoStampCard
              photoDataUrl={photoDataUrl}
              flag={first.flag}
              name={first.name}
              percent={first.percent}
              photoVisible={photoShown}
              stampVisible={stampShown}
            />
          ) : (
            <StampBadge
              size="lg"
              flag={first.flag}
              name={first.name}
              percent={first.percent}
              visible={stampShown}
            />
          )}
        </div>

        <div className={styles.heading}>
          <h1 className={styles.headline}>
            {first.flag} {first.name} <span className={styles.headlinePercent}>{first.percent}%</span>
          </h1>
          <p className={styles.subtitle}>— {first.title}</p>
        </div>

        <div className={[styles.card, cardShown ? styles.shown : ''].join(' ')}>
          <CountryPieChart top5={result.top5} otherPercent={result.otherPercent} />
        </div>

        <div className={[styles.card, cardShown ? styles.shown : ''].join(' ')}>
          <p className={styles.description}>
            {first.description}
            <br />
            <span className={styles.combo}>{comboPhrase(second)}</span>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
