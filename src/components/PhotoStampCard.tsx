import { StampBadge } from './StampBadge';
import styles from './PhotoStampCard.module.css';

interface PhotoStampCardProps {
  photoDataUrl: string;
  flag: string;
  name: string;
  percent: number;
  photoVisible: boolean;
  stampVisible: boolean;
}

export function PhotoStampCard({
  photoDataUrl,
  flag,
  name,
  percent,
  photoVisible,
  stampVisible,
}: PhotoStampCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.photoFrame}>
        <img
          src={photoDataUrl}
          alt=""
          className={[styles.photo, photoVisible ? styles.photoShown : ''].join(' ')}
        />
      </div>
      <div className={styles.stampOverlay}>
        <StampBadge size="md" flag={flag} name={name} percent={percent} rotate={-12} visible={stampVisible} />
      </div>
    </div>
  );
}
