import type { FeatureVector } from '../types';
import { FEATURE_KEYS } from '../types';

/** mulberry32: シード値から決定的な疑似乱数列を作る軽量PRNG */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 特徴量ベクトルから決定的なシード整数を作る(同じ顔なら常に同じ演出になる) */
export function seedFromFeatures(features: FeatureVector): number {
  let hash = 0;
  for (const key of FEATURE_KEYS) {
    const scaled = Math.round((features[key] + 1) * 100000);
    hash = (Math.imul(hash, 31) + scaled) | 0;
  }
  return hash >>> 0;
}
