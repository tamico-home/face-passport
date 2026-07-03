import { useRef, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Button } from '../components/Button';
import { useCamera } from '../hooks/useCamera';
import { detectFace } from '../lib/faceLandmarker';
import { computeFeatures } from '../lib/features';
import { fileToCanvas } from '../lib/image';
import type { FeatureVector } from '../types';
import styles from './CaptureScreen.module.css';

interface CaptureScreenProps {
  onCaptured: (image: HTMLCanvasElement, features: FeatureVector) => void;
}

export function CaptureScreen({ onCaptured }: CaptureScreenProps) {
  const { videoRef, status, captureFrame } = useCamera(true);
  const [processing, setProcessing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleDetected(canvas: HTMLCanvasElement) {
    setProcessing(true);
    setNotFound(false);
    try {
      const detection = await detectFace(canvas);
      if (!detection) {
        setNotFound(true);
        return;
      }
      const features = computeFeatures(detection.landmarks);
      onCaptured(canvas, features);
    } catch {
      setNotFound(true);
    } finally {
      setProcessing(false);
    }
  }

  function handleShutter() {
    const canvas = captureFrame();
    if (!canvas) return;
    void handleDetected(canvas);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProcessing(true);
    setNotFound(false);
    try {
      const canvas = await fileToCanvas(file);
      await handleDetected(canvas);
    } catch {
      setNotFound(true);
      setProcessing(false);
    }
  }

  const fallbackMode = status === 'unsupported' || status === 'denied' || status === 'error';

  return (
    <PageShell>
      <div className={styles.wrap}>
        <h1 className={styles.title}>まっすぐカメラを見てね</h1>

        <div className={styles.stage}>
          {status === 'streaming' && (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
              <div className={styles.guide}>
                <div className={styles.guideOval} />
              </div>
            </>
          )}

          {status === 'requesting' && (
            <div className={styles.centerMessage}>
              <p>カメラを起動中…</p>
            </div>
          )}

          {status === 'denied' && (
            <div className={styles.centerMessage}>
              <p>
                カメラへのアクセスが許可されていないみたい。
                <br />
                ブラウザの設定でカメラを許可するか、下のボタンから写真を選んでね。
              </p>
              <label className={styles.fileLabel}>
                写真を選ぶ
                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {(status === 'unsupported' || status === 'error') && (
            <div className={styles.centerMessage}>
              <p>
                このブラウザではカメラ機能が使えないみたい。
                <br />
                ボタンを押すとカメラアプリが開くよ。
              </p>
              <label className={styles.fileLabel}>
                カメラを開く
                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {processing && (
            <div className={styles.centerMessage} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}>
              <p>顔を確認中…</p>
            </div>
          )}

          {notFound && !processing && (
            <div className={styles.banner}>
              <p className={styles.bannerTitle}>顔が見つからないよ!</p>
              <p>明るいところで、顔全体が枠に入るようにもう一回試してね</p>
              <Button variant="secondary" onClick={() => setNotFound(false)}>
                もう一度撮影する
              </Button>
            </div>
          )}
        </div>

        {status === 'streaming' && !notFound && (
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.shutter}
              aria-label="撮影する"
              onClick={handleShutter}
              disabled={processing}
            />
          </div>
        )}

        {!fallbackMode && status === 'streaming' && (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
            写真はこの端末の中だけで処理されます
          </p>
        )}
      </div>
    </PageShell>
  );
}
