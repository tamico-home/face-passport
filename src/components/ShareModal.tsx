import { useEffect, useState } from 'react';
import { renderShareCanvas, shareOrDownloadCanvas } from '../lib/shareImage';
import type { DiagnosisResult } from '../types';
import { Button } from './Button';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  result: DiagnosisResult;
  onClose: () => void;
}

export function ShareModal({ result, onClose }: ShareModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderShareCanvas(result).then((c) => {
      if (cancelled) return;
      setCanvas(c);
      setPreviewUrl(c.toDataURL('image/png'));
    });
    return () => {
      cancelled = true;
    };
  }, [result]);

  async function handleShare() {
    if (!canvas) return;
    setBusy(true);
    setStatus(null);
    try {
      const outcome = await shareOrDownloadCanvas(canvas);
      setStatus(outcome === 'shared' ? 'シェアしました!' : '画像を保存したよ');
    } catch {
      setStatus('うまくいかなかった…もう一度試してね');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.previewWrap}>
          {previewUrl ? (
            <img className={styles.previewImg} src={previewUrl} alt="診断結果のシェア画像プレビュー" />
          ) : (
            <div className={styles.loading}>画像を作成中…</div>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="coral" fullWidth onClick={handleShare} disabled={!canvas || busy}>
            シェア・画像を保存する
          </Button>
          {status && <p className={styles.statusText}>{status}</p>}
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
