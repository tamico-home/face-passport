export const FEATURE_KEYS = [
  'faceAspectRatio',
  'jawRoundness',
  'eyeSize',
  'eyeSpacing',
  'noseRatio',
  'lipThickness',
  'browAngle',
  'centroidBalance',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** 8つの比率ベース指標。各値はおおよそ -1〜1 に正規化済み。カメラ距離・顔サイズに非依存。 */
export type FeatureVector = Record<FeatureKey, number>;

export type CountryId =
  | 'japan'
  | 'korea'
  | 'thailand'
  | 'india'
  | 'mongolia'
  | 'turkey'
  | 'egypt'
  | 'morocco'
  | 'italy'
  | 'france'
  | 'spain'
  | 'greece'
  | 'sweden'
  | 'usa'
  | 'brazil'
  | 'mexico';

export interface Country {
  id: CountryId;
  name: string;
  flag: string;
  title: string;
  keywords: [string, string, string];
  description: string;
  /** 特徴量プロファイル(根拠のないエンタメ用の重み。-1〜1) */
  weights: FeatureVector;
}

export interface ScoredCountry extends Country {
  percent: number;
}

export interface DiagnosisResult {
  ranked: ScoredCountry[];
  top5: ScoredCountry[];
  otherPercent: number;
  featureVector: FeatureVector;
}
