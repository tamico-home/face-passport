import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision';

const WASM_BASE_PATH = '/mediapipe/wasm';
const MODEL_ASSET_PATH = '/mediapipe/models/face_landmarker.task';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/** 初回呼び出し時にWASM+モデル(すべて自サイトに同梱)を読み込み、以降は使い回す */
function getLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_BASE_PATH).then((fileset) =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_PATH,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      }),
    );
  }
  return landmarkerPromise;
}

/** アプリ起動直後などにバックグラウンドで先読みしておくための呼び出し */
export function preloadFaceLandmarker(): void {
  void getLandmarker().catch(() => {
    // 撮影時に再試行されるためここでは握りつぶす
  });
}

export interface FaceDetectionResult {
  landmarks: NormalizedLandmark[];
}

/** 画像から顔ランドマーク(478点)を検出する。顔が見つからなければnull */
export async function detectFace(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
): Promise<FaceDetectionResult | null> {
  let landmarker: FaceLandmarker;
  try {
    landmarker = await getLandmarker();
  } catch {
    // GPU delegateが使えない環境向けにCPUへフォールバックして再試行
    landmarkerPromise = null;
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);
    landmarker = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_ASSET_PATH, delegate: 'CPU' },
      runningMode: 'IMAGE',
      numFaces: 1,
    });
    landmarkerPromise = Promise.resolve(landmarker);
  }

  const result = landmarker.detect(source);
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length === 0) {
    return null;
  }
  return { landmarks };
}
