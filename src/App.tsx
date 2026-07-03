import { useEffect, useState } from 'react';
import { TopScreen } from './screens/TopScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { AnalyzingScreen } from './screens/AnalyzingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { ShareModal } from './components/ShareModal';
import { preloadFaceLandmarker } from './lib/faceLandmarker';
import { diagnose } from './lib/scoring';
import { seedFromFeatures } from './lib/seed';
import type { DiagnosisResult, FeatureVector } from './types';

type Screen = 'top' | 'capture' | 'analyzing' | 'result';

function App() {
  const [screen, setScreen] = useState<Screen>('top');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [featureVector, setFeatureVector] = useState<FeatureVector | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    preloadFaceLandmarker();
  }, []);

  function handleCaptured(canvas: HTMLCanvasElement, features: FeatureVector) {
    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    setFeatureVector(features);
    setScreen('analyzing');
  }

  function handleAnalyzed() {
    if (!featureVector) return;
    setResult(diagnose(featureVector));
    setScreen('result');
  }

  function handleRestart() {
    setResult(null);
    setFeatureVector(null);
    setPhotoDataUrl(null);
    setScreen('capture');
  }

  if (showPrivacy) {
    return <PrivacyScreen onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <>
      {screen === 'top' && (
        <TopScreen onStart={() => setScreen('capture')} onOpenPrivacy={() => setShowPrivacy(true)} />
      )}

      {screen === 'capture' && <CaptureScreen onCaptured={handleCaptured} />}

      {screen === 'analyzing' && photoDataUrl && featureVector && (
        <AnalyzingScreen
          photoDataUrl={photoDataUrl}
          seed={seedFromFeatures(featureVector)}
          resultFlag={diagnose(featureVector).top5[0].flag}
          onComplete={handleAnalyzed}
        />
      )}

      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          photoDataUrl={photoDataUrl}
          onShare={() => setShowShare(true)}
          onRestart={handleRestart}
        />
      )}

      {showShare && result && <ShareModal result={result} onClose={() => setShowShare(false)} />}
    </>
  );
}

export default App;
