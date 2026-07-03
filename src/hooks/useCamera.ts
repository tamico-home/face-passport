import { useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'streaming' | 'denied' | 'unsupported' | 'error';

const IN_APP_BROWSER_PATTERN = /Line\/|FBAN|FBAV|Instagram|MicroMessenger/i;

export function isLikelyUnsupportedBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
  return IN_APP_BROWSER_PATTERN.test(navigator.userAgent);
}

export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');

  useEffect(() => {
    if (!enabled) return;

    if (isLikelyUnsupportedBrowser()) {
      setStatus('unsupported');
      return;
    }

    let cancelled = false;
    setStatus('requesting');

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setStatus('streaming');
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        setStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [enabled]);

  // status が 'streaming' になって <video> がマウントされた後に、
  // 取得済みのストリームを改めて紐付ける(マウント前だとvideoRefがnullで設定できないため)
  useEffect(() => {
    if (status === 'streaming' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  function captureFrame(): HTMLCanvasElement | null {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // インカメラのミラー表示に合わせて、キャプチャ画像も左右反転させる
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  return { videoRef, status, captureFrame };
}
