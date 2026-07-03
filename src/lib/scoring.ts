import { COUNTRIES } from '../data/countries';
import { FEATURE_KEYS, type DiagnosisResult, type FeatureVector, type ScoredCountry } from '../types';

const TOP_SHARE_TARGET = 0.34; // 1位がだいたい25〜45%に収まるように狙う目標値
const BASE_TEMPERATURE = 0.35;

function cosineSimilarity(a: FeatureVector, b: FeatureVector): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const key of FEATURE_KEYS) {
    dot += a[key] * b[key];
    na += a[key] * a[key];
    nb += b[key] * b[key];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function softmax(scores: number[], temperature: number): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - max) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * 確率分布を p_i^k / sum(p_j^k) で「尖らせ/なだらかに」して、
 * 1位の割合がだいたい targetTop になるよう k を二分探索する。
 * 乱数は使わず特徴量だけから決まるので再現性がある。
 */
function flattenToTargetTop(probs: number[], targetTop: number): number[] {
  const apply = (k: number) => {
    const powered = probs.map((p) => Math.pow(p, k));
    const sum = powered.reduce((a, b) => a + b, 0);
    return powered.map((p) => p / sum);
  };

  let lo = 0.05;
  let hi = 60;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const result = apply(mid);
    const top = Math.max(...result);
    if (top < targetTop) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return apply((lo + hi) / 2);
}

/** 合計がちょうど100になるよう最大剰余法で丸める */
function roundToWhole(percentages: number[]): number[] {
  const floors = percentages.map((p) => Math.floor(p));
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const remainders = percentages
    .map((p, i) => ({ i, frac: p - Math.floor(p) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let i = 0; i < remainder; i++) {
    result[remainders[i % remainders.length].i] += 1;
  }
  remainder = 100 - result.reduce((a, b) => a + b, 0);
  return result;
}

export function diagnose(featureVector: FeatureVector): DiagnosisResult {
  const rawScores = COUNTRIES.map((c) => cosineSimilarity(featureVector, c.weights));
  const basePercent = softmax(rawScores, BASE_TEMPERATURE);
  const shaped = flattenToTargetTop(basePercent, TOP_SHARE_TARGET);

  const withPercent: ScoredCountry[] = COUNTRIES.map((c, i) => ({
    ...c,
    percent: shaped[i] * 100,
  })).sort((a, b) => b.percent - a.percent);

  const top5Raw = withPercent.slice(0, 5);
  const otherRaw = withPercent.slice(5).reduce((sum, c) => sum + c.percent, 0);

  const rounded = roundToWhole([...top5Raw.map((c) => c.percent), otherRaw]);

  const top5: ScoredCountry[] = top5Raw.map((c, i) => ({ ...c, percent: rounded[i] }));
  const otherPercent = rounded[5];

  return {
    ranked: withPercent,
    top5,
    otherPercent,
    featureVector,
  };
}

export function comboPhrase(second: ScoredCountry): string {
  return `${second.name}の${second.keywords[0]}も隠し味`;
}
