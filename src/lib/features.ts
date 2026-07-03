import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FeatureVector } from '../types';

// MediaPipe Face Mesh(468+虹彩10点)の標準ランドマークインデックス
const IDX = {
  foreheadTop: 10,
  chinBottom: 152,
  cheekLeft: 234,
  cheekRight: 454,
  jawLeft: 172,
  jawRight: 397,
  eyeLeftOuter: 33,
  eyeLeftInner: 133,
  eyeRightInner: 362,
  eyeRightOuter: 263,
  eyeLeftUpper: 159,
  eyeLeftLower: 145,
  eyeRightUpper: 386,
  eyeRightLower: 374,
  noseTip: 1,
  noseBridge: 168,
  nostrilLeft: 129,
  nostrilRight: 358,
  lipUpperOuter: 0,
  lipUpperInner: 13,
  lipLowerInner: 14,
  lipLowerOuter: 17,
  browLeftOuter: 70,
  browLeftInner: 105,
  browRightInner: 336,
  browRightOuter: 300,
};

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mid(a: NormalizedLandmark, b: NormalizedLandmark): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** rawをclampした上で[min,max] -> [-1,1]に線形マッピングする */
function normalize(raw: number, min: number, max: number): number {
  const t = (raw - min) / (max - min);
  return Math.max(-1, Math.min(1, t * 2 - 1));
}

/**
 * ランドマークから、顔のサイズ・カメラ距離に依存しない比率ベースの特徴量を8個算出する。
 * すべて「その国っぽさ」を演出するためのエンタメ指標であり、科学的な意味は持たない。
 */
export function computeFeatures(landmarks: NormalizedLandmark[]): FeatureVector {
  const p = (i: number) => landmarks[i];

  const faceWidth = dist(p(IDX.cheekLeft), p(IDX.cheekRight));
  const faceHeight = dist(p(IDX.foreheadTop), p(IDX.chinBottom));
  const faceDiagonal = Math.hypot(faceWidth, faceHeight);

  const faceAspectRatioRaw = faceHeight / faceWidth;

  const jawWidth = dist(p(IDX.jawLeft), p(IDX.jawRight));
  const jawRoundnessRaw = jawWidth / faceWidth;

  const eyeWidthL = dist(p(IDX.eyeLeftOuter), p(IDX.eyeLeftInner));
  const eyeWidthR = dist(p(IDX.eyeRightInner), p(IDX.eyeRightOuter));
  const eyeSizeRaw = (eyeWidthL + eyeWidthR) / 2 / faceWidth;

  const eyeSpacingRaw = dist(p(IDX.eyeLeftInner), p(IDX.eyeRightInner)) / faceWidth;

  const noseLength = dist(p(IDX.noseBridge), p(IDX.noseTip));
  const noseWidth = dist(p(IDX.nostrilLeft), p(IDX.nostrilRight));
  const noseRatioRaw = noseLength / noseWidth;

  const lipThicknessRaw =
    (dist(p(IDX.lipUpperOuter), p(IDX.lipUpperInner)) + dist(p(IDX.lipLowerInner), p(IDX.lipLowerOuter))) /
    faceHeight;

  const browLeftAngle = Math.atan2(
    p(IDX.browLeftInner).y - p(IDX.browLeftOuter).y,
    p(IDX.browLeftInner).x - p(IDX.browLeftOuter).x,
  );
  const browRightAngle = Math.atan2(
    p(IDX.browRightInner).y - p(IDX.browRightOuter).y,
    p(IDX.browRightOuter).x - p(IDX.browRightInner).x,
  );
  const browAngleRaw = (Math.abs(browLeftAngle) + Math.abs(browRightAngle)) / 2;

  const coreFeaturePoints = [
    IDX.eyeLeftOuter,
    IDX.eyeRightOuter,
    IDX.noseTip,
    IDX.lipUpperOuter,
    IDX.nostrilLeft,
    IDX.nostrilRight,
  ];
  const faceCenter = mid(p(IDX.cheekLeft), p(IDX.cheekRight));
  const avgDistFromCenter =
    coreFeaturePoints.reduce((sum, idx) => sum + Math.hypot(p(idx).x - faceCenter.x, p(idx).y - faceCenter.y), 0) /
    coreFeaturePoints.length;
  const centroidBalanceRaw = avgDistFromCenter / faceDiagonal;

  return {
    faceAspectRatio: normalize(faceAspectRatioRaw, 1.05, 1.55),
    jawRoundness: normalize(jawRoundnessRaw, 0.55, 0.85),
    eyeSize: normalize(eyeSizeRaw, 0.16, 0.28),
    eyeSpacing: normalize(eyeSpacingRaw, 0.28, 0.46),
    noseRatio: normalize(noseRatioRaw, 1.0, 2.2),
    lipThickness: normalize(lipThicknessRaw, 0.05, 0.16),
    browAngle: normalize(browAngleRaw, 0.05, 0.5),
    centroidBalance: normalize(centroidBalanceRaw, 0.14, 0.24),
  };
}
